import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const worker=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');

test('live score bridge loads the untouched app core and exposes official GW points',()=>{
  assert.match(app,/app-core\.js\?v=2026\.08\.21\.1-core/);
  assert.match(app,/GW points/);
  assert.match(app,/actualRowsFromPayload\(payload\)/);
  assert.match(app,/const projectedCardHTML=cardHTML/);
  assert.match(app,/const projectedRenderSpine=renderSpine/);
  assert.match(app,/\/api\/event-live\?gw=/);
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
