import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const app=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');

function extractFunction(name){
  const start=app.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`${name} must exist`);
  const open=app.indexOf('{',start);let depth=0;
  for(let i=open;i<app.length;i++){
    if(app[i]==='{')depth++;
    else if(app[i]==='}'&&--depth===0)return app.slice(start,i+1);
  }
  throw new Error(`Could not extract ${name}`);
}

function chipHarness(){
  const functions=['chipPrefixForCode','chipKeyFor','chipUsedGw','chipIsUsed','chipStateForGw','setChipStateForGw','recordUsedChip','replaceUsedChipHistory'].map(extractFunction).join('\n');
  const context={};
  vm.runInNewContext(`
    const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
    const CHIP_STATE_DEFS={WC:{code:'WILDCARD',label:'Wildcard'},FH:{code:'FREE_HIT',label:'Free Hit'},TC:{code:'TRIPLE_CAPTAIN',label:'Triple Captain'},BB:{code:'BENCH_BOOST',label:'Bench Boost'}};
    const S={chips:{WC1:'',FH1:'',TC1:'',BB1:'4',WC2:'',FH2:'',TC2:'',BB2:''},usedChips:{WC1:'',FH1:'',TC1:'',BB1:'',WC2:'',FH2:'',TC2:'',BB2:''},chipHistoryTeamId:null};
    ${functions}
    globalThis.h={S,chipStateForGw,setChipStateForGw,replaceUsedChipHistory,chipIsUsed};
  `,context);
  return context.h;
}

test('official history creates a generic, team-specific used-chip ledger',()=>{
  const h=chipHarness();
  const imported=h.replaceUsedChipHistory([
    {name:'bboost',event:1},
    {name:'wildcard',event:3},
    {name:'freehit',event:6},
    {name:'3xc',event:15},
  ],123456);

  assert.equal(imported.length,4);
  assert.equal(h.S.chipHistoryTeamId,123456);
  assert.equal(h.S.usedChips.BB1,'1');
  assert.equal(h.S.usedChips.WC1,'3');
  assert.equal(h.S.usedChips.FH1,'6');
  assert.equal(h.S.usedChips.TC1,'15');
  assert.equal(h.S.chips.BB1,'','an official BB use must clear a stale future BB plan');

  const bb=h.chipStateForGw(1);
  assert.equal(bb.code,'BENCH_BOOST');
  assert.equal(bb.status,'USED');
  assert.equal(bb.used,true);
  assert.equal(bb.benchScoring,true);

  h.setChipStateForGw('BENCH_BOOST',4);
  assert.equal(h.S.chips.BB1,'','a used chip cannot be scheduled again');
});

test('importing a different team replaces, rather than merges, chip availability',()=>{
  const h=chipHarness();
  h.replaceUsedChipHistory([{name:'bboost',event:1}],111);
  assert.equal(h.chipIsUsed('BB1'),true);

  h.replaceUsedChipHistory([{name:'wildcard',event:2}],222);
  assert.equal(h.S.chipHistoryTeamId,222);
  assert.equal(h.chipIsUsed('BB1'),false,'team 111 BB use must not leak into team 222');
  assert.equal(h.S.usedChips.WC1,'2');
});

test('team import fetches full chip history and persists it separately from plans',()=>{
  assert.match(app,/\/api\/entry-history\?id=\$\{teamId\}/);
  assert.match(app,/\/entry\/\$\{teamId\}\/history\//);
  assert.match(app,/Promise\.all\(\[fetchFplImportEndpoint[\s\S]*fetchFplChipHistory\(teamId\)/);
  assert.match(app,/replaceUsedChipHistory\(normaliseFplChipHistory\(chipHistory\),teamId\)/);
  assert.match(app,/usedChips:S\.usedChips/);
  assert.match(app,/chipHistoryTeamId:S\.chipHistoryTeamId/);
});

test('used chips are locked in selectors and removed from automated advice',()=>{
  assert.match(app,/disabled><option selected>USED · GW\$\{usedGw\}/);
  assert.match(app,/usedChips:\{\.\.\.S\.usedChips\}/);
  assert.match(app,/!recs\[k\]\?\.used&&!chipIsUsed\(k\)/);
  assert.match(html,/function usedChipRecommendation/);
  assert.match(html,/recs\[k\]&&recs\[k\]\.gw&&!recs\[k\]\.used/);
  assert.match(html,/Official FPL chip history records \$\{label\} as played/);
});
