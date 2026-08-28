import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

/* Marcus, 21 Aug: "yes do it" — closing the gap the .4/.5 tooltip
   disclosed: the live GW total should apply FPL's real autosub and
   vice-captain-promotion rules, not a flat sum of the nominal XI.

   This builds a real sandbox: the actual selectAutosubs()/orderedOutfieldBench()
   from app-core.js (the same functions the projection engine already uses
   for expected autosub value), plus the actual resolveActualLineup()/
   finalizeCaptain() from app-live-points.js, wired together with a synthetic squad,
   fixtures and live rows — not a regex pin on source text, because this
   logic is worth exercising for real. */

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app-live-points.js',import.meta.url),'utf8');

function slice(src,startMarker,endMarker){
  const start=src.indexOf(startMarker);
  assert.ok(start>=0,`marker not found: ${startMarker}`);
  const end=src.indexOf(endMarker,start+startMarker.length);
  assert.ok(end>start,`end marker not found after start: ${endMarker}`);
  return src.slice(start,end);
}

const outMinMax=slice(core,'const OUT_MIN=','function permuteBench3');
const autosubFns=slice(core,'function legalOutfieldCounts','function conditionalBenchValue');
const orderedOutfieldBenchFn=slice(core,'function orderedOutfieldBench','function moveBenchPlayer');
const lineupFns=slice(app,'const playerLocked=','const displaySelect=document');

function makeSandbox(){
  const context={
    S:{gw:1,cap:null,vice:null,start:new Set()},
    LIVE:{gw:1,rows:new Map()},
    stableKey:p=>'p:'+p.id,
    project:(p,gw)=>({x:p.proj??2}),
    byId:id=>context.__squad.find(p=>p.id===id)||null,
    squadPlayers:()=>context.__squad,
    fixtureListFor:(team,gw)=>(context.__fixtures||{})[team]||[],
    chipStateForGw:()=>context.__chip||{benchScoring:false,captainMultiplier:2},
    console,Math,Array,Object,Number,Set,
  };
  vm.createContext(context);
  vm.runInContext(`
    ${outMinMax}
    ${autosubFns}
    ${orderedOutfieldBenchFn}
    ${lineupFns}
    globalThis.__lineup={resolveActualLineup,finalizeCaptain};
  `,context);
  return context;
}

/* Build a minimal 15-player squad: GK, GK-sub, 5 DEF (4 start + 1 bench),
   5 MID (4 start + 1 bench), 3 FWD (2 start + 1 bench) — a standard
   4-4-2 with a legal bench, matching how OTB's own XI validator counts. */
function baseSquad(){
  const mk=(id,p,proj=2)=>({id,p,t:'AAA',apiId:id,proj});
  const squad=[
    mk(1,'GK'), mk(2,'GK'),
    mk(3,'DEF'),mk(4,'DEF'),mk(5,'DEF'),mk(6,'DEF'),mk(7,'DEF'),
    mk(8,'MID'),mk(9,'MID'),mk(10,'MID'),mk(11,'MID'),mk(12,'MID'),
    mk(13,'FWD'),mk(14,'FWD'),mk(15,'FWD'),
  ];
  return squad;
}
function setStart(ctx,startIds){ctx.S.start=new Set(startIds)}
function setRow(ctx,id,{min=0,pts=0}={}){ctx.LIVE.rows.set(id,{i:id,pts,min})}
function finished(ctx,team){ctx.__fixtures={[team]:[{finished:true,id:1}]}}
function notFinished(ctx,team){ctx.__fixtures={[team]:[{finished:false,id:1}]}}

test('an outfield starter who is confirmed not to have played (fixture finished, 0 minutes) is replaced by the top eligible bench player',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  // Start: GK1, DEF3-6, MID8-11, FWD13-14 (4-4-2). Bench: GK2, DEF7, MID12, FWD15.
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;
  ctx.S.benchOrder=['p:7','p:12','p:15'];
  finished(ctx,'AAA');
  // Everyone finished. Starter 13 (FWD) scored 0 minutes -> confirmed absent.
  for(const id of [1,3,4,5,6,8,9,10,11,14]) setRow(ctx,id,{min:90,pts:2});
  setRow(ctx,13,{min:0,pts:0});
  setRow(ctx,15,{min:90,pts:5}); // bench FWD played
  setRow(ctx,7,{min:0,pts:0});   // bench DEF did not play
  setRow(ctx,12,{min:0,pts:0});  // bench MID did not play
  const lineup=ctx.__lineup.resolveActualLineup();
  const ids=[...lineup.scorers].map(p=>p.id).sort((a,b)=>a-b);
  assert.deepEqual(ids,[1,3,4,5,6,8,9,10,11,14,15],'player 13 must be dropped and player 15 (the played bench forward) must replace them');
  assert.equal(lineup.subsInCount,1);
  assert.equal(lineup.unfilledSubCount,0);
});

