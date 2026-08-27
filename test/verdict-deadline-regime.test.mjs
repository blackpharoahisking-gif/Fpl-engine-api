import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const core=fs.readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const source=core.match(/function verdictRegime\(\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(source,'verdictRegime must remain available for deadline safety checks');

function regime({deadline,verified=true,now}){
  class FixedDate extends Date{static now(){return now}}
  const context={
    Date:FixedDate,
    Number,
    DEADLINE:deadline,
    DEADLINE_VERIFIED:verified,
    VERDICT_LOCK_MIN:180,
    VERDICT_DECIDE_MIN:2880,
  };
  context.globalThis=context;
  vm.runInNewContext(`${source}\nresult=verdictRegime()`,context,{filename:'verdictRegime.js'});
  return context.result;
}

test('Verdict subtracts the numeric bootstrap deadline without parsing it twice',()=>{
  assert.match(core,/DEADLINE=Date\.parse\(next\.deadline_time\)/);
  assert.doesNotMatch(source,/Date\.parse\(DEADLINE\)/);

  const deadline=Date.parse('2026-08-28T17:30:00Z');
  const result=regime({deadline,now:deadline-31*60*60*1000});
  assert.equal(result.key,'DECIDE');
  assert.equal(result.verified,true);
  assert.equal(result.minsLeft,31*60);
});

test('Verdict keeps each deadline safety boundary distinct',()=>{
  const deadline=Date.parse('2026-08-28T17:30:00Z');
  assert.equal(regime({deadline,now:deadline-49*60*60*1000}).key,'PLAN');
  assert.equal(regime({deadline,now:deadline-47*60*60*1000}).key,'DECIDE');
  assert.equal(regime({deadline,now:deadline-179*60*1000}).key,'LOCK');
  assert.equal(regime({deadline,now:deadline+1}).key,'REVIEW');
});

test('Verdict remains unverified when the bootstrap deadline is invalid',()=>{
  const result=regime({deadline:NaN,verified:false,now:Date.now()});
  assert.equal(result.key,'PLAN');
  assert.equal(result.minsLeft,null);
  assert.equal(result.verified,false);
  assert.equal(result.label,'Deadline unknown');
});
