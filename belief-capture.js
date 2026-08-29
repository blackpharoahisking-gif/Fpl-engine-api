/* OTB Belief Capture v0 — irrecoverable evidence recorder.
   -------------------------------------------------------
   Observer only. It does not change projections, candidate generation,
   transfer-planner maths, Verdict ordering, governance thresholds or UI.

   Capture contract:
   - identify the decision-relevant runtime that actually executed;
   - snapshot current squad/resources plus Verdict and Transfer Planner inputs/outputs;
   - content-hash the information snapshot;
   - persist locally before attempting the remote append-only writer;
   - never suppress a row because a verification/replay check failed.
*/
(function installOtbBeliefCapture(){
  'use strict';

  const CLIENT_VERSION='belief-capture-v0.1';
  const SCHEMA_VERSION='otb-belief-event-v0';
  const DB_NAME='otb-belief-capture-v0';
  const DB_STORE='pending';
  const API_FALLBACK='https://otb-belief-capture.blackpharoahisking.workers.dev';
  const POLL_MS=60*1000;
  const RETRY_MS=5*60*1000;
  const READY_TIMEOUT_MS=25000;
  const LAST_HASH_KEY='otb-belief-capture-last-hash-v0';
  const startedAt=Date.now();
  let installed=false,scanBusy=false,flushBusy=false,lastQuickKey='',pollTimer=null,retryTimer=null;

  const status={
    clientVersion:CLIENT_VERSION,
    installed:false,
    lastCaptureAt:0,
    lastSnapshotHash:'',
    pending:null,
    lastUploadAt:0,
    lastUploadError:'',
    lastCaptureError:'',
    degraded:false,
  };

  function runtimeReady(){
    /* Minimum viable runtime only. Missing Verdict/Planner surfaces are captured
       as degraded evidence rather than preventing the recorder from starting. */
    return typeof S!=='undefined'&&typeof DATA!=='undefined'&&typeof squadPlayers==='function';
  }
  function plain(value){
    if(value===undefined)return null;
    if(value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value;
    if(value instanceof Set)return [...value].map(plain);
    if(value instanceof Map)return Object.fromEntries([...value.entries()].map(([k,v])=>[String(k),plain(v)]));
    if(Array.isArray(value))return value.map(plain);
    if(typeof value==='object'){
      const out={};
      for(const key of Object.keys(value)){
        const v=value[key];
        if(typeof v==='function')continue;
        try{out[key]=plain(v)}catch(_){out[key]=null}
      }
      return out;
    }
    return String(value);
  }
  function stableValue(value){
    if(Array.isArray(value))return value.map(stableValue);
    if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>{out[key]=stableValue(value[key]);return out},{});
    return value;
  }
  const stableJson=value=>JSON.stringify(stableValue(value));
  async function sha256Text(text){
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(text)));
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  const sha256Value=value=>sha256Text(stableJson(value));
  function toIso(value){
    const n=Number(value),ms=Number.isFinite(n)&&n>1e11?n:Date.parse(String(value||''));
    return Number.isFinite(ms)?new Date(ms).toISOString():null;
  }
  function currentGw(){
    const gw=Number(S?.gw||DATA?.nextEvent||1);return Number.isInteger(gw)&&gw>=1&&gw<=38?gw:1;
  }
  function deadlineFor(gw){
    try{const d=Number(typeof accuracyDeadline==='function'?accuracyDeadline(gw):NaN);if(Number.isFinite(d))return new Date(d).toISOString()}catch(_){}
    try{const e=(Array.isArray(EVENTS)?EVENTS:[]).find(x=>Number(x?.id)===Number(gw));return e?.deadline_time?toIso(e.deadline_time):null}catch{return null}
  }
  function apiBase(){
    try{
      const explicit=String(globalThis.BELIEF_CAPTURE_API_BASE||'').trim();if(explicit)return explicit.replace(/\/$/,'');
      const saved=String(localStorage.getItem('otb-belief-capture-api')||'').trim();if(saved)return saved.replace(/\/$/,'');
    }catch(_){}
    return API_FALLBACK;
  }
  function authToken(){
    try{if(typeof freshReviewOwnerToken==='function'){const t=String(freshReviewOwnerToken()||'').trim();if(t)return t}}catch(_){}
    try{return String(sessionStorage.getItem('otb-belief-capture-key')||'').trim()}catch{return''}
  }
  function compactQueueItem(item){
    if(!item||typeof item!=='object')return null;
    return {id:item.id,at:item.event?.capturedAt||null,gw:item.event?.gw||null,trigger:item.event?.trigger||null,snapshotHash:item.snapshotHash||null};
  }
  function alarm(code,error){
    status.degraded=true;status.lastCaptureError=error?.message||String(error||code);
    console.error(`OTB belief capture ${code}:`,error||'degraded recorder state');
    try{document.dispatchEvent(new CustomEvent('otb:belief-capture-alarm',{detail:{code,error:status.lastCaptureError,at:Date.now()}}))}catch(_){}
  }

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB'in globalThis)){reject(new Error('IndexedDB unavailable'));return}
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE,{keyPath:'id'})};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Belief capture database open failed'));
    });
  }
  async function queuePut(row){
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(row);
      tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error||new Error('Belief row local write failed'));
    })}finally{db.close()}
  }
  async function queueDelete(id){
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error||new Error('Belief row local delete failed'));
    })}finally{db.close()}
  }
  async function queueList(limit=25){
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).getAll();
      req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>String(a.id).localeCompare(String(b.id))).slice(0,limit));
      req.onerror=()=>reject(req.error||new Error('Belief queue read failed'));
    })}finally{db.close()}
  }
  async function queueCount(){
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).count();
      req.onsuccess=()=>resolve(Number(req.result||0));req.onerror=()=>reject(req.error||new Error('Belief queue count failed'));
    })}finally{db.close()}
  }

  async function runtimeIdentity(){
    const sourceParts={
      verdictContext:typeof verdictContext==='function'?String(verdictContext):'',
      verdictDecisionState:typeof verdictDecisionState==='function'?String(verdictDecisionState):'',
      transferPlannerPayload:typeof transferPlannerPayload==='function'?String(transferPlannerPayload):'',
      workerCommonSource:document.getElementById('workerCommonSource')?.textContent||'',
      transferWorkerSource:document.getElementById('transferWorkerSource')?.textContent||'',
    };
    const componentHashes={};
    for(const [key,value] of Object.entries(sourceParts))componentHashes[key]=await sha256Text(value);
    const build=String(document.documentElement?.dataset?.build||document.querySelector('meta[name="otb-build"]')?.content||'unknown');
    const identity={
      build,
      appRelease:typeof APP_RELEASE!=='undefined'?String(APP_RELEASE):null,
      modelRelease:typeof MODEL_RELEASE!=='undefined'?String(MODEL_RELEASE):null,
      scoringPolicy:typeof FPL_SCORING_POLICY_VERSION!=='undefined'?String(FPL_SCORING_POLICY_VERSION):null,
      releaseIdentity:plain(globalThis.__OTB_RELEASE_IDENTITY__?.current||null),
      componentHashes,
    };
    identity.decisionRuntimeHash=await sha256Value(identity);
    return identity;
  }
  function decisionQueue(ctx){
    return (ctx?.queue||[]).map(item=>({
      id:item?.id??null,title:item?.title??null,severity:item?.severity??null,blocking:!!item?.blocking,
      cost:Number.isFinite(Number(item?.cost))?Number(item.cost):null,evidence:item?.evidence??null,
      action:item?.action??null,playerId:item?.playerId??item?.p?.id??null,
    }));
  }
  function squadState(){
    const players=typeof squadPlayers==='function'?squadPlayers():[];
    return {
      squad:[...(S.squad||[])].map(Number),start:[...(S.start||[])].map(Number),benchOrder:[...(S.benchOrder||[])],
      captain:Number(S.cap)||null,vice:Number(S.vice)||null,locks:[...(S.locks||[])],
      budget:Number(S.budget)||0,bank:Number(S.transfer?.bank)||0,freeTransfers:Number(S.transfer?.free)||0,
      purchase:plain(S.transfer?.purchase||{}),chips:plain(S.chips||{}),
      players:players.map(p=>({id:Number(p.id),name:p.n,team:p.t,position:p.p,cost:Number(p.c)})),
    };
  }
  function dataProvenance(){
    const worker=DATA?.worker?.meta||{};
    return {
      mode:DATA?.mode||null,lastUpdated:toIso(DATA?.lastUpdated),nextEvent:Number(DATA?.nextEvent)||null,
      worker:{dataHash:worker.dataHash||worker.data_hash||null,lastOfficialFetch:worker.lastOfficialFetch||null,schemaVersion:worker.schemaVersion||null,season:worker.season||null},
      roleFreshness:plain(globalThis.__OTB_ROLE_FRESHNESS__?.state?{
        version:globalThis.__OTB_ROLE_FRESHNESS__.state.version,lastPollAt:globalThis.__OTB_ROLE_FRESHNESS__.state.lastPollAt,lastAppliedAt:globalThis.__OTB_ROLE_FRESHNESS__.state.lastAppliedAt,
      }:null),
      market:plain(typeof MARKET!=='undefined'&&MARKET?{fetchedAt:MARKET.fetchedAt||MARKET.last?.fetchedAt||null,generatedAt:MARKET.generatedAt||MARKET.last?.generatedAt||null,sourceHash:MARKET.sourceHash||MARKET.last?.sourceHash||null}:null),
    };
  }
  function currentAccuracySnapshot(gw){
    try{const snap=ACCURACY?.ledger?.snapshots?.[gw];return snap?plain(snap):null}catch{return null}
  }
  function plannerState(){
    let payload=null,fingerprint=null,error=null;
    try{
      if(typeof transferPlannerPayload!=='function'||typeof verdictPlannerFingerprint!=='function')throw new Error('Transfer Planner surface unavailable in this runtime');
      const legalNow=typeof legal!=='function'||legal(squadPlayers());
      const full=Array.isArray(S.squad)&&S.squad.length===15&&legalNow;
      if(full){payload=plain(transferPlannerPayload());fingerprint=verdictPlannerFingerprint(payload)}
    }catch(err){error=err?.message||String(err)}
    const last=S.transfer?.last?plain(S.transfer.last):null;
    return {fingerprint,payload,last,error};
  }
  function verdictState(){
    try{
      if(typeof verdictContext!=='function'||typeof verdictDecisionState!=='function')throw new Error('Verdict surface unavailable in this runtime');
      const ctx=verdictContext();
      return {decision:plain(verdictDecisionState(ctx)),queue:plain(decisionQueue(ctx)),regime:plain(ctx?.regime||null),planLabel:ctx?.planLabel||null};
    }catch(error){return{decision:null,queue:[],error:error?.message||String(error)}}
  }
  async function buildSnapshot(){
    const gw=currentGw();
    const snapshot={
      schemaVersion:SCHEMA_VERSION,
      season:typeof EXPECTED_SEASON!=='undefined'?String(EXPECTED_SEASON):'2026/27',
      gw,deadline:deadlineFor(gw),runtime:await runtimeIdentity(),data:dataProvenance(),squad:squadState(),
      verdict:verdictState(),transferPlanner:plannerState(),accuracy:currentAccuracySnapshot(gw),
    };
    const snapshotHash=await sha256Value(snapshot);
    return{snapshot,snapshotHash};
  }
  function quickKey(){
    try{
      const role=globalThis.__OTB_ROLE_FRESHNESS__?.state||{};
      const worker=DATA?.worker?.meta||{};
      const last=S.transfer?.last||{};
      return stableJson({
        gw:S.gw,squad:S.squad,start:[...(S.start||[])],cap:S.cap,vice:S.vice,bench:S.benchOrder,
        bank:S.transfer?.bank,free:S.transfer?.free,lastPlannerAt:last.verdictGeneratedAt||null,lastPlannerFingerprint:last.verdictFingerprint||null,
        data:DATA?.lastUpdated||worker.lastOfficialFetch||worker.dataHash||null,role:role.lastAppliedAt||null,
        build:document.documentElement?.dataset?.build||null,
      });
    }catch{return String(Date.now())}
  }
  async function capture(trigger='state-change',{force=false}={}){
    if(scanBusy)return null;scanBusy=true;
    try{
      const {snapshot,snapshotHash}=await buildSnapshot();
      let previous='';try{previous=localStorage.getItem(LAST_HASH_KEY)||''}catch(_){}
      if(!force&&previous===snapshotHash){status.lastSnapshotHash=snapshotHash;return null}
      const at=new Date().toISOString(),id=`${String(currentGw()).padStart(2,'0')}-${Date.now()}-${crypto.randomUUID()}`;
      const row={
        id,snapshotHash,snapshot,
        event:{schemaVersion:SCHEMA_VERSION,clientVersion:CLIENT_VERSION,capturedAt:at,gw:currentGw(),trigger,reproducible:null,verificationChecks:{clientSnapshotHash:true}},
      };
      /* The local append is authoritative for capture timing. Remote verification
         may later mark this row degraded, but it never gets veto power here. */
      try{await queuePut(row)}catch(error){alarm('LOCAL_WRITE_FAILED',error);return row}
      try{localStorage.setItem(LAST_HASH_KEY,snapshotHash)}catch(_){}
      status.lastCaptureAt=Date.now();status.lastSnapshotHash=snapshotHash;status.lastCaptureError='';
      try{status.pending=await queueCount()}catch(_){}
      void flush();
      return row;
    }catch(error){alarm('CAPTURE_FAILED',error);return null}
    finally{scanBusy=false}
  }
  async function postRow(row){
    const headers={'content-type':'application/json','accept':'application/json'};
    const token=authToken();if(token){headers.authorization=`Bearer ${token}`;headers['x-belief-capture-key']=token}
    const response=await fetch(apiBase()+'/api/belief-capture/v0/events',{method:'POST',headers,body:JSON.stringify(row),cache:'no-store'});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){const err=new Error(body?.error||`Belief capture HTTP ${response.status}`);err.status=response.status;throw err}
    return body;
  }
  async function flush(){
    if(flushBusy||navigator.onLine===false)return false;flushBusy=true;
    try{
      const rows=await queueList(20);status.pending=await queueCount();
      for(const row of rows){
        try{await postRow(row);await queueDelete(row.id);status.lastUploadAt=Date.now();status.lastUploadError=''}
        catch(error){status.lastUploadError=error?.message||String(error);break}
      }
      status.pending=await queueCount();return true;
    }catch(error){status.lastUploadError=error?.message||String(error);return false}
    finally{flushBusy=false}
  }
  async function scan(trigger='state-poll'){
    if(document.visibilityState==='hidden')return;
    const key=quickKey();if(key===lastQuickKey)return;lastQuickKey=key;await capture(trigger);
  }
  function install(){
    if(installed)return;installed=true;status.installed=true;
    globalThis.__OTB_BELIEF_CAPTURE__={version:CLIENT_VERSION,status,capture,flush,buildSnapshot,queueList:()=>queueList(100),compactQueueItem};
    document.addEventListener('otb:role-freshness-applied',()=>setTimeout(()=>scan('role-freshness'),0));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){void scan('resume');void flush()}});
    window.addEventListener('online',()=>{void scan('online');void flush()});
    window.addEventListener('focus',()=>void scan('focus'));
    setTimeout(()=>{void capture('startup',{force:true});void flush()},400);
    pollTimer=setInterval(()=>void scan('state-poll'),POLL_MS);
    retryTimer=setInterval(()=>void flush(),RETRY_MS);
  }
  (function wait(){
    if(runtimeReady())return install();
    if(Date.now()-startedAt>READY_TIMEOUT_MS){alarm('CORE_UNAVAILABLE',new Error('Core runtime did not become ready; recorder not installed.'));return}
    setTimeout(wait,80);
  })();
})();
