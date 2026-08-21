/* OTB 2026.08.21.3 — live GW points + public team import bridge.
   The production application remains byte-for-byte in app-core.js. This file
   loads it first, then adds a display-only live-points layer. Projection maths,
   optimiser state, role intelligence and Verdict logic are not changed here.
   2026.08.21.3: the Import Team control was correctly wired all along
   (app-core.js:btnImportFplTeam) but lived only inside Engine > Build, which
   is not where a Squad-tab user goes looking for it. Added a matching
   quick-action card ("Import team") to the Squad tab's qf-grid that jumps
   there and focuses the field — same pattern as the existing News jump. */
(function loadOtbCore(){
  const script=document.createElement('script');
  script.src='app-core.js?v=2026.08.21.1-core';
  script.async=false;
  script.onload=()=>{
    try{installOtbLivePointsPatch()}
    catch(err){console.error('OTB live-points patch failed',err)}
  };
  script.onerror=()=>console.error('OTB core app failed to load');
  (document.body||document.documentElement).appendChild(script);
})();

function installOtbLivePointsPatch(){
  if(typeof cardHTML!=='function'||typeof renderSpine!=='function'||typeof actualRowsFromPayload!=='function'){
    throw new Error('OTB core runtime was not ready');
  }

  const BUILD='2026.08.21.3';
  const SCORE_KEY='otb-score-view-v1';
  const TEAM_ID_KEY='otb-fpl-team-id-v1';
  const LIVE={gw:0,rows:new Map(),loadedAt:0,loading:false,error:''};
  let scoreMode='auto';
  try{const saved=localStorage.getItem(SCORE_KEY);if(['auto','expected','actual'].includes(saved))scoreMode=saved}catch(_){ }

  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge){badge.textContent='BUILD 08.21.3';badge.title='OTB live GW points + team import bridge';}

  const teamIdInput=document.getElementById('fplTeamId');
  if(teamIdInput){
    try{const saved=localStorage.getItem(TEAM_ID_KEY);if(saved&&!teamIdInput.value)teamIdInput.value=saved}catch(_){ }
    const remember=()=>{const v=String(teamIdInput.value||'').trim();try{if(v)localStorage.setItem(TEAM_ID_KEY,v)}catch(_){ }};
    teamIdInput.addEventListener('change',remember);
    document.getElementById('btnImportFplTeam')?.addEventListener('click',remember,{capture:true});
  }

  document.getElementById('btnJumpImport')?.addEventListener('click',()=>{
    document.querySelector('.tabs button[data-t="build"]')?.click();
    if(matchMedia('(max-width:1080px)').matches)document.querySelector('.mobile-tabs button[data-m="rail"]')?.click();
    const card=document.getElementById('teamImportCard');
    card?.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>document.getElementById('fplTeamId')?.focus(),120);
  });

  const eventForGw=gw=>(Array.isArray(EVENTS)?EVENTS:[]).find(e=>Number(e?.id)===Number(gw));
  const deadlineForGw=gw=>Date.parse(eventForGw(gw)?.deadline_time||'');
  const deadlinePassed=gw=>{const t=deadlineForGw(gw);return Number.isFinite(t)&&Date.now()>=t};
  const selectedGwView=()=>S.display!=='total';
  const actualRequested=()=>selectedGwView()&&deadlinePassed(S.gw)&&scoreMode!=='expected';
  const actualReady=()=>actualRequested()&&LIVE.gw===Number(S.gw)&&LIVE.rows.size>=300;
  const actualForPlayer=p=>{
    if(!actualReady()||p?.apiId==null)return null;
    const row=LIVE.rows.get(Number(p.apiId));
    return row&&Number.isFinite(Number(row.pts))?Number(row.pts):null;
  };

  const displaySelect=document.getElementById('oDisplay');
  if(displaySelect){
    const total=displaySelect.querySelector('option[value="total"]');
    const gw=displaySelect.querySelector('option[value="gw"]');
    if(total)total.textContent='Expected xPts — whole period';
    if(gw)gw.textContent='Selected GW — actual after deadline';
  }

  function ensureScoreControl(){
    if(document.getElementById('gwScoreView'))return;
    const gwSel=document.getElementById('gwSel'),host=gwSel?.parentElement;
    if(!host)return;
    const line=document.createElement('label');
    line.style.cssText='font-size:9px;color:var(--muted);display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:4px';
    line.append(document.createTextNode('Score'));
    const sel=document.createElement('select');
    sel.id='gwScoreView';sel.className='control';sel.style.cssText='width:auto;padding:3px 5px;font-size:9px';
    sel.innerHTML='<option value="auto">Auto</option><option value="expected">Expected xPts</option><option value="actual">GW points</option>';
    sel.value=scoreMode;line.appendChild(sel);host.appendChild(line);
    const status=document.createElement('div');status.id='gwScoreStatus';status.style.cssText='font-size:8px;color:var(--muted);margin-top:3px;max-width:190px;line-height:1.3';host.appendChild(status);
    sel.addEventListener('change',()=>{
      scoreMode=sel.value;
      try{localStorage.setItem(SCORE_KEY,scoreMode)}catch(_){ }
      renderPitch();renderSpine();renderScoreStatus();
      if(actualRequested())refreshLiveGwPoints({force:true});
    });
  }

  function renderScoreStatus(){
    ensureScoreControl();
    const sel=document.getElementById('gwScoreView'),status=document.getElementById('gwScoreStatus');
    if(sel)sel.value=scoreMode;
    if(!status)return;
    if(!selectedGwView()){
      status.textContent=deadlinePassed(S.gw)?'Whole-period view = xPts. Choose Selected GW for live points.':'Whole-period view = expected xPts.';
      return;
    }
    if(scoreMode==='expected'){
      status.textContent=`GW${S.gw} expected xPts selected.`;return;
    }
    if(!deadlinePassed(S.gw)){
      status.textContent=`GW${S.gw} points unlock after the deadline.`;return;
    }
    if(LIVE.loading){status.textContent=`Loading GW${S.gw} official points…`;return;}
    if(actualReady()){
      const age=Math.max(0,Math.floor((Date.now()-LIVE.loadedAt)/60000));
      status.textContent=`GW${S.gw} official points · ${age<1?'live':age+'m old'}`;return;
    }
    status.textContent=LIVE.error?`GW points unavailable · ${LIVE.error}`:`GW${S.gw} official points pending.`;
  }

  async function refreshLiveGwPoints({force=false}={}){
    if(!actualRequested()||navigator.onLine===false)return false;
    if(LIVE.loading)return false;
    if(!force&&LIVE.gw===Number(S.gw)&&LIVE.rows.size>=300&&Date.now()-LIVE.loadedAt<45000)return true;
    const requestedGw=Number(S.gw);
    LIVE.loading=true;LIVE.error='';renderScoreStatus();
    try{
      const payload=await fetchJSON(`${API_BASE}/api/event-live?gw=${requestedGw}`,15000);
      const rows=actualRowsFromPayload(payload);
      if(rows.length<300)throw new Error(`${rows.length} player rows returned`);
      if(Number(S.gw)!==requestedGw)return false;
      LIVE.gw=requestedGw;LIVE.rows=new Map(rows.map(row=>[Number(row.i),row]));LIVE.loadedAt=Date.now();
      requestAnimationFrame(()=>{renderPitch();renderSpine();renderScoreStatus()});
      return true;
    }catch(err){
      LIVE.error=String(err?.message||err);renderScoreStatus();return false;
    }finally{LIVE.loading=false;renderScoreStatus();}
  }

  const projectedCardHTML=cardHTML;
  cardHTML=function(p,benchPos=null){
    let html=projectedCardHTML(p,benchPos);
    if(!actualReady())return html;
    const pts=actualForPlayer(p);if(pts===null)return html;
    if(S.shotMode)return html.replace(/<div class="cstat">[^<]*<\/div>/,`<div class="cstat">${pts}</div>`);
    html=html.replace(/<div class="therm"[^>]*><\/div>/,'');
    return html
      .replace(/<span class="xp-value">[^<]*<\/span><span class="xp-label">[^<]*<\/span>/,`<span class="xp-value">${pts}</span><span class="xp-label">GW${S.gw} pts</span>`)
      .replace(/expected-points details/g,'official GW-points result')
      .replace(/expected-points total/g,'official GW-points result');
  };

  const projectedRenderSpine=renderSpine;
  renderSpine=function(){
    const out=projectedRenderSpine();
    const key=document.querySelector('#spineWrap .spine-key');
    if(!actualReady()){if(key)key.style.display='';return out;}
    const players=squadPlayers(),chip=chipStateForGw(S.gw),scorers=chip.benchScoring?players:players.filter(p=>S.start.has(p.id));
    let sum=0;
    for(const p of scorers){const pts=actualForPlayer(p);if(pts===null)continue;sum+=pts*(p.id===S.cap?chip.captainMultiplier:1);}
    const total=document.getElementById('spineTotal'),head=document.getElementById('hXpts'),label=document.getElementById('hXptsLabel');
    if(total)total.textContent=String(sum);if(head)head.textContent=String(sum);
    const title=`Official FPL GW${S.gw} player points for the selected scoring XI${chip.benchScoring?' plus Bench Boost':''}. Pending autosubs or vice-captain promotion can still change the final FPL team total.`;
    if(label){label.textContent=`${chip.benchScoring?'BB 15':'XI'} GW points`;label.title=title;}
    if(head){head.title=title;head.setAttribute('aria-label',`${title} ${sum} points`);}
    const spine=document.getElementById('spine');if(spine)spine.innerHTML='<div style="width:100%;background:var(--mint)" title="Official FPL GW points"></div>';
    if(key)key.style.display='none';
    return out;
  };

  ensureScoreControl();renderScoreStatus();
  document.getElementById('gwSel')?.addEventListener('change',()=>setTimeout(()=>{LIVE.error='';renderScoreStatus();if(actualRequested())refreshLiveGwPoints({force:true});},0));
  displaySelect?.addEventListener('change',()=>setTimeout(()=>{renderScoreStatus();if(actualRequested())refreshLiveGwPoints({force:true});},0));
  setInterval(()=>{if(actualRequested())refreshLiveGwPoints();},60000);
  if(actualRequested())setTimeout(()=>refreshLiveGwPoints({force:true}),0);
}
