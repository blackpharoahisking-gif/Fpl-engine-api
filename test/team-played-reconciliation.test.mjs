import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const app=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const bridge=readFileSync(new URL('../app.js',import.meta.url),'utf8');

function extractFunction(name){
  const start=app.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`${name} must exist`);
  const brace=app.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<app.length;i++){
    if(app[i]==='{')depth++;
    else if(app[i]==='}'&&--depth===0)return app.slice(start,i+1);
  }
  throw new Error(`${name} was not balanced`);
}

const countsSource=extractFunction('fixtureCountsTowardTeamPlayed');
const fixtureCountsTowardTeamPlayed=Function(`"use strict";return (${countsSource})`)();

test('a started fixture counts as a team game before FPL marks it finished',()=>{
  assert.equal(fixtureCountsTowardTeamPlayed({started:true,finished:false}),true);
});

test('scheduled fixtures do not count and finished fixtures count only once',()=>{
  assert.equal(fixtureCountsTowardTeamPlayed({started:false,finished:false}),false);
  assert.equal(fixtureCountsTowardTeamPlayed({started:false,finished:true}),true);
  assert.equal(fixtureCountsTowardTeamPlayed({started:true,finished:true}),true);
});

test('applyFixtures uses the reconciled started-or-finished definition for both clubs',()=>{
  const source=extractFunction('applyFixtures');
  assert.match(source,/if\(fixtureCountsTowardTeamPlayed\(f\)\)/);
  assert.match(source,/played\[h\]=\(played\[h\]\|\|0\)\+1/);
  assert.match(source,/played\[a\]=\(played\[a\]\|\|0\)\+1/);
  assert.doesNotMatch(source,/if\(f\.finished\)/,
    'teamPlayed must not wait for FPL\'s lagging finished flag');
});

test('final-result paths remain finished-only',()=>{
  const playerLocked=bridge.match(/const playerLocked=\(p,gw\)=>\{[\s\S]*?\n  \};/);
  assert.ok(playerLocked,'playerLocked must exist in the live-points bridge');
  assert.match(playerLocked[0],/f\.finished/,
    'the teamPlayed correction must not mark live player scores final');
  assert.doesNotMatch(playerLocked[0],/f\.started/,
    'autosubs and final scoring must still wait for finished fixtures');
});
