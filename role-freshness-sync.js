/* OTB Role Freshness & Downstream Projection Integrity
   ----------------------------------------------------
   Passive post-core bridge. It never computes xPts itself.
   - asks the Scout Worker to prioritise relevant clubs in the background;
   - polls freshness metadata without triggering scans;
   - hydrates newer saved reports through the existing applyScoutReport(), so
     xMins/xPts, Builder, Transfer Planner and Verdict all receive the same
     role evidence and existing cache/fingerprint invalidation;
   - tightens requested coverage near the FPL deadline.
*/
(function installRoleFreshnessSync(){
  'use strict';
  const READY_TIMEOUT_MS=20000;
  const POLL_MS=3*60*1000;
  const APPLIED_KEY='otb-role-freshness-applied-v1';
  const API_FALLBACK='https://otb-role-intelligence.blackpharoahisking.workers.dev';
  const startedAt=Date.now();let installed=false,pollTimer=null,inflight=false,lastDeadlineRequest=0,lastPlannerRequest=0;
  const state={version:'role-freshness-client-v1',status:null,error:'',lastPollAt:0,lastAppliedAt:0,applied:{},queued:[],active:true};

  function runtimeReady(){return typeof S!=='undefined'&&typeof TEAMS!=='undefined'&&typeof POOL!=='undefined'&&typeof byId==='function'&&typeof applyScoutReport==='function'&&typeof bumpCache==='function'&&typeof render==='function'}
  function api(){try{return typeof SCOUT_API_BASE!=='undefined'&&SCOUT_API_BASE?SCOUT_API_BASE:API_FALLBACK}catch{return API_FALLBACK}}
  function allTeams(){try{return Object.keys(TEAMS||{}).filter(Boolean)}catch{return[]}}
  function squadTeams(){try{return [...new Set((S.squad||[]).map(id=>byId(id)?.t).filter(Boolean))]}catch{return[]}}
  function loadApplied(){try{const v=JSON.parse(localStorage.getItem(APPLIED_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return{}}}
  function saveApplied(){try{localStorage.setItem(APPLIED_KEY,JSON.stringify(state.applied))}catch{}}
  function deadlineMinutes(){try{const d=Number(typeof DEADLINE!=='undefined'?DEADLINE:NaN);return Number.isFinite(d)?(d-Date.now())/60000:null}catch{return null}}
  function reportMs(v){const ms=Date.parse(v||'');return Number.isFinite(ms)?ms:null}
  function roleWorkerEventsFor(team){try{return (S.roleIntel?.events||[]).filter(e=>e?.worker&&e?.team===team)}catch{return[]}}

  function ensureBadge(){
    let badge=document.getElementById('roleFreshnessBadge');if(badge)return badge;
    badge=document.createElement('span');badge.id='roleFreshnessBadge';badge.className='badge';badge.style.marginLeft='6px';badge.style.whiteSpace='nowrap';badge.textContent='ROLE SYNC…';
    const build=document.getElementById('buildBadge');(build?.parentElement||document.body||document.documentElement).appendChild(badge);return badge;
  }
  function renderBadge(payload=state.status){
    const badge=ensureBadge();if(!badge)return;
    if(!payload?.teams){badge.textContent=state.error?'ROLE SYNC ERR':'ROLE SYNC…';badge.title=state.error||'Role freshness metadata is loading.';return}
    const rows=Object.values(payload.teams),fresh=rows.filter(r=>r.state==='fresh').length,aging=rows.filter(r=>r.state==='aging').length,bad=rows.length-fresh-aging;
    badge.textContent=`ROLE ${fresh}/${rows.length} FRESH${bad?` · ${bad} STALE`:''}`;
    const worst=rows.filter(r=>r.state==='stale'||r.state==='missing').map(r=>`${r.team} ${r.state}${Number.isFinite(r.ageMinutes)?` ${r.ageMinutes}m`:''}`);
    badge.title=`Worker-side role freshness · ${fresh} fresh · ${aging} aging · ${bad} stale/missing.${worst.length?' '+worst.slice(0,8).join(' · '):''}`;
  }

  async function getStatus(teams=allTeams()){
    const list=[...new Set(teams)].filter(Boolean);const q=list.length?`?teams=${encodeURIComponent(list.join(','))}`:'';
    const res=await fetch(api()+'/api/role-freshness/status'+q,{headers:{Accept:'application/json'},cache:'no-store'}),body=await res.json().catch(()=>({}));
    if(!res.ok||body.status!=='ok')throw new Error(body.error||`Role freshness HTTP ${res.status}`);return body;
  }
  async function requestTeams(teams,{reason='app',priority=5}={}){
    const list=[...new Set(teams)].filter(Boolean);if(!list.length)return null;
    const res=await fetch(api()+'/api/role-freshness/request',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({teams:list,reason,priority})}),body=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(body.error||`Role freshness request HTTP ${res.status}`);state.queued=list;return body;
  }
  async function hydrateTeam(team,reportAt,{force=false}={}){
    if(typeof SCOUT!=='undefined'&&SCOUT?.loading)return false;
    const remoteMs=reportMs(reportAt),known=Number(state.applied[team]||0),hasSaved=roleWorkerEventsFor(team).length>0;
    if(!force&&remoteMs!=null&&known>=remoteMs&&hasSaved)return false;
    const res=await fetch(`${api()}/api/role-intelligence?team=${encodeURIComponent(team)}`,{headers:{Accept:'application/json'},cache:'no-store'}),data=await res.json().catch(()=>({}));
    if(!res.ok||data.status!=='ok')throw new Error(data.error||`Scout ${team} HTTP ${res.status}`);
    if(typeof schemaAtLeast==='function'&&typeof SCOUT_SCHEMA_MIN!=='undefined'&&!schemaAtLeast(data.schemaVersion,SCOUT_SCHEMA_MIN))throw new Error(`Scout ${team} schema ${data.schemaVersion||'unknown'} is below ${SCOUT_SCHEMA_MIN}`);
    if(typeof EXPECTED_SEASON!=='undefined'&&data.season&&String(data.season)!==String(EXPECTED_SEASON))throw new Error(`Scout ${team} season ${data.season} != ${EXPECTED_SEASON}`);
    applyScoutReport(data);
    const appliedMs=reportMs(data.generatedAt)||remoteMs||Date.now();state.applied[team]=appliedMs;state.lastAppliedAt=Date.now();saveApplied();
    try{if(typeof scheduleAccuracyCapture==='function')scheduleAccuracyCapture(350)}catch{}
    try{document.dispatchEvent(new CustomEvent('otb:role-freshness-applied',{detail:{team,reportAt:data.generatedAt||reportAt||null,events:Array.isArray(data.events)?data.events.length:0}}))}catch{}
    return true;
  }
  async function hydrateNewer(payload,{teams=null,forceMissing=false}={}){
    const wanted=new Set((teams||Object.keys(payload?.teams||{})).filter(Boolean));
    for(const [team,row] of Object.entries(payload?.teams||{})){
      if(!wanted.has(team)||!row?.reportAt)continue;
      const remote=reportMs(row.reportAt),known=Number(state.applied[team]||0),saved=roleWorkerEventsFor(team).length>0;
      if(forceMissing&&!saved||remote!=null&&remote>known){try{await hydrateTeam(team,row.reportAt,{force:forceMissing&&!saved})}catch(error){state.error=error?.message||String(error)}}
    }
  }
  async function poll({startup=false}={}){
    if(inflight||document.visibilityState==='hidden')return;inflight=true;
    try{
      const payload=await getStatus(allTeams());state.status=payload;state.error='';state.lastPollAt=Date.now();renderBadge(payload);
      const relevant=startup?squadTeams():allTeams();await hydrateNewer(payload,{teams:relevant,forceMissing:startup});
      await maybeDeadlineSweep();
    }catch(error){state.error=error?.message||String(error);renderBadge()}finally{inflight=false}
  }
  async function maybeDeadlineSweep(){
    const dm=deadlineMinutes();if(!Number.isFinite(dm)||dm<0||dm>360)return;
    const interval=dm<=90?10*60000:30*60000;if(Date.now()-lastDeadlineRequest<interval)return;lastDeadlineRequest=Date.now();
    try{await requestTeams(allTeams(),{reason:dm<=90?'deadline-t90':'deadline-t6h',priority:dm<=90?9:8})}catch(error){state.error=error?.message||String(error)}
  }
  async function plannerRefresh(){
    if(Date.now()-lastPlannerRequest<5*60000)return;lastPlannerRequest=Date.now();
    try{await requestTeams(allTeams(),{reason:'planner-open',priority:7});const payload=await getStatus(allTeams());state.status=payload;renderBadge(payload);await hydrateNewer(payload)}catch(error){state.error=error?.message||String(error);renderBadge()}
  }
  async function squadRefresh(reason='squad-open'){
    const teams=squadTeams();if(!teams.length)return;try{await requestTeams(teams,{reason,priority:8});const payload=await getStatus(allTeams());state.status=payload;renderBadge(payload);await hydrateNewer(payload,{teams,forceMissing:true})}catch(error){state.error=error?.message||String(error);renderBadge()}
  }
  function onNavigationClick(event){
    const el=event.target?.closest?.('button,[data-t],[data-tab]');if(!el)return;const text=`${el.dataset?.t||''} ${el.dataset?.tab||''} ${el.textContent||''}`.toLowerCase();
    if(/builder|transfer/.test(text))setTimeout(plannerRefresh,80);else if(/verdict|squad|team/.test(text))setTimeout(()=>squadRefresh('decision-view'),80);
  }
  function install(){
    if(installed)return;installed=true;state.applied=loadApplied();ensureBadge();
    document.addEventListener('click',onNavigationClick,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')poll()});
    window.addEventListener('online',()=>poll());
    globalThis.__OTB_ROLE_FRESHNESS__={state,poll,status:getStatus,request:requestTeams,plannerRefresh,squadRefresh,hydrateTeam};
    setTimeout(async()=>{try{await requestTeams(squadTeams(),{reason:'app-startup',priority:8})}catch{}await poll({startup:true})},250);
    pollTimer=setInterval(()=>poll(),POLL_MS);
  }
  (function wait(){if(runtimeReady())return install();if(Date.now()-startedAt>READY_TIMEOUT_MS){console.warn('OTB role freshness sync not installed: core runtime unavailable');return}setTimeout(wait,60)})();
})();
