import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const integrity=readFileSync(new URL('../scoring-integrity.js',import.meta.url),'utf8');

test('fixture-level structural caps are enforced defensively after every aggregate blend',()=>{
  assert.match(integrity,/parts\.app=clamp\(parts\.app,0,caps\.app\)/);
  assert.match(integrity,/parts\.dc=clamp\(parts\.dc,0,caps\.dc\)/);
  assert.match(integrity,/parts\.cs=clamp\(parts\.cs,0,caps\.cs\)/);
  assert.match(integrity,/parts\.oth\+=num\(r\.x\)-sumParts\(parts\)/);
});

test('runtime audit checks total equality and per-fixture appearance, DC and CS laws',()=>{
  assert.match(integrity,/components!=xPts/);
  assert.match(integrity,/appearance-not-exact/);
  assert.match(integrity,/fixture-dc-cap/);
  assert.match(integrity,/fixture-cs-cap/);
  assert.match(integrity,/__OTB_SCORING_INTEGRITY_AUDIT__/);
});
