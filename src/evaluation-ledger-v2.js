// OTB accountability v2 — immutable, content-addressed projection ledger.
// Raw accepted snapshots are append-only by snapshot_id. Canonical selection
// is a query over immutable captures; no accepted projection vector is updated
// in place. Model identity includes a SHA-256 over the projection-semantic
// source manifest, not only numeric weights.

const MIN_PLAYERS=300;
const MAX_PLAYERS=800;
const SIGNATURE_MAX_SKEW_MS=5*60*1000;
const SOURCE_MAX_DRIFT_MS=95*60*1000;
const DEFAULT_SEASON='2026/27';
const ROUTE='/api/evaluation/v2/browser-projections';

const num=(v,d=0)=>v===null||v===undefined||v===''||Number.isNaN(+v)?d:+v;
const now=()=>new Date().toISOString();
function stableValue(value){
  if(Array.isArray(value))return value.map(stableValue);
  if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>{out[key]=stableValue(value[key]);return out},{});
  return value;
}
const stableJson=value=>JSON.stringify(stableValue(value));
async function sha256(value){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value)));
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function configuredSeason(env){return String(env?.FPL_SEASON||DEFAULT_SEASON)}
function allowedOrigin(env){return String(env.EVALUATION_ALLOWED_ORIGIN||env.ALLOWED_ORIGIN||'').trim()}
function cors(env,origin=''){
  const allowed=allowedOrigin(env);
  return{
    'access-control-allow-origin':allowed||origin||'*',
    'access-control-allow-methods':'GET, POST, OPTIONS',
    'access-control-allow-headers':'content-type, authorization, x-admin-key, x-evaluation-key, x-evaluation-device, x-evaluation-timestamp, x-evaluation-signature',
    'access-control-max-age':'86400','vary':'Origin',
  };
}
function response(env,origin,body,status=200){return new Response(status===204?null:JSON.stringify(body),{status,headers:{...(status===204?{}:{'content-type':'application/json; charset=utf-8'}),'cache-control':'no-store',...cors(env,origin)}})}
function clean(value,max=120){return String(value??'').replace(/[\u0000-\u001f]/g,'').slice(0,max)}
function cleanId(value,max=120){return String(value||'').replace(/[^A-Za-z0-9._:-]/g,'').slice(0,max)}
function b64urlBytes(value){const s=String(value||'').replace(/-/g,'+').replace(/_/g,'/'),p=s+'='.repeat((4-s.length%4)%4),b=atob(p);return Uint8Array.from(b,c=>c.charCodeAt(0))}

