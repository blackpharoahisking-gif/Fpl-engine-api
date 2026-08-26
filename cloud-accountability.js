/* OTB 2026.08.26.2 — canonical D1 projection accountability.
   The local Accuracy ledger remains the fast/offline copy. This layer mirrors
   each valid pre-deadline snapshot into D1 using a browser-held, non-exportable
   P-256 signing key. The reusable owner/evaluation secret is only needed once
   to enroll the device and is never persisted by this layer. */
(function(){
'use strict';

const BUILD='2026.08.26.2';
const DB_NAME='otb-accountability-v1';
const DB_STORE='credentials';
const DB_KEY='primary';
const STATUS_RETRY_MS=10*60*1000;
let INSTALLED=false;

function runtimeReady(){
  return typeof performProjectionSnapshotCapture==='function'
    &&typeof maybeAutoCaptureProjection==='function'
    &&typeof renderAccuracy==='function'
    &&typeof accuracySnapshotReady==='function'
    &&typeof ACCURACY!=='undefined'
    &&typeof API_BASE!=='undefined';
}
function escCloud(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function stableValue(value){
  if(Array.isArray(value))return value.map(stableValue);
  if(value&&typeof value==='object'){
    return Object.keys(value).sort().reduce((out,key)=>{out[key]=stableValue(value[key]);return out},{});
  }
  return value;
}
const stableJson=value=>JSON.stringify(stableValue(value));
async function sha256(value){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value)));
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function b64url(bytes){
  let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function toIso(value){
  if(value===null||value===undefined||value==='')return'';
  const n=Number(value);
  const ms=Number.isFinite(n)&&n>1e11?n:Date.parse(String(value));
  return Number.isFinite(ms)?new Date(ms).toISOString():'';
}
function deadlineFor(gw){
  try{return Number(accuracyDeadline(gw))}catch{return NaN}
}
function currentGw(){
  const next=Number(DATA?.nextEvent);
  return Number.isInteger(next)&&next>=1&&next<=38?next:Number(S?.gw||1);
}
function modelVersion(){
  const raw=String((typeof MODEL_RELEASE!=='undefined'&&MODEL_RELEASE)||'OTB-live');
  return(raw.replace(/[^A-Za-z0-9._-]/g,'-').slice(0,60)||'OTB-live');
}
function formulaRevision(snapshot){
  return String(snapshot?.settings?.scoringPolicy
    ||(typeof FPL_SCORING_POLICY_VERSION!=='undefined'&&FPL_SCORING_POLICY_VERSION)
    ||'otb-scoring-v1').slice(0,100);
}
function modelConfig(snapshot){
  const settings=snapshot?.settings||{};
  return{
    projectionWeights:{...(settings.weights||snapshot?.weights||{})},
    overrides:{...(settings.overrides||{})},
  };
}
function localOwnerToken(){
  try{
    if(typeof freshReviewOwnerToken==='function'){
      const token=String(freshReviewOwnerToken()||'').trim();
      if(token)return token;
    }
  }catch(_){}
  return'';
}

const CLOUD={
  credential:null,
  syncing:false,
  enrolling:false,
  autoEnrollTried:false,
  status:null,
  error:'',
  note:'',
  lastStatusAt:0,
  sourceRefreshQueued:false,
};

function idbOpen(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB'in window)){reject(new Error('IndexedDB is unavailable in this browser.'));return}
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('Could not open secure device storage.'));
  });
}
async function idbGet(){
  const db=await idbOpen();
  try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).get(DB_KEY);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  })}finally{db.close()}
}
async function idbPut(value){
  const db=await idbOpen();
  try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE,'readwrite'),req=tx.objectStore(DB_STORE).put(value,DB_KEY);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error||req.error);
  })}finally{db.close()}
}
async function idbDelete(){
  const db=await idbOpen();
  try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).delete(DB_KEY);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);
  })}finally{db.close()}
}
async function createCredential(){
  const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const publicJwk=await crypto.subtle.exportKey('jwk',pair.publicKey);
  const privateJwk=await crypto.subtle.exportKey('jwk',pair.privateKey);
  const privateKey=await crypto.subtle.importKey('jwk',privateJwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  return{
    deviceId:`otb-${crypto.randomUUID()}`,
    publicJwk:{kty:publicJwk.kty,crv:publicJwk.crv,x:publicJwk.x,y:publicJwk.y,ext:true,key_ops:['verify']},
    privateKey,
    enrolledAt:null,
  };
}
async function apiJson(path,options={}){
  const response=await fetch(API_BASE+path,{cache:'no-store',...options});
  let data={};try{data=await response.json()}catch(_){}
  if(!response.ok){
    const err=new Error(data?.error||`HTTP ${response.status}`);
    err.status=response.status;err.code=data?.code||'';err.data=data;throw err;
  }
  return data;
}
async function enrolWithToken(token,{manual=false}={}){
  token=String(token||'').trim();
  if(!token)throw new Error('Enter the owner/evaluation key once to link this browser.');
  if(CLOUD.enrolling)return false;
  CLOUD.enrolling=true;CLOUD.error='';CLOUD.note='Linking this browser to the canonical D1 ledger…';renderCloudPanel();
  try{
    let credential=CLOUD.credential||await idbGet();
    if(!credential?.privateKey||!credential?.publicJwk||!credential?.deviceId)credential=await createCredential();
    const data=await apiJson('/api/evaluation/device-enrol',{
      method:'POST',
      headers:{'content-type':'application/json','authorization':`Bearer ${token}`,'x-evaluation-key':token},
      body:JSON.stringify({deviceId:credential.deviceId,publicJwk:credential.publicJwk}),
    });
    credential.enrolledAt=data.enrolledAt||new Date().toISOString();
    await idbPut(credential);CLOUD.credential=credential;CLOUD.error='';
    CLOUD.note='Device linked. Future accountable snapshots sign and commit automatically; the owner key was not stored.';
    renderCloudPanel();
    const gw=currentGw(),snap=ACCURACY.ledger?.snapshots?.[gw];
    if(snap&&accuracySnapshotReady(gw))setTimeout(()=>void commitSnapshot(snap,{force:true}),0);
    return true;
  }catch(err){
    CLOUD.error=err.message||String(err);
    CLOUD.note=manual?'Device link failed. The local accountability snapshot remains intact.':'Existing owner key did not authorize D1 enrollment; use the link control in Accuracy.';
    renderCloudPanel();return false;
  }finally{CLOUD.enrolling=false;renderCloudPanel()}
}
async function ensureCredential(){
  if(CLOUD.credential?.privateKey)return CLOUD.credential;
  try{CLOUD.credential=await idbGet()}catch(err){CLOUD.error=err.message||String(err);renderCloudPanel();return null}
  if(CLOUD.credential?.privateKey)return CLOUD.credential;
  if(!CLOUD.autoEnrollTried){
    CLOUD.autoEnrollTried=true;
    const token=localOwnerToken();
    if(token){await enrolWithToken(token);return CLOUD.credential}
  }
  return null;
}

async function sourceHashFor(snapshot){
  const local=String(DATA?.worker?.meta?.dataHash||DATA?.worker?.meta?.data_hash||'').trim();
  if(local)return local;
  try{
    const health=await apiJson('/api/health');
    const hash=String(health?.dataHash||health?.data_hash||'').trim();
    if(!hash)return'';
    const localAt=Date.parse(toIso(snapshot?.dataUpdatedAt)),serverAt=Date.parse(health?.lastOfficialFetch||health?.pipeline?.lastSuccessAt||'');
    if(Number.isFinite(localAt)&&Number.isFinite(serverAt)&&Math.abs(localAt-serverAt)>95*60*1000)return'';
    return hash;
  }catch{return''}
}
async function snapshotPayload(snapshot){
  const version=modelVersion(),revision=formulaRevision(snapshot),weights=modelConfig(snapshot);
  const weightsHash=await sha256(stableJson({version,formulaRevision:revision,weights}));
  const sourceHash=await sourceHashFor(snapshot);
  if(!sourceHash)throw new Error('Canonical source hash is unavailable; refresh live data before D1 commit.');
  const sourceAt=toIso(snapshot?.dataUpdatedAt||DATA?.lastUpdated);
  const localAt=toIso(snapshot?.capturedAt);
  if(!sourceAt||!localAt)throw new Error('Snapshot timestamps are incomplete.');
  const projections=(snapshot?.rows||[]).map(row=>{
    const low=Number(row?.[2]),high=Number(row?.[3]),x=Number(row?.[1]);
    const sd=Number.isFinite(Number(row?.[11]))?Number(row[11]):Math.max(.001,(high-low)/(2*1.2815515655446004));
    const noMarket=row?.[12]===null||row?.[12]===undefined?null:Number(row[12]);
    return{
      playerId:Number(row?.[0]),xpts:x,low,high,sd,
      confidence:Number(row?.[4]),expectedMinutes:Number(row?.[5]),
      pStart:Number(row?.[6]),pAppear:Number(row?.[7]),availability:Number(row?.[8]),
      fixtureCount:Number(row?.[10]||0),noMarketXPts:Number.isFinite(noMarket)?noMarket:null,
    };
  });
  return{
    season:String((typeof EXPECTED_SEASON!=='undefined'&&EXPECTED_SEASON)||'2026/27'),
    gw:Number(snapshot.gw),
    modelVersion:version,
    formulaRevision:revision,
    weights,weightsHash,
    clientSourceHash:sourceHash,
    sourceDataUpdatedAt:sourceAt,
    sourceDataMode:String(snapshot?.dataMode||DATA?.mode||'').toUpperCase(),
    localCapturedAt:localAt,
    snapshotChecksum:String(snapshot.checksum||''),
    selectionFingerprint:String(snapshot.selectionFingerprint||''),
    selection:snapshot.selection||{},
    settings:snapshot.settings||{},
    projections,
  };
}
async function signedPost(payload,credential){
  const body=JSON.stringify(payload),timestamp=String(Date.now()),hash=await sha256(body);
  const message=`${timestamp}\nPOST\n/api/evaluation/browser-projections\n${hash}`;
  const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},credential.privateKey,new TextEncoder().encode(message));
  return apiJson('/api/evaluation/browser-projections',{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'x-evaluation-device':credential.deviceId,
      'x-evaluation-timestamp':timestamp,
      'x-evaluation-signature':b64url(signature),
    },
    body,
  });
}
function queueSourceRefresh(){
  if(CLOUD.sourceRefreshQueued)return;
  CLOUD.sourceRefreshQueued=true;
  setTimeout(async()=>{
    try{
      if(navigator.onLine!==false&&typeof refreshLiveData==='function')await refreshLiveData(false);
      if(typeof maybeAutoCaptureProjection==='function')await maybeAutoCaptureProjection();
    }catch(_){}
    finally{CLOUD.sourceRefreshQueued=false}
  },1200);
}
async function commitSnapshot(snapshot,{force=false}={}){
  if(!snapshot||navigator.onLine===false||CLOUD.syncing)return false;
  const gw=Number(snapshot.gw),deadline=deadlineFor(gw);
  if(!Number.isFinite(deadline)||Date.now()>=deadline)return false;
  if(!accuracySnapshotReady(gw))return false;
  if(!force&&CLOUD.status?.verified&&CLOUD.status?.sourceCurrent&&CLOUD.status?.snapshotChecksum===snapshot.checksum)return true;
  const credential=await ensureCredential();
  if(!credential){CLOUD.note='Local forecast is captured, but this browser is not linked to the canonical D1 ledger.';renderCloudPanel();return false}
  CLOUD.syncing=true;CLOUD.error='';CLOUD.note=`Signing and committing GW${gw} to D1…`;renderCloudPanel();
  try{
    const payload=await snapshotPayload(snapshot),result=await signedPost(payload,credential);
    CLOUD.note=`GW${gw} canonical forecast committed · ${result.playerCount}/${result.required} players${result.personalCaptured?' · personal XI captured':''}.`;
    CLOUD.error='';await refreshCloudStatus(gw,{quiet:true,modelVersion:payload.modelVersion,weightsHash:payload.weightsHash});
    return true;
  }catch(err){
    CLOUD.error=err.message||String(err);
    if(err.status===401){CLOUD.note='This device needs to be re-linked with the owner/evaluation key.'}
    else if(err.code==='SOURCE_CHANGED'||err.code==='SOURCE_STALE'){CLOUD.note='Worker data moved after the local snapshot. OTB is refreshing and will recapture before retrying.';queueSourceRefresh()}
    else CLOUD.note='Local accountability is safe; the canonical D1 copy will retry when OTB is online.';
    renderCloudPanel();return false;
  }finally{CLOUD.syncing=false;renderCloudPanel()}
}
async function refreshCloudStatus(gw=currentGw(),{quiet=false,modelVersion:mv='',weightsHash:wh=''}={}){
  if(navigator.onLine===false)return null;
  try{
    const params=new URLSearchParams({gw:String(gw)});
    if(mv)params.set('model_version',mv);if(wh)params.set('weights_hash',wh);
    const data=await apiJson('/api/evaluation/browser-status?'+params);
    CLOUD.status=data;CLOUD.lastStatusAt=Date.now();if(!quiet)CLOUD.error='';
    renderCloudPanel();return data;
  }catch(err){if(!quiet)CLOUD.error=err.message||String(err);renderCloudPanel();return null}
}
function cloudTone(gw,snapshot){
  const deadline=deadlineFor(gw),hours=Number.isFinite(deadline)?(deadline-Date.now())/36e5:null,s=CLOUD.status;
  if(s?.verified&&s?.sourceCurrent&&snapshot&&s.snapshotChecksum===snapshot.checksum)return{key:'good',label:'D1 VERIFIED'};
  if(s?.verified&&s?.sourceCurrent)return{key:'good',label:'D1 COMMITTED'};
  if(s?.verified&&!s?.sourceCurrent)return{key:'warn',label:'D1 SOURCE OLD'};
  if(Number.isFinite(hours)&&hours<=3&&hours>0&&snapshot)return{key:'bad',label:'ACCOUNTABILITY AT RISK'};
  if(snapshot)return{key:'warn',label:'LOCAL ONLY'};
  return{key:'warn',label:'NO FORECAST'};
}
function ensureCloudPanel(){
  let box=document.getElementById('accuracyCloudCommit');
  if(box)return box;
  const parent=document.getElementById('pAccuracy'),anchor=document.getElementById('accuracyStatus');
  if(!parent)return null;
  box=document.createElement('div');box.id='accuracyCloudCommit';
  box.style.cssText='margin:8px 12px;padding:10px 12px;border:1px solid rgba(4,245,255,.28);border-radius:5px;background:rgba(4,245,255,.05);font-size:10px;line-height:1.45';
  if(anchor?.parentNode)anchor.parentNode.insertBefore(box,anchor.nextSibling);else parent.prepend(box);
  return box;
}
function renderCloudPanel(){
  const box=ensureCloudPanel();if(!box)return;
  const gw=currentGw(),snapshot=ACCURACY?.ledger?.snapshots?.[gw]||null,tone=cloudTone(gw,snapshot),s=CLOUD.status;
  const local=snapshot&&accuracySnapshotReady(gw)
    ?`Local: ${snapshot.rows.length} players · ${new Date(snapshot.capturedAt).toLocaleString()}`
    :'Local: no accountable pre-deadline snapshot yet';
  const remote=s?.verified
    ?`D1: ${s.playerCount}/${s.required} · ${s.serverReceivedAt?new Date(s.serverReceivedAt).toLocaleString():'committed'}${s.personalCaptured?' · XI/C/VC/bench/chip saved':''}${s.sourceCurrent?'':' · source has since changed'}`
    :'D1: no verified canonical OTB forecast for this GW';
  const device=CLOUD.credential?.deviceId?`Device linked · ${CLOUD.credential.deviceId.slice(-8)}`:'Device not linked';
  const err=CLOUD.error?`<div style="margin-top:5px;color:#FF91B5">${escCloud(CLOUD.error)}</div>`:'';
  const note=CLOUD.note?`<div style="margin-top:4px;color:var(--muted)">${escCloud(CLOUD.note)}</div>`:'';
  const needsLink=!CLOUD.credential?.deviceId;
  box.innerHTML=`<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <div><b style="color:${tone.key==='good'?'var(--mint)':tone.key==='bad'?'#FF91B5':'#FFD75E'}">${tone.label}</b>
      <div style="color:var(--paper);margin-top:2px">${escCloud(local)}</div>
      <div style="color:var(--paper)">${escCloud(remote)}</div>
      <div style="color:var(--muted)">${escCloud(device)}</div>${note}${err}</div>
    <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
      ${needsLink?'<input id="accuracyCloudKey" type="password" autocomplete="off" placeholder="Owner/evaluation key" aria-label="Owner or evaluation key for one-time D1 device enrollment" style="max-width:170px;background:#160019;border:1px solid var(--line);border-radius:3px;padding:6px;color:var(--paper);font-size:10px"><button type="button" id="accuracyCloudEnroll" class="btn ghost">Link device</button>':''}
      <button type="button" id="accuracyCloudVerify" class="btn ghost">Verify D1</button>
      ${CLOUD.credential?.deviceId?'<button type="button" id="accuracyCloudForget" class="btn ghost">Forget device</button>':''}
    </div></div>`;
  const enroll=document.getElementById('accuracyCloudEnroll');
  if(enroll)enroll.onclick=()=>{const token=String(document.getElementById('accuracyCloudKey')?.value||'').trim();void enrolWithToken(token,{manual:true})};
  const verify=document.getElementById('accuracyCloudVerify');
  if(verify)verify.onclick=()=>void refreshCloudStatus(gw);
  const forget=document.getElementById('accuracyCloudForget');
  if(forget)forget.onclick=async()=>{try{await idbDelete();CLOUD.credential=null;CLOUD.status=null;CLOUD.note='Local device credential removed. The already committed D1 history remains immutable.';renderCloudPanel()}catch(err){CLOUD.error=err.message||String(err);renderCloudPanel()}};
}
async function install(){
  if(INSTALLED||!runtimeReady())return false;
  INSTALLED=true;
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge){badge.textContent='BUILD 08.26.2';badge.title='OTB canonical D1 accountability + official chip-history availability';}

  try{CLOUD.credential=await idbGet()}catch(err){CLOUD.error=err.message||String(err)}
  renderCloudPanel();

  const baseCapture=performProjectionSnapshotCapture;
  performProjectionSnapshotCapture=async function(...args){
    const snapshot=await baseCapture.apply(this,args);
    setTimeout(()=>void commitSnapshot(snapshot),0);
    return snapshot;
  };

  const baseRenderAccuracy=renderAccuracy;
  renderAccuracy=function(...args){
    const out=baseRenderAccuracy.apply(this,args);
    renderCloudPanel();
    const gw=Number(document.getElementById('accuracyGw')?.value||currentGw());
    if(Date.now()-CLOUD.lastStatusAt>60*1000)setTimeout(()=>void refreshCloudStatus(gw,{quiet:true}),0);
    return out;
  };

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')return;
    const gw=currentGw(),snap=ACCURACY.ledger?.snapshots?.[gw];
    void refreshCloudStatus(gw,{quiet:true});
    if(snap&&accuracySnapshotReady(gw))setTimeout(()=>void commitSnapshot(snap),250);
  });
  window.addEventListener('online',()=>{
    const gw=currentGw(),snap=ACCURACY.ledger?.snapshots?.[gw];
    void refreshCloudStatus(gw,{quiet:true});
    if(snap&&accuracySnapshotReady(gw))setTimeout(()=>void commitSnapshot(snap),250);
  });
  setInterval(()=>{
    if(document.visibilityState!=='visible'||navigator.onLine===false)return;
    const gw=currentGw(),snap=ACCURACY.ledger?.snapshots?.[gw];
    void refreshCloudStatus(gw,{quiet:true});
    if(snap&&accuracySnapshotReady(gw))void commitSnapshot(snap);
  },STATUS_RETRY_MS);

  const gw=currentGw(),snapshot=ACCURACY.ledger?.snapshots?.[gw];
  await refreshCloudStatus(gw,{quiet:true});
  if(!CLOUD.credential&&!CLOUD.autoEnrollTried){
    CLOUD.autoEnrollTried=true;const token=localOwnerToken();if(token)await enrolWithToken(token);
  }
  if(snapshot&&accuracySnapshotReady(gw))setTimeout(()=>void commitSnapshot(snapshot,{force:true}),200);
  renderCloudPanel();
  return true;
}
window.installOtbCloudAccountabilityPatch=install;

let tries=0;
const timer=setInterval(()=>{
  if(runtimeReady()){clearInterval(timer);void install();return}
  if(++tries>600)clearInterval(timer);
},100);
})();
