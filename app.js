/* OTB 2026.08.22.1 — live GW points + accurate team-played reconciliation.
   The production application remains byte-for-byte in app-core.js. This file
   loads it first, then adds a display-only live-points layer. Projection maths,
   optimiser state, role intelligence and Verdict logic are not changed here.
   2026.08.21.3: the Import Team control was correctly wired all along
   (app-core.js:btnImportFplTeam) but lived only inside Engine > Build, which
   is not where a Squad-tab user goes looking for it. Added a matching
   quick-action card ("Import team") to the Squad tab's qf-grid that jumps
   there and focuses the field — same pattern as the existing News jump.
   2026.08.21.4: the live path required >=300 rows back from FPL's own
   event-live endpoint before it would show ANY player's actual points — an
   all-or-nothing gate on a magic number. FPL's live endpoint only lists
   elements once their fixture has kicked off, so mid-gameweek (GW1 spans
   most of a week) the true row count sits well under 300 for days, and the
   whole feature stayed dark. This is the same shape of bug as the role-
   intelligence gap Marcus called out earlier: don't gate the WHOLE thing on
   one coarse signal, read what's actually there per player. Fixed the same
   way — actualReady() now only requires that we heard back from the gw
   at all (rows.size>0), and the GW total blends real points for whichever
   scorers have reported with each remaining scorer's own projected xPts
   (same project() call their card already uses), so the number shown is
   always the engine's best current estimate of the final total rather than
   silently undercounting for players who simply haven't kicked off yet.
   The status line and header tooltip say plainly how many of the XI are
   still projected so it's never presented as more final than it is. This
   applies identically to every player, team and gameweek — nothing here is
   keyed to a specific player. The Accuracy/backtesting module's own >=300
   completeness check (app-core.js) is separate and untouched.
   2026.08.21.5: found the actual cause of "22 pts not 27" — importing a
   team left S.start with 15 members ("Set a legal starting XI — 15/11").
   applyImportedFplTeam() (app-core.js) decided the starting XI from
   `multiplier>0 || position<=11`. FPL's picks endpoint keeps `position` as
   the manager's original pre-deadline order forever and instead updates
   `multiplier` to reflect autosubs — 0 for an original starter who didn't
   play and was subbed out, >0 for the bench player subbed in. The OR kept
   both, so any gameweek with an autosub imported more starters than 11,
   and the live total then summed every one of them. Fixed to use
   `position<=11` alone, with a self-heal via autoXI() if that's ever not
   exactly 11 — app-core.js was edited for this because it's a genuine
   defect in the import logic itself, not a display concern for this
   patch layer. The core file's cache-bust query is bumped to .2-core so
   returning users actually get it.
   2026.08.21.6: closes the gap the .4 tooltip disclosed — the live total
   now actually applies FPL's real autosub and vice-captain-promotion
   rules instead of a flat sum of the nominal starting XI, so it can match
   FPL's own total once a gameweek settles, not just approximate it.
   A player only counts as "confirmed not played" once their OWN fixture
   has finished (fixtureListFor, already used for congestion) AND they
   show 0 minutes — never from a mid-match snapshot, so nobody is subbed
   out prematurely just because a match is still being played. A bench
   player only counts as an eligible substitute once they show >0 minutes
   — that reading is irreversible the moment it appears, so it doesn't
   need to wait on their own match finishing. Which bench players actually
   come on, in what order, and whether the formation stays legal, reuses
   the SAME selectAutosubs()/orderedOutfieldBench() the projection engine
   already uses for expected autosub value (app-core.js) — one algorithm,
   fed real per-player minutes instead of appearance probabilities, not a
   second reimplementation that could quietly drift from the first.
   Captain promotion: if the captain's own fixture has finished with 0
   minutes, the chip-aware multiplier (2x, or 3x under Triple Captain)
   moves to the vice-captain's own points, whatever they are — matching
   FPL's rule that the armband itself transfers, not just a fixed bonus.
   Bench Boost is unaffected (autosubs don't apply when the whole 15
   already scores). A scorer is only "final" once BOTH we have their
   actual points AND their own fixture has finished — anything else
   (no data yet, or a live number from a match still in progress) is
   still counted toward the total using the best number available, but
   folded into "still to finalize" so the total is never shown as more
   settled than it is; the previous .4 flow only checked for missing data,
   not for a still-live match.
   2026.08.22.1: DATA.teamPlayed now counts an official fixture once it is
   started OR finished. FPL updates cumulative player starts and minutes
   during the match, but its finished flag can lag behind; counting only
   finished fixtures created the impossible starts=1 / teamPlayed=0 state
   that over-inflated the individual prior before role calibration. Final
   scores, autosubs and playerLocked() still require finished, so this does
   not settle live matches early. */
