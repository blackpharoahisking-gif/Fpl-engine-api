import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../FPL_Engine_OTB.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const block=id=>{const m=html.match(new RegExp(`<script id="${id}" type="text/plain">([\\s\\S]*?)<\\/script>`));assert.ok(m,`${id} missing`);return m[1]};
const source=block('workerCommonSource')+'\n'+block('transferWorkerSource');
const h=Function(`let onmessage;const postMessage=()=>{};${source}\nreturn{cfg,scenarioContext,scoreGw,routeScore,routeRiskSd,routeRiskUtility,planScenario};`)();

function payload({tc=false,bb=false}={}){
  const gws=[1,2],pos=['GK','GK','DEF','DEF','DEF','DEF','DEF','MID','MID','MID','MID','MID','FWD','FWD','FWD'],players=[];
  for(let i=0;i<15;i++){
    const id=i+1,gw={};for(const g of gws){const mean=i===7?8:4,sd=i===7?2:1;gw[g]={mean,baseUtility:mean,utility:mean,pAppear:.92,sd,confidence:80}}
    players.push({id,n:`P${id}`,p:pos[i],t:`T${1+(i%5)}`,c:5,gw})
  }
  return{players,gws,squadIds:players.map(x=>x.id),purchase:Object.fromEntries(players.map(x=>[x.id,5])),bank:0,free:1,maxMoves:1,maxHit:4,threshold:0,lockedIds:[],chips:{wc:[],fh:[],bb:bb?[1]:[],tc:tc?[1]:[]},hybrid:{decay:.9,beamWidth:4,actionsPerState:3,bufferGws:1,useFriction:0,itbValue:0,ftScale:1,stressCandidateLimit:4,riskMode:'safe',riskCoeff:-.25,routeRho:.35},sensitivity:null}
}

test('planner payload separates selection utility from risk-neutral route utility',()=>{
  assert.match(app,/baseUtility:r\.x\+adj/);
  assert.match(app,/riskCoeff=styleRisk==='safe'\?-\.25:styleRisk==='upside'\?\.20:0/);
  assert.match(app,/routeRho:\(typeof HORIZON_CORRELATION/);
});

test('captain variance scales with the square of the scoring multiplier',()=>{
  const raw=payload(),p={...raw,byId:new Map(raw.players.map(x=>[x.id,x]))},ctx=h.scenarioContext(),normal=h.scoreGw(raw.squadIds,1,p,ctx);
  // Captain is P8: XI variance includes captain at 2x, not two independent copies.
  const captain=raw.players[7];assert.equal(normal.captainId,captain.id);
  const baseWithoutCaptain=normal.sd**2-(2*captain.gw[1].sd)**2;
  const rawTc=payload({tc:true}),pTc={...rawTc,byId:new Map(rawTc.players.map(x=>[x.id,x]))},tc=h.scoreGw(rawTc.squadIds,1,pTc,h.scenarioContext());
  assert.ok(Math.abs(tc.sd**2-(baseWithoutCaptain+(3*captain.gw[1].sd)**2))<1e-9);
});

test('discounted route variance uses the shared rho form',()=>{
  const raw=payload(),p={...raw,byId:new Map(raw.players.map(x=>[x.id,x]))},c=h.cfg(raw.hybrid),ctx=h.scenarioContext(),s1=h.scoreGw(raw.squadIds,1,p,ctx),s2=h.scoreGw(raw.squadIds,2,p,ctx),r=h.routeScore(raw.squadIds,0,p,c,ctx),q1=s1.sd,q2=.9*s2.sd,expected=Math.sqrt(q1*q1+q2*q2+.35*((q1+q2)**2-q1*q1-q2*q2));
  assert.ok(Math.abs(r.sd-expected)<1e-9);
  assert.ok(Math.abs(r.utility-(r.baseUtility-.25*r.sd))<1e-9);
});

test('mean route mode remains variance-inert while Safe uses route sd',()=>{
  const raw=payload(),p={...raw,byId:new Map(raw.players.map(x=>[x.id,x]))},mean=h.cfg({...raw.hybrid,riskMode:'mean',riskCoeff:0}),safe=h.cfg(raw.hybrid),a=h.routeScore(raw.squadIds,0,p,mean,h.scenarioContext()),b=h.routeScore(raw.squadIds,0,p,safe,h.scenarioContext());
  assert.equal(a.utility,a.baseUtility);
  assert.ok(b.utility<b.baseUtility);
  assert.ok(b.sd>0);
});

test('primary route result exposes route uncertainty and risk semantics',()=>{
  const raw=payload(),r=h.planScenario(raw,raw.hybrid,false);
  assert.ok(Number.isFinite(r.routeSd)&&r.routeSd>0);
  assert.equal(r.routeRisk.mode,'safe');
  assert.equal(r.routeRisk.coefficient,-.25);
  assert.equal(r.routeRisk.rho,.35);
  assert.match(source,/objective:routeRiskUtility\(n\.baseCumulative,n\.varSum,n\.sdSum,c\)/);
  assert.match(source,/return routeRiskUtility\(base,varSum,sdSum,c\)\+ftValue/);
});
