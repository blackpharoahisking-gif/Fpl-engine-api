/* OTB variance propagation v1 — live-season bounded repair.
   --------------------------------------------------------
   Scope:
   - preserve the proven form/official predictive-variance helper unchanged;
   - repair prior/live predictive-mixture variance with one shared disagreement term;
   - centralize multi-GW variance aggregation for Horizon + Discovery;
   - make Schedule captaincy consume the selected Safe/Mean/Upside risk objective;
   - capture a same-state legacy-vs-repaired probe before changing OTB-generated XI fallbacks;
   - make full-15 OTB-generated XI fallbacks use the same risk-aware selector afterwards.

   Deliberately NOT in scope:
   - component covariance or same-team XI covariance;
   - Transfer Planner route-level discounted variance (per-GW sd only is corrected here);
   - Verdict action thresholds;
   - teamPlayed/start-vs-complete semantics.
*/
(function installOtbVariancePropagation(){
  'use strict';

  const VERSION='variance-propagation-v1.1';
  const BASELINE_CORE_BUILD='2026.08.28.1';
  const BUILD='2026.08.29.4';
  const INTERVAL_Z=1.2816;
  const PROBE_KEY='otb-variance-probe-v1';
  const API_BASE_FALLBACK='https://otb-belief-capture.blackpharoahisking.workers.dev';
  const startedAt=Date.now();
  let installed=false,probeBusy=false,probeDone=false,probeTimer=null,archiveRetry=null;
  const legacy={},repaired={};

  const finite=v=>Number.isFinite(Number(v));
  const clone=value=>{
    try{return JSON.parse(JSON.stringify(value))}catch(_){return null}
  };
  function stableValue(value){
    if(Array.isArray(value))return value.map(stableValue);
    if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>{out[key]=stableValue(value[key]);return out},{});
    return value;
  }
  const stableJson=value=>JSON.stringify(stableValue(value));
  function fnv1a(text){let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')}
  async function sha256Text(text){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(text)));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
  const pct=(a,b)=>finite(a)&&finite(b)&&Math.abs(Number(a))>1e-12?Number(b)/Number(a):null;

  function coreReady(){
    return typeof projectFixture==='function'&&typeof project==='function'&&typeof blendVariance==='function'&&
      typeof horizonForecast==='function'&&typeof discoveryForecast==='function'&&typeof bestXIForGw==='function'&&
      typeof renderScheduleCaptain==='function'&&typeof autoXI==='function'&&typeof bumpCache==='function'&&
      typeof S!=='undefined'&&typeof DATA!=='undefined'&&typeof POOL!=='undefined';
  }

  /* This is a mixture of TWO predictive outcome distributions.  The existing
     blendVariance() remains the canonical disagreement primitive and is not
     rewritten: form/official blending therefore stays bit-for-bit on its
     proven semantics.  We only add the two-distribution within-variance term
     here, then delegate mean disagreement to blendVariance(). */
  function predictiveMixtureVariance(vA,vB,w,mA,mB){
    const ww=clamp(num(w),0,1),a=Math.max(0,num(vA)),b=Math.max(0,num(vB));
    if(typeof PREDICTIVE_VARIANCE!=='undefined'&&!PREDICTIVE_VARIANCE)return a*(1-ww)*(1-ww)+b*ww*ww;
    const within=(1-ww)*a+ww*b;
    return blendVariance(within,ww,mA,mB,0);
  }

  /* One aggregation rule for a correlated multi-GW predictive total.  Positive
     weights are supported so a future route-level scorer can reuse this without
     inventing another sigma.  This PR deliberately does not wire it into the
     Transfer Planner route objective. */
  function aggregatePredictiveVariance(rows,weights=null,rhoOverride=null){
    let varSum=0,sdSum=0;
    (rows||[]).forEach((row,i)=>{
      const w=Math.abs(finite(weights?.[i])?Number(weights[i]):1),sd=Math.max(0,num(row?.sd));
      const ws=w*sd;varSum+=ws*ws;sdSum+=ws;
    });
    const rho=rhoOverride==null
      ?(typeof HORIZON_CORRELATION!=='undefined'&&HORIZON_CORRELATION?clamp(num(HORIZON_RHO),0,1):0)
      :clamp(num(rhoOverride),0,1);
    return Math.max(0,varSum+rho*(sdSum*sdSum-varSum));
  }
  const scheduleCaptainUtility=r=>S.risk==='safe'?r.x-.25*r.sd:S.risk==='upside'?r.x+.20*r.sd:r.x;

  function installCoreRepair(){
    if(installed)return;installed=true;
    legacy.projectFixture=projectFixture;
    legacy.horizonForecast=horizonForecast;
    legacy.discoveryForecast=discoveryForecast;
    legacy.renderScheduleCaptain=renderScheduleCaptain;
    legacy.autoXI=autoXI;
    legacy.sources={
      projectFixture:String(projectFixture),horizonForecast:String(horizonForecast),discoveryForecast:String(discoveryForecast),
      renderScheduleCaptain:String(renderScheduleCaptain),autoXI:String(autoXI),blendVariance:String(blendVariance),
    };

    projectFixture=function(pl,fx){
      const ctx=fixtureContext(pl.t,fx),prior=priorFixtureProjection(pl,ctx),live=liveFixtureProjection(pl,ctx),m=num(pl.live?.minutes),evidence=clamp(m/(m+900),0,.78),parts={};
      for(const k of ['app','cs','dc','atk','bon','oth'])parts[k]=prior.parts[k]*(1-evidence)+live.parts[k]*evidence;
      const x=sumParts(parts),variance=predictiveMixtureVariance(prior.variance,live.variance,evidence,prior.x,live.x);
      return{x,parts,variance,ctx,prior,live,evidence,fx};
    };
    repaired.projectFixture=projectFixture;

    horizonForecast=function(pl){
      const key=pl.id+'|'+S.gw+'|'+S.horizon+'|'+S.risk;if(HORIZON_CACHE[key])return HORIZON_CACHE[key];
      let sum=0,confidenceSum=0,n=0,first=null,last=null;const rows=[];
      for(let g=S.gw;g<=38&&n<S.horizon;g++){
        const r=project(pl,g);sum+=r.x;rows.push(r);confidenceSum+=r.confidence;n++;if(first===null)first=g;last=g;
      }
      const totalVar=aggregatePredictiveVariance(rows),total=sum,totalSd=Math.sqrt(totalVar),mean=n?sum/n:0,sd=n?totalSd/n:0,confidence=n?confidenceSum/n:0,
        low=total-INTERVAL_Z*totalSd,high=total+INTERVAL_Z*totalSd,utility=S.risk==='safe'?mean-.25*sd:S.risk==='upside'?mean+.20*sd:mean,
        totalUtility=S.risk==='safe'?total-.25*totalSd:S.risk==='upside'?total+.20*totalSd:total;
      return HORIZON_CACHE[key]={mean,sd,utility,total,totalSd,totalUtility,confidence,low,high,n,first,last};
    };
    repaired.horizonForecast=horizonForecast;

    discoveryForecast=function(p,gws){
      let total=0,confidence=0;const rows=[];
      for(const g of gws){const r=project(p,g);total+=r.x;rows.push(r);confidence+=r.confidence}
      const n=Math.max(1,gws.length),sd=Math.sqrt(aggregatePredictiveVariance(rows)),unavailable=availability(p)<=.001;
      return{total,avg:total/n,sd,floor:unavailable?0:Math.max(0,total-sd),ceiling:unavailable?0:total+sd,confidence:confidence/n,n};
    };
    repaired.discoveryForecast=discoveryForecast;

    renderScheduleCaptain=function(gws){
      const rows=gws.map(g=>{const ranked=POOL.map(p=>({p,r:project(p,g),md:minuteDetail(p)})).filter(x=>x.md.pAppear>.15)
        .sort((a,b)=>scheduleCaptainUtility(b.r)-scheduleCaptainUtility(a.r)||b.r.x-a.r.x),c=ranked[0],v=ranked.find(x=>x.p.id!==c?.p.id);return{g,c,v}});
      document.getElementById('fxCaptain').innerHTML=rows.map(x=>`<div class="captain-row"><span class="cg">GW${x.g}</span><button type="button" data-fxplayer="${x.c?.p.id??''}"><b>${esc(x.c?.p.n||'—')}</b> <span style="color:var(--muted)">${esc(x.c?.p.t||'')}</span></button><button type="button" class="vice-col" data-fxplayer="${x.v?.p.id??''}">${esc(x.v?.p.n||'—')} <span style="color:var(--muted)">${esc(x.v?.p.t||'')}</span></button><span class="cx">${x.c?x.c.r.x.toFixed(1):'—'}</span></div>`).join('')+`<div class="help" style="margin-top:7px">Captaincy ranks the complete OTB projection on the selected ${esc(S.risk||'mean')} risk objective — minutes, availability, role, opponent, venue, form and predictive uncertainty.</div>`;
    };
    repaired.renderScheduleCaptain=renderScheduleCaptain;

    globalThis.__OTB_VARIANCE_MATH__={version:VERSION,predictiveMixtureVariance,aggregatePredictiveVariance,scheduleCaptainUtility};
    bumpCache();
    scheduleFrozenProbe();
  }

  function snapshotUserState(){return{
    squad:[...S.squad],start:[...S.start],benchOrder:[...(S.benchOrder||[])],cap:S.cap,vice:S.vice,capManual:!!S.capManual,viceManual:!!S.viceManual,
    risk:S.risk,horizon:S.horizon,locks:[...S.locks],buildBlocks:[...(S.buildBlocks||[])],
  }}
  function restoreUserState(s){
    S.squad=[...s.squad];S.start=new Set(s.start);S.benchOrder=[...s.benchOrder];S.cap=s.cap;S.vice=s.vice;S.capManual=s.capManual;S.viceManual=s.viceManual;
    S.risk=s.risk;S.horizon=s.horizon;S.locks=new Set(s.locks);S.buildBlocks=new Set(s.buildBlocks);bumpCache();
  }
  function probeEligible(){
    try{return DATA.mode!=='SEED'&&S.squad.length===15&&legal(squadPlayers())&&POOL.length>=300&&Number(S.gw)>=1}catch(_){return false}
  }
  function pinnedSelection(){
    const squad=squadPlayers();
    let start=[...S.start].filter(id=>S.squad.includes(id));
    if(start.length!==11||xiLegality(start)!==null){legacy.autoXI();start=[...S.start]}
    const cap=start.includes(S.cap)?S.cap:start[0],vice=start.includes(S.vice)&&S.vice!==cap?S.vice:start.find(id=>id!==cap);
    return{squad:[...S.squad],start,benchOrder:[...(S.benchOrder||[])],cap,vice};
  }
  function frozenInput(selection,probe){
    const gw=Number(S.gw),fx=fixtureListFor(probe.t,gw),opponents=[...new Set(fx.map(f=>f.opp).filter(Boolean))];
    return{
      baselineCoreBuild:BASELINE_CORE_BUILD,probeRuntimeBuild:BUILD,gw,risk:S.risk,horizon:S.horizon,
      data:{mode:DATA.mode,lastUpdated:DATA.lastUpdated||null,nextEvent:DATA.nextEvent||null,teamPlayed:clone(DATA.teamPlayed),worker:clone(DATA.worker?.meta||null)},
      weights:clone(S.w),overrides:clone(S.overrides),selection,
      probe:{id:probe.id,apiId:probe.apiId??null,n:probe.n,t:probe.t,p:probe.p,c:probe.c,histPts:probe.histPts,histDcPts:probe.histDcPts,histStarts:probe.histStarts,histMinutes:probe.histMinutes,histTeam:probe.histTeam,live:clone(probe.live)},
      teamPeers:POOL.filter(p=>p.t===probe.t).map(p=>({id:p.id,apiId:p.apiId??null,n:p.n,p:p.p,c:p.c,histPts:p.histPts,histStarts:p.histStarts,histMinutes:p.histMinutes,live:clone(p.live)})),
      teams:clone(Object.fromEntries([probe.t,...opponents].filter(t=>TEAMS[t]).map(t=>[t,TEAMS[t]]))),fixtures:clone(fx),
    };
  }
  function setPinned(selection){
    S.squad=[...selection.squad];S.start=new Set(selection.start);S.benchOrder=[...selection.benchOrder];S.cap=selection.cap;S.vice=selection.vice;S.capManual=true;S.viceManual=true;
  }
  function setMode(which){
    if(which==='legacy'){
      projectFixture=legacy.projectFixture;horizonForecast=legacy.horizonForecast;discoveryForecast=legacy.discoveryForecast;renderScheduleCaptain=legacy.renderScheduleCaptain;
    }else{
      projectFixture=repaired.projectFixture;horizonForecast=repaired.horizonForecast;discoveryForecast=repaired.discoveryForecast;renderScheduleCaptain=repaired.renderScheduleCaptain;
    }
    bumpCache();
  }
  function builderSurface(list,gw,risk){
    const old=S.risk;S.risk=risk;bumpCache();const plan=bestXIForGw(list,null,gw),bench=plan?expectedAutosub(plan):null;S.risk=old;bumpCache();
    return plan?{xi:plan.xi.map(o=>o.p.id),xiUtility:plan.xiUtility,xiMean:plan.xiMean,formation:plan.formation,benchOrder:bench?.order?.map(o=>o.p.id)||[]}:null;
  }
  function captureOutputs(selection,probe,mode){
    setMode(mode);setPinned(selection);const gw=Number(S.gw),r=project(probe,gw),list=squadPlayers(),gws=discoveryGameweeks(Math.min(3,Math.max(1,S.horizon||3))),
      hf=horizonForecast(probe),df=discoveryForecast(probe,gws),payload=transferPlannerPayload(),prow=payload.players.find(p=>p.id===probe.id),ctx=verdictContext(),vu=verdictUncertainty(ctx.xi,S.cap,ctx.activeChip),
      plannerGw=prow?.gw?.[gw]||prow?.gw?.[String(gw)]||null;
    return{
      core:{x:r.x,sd:r.sd,width80:2*INTERVAL_Z*r.sd,low:r.low,high:r.high},
      schedule:{risk:S.risk,rankScore:mode==='legacy'?r.x:scheduleCaptainUtility(r),mean:r.x,sd:r.sd},
      builder:{safe:builderSurface(list,gw,'safe'),upside:builderSurface(list,gw,'upside')},
      planner:{gw,mean:plannerGw?.mean??null,sd:plannerGw?.sd??null,utility:plannerGw?.utility??null,note:'per-GW predictive sd only; route-level discounted variance is not repaired in v1'},
      verdict:{xi:[...S.start],captain:S.cap,xiSd:vu?.sd??null,probeVarianceShare:vu?.rows?.find(x=>x.p.id===probe.id)?.share??null},
      horizon:{gws:[hf.first,hf.last],sd:hf.totalSd},discovery:{gws,sd:df.sd},
    };
  }

  async function archiveReport(report){
    try{
      const snapshot={schemaVersion:'otb-belief-event-v0',season:typeof EXPECTED_SEASON!=='undefined'?EXPECTED_SEASON:'2026/27',gw:report.input.gw,
        runtime:{build:BUILD,baselineCoreBuild:BASELINE_CORE_BUILD,varianceVersion:VERSION},variancePropagation:report},snapshotHash=await sha256Text(stableJson(snapshot)),
        id=`variance-${String(report.input.gw).padStart(2,'0')}-${Date.now()}-${crypto.randomUUID()}`,event={schemaVersion:'otb-belief-event-v0',clientVersion:VERSION,capturedAt:new Date().toISOString(),gw:report.input.gw,trigger:'variance-propagation-frozen-probe',diagnostic:true};
      let token='';try{if(typeof freshReviewOwnerToken==='function')token=String(freshReviewOwnerToken()||'').trim()}catch(_){}try{if(!token)token=String(sessionStorage.getItem('otb-belief-capture-key')||'').trim()}catch(_){}
      const headers={'content-type':'application/json','accept':'application/json'};if(token){headers.authorization=`Bearer ${token}`;headers['x-belief-capture-key']=token}
      const res=await fetch(API_BASE_FALLBACK+'/api/belief-capture/v0/events',{method:'POST',headers,body:JSON.stringify({id,snapshotHash,snapshot,event}),cache:'no-store'});
      if(!res.ok)throw new Error(`variance archive HTTP ${res.status}`);report.archive={ok:true,at:new Date().toISOString()};try{localStorage.setItem(PROBE_KEY,JSON.stringify(report))}catch(_){}return true;
    }catch(error){report.archive={ok:false,error:error?.message||String(error),at:new Date().toISOString()};try{localStorage.setItem(PROBE_KEY,JSON.stringify(report))}catch(_){}return false}
  }

  function installRiskAwareAutoXi(){
    if(autoXI!==legacy.autoXI&&autoXI!==repaired.autoXI)return;
    autoXI=function(){
      const list=squadPlayers();
      if(list.length!==15||!legal(list))return legacy.autoXI();
      const plan=bestXIForGw(list,null,S.gw);if(!plan)return legacy.autoXI();
      S.start=new Set(plan.xi.map(o=>o.p.id));
      const outfieldBench=plan.benchRows.filter(o=>o.p.p!=='GK'),bench=outfieldBench.length===3?expectedAutosub(plan):null;
      if(bench?.order?.length===3)S.benchOrder=bench.order.map(o=>stableKey(o.p));
      const rank=plan.xi.slice().sort((a,b)=>b.x-a.x);
      if(!S.capManual||!S.start.has(S.cap))S.cap=rank[0]?.p.id??null;
      if(!S.viceManual||!S.start.has(S.vice)||S.vice===S.cap)S.vice=rank.find(o=>o.p.id!==S.cap)?.p.id??null;
    };
    repaired.autoXI=autoXI;
  }

  async function runFrozenProbe(){
    if(probeBusy||probeDone||!probeEligible())return false;probeBusy=true;const saved=snapshotUserState();
    try{
      const selection=pinnedSelection();setPinned(selection);bumpCache();
      const squad=squadPlayers(),probe=[...squad].map(p=>({p,r:project(p,S.gw)})).sort((a,b)=>b.r.sd-a.r.sd||b.r.x-a.r.x)[0]?.p;if(!probe)throw new Error('no probe player');
      const input=frozenInput(selection,probe),inputHash=fnv1a(stableJson(input));
      const baseline=captureOutputs(selection,probe,'legacy'),post=captureOutputs(selection,probe,'repaired');
      const report={version:VERSION,capturedAt:new Date().toISOString(),inputHash,input,baseline,post,movement:{
        coreSd:pct(baseline.core.sd,post.core.sd),coreWidth80:pct(baseline.core.width80,post.core.width80),plannerGwSd:pct(baseline.planner.sd,post.planner.sd),
        verdictXiSd:pct(baseline.verdict.xiSd,post.verdict.xiSd),horizonSd:pct(baseline.horizon.sd,post.horizon.sd),discoverySd:pct(baseline.discovery.sd,post.discovery.sd),
        scheduleRankDelta:post.schedule.rankScore-baseline.schedule.rankScore,
      },interpretation:'Movement ratios show propagation only. Component covariance, same-team XI covariance, Planner route-level variance and Verdict action thresholds remain out of scope.'};
      globalThis.__OTB_VARIANCE_PROPAGATION__=report;try{localStorage.setItem(PROBE_KEY,JSON.stringify(report))}catch(_){}
      document.dispatchEvent(new CustomEvent('otb:variance-propagation-probe',{detail:{version:VERSION,inputHash,movement:report.movement}}));
      probeDone=true;void archiveReport(report).then(ok=>{if(!ok&&!archiveRetry)archiveRetry=setTimeout(()=>{archiveRetry=null;void archiveReport(report)},5*60*1000)});
      return true;
    }catch(error){console.error('OTB variance frozen probe failed',error);return false}
    finally{setMode('repaired');restoreUserState(saved);if(probeDone)installRiskAwareAutoXi();probeBusy=false}
  }
  function scheduleFrozenProbe(){
    clearInterval(probeTimer);probeTimer=setInterval(()=>{if(probeDone){clearInterval(probeTimer);return}void runFrozenProbe()},1500);
    setTimeout(()=>void runFrozenProbe(),250);
  }

  globalThis.__OTB_VARIANCE_PROPAGATION_STATUS__={version:VERSION,baselineCoreBuild:BASELINE_CORE_BUILD,get installed(){return installed},get probeDone(){return probeDone},runFrozenProbe};
  (function wait(){if(coreReady())return installCoreRepair();if(Date.now()-startedAt>30000){console.error('OTB variance propagation: core runtime unavailable');return}setTimeout(wait,50)})();
})();
