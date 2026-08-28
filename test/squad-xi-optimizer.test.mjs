import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');
const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');

function functionSource(name,nextName){
  const start=core.indexOf(`function ${name}(`);
  const end=core.indexOf(`function ${nextName}(`,start+1);
  assert.ok(start>=0,`${name} must exist`);
  assert.ok(end>start,`${nextName} must follow ${name}`);
  return core.slice(start,end);
}

test('Squad quick actions expose one-tap Optimize XI in the open mobile grid slot',()=>{
  assert.match(html,/id="btnJumpImport"[\s\S]*id="btnOptimizeXI"/);
  assert.match(html,/id="btnOptimizeXI"[^>]*>[\s\S]*?<span class="qf-label">Optimize XI<\/span>/);
});

test('Optimize XI is scoped to the owned legal 15 and never invokes squad construction',()=>{
  const source=functionSource('optimiseCurrentXI','xiCounts');
  assert.match(source,/list\.length!==15\|\|!legal\(list\)/);
  assert.match(source,/optimiseViewedLineup\(\{form:null\}\)/,
    'the quick action must choose the best legal formation, not inherit Builder formation settings');
  assert.doesNotMatch(source,/S\.squad\s*=|autoCompleteSquad\(|runBuild\(|optimise\(/,
    'the quick action must not replace players or run a full-squad optimizer');
});

test('Optimize XI explicitly hands captaincy back to OTB and persists the result',()=>{
  const source=functionSource('optimiseCurrentXI','xiCounts');
  assert.match(source,/S\.capManual=false;S\.viceManual=false;/);
  assert.match(source,/render\(\);saveUserState\(\);scheduleAccuracyCapture\(\);/);
  assert.match(core,/document\.getElementById\('btnOptimizeXI'\)\.onclick=optimiseCurrentXI;/);
});

test('the reused viewed-lineup engine sets a legal XI and expected-autosub bench order only',()=>{
  const source=functionSource('optimiseViewedLineup','optimiseCurrentXI');
  assert.match(source,/bestXIForGw\(list,forced,S\.gw\)/);
  assert.match(source,/S\.start=new Set\(plan\.xi\.map/);
  assert.match(source,/expectedAutosub\(plan\)/);
  assert.match(source,/S\.benchOrder=bench\.order\.map/);
  assert.doesNotMatch(source,/S\.squad\s*=/);
});

test('one click behaviorally replaces XI, armbands and bench order while retaining all 15 players',()=>{
  const players=Array.from({length:15},(_,i)=>({id:i+1,n:`P${i+1}`,p:i===11?'GK':i<1?'GK':i<6?'DEF':i<11?'MID':'FWD'}));
  const originalIds=players.map(p=>p.id),xiIds=[1,2,3,4,5,7,8,9,10,13,14],benchIds=[12,6,11,15];
  const xi=xiIds.map((id,i)=>({p:players[id-1],x:20-i})),benchRows=benchIds.map((id,i)=>({p:players[id-1],x:4-i}));
  const calls=[],context={
    S:{gw:7,start:new Set([12,13]),cap:12,vice:13,capManual:true,viceManual:true,benchOrder:[]},
    document:{getElementById:id=>id==='gwSel'?{value:''}:id==='oForm'?{value:'5-4-1'}:null},
    squadPlayers:()=>players,
    legal:list=>list.length===15,
    bestXIForGw:(list,form,gw)=>{calls.push(['plan',list.map(p=>p.id),form,gw]);return{xi,benchRows}},
    expectedAutosub:()=>({order:[benchRows[3],benchRows[1],benchRows[2]]}),
    stableKey:p=>`p:${p.id}`,
    autoXI:()=>calls.push(['unexpected-auto-xi']),
    render:()=>calls.push(['render']),
    saveUserState:()=>calls.push(['save']),
    scheduleAccuracyCapture:()=>calls.push(['capture']),
    byId:id=>players.find(p=>p.id===id),
    project:()=>({x:0}),
    flash:message=>calls.push(['flash',message]),
    Set,Object,
  };
  vm.createContext(context);
  vm.runInContext(`${functionSource('optimiseViewedLineup','optimiseCurrentXI')}\n${functionSource('optimiseCurrentXI','xiCounts')}\nglobalThis.run=optimiseCurrentXI;`,context);

  assert.equal(context.run(),true);
  assert.deepEqual(players.map(p=>p.id),originalIds,'owned 15 must be untouched');
  assert.deepEqual([...context.S.start],xiIds);
  assert.equal(context.S.cap,1);
  assert.equal(context.S.vice,2);
  assert.deepEqual(context.S.benchOrder,['p:15','p:6','p:11']);
  assert.deepEqual(calls[0],['plan',originalIds,null,7],'Builder formation must be ignored for this quick action');
  assert.ok(calls.some(x=>x[0]==='render')&&calls.some(x=>x[0]==='save')&&calls.some(x=>x[0]==='capture'));
  assert.ok(!calls.some(x=>x[0]==='unexpected-auto-xi'));
});
