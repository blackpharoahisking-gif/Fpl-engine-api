import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const featureStart=html.indexOf('const SCHEDULE_SWING_MATERIAL_DELTA');
const featureEnd=html.indexOf('\nfunction schedulePlayerProjection',featureStart);
const commandStart=html.indexOf('function renderScheduleCommand');
const commandEnd=html.indexOf('\nfunction renderScheduleMatrix',commandStart);
assert.ok(featureStart>=0&&featureEnd>featureStart,'fixture swing helpers must be present');
assert.ok(commandStart>=0&&commandEnd>commandStart,'Schedule Command Center renderer must be present');
const featureSource=html.slice(featureStart,featureEnd);
const commandSource=html.slice(commandStart,commandEnd);

const helperContext={
  scheduleGwDifficulty:list=>list.length
    ? Math.max(1,Math.min(5.5,list.reduce((sum,row)=>sum+row.dOverall,0)/list.length))
    : 5.5,
  esc:value=>String(value??'')
};
vm.createContext(helperContext);
vm.runInContext(`${featureSource};globalThis.__swing={SCHEDULE_SWING_MATERIAL_DELTA,scheduleSwingPoints,scheduleSwingOpponent,scheduleSwingTimeline,renderScheduleSwingDetails};`,helperContext);
const {SCHEDULE_SWING_MATERIAL_DELTA,scheduleSwingPoints,scheduleSwingOpponent,scheduleSwingTimeline,renderScheduleSwingDetails}=helperContext.__swing;

function scheduleRow(code,difficulties,opponents){
  return{
    code,
    cells:difficulties.map((difficulty,index)=>opponents[index]==='—'?[]:[{
      opp:opponents[index],home:index%2===0,dOverall:difficulty
    }])
  };
}

test('material deterioration starts, groups, peaks and recovers at the correct GWs',()=>{
  const gws=[1,2,3,4,5,6];
  const row=scheduleRow('BRE',[2.4,2.6,4.8,4.7,4.9,2.5],['EVE','WHU','MCI','LIV','ARS','BOU']);
  const swing=scheduleSwingTimeline(row,gws,'deterioration');
  assert.equal(SCHEDULE_SWING_MATERIAL_DELTA,.5);
  assert.equal(swing.material,true);
  assert.equal(swing.swingDirection,'deterioration');
  assert.equal(swing.swingStartGW,3);
  assert.equal(swing.swingEndGW,5);
  assert.equal(swing.coreStartGW,3);
  assert.equal(swing.coreEndGW,5);
  assert.equal(swing.extremeGW,5);
  assert.equal(swing.peakGW,5);
  assert.equal(swing.troughGW,null);
  assert.equal(swing.extremeOpponent,'ARS (H)');
  assert.equal(swing.recoveryGW,6);

  const rendered=renderScheduleSwingDetails([row],gws,'deterioration');
  assert.match(rendered,/Deterioration starts GW3/);
  assert.match(rendered,/Hard stretch: GW3–GW5/);
  assert.match(rendered,/improves again GW6/);
  assert.match(rendered,/GW3<\/b>MCI \(H\)/);
});

test('material improvement identifies the favourable subsection and trough',()=>{
  const gws=[1,2,3,4,5,6];
  const row=scheduleRow('NEW',[4.8,4.6,4.7,3.1,2.2,2.4],['ARS','CHE','LIV','WOL','BUR','FUL']);
  const swing=scheduleSwingTimeline(row,gws,'improvement');
  assert.equal(swing.swingDirection,'improvement');
  assert.equal(swing.swingStartGW,4);
  assert.equal(swing.swingEndGW,6);
  assert.equal(swing.coreStartGW,4);
  assert.equal(swing.coreEndGW,6);
  assert.equal(swing.extremeGW,5);
  assert.equal(swing.peakGW,null);
  assert.equal(swing.troughGW,5);
  assert.equal(swing.extremeOpponent,'BUR (H)');
  assert.equal(swing.recoveryGW,null);

  const rendered=renderScheduleSwingDetails([row],gws,'improvement');
  assert.match(rendered,/Improvement starts GW4/);
  assert.match(rendered,/Favourable run: GW4–GW6/);
  assert.match(rendered,/easiest GW5 BUR \(H\) \(2\.2\)/);
});

test('an extended swing states both its full end GW and strongest subsection',()=>{
  const gws=[1,2,3,4,5];
  const row=scheduleRow('WHU',[2,2.6,2.3,3,2.7],['FUL','EVE','BOU','MCI','ARS']);
  const swing=scheduleSwingTimeline(row,gws,'deterioration');
  assert.equal(swing.swingStartGW,2);
  assert.equal(swing.swingEndGW,5);
  assert.equal(swing.coreStartGW,4);
  assert.equal(swing.coreEndGW,5);
  assert.match(renderScheduleSwingDetails([row],gws,'deterioration'),/Deterioration run: GW2–GW5 · Hard stretch: GW4–GW5/);
});

test('tiny adjacent fluctuations are reported as gradual, not material swings',()=>{
  const row=scheduleRow('FUL',[4,3.7,3.4,3.1],['ARS','CHE','LIV','WOL']);
  const swing=scheduleSwingTimeline(row,[1,2,3,4],'improvement');
  assert.equal(swing.material,false);
  assert.equal(swing.swingStartGW,null);
  assert.match(renderScheduleSwingDetails([row],[1,2,3,4],'improvement'),/No ≥0\.5 adjacent step/);
});

