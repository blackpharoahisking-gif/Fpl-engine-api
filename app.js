/* OTB 2026.08.22.6 — cards show real per-GW points even in whole-period
   view, on top of giving the live GW score a second guaranteed-visible
   home, separating predictive points from actual points, the LiveFPL-
   style card redesign, and automatic Gameweek intelligence/snapshots.
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
   2026.08.22.2: Projection Accountability now distinguishes a valid future
   snapshot from a post-deadline forecast awaiting results. Before the GW
   deadline, the Track Record row reads "Pre-deadline forecast active";
   after the deadline it naturally falls back to the core "Awaiting results"
   state. This is display-only and does not mutate the snapshot ledger.
   2026.08.22.3: "can otb player card look similar to live fpl players
   cards?" — approved as a full visual overhaul (app-core.js:cardHTML),
   not a new feature: a kit-shirt icon (reusing the existing CLUB_COLOURS
   data) replaces the old colour swatch, captain/vice moved from a text
   chip onto a small corner badge, and the identity row is tighter and
   left-aligned like LiveFPL's cards. xEO (effective ownership) was
   explicitly skipped — OTB has no ownership data source wired in and
   Marcus agreed that's a separate feature, not part of this redesign.
   OTB's own stats LiveFPL doesn't have (xPts breakdown, health status,
   3-GW fixture run) are untouched.
   2026.08.22.4: "this last update broke the live scoring update that
   shows current gw score...i think im on 40 pts...we should separate
   predictive points from actual points." The live score wasn't actually
   broken by the card redesign — it had always been gated behind
   selectedGwView() (Engine > Options > "Points shown: Selected gameweek
   only"), a setting invisible from the Squad tab that defaults to
   "Total across the whole period". So on a normal load the projected
   multi-GW horizon total sat exactly where the live score should have
   been, with nothing on screen explaining a mode switch was needed —
   indistinguishable from broken. Fixed by actually separating the two,
   not just re-defaulting a toggle: liveDataRequested()/liveScoreReady()
   now key only off the gameweek, its deadline and the Score mode — never
   S.display — and drive a header chip (#hLiveGw) independent of whatever
   scope the predictive spine is set to. The spine itself
   (#spineTotal/#hXpts) is no longer overwritten with actual data, so
   "Projected scoring points" now means that, always. Only one place
   keeps caring about selectedGwView(): an individual card's xp-value
   means a multi-GW horizon total in "whole period" mode, so it correctly
   stays a projection there — swapping it for a single GW's real score
   would misrepresent the number, not fix it.
   2026.08.22.5: the header chip alone still wasn't visible on Marcus's
   actual phone — it's the 5th <div> child of <header> (brand,
   hdr-spacer, then the chip row), which a narrow-phone rule
   (header .chipstat:nth-of-type(n+5){display:none} at <=560px) was
   already truncating before this chip existed, same as it already hid
   Bank/XI xPts there. Rather than touch that existing truncation, added
   a second, guaranteed-visible home: a callout bar (#liveGwBar) in the
   normal page flow directly under the Squad tab's predictive spine,
   populated by the same renderLiveGwScore().
   2026.08.22.6: "on the player cards I still want to see the actual
   points that each player scored though for that gw. its still showing
   expected points." In whole-period view a card's primary xp-value is a
   multi-GW horizon total ("GW1-2 XP") — still correctly left projected,
   since there's no single-GW figure there to substitute — but
   app-core.js already renders a secondary line under it in that same
   view, GW{S.gw}'s own projected figure ("GW1 6.1 xP · fixture"), which
   has no such conflict. That line now swaps to the real score whenever
   it's ready, independent of the Total/Selected-GW toggle, the same as
   the header chip and callout bar already are — wrapped app-core.js's
   secondary value in a stable <span class="secondary-value"> so this
   patch layer has something reliable to target, mirroring how xp-value/
   xp-label already work. */
