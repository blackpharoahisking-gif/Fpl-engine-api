import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const helper=fs.readFileSync(new URL('../release-identity.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const live=fs.readFileSync(new URL('../app-live-points.js',import.meta.url),'utf8');

function runHelper({htmlBuild='2026.08.26.2',metaBuild='2026.08.26.2',badge='BUILD 08.26.2',url='https://example.test/FPL_Engine_OTB.html?build=2026.08.26.2'}={}){
  const html={dataset:{build:htmlBuild}};
  const meta={content:metaBuild};
  const badgeNode={textContent:badge,title:''};
  let href=url;
  const scheduled=[];
  const context={
    console,
    URL,
    location:{get href(){return href}},
    history:{state:null,replaceState(_state,_title,next){href=String(next)}},
    document:{
      documentElement:html,
      querySelector(sel){return sel==='meta[name="otb-build"]'?meta:null},
      getElementById(id){return id==='buildBadge'?badgeNode:null},
    },
    setTimeout(fn,delay){scheduled.push({fn,delay});return scheduled.length},
  };
  context.globalThis=context;
  vm.runInNewContext(helper,context,{filename:'release-identity.js'});
  return{context,html,meta,badgeNode,href,scheduled};
}

test('production startup restores the last-known-good live/core-first order',()=>{
  assert.match(loader,/const BUILD='2026\.08\.26\.7'/);
  const liveAt=loader.indexOf("app-live-points.js?v=2026.08.26.7-live");
  const scoringAt=loader.indexOf("scoring-integrity.js?v=2026.08.26.4-scoring");
  const marketAt=loader.indexOf("market-projection-sync.js?v=2026.08.26.7-market");
  const releaseAt=loader.indexOf("release-identity.js?v=2026.08.26.7-release");
  assert.ok(liveAt>=0,'live/core loader must exist');
  assert.ok(scoringAt>liveAt,'scoring bridge must remain downstream of live/core');
  assert.ok(marketAt>liveAt,'market bridge must remain downstream of live/core');
  assert.ok(releaseAt>marketAt,'release metadata helper must be last and non-critical');
  assert.match(live,/script\.src='app-core\.js\?v=2026\.08\.26\.1-core'/,'live layer must still own the established core append path');
});

test('release helper cannot self-trigger a MutationObserver startup loop',()=>{
  assert.doesNotMatch(helper,/new\s+MutationObserver|MutationObserver\s*\(/);
  assert.doesNotMatch(helper,/queueMicrotask\s*\(/);
  const r=runHelper();
  assert.equal(r.scheduled.length,5,'only bounded late-write repairs should be scheduled');
});

test('an older runtime identity and bookmarked build query are upgraded to .7',()=>{
  const r=runHelper();
  assert.equal(r.html.dataset.build,'2026.08.26.7');
  assert.equal(r.meta.content,'2026.08.26.7');
  assert.equal(r.badgeNode.textContent,'BUILD 08.26.7');
  assert.equal(new URL(r.href).searchParams.get('build'),'2026.08.26.7');
  assert.equal(r.context.__OTB_RELEASE_IDENTITY__.current,'2026.08.26.7');
});

test('the helper never downgrades a future build',()=>{
  const r=runHelper({
    htmlBuild:'2026.08.26.8',
    metaBuild:'2026.08.26.8',
    badge:'BUILD 08.26.8',
    url:'https://example.test/FPL_Engine_OTB.html?build=2026.08.26.8&reload=123',
  });
  assert.equal(r.html.dataset.build,'2026.08.26.8');
  assert.equal(r.meta.content,'2026.08.26.8');
  assert.equal(r.badgeNode.textContent,'BUILD 08.26.8');
  assert.equal(new URL(r.href).searchParams.get('build'),'2026.08.26.8');
  assert.equal(r.context.__OTB_RELEASE_IDENTITY__.current,'2026.08.26.8');
});

test('a late legacy metadata write is repaired by an explicit bounded apply',()=>{
  const r=runHelper();
  r.html.dataset.build='2026.08.26.1';
  r.meta.content='2026.08.26.1';
  r.badgeNode.textContent='BUILD 08.26.1';
  r.context.__OTB_RELEASE_IDENTITY__.apply();
  assert.equal(r.html.dataset.build,'2026.08.26.7');
  assert.equal(r.meta.content,'2026.08.26.7');
  assert.equal(r.badgeNode.textContent,'BUILD 08.26.7');
});