(function loadOtbCore(){
  const script=document.createElement('script');
  script.src='app-core.js?v=2026.08.22.1-core';
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

  const BUILD='2026.08.22.1';
  const SCORE_KEY='otb-score-view-v1';
  const TEAM_ID_KEY='otb-fpl-team-id-v1';
  const LIVE={gw:0,rows:new Map(),loadedAt:0,loading:false,error:''};
  let scoreMode='auto';
  try{const saved=localStorage.getItem(SCORE_KEY);if(['auto','expected','actual'].includes(saved))scoreMode=saved}catch(_){ }

  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge){badge.textContent='BUILD 08.22.1';badge.title='OTB accurate team-played reconciliation';}

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
  const actualReady=()=>actualRequested()&&LIVE.gw===Number(S.gw)&&LIVE.rows.size>0;
  const actualForPlayer=p=>{
    if(!actualReady()||p?.apiId==null)return null;
    const row=LIVE.rows.get(Number(p.apiId));
    return row&&Number.isFinite(Number(row.pts))?Number(row.pts):null;
  };
  const projectedForPlayer=p=>{try{const r=project(p,S.gw);return Number.isFinite(r?.x)?r.x:0}catch(_){return 0}};

  /* A player's own involvement for the gameweek is only settled once their
     own fixture has finished — never from a mid-match snapshot. Reuses the
     same fixture data already driving the congestion calendar. */
  const playerLocked=(p,gw)=>{
    if(!p)return false;
    try{
      const fx=(typeof fixtureListFor==='function')?fixtureListFor(p.t,gw):[];
      return fx.length>0&&fx.every(f=>!!f.finished);
    }catch(_){return false}
  };
  const liveMinutes=p=>{
    if(p?.apiId==null)return null;
    const row=LIVE.rows.get(Number(p.apiId));
    return row&&Number.isFinite(Number(row.min))?Number(row.min):null;
  };
  const liveMinutesOrZero=p=>{const m=liveMinutes(p);return m===null?0:m};

  /* Decides the actual scoring XI for the gameweek: who was subbed out,
     who came on, whether the captain armband moved to the vice-captain.
     Reuses selectAutosubs()/orderedOutfieldBench() from app-core.js — the
     same functions the projection engine already uses for expected
     autosub value — fed real per-player minutes instead of appearance
     probabilities, so there is one autosub algorithm, not two that could
     quietly disagree. */
  function resolveActualLineup(){
    const gw=S.gw,chip=chipStateForGw(gw),squad=squadPlayers();
    if(chip.benchScoring)return finalizeCaptain(squad,gw,chip,{gkSwapped:false,subsInCount:0,unfilledSubCount:0});
    const starters=squad.filter(p=>S.start.has(p.id));
    const benchGK=squad.find(p=>!S.start.has(p.id)&&p.p==='GK')||null;
    const benchOutfieldRaw=squad.filter(p=>!S.start.has(p.id)&&p.p!=='GK');
    const benchOutfield=(typeof orderedOutfieldBench==='function')?orderedOutfieldBench(benchOutfieldRaw):benchOutfieldRaw;
    const startGK=starters.find(p=>p.p==='GK')||null;
    const startOutfield=starters.filter(p=>p.p!=='GK');

    let finalGK=startGK,gkSwapped=false;
    if(startGK&&playerLocked(startGK,gw)&&liveMinutesOrZero(startGK)===0&&benchGK){finalGK=benchGK;gkSwapped=true}

    const failed=startOutfield.filter(p=>playerLocked(p,gw)&&liveMinutesOrZero(p)===0);
    const kept=startOutfield.filter(p=>!failed.includes(p));
    const baseCounts={DEF:0,MID:0,FWD:0};
    kept.forEach(p=>baseCounts[p.p]++);
    const appeared=benchOutfield.filter(p=>{const m=liveMinutes(p);return m!==null&&m>0});
    let subsInPlayers=[];
    if(failed.length&&typeof selectAutosubs==='function'){
      subsInPlayers=selectAutosubs(baseCounts,failed.length,appeared.map(p=>({p}))).map(o=>o.p);
    }
    const scorers=[...(finalGK?[finalGK]:[]),...kept,...subsInPlayers];
    const unfilledSubCount=Math.max(0,failed.length-subsInPlayers.length);
    return finalizeCaptain(scorers,gw,chip,{gkSwapped,subsInCount:subsInPlayers.length,unfilledSubCount});
  }

  /* Moves the chip-aware captain multiplier (2x, or 3x under Triple
     Captain) to the vice-captain once the captain's own fixture has
     finished with 0 minutes — the armband itself transfers, per FPL's
     rule, not just a fixed points bonus. Left untouched while the
     captain's fixture is still in progress. */
  function finalizeCaptain(scorers,gw,chip,extra){
    const capId=S.cap,viceId=S.vice,capPlayer=typeof byId==='function'?byId(capId):null;
    let effectiveCapId=capId,capPromoted=false;
    if(capPlayer&&viceId!=null&&playerLocked(capPlayer,gw)&&liveMinutesOrZero(capPlayer)===0){
      effectiveCapId=viceId;capPromoted=true;
    }
    return{scorers,effectiveCapId,capMultiplier:chip.captainMultiplier,capPromoted,benchScoring:!!chip.benchScoring,...extra};
  }

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
      const age=Math.max(0,Math.floor((Date.now()-LIVE.loadedAt)/60000)),pending=pendingScorerCount();
      const freshness=age<1?'live':age+'m old';
      status.textContent=pending>0
        ? `GW${S.gw} official points · ${freshness} · ${pending} of your XI not yet final (in progress or projected)`
        : `GW${S.gw} official points · ${freshness} · autosubs and vice-captaincy applied`;
      return;
    }
    status.textContent=LIVE.error?`GW points unavailable · ${LIVE.error}`:`GW${S.gw} official points pending.`;
  }

  async function refreshLiveGwPoints({force=false}={}){
    if(!actualRequested()||navigator.onLine===false)return false;
    if(LIVE.loading)return false;
    if(!force&&LIVE.gw===Number(S.gw)&&LIVE.rows.size>0&&Date.now()-LIVE.loadedAt<45000)return true;
    const requestedGw=Number(S.gw);
    LIVE.loading=true;LIVE.error='';renderScoreStatus();
    try{
      const payload=await fetchJSON(`${API_BASE}/api/event-live?gw=${requestedGw}`,15000);
      const rows=actualRowsFromPayload(payload);
      if(rows.length<1)throw new Error('FPL has not published any player stats for this gameweek yet');
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

  function pendingScorerCount(){
    if(!actualReady())return 0;
    const lineup=resolveActualLineup();
    return lineup.scorers.filter(p=>actualForPlayer(p)===null||!playerLocked(p,S.gw)).length;
  }

  const projectedRenderSpine=renderSpine;
  renderSpine=function(){
    const out=projectedRenderSpine();
    const key=document.querySelector('#spineWrap .spine-key');
    if(!actualReady()){if(key)key.style.display='';return out;}
    const lineup=resolveActualLineup(),scorers=lineup.scorers;
    let sum=0,pending=0;
    for(const p of scorers){
      const mult=p.id===lineup.effectiveCapId?lineup.capMultiplier:1;
      const actual=actualForPlayer(p);
      const settled=actual!==null&&playerLocked(p,S.gw);
      if(!settled)pending++;
      sum+=(actual!==null?actual:projectedForPlayer(p))*mult;
    }
    sum=Math.round(sum*10)/10;
    const total=document.getElementById('spineTotal'),head=document.getElementById('hXpts'),label=document.getElementById('hXptsLabel');
    if(total)total.textContent=String(sum);if(head)head.textContent=String(sum);
    const notes=[];
    if(pending>0)notes.push(`${pending} of ${scorers.length} not yet final (in progress or shown as projected xPts)`);
    if(lineup.capPromoted)notes.push('captain did not play — vice-captain multiplier applied');
    if(lineup.gkSwapped)notes.push('goalkeeper autosub applied');
    if(lineup.subsInCount)notes.push(`${lineup.subsInCount} outfield autosub${lineup.subsInCount===1?'':'s'} applied`);
    if(lineup.unfilledSubCount)notes.push(`${lineup.unfilledSubCount} missing starter${lineup.unfilledSubCount===1?'':'s'} had no legal bench cover`);
    const noteText=notes.length?` ${notes.join('; ')}.`:'';
    const title=`Official FPL GW${S.gw} player points for the actual scoring XI${lineup.benchScoring?' plus Bench Boost':''} — autosubs and vice-captain promotion applied where each player's own fixture has finished.${noteText}`;
    if(label){label.textContent=`${lineup.benchScoring?'BB 15':'XI'} GW points${pending>0?' (partial)':''}`;label.title=title;}
    if(head){head.title=title;head.setAttribute('aria-label',`${title} ${sum} points`);}
    const spine=document.getElementById('spine');if(spine)spine.innerHTML=`<div style="width:100%;background:var(--mint)" title="${pending>0?'Partial — some players not yet final':'Official FPL GW points'}"></div>`;
    if(key)key.style.display='none';
    return out;
  };

  ensureScoreControl();renderScoreStatus();
  document.getElementById('gwSel')?.addEventListener('change',()=>setTimeout(()=>{LIVE.error='';renderScoreStatus();if(actualRequested())refreshLiveGwPoints({force:true});},0));
  displaySelect?.addEventListener('change',()=>setTimeout(()=>{renderScoreStatus();if(actualRequested())refreshLiveGwPoints({force:true});},0));
  setInterval(()=>{if(actualRequested())refreshLiveGwPoints();},60000);
  if(actualRequested())setTimeout(()=>refreshLiveGwPoints({force:true}),0);
}
