import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

/* Marcus, 23 Aug: live GW cards must show the current official score,
   including 0 before kickoff, rather than reverting to expected points.
   A pre-kickoff 0 is not a final blank, so it is labelled "live"; after
   the fixture finishes the same slot is labelled "pts". Projections remain
   visible on the secondary line and remain primary before the GW deadline.

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
/* The headline slot is the big bright-green figure Marcus reads first:
   "the numbers shown in bright green want that to be live gw points". */
const headline=html=>{
  const m=html.match(/<span class="xp-value">([^<]*)<\/span><span class="xp-label">([^<]*)<\/span>/);
  return m?{value:m[1],label:m[2]}:null;
};

test('a player whose fixture has not kicked off shows the current official live GW score, not xP',()=>{
  const ctx=sandbox();
  const p=player(8,'BHA');
  assert.equal(ctx.__f.playerStarted(p,1),false,'BHA fixture has started:false and the player has no minutes');
  const html=ctx.__f.cardHTML(p);
  assert.deepEqual(headline(html),{value:'0',label:'GW1 live'},'the bright headline must show the official current-GW value even before kickoff');
  assert.match(secondaryLine(html),/5\.6 GW1-2 xP/,'the displaced horizon projection remains available on the secondary line');
});

test('a player whose fixture has finished puts his real points in the bright headline slot, labelled as the settled result',()=>{
  const ctx=sandbox();
  const html=ctx.__f.cardHTML(player(7,'ARS'));
  assert.deepEqual(headline(html),{value:'5',label:'GW1 pts'});
});

test('a player who is on the pitch right now shows real points labelled live, not final',()=>{
  const ctx=sandbox();
  const head=headline(ctx.__f.cardHTML(player(9,'LIV')));
  assert.equal(head.value,'2');
  assert.equal(head.label,'GW1 live','points are real but the match is still running, so it must not read as settled');
});

test('the active captain card shows his multiplied contribution to the live GW total',()=>{
  const ctx=sandbox();
  ctx.S.cap=9;
  const head=headline(ctx.__f.cardHTML(player(9,'LIV')));
  assert.deepEqual(head,{value:'4',label:'GW1 live'},'2 raw points with the normal captain multiplier must display as 4');
});

test('the horizon projection the live score displaces is moved onto the secondary line, keeping its label and the fixture text',()=>{
  const ctx=sandbox();
  const line=secondaryLine(ctx.__f.cardHTML(player(7,'ARS')));
  assert.match(line,/5\.6 GW1-2 xP/,'the displaced headline value and its own label must both survive');
  const full=ctx.__f.cardHTML(player(7,'ARS'));
  assert.match(full,/5\.6 GW1-2 xP<\/span> · AVL\(H\)/,'the fixture text after the span must be left intact');
});

test('recorded minutes alone prove kickoff, so a missing or stale fixture flag cannot hide a player who is demonstrably playing',()=>{
  const ctx=sandbox();
  ctx.LIVE.rows.set(8,{i:8,pts:4,min:12});   // BHA fixture still flagged started:false
  const p=player(8,'BHA');
  assert.equal(ctx.__f.playerStarted(p,1),true,'minutes on the pitch must override an unstarted fixture flag');
  assert.deepEqual(headline(ctx.__f.cardHTML(p)),{value:'4',label:'GW1 live'});
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
