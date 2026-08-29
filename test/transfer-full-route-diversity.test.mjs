import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const block=id=>{const m=html.match(new RegExp(`<script id="${id}" type="text/plain">([\\s\\S]*?)<\\/script>`));assert.ok(m,`${id} missing`);return m[1]};
const source=block('workerCommonSource')+'\n'+block('transferWorkerSource');
const h=Function(`let onmessage;const postMessage=()=>{};${source}\nreturn{planSignature,routeSignature};`)();

const move=(gw,outId,inId)=>({gw,chip:'',moves:[{outId,inId}]});

test('full route identity distinguishes plans that share the same first transfer',()=>{
  const a=[move(2,1,2),move(3,3,4)];
  const b=[move(2,1,2),move(3,5,6)];
  assert.equal(h.planSignature(a),h.planSignature(b));
  assert.notEqual(h.routeSignature(a),h.routeSignature(b));
});

test('alternative and stress candidate dedupe use full route identity',()=>{
  assert.match(source,/seenRoutes=new Set\(\[routeSignature\(best\.plan\)\]\)/);
  assert.match(source,/candidateSeen\.has\(routeSig\)/);
  assert.match(source,/routeSignature:routeSig/);
});

test('primary result retains first-action identity and also publishes full route identity',()=>{
  assert.match(source,/signature:planSignature\(best\.plan\),routeSignature:routeSignature\(best\.plan\)/);
});

test('alternative UI shows the complete transfer route rather than only GW1 of the plan',()=>{
  assert.match(app,/function transferRouteText\(plan\)/);
  assert.match(app,/Alternative route \$\{i\+1\}:/);
  assert.match(app,/esc\(transferRouteText\(a\.plan\)\)/);
});
