/* OTB market projection sync — global lifecycle bridge.
   The core projection maths already blends a fresh, matched market record for
   every player through fixtureContext(). The defect fixed here is lifecycle:
   low-power/mobile sessions previously fetched the market only while Verdict
   or Model vs Market was active, so Players/Squad could remain model-only.

   This bridge keeps the tiny cached market payload hydrated as a projection
   input regardless of the active tab. It does not change market weights,
   fixture ratings, player maths, or any club-specific value. */
(function installOtbMarketProjectionSync(){
  const READY_TIMEOUT_MS=20000;
  const HOURLY_MS=60*60*1000;
  const ACTIVE_MAX_AGE_MIN=55;
  const RESUME_MAX_AGE_MIN=120;
  const startedAt=Date.now();
  let intervalId=null;

  function runtimeReady(){
    return typeof loadMarketData==='function'
      &&typeof marketAgeMinutes==='function'
      &&typeof marketActive==='function'
      &&typeof fixtureContext==='function'
      &&typeof render==='function'
      &&typeof MARKET!=='undefined'
      &&typeof MARKET_SUSPEND!=='undefined'
      &&typeof MARKET_LEAGUE_XG!=='undefined';
  }

  function isLowPower(){
    try{return typeof lowPowerMode==='function'&&!!lowPowerMode()}
    catch(_){return false}
  }

  function refreshDue(maxAgeMin){
    try{
      const age=marketAgeMinutes();
      return !Number.isFinite(age)||age>maxAgeMin;
    }catch(_){return true}
  }

  function marketPropagationAudit(){
    if(!runtimeReady()||!marketActive()||MARKET_SUSPEND){
      return{ok:false,skipped:true,reason:'market inactive or temporarily suspended',checked:0,applied:0,changed:0,eligible:0,failures:[]};
    }
    const previousSuspend=MARKET_SUSPEND;
    let checked=0,applied=0,changed=0,eligible=0;
    const failures=[];
    try{
      for(const [key,mkt] of MARKET.byKey.entries()){
        const [team,opp,venue]=String(key).split('|');
        if(!team||!opp||(venue!=='H'&&venue!=='A')){failures.push(`${key}:bad-key`);continue}
        const fx={opp,home:venue==='H'};
        MARKET_SUSPEND=true;
        const base=fixtureContext(team,fx);
        MARKET_SUSPEND=previousSuspend;
        const blended=fixtureContext(team,fx);
        checked++;
        if(blended.marketApplied)applied++;
        else failures.push(`${key}:not-applied`);

        const marketDifferent=
          Math.abs(Number(mkt?.xgFor)-Number(base.attackM)*Number(MARKET_LEAGUE_XG))>1e-6||
          Math.abs(Number(mkt?.xgAgainst)-Number(base.lambdaAgainst))>1e-6||
          Math.abs(Number(mkt?.pCS)-Number(base.pCS))>1e-6;
        if(!marketDifferent)continue;
        eligible++;
        const contextDifferent=
          Math.abs(Number(blended.attackM)-Number(base.attackM))>1e-9||
          Math.abs(Number(blended.lambdaAgainst)-Number(base.lambdaAgainst))>1e-9||
          Math.abs(Number(blended.pCS)-Number(base.pCS))>1e-9||
          Math.abs(Number(blended.dAtk)-Number(base.dAtk))>1e-9||
          Math.abs(Number(blended.dCS)-Number(base.dCS))>1e-9;
        if(contextDifferent)changed++;
        else failures.push(`${key}:no-context-change`);
      }
    }catch(err){
      failures.push(`audit:${String(err?.message||err)}`);
    }finally{
      MARKET_SUSPEND=previousSuspend;
    }
    const result={
      ok:checked>0&&applied===checked&&changed===eligible&&failures.length===0,
      skipped:false,checked,applied,changed,eligible,failures,
      generatedAt:new Date().toISOString()
    };
    globalThis.__OTB_MARKET_PROPAGATION_AUDIT__=result;
    try{
      if(typeof pipelineEvent==='function')pipelineEvent(
        'MARKET-PROJECTION',result.ok?'ok':'warn',
        result.ok
          ?`${applied}/${checked} priced team-sides applied to fixtureContext`
          :`${applied}/${checked} applied · ${changed}/${eligible} material contexts changed · ${failures.slice(0,3).join(', ')}`
      );
    }catch(_){}
    return result;
  }

  async function refreshProjectionMarket(reason,{force=false,maxAgeMin=ACTIVE_MAX_AGE_MIN}={}){
    if(!runtimeReady()||navigator.onLine===false||document.visibilityState==='hidden')return false;
    if(!force&&!refreshDue(maxAgeMin))return false;
    let ok=false;
    try{ok=await loadMarketData()}
    catch(err){console.warn('OTB projection market refresh failed',reason,err);return false}
    if(!ok){
      /* Another caller may already own the same tiny fetch. Retry once it
         releases rather than leaving a mobile session model-only for an hour. */
      if(MARKET.loading)setTimeout(()=>void refreshProjectionMarket(`${reason}-retry`,{maxAgeMin}),700);
      return false;
    }
    marketPropagationAudit();
    try{render({deferPool:isLowPower()})}
    catch(err){console.warn('OTB market refresh render skipped',err)}
    return true;
  }

  function start(){
    if(intervalId!==null)return;
    /* Desktop core already schedules an eager market fetch. Mobile/low-power
       did not, which was the defect. Give desktop its existing path a short
       head start; the backstop only fires if that path did not hydrate. */
    if(isLowPower())void refreshProjectionMarket('startup-low-power',{force:true});
    else setTimeout(()=>void refreshProjectionMarket('startup-backstop',{maxAgeMin:5}),5000);

    intervalId=setInterval(()=>void refreshProjectionMarket('hourly',{maxAgeMin:ACTIVE_MAX_AGE_MIN}),HOURLY_MS);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')void refreshProjectionMarket('resume',{maxAgeMin:RESUME_MAX_AGE_MIN});
    });
    window.addEventListener('online',()=>void refreshProjectionMarket('online',{force:true}));
  }

  function waitForCore(){
    if(runtimeReady()){start();return}
    if(Date.now()-startedAt>=READY_TIMEOUT_MS){
      console.warn('OTB market projection sync could not find the core runtime');
      return;
    }
    setTimeout(waitForCore,50);
  }

  globalThis.__otbRefreshProjectionMarket=refreshProjectionMarket;
  globalThis.__otbAuditMarketPropagation=marketPropagationAudit;
  waitForCore();
})();
