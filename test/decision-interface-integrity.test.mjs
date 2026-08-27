import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('../decision-interface-integrity.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('decision integrity layer is display-only and loaded after governance',()=>{
  assert.match(src,/No projection, minutes, DefCon, market-weight/);
  assert.doesNotMatch(src,/baselineParts\s*=|priorFixtureProjection\s*=|liveFixtureProjection\s*=|projectCore\s*=/);
  assert.ok(loader.indexOf('accountability-governance.js')<loader.indexOf('decision-interface-integrity.js'));
  assert.ok(loader.indexOf('decision-interface-integrity.js')<loader.indexOf('release-identity.js'));
});

test('unpriced market diagnostics stay out of the numbered xP action queue',()=>{
  assert.match(src,/filter\(i=>!\['mktdiv','mktoff'\]\.includes/);
  assert.match(src,/diagnostics live in Evidence/);
});

test('same-player signals are merged without summing overlapping exposure',()=>{
  assert.match(src,/function mergePlayerSignals/);
  assert.match(src,/cost:Math\.max\(n\(base\.cost\),n\(other\.cost\)\)/);
  assert.match(src,/expected-points exposure is counted once/);
  assert.doesNotMatch(src,/base\.cost\s*\+\s*other\.cost/);
});

test('rotation exposure publishes the current flat 15 percent allowance formula',()=>{
  assert.match(src,/availabilityTerm=xp\*\(1-av\)/);
  assert.match(src,/rotationTerm=mins<60\?xp\*\.15:0/);
  assert.match(src,/15% rotation allowance/);
});

test('Free Hit is labelled provisional when the advisor has not solved a legal 15',()=>{
  assert.match(src,/nominal bench reserve\|not a fully solved legal 15/);
  assert.match(src,/PROVISIONAL/);
  assert.match(src,/complete legal 15 has not been solved/);
});

test('locked calibration does not reduce actionable feed readiness',()=>{
  assert.match(src,/f\.key==='accuracy'/);
  assert.match(src,/!verdictCalibration\(\)/);
  assert.match(src,/actionable feed\(s\) degraded or cached/);
});

test('market copy identifies raw pre-blend threshold and preserves the 50 percent blend',()=>{
  assert.match(src,/pre-blend model\/market gaps/);
  assert.match(src,/15% alert threshold is applied to that raw disagreement/);
  assert.match(src,/blend \$1% of the market view/);
});

test('variance and drift labels are mathematically explicit',()=>{
  assert.match(src,/quadruples his variance contribution/);
  assert.match(src,/projection SD/);
  assert.match(src,/Other XI\/captain movement/);
  assert.match(src,/closes the XI-total reconciliation/);
});

test('patch introduces no observer loop',()=>{
  assert.doesNotMatch(src,/MutationObserver/);
});
