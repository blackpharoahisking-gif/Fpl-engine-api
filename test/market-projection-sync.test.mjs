import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sync=readFileSync(new URL('../market-projection-sync.js',import.meta.url),'utf8');

test('production loader installs the global market projection lifecycle bridge',()=>{
  assert.match(app,/market-projection-sync\.js\?v=2026\.08\.26\.3-market/);
  assert.match(app,/global market projection hydration/i);
  assert.doesNotThrow(()=>new Function(sync));
});

test('low-power/mobile projection hydration is not gated by the active rail tab',()=>{
  assert.match(sync,/if\(isLowPower\(\)\)void refreshProjectionMarket\('startup-low-power',\{force:true\}\)/);
  assert.match(sync,/setInterval\(\(\)=>void refreshProjectionMarket\('hourly'/);
  assert.match(sync,/visibilitychange/);
  assert.match(sync,/refreshProjectionMarket\('resume'/);
  assert.doesNotMatch(sync,/activeRailTab/);
});

test('market lookup and projection propagation remain generic for both fixture sides and every player',()=>{
  assert.match(core,/MARKET\.byKey\.set\(marketKey\(f\.home,f\.away,true\)/);
  assert.match(core,/MARKET\.byKey\.set\(marketKey\(f\.away,f\.home,false\)/);
  assert.match(core,/function projectFixture\(pl,fx\)\{const ctx=fixtureContext\(pl\.t,fx\)/);
  assert.match(sync,/for\(const \[key,mkt\] of MARKET\.byKey\.entries\(\)\)/);
  assert.doesNotMatch(sync,/Gabriel|ARS\|AVL|AVL\|ARS/,
    'the lifecycle repair must never contain a player- or club-specific exception');
});

test('runtime audit requires the market path to alter all fixture-context channels',()=>{
  assert.match(core,/attackM=clamp\(\(1-w\)\*attackM\+w\*mktAttackM/);
  assert.match(core,/lambdaAgainst=clamp\(\(1-w\)\*lambdaAgainst\+w\*mkt\.xgAgainst/);
  assert.match(core,/pCS=clamp\(\(1-w\)\*pCS\+w\*mkt\.pCS/);
  assert.match(core,/dAtk=clamp\(\(1-w\)\*dAtk\+w\*clamp/);
  assert.match(core,/dCS\s*=clamp\(\(1-w\)\*dCS\s*\+w\*clamp/);
  assert.match(sync,/blended\.marketApplied/);
  assert.match(sync,/blended\.attackM/);
  assert.match(sync,/blended\.lambdaAgainst/);
  assert.match(sync,/blended\.pCS/);
  assert.match(sync,/blended\.dAtk/);
  assert.match(sync,/blended\.dCS/);
  assert.match(sync,/__OTB_MARKET_PROPAGATION_AUDIT__/);
});
