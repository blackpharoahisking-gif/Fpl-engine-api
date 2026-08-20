import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const markup=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');
const featureStart=html.indexOf('function externalNormal');
const featureEnd=html.indexOf('\nfunction scheduleRankValue',featureStart);
assert.ok(featureStart>=0&&featureEnd>featureStart,'supplementary calendar helpers must be present');
const featureSource=html.slice(featureStart,featureEnd);

function calendarContext(){
  const context={
    TEAMS:{ARS:{n:'Arsenal'},MCI:{n:'Man City'}},
    EXT_CAL:{fixtures:[],source:'none',mode:'auto',updatedAt:null,error:'',syncPromise:null,autoAttempted:false},
    EVENTS:[{id:1,deadline_time:'2026-08-21T17:30:00Z'},{id:2,deadline_time:'2026-08-28T17:30:00Z'}],
    SEASON_START:Date.parse('2026-08-21T00:00:00Z'),
    SEASON_END:Date.parse('2027-05-30T23:59:59Z'),
    S:{gw:1,start:new Set([1])},
    num:(value,fallback=0)=>value===null||value===undefined||value===''||Number.isNaN(Number(value))?fallback:Number(value),
    clamp:(value,min,max)=>Math.max(min,Math.min(max,value)),
    fixtureListFor:(team,gw)=>team==='ARS'&&gw===1?[{id:101,opp:'MCI',home:true,kickoff:'2026-08-22T14:00:00Z'}]:[],
    fixtureContext:()=>({dAtk:2.4,dCS:2.8}),
    squadPlayers:()=>[{id:1,t:'ARS'}],
    project:()=>({x:6}),
    localStorage:{setItem(){},getItem(){return null}},
    document:{getElementById(){return null}},
    navigator:{onLine:true},
    fetchJSON:async()=>[],
    renderFixtures(){},scheduleSelfTests(){},flash(){},
    setTimeout,clearTimeout,Date,JSON,Map,Set,Promise,console,
  };
  vm.createContext(context);
  vm.runInContext(`${featureSource};globalThis.__calendar={externalRowsFromPayload,scheduleTeamStats};`,context);
  return context;
}

test('supplementary fixture changes workload/rest only, not difficulty, xPts or Schedule score',()=>{
  const context=calendarContext();
  const baseline=context.__calendar.scheduleTeamStats('ARS',[1]);
  context.EXT_CAL.fixtures=[{
    team:'ARS',kickoff:'2026-08-25T19:00:00Z',competition:'Carabao Cup',opponent:'Leeds United',
    home:true,confirmed:true,source:'https://www.efl.com/competitions/carabao-cup/',updatedAt:'2026-08-12T00:00:00Z'
  }];
  const loaded=context.__calendar.scheduleTeamStats('ARS',[1]);
  for(const key of ['avgAtk','avgCS','avgOverall','opportunity','score'])assert.equal(loaded[key],baseline[key],`${key} must be invariant`);
  assert.equal(loaded.exposure.xpts,baseline.exposure.xpts);
  assert.equal(baseline.externalGames,0);
  assert.equal(loaded.externalGames,1);
  assert.ok(loaded.congestion>baseline.congestion);
  assert.equal(loaded.elevatedRest,1);
});

test('frontend normalizer rejects youth, women, unconfirmed and Premier League rows',()=>{
  const context=calendarContext();
  const rows=context.__calendar.externalRowsFromPayload([
    {team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Inter',home:true,confirmed:true,source:'official',updatedAt:'2026-08-12T00:00:00Z'},
    {team:'ARS',kickoff:'2026-09-17T19:00:00Z',competition:'UEFA Women\'s Champions League',opponent:'Lyon Women',home:true,confirmed:true},
    {team:'ARS',kickoff:'2026-09-18T19:00:00Z',competition:'UEFA Youth League',opponent:'Inter U19',home:true,confirmed:true},
    {team:'ARS',kickoff:'2026-09-19T19:00:00Z',competition:'FA Cup',opponent:'Chelsea',home:true,confirmed:false},
    {team:'ARS',kickoff:'2026-09-20T19:00:00Z',competition:'Premier League',opponent:'Man City',home:true,confirmed:true},
  ]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].opponent,'Inter');
});

test('Schedule opening performs no network work and the browser contains no provider endpoints',()=>{
  const renderStart=html.indexOf('function renderFixtures');
  const renderEnd=html.indexOf("\n['fxStart','fxN']",renderStart);
  const renderSource=html.slice(renderStart,renderEnd);
  assert.doesNotMatch(renderSource,/\bfetch\s*\(|fetchJSON|syncExternalCalendar/);
  assert.doesNotMatch(html,/match\.uefa\.com|multi-club-matches|thefa\.com\/Competitions\/Fixtures/);
  assert.match(html,/runWhenIdle\(\(\)=>maybeAutoSyncExternalCalendar\(\)/);
  assert.match(html,/fetchJSON\(`\$\{API_BASE\}\/api\/club-schedule`,15000\)/);
});

test('automatic state is primary and manual import remains a collapsed override',()=>{
  assert.match(markup,/id="fxExternalMode">Auto calendar/);
  assert.match(markup,/<details class="schedule-manual"><summary>Manual override<\/summary>/);
  assert.match(markup,/id="fxSyncExternal">Sync cached feed<\/button>/);
  assert.match(markup,/id="fxImportExternal">Apply override<\/button>/);
});
