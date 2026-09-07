import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const core=fs.readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const bridge=fs.readFileSync(new URL('../role-freshness-sync.js',import.meta.url),'utf8');
function source(first,next){const start=core.indexOf(`function ${first}(`),end=core.indexOf(`function ${next}(`,start+1);assert.ok(start>=0&&end>start);return core.slice(start,end)}
function report(team,events=[{id:team}],extra={}){return{status:'ok',team,schemaVersion:'1.37.0',season:'2026/27',generatedAt:'2026-09-07T08:00:00Z',events,...extra}}
function mergeHarness(){
 const counts={invalidations:0,saves:0,renders:0,hiddenRoles:0};
 const state={roleIntel:{events:[{id:'manual',team:'ARS'},{id:'old',team:'ARS',worker:true},{id:'untouched',team:'CHE',worker:true}]}};
 const box={S:state,SCOUT:{},roleIntelEvents:()=>state.roleIntel.events,scoutEventLocal:(e,r)=>({...e,team:r.team,worker:true}),scoutReportIsAuthoritative:r=>r.evidenceAuthoritative!==false,bumpCache:()=>counts.invalidations++,saveUserState:()=>counts.saves++,render:()=>counts.renders++,renderRoleIntelligence:()=>counts.hiddenRoles++};
 vm.createContext(box);vm.runInContext(source('applyScoutReport','renderScoutReport'),box);return{box,counts,state};
}
test('a batch preserves individual report semantics and commits the screen once',()=>{
 const a=mergeHarness(),b=mergeHarness(),reports=[report('ARS'),report('NEW')];
 for(const r of reports)a.box.applyScoutReport(r);
 b.box.applyScoutReports(reports);
 assert.equal(JSON.stringify(a.state),JSON.stringify(b.state));
 assert.deepEqual(b.counts,{invalidations:1,saves:1,renders:1,hiddenRoles:0});
 assert.ok(b.state.roleIntel.events.some(e=>e.id==='manual'));
 assert.ok(b.state.roleIntel.events.some(e=>e.id==='untouched'));
});
test('degraded empty evidence retains prior reports; authoritative empty evidence clears only its club',()=>{
 const h=mergeHarness();h.box.applyScoutReports([report('ARS',[],{evidenceAuthoritative:false})]);
 assert.ok(h.state.roleIntel.events.some(e=>e.id==='old'));
 h.box.applyScoutReports([report('ARS',[])]);
 assert.ok(!h.state.roleIntel.events.some(e=>e.id==='old'));
 assert.ok(h.state.roleIntel.events.some(e=>e.id==='manual'));
 assert.ok(h.state.roleIntel.events.some(e=>e.id==='untouched'));
});
test('an empty batch does no work; an invalid later report cannot leave accepted evidence unsaved',()=>{
 const h=mergeHarness();h.box.applyScoutReports([]);assert.equal(h.counts.renders,0);
 assert.throws(()=>h.box.applyScoutReports([report('ARS'),{status:'error'}]));
 assert.deepEqual(h.counts,{invalidations:1,saves:1,renders:1,hiddenRoles:0});
});
test('ordinary player ranking skips replacement forecasts while the value view retains the exact cohort median',()=>{
 const players=[{id:1,p:'GK',t:'ARS',c:4},{id:2,p:'GK',t:'ARS',c:4.5},{id:3,p:'GK',t:'ARS',c:5},{id:4,p:'DEF',t:'ARS',c:4}];let forecasts=0;
 const box={S:{gw:4,horizon:5,risk:'mean',squad:[],transfer:{bank:0}},POOL:players,TEAMS:{ARS:{}},LIMITS:{GK:2,DEF:5},DATA:{lastUpdated:1},availability:()=>1,discoveryForecast:p=>{forecasts++;return{total:p.id*2}},squadPlayers:()=>[],bank:()=>0,num:x=>Number(x)||0,median:arr=>arr.reduce((a,b)=>a+b,0)/arr.length};
 vm.createContext(box);vm.runInContext(source('buildDiscoveryContext','bestUpgradeDetail'),box);
 const ctx=box.buildDiscoveryContext([4,5,6,7,8]);assert.equal(forecasts,0,'opening a default ranking must not forecast a replacement cohort');
 assert.equal(ctx.replacement.GK,3);assert.equal(forecasts,2,'only the two cheapest eligible GKs define this replacement');
 assert.equal(ctx.replacement.GK,3);assert.equal(forecasts,2,'cached reads do not repeat projections');
 assert.equal(ctx.replacement.DEF,8);assert.equal(forecasts,3);
 assert.equal(box.buildDiscoveryContext([4,5,6,7,8]),ctx);
});
function bridgeHarness(fetcher){
 const calls=[],timers=[],events=new Map(),applied={},state={roleIntel:{events:[]},squad:[1]};
 const box={S:state,TEAMS:{ARS:{},CHE:{}},POOL:[],SCOUT:{},SCOUT_SCHEMA_MIN:'1.37.0',EXPECTED_SEASON:'2026/27',schemaAtLeast:(a,b)=>a===b,byId:()=>({t:'ARS'}),bumpCache(){},render(){},console,AbortController,fetch:fetcher,setTimeout(fn,ms){timers.push({fn,ms});return timers.length},clearTimeout(){},setInterval(){return 1},Date,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail}},document:{visibilityState:'visible',getElementById:()=>({style:{}}),addEventListener:(type,fn)=>events.set(type,fn),dispatchEvent:e=>calls.push(['event',e.detail])},addEventListener(){},applyScoutReport:r=>{calls.push(['single',r.team]);applied[r.team]=r;state.roleIntel.events.push(...r.events.map(e=>({...e,team:r.team,worker:true})))},applyScoutReports:rs=>{calls.push(['batch',rs.map(r=>r.team)]);for(const r of rs){applied[r.team]=r;state.roleIntel.events.push(...r.events.map(e=>({...e,team:r.team,worker:true})))}},scheduleAccuracyCapture:()=>calls.push(['capture'])};
 box.window=box;vm.runInNewContext(bridge,box);return{api:box.__OTB_ROLE_FRESHNESS__,calls,timers,events,applied};
}
const response=body=>({ok:true,status:200,json:async()=>body});
test('league hydration uses one saved-report request and one downstream commit/capture',async()=>{
 const urls=[];const h=bridgeHarness(async url=>{urls.push(url);return response(url.includes('/status')?{status:'ok',teams:{ARS:{reportAt:'2026-09-07T08:00:00Z'},CHE:{reportAt:'2026-09-07T08:00:00Z'}}}:{status:'ok',teams:{ARS:report('ARS'),CHE:report('CHE')}})});
 await h.api.poll();
 assert.equal(urls.filter(u=>u.includes('/api/scout/latest?teams=')).length,1);
 assert.ok(!urls.some(u=>u.includes('force=')||u.includes('/api/role-intelligence')));
 assert.deepEqual(h.calls.filter(c=>c[0]==='batch').map(c=>Array.from(c[1])),[['ARS','CHE']]);
 assert.equal(h.calls.filter(c=>c[0]==='capture').length,1);
 await h.api.poll();assert.equal(urls.filter(u=>u.includes('/api/scout/latest')).length,1,'unchanged reports are not fetched again');
});
test('overlapping status and team hydration requests share their work',async()=>{
 let count=0;const h=bridgeHarness(async url=>{count++;return response(url.includes('/status')?{status:'ok',teams:{}}:report('ARS'))});
 await Promise.all([h.api.status(),h.api.status()]);assert.equal(count,1);
 // Force-missing detection sees saved evidence after the first apply.
 const pending=[h.api.hydrateTeam('ARS','2026-09-07T08:00:00Z'),h.api.hydrateTeam('ARS','2026-09-07T08:00:00Z')];
 await Promise.all(pending);assert.equal(h.calls.filter(c=>c[0]==='single').length,1,'the second queued request sees already-applied evidence');
});
test('a rejected or timed-out request releases the in-flight entry for retry',async()=>{
 let count=0;const h=bridgeHarness(async(_url,options)=>{count++;if(count===1)return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted'))));return response({status:'ok',teams:{}})});
 const first=h.api.status();const rejected=assert.rejects(first,/aborted/);
 h.timers.find(t=>t.ms===15000).fn();await rejected;
 await h.api.status();assert.equal(count,2);
});
test('bad schema or wrong-team reports never overwrite accepted evidence',async()=>{
 const h=bridgeHarness(async url=>response(url.includes('/status')?{status:'ok',teams:{ARS:{reportAt:'2026-09-07T08:00:00Z'},CHE:{reportAt:'2026-09-07T08:00:00Z'}}}:{status:'ok',teams:{ARS:report('ARS',[],{schemaVersion:'0.1'}),CHE:report('NEW')}}));
 await h.api.poll();assert.equal(h.calls.filter(c=>c[0]==='batch').length,0);assert.deepEqual(h.applied,{});
});
test('only navigation controls schedule role refreshes',()=>{
 const h=bridgeHarness(async()=>response({status:'ok'}));const before=h.timers.length;
 h.events.get('click')({target:{closest:()=>null}});assert.equal(h.timers.length,before);
 h.events.get('click')({target:{closest:()=>({dataset:{t:'transfers'}})}});assert.equal(h.timers.length,before+1);
});
test('mobile replacement ranking prepares forecasts in bounded, cancellable frames',()=>{
 const frames=[],nodes=new Map(),players=Array.from({length:40},(_,id)=>({id,p:'GK',t:'ARS',n:`P${id}`,c:4,live:{}}));let forecasts=0,clock=0;
 const box={S:{gw:4,horizon:5,risk:'mean',squad:[],transfer:{bank:0},discovery:{}},POOL:players,TEAMS:{ARS:{}},LIMITS:{GK:2},DATA:{lastUpdated:1},availability:()=>1,discoveryForecast:()=>{forecasts++;return{total:2}},squadPlayers:()=>[],bank:()=>100,spent:()=>0,num:(x,f=0)=>x===''?f:Number(x)||f,median:()=>2,syncDiscoveryState(){},renderBuildBlockSummary(){},discoveryGameweeks:()=>[4,5,6,7,8],discoveryPeriodLabel:()=>'',updateDiscoveryNote(){},lowPowerMode:()=>true,columnVisible:()=>true,POOL_RENDER_MOBILE:32,DEFERRED_POOL_TOKEN:0,POOL_COMPUTE_TOKEN:0,performance:{now:()=>clock++},requestAnimationFrame:fn=>frames.push(fn),document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{value:id==='fSort'?'replacement':'',checked:false,innerHTML:''});return nodes.get(id)}}};
 vm.createContext(box);vm.runInContext(source('buildDiscoveryContext','bestUpgradeDetail')+'\n'+source('renderPool','clubSwatch'),box);
 box.renderPool();assert.equal(forecasts,0,'initial setup yields before replacement projections');
 frames.shift()();assert.ok(forecasts>0&&forecasts<=14,'one frame has a bounded amount of forecast work');
 const obsolete=frames.shift(),before=forecasts;box.renderPool();obsolete();assert.equal(forecasts,before,'superseded ranking frames stop immediately');
});