(function loadOtbCore(){
  const script=document.createElement('script');
  script.src='app-core.js?v=2026.08.22.3-core';
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

  const BUILD='2026.08.22.6';
  const SCORE_KEY='otb-score-view-v1';
  const TEAM_ID_KEY='otb-fpl-team-id-v1';
  const LIVE={gw:0,rows:new Map(),loadedAt:0,loading:false,error:''};
  let scoreMode='auto';
  try{const saved=localStorage.getItem(SCORE_KEY);if(['auto','expected','actual'].includes(saved))scoreMode=saved}catch(_){ }

  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge){badge.textContent='BUILD 08.22.6';badge.title='OTB automatic Gameweek intelligence + LiveFPL-style cards + live GW score everywhere';}

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

  /* Marcus, 22 Aug: "this last update broke the live scoring update that
     shows current gw score...we should separate predictive points from
     actual points" — the live GW score was entirely gated behind
     "Points shown: Selected gameweek only", a setting that only lives in
     Engine > Options and defaults to "Total across the whole period", so
     on a fresh load (or the Squad tab, where that setting isn't even
     visible) the live score was invisible and the projected multi-GW
     total sat in its place instead — looking like the live number had
     stopped working, not like a mode the user needed to switch.

     Fixed by decoupling the two concerns properly instead of patching the
     default: liveDataRequested/liveScoreReady below answer "is GW{n}'s
     live data available" using ONLY the gameweek and the deadline, never
     S.display — that display toggle now only controls how the PROJECTED
     spine is scoped (one gameweek vs the whole planning horizon), and
     never decides whether real points are shown at all. The live score
     gets its own always-visible header chip (#hLiveGw) and its own
     status line, populated by renderLiveGwScore() below, and the
     predictive spine (renderSpine/#spineTotal/#hXpts) is no longer
     overwritten with actual data — it always shows what its own label
     says, "Projected scoring points", full stop. selectedGwView() is
     kept only for the one place actual data still needs it: an
     individual card's xp-value is a single number that means a
     multi-GW horizon total in "whole period" mode, so it must stay a
     projection there — swapping it for a single GW's real points would
     be wrong, not more accurate. */
  const liveDataRequested=()=>deadlinePassed(S.gw)&&scoreMode!=='expected';
  const liveScoreReady=()=>liveDataRequested()&&LIVE.gw===Number(S.gw)&&LIVE.rows.size>0;
  const actualForPlayer=p=>{
    if(!liveScoreReady()||p?.apiId==null)return null;
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
      if(liveDataRequested())refreshLiveGwPoints({force:true});
    });
  }

  function renderScoreStatus(){
    ensureScoreControl();
    const sel=document.getElementById('gwScoreView'),status=document.getElementById('gwScoreStatus');
    if(sel)sel.value=scoreMode;
    if(!status)return;
    if(scoreMode==='expected'){
      status.textContent='Expected xPts forced — live GW points hidden.';return;
    }
    if(!deadlinePassed(S.gw)){
      status.textContent=`GW${S.gw} points unlock after the deadline.`;return;
    }
    if(LIVE.loading){status.textContent=`Loading GW${S.gw} official points…`;return;}
    if(liveScoreReady()){
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
    if(!liveDataRequested()||navigator.onLine===false)return false;
    if(LIVE.loading)return false;
    if(!force&&LIVE.gw===Number(S.gw)&&LIVE.rows.size>0&&Date.now()-LIVE.loadedAt<45000)return true;
    const requestedGw=Number(S.gw);
    LIVE.loading=true;LIVE.error='';renderScoreStatus();renderLiveGwScore();
    try{
      const payload=await fetchJSON(`${API_BASE}/api/event-live?gw=${requestedGw}`,15000);
      const rows=actualRowsFromPayload(payload);
      if(rows.length<1)throw new Error('FPL has not published any player stats for this gameweek yet');
      if(Number(S.gw)!==requestedGw)return false;
      LIVE.gw=requestedGw;LIVE.rows=new Map(rows.map(row=>[Number(row.i),row]));LIVE.loadedAt=Date.now();
      requestAnimationFrame(()=>{renderPitch();renderSpine();renderScoreStatus()});
      return true;
    }catch(err){
      LIVE.error=String(err?.message||err);renderScoreStatus();renderLiveGwScore();return false;
    }finally{LIVE.loading=false;renderScoreStatus();renderLiveGwScore();}
  }

  /* Marcus, 22 Aug (follow-up): "on the player cards I still want to see
     the actual points that each player scored though for that gw. its
     still showing expected points." — in "Total across the whole
     period" view, cardHTML's own xp-value is a multi-GW horizon total
     (e.g. "GW1-2 XP"), which still can't be swapped for a single GW's
     real score without misrepresenting the number, but that total isn't
     the only place a single gameweek's points appear on the card:
     app-core.js already renders a secondary line underneath it in that
     same view — "GW1 6.1 xP · fixture" — showing GW{S.gw}'s own figure
     on its own. THAT line has no such conflict, and is exactly the
     "what did this player actually score this gameweek" figure Marcus
     is looking for on the card, so it now gets swapped for the real
     score independent of the Total/Selected-GW toggle, the same as the
     header chip and callout bar already are. The primary xp-value still
     only swaps in Selected-GW view, where it truly is a single-GW
     figure. */
  const projectedCardHTML=cardHTML;
  cardHTML=function(p,benchPos=null){
    let html=projectedCardHTML(p,benchPos);
    if(!liveScoreReady())return html;
    const pts=actualForPlayer(p);if(pts===null)return html;
    if(selectedGwView()){
      if(S.shotMode)return html.replace(/<div class="cstat">[^<]*<\/div>/,`<div class="cstat">${pts}</div>`);
      html=html.replace(/<div class="therm"[^>]*><\/div>/,'');
      html=html
        .replace(/<span class="xp-value">[^<]*<\/span><span class="xp-label">[^<]*<\/span>/,`<span class="xp-value">${pts}</span><span class="xp-label">GW${S.gw} pts</span>`)
        .replace(/expected-points details/g,'official GW-points result')
        .replace(/expected-points total/g,'official GW-points result');
    }
    return html.replace(/<span class="secondary-value">GW\d+ [^<]*<\/span>/,`<span class="secondary-value">GW${S.gw} ${pts} pts (actual)</span>`);
  };

  function pendingScorerCount(){
    if(!liveScoreReady())return 0;
    const lineup=resolveActualLineup();
    return lineup.scorers.filter(p=>actualForPlayer(p)===null||!playerLocked(p,S.gw)).length;
  }

  /* The predictive spine (#spineTotal/#hXpts, driven purely by
     projectedRenderSpine — app-core.js's original renderSpine) is never
     touched here: it always shows the projected figure its own label
     already says it shows. The live GW score gets two separate,
     always-in-flow homes, independent of whatever the predictive
     spine's "Points shown" scope is set to: the header chip (#hLiveGw)
     for wide viewports, and — because that chip sits 5th among the
     header's own <div> children and a narrow-phone rule truncates the
     header to its first two chips, hiding it exactly like it already
     hid Bank/XI xPts — a callout bar (#liveGwBar) directly under the
     Squad tab's spine, which nothing truncates. */
  function renderLiveGwScore(){
    const val=document.getElementById('hLiveGw'),label=document.getElementById('hLiveGwLabel'),wrap=document.getElementById('hLiveGwWrap');
    const bar=document.getElementById('liveGwBar'),barNum=document.getElementById('liveGwNum'),barGw=document.getElementById('liveGwGwLabel'),barStatus=document.getElementById('liveGwStatusText');
    if(label)label.textContent=`GW${S.gw} Score`;
    if(barGw)barGw.textContent=String(S.gw);
    if(bar)bar.style.display=deadlinePassed(S.gw)?'flex':'none';
    const setIdle=(text,title)=>{
      if(val){val.textContent='—';val.className='v mono';}
      if(wrap)wrap.title=title;
      if(barNum)barNum.textContent='—';
      if(barStatus)barStatus.textContent=text;
    };
    if(scoreMode==='expected'){
      setIdle('Expected xPts forced — live GW points hidden. Switch Score to Auto or GW points to see it.','Expected xPts forced — live GW points hidden. Switch Score to Auto or GW points to see it.');
      return;
    }
    if(!deadlinePassed(S.gw))return;
    if(!liveScoreReady()){
      if(val){val.textContent=LIVE.loading?'…':'—';val.className='v mono';}
      const text=LIVE.loading?`Loading GW${S.gw} official points…`:(LIVE.error?`GW points unavailable · ${LIVE.error}`:`GW${S.gw} official points pending.`);
      if(wrap)wrap.title=text;
      if(barNum)barNum.textContent=LIVE.loading?'…':'—';
      if(barStatus)barStatus.textContent=text;
      return;
    }
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
    if(val){val.textContent=String(sum);val.className='v mono good';}
    if(barNum)barNum.textContent=String(sum);
    const notes=[];
    if(pending>0)notes.push(`${pending} of ${scorers.length} not yet final (in progress or shown as projected xPts)`);
    if(lineup.capPromoted)notes.push('captain did not play — vice-captain multiplier applied');
    if(lineup.gkSwapped)notes.push('goalkeeper autosub applied');
    if(lineup.subsInCount)notes.push(`${lineup.subsInCount} outfield autosub${lineup.subsInCount===1?'':'s'} applied`);
    if(lineup.unfilledSubCount)notes.push(`${lineup.unfilledSubCount} missing starter${lineup.unfilledSubCount===1?'':'s'} had no legal bench cover`);
    const noteText=notes.length?` ${notes.join('; ')}.`:'';
    const title=`Official FPL GW${S.gw} points for the actual scoring XI${lineup.benchScoring?' plus Bench Boost':''} — autosubs and vice-captain promotion applied where each player's own fixture has finished.${noteText}`;
    if(wrap)wrap.title=title;
    if(barStatus)barStatus.textContent=notes.length?`${notes.join('; ')}.`:'Official — autosubs and vice-captaincy applied.';
  }

  const projectedRenderSpine=renderSpine;
  renderSpine=function(){
    const out=projectedRenderSpine();
    renderLiveGwScore();
    return out;
  };

  /* Projection Accountability lifecycle display: a valid snapshot before its
     deadline is still being maintained and is not yet "awaiting results". */
  const coreRenderAccuracyGwTable=typeof renderAccuracyGwTable==='function'?renderAccuracyGwTable:null;
  if(coreRenderAccuracyGwTable){
    renderAccuracyGwTable=function(cohort){
      const out=coreRenderAccuracyGwTable(cohort);
      const host=document.getElementById('accuracyGwTable');
      host?.querySelectorAll('[data-accuracy-gw]').forEach(btn=>{
        const gw=Number(btn.dataset.accuracyGw);
        const snap=typeof ACCURACY!=='undefined'?ACCURACY.ledger?.snapshots?.[gw]:null;
        const deadline=typeof accuracyDeadline==='function'?Number(accuracyDeadline(gw)):NaN;
        const state=btn.nextElementSibling;
        if(snap&&typeof accuracySnapshotReady==='function'&&accuracySnapshotReady(gw)&&Number.isFinite(deadline)&&Date.now()<deadline&&state?.textContent==='Awaiting results'){
          state.textContent='Pre-deadline forecast active';
        }
      });
      return out;
    };
  }

  ensureScoreControl();renderScoreStatus();renderLiveGwScore();
  try{if(typeof renderAccuracy==='function')renderAccuracy()}catch(_){ }
  document.getElementById('gwSel')?.addEventListener('change',()=>setTimeout(()=>{LIVE.error='';renderScoreStatus();renderLiveGwScore();if(liveDataRequested())refreshLiveGwPoints({force:true});},0));
  displaySelect?.addEventListener('change',()=>setTimeout(()=>{renderPitch();renderScoreStatus();if(liveDataRequested())refreshLiveGwPoints({force:true});},0));
  setInterval(()=>{if(liveDataRequested())refreshLiveGwPoints();},60000);
  if(liveDataRequested())setTimeout(()=>refreshLiveGwPoints({force:true}),0);
}
