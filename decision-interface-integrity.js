/* OTB decision-interface integrity — 2026.08.27.1
   ---------------------------------------------------------------
   Display/decision-routing only. No projection, minutes, DefCon, market-weight,
   fixture or scoring formula is changed here.

   - Market disagreement remains an Evidence diagnostic, not an unpriced action.
   - Same-player role/minutes signals are one queue item; exposure is never summed.
   - Rotation exposure publishes the exact current formula.
   - Free Hit estimates based on a nominal bench reserve are labelled provisional.
   - Calibration waiting for 3 GWs is structural, not a degraded feed penalty.
   - Market copy distinguishes pre-blend gaps from the 50% applied blend.
   - Captain variance and headline SD labels state the quantity actually shown.
   - Since-acknowledgement drift closes with an explicit remainder line.
*/
(function installDecisionInterfaceIntegrity(){
  'use strict';
  const VERSION='2026.08.27.1',READY_TIMEOUT_MS=20000,startedAt=Date.now(),ACK_KEY='otb-verdict-ack-v2';let installed=false;
  const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const sevRank={block:0,act:1,watch:2};

  function runtimeReady(){return typeof verdictQueue==='function'&&typeof verdictReadiness==='function'&&typeof renderVerdict==='function'&&typeof verdictFeeds==='function'&&typeof verdictContext==='function'&&typeof byId==='function'}
  function riskFormulaNote(item,ctx){
    if(!String(item?.id||'').startsWith('risk_'))return item;
    const id=Number(item.playerId||String(item.id).slice(5)),row=(ctx?.rows||[]).find(o=>Number(o?.p?.id)===id),risk=(ctx?.risk||[]).find(r=>Number(r?.p?.id)===id);
    if(!row||!risk)return item;
    const av=clamp(n(risk.avail,1),0,1),xp=Math.max(0,n(row?.r?.x)),mins=Math.max(0,n(risk.exp)),availabilityTerm=xp*(1-av),rotationTerm=mins<60?xp*.15:0;
    const formula=`Exposure formula: ${xp.toFixed(2)} xP × (1−${Math.round(av*100)}% availability)${mins<60?` + ${xp.toFixed(2)} × 15% rotation allowance because xMins < 60`:''} = ${(availabilityTerm+rotationTerm).toFixed(2)} xP.`;
    return {...item,evidence:`${item.evidence}<div class="vq-formula">${formula}</div>`};
  }
  function provisionalChip(item){
    if(!String(item?.id||'').startsWith('chip_FH'))return item;
    const text=String(item.evidence||'');
    if(!/nominal bench reserve|not a fully solved legal 15/i.test(text))return item;
    return {...item,title:`${item.title} · PROVISIONAL`,evidence:`<b>PROVISIONAL:</b> alternative XI estimate; a complete legal 15 has not been solved. ${text}`};
  }
  function mergePlayerSignals(items){
    const out=[],byPlayer=new Map;
    for(const raw of items){const item={...raw};if(!item.playerId){out.push(item);continue}
      const key=String(item.playerId),prior=byPlayer.get(key);if(!prior){byPlayer.set(key,item);out.push(item);continue}
      const priorIndex=out.indexOf(prior),prefer=(sevRank[item.severity]??2)<(sevRank[prior.severity]??2)||((sevRank[item.severity]??2)===(sevRank[prior.severity]??2)&&n(item.cost)>n(prior.cost));
      const base=prefer?item:prior,other=prefer?prior:item,p=byId(Number(key));
      const ids=[...(base.relatedIds||[base.id]),...(other.relatedIds||[other.id])];
      const merged={...base,id:`combined_${key}`,relatedIds:[...new Set(ids)],cost:Math.max(n(base.cost),n(other.cost)),title:`${p?.n||String(base.title).split(' — ')[0]} — combined role/minutes signal`,evidence:`${base.evidence}<div class="vq-related"><b>Related signal:</b> ${other.evidence}</div><div class="vq-related-note">Same-player evidence · expected-points exposure is counted once, using the larger standalone estimate rather than summing overlapping costs.</div>`};
      out[priorIndex]=merged;byPlayer.set(key,merged);
    }
    return out;
  }
  function patchedQueue(core,ctx){
    let items=(core.call(this,ctx)||[]).filter(i=>!['mktdiv','mktoff'].includes(String(i?.id||'')));
    items=items.map(i=>provisionalChip(riskFormulaNote(i,ctx)));
    items=mergePlayerSignals(items);
    items.sort((a,b)=>(sevRank[a.severity]??2)-(sevRank[b.severity]??2)||n(b.cost)-n(a.cost));
    return items;
  }
  function patchedReadiness(core,ctx){
    const result=core.call(this,ctx);if(!result?.parts)return result;
    const part=result.parts.find(p=>p.k==='Feed integrity');if(!part)return result;
    const feeds=verdictFeeds(),eligible=feeds.filter(f=>!(f.key==='accuracy'&&typeof verdictCalibration==='function'&&!verdictCalibration()));
    const bad=eligible.filter(f=>f.state==='fail'),warn=eligible.filter(f=>f.state==='warn'||f.state==='cached');
    part.got=Math.round(clamp(20-bad.length*10-warn.length*3,0,20));part.max=20;
    part.note=bad.length?`${bad.length} actionable feed(s) failed`:warn.length?`${warn.length} actionable feed(s) degraded or cached`:'all actionable feeds current';
    const got=result.parts.reduce((a,p)=>a+n(p.got),0),max=result.parts.reduce((a,p)=>a+n(p.max),0);
    return {...result,got,max,score:Math.round(100*got/max)};
  }
  function patchMarketCopy(){
    const host=document.getElementById('verdictIntel');if(!host)return;
    for(const el of host.querySelectorAll('.vint-n')){const text=String(el.textContent||'');if(/Matching fixtures blend .* so these are residual disagreements/i.test(text)){
      el.textContent=text.replace(/Matching fixtures blend (\d+)% of the market view, so these are residual disagreements\./i,'These are pre-blend model/market gaps; the 15% alert threshold is applied to that raw disagreement. Matching fixtures then blend $1% of the market view before player projections are produced.');
    }}
  }
  function patchVarianceCopy(){
    const unc=document.querySelector('#verdictReadiness .vrd-unc');if(unc&&/has the armband, which doubles it/i.test(unc.textContent||''))unc.innerHTML=unc.innerHTML.replace(/and he has the armband, which doubles it/i,'captaincy doubles his points exposure and quadruples his variance contribution');
    for(const band of document.querySelectorAll('.vh-band')){const m=String(band.textContent||'').match(/±\s*([0-9.]+)/);if(m)band.textContent=`projection SD ${m[1]} xP`}
  }
  function patchQueueHeader(){const h=document.querySelector('#verdictActions .vsec-h span');if(h)h.textContent='ranked by expected points at stake · diagnostics live in Evidence'}
  function patchDriftReconciliation(){
    const gov=globalThis.__OTB_GOVERNANCE__,box=document.querySelector('#verdictChanges .vchg');if(!gov||!box)return;
    box.querySelectorAll('.vchg-remainder').forEach(el=>el.remove());
    let prev;try{prev=JSON.parse(localStorage.getItem(ACK_KEY)||'null')}catch{return}if(!prev)return;
    let ctx,cur,d;try{ctx=verdictContext();cur=gov.snapshot(ctx);d=gov.diff(prev,cur)}catch{return}
    if(d?.initial||prev.gw!==cur.gw||Math.abs(n(d.xiDelta))<.01)return;
    const shown=(d.players||[]).slice(0,5).filter(x=>x.inXi),shownRaw=shown.reduce((s,x)=>s+n(x.dx),0),remainder=n(d.xiDelta)-shownRaw;
    if(Math.abs(remainder)<.01)return;
    const row=document.createElement('div');row.className=`vchg-row vchg-remainder ${remainder>=0?'vchg-up':'vchg-down'}`;
    row.innerHTML=`<span class="vchg-ar">${remainder>=0?'↑':'↓'}</span><span><b>Other XI/captain movement ${remainder>=0?'+':''}${remainder.toFixed(2)} xP</b> — closes the XI-total reconciliation; includes captain multiplier, selection effects and sub-threshold XI changes not itemised above.</span>`;
    box.appendChild(row);
  }
  function postProcess(){patchMarketCopy();patchVarianceCopy();patchQueueHeader();patchDriftReconciliation()}

  function install(){
    if(installed||!runtimeReady())return false;installed=true;
    const coreQueue=verdictQueue,coreReadiness=verdictReadiness,coreRender=renderVerdict;
    verdictQueue=function(ctx){return patchedQueue(coreQueue,ctx)};
    verdictReadiness=function(ctx){return patchedReadiness(coreReadiness,ctx)};
    renderVerdict=function(...args){const out=coreRender.apply(this,args);postProcess();return out};
    const style=document.createElement('style');style.textContent='.vq-formula,.vq-related-note{margin-top:5px;color:var(--muted);font-size:9px;line-height:1.45}.vq-related{margin-top:6px;padding-top:5px;border-top:1px solid var(--line)}';document.head.appendChild(style);
    try{renderVerdict()}catch(_){postProcess()}
    globalThis.__OTB_DECISION_INTERFACE_INTEGRITY__={version:VERSION,mergePlayerSignals,postProcess};
    return true;
  }
  function wait(){if(runtimeReady()){install();return}if(Date.now()-startedAt<READY_TIMEOUT_MS)setTimeout(wait,80);else console.warn('OTB decision-interface integrity layer could not find Verdict runtime')}
  wait();
})();