let SCHEMA_READY=false;
async function ensureSchema(env){
  if(SCHEMA_READY)return;
  await env.DB.batch([
    /* v2 is dispatched before the legacy handler, so a fresh database must
       still be able to verify an already-enrolled/shared device safely. */
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_devices (
      device_id TEXT PRIMARY KEY,
      public_jwk TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_v2_capture_events (
      event_id TEXT PRIMARY KEY,
      capture_key TEXT,
      season TEXT,
      gw INTEGER,
      app_build TEXT,
      model_code_hash TEXT,
      snapshot_checksum TEXT,
      device_id TEXT,
      status TEXT NOT NULL,
      reason TEXT,
      received_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_eval_v2_events_gw ON evaluation_v2_capture_events(season,gw,received_at DESC)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_v2_model_semantics (
      model_code_hash TEXT PRIMARY KEY,
      app_build TEXT NOT NULL,
      manifest_json TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_v2_snapshots (
      snapshot_id TEXT PRIMARY KEY,
      capture_key TEXT NOT NULL UNIQUE,
      season TEXT NOT NULL,
      gw INTEGER NOT NULL,
      app_build TEXT NOT NULL,
      model_code_hash TEXT NOT NULL,
      weights_hash TEXT NOT NULL,
      formula_revision TEXT NOT NULL,
      snapshot_checksum TEXT NOT NULL,
      selection_fingerprint TEXT,
      device_id TEXT NOT NULL,
      body_hash TEXT NOT NULL,
      player_count INTEGER NOT NULL,
      source_hash TEXT NOT NULL,
      source_data_updated_at TEXT NOT NULL,
      source_data_mode TEXT NOT NULL,
      local_captured_at TEXT NOT NULL,
      committed_at TEXT NOT NULL,
      deadline_time TEXT NOT NULL,
      selection_json TEXT NOT NULL,
      settings_json TEXT NOT NULL,
      model_config_json TEXT NOT NULL,
      FOREIGN KEY(model_code_hash) REFERENCES evaluation_v2_model_semantics(model_code_hash)
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_eval_v2_snapshots_canonical ON evaluation_v2_snapshots(season,gw,local_captured_at DESC,committed_at DESC)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_v2_predictions (
      snapshot_id TEXT NOT NULL,
      player_id INTEGER NOT NULL,
      web_name TEXT NOT NULL,
      team_code TEXT NOT NULL,
      position INTEGER NOT NULL,
      price INTEGER NOT NULL,
      xpts REAL NOT NULL,
      low REAL NOT NULL,
      high REAL NOT NULL,
      sd REAL NOT NULL,
      confidence REAL NOT NULL,
      expected_minutes REAL NOT NULL,
      p_start REAL NOT NULL,
      p_appear REAL NOT NULL,
      availability REAL NOT NULL,
      fixture_count INTEGER NOT NULL,
      no_market_xpts REAL,
      PRIMARY KEY(snapshot_id,player_id),
      FOREIGN KEY(snapshot_id) REFERENCES evaluation_v2_snapshots(snapshot_id)
    )`),
  ]);
  SCHEMA_READY=true;
}

async function recordEvent(env,fields){
  try{
    await env.DB.prepare(`INSERT INTO evaluation_v2_capture_events(event_id,capture_key,season,gw,app_build,model_code_hash,snapshot_checksum,device_id,status,reason,received_at)
      VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)`)
      .bind(crypto.randomUUID(),fields.captureKey||null,fields.season||null,Number.isInteger(fields.gw)?fields.gw:null,
        fields.appBuild||null,fields.modelCodeHash||null,fields.snapshotChecksum||null,fields.deviceId||null,
        fields.status||'unknown',clean(fields.reason||'',300),fields.receivedAt||now()).run();
  }catch(_){ }
}

async function verifySignedRequest(request,env,bodyText){
  const deviceId=cleanId(request.headers.get('x-evaluation-device')),
    timestamp=String(request.headers.get('x-evaluation-timestamp')||''),signature=String(request.headers.get('x-evaluation-signature')||''),at=Number(timestamp);
  if(!deviceId||!Number.isFinite(at)||Math.abs(Date.now()-at)>SIGNATURE_MAX_SKEW_MS||!signature)return{ok:false,status:401,error:'signed device headers are missing or expired'};
  const device=await env.DB.prepare(`SELECT public_jwk,revoked FROM evaluation_devices WHERE device_id=?1`).bind(deviceId).first();
  if(!device||num(device.revoked)!==0)return{ok:false,status:401,error:'device is not enrolled'};
  let jwk;try{jwk=JSON.parse(device.public_jwk)}catch{return{ok:false,status:401,error:'device key is unreadable'}}
  try{
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']),bodyHash=await sha256(bodyText),
      message=`${timestamp}\nPOST\n${ROUTE}\n${bodyHash}`,
      verified=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,b64urlBytes(signature),new TextEncoder().encode(message));
    return verified?{ok:true,deviceId,bodyHash}:{ok:false,status:401,error:'device signature is invalid'};
  }catch{return{ok:false,status:401,error:'device signature could not be verified'}}
}

async function serverContext(env,gw){
  const [players,meta,event]=await Promise.all([
    env.DB.prepare(`SELECT id,web_name,team_code,element_type,now_cost FROM players ORDER BY id`).all(),
    env.DB.prepare(`SELECT key,value FROM meta WHERE key IN ('data_hash','last_official_fetch')`).all(),
    env.DB.prepare(`SELECT id,deadline_time FROM events WHERE id=?1`).bind(gw).first(),
  ]);
  return{players:players.results||[],meta:Object.fromEntries((meta.results||[]).map(r=>[r.key,r.value])),event};
}
function validateSelection(raw,validIds){
  if(!raw||typeof raw!=='object')return{value:{},complete:false};
  const ids=(value,max)=>[...new Set((Array.isArray(value)?value:[]).map(Number).filter(id=>Number.isInteger(id)&&validIds.has(id)))].slice(0,max);
  const squad=ids(raw.squad,15),xi=ids(raw.xi,11),xiSet=new Set(xi),bench=ids(raw.bench,4).filter(id=>!xiSet.has(id)),captain=Number(raw.captain),vice=Number(raw.vice);
  const complete=raw.complete===true&&squad.length===15&&xi.length===11&&bench.length===4&&xiSet.has(captain)&&xiSet.has(vice)&&captain!==vice;
  return{complete,value:{squad,xi,bench,captain:xiSet.has(captain)?captain:null,vice:xiSet.has(vice)?vice:null,formation:clean(raw.formation,12),chip:raw.chip||null,complete}};
}
function projectionVector(body){
  const list=Array.isArray(body?.projections)?body.projections:[];
  if(list.length<MIN_PLAYERS||list.length>MAX_PLAYERS)return{error:`projection vector must contain ${MIN_PLAYERS}-${MAX_PLAYERS} players`};
  const map=new Map();
  for(const raw of list){
    const id=Number(raw?.playerId),xpts=Number(raw?.xpts),low=Number(raw?.low),high=Number(raw?.high),sd=Number(raw?.sd),confidence=Number(raw?.confidence),
      expectedMinutes=Number(raw?.expectedMinutes),pStart=Number(raw?.pStart),pAppear=Number(raw?.pAppear),availability=Number(raw?.availability),
      fixtureCount=Math.trunc(num(raw?.fixtureCount)),noMarket=raw?.noMarketXpts===null||raw?.noMarketXpts===undefined?null:Number(raw.noMarketXpts);
    if(!Number.isInteger(id)||map.has(id))return{error:`duplicate or invalid playerId ${raw?.playerId}`};
    if(![xpts,low,high,sd,confidence,expectedMinutes,pStart,pAppear,availability].every(Number.isFinite))return{error:`non-finite projection for player ${id}`};
    if(low>xpts||high<xpts||sd<0||confidence<0||confidence>100||expectedMinutes<0||expectedMinutes>300||pStart<0||pStart>1||pAppear<0||pAppear>1||availability<0||availability>1||fixtureCount<0||fixtureCount>3||xpts<-20||xpts>100||(noMarket!==null&&!Number.isFinite(noMarket)))return{error:`projection bounds are invalid for player ${id}`};
    map.set(id,{xpts,low,high,sd,confidence,expectedMinutes,pStart,pAppear,availability,fixtureCount,noMarketXpts:noMarket});
  }
  return{map};
}

async function reject(env,origin,meta,status,error,code=''){
  await recordEvent(env,{...meta,status:'rejected',reason:code?`${code}: ${error}`:error});
  return response(env,origin,{error,...(code?{code}:{})},status);
}

async function commitProjectionV2(request,env,origin){
  await ensureSchema(env);
  let bodyText;try{bodyText=await request.text()}catch{return response(env,origin,{error:'request body could not be read'},400)}
  if(bodyText.length>1_800_000)return response(env,origin,{error:'projection payload is too large'},413);
  const signed=await verifySignedRequest(request,env,bodyText);
  if(!signed.ok)return response(env,origin,{error:signed.error},signed.status);
  let body;try{body=JSON.parse(bodyText)}catch{return reject(env,origin,{deviceId:signed.deviceId},400,'invalid JSON body')}

  const season=String(body?.season||''),gw=Math.trunc(Number(body?.gw)),appBuild=clean(body?.appBuild,60),formulaRevision=clean(body?.formulaRevision,100),
    modelCodeHash=String(body?.modelCodeHash||'').toLowerCase(),weightsHash=String(body?.weightsHash||'').toLowerCase(),snapshotChecksum=clean(body?.snapshotChecksum,100),
    selectionFingerprint=clean(body?.selectionFingerprint,100),sourceHash=String(body?.clientSourceHash||'').toLowerCase(),sourceDataUpdatedAt=String(body?.sourceDataUpdatedAt||''),
    sourceDataMode=String(body?.sourceDataMode||'').toUpperCase(),localCapturedAt=String(body?.localCapturedAt||''),manifest=body?.modelManifest,weights=body?.weights;
  const eventMeta={season,gw,appBuild,modelCodeHash,snapshotChecksum,deviceId:signed.deviceId};

  if(season!==configuredSeason(env))return reject(env,origin,eventMeta,409,`season ${season||'missing'} does not match ${configuredSeason(env)}`,'SEASON_MISMATCH');
  if(!Number.isInteger(gw)||gw<1||gw>38)return reject(env,origin,eventMeta,400,'invalid gameweek');
  if(!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(appBuild))return reject(env,origin,eventMeta,400,'appBuild is required and must be a deployed OTB build');
  if(!/^[a-f0-9]{64}$/.test(modelCodeHash))return reject(env,origin,eventMeta,400,'modelCodeHash must be SHA-256');
  if(!/^[a-f0-9]{64}$/.test(weightsHash))return reject(env,origin,eventMeta,400,'weightsHash must be SHA-256');
  if(!formulaRevision||!snapshotChecksum)return reject(env,origin,eventMeta,400,'formulaRevision and snapshotChecksum are required');
  if(!Array.isArray(manifest)||!manifest.length||manifest.length>12)return reject(env,origin,eventMeta,400,'modelManifest is required');
  const manifestClean=manifest.map(x=>({path:clean(x?.path,100),sha256:String(x?.sha256||'').toLowerCase(),bytes:Math.trunc(num(x?.bytes))}));
  if(manifestClean.some(x=>!x.path||!/^[a-f0-9]{64}$/.test(x.sha256)||x.bytes<=0))return reject(env,origin,eventMeta,400,'modelManifest contains invalid source entries');
  if(await sha256(stableJson(manifestClean))!==modelCodeHash)return reject(env,origin,eventMeta,400,'modelCodeHash does not match modelManifest','MODEL_HASH_MISMATCH');
  if(!weights||typeof weights!=='object'||Array.isArray(weights))return reject(env,origin,eventMeta,400,'weights object is required');
  const configJson=stableJson(weights);
  if(configJson.length>120_000)return reject(env,origin,eventMeta,413,'model configuration is too large');
  if(await sha256(configJson)!==weightsHash)return reject(env,origin,eventMeta,400,'weightsHash does not match weights','WEIGHTS_HASH_MISMATCH');
  if(!['LIVE','CACHE'].includes(sourceDataMode))return reject(env,origin,eventMeta,400,'sourceDataMode must be LIVE or CACHE');
  const vector=projectionVector(body);if(vector.error)return reject(env,origin,eventMeta,400,vector.error);

  const ctx=await serverContext(env,gw),deadlineMs=Date.parse(ctx.event?.deadline_time||''),receivedMs=Date.now(),sourceMs=Date.parse(sourceDataUpdatedAt),localMs=Date.parse(localCapturedAt);
  if(!Number.isFinite(deadlineMs))return reject(env,origin,eventMeta,503,'deadline is unavailable');
  if(receivedMs>=deadlineMs)return reject(env,origin,eventMeta,409,`GW${gw} projection capture is closed`,'CAPTURE_CLOSED');
  if(!Number.isFinite(localMs)||localMs>=deadlineMs||localMs>receivedMs+5*60*1000)return reject(env,origin,eventMeta,400,'local snapshot timestamp is not accountable');
  if(!Number.isFinite(sourceMs))return reject(env,origin,eventMeta,400,'sourceDataUpdatedAt is required');
  const serverSourceHash=String(ctx.meta.data_hash||'').toLowerCase(),serverSourceMs=Date.parse(ctx.meta.last_official_fetch||'');
  if(!serverSourceHash||!sourceHash||serverSourceHash!==sourceHash)return reject(env,origin,eventMeta,409,'Worker source changed after this snapshot; refresh and recapture','SOURCE_CHANGED');
  if(Number.isFinite(serverSourceMs)&&Math.abs(sourceMs-serverSourceMs)>SOURCE_MAX_DRIFT_MS)return reject(env,origin,eventMeta,409,'snapshot source timestamp is too far from canonical Worker state','SOURCE_STALE');
  if(ctx.players.length<MIN_PLAYERS)return reject(env,origin,eventMeta,503,'server player context is incomplete');
  const serverIds=new Set(ctx.players.map(p=>Number(p.id))),required=Math.max(MIN_PLAYERS,Math.floor(ctx.players.length*.9)),matched=[...vector.map.keys()].filter(id=>serverIds.has(id)).length;
  if(matched<required)return reject(env,origin,eventMeta,400,`only ${matched} of ${ctx.players.length} server players matched the projection vector`);

  const selection=validateSelection(body?.selection,serverIds),settingsJson=stableJson(body?.settings&&typeof body.settings==='object'?body.settings:{}),selectionJson=stableJson(selection.value);
  if(settingsJson.length>250_000)return reject(env,origin,eventMeta,413,'settings payload is too large');
  const captureKey=await sha256(stableJson({season,gw,appBuild,modelCodeHash,weightsHash,snapshotChecksum,localCapturedAt,deviceId:signed.deviceId}));
  eventMeta.captureKey=captureKey;
  const existing=await env.DB.prepare(`SELECT snapshot_id,player_count,committed_at FROM evaluation_v2_snapshots WHERE capture_key=?1`).bind(captureKey).first();
  if(existing){
    await recordEvent(env,{...eventMeta,status:'duplicate',reason:'idempotent retry',receivedAt:now()});
    return response(env,origin,{ok:true,canonical:true,immutable:true,duplicate:true,season,gw,appBuild,modelCodeHash,weightsHash,captureKey,snapshotId:existing.snapshot_id,playerCount:num(existing.player_count),required,serverReceivedAt:existing.committed_at});
  }

  const snapshotId=crypto.randomUUID(),committedAt=now(),manifestJson=stableJson(manifestClean);
  await env.DB.prepare(`INSERT INTO evaluation_v2_model_semantics(model_code_hash,app_build,manifest_json,first_seen_at,last_seen_at)
    VALUES(?1,?2,?3,?4,?4)
    ON CONFLICT(model_code_hash) DO UPDATE SET last_seen_at=excluded.last_seen_at`).bind(modelCodeHash,appBuild,manifestJson,committedAt).run();

  try{
    await env.DB.prepare(`INSERT INTO evaluation_v2_snapshots(snapshot_id,capture_key,season,gw,app_build,model_code_hash,weights_hash,formula_revision,snapshot_checksum,selection_fingerprint,device_id,body_hash,player_count,source_hash,source_data_updated_at,source_data_mode,local_captured_at,committed_at,deadline_time,selection_json,settings_json,model_config_json)
      VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22)`)
      .bind(snapshotId,captureKey,season,gw,appBuild,modelCodeHash,weightsHash,formulaRevision,snapshotChecksum,selectionFingerprint,signed.deviceId,signed.bodyHash,matched,serverSourceHash,sourceDataUpdatedAt,sourceDataMode,localCapturedAt,committedAt,ctx.event.deadline_time,selectionJson,settingsJson,configJson).run();
    const byId=new Map(ctx.players.map(p=>[Number(p.id),p])),statements=[];
    for(const [id,z] of vector.map){const p=byId.get(id);if(!p)continue;statements.push(env.DB.prepare(`INSERT INTO evaluation_v2_predictions(snapshot_id,player_id,web_name,team_code,position,price,xpts,low,high,sd,confidence,expected_minutes,p_start,p_appear,availability,fixture_count,no_market_xpts)
      VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)`)
      .bind(snapshotId,id,p.web_name||'',p.team_code||'?',num(p.element_type),num(p.now_cost),z.xpts,z.low,z.high,z.sd,z.confidence,z.expectedMinutes,z.pStart,z.pAppear,z.availability,z.fixtureCount,z.noMarketXpts));}
    for(let i=0;i<statements.length;i+=70)await env.DB.batch(statements.slice(i,i+70));
  }catch(error){
    try{await env.DB.prepare(`DELETE FROM evaluation_v2_predictions WHERE snapshot_id=?1`).bind(snapshotId).run();await env.DB.prepare(`DELETE FROM evaluation_v2_snapshots WHERE snapshot_id=?1`).bind(snapshotId).run()}catch(_){}
    return reject(env,origin,eventMeta,500,`immutable snapshot write failed: ${String(error?.message||error)}`,'WRITE_FAILED');
  }

  await recordEvent(env,{...eventMeta,status:'accepted',reason:'immutable snapshot committed',receivedAt:committedAt});
  return response(env,origin,{ok:true,canonical:true,immutable:true,duplicate:false,season,gw,appBuild,modelCodeHash,weightsHash,captureKey,snapshotId,snapshotChecksum,playerCount:matched,required,personalCaptured:selection.complete,sourceHash:serverSourceHash,localCapturedAt,serverReceivedAt:committedAt,deadline:ctx.event.deadline_time});
}

async function statusV2(env,origin,url){
  await ensureSchema(env);
  const season=configuredSeason(env),gw=Math.trunc(Number(url.searchParams.get('gw')));
  if(!Number.isInteger(gw)||gw<1||gw>38)return response(env,origin,{error:'valid gw is required'},400);
  const safe=async(p,fallback)=>{try{return await p}catch{return fallback}};
  const [canonical,counts,events,legacyCommits,legacySnapshots]=await Promise.all([
    env.DB.prepare(`SELECT snapshot_id,capture_key,app_build,model_code_hash,weights_hash,snapshot_checksum,player_count,source_hash,local_captured_at,committed_at,deadline_time FROM evaluation_v2_snapshots WHERE season=?1 AND gw=?2 ORDER BY local_captured_at DESC,committed_at DESC LIMIT 1`).bind(season,gw).first(),
    env.DB.prepare(`SELECT COUNT(*) AS snapshots,COUNT(DISTINCT model_code_hash) AS model_hashes,COUNT(DISTINCT app_build) AS builds FROM evaluation_v2_snapshots WHERE season=?1 AND gw=?2`).bind(season,gw).first(),
    env.DB.prepare(`SELECT status,COUNT(*) AS n FROM evaluation_v2_capture_events WHERE season=?1 AND gw=?2 GROUP BY status`).bind(season,gw).all(),
    safe(env.DB.prepare(`SELECT COUNT(*) AS n FROM evaluation_browser_commits WHERE season=?1 AND gw=?2`).bind(season,gw).first(),{n:0}),
    safe(env.DB.prepare(`SELECT COUNT(DISTINCT snapshot_id) AS n FROM evaluation_predictions WHERE season=?1 AND gw=?2`).bind(season,gw).first(),{n:0}),
  ]);
  const eventCounts=Object.fromEntries((events.results||[]).map(r=>[String(r.status),num(r.n)]));
  return response(env,origin,{ok:true,season,gw,immutable:true,canonical:canonical||null,
    audit:{snapshots:num(counts?.snapshots),distinctModelCodeHashes:num(counts?.model_hashes),distinctBuilds:num(counts?.builds),captureEvents:eventCounts,
      acceptedToSnapshotRatio:num(eventCounts.accepted)?num(counts?.snapshots)/num(eventCounts.accepted):null,
      legacy:{commitRows:num(legacyCommits?.n),distinctSnapshotIds:num(legacySnapshots?.n),lossRate:null,note:'Legacy overwrite schema had no append-only capture-event denominator; historical loss cannot be reconstructed from retained rows alone.'}}});
}

export async function handleBrowserEvaluationV2Route(request,env){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
  if(!path.startsWith('/api/evaluation/v2/'))return null;
  const origin=request.headers.get('origin')||'',allowed=allowedOrigin(env);
  if(allowed&&origin&&origin!==allowed)return response(env,origin,{error:'origin is not allowed'},403);
  if(request.method==='OPTIONS')return response(env,origin,null,204);
  if(path===ROUTE&&request.method==='POST')return commitProjectionV2(request,env,origin);
  if(path==='/api/evaluation/v2/browser-status'&&request.method==='GET')return statusV2(env,origin,url);
  return response(env,origin,{error:'not found'},404);
}
