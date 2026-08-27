/* OTB immutable accountability v2.
   ---------------------------------------------------------------
   Mirrors every valid local pre-deadline Accuracy snapshot into an append-only
   D1 ledger. It reuses the browser's existing non-exportable P-256 device key,
   but signs a v2 endpoint whose snapshot identity includes a SHA-256 manifest
   of the projection-semantic source files. This layer never changes xPts. */
(function installImmutableAccountabilityV2(){
  'use strict';
  const READY_TIMEOUT_MS=20000;
  const DB_NAME='otb-accountability-v1',DB_STORE='credentials',DB_KEY='primary';
  const ROUTE='/api/evaluation/v2/browser-projections';
  const STATUS_ROUTE='/api/evaluation/v2/browser-status';
  const SEMANTIC_SOURCES=['app-core.js','app-live-points.js','scoring-integrity.js','market-projection-sync.js'];
  const startedAt=Date.now();
  let installed=false,manifestPromise=null,lastStatusAt=0;
  const STATE={syncing:false,status:null,error:'',note:'',lastCommitted:''};

  function stableValue(value){if(Array.isArray(value))return value.map(stableValue);if(value&&typeof value==='object')return Object.keys(value).sort().reduce((o,k)=>{o[k]=stableValue(value[k]);return o},{});return value}
  const stableJson=value=>JSON.stringify(stableValue(value));
  async function sha256(value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value)));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}
  function b64url(bytes){let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function toIso(value){if(value===null||value===undefined||value==='')return'';const n=Number(value),ms=Number.isFinite(n)&&n>1e11?n:Date.parse(String(value));return Number.isFinite(ms)?new Date(ms).toISOString():''}
  function currentBuild(){return String(document.documentElement?.dataset?.build||(typeof APP_BUILD!=='undefined'?APP_BUILD:'')||'').trim()}
  function currentGw(){const n=Number(DATA?.nextEvent);return Number.isInteger(n)&&n>=1&&n<=38?n:Number(S?.gw||1)}
  function deadlineForGw(gw){try{return Number(accuracyDeadline(gw))}catch{return NaN}}
  function runtimeReady(){return typeof performProjectionSnapshotCapture==='function'&&typeof accuracySnapshotReady==='function'&&typeof renderAccuracy==='function'&&typeof API_BASE!=='undefined'&&typeof DATA!=='undefined'&&typeof S!=='undefined'&&typeof ACCURACY!=='undefined'}

  function idbOpen(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(new Error('IndexedDB unavailable'));return}const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Could not open device storage'))})}
  async function credential(){const db=await idbOpen();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).get(DB_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}finally{db.close()}}

  async function apiJson(path,options={}){const r=await fetch(API_BASE+path,{cache:'no-store',...options});let data={};try{data=await r.json()}catch(_){}if(!r.ok){const e=new Error(data?.error||`HTTP ${r.status}`);e.status=r.status;e.code=data?.code||'';throw e}return data}
  async function modelManifest(){
    if(manifestPromise)return manifestPromise;
    manifestPromise=(async()=>{
      const build=currentBuild(),rows=[];
      for(const path of SEMANTIC_SOURCES){
        const sep=path.includes('?')?'&':'?',r=await fetch(`${path}${sep}audit_build=${encodeURIComponent(build)}`,{cache:'no-store'});
        if(!r.ok)throw new Error(`Could not hash projection source ${path} (${r.status})`);
        const text=await r.text();rows.push({path,sha256:await sha256(text),bytes:new TextEncoder().encode(text).length});
      }
      return{manifest:rows,modelCodeHash:await sha256(stableJson(rows))};
    })().catch(err=>{manifestPromise=null;throw err});
    return manifestPromise;
  }
  async function sourceHashFor(snapshot){
    const local=String(DATA?.worker?.meta?.dataHash||DATA?.worker?.meta?.data_hash||'').trim();if(local)return local;
    try{const h=await apiJson('/api/health'),hash=String(h?.dataHash||h?.data_hash||'').trim(),localAt=Date.parse(toIso(snapshot?.dataUpdatedAt)),serverAt=Date.parse(h?.lastOfficialFetch||h?.pipeline?.lastSuccessAt||'');if(!hash||!Number.isFinite(localAt)||!Number.isFinite(serverAt)||Math.abs(localAt-serverAt)>5*60*1000)return'';return hash}catch{return''}
  }
  function weightsFor(snapshot){const settings=snapshot?.settings||{};return{projectionWeights:{...(settings.weights||snapshot?.weights||S?.w||{})},overrides:{...(settings.overrides||{})}}}
  function formulaRevision(snapshot){return String(snapshot?.settings?.scoringPolicy||(typeof FPL_SCORING_POLICY_VERSION!=='undefined'?FPL_SCORING_POLICY_VERSION:'otb-scoring-v1')).slice(0,100)}
  async function payloadFor(snapshot){
    const build=currentBuild();if(!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(build))throw new Error('Current OTB build identity is unavailable');
    const {manifest,modelCodeHash}=await modelManifest(),weights=weightsFor(snapshot),weightsHash=await sha256(stableJson(weights)),sourceHash=await sourceHashFor(snapshot);
    if(!sourceHash)throw new Error('Canonical source hash unavailable; refresh live data before immutable commit');
    const sourceAt=toIso(snapshot?.dataUpdatedAt||DATA?.lastUpdated),localAt=toIso(snapshot?.capturedAt);if(!sourceAt||!localAt)throw new Error('Snapshot timestamps are incomplete');
    const projections=(snapshot?.rows||[]).map(row=>{const low=Number(row?.[2]),high=Number(row?.[3]),x=Number(row?.[1]),sd=Number.isFinite(Number(row?.[11]))?Number(row[11]):Math.max(.001,(high-low)/(2*1.2815515655446004)),noMarket=row?.[12]===null||row?.[12]===undefined?null:Number(row[12]);return{playerId:Number(row?.[0]),xpts:x,low,high,sd,confidence:Number(row?.[4]),expectedMinutes:Number(row?.[5]),pStart:Number(row?.[6]),pAppear:Number(row?.[7]),availability:Number(row?.[8]),fixtureCount:Number(row?.[10]||0),noMarketXpts:Number.isFinite(noMarket)?noMarket:null}});
    return{season:String((typeof EXPECTED_SEASON!=='undefined'&&EXPECTED_SEASON)||'2026/27'),gw:Number(snapshot.gw),appBuild:build,modelCodeHash,modelManifest:manifest,formulaRevision:formulaRevision(snapshot),weights,weightsHash,clientSourceHash:sourceHash,sourceDataUpdatedAt:sourceAt,sourceDataMode:String(snapshot?.dataMode||DATA?.mode||'').toUpperCase(),localCapturedAt:localAt,snapshotChecksum:String(snapshot.checksum||''),selectionFingerprint:String(snapshot.selectionFingerprint||''),selection:snapshot.selection||{},settings:snapshot.settings||{},projections};
  }
  async function signedPost(payload,cred){const body=JSON.stringify(payload),timestamp=String(Date.now()),hash=await sha256(body),message=`${timestamp}\nPOST\n${ROUTE}\n${hash}`,signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},cred.privateKey,new TextEncoder().encode(message));return apiJson(ROUTE,{method:'POST',headers:{'content-type':'application/json','x-evaluation-device':cred.deviceId,'x-evaluation-timestamp':timestamp,'x-evaluation-signature':b64url(signature)},body})}

  async function commit(snapshot,{force=false}={}){
    if(!snapshot||navigator.onLine===false||STATE.syncing)return false;const gw=Number(snapshot.gw),deadline=deadlineForGw(gw);if(!Number.isFinite(deadline)||Date.now()>=deadline||!accuracySnapshotReady(gw))return false;
    const cred=await credential().catch(()=>null);if(!cred?.privateKey||!cred?.deviceId){STATE.note='Immutable v2 ledger is waiting for the existing D1 device link.';renderPanel();return false}
    STATE.syncing=true;STATE.error='';STATE.note=`Hashing model semantics and committing GW${gw} append-only…`;renderPanel();
    try{
      const payload=await payloadFor(snapshot),localKey=`${payload.appBuild}|${payload.modelCodeHash}|${payload.snapshotChecksum}|${payload.localCapturedAt}`;
      if(!force&&STATE.lastCommitted===localKey)return true;
      const result=await signedPost(payload,cred);STATE.lastCommitted=localKey;STATE.note=`Immutable D1 v2 committed · ${result.playerCount}/${result.required} players · code ${payload.modelCodeHash.slice(0,10)}.`;STATE.error='';await refreshStatus(gw,{quiet:true});return true;
    }catch(err){STATE.error=err.message||String(err);STATE.note=err.code==='SOURCE_CHANGED'||err.code==='SOURCE_STALE'?'Canonical source moved; refresh and recapture before retrying.':'Local snapshot remains intact; immutable D1 v2 will retry when valid.';renderPanel();return false}
    finally{STATE.syncing=false;renderPanel()}
  }
  async function refreshStatus(gw=currentGw(),{quiet=false}={}){if(navigator.onLine===false)return null;try{const data=await apiJson(`${STATUS_ROUTE}?gw=${encodeURIComponent(gw)}`);STATE.status=data;lastStatusAt=Date.now();if(!quiet)STATE.error='';renderPanel();return data}catch(err){if(!quiet)STATE.error=err.message||String(err);renderPanel();return null}}

  function ensurePanel(){let box=document.getElementById('accuracyLedgerV2');if(box)return box;const parent=document.getElementById('pAccuracy'),legacy=document.getElementById('accuracyCloudCommit');if(!parent)return null;box=document.createElement('div');box.id='accuracyLedgerV2';box.style.cssText='margin:8px 12px;padding:9px 11px;border:1px solid rgba(0,255,135,.28);border-radius:5px;background:rgba(0,255,135,.035);font-size:10px;line-height:1.45';if(legacy?.parentNode)legacy.parentNode.insertBefore(box,legacy.nextSibling);else parent.prepend(box);return box}
  function renderPanel(){const box=ensurePanel();if(!box)return;const s=STATE.status,a=s?.audit,c=s?.canonical,hash=c?.model_code_hash||c?.modelCodeHash||'',build=c?.app_build||c?.appBuild||'',events=a?.captureEvents||{};box.innerHTML=`<div style="display:flex;gap:8px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap"><div><b style="color:var(--mint)">IMMUTABLE D1 V2</b><div style="color:var(--paper);margin-top:2px">${c?`Canonical: build ${build||'—'} · code ${hash?hash.slice(0,10):'—'} · ${c.player_count||c.playerCount||0} players`:'No v2 canonical snapshot yet'}</div><div style="color:var(--muted)">${a?`${a.snapshots||0} immutable snapshot(s) · ${a.distinctBuilds||0} build(s) · events A${events.accepted||0}/D${events.duplicate||0}/R${events.rejected||0}`:'Audit counts unavailable'}</div>${STATE.note?`<div style="color:var(--muted);margin-top:3px">${String(STATE.note).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</div>`:''}${STATE.error?`<div style="color:#FF91B5;margin-top:3px">${String(STATE.error).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</div>`:''}</div><button type="button" class="btn ghost" id="accuracyLedgerV2Verify">Verify immutable ledger</button></div>`;const b=document.getElementById('accuracyLedgerV2Verify');if(b)b.onclick=()=>void refreshStatus()}

  async function install(){
    if(installed||!runtimeReady())return false;installed=true;
    const baseCapture=performProjectionSnapshotCapture;
    performProjectionSnapshotCapture=async function(...args){const snapshot=await baseCapture.apply(this,args);setTimeout(()=>void commit(snapshot),0);return snapshot};
    const baseRender=renderAccuracy;
    renderAccuracy=function(...args){const out=baseRender.apply(this,args);renderPanel();const gw=Number(document.getElementById('accuracyGw')?.value||currentGw());if(Date.now()-lastStatusAt>60*1000)setTimeout(()=>void refreshStatus(gw,{quiet:true}),0);return out};
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;const gw=currentGw(),snap=ACCURACY?.ledger?.snapshots?.[gw];void refreshStatus(gw,{quiet:true});if(snap&&accuracySnapshotReady(gw))setTimeout(()=>void commit(snap),400)});
    window.addEventListener('online',()=>{const gw=currentGw(),snap=ACCURACY?.ledger?.snapshots?.[gw];void refreshStatus(gw,{quiet:true});if(snap&&accuracySnapshotReady(gw))setTimeout(()=>void commit(snap),400)});
    await refreshStatus(currentGw(),{quiet:true});const snap=ACCURACY?.ledger?.snapshots?.[currentGw()];if(snap&&accuracySnapshotReady(currentGw()))setTimeout(()=>void commit(snap,{force:true}),600);renderPanel();
    globalThis.__OTB_ACCOUNTABILITY_V2__={commit,refreshStatus,modelManifest,state:STATE};return true;
  }
  function wait(){if(runtimeReady()){void install();return}if(Date.now()-startedAt<READY_TIMEOUT_MS)setTimeout(wait,100)}
  wait();
})();