test('timeline preserves doubles, venues and blanks from the existing fixture matrix',()=>{
  const row={code:'BHA',cells:[[
    {opp:'ARS',home:true,dOverall:4.7},
    {opp:'CHE',home:false,dOverall:4.5}
  ],[]]};
  const points=scheduleSwingPoints(row,[7,8]);
  assert.equal(scheduleSwingOpponent(points[0]),'ARS (H) + CHE (A)');
  assert.equal(scheduleSwingOpponent(points[1]),'—');
  assert.equal(points[1].difficulty,5.5);
});

test('existing Schedule Command Center numerical output and radar ordering are unchanged',()=>{
  const host={innerHTML:''};
  const gws=[1,2,3,4,5,6];
  const cells=values=>values.map((difficulty,index)=>[{opp:`O${index+1}`,home:index%2===0,dOverall:difficulty}]);
  const rows=[
    {code:'AAA',avgOverall:2.2,avgAtk:2.1,avgCS:2.3,swing:-1.2,exposure:{count:1},cells:cells([4.8,4.5,4.6,3,2.6,2.4])},
    {code:'BBB',avgOverall:2.5,avgAtk:2.2,avgCS:2.7,swing:-.8,exposure:{count:0},cells:cells([4.4,4.2,4.1,3.2,2.8,2.5])},
    {code:'CCC',avgOverall:3.4,avgAtk:3.5,avgCS:3.3,swing:1.1,exposure:{count:1},cells:cells([2.1,2.4,2.5,3.8,4.2,4.5])},
    {code:'DDD',avgOverall:3.8,avgAtk:3.9,avgCS:3.7,swing:.7,exposure:{count:0},cells:cells([2.5,2.7,2.9,3.6,3.9,4.1])},
    {code:'EEE',avgOverall:2.8,avgAtk:2.9,avgCS:2.7,swing:-.3,exposure:{count:0},cells:cells([3.4,3.2,3.1,2.9,2.8,2.7])}
  ];
  const context={
    ...helperContext,
    document:{getElementById:id=>id==='fxCommandCenter'?host:null},
    squadPlayers:()=>[{id:1,t:'AAA'},{id:2,t:'CCC'}],
    clamp:(value,min,max)=>Math.max(min,Math.min(max,value)),
    POOL:[
      {id:10,n:'Keeper A',t:'AAA',p:'GK',c:4.5,start:.8,total:28},
      {id:11,n:'Mid B',t:'BBB',p:'MID',c:7,start:.8,total:34},
      {id:12,n:'Forward C',t:'CCC',p:'FWD',c:8,start:.8,total:31}
    ],
    availability:()=>1,
    schedulePlayerProjection:p=>({p,total:p.total,value:p.total/p.c,safe:p.total,pStart:p.start}),
    project:p=>({x:p.total/6}),
    minuteDetail:()=>({pAppear:1}),
    TEAMS:{AAA:{n:'Alpha'},BBB:{n:'Beta'},CCC:{n:'Gamma'},DDD:{n:'Delta'},EEE:{n:'Epsilon'}},
    esc:value=>String(value??'')
  };
  vm.createContext(context);
  vm.runInContext(`${featureSource}\n${commandSource}`,context);
  context.renderScheduleCommand(rows,gws);
  const output=host.innerHTML;
  assert.match(output,/<div class="schedule-score">55<small>\/100<\/small>/);
  assert.match(output,/AAA \(1\.20 easier\) · BBB \(0\.80 easier\) · EEE \(0\.30 easier\)/);
  assert.match(output,/CCC \(1\.10 harder\) · DDD \(0\.70 harder\) · EEE \(0\.30 harder\)/);
  assert.match(output,/Attack 52\/100 · Defence 52\/100/);
  assert.match(output,/Keeper A[\s\S]*28\.0/);
  assert.match(output,/Mid B[\s\S]*34\.0/);
  assert.match(output,/Forward C[\s\S]*31\.0/);
  assert.match(output,/Your squad fixture score is 55\/100 across GW1–GW6/);
  assert.equal((output.match(/<details class="schedule-swing-details">/g)||[]).length,2);
  assert.equal((output.match(/class="schedule-swing-club"/g)||[]).length,6);
  assert.doesNotMatch(output,/<details class="schedule-swing-details" open/);
});

test('fixture scoring core is byte-identical and the enhancement introduces no I/O or state',()=>{
  const numericStart=html.indexOf('function scheduleFixtureRows');
  const numericEnd=html.indexOf('function scheduleDifficultyClass',numericStart);
  const numericHash=createHash('sha256').update(html.slice(numericStart,numericEnd)).digest('hex');
  assert.equal(numericHash,'fb08a401bfd70bc0a4064227ab5c67c9db44bded2d7b9c27560ecb40714d5f97');
  assert.doesNotMatch(featureSource,/\bfetch\s*\(|\bsetTimeout\s*\(|\bsetInterval\s*\(|localStorage|sessionStorage|Worker|SCOUT_API_BASE|API_BASE/);
  assert.match(commandSource,/sort\(\(a,b\)=>a\.swing-b\.swing\)\.slice\(0,3\)/);
  assert.match(commandSource,/sort\(\(a,b\)=>b\.swing-a\.swing\)\.slice\(0,3\)/);
});
