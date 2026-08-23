import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

/* Marcus, 23 Aug: his cards read "GW1 0 pts (actual)" for several players.
   Checked against the live feed rather than assuming: GW1's deadline was
   21 Aug and at that moment only 6 of its 10 fixtures had finished — four
   had not kicked off at all. FPL's event-live endpoint lists an element
   with every stat zeroed before its fixture begins, so the 0 it returns
   means "nothing recorded yet", not "played and scored nothing". The card
   was presenting that as a settled result, which is worse than showing
   nothing: it looks like a player blanked when he simply has not played.

   These are behavioural, not regex pins: the real cardHTML from
   app-core.js and the real patch layer from app.js are stitched into a vm
   with a synthetic mid-gameweek — one fixture finished, one still being
   played, one not started — and the rendered HTML is inspected. */

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');

function slice(src,startMarker,endMarker){
  const start=src.indexOf(startMarker);
  assert.ok(start>=0,`marker not found: ${startMarker}`);
  const end=src.indexOf(endMarker,start+startMarker.length);
  assert.ok(end>start,`end marker not found after start: ${endMarker}`);
  return src.slice(start,end);
}

/* ARS finished, LIV in progress, BHA not kicked off — and every one of the
   three is present in the live payload, which is exactly what made the
   unstarted player indistinguishable from a genuine blank. */
const FIXTURES={
  ARS:[{finished:true ,started:true ,id:1}],
  LIV:[{finished:false,started:true ,id:2}],
  BHA:[{finished:false,started:false,id:3}],
};

function sandbox(){
  const src=[
    slice(core,'const CLUB_COLOURS=','function flagInfo'),
    slice(core,'function cardHealth','function playerFixtureDifficulty'),
    'function playerFixtureDifficulty(){return 3}',
    slice(core,'function cardFixtureRun','function cardHTML'),
    'function clubSwatch(){return ""}function kitShirtSVG(){return "<svg></svg>"}',
    slice(core,'function cardHTML','function orderedOutfieldBench'),
    slice(app,'const eventForGw=','const actualForPlayer='),
    slice(app,'const actualForPlayer=','const projectedForPlayer='),
    slice(app,'const projectedForPlayer=','/* A player'),
    slice(app,'const playerLocked=','const displaySelect=document'),
    slice(app,'const projectedCardHTML=cardHTML;','function pendingScorerCount'),
    'globalThis.__f={cardHTML,playerStarted,playerLocked};',
  ].join('\n');
  const ctx={
    S:{gw:1,cap:0,vice:0,start:new Set([7,8,9]),display:'total',horizon:2,risk:'mean',
       shotMode:false,buildBlocks:new Set(),locks:new Set()},
    LIVE:{gw:1,rows:new Map([
      [7,{i:7,pts:5,min:90}],  // played a finished match
      [8,{i:8,pts:0,min:0}],   // listed by FPL, but his match has not started
      [9,{i:9,pts:2,min:31}],  // on the pitch right now
    ]),loading:false,error:'',loadedAt:Date.now()},
    scoreMode:'auto',
    EVENTS:[{id:1,deadline_time:'2026-08-21T17:30:00Z'}],
    TEAMS:{ARS:{n:'Arsenal'},BHA:{n:'Brighton'},LIV:{n:'Liverpool'}},
    esc:String,num:(x,d)=>Number.isFinite(x)?x:d,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
    project:()=>({x:3.0,fixtures:[]}),horizonForecast:()=>({total:5.6,n:2}),
    minuteDetail:()=>({avail:1,pStart:1,pAppear:1,exp:80}),
    chipStateForGw:()=>({benchScoring:false,captainMultiplier:2}),
    horizonLabel:()=>'GW1-2',fixtureText:()=>'AVL(H)',scheduleGws:g=>[g],horizonSpan:()=>({n:1}),
    flagInfo:()=>null,squadPlayers:()=>[],byId:()=>null,orderedOutfieldBench:l=>l,selectAutosubs:()=>[],
    fixtureListFor:t=>FIXTURES[t]||[],
    console,Math,Date,Number,Boolean,String,
  };
  vm.createContext(ctx);
  vm.runInContext(src,ctx);
  return ctx;
}

const player=(id,t)=>({id,n:'Test',p:'MID',t,c:6.0,apiId:id});
const secondaryLine=html=>(html.match(/<span class="secondary-value">[^<]*<\/span>/)||[''])[0];

test('a player whose fixture has not kicked off keeps his projection instead of being reported as a 0-point result',()=>{
  const ctx=sandbox();
  const p=player(8,'BHA');
  assert.equal(ctx.__f.playerStarted(p,1),false,'BHA fixture has started:false and the player has no minutes');
  const line=secondaryLine(ctx.__f.cardHTML(p));
  assert.doesNotMatch(line,/actual/,'must not claim an actual result for a match that has not begun');
  assert.doesNotMatch(line,/0 pts/,'the exact string Marcus saw must be gone');
  assert.match(line,/xP/,'it should still read as the projection it is');
});

test('a player whose fixture has finished shows his real points, labelled as the settled result',()=>{
  const ctx=sandbox();
  assert.match(secondaryLine(ctx.__f.cardHTML(player(7,'ARS'))),/GW1 5 pts \(actual\)/);
});

test('a player who is on the pitch right now shows real points labelled live, not final',()=>{
  const ctx=sandbox();
  const line=secondaryLine(ctx.__f.cardHTML(player(9,'LIV')));
  assert.match(line,/GW1 2 pts \(live\)/,'points are real but the match is still running, so it must not read "actual"');
});

test('recorded minutes alone prove kickoff, so a missing or stale fixture flag cannot hide a player who is demonstrably playing',()=>{
  const ctx=sandbox();
  ctx.LIVE.rows.set(8,{i:8,pts:4,min:12});   // BHA fixture still flagged started:false
  const p=player(8,'BHA');
  assert.equal(ctx.__f.playerStarted(p,1),true,'minutes on the pitch must override an unstarted fixture flag');
  assert.match(secondaryLine(ctx.__f.cardHTML(p)),/GW1 4 pts \(live\)/);
});

test('app-core.js exposes the fixture started flag the patch layer needs, alongside finished',()=>{
  const fn=slice(core,'function fixtureListFor','function flagInfo');
  assert.match(fn,/started:m\.started/,'fixtureListFor must surface started, not only finished');
  assert.equal((fn.match(/started:m\.started/g)||[]).length,2,'both the home and away branches need it');
  assert.match(core,/started:!!f\.started/,'applyFixtures must keep storing it in FIX_META');
});

test('the live-score status counts what is actually true of each scorer rather than claiming projections are being shown',()=>{
  const fn=app.match(/function renderLiveGwScore\(\)\{[\s\S]*?\n  \}/)[0];
  assert.match(fn,/yet to kick off/);
  assert.match(fn,/still playing/);
  assert.match(fn,/of \$\{scorers\.length\} final/);
  assert.doesNotMatch(fn,/shown as projected xPts/,'unstarted scorers are counted as their own live 0, not as a projection — the old wording was untrue');
  assert.match(fn,/Bench Boost — all 15 count/,'a 15-man live total must say why it is 15');
});
