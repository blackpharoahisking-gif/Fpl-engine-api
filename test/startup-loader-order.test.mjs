import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('production boot appends live/core path first and release helper last',()=>{
  const appended=[];
  const html={dataset:{build:'2026.08.26.1'}};
  const meta={content:'2026.08.26.1'};
  const badge={textContent:'BUILD 08.26.1'};

  const body={appendChild(node){appended.push(node);return node}};
  const context={
    console,
    document:{
      documentElement:html,
      body,
      querySelector(sel){return sel==='meta[name="otb-build"]'?meta:null},
      getElementById(id){return id==='buildBadge'?badge:null},
      createElement(tag){
        assert.equal(tag,'script');
        return{src:'',async:true,onload:null,onerror:null};
      },
    },
  };
  context.globalThis=context;
  vm.runInNewContext(loader,context,{filename:'app.js'});

  assert.equal(html.dataset.build,'2026.08.26.9');
  assert.equal(meta.content,'2026.08.26.9');
  assert.equal(badge.textContent,'BUILD 08.26.9');
  assert.equal(appended.length,1,'nothing may run ahead of the live/core loader');
  assert.equal(appended[0].src,'app-live-points.js?v=2026.08.26.9-live');
  assert.equal(typeof appended[0].onload,'function');

  appended[0].onload();
  assert.deepEqual(
    appended.slice(1).map(s=>s.src),
    [
      'scoring-integrity.js?v=2026.08.26.4-scoring',
      'market-projection-sync.js?v=2026.08.26.8-market',
      'market-impact-inspector.js?v=2026.08.26.6-market-impact',
      'role-freshness-sync.js?v=2026.08.26.9-role-freshness',
      'cloud-accountability.js?v=2026.08.26.2-cloud',
      'accountability-v2.js?v=2026.08.26.8-accountability-v2',
      'accountability-governance.js?v=2026.08.26.8-governance',
      'release-identity.js?v=2026.08.26.9-release',
    ]
  );
});
