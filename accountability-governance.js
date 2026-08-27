/* OTB decision/accountability governance overlay — no projection maths.
   ---------------------------------------------------------------
   1) Keeps build provenance visible on mobile.
   2) Separates decision changes from projection/model/data movement in Decision Memory.
   3) Replaces render-reset drift with acknowledgement-based drift, including XI total.
   4) Build changes are unconditional drift events.
   5) Publishes the release-freeze state used by the PR gate.
*/
(function installOtbGovernance(){
  'use strict';
  const READY_TIMEOUT_MS=20000,ACK_KEY='otb-verdict-ack-v2';
  const startedAt=Date.now();let installed=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):0;

  function runtimeReady(){return typeof renderVerdict==='function'&&typeof verdictContext==='function'&&typeof project==='function'&&typeof minuteDetail==='function'&&typeof availability==='function'&&typeof byId==='function'&&typeof S!=='undefined'}
  function build(){return String(document.documentElement?.dataset?.build||(typeof APP_BUILD!=='undefined'?APP_BUILD:'')||'').trim()}
  function shortBuild(v){const p=String(v||'').split('.');return p.length>=4?p.slice(1).join('.'):String(v||'—')}
  function currentDeadline(){try{return Number(typeof accuracyDeadline==='function'?accuracyDeadline(S.gw):NaN)}catch{return NaN}}
  function freezeState(){const d=currentDeadline(),ms=Number.isFinite(d)?d-Date.now():NaN,h=Number.isFinite(ms)?ms/36e5:null;let mode='OPEN';if(Number.isFinite(ms)&&ms>0&&ms<=90*60*1000)mode='FULL_FREEZE';else if(Number.isFinite(ms)&&ms>0&&ms<=6*36e5)mode='MODEL_FREEZE';return{mode,deadline:Number.isFinite(d)?new Date(d).toISOString():null,hours:h,breakGlassRequiresDrift:true}}

  function snapshot(ctx){
    const ids=[...new Set((Array.isArray(S.squad)?S.squad:[]).map(Number))],players={};
    for(const id of ids){const p=byId(id);if(!p)continue;const r=project(p,S.gw),md=minuteDetail(p);players[id]={x:+n(r?.x).toFixed(3),pStart:+n(md?.pStart).toFixed(4),avail:+n(availability(p)).toFixed(4),inXi:S.start?.has?.(id)===true}}
    return{at:Date.now(),gw:Number(S.gw),build:build(),xiTotal:+n(ctx?.xiTotal).toFixed(3),captain:Number(S.cap)||null,vice:Number(S.vice)||null,players};
  }
  function loadAck(){try{return JSON.parse(localStorage.getItem(ACK_KEY)||'null')}catch{return null}}
  function saveAck(s){try{localStorage.setItem(ACK_KEY,JSON.stringify(s));return true}catch{return false}}
  function diff(prev,cur){
    if(!prev||prev.gw!==cur.gw)return{initial:true,buildChanged:false,xiDelta:0,players:[]};
    const player=[];for(const [id,b] of Object.entries(cur.players||{})){const a=prev.players?.[id];if(!a)continue;const dx=b.x-a.x,ds=b.pStart-a.pStart,da=b.avail-a.avail;if(Math.abs(dx)>=.10||Math.abs(ds)>=.02||Math.abs(da)>=.05)player.push({id:Number(id),dx,ds,da,inXi:b.inXi})}
    player.sort((a,b)=>Math.abs(b.dx)-Math.abs(a.dx));
    return{initial:false,buildChanged:String(prev.build||'')!==String(cur.build||''),fromBuild:prev.build||'',toBuild:cur.build||'',xiDelta:cur.xiTotal-n(prev.xiTotal),captainChanged:prev.captain!==cur.captain,viceChanged:prev.vice!==cur.vice,players:player};
  }

  function renderDrift(ctx){
    const host=document.getElementById('verdictChanges');if(!host)return;
    const cur=snapshot(ctx);let prev=loadAck();if(!prev||prev.gw!==cur.gw){saveAck(cur);prev=cur}
    const d=diff(prev,cur),rows=[];
    if(d.buildChanged)rows.push(`<div class="vchg-row vchg-new"><span class="vchg-ar">◆</span><span><b>Build changed ${esc(shortBuild(d.fromBuild))} → ${esc(shortBuild(d.toBuild))}</b> — unconditional provenance event; re-check projections regardless of threshold.</span></div>`);
    if(Math.abs(d.xiDelta)>=.05)rows.push(`<div class="vchg-row ${d.xiDelta>=0?'vchg-up':'vchg-down'}"><span class="vchg-ar">${d.xiDelta>=0?'↑':'↓'}</span><span><b>Scoring XI projection ${d.xiDelta>=0?'+':''}${d.xiDelta.toFixed(2)} xP</b> since acknowledgement (${n(prev.xiTotal).toFixed(1)} → ${cur.xiTotal.toFixed(1)}).</span></div>`);
    for(const x of d.players.slice(0,5)){const p=byId(x.id),bits=[];if(Math.abs(x.dx)>=.10)bits.push(`xP ${x.dx>=0?'+':''}${x.dx.toFixed(2)}`);if(Math.abs(x.ds)>=.02)bits.push(`start ${x.ds>=0?'+':''}${Math.round(x.ds*100)}pp`);if(Math.abs(x.da)>=.05)bits.push(`avail ${x.da>=0?'+':''}${Math.round(x.da*100)}pp`);rows.push(`<div class="vchg-row ${x.dx>=0?'vchg-up':'vchg-down'}"><span class="vchg-ar">•</span><span><b>${esc(p?.n||x.id)}</b> ${esc(bits.join(' · '))}${x.inXi?' · XI':''}</span></div>`)}
    const freeze=freezeState();globalThis.__OTB_RELEASE_FREEZE__=freeze;
    const freezeLine=freeze.mode==='FULL_FREEZE'?`<div class="vchg-row vchg-down"><span class="vchg-ar">⛔</span><span><b>T−90m production freeze active.</b> Only [P0-BREAK-GLASS] may deploy; accountability/drift remains mandatory.</span></div>`:freeze.mode==='MODEL_FREEZE'?`<div class="vchg-row vchg-new"><span class="vchg-ar">◇</span><span><b>T−6h model freeze active.</b> Projection/scoring semantics are frozen.</span></div>`:'';
    host.innerHTML=`<div class="vsec-h">Since acknowledgement<span>${rows.length||freezeLine?'unresolved drift':'no unresolved drift'}</span></div>${rows.length||freezeLine?`<div class="vchg">${freezeLine}${rows.join('')}</div>`:`<div class="vchg-note">No build, XI-total or material player drift since the acknowledged reference.</div>`}<div class="vchg-note">Reference: ${new Date(prev.at).toLocaleString()} · build ${esc(shortBuild(prev.build))}. Opening Verdict does not reset it.</div><div style="margin-top:7px"><button type="button" class="btn ghost" id="btnAcknowledgeVerdictDrift">Acknowledge current state</button></div>`;
    const btn=document.getElementById('btnAcknowledgeVerdictDrift');if(btn)btn.onclick=()=>{saveAck(cur);renderDrift(ctx)};
  }

  function decisionDelta(a,b){
    const out=[];if(!a||!b)return out;
    const key=(x,k)=>x?.state?.[k];
    const fmt=x=>x?.n||x?.label||x||'—';
    if(fmt(key(a,'transfer'))!==fmt(key(b,'transfer')))out.push(`transfer ${fmt(key(a,'transfer'))} → ${fmt(key(b,'transfer'))}`);
    if(fmt(key(a,'captain'))!==fmt(key(b,'captain')))out.push(`C ${fmt(key(a,'captain'))} → ${fmt(key(b,'captain'))}`);
    if(fmt(key(a,'vice'))!==fmt(key(b,'vice')))out.push(`VC ${fmt(key(a,'vice'))} → ${fmt(key(b,'vice'))}`);
    if(fmt(key(a,'bench1'))!==fmt(key(b,'bench1')))out.push(`B1 ${fmt(key(a,'bench1'))} → ${fmt(key(b,'bench1'))}`);
    if(fmt(key(a,'chip'))!==fmt(key(b,'chip')))out.push(`chip ${fmt(key(a,'chip'))} → ${fmt(key(b,'chip'))}`);
    return out;
  }
  function patchDecisionMemory(){
    document.querySelectorAll('.dm-build').forEach(el=>{el.style.display='inline';el.style.marginLeft='auto'});
    let entries=[];try{entries=(typeof verdictLoadJournal==='function'?verdictLoadJournal()?.entries:[])||[]}catch(_){return}
    entries=entries.filter(e=>e.gw===S.gw).slice(-8).reverse();const cards=[...document.querySelectorAll('#verdictDecisionMemory .dm-entry')];
    cards.forEach((card,i)=>{const cur=entries[i],older=entries[i+1];if(!cur)return;const decisions=decisionDelta(older,cur),proj=older?n(cur.state?.projectedXI)-n(older.state?.projectedXI):0,buildChanged=older&&String(cur.build||'')!==String(older.build||'');const kind=card.querySelector('.dm-kind');if(kind&&older)kind.textContent=decisions.length?'decision':(buildChanged||Math.abs(proj)>=.05?'model/data':'automatic');let box=card.querySelector('.dm-attribution');if(!box){box=document.createElement('div');box.className='dm-attribution';box.style.cssText='margin-top:6px;padding:6px 7px;border-left:2px solid rgba(4,245,255,.55);font-size:9.5px;line-height:1.45;color:var(--muted)';card.appendChild(box)}const lines=[];if(decisions.length)lines.push(`<b>Decision:</b> ${esc(decisions.join(' · '))}`);else if(older)lines.push('<b>Decision:</b> unchanged');if(older&&Math.abs(proj)>=.005)lines.push(`<b>Projection/data:</b> ${proj>=0?'+':''}${proj.toFixed(2)} xP (${n(older.state?.projectedXI).toFixed(1)} → ${n(cur.state?.projectedXI).toFixed(1)})`);if(buildChanged)lines.push(`<b>Build:</b> ${esc(shortBuild(older.build))} → ${esc(shortBuild(cur.build))} · unconditional provenance break`);if(decisions.length&&Math.abs(proj)>=.05)lines.push('<i>The projection movement is not attributed to the decision change unless a separate counterfactual quantifies it.</i>');box.innerHTML=lines.join('<br>')})
  }
  function patchHealthSemantics(){
    const cells=[...document.querySelectorAll('#verdictHealth .vfeed-cell')];
    for(const cell of cells){const label=String(cell.querySelector('.vf-label')?.textContent||'').trim(),age=cell.querySelector('.vf-age');if(!age)continue;if(label==='Role intel'&&/never/i.test(age.textContent||'')){let active=0;try{active=typeof roleIntelEvents==='function'?roleIntelEvents().length:0}catch(_){}if(active){age.textContent=`${active} saved active`;cell.title='Saved role evidence is active; no fresh role-intel scan has completed in this browser session.'}else{age.textContent='not scanned';cell.title='No active saved role evidence and no role-intel scan completed in this session.'}}else if(label==='Calibration'&&/never/i.test(age.textContent||'')){let gws=0;try{gws=typeof accuracyCompletedGws==='function'?accuracyCompletedGws().length:0}catch(_){}age.textContent=gws<3?`awaiting ${3-gws} GW`:'not run';cell.title='Outcome calibration is separate from role-slot calibration and is withheld until at least three completed Gameweeks.'}else if(label==='Chip plan'&&/never/i.test(age.textContent||'')){age.textContent='state known';cell.title='Chip-plan state is available; this tile does not currently maintain a refresh timestamp.'}}
  }
  function patchFixtureRevisionLabel(){for(const el of document.querySelectorAll('h1,h2,h3,.sechead,.note,.help,summary')){if(/Fixture Influence Diagnostic\s*·\s*RC4\.5\.8/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/\s*·\s*RC4\.5\.8/i,'')}}
  function markOverlappingQueueSignals(){const seen=new Map;for(const link of document.querySelectorAll('#verdictActions [data-vqplayer]')){const id=String(link.getAttribute('data-vqplayer')||''),item=link.closest('.vq-item');if(!id||!item)continue;if(seen.has(id)){let note=item.querySelector('.vq-overlap-note');if(!note){note=document.createElement('div');note.className='vq-overlap-note';note.style.cssText='margin-top:4px;color:var(--muted);font-size:9px';note.textContent='Related signal for the same player · exposure is not added again.';item.appendChild(note)}}else seen.set(id,item)}}

  function postRender(ctx){try{renderDrift(ctx)}catch(e){console.warn('OTB governance drift render skipped',e)}try{patchDecisionMemory()}catch(e){console.warn('OTB governance Decision Memory patch skipped',e)}try{patchHealthSemantics();patchFixtureRevisionLabel();markOverlappingQueueSignals()}catch(e){console.warn('OTB governance semantic patch skipped',e)}}
  function install(){if(installed||!runtimeReady())return false;installed=true;const style=document.createElement('style');style.textContent='@media(max-width:560px){#verdictDecisionMemory .dm-build{display:inline!important}}';document.head.appendChild(style);const coreRender=renderVerdict;renderVerdict=function(...args){const out=coreRender.apply(this,args);let ctx;try{ctx=verdictContext()}catch(_){ctx=null}if(ctx)postRender(ctx);return out};try{const ctx=verdictContext();postRender(ctx)}catch(_){}globalThis.__OTB_GOVERNANCE__={snapshot,diff,freezeState,acknowledge:()=>{const ctx=verdictContext(),s=snapshot(ctx);saveAck(s);renderDrift(ctx);return s}};return true}
  function wait(){if(runtimeReady()){install();return}if(Date.now()-startedAt<READY_TIMEOUT_MS)setTimeout(wait,100)}wait();
})();
