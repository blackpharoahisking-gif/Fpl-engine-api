import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');

test('build freshness checks deployed JavaScript as well as the HTML shell',()=>{
  assert.match(core,/function buildFromJs\(js\)/);
  assert.match(core,/Promise\.all\(\[/);
  assert.match(core,/fetch\(appUrl\.toString\(\),\{cache:'no-store'/);
  assert.match(core,/newestBuild\(buildFromHtml\(await pageResponse\.text\(\)\),buildFromJs\(await appResponse\.text\(\)\)\)/);
});

test('forced upgrade query becomes the app.js cache key',()=>{
  assert.match(html,/new URLSearchParams\(location\.search\)\.get\('build'\)/);
  assert.match(html,/script\.src='app\.js\?v='\+encodeURIComponent\(requested\)/);
  assert.doesNotMatch(html,/<script src="app\.js\?v=[^"]+"><\/script>/);
});

test('published build metadata agrees across the HTML shell and app patch',()=>{
  const htmlBuild=/<html[^>]*data-build="([^"]+)"/.exec(html)?.[1];
  const metaBuild=/<meta name="otb-build" content="([^"]+)"/.exec(html)?.[1];
  const appBuild=/\/\* OTB (\d{4}\.\d{2}\.\d{2}\.\d+)/.exec(app)?.[1];
  const runtimeBuild=/const BUILD='([^']+)'/.exec(app)?.[1];
  assert.equal(htmlBuild,metaBuild);
  assert.equal(htmlBuild,appBuild);
  assert.equal(htmlBuild,runtimeBuild);
});

test('refresh-now always navigates to a unique URL',()=>{
  assert.match(core,/url\.searchParams\.set\('reload',stamp\)/);
  assert.match(core,/location\.assign\(url\.toString\(\)\)/);
  assert.match(core,/button\.textContent='Refreshing…'/);
});

test('current build identity comes from the HTML that actually loaded',()=>{
  assert.match(core,/const APP_BUILD=document\.documentElement\.dataset\.build\|\|document\.querySelector\('meta\[name="otb-build"\]'\)\?\.content/);
  assert.doesNotMatch(core,/const APP_BUILD='2026\.08\.22\.1'/,
    'a hardcoded old build would recreate the permanent update loop after every successful refresh');
});