test('a starter is left alone while their own fixture is still in progress, even at 0 minutes so far',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;ctx.S.benchOrder=['p:7','p:12','p:15'];
  notFinished(ctx,'AAA'); // match still being played
  setRow(ctx,13,{min:0,pts:0});
  const lineup=ctx.__lineup.resolveActualLineup();
  assert.ok(lineup.scorers.some(p=>p.id===13),'a starter whose match has not finished must not be autosubbed out yet');
  assert.equal(lineup.subsInCount,0);
});

test('the goalkeeper autosub is a straight 1-for-1 swap, independent of the outfield formation logic',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;ctx.S.benchOrder=['p:7','p:12','p:15'];
  finished(ctx,'AAA');
  for(const id of [3,4,5,6,8,9,10,11,13,14]) setRow(ctx,id,{min:90,pts:2});
  setRow(ctx,1,{min:0,pts:0});  // starting GK did not play
  setRow(ctx,2,{min:90,pts:3}); // bench GK played
  const lineup=ctx.__lineup.resolveActualLineup();
  assert.ok(lineup.scorers.some(p=>p.id===2)&&!lineup.scorers.some(p=>p.id===1),'the bench GK must replace the starting GK');
  assert.ok(lineup.gkSwapped);
});

test('captaincy moves to the vice-captain once the captain is confirmed not to have played, carrying the chip multiplier',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;ctx.S.benchOrder=['p:7','p:12','p:15'];
  ctx.__chip={benchScoring:false,captainMultiplier:3}; // Triple Captain active
  finished(ctx,'AAA');
  setRow(ctx,13,{min:0,pts:0});
  setRow(ctx,14,{min:90,pts:8});
  setRow(ctx,15,{min:0,pts:0}); // no eligible sub for 13 -> unfilled, fine, captaincy logic is independent
  for(const id of [1,3,4,5,6,8,9,10,11]) setRow(ctx,id,{min:90,pts:2});
  const lineup=ctx.__lineup.resolveActualLineup();
  assert.equal(lineup.effectiveCapId,14,'vice-captain must become the effective captain');
  assert.equal(lineup.capMultiplier,3,'the Triple Captain multiplier must travel with the armband, not stay fixed');
  assert.ok(lineup.capPromoted);
});

test('captaincy stays with the nominal captain while their fixture is still in progress',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;ctx.S.benchOrder=['p:7','p:12','p:15'];
  notFinished(ctx,'AAA');
  setRow(ctx,13,{min:0,pts:0});
  const lineup=ctx.__lineup.resolveActualLineup();
  assert.equal(lineup.effectiveCapId,13,'must not promote the vice while the captain could still come on');
  assert.equal(lineup.capPromoted,false);
});

test('Bench Boost scores all 15 and applies no autosubs',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;ctx.S.benchOrder=['p:7','p:12','p:15'];
  ctx.__chip={benchScoring:true,captainMultiplier:2};
  finished(ctx,'AAA');
  setRow(ctx,13,{min:0,pts:0}); // even a 0-minute starter is not replaced under Bench Boost
  const lineup=ctx.__lineup.resolveActualLineup();
  assert.equal(lineup.scorers.length,15);
  assert.equal(lineup.gkSwapped,false);
  assert.equal(lineup.subsInCount,0);
});

test('a missing starter is dropped without a substitute when no bench player has actually played, instead of being silently kept or crashing',()=>{
  const ctx=makeSandbox();
  ctx.__squad=baseSquad();
  setStart(ctx,[1,3,4,5,6,8,9,10,11,13,14]);
  ctx.S.cap=13;ctx.S.vice=14;ctx.S.benchOrder=['p:7','p:12','p:15'];
  finished(ctx,'AAA');
  for(const id of [1,3,4,5,6,8,9,10,11,14]) setRow(ctx,id,{min:90,pts:2});
  setRow(ctx,13,{min:0,pts:0});  // starting forward failed
  setRow(ctx,7,{min:0,pts:0});   // no bench player actually played
  setRow(ctx,12,{min:0,pts:0});
  setRow(ctx,15,{min:0,pts:0});
  const lineup=ctx.__lineup.resolveActualLineup();
  assert.ok(!lineup.scorers.some(p=>p.id===13),'the failed starter must not still be counted');
  assert.equal(lineup.scorers.length,10,'ten scorers, not eleven — nobody was eligible to fill the slot');
  assert.equal(lineup.unfilledSubCount,1);
});
