import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

/* Marcus, 22 Aug: "this last update broke the live scoring update that
   shows current gw score...i think im on 40 pts...we should separate
   predictive points from actual points."

   Root cause: the live GW score was gated behind selectedGwView()
   (S.display!=='total'), i.e. behind "Points shown: Selected gameweek
   only" — a setting that lives only in Engine > Options, isn't visible
   on the Squad tab at all, and defaults to "Total across the whole
   period". So on a normal load the projected multi-GW horizon total sat
   where the live score should have been, with no visible sign a mode
   switch was even needed — it read as broken, not as a setting.

   Fix: the live score is now computed independently of S.display
   (liveDataRequested/liveScoreReady key only off the gameweek, its
   deadline and scoreMode) and rendered into a header chip (#hLiveGw),
   never blended into the predictive spine (#spineTotal/#hXpts), which
   now always shows exactly what its own label says — the projected
   figure, nothing else.

   Follow-up, same phone: the header chip alone still didn't show on
   Marcus's actual device — it lands 5th among the header's own <div>
   children (brand, hdr-spacer, then the chipstat row), which a narrow-
   phone CSS rule (header .chipstat:nth-of-type(n+5)) truncates, hiding
   it right alongside Bank/XI xPts, which already had the same problem
   before this chip existed. Rather than touch that existing truncation,
   the live score also gets a callout bar (#liveGwBar) in the normal
   page flow under the Squad tab's spine, which nothing truncates. */

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');

test('live data availability no longer depends on the predictive display scope',()=>{
  const fn=app.match(/const liveDataRequested=\(\)=>[^;]*;/);
  assert.ok(fn,'liveDataRequested must exist');
  assert.doesNotMatch(fn[0],/selectedGwView/,'live data must not require "Selected GW" mode to even be requested');
  assert.match(fn[0],/deadlinePassed\(S\.gw\)/,'must still gate on the gameweek deadline');
  const ready=app.match(/const liveScoreReady=\(\)=>[^;]*;/);
  assert.ok(ready,'liveScoreReady must exist');
  assert.doesNotMatch(ready[0],/selectedGwView/,'live-ready must not require "Selected GW" mode either');
});

test('refreshLiveGwPoints, the polling interval and the initial load all key off liveDataRequested, not the old selectedGwView-gated check',()=>{
  assert.doesNotMatch(app,/actualRequested\(\)/,'the old selectedGwView-gated gate must be fully retired, not left dangling');
  assert.match(app,/if\(!liveDataRequested\(\)\|\|navigator\.onLine===false\)return false;/,'refreshLiveGwPoints must gate on the new independent check');
  assert.match(app,/setInterval\(\(\)=>\{if\(liveDataRequested\(\)\)refreshLiveGwPoints\(\);\},60000\);/);
  assert.match(app,/if\(liveDataRequested\(\)\)setTimeout\(\(\)=>refreshLiveGwPoints\(\{force:true\}\),0\);/);
});

test('the predictive spine is never overwritten with actual points — it always shows what its own label says',()=>{
  assert.doesNotMatch(app,/spineTotal'\)\.?\s*;?\s*total\.textContent=String\(sum\)/);
  assert.doesNotMatch(app,/if\(total\)total\.textContent=String\(sum\)/,'the spine total must not be mutated with the live sum any more');
  assert.doesNotMatch(app,/if\(head\)head\.textContent=String\(sum\)/,'the header xPts chip must not be mutated with the live sum any more');
  const wrapper=app.match(/const projectedRenderSpine=renderSpine;[\s\S]*?\n  \};/);
  assert.ok(wrapper,'renderSpine wrapper must exist');
  assert.doesNotMatch(wrapper[0],/document\.getElementById\('spine'\)\.innerHTML=/,'renderSpine must no longer replace the projected colour-breakdown bar with a flat "official" bar');
  assert.match(wrapper[0],/renderLiveGwScore\(\)/,'renderSpine must still trigger the separate live score render');
});

test('cards only substitute a real GW score in Selected-GW view, since a horizon total has no single GW figure to substitute',()=>{
  const fn=app.match(/cardHTML=function\(p,benchPos=null\)\{[\s\S]*?\n  \};/);
  assert.ok(fn,'cardHTML override must exist');
  assert.match(fn[0],/if\(!selectedGwView\(\)\|\|!liveScoreReady\(\)\)return html;/,'must require Selected-GW view before swapping a card\'s xp-value for a real score');
});

test('renderLiveGwScore exists and writes into the header chip AND the in-page callout bar',()=>{
  assert.match(app,/function renderLiveGwScore\(\)\{/);
  const fn=app.match(/function renderLiveGwScore\(\)\{[\s\S]*?\n  \}/)[0];
  assert.match(fn,/getElementById\('hLiveGw'\)/);
  assert.match(fn,/getElementById\('hLiveGwLabel'\)/);
  assert.match(fn,/getElementById\('hLiveGwWrap'\)/);
  assert.match(fn,/getElementById\('liveGwBar'\)/,'must also drive the in-page callout bar, not only the header chip');
  assert.match(fn,/getElementById\('liveGwNum'\)/);
  assert.match(fn,/getElementById\('liveGwStatusText'\)/);
  assert.match(fn,/liveScoreReady\(\)/);
});

/* Marcus, 22 Aug (follow-up, same phone): the header chip alone wasn't
   enough — it lands 5th among the header's own <div> children (brand,
   hdr-spacer, then the chipstat row), which is exactly what a narrow-
   phone rule (header .chipstat:nth-of-type(n+5)) truncates, hiding it
   right alongside Bank/XI xPts, which already had the same problem. The
   callout bar lives in the normal page flow under the Squad tab's
   spine, which that header rule cannot reach — pin that it isn't itself
   inside the header. */
test('the live score callout bar lives in the page flow, not inside the header the narrow-phone rule truncates',()=>{
  const headerStart=html.indexOf('<header');
  const headerEnd=html.indexOf('</header>');
  const barPos=html.indexOf('id="liveGwBar"');
  assert.ok(barPos>=0,'liveGwBar must exist');
  assert.ok(barPos<headerStart||barPos>headerEnd,'the callout bar must not be inside <header>, or the same truncation rule would hide it too');
});

test('the header markup has a dedicated live-score chip, separate from the XI xPts chip',()=>{
  assert.match(html,/id="hLiveGwWrap"/);
  assert.match(html,/id="hLiveGwLabel"/);
  assert.match(html,/id="hLiveGw">/);
});

test('the callout bar markup exists with its number, gameweek label and status line',()=>{
  assert.match(html,/id="liveGwBar"/);
  assert.match(html,/id="liveGwNum"/);
  assert.match(html,/id="liveGwGwLabel"/);
  assert.match(html,/id="liveGwStatusText"/);
});
