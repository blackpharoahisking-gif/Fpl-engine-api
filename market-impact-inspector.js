/* OTB player market impact inspector — 2026.08.26.6
   ---------------------------------------------------------------
   Explainability only. This layer does not alter market weights, fixture
   strength, scoring, minutes, role probabilities or projection coefficients.
   It evaluates the same player twice: once with the existing market layer
   temporarily suspended, then again with the normal market blend restored.
   The exact counterfactual is shown in the player inspector. */
(function installOtbPlayerMarketImpact(){
  'use strict';
  const VERSION='2026.08.26.6';
  const READY_TIMEOUT_MS=20000;
  const startedAt=Date.now();
  let installed=false;

  function runtimeReady(){
    return typeof inspectPlayer==='function'
      &&typeof project==='function'
      &&typeof fixtureListFor==='function'
      &&typeof fixtureContext==='function'
      &&typeof bumpCache==='function'
      &&typeof byId==='function'
      &&typeof S!=='undefined'
      &&typeof MARKET_SUSPEND!=='undefined'
      &&!!globalThis.__OTB_SCORING_INTEGRITY__;
  }

  function pricedForPlayer(pl,gw){
    if(!pl||MARKET_SUSPEND)return false;
    try{
      if(typeof marketActive==='function'&&!marketActive())return false;
      return fixtureListFor(pl.t,gw).some(fx=>!!fixtureContext(pl.t,fx)?.marketApplied);
    }catch(_){return false}
  }

  function marketMeta(){
    let age=null,weight=null;
    try{if(typeof marketAgeMinutes==='function'){const n=Number(marketAgeMinutes());if(Number.isFinite(n))age=n}}catch(_){}
    try{if(typeof MARKET_WEIGHT!=='undefined'){const n=Number(MARKET_WEIGHT);if(Number.isFinite(n))weight=n}}catch(_){}
    return{ageMinutes:age,weight};
  }

  /* Returns the exact no-market counterfactual while guaranteeing the normal
     market state and normal projection cache are restored before control
     returns to the UI. JavaScript execution is synchronous here, so no other
     render can observe the temporary suspension between these statements. */
  function prepareImpact(pl,gw){
    const meta=marketMeta(),applied=pricedForPlayer(pl,gw);
    if(!applied)return{version:VERSION,applied:false,modelOnly:null,blended:null,delta:null,...meta};

    const previousSuspend=MARKET_SUSPEND;
    let modelOnly=NaN;
    try{
      MARKET_SUSPEND=true;
      bumpCache();
      modelOnly=Number(project(pl,gw)?.x);
    }finally{
      MARKET_SUSPEND=previousSuspend;
      /* Never leave a market-off projection cached after the counterfactual. */
      bumpCache();
    }
    return{version:VERSION,applied:true,modelOnly:Number.isFinite(modelOnly)?modelOnly:null,blended:null,delta:null,...meta};
  }

  function finalizeImpact(impact,pl,gw){
    if(!impact)return null;
    const blended=Number(project(pl,gw)?.x);
    if(!Number.isFinite(blended))return{...impact,blended:null,delta:null};
    if(!impact.applied||!Number.isFinite(Number(impact.modelOnly))){
      return{...impact,blended,delta:impact.applied?null:0};
    }
    return{...impact,blended,delta:blended-Number(impact.modelOnly)};
  }

  function impactMarkup(impact){
    if(!impact)return'';
    const blended=Number(impact.blended),modelOnly=Number(impact.modelOnly),delta=Number(impact.delta);
    const age=Number.isFinite(Number(impact.ageMinutes))?` · ${Math.max(0,Math.round(Number(impact.ageMinutes)))}m old`:'';
    const weight=Number.isFinite(Number(impact.weight))?` · ${(100*Number(impact.weight)).toFixed(0)}% fixture blend`:'';
    if(!impact.applied){
      return `<b>Market impact</b><br><span style="color:var(--muted)">Not applied${age}</span>${Number.isFinite(blended)?`<br><b>Current xPts</b> ${blended.toFixed(2)}`:''}<div style="font-size:9px;color:var(--muted);margin-top:3px;line-height:1.35">No fresh matched market record is affecting this player’s selected-GW fixture context.</div>`;
    }
    if(!Number.isFinite(modelOnly)||!Number.isFinite(blended)||!Number.isFinite(delta)){
      return `<b>Market impact</b><br><span style="color:#FFC107">Applied, but counterfactual unavailable</span>${age}${weight}`;
    }
    const sign=delta>0?'+':'';
    const color=Math.abs(delta)<.005?'var(--muted)':delta>0?'var(--mint)':'#FF6E9E';
    return `<b>Market impact</b><br><span style="color:var(--cyan)">Applied${age}${weight}</span><br><b>Model-only</b> ${modelOnly.toFixed(2)} → <b>blended</b> ${blended.toFixed(2)}<br><b>Impact</b> <span style="color:${color};font-weight:700">${sign}${delta.toFixed(2)} xPts</span>`;
  }

  function patchInspector(impact){
    const modal=document.getElementById('modalBody');
    if(!modal)return;
    modal.querySelector?.('.market-impact-mini')?.remove?.();
    const grid=modal.querySelector?.('.detailgrid');
    if(!grid)return;
    const box=document.createElement('div');
    box.className='mini market-impact-mini';
    box.innerHTML=impactMarkup(impact);
    const blend=[...grid.querySelectorAll('.mini')].find(el=>String(el.querySelector('b')?.textContent||'').trim()==='Blend');
    if(blend?.insertAdjacentElement)blend.insertAdjacentElement('afterend',box);
    else grid.appendChild(box);
  }

  function install(){
    if(installed||!runtimeReady())return false;
    installed=true;
    const coreInspectPlayer=inspectPlayer;

    inspectPlayer=function(id){
      const pl=byId(id);
      let prepared=null;
      if(pl){
        try{prepared=prepareImpact(pl,S.gw)}
        catch(err){console.warn('OTB market-impact counterfactual failed',err)}
      }
      const out=coreInspectPlayer(id);
      if(pl){
        try{
          const impact=finalizeImpact(prepared||{version:VERSION,applied:false,...marketMeta()},pl,S.gw);
          globalThis.__OTB_LAST_PLAYER_MARKET_IMPACT__=impact;
          patchInspector(impact);
        }catch(err){console.warn('OTB market-impact inspector render failed',err)}
      }
      return out;
    };

    globalThis.__OTB_PLAYER_MARKET_IMPACT__={version:VERSION,pricedForPlayer,prepareImpact,finalizeImpact,impactMarkup};
    return true;
  }

  function waitForRuntime(){
    if(runtimeReady()){install();return}
    if(Date.now()-startedAt>=READY_TIMEOUT_MS){console.warn('OTB market-impact inspector could not find the scoring runtime');return}
    setTimeout(waitForRuntime,50);
  }

  waitForRuntime();
})();
