import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');
const helperStart=html.indexOf('function scoutSourceReadCount');
const helperEnd=html.indexOf('function applyScoutReport',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'scout source-read helpers must be present');

const context={
  num:(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback,
  scoutAgeText:()=> '6 hr ago'
};
vm.createContext(context);
vm.runInContext(
  `${html.slice(helperStart,helperEnd)};globalThis.__scoutStatus={scoutSourceReadCount,scoutRetentionMessage};`,
  context
);
const {scoutSourceReadCount,scoutRetentionMessage}=context.__scoutStatus;

test('article read count is independent of evidence authority',()=>{
  const report={
    evidenceAuthoritative:false,
    sourceDocumentsRead:8,
    diagnostics:{articleDocuments:8,aiStatus:'timeout'}
  };
  assert.equal(scoutSourceReadCount(report),8);
  assert.match(scoutRetentionMessage(report),/read 8 current article documents/);
  assert.match(scoutRetentionMessage(report),/role extraction was timeout/);
  assert.doesNotMatch(scoutRetentionMessage(report),/read no article documents/);
});

test('legacy diagnostics still distinguish a true zero-read scan',()=>{
  const legacyRead={diagnostics:{articleDocuments:8,aiStatus:'timeout'}};
  const noRead={diagnostics:{articleDocuments:0,aiStatus:'not-needed'},evidenceNote:'Coverage was incomplete.'};
  assert.equal(scoutSourceReadCount(legacyRead),8);
  assert.equal(scoutSourceReadCount(noRead),0);
  assert.match(scoutRetentionMessage(noRead),/read no article documents/);
});

test('rendered source badge is driven by read count, not evidence authority',()=>{
  assert.match(html,/\$\{readCount\?`<span>\$\{readCount\} article doc/);
  assert.doesNotMatch(html,/\$\{authoritative\?`<span>\$\{readCount\} article doc/);
  assert.match(html,/ROLE EXTRACTION \$\{esc\(aiStatus\.toUpperCase\(\)\)\}/);
  const renderStart=html.indexOf('function renderScoutReport');
  const renderEnd=html.indexOf('\nasync function fetchScoutTeam',renderStart);
  assert.doesNotThrow(()=>new vm.Script(html.slice(renderStart,renderEnd)));
});
