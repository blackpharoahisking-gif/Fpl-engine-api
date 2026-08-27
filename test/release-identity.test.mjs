import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const guard=fs.readFileSync(new URL('../release-identity.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const live=fs.readFileSync(new URL('../app-live-points.js',import.meta.url),'utf8');

function runGuard({htmlBuild='2026.08.26.2',metaBuild='2026.08.26.2',badge='BUILD 08.26.2',url='https://example.test/FPL_Engine_OTB.html?build=2026.08.26.2'}={}){
  const html={dataset:{build:htmlBuild}};
  const meta={content:metaBuild};
  const badgeNode={textContent:badge,title:''};
  let href=url;
  class Observer{observe(){} disconnect(){}}
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
    MutationObserver:Observer,
    queueMicrotask(fn){fn()},
    setTimeout(){return 1},
  };
  context.globalThis=context;
  vm.runInNewContext(guard,context,{filename:'release-identity.js'});
  return{context,html,meta,badgeNode,href};
}

test('production loader installs the release guard before legacy live/core layers',()=>{
  assert.match(loader,/const BUILD='2026\.08\.26\.6'/);
  const releaseAt=loader.indexOf("release-identity.js?v=2026.08.26.6-release");
  const liveAt=loader.indexOf("app-live-points.js?v=2026.08.26.6-live");
  assert.ok(releaseAt>=0,'release guard must be loaded');
  assert.ok(liveAt>releaseAt,'release guard must be inserted before the legacy live layer');
  assert.match(live,/const BUILD='2026\.08\.26\.1'/,'regression fixture: the legacy layer still demonstrates the old downgrade write');
});

test('an older runtime identity and bookmarked build query are upgraded monotonically',()=>{
  const r=runGuard();
  assert.equal(r.html.dataset.build,'2026.08.26.6');
  assert.equal(r.meta.content,'2026.08.26.6');
  assert.equal(r.badgeNode.textContent,'BUILD 08.26.6');
  assert.equal(new URL(r.href).searchParams.get('build'),'2026.08.26.6');
  assert.equal(r.context.__OTB_RELEASE_IDENTITY__.current,'2026.08.26.6');
});

test('the guard never downgrades a future build',()=>{
  const r=runGuard({
    htmlBuild:'2026.08.26.7',
    metaBuild:'2026.08.26.7',
    badge:'BUILD 08.26.7',
    url:'https://example.test/FPL_Engine_OTB.html?build=2026.08.26.7&reload=123',
  });
  assert.equal(r.html.dataset.build,'2026.08.26.7');
  assert.equal(r.meta.content,'2026.08.26.7');
  assert.equal(r.badgeNode.textContent,'BUILD 08.26.7');
  assert.equal(new URL(r.href).searchParams.get('build'),'2026.08.26.7');
  assert.equal(r.context.__OTB_RELEASE_IDENTITY__.current,'2026.08.26.7');
});

test('a late legacy metadata write is repaired without depending on badge mutation',()=>{
  const r=runGuard();
  r.html.dataset.build='2026.08.26.1';
  r.meta.content='2026.08.26.1';
  r.badgeNode.textContent='BUILD 08.26.1';
  r.context.__OTB_RELEASE_IDENTITY__.apply();
  assert.equal(r.html.dataset.build,'2026.08.26.6');
  assert.equal(r.meta.content,'2026.08.26.6');
  assert.equal(r.badgeNode.textContent,'BUILD 08.26.6');
});