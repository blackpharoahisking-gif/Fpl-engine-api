import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

/* Marcus, 21 Aug: "can otb player card look similar to live fpl players
   cards?" — approved via AskUserQuestion as a full visual overhaul: a
   LiveFPL-style kit-shirt icon and a tighter top row, captain/vice moved
   from a text chip to a small corner badge, while every load-bearing
   piece the live-points patch (app.js) and the in-browser self-tests
   (app-core.js ~line 3063/3067) depend on stays exactly where it was. */

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');

function cardHtmlSource(){
  const start=core.indexOf('function cardHTML(p,benchPos=null){');
  assert.ok(start>=0,'cardHTML must exist');
  const end=core.indexOf('function orderedOutfieldBench',start);
  assert.ok(end>start,'end-of-function marker not found');
  return core.slice(start,end);
}

test('kitShirtSVG exists and reuses CLUB_COLOURS rather than a new data source',()=>{
  assert.match(core,/function kitShirtSVG\(code,size=28\)\{/);
  const fn=core.match(/function kitShirtSVG\([\s\S]*?\n\}/)[0];
  assert.match(fn,/CLUB_COLOURS\[code\]/,'must reuse the existing per-club colour map, not a new one');
  assert.match(fn,/<svg/);
});

test('cardHTML renders the kit-shirt icon and a corner captain/vice badge instead of the old CAPTAIN/VICE text chips',()=>{
  const body=cardHtmlSource();
  assert.match(body,/kitShirtSVG\(p\.t\)/,'the main card branch must render the shirt icon for the player\'s club');
  assert.match(body,/class="card-top"/);
  assert.match(body,/corner-badge cap-badge/);
  assert.match(body,/corner-badge vice-badge/);
  assert.doesNotMatch(body,/state-chip cap">CAPTAIN/,'the old inline CAPTAIN text chip must be gone, replaced by the corner badge');
  assert.doesNotMatch(body,/state-chip vice">VICE/,'the old inline VICE text chip must be gone, replaced by the corner badge');
});

test('every load-bearing structural piece the live-points patch and self-tests depend on survives the redesign',()=>{
  const body=cardHtmlSource();
  // app.js does regex substitution against these — see app.js's live-points patch.
  assert.match(body,/class="therm"/);
  assert.match(body,/class="cstat"/);
  assert.match(body,/<span class="xp-value">[\s\S]*?<\/span><span class="xp-label">/,'xp-value and xp-label must remain immediately adjacent');
  assert.match(body,/expected-points details/);
  assert.match(body,/expected-points total/);
  // in-browser self-test (~app-core.js line 3063) checks the function's own source text.
  for(const token of ['Start XI','Captain','Vice','Lock','Block Build','Remove','cardHealth','cardFixtureRun']){
    assert.ok(body.includes(token),`self-test-relied-upon token missing from cardHTML source: ${token}`);
  }
  // Actions grid / menu must still be present for the CSS self-test (~line 3067).
  assert.match(body,/class="card-menu"/);
  assert.match(body,/class="card-action-grid"/);
});

test('the shotMode compact card branch is untouched by the redesign',()=>{
  const body=cardHtmlSource();
  assert.match(body,/class="cstat"/);
  assert.match(body,/ccap/,'compact-mode captain/vice/bench badges must be untouched');
});

test('stylesheet defines the new card-top/kit-shirt/corner-badge rules and the CSS self-test tokens still survive',()=>{
  assert.match(html,/\.card-top\{/);
  assert.match(html,/\.kit-shirt\{/);
  assert.match(html,/\.corner-badge\{/);
  assert.match(html,/\.corner-badge\.cap-badge\{/);
  assert.match(html,/\.corner-badge\.vice-badge\{/);
  assert.match(html,/\.card-action-grid\{/);
  assert.match(html,/\.card-menu\{/);
  assert.match(html,/min-height:34px/);
});

test('cache-bust queries are bumped together for this content change',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/app-core\.js\?v=2026\.08\.22\.2-core/,'app-core.js changed, so its cache-bust must be bumped');
  assert.match(html,/app\.js\?v=2026\.08\.22\.\d/,'app.js\'s own comment/BUILD was touched too, so the HTML script tag must match');
});
