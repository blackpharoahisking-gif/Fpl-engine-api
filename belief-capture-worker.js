/* OTB Belief Capture v0 — append-only R2 writer.
   Bind OTB_IRRECOVERABLE to the existing no-lifecycle irrecoverable R2 bucket.
   Optional secrets/vars:
     BELIEF_CAPTURE_KEY      bearer/shared key required for writes when set
     BELIEF_CAPTURE_ORIGINS  comma-separated allowed browser origins
*/

const SCHEMA='otb-belief-event-v0';
const MAX_BODY_BYTES=2_000_000;

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
async function sha256Value(value){return sha256Text(stableJson(value))}
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
function configuredOrigins(env){return String(env.BELIEF_CAPTURE_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)}
function corsHeaders(request,env){
  const origin=request.headers.get('origin')||'',allowed=configuredOrigins(env),ok=!origin||!allowed.length||allowed.includes(origin);
  return{ok,headers:{'access-control-allow-origin':ok&&origin?origin:(allowed.length?'null':'*'),'access-control-allow-methods':'POST,OPTIONS,GET','access-control-allow-headers':'content-type,authorization,x-belief-capture-key','vary':'Origin'}};
}
function tokenFrom(request){
  const explicit=request.headers.get('x-belief-capture-key')||'',auth=request.headers.get('authorization')||'';
  return explicit||(/^Bearer\s+/i.test(auth)?auth.replace(/^Bearer\s+/i,'').trim():'');
}
function sameToken(a,b){
  a=String(a||'');b=String(b||'');if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
function safeIso(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?new Date(ms).toISOString():new Date().toISOString()}
function eventKey(row){
  const gw=Math.max(1,Math.min(38,Number(row?.event?.gw||row?.snapshot?.gw||1)|0)),iso=safeIso(row?.event?.capturedAt),day=iso.slice(0,10),stamp=iso.replace(/[-:.TZ]/g,'');
  const id=String(row?.id||crypto.randomUUID()).replace(/[^A-Za-z0-9._-]/g,'-').slice(0,160);
  return`belief/events/gw-${String(gw).padStart(2,'0')}/${day}/${stamp}-${id}.json`;
}
function snapshotKey(hash){return`belief/snapshots/sha256/${hash}.json`}
async function putSnapshot(bucket,hash,snapshot,metadata){
  const key=snapshotKey(hash),existing=await bucket.head(key);if(existing)return{key,stored:false,existing:true};
  await bucket.put(key,stableJson(snapshot),{httpMetadata:{contentType:'application/json'},customMetadata:metadata});
  return{key,stored:true,existing:false};
}

export async function handleRequest(request,env){
  const cors=corsHeaders(request,env);if(request.method==='OPTIONS')return new Response(null,{status:cors.ok?204:403,headers:cors.headers});
  if(!cors.ok)return json({status:'error',error:'Origin not allowed'},403,cors.headers);
  const url=new URL(request.url);
  if(request.method==='GET'&&url.pathname==='/api/belief-capture/v0/health')return json({status:'ok',schema:SCHEMA,r2:!!env.OTB_IRRECOVERABLE,authRequired:!!env.BELIEF_CAPTURE_KEY},200,cors.headers);
  if(url.pathname!=='/api/belief-capture/v0/events'||request.method!=='POST')return json({status:'error',error:'Not found'},404,cors.headers);
  if(!env.OTB_IRRECOVERABLE)return json({status:'error',error:'R2 binding OTB_IRRECOVERABLE is missing'},503,cors.headers);
  if(env.BELIEF_CAPTURE_KEY&&!sameToken(tokenFrom(request),env.BELIEF_CAPTURE_KEY))return json({status:'error',error:'Unauthorized'},401,cors.headers);

  const text=await request.text();
  if(text.length>MAX_BODY_BYTES)return json({status:'error',error:'Belief event exceeds size limit'},413,cors.headers);
  let row;try{row=JSON.parse(text)}catch{return json({status:'error',error:'Invalid JSON'},400,cors.headers)}
  if(!row||typeof row!=='object'||!row.snapshot||!row.event)return json({status:'error',error:'snapshot and event are required'},400,cors.headers);

  /* Verification is descriptive, never a veto. A bad claimed hash produces a
     degraded row with the computed hash; it does not erase the observation. */
  let computedHash='',hashCheck=false,hashError='';
  try{computedHash=await sha256Value(row.snapshot);hashCheck=String(row.snapshotHash||'')===computedHash}
  catch(error){hashError=error?.message||String(error);computedHash=String(row.snapshotHash||await sha256Text(text))}
  const checks={snapshotHash:hashCheck,hashError:hashError||null};
  const snapshotMeta={schema:String(row.snapshot?.schemaVersion||SCHEMA).slice(0,100),gw:String(row.snapshot?.gw||row.event?.gw||''),runtimeHash:String(row.snapshot?.runtime?.decisionRuntimeHash||'').slice(0,64)};
  let snapshotWrite={key:snapshotKey(computedHash),stored:false,existing:false},snapshotStored=false,snapshotError='';
  try{snapshotWrite=await putSnapshot(env.OTB_IRRECOVERABLE,computedHash,row.snapshot,snapshotMeta);snapshotStored=true}
  catch(error){snapshotError=error?.message||String(error)}

  const storedEvent={
    ...row,
    snapshotHash:computedHash,
    claimedSnapshotHash:String(row.snapshotHash||''),
    snapshotRef:snapshotWrite.key,
    verification:{reproducible:hashCheck&&snapshotStored,checks,snapshotStored,snapshotError:snapshotError||null,writerVersion:'belief-writer-v0.1'},
    receivedAt:new Date().toISOString(),
  };
  if(snapshotStored)delete storedEvent.snapshot;
  const key=eventKey(row);
  try{
    const existing=await env.OTB_IRRECOVERABLE.head(key);
    if(existing)return json({status:'ok',duplicate:true,eventKey:key,snapshotHash:computedHash,snapshotRef:snapshotWrite.key,snapshotStored,reproducible:storedEvent.verification.reproducible,checks},200,cors.headers);
    await env.OTB_IRRECOVERABLE.put(key,JSON.stringify(storedEvent),{httpMetadata:{contentType:'application/json'},customMetadata:{gw:String(row.event?.gw||row.snapshot?.gw||''),snapshotHash:computedHash,reproducible:String(!!storedEvent.verification.reproducible)}});
  }catch(error){return json({status:'error',error:'Event archive write failed',detail:error?.message||String(error),snapshotStored,snapshotRef:snapshotWrite.key},503,cors.headers)}
  return json({status:'ok',eventKey:key,snapshotHash:computedHash,snapshotRef:snapshotWrite.key,snapshotStored,reproducible:storedEvent.verification.reproducible,checks},201,cors.headers);
}

export default{fetch:handleRequest};
