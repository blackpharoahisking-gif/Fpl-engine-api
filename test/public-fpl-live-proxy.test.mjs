import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const worker=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');

test('live score bridge loads the untouched app core and exposes official GW points',()=>{
  assert.match(app,/app-core\.js\?v=2026\.08\.25\.3-core/);
  assert.match(app,/GW points/);
  assert.match(app,/actualRowsFromPayload\(payload\)/);
  assert.match(app,/const projectedCardHTML=cardHTML/);
  assert.match(app,/const projectedRenderSpine=renderSpine/);
  assert.match(app,/\/api\/event-live\?gw=/);
});

/* Marcus, 21 Aug: got 22 pts, engine showed 27, and asked to fix the live
   path after it agreed FPL's own event-live endpoint was returning far
   fewer than 300 rows mid-gameweek. A hard >=300 gate meant the whole
   feature stayed off — no per-player data at all — until every element
   had reported, which for a gameweek spread across days could be never
   until the last whistle. These pin down that the gate is gone and that a
   still-to-kick-off scorer is blended in as its own projected xPts rather
   than silently dropped from the total or blocking the feature outright. */
test('the live path no longer gates on a fixed row-count threshold',()=>{
  assert.doesNotMatch(app,/rows\.size\s*>=\s*300/,'actualReady must not require a magic row count');
  assert.doesNotMatch(app,/rows\.length\s*<\s*300/,'refreshLiveGwPoints must not reject a real but partial payload');
  assert.match(app,/LIVE\.rows\.size\s*>\s*0/,'readiness should key off hearing back at all, not a magic count');
});

test('a scorer FPL returns no row at all for falls back to their own projected xPts rather than being dropped',()=>{
  assert.match(app,/projectedForPlayer/,'the live total needs a per-player fallback for a scorer with no live row');
  assert.match(app,/project\(p,S\.gw\)/,'the fallback must reuse the same project() every card already calls');
  assert.match(app,/waiting\+\+/,'scorers whose fixture has not kicked off must be counted, not silently absorbed into the total');
  assert.match(app,/playing\+\+/,'scorers whose fixture is still running must be counted separately from those yet to start');
  assert.doesNotMatch(app,/if\(pts===null\)continue;sum\+=pts/,'the old skip-if-missing summing must be gone');
});

test('a partial GW total says so instead of presenting itself as final',()=>{
  assert.match(app,/not yet final/);
});

test('Worker proxies only the public FPL reads required by import and live scoring',()=>{
  assert.match(worker,/import core from '\.\/index-core\.js'/);
  assert.match(worker,/path==='\/api\/entry'/);
  assert.match(worker,/path==='\/api\/entry-picks'/);
  assert.match(worker,/path==='\/api\/event-live'/);
  assert.match(worker,/\/entry\/\$\{id\}\/event\/\$\{gw\}\/picks\//);
  assert.match(worker,/\/event\/\$\{gw\}\/live\//);
  assert.match(worker,/return core\.fetch\(request,env,ctx\)/);
});
