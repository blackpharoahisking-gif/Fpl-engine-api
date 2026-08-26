// OTB canonical browser accountability bridge.
// A browser is enrolled once with an owner/evaluation key. The long-lived
// credential is a non-exportable P-256 private key stored by WebCrypto; only
// signed, current-source, pre-deadline projection vectors can reach D1.

const MIN_PLAYERS=300;
const MAX_PLAYERS=800;
const SIGNATURE_MAX_SKEW_MS=5*60*1000;
const SOURCE_MAX_DRIFT_MS=95*60*1000;
const DEFAULT_SEASON='2026/27';

const num=(v,d=0)=>v===null||v===undefined||v===''||Number.isNaN(+v)?d:+v;
const now=()=>new Date().toISOString();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function configuredSeason(env){return String(env?.FPL_SEASON||DEFAULT_SEASON)}
function previousSeasonName(season){
  const year=Number(String(season||DEFAULT_SEASON).slice(0,4));
  return Number.isFinite(year)?`${year-1}/${String(year%100).padStart(2,'0')}`:'2025/26';
}
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
function constantTimeEqual(a,b){
  const x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||''));
  let diff=x.length^y.length,max=Math.max(x.length,y.length);
  for(let i=0;i<max;i++)diff|=(x[i]||0)^(y[i]||0);
  return diff===0&&x.length===y.length&&x.length>0;
}
function allowedOrigin(env){return String(env.EVALUATION_ALLOWED_ORIGIN||env.ALLOWED_ORIGIN||'').trim()}
function cors(env,origin=''){
  const allowed=allowedOrigin(env);
  return{
    'access-control-allow-origin':allowed||origin||'*',
    'access-control-allow-methods':'GET, POST, OPTIONS',
    'access-control-allow-headers':'content-type, authorization, x-admin-key, x-evaluation-key, x-evaluation-device, x-evaluation-timestamp, x-evaluation-signature',
    'access-control-max-age':'86400',
    'vary':'Origin',
  };
}
function response(env,origin,body,status=200){
  return new Response(status===204?null:JSON.stringify(body),{
    status,
    headers:{
      ...(status===204?{}:{'content-type':'application/json; charset=utf-8'}),
      'cache-control':'no-store',
      ...cors(env,origin),
    },
  });
}
function originAllowed(request,env){
  const allowed=allowedOrigin(env),origin=request.headers.get('origin')||'';
  return{ok:!allowed||origin===allowed,origin,allowed};
}
function bearer(request){
  const value=String(request.headers.get('authorization')||'');
  return /^Bearer\s+/i.test(value)?value.replace(/^Bearer\s+/i,'').trim():'';
}
function privilegedAuthorised(request,env){
  const supplied=[
    String(request.headers.get('x-evaluation-key')||''),
    String(request.headers.get('x-admin-key')||''),
    bearer(request),
  ].filter(Boolean);
  const expected=[env.EVALUATION_KEY,env.ADMIN_KEY,env.OTB_OWNER_KEY].map(v=>String(v||'')).filter(Boolean);
  return expected.length>0&&supplied.some(s=>expected.some(e=>constantTimeEqual(s,e)));
}
function b64urlBytes(value){
  const s=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  const padded=s+'='.repeat((4-s.length%4)%4);
  const binary=atob(padded);
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
function validJwk(jwk){
  return jwk&&typeof jwk==='object'&&jwk.kty==='EC'&&jwk.crv==='P-256'
    &&/^[A-Za-z0-9_-]{40,60}$/.test(String(jwk.x||''))
    &&/^[A-Za-z0-9_-]{40,60}$/.test(String(jwk.y||''));
}
function cleanId(value,max=100){
  return String(value||'').replace(/[^A-Za-z0-9._:-]/g,'').slice(0,max);
}

let SCHEMA_READY=false;
async function ensureSchema(env){
  if(SCHEMA_READY)return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_devices (
      device_id TEXT PRIMARY KEY,
      public_jwk TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_browser_commits (
      season TEXT NOT NULL,
      gw INTEGER NOT NULL,
      model_version TEXT NOT NULL,
      weights_hash TEXT NOT NULL,
      snapshot_id TEXT NOT NULL,
      snapshot_checksum TEXT NOT NULL,
      selection_fingerprint TEXT,
      selection_complete INTEGER NOT NULL DEFAULT 0,
      device_id TEXT NOT NULL,
      body_hash TEXT NOT NULL,
      player_count INTEGER NOT NULL,
      source_hash TEXT NOT NULL,
      source_data_updated_at TEXT NOT NULL,
      local_captured_at TEXT NOT NULL,
      committed_at TEXT NOT NULL,
      deadline_time TEXT NOT NULL,
      PRIMARY KEY (season,gw,model_version,weights_hash)
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_personal_snapshots (
      season TEXT NOT NULL,
      gw INTEGER NOT NULL,
      model_version TEXT NOT NULL,
      weights_hash TEXT NOT NULL,
      snapshot_id TEXT NOT NULL,
      snapshot_checksum TEXT NOT NULL,
      selection_fingerprint TEXT,
      selection_json TEXT NOT NULL,
      settings_json TEXT NOT NULL,
      local_captured_at TEXT NOT NULL,
      server_received_at TEXT NOT NULL,
      PRIMARY KEY (season,gw,model_version,weights_hash)
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_predictions (
      season TEXT NOT NULL,
      gw INTEGER NOT NULL,
      model_version TEXT NOT NULL,
      weights_hash TEXT NOT NULL,
      snapshot_id TEXT NOT NULL,
      formula_revision TEXT,
      player_id INTEGER NOT NULL,
      web_name TEXT NOT NULL,
      team_code TEXT NOT NULL,
      position INTEGER NOT NULL,
      price INTEGER NOT NULL,
      ownership REAL,
      status TEXT,
      chance REAL,
      ep_next REAL,
      current_ppg REAL,
      prior_points REAL,
      prior_minutes REAL,
      prior_starts REAL,
      prior_points_per_start REAL,
      fixture_json TEXT NOT NULL DEFAULT '[]',
      client_source_hash TEXT,
      server_source_hash TEXT,
      xpts REAL,
      low REAL,
      high REAL,
      sd REAL,
      confidence REAL,
      expected_minutes REAL,
      availability REAL,
      capture_source TEXT NOT NULL,
      server_received_at TEXT NOT NULL,
      deadline_time TEXT NOT NULL,
      PRIMARY KEY (season,gw,model_version,weights_hash,player_id)
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS evaluation_models (
      season TEXT NOT NULL,
      model_version TEXT NOT NULL,
      weights_hash TEXT NOT NULL,
      formula_revision TEXT NOT NULL,
      config_json TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      PRIMARY KEY (season,model_version,weights_hash)
    )`),
  ]);
  const cols=await env.DB.prepare(`PRAGMA table_info(evaluation_predictions)`).all();
  const names=new Set((cols.results||[]).map(r=>String(r.name)));
  const additions=[
    ['predicted_start_probability','REAL'],
    ['predicted_appearance_probability','REAL'],
    ['fixture_count','INTEGER'],
    ['no_market_xpts','REAL'],
    ['client_snapshot_checksum','TEXT'],
  ];
  for(const [name,type] of additions){
    if(names.has(name))continue;
    try{await env.DB.prepare(`ALTER TABLE evaluation_predictions ADD COLUMN ${name} ${type}`).run()}
    catch(error){if(!/duplicate column/i.test(String(error?.message||error)))throw error}
  }
  SCHEMA_READY=true;
}

function priorPointsPerStart(row){
  const starts=num(row?.prior_starts);
  return starts>0?num(row?.prior_points)/starts:0;
}
function fixtureMap(rows,gw){
  const out=new Map(),add=(code,row)=>{if(!out.has(code))out.set(code,[]);out.get(code).push(row)};
  for(const f of rows||[]){
    if(num(f.event_id,-1)!==gw)continue;
    if(!f.home_code||!f.away_code)continue;
    add(f.home_code,{opponent:f.away_code,home:true,difficulty:num(f.home_diff,3),kickoff:f.kickoff_time||null,fixture_id:f.id});
    add(f.away_code,{opponent:f.home_code,home:false,difficulty:num(f.away_diff,3),kickoff:f.kickoff_time||null,fixture_id:f.id});
  }
  return out;
}
async function serverContext(env,gw,season){
  const priorSeason=previousSeasonName(season);
  const [players,fixtures,meta,event]=await Promise.all([
    env.DB.prepare(`SELECT p.id,p.web_name,p.team_code,p.element_type,p.now_cost,p.selected_by,p.status,
      p.chance_next,p.ep_next,p.points_per_game,h.total_points AS prior_points,h.minutes AS prior_minutes,h.starts AS prior_starts
      FROM players p LEFT JOIN player_history h ON h.api_id=p.id AND h.season_name=?1 ORDER BY p.id`).bind(priorSeason).all(),
    env.DB.prepare(`SELECT id,event_id,kickoff_time,home_code,away_code,home_diff,away_diff
      FROM fixtures WHERE event_id=?1 ORDER BY kickoff_time,id`).bind(gw).all(),
    env.DB.prepare(`SELECT key,value FROM meta WHERE key IN ('data_hash','last_official_fetch')`).all(),
    env.DB.prepare(`SELECT id,deadline_time FROM events WHERE id=?1`).bind(gw).first(),
  ]);
  return{
    players:players.results||[],
    fixtures:fixtures.results||[],
    meta:Object.fromEntries((meta.results||[]).map(r=>[r.key,r.value])),
    event,
  };
}
function validateSelection(raw,validIds){
  if(!raw||typeof raw!=='object')return{value:{},complete:false};
  const ids=(value,max)=>[...new Set((Array.isArray(value)?value:[]).map(Number).filter(id=>Number.isInteger(id)&&validIds.has(id)))].slice(0,max);
  const squad=ids(raw.squad,15),xi=ids(raw.xi,11),xiSet=new Set(xi),bench=ids(raw.bench,4).filter(id=>!xiSet.has(id));
  const captain=Number(raw.captain),vice=Number(raw.vice);
  const complete=raw.complete===true&&squad.length===15&&xi.length===11&&bench.length===4
    &&xiSet.has(captain)&&xiSet.has(vice)&&captain!==vice;
  return{value:{
    squad,xi,bench,
    captain:xiSet.has(captain)?captain:null,
    vice:xiSet.has(vice)?vice:null,
    formation:String(raw.formation||'').slice(0,12),
    chip:raw.chip&&typeof raw.chip==='object'?{
      code:String(raw.chip.code||'NONE').slice(0,30),
      label:String(raw.chip.label||'No chip').slice(0,50),
      captainMultiplier:clamp(Math.trunc(num(raw.chip.captainMultiplier,2)),1,3),
      benchScoring:raw.chip.benchScoring===true,
    }:{code:'NONE',label:'No chip',captainMultiplier:2,benchScoring:false},
    complete,
  },complete};
}
async function verifySignedRequest(request,env,bodyText){
  const deviceId=cleanId(request.headers.get('x-evaluation-device'),120);
  const timestamp=String(request.headers.get('x-evaluation-timestamp')||'');
  const signature=String(request.headers.get('x-evaluation-signature')||'');
  const at=Number(timestamp);
  if(!deviceId||!Number.isFinite(at)||Math.abs(Date.now()-at)>SIGNATURE_MAX_SKEW_MS||!signature){
    return{ok:false,status:401,error:'signed device headers are missing or expired'};
  }
  const device=await env.DB.prepare(`SELECT public_jwk,revoked FROM evaluation_devices WHERE device_id=?1`).bind(deviceId).first();
  if(!device||num(device.revoked)!==0)return{ok:false,status:401,error:'device is not enrolled'};
  let jwk;
  try{jwk=JSON.parse(device.public_jwk)}catch{return{ok:false,status:401,error:'device key is unreadable'}};
  try{
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    const bodyHash=await sha256(bodyText);
    const message=`${timestamp}\nPOST\n/api/evaluation/browser-projections\n${bodyHash}`;
    const verified=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,b64urlBytes(signature),new TextEncoder().encode(message));
    return verified?{ok:true,deviceId,bodyHash}:{ok:false,status:401,error:'device signature is invalid'};
  }catch{
    return{ok:false,status:401,error:'device signature could not be verified'};
  }
}
async function enrolDevice(request,env,origin){
  if(!privilegedAuthorised(request,env))return response(env,origin,{error:'owner or evaluation key required'},401);
  let body;
  try{body=await request.json()}catch{return response(env,origin,{error:'invalid JSON body'},400)}
  const deviceId=cleanId(body?.deviceId,120),jwk=body?.publicJwk;
  if(!/^[A-Za-z0-9._:-]{16,120}$/.test(deviceId)||!validJwk(jwk))return response(env,origin,{error:'invalid device enrollment payload'},400);
  await ensureSchema(env);
  const stamp=now();
  await env.DB.prepare(`INSERT INTO evaluation_devices(device_id,public_jwk,created_at,last_seen_at,revoked)
    VALUES(?1,?2,?3,?3,0)
    ON CONFLICT(device_id) DO UPDATE SET public_jwk=excluded.public_jwk,last_seen_at=excluded.last_seen_at,revoked=0`)
    .bind(deviceId,stableJson(jwk),stamp).run();
  return response(env,origin,{ok:true,deviceId,enrolledAt:stamp,credential:'P-256 device signature'});
}

function projectionVector(body){
  const list=Array.isArray(body?.projections)?body.projections:[];
  if(list.length<MIN_PLAYERS||list.length>MAX_PLAYERS)return{error:`projection vector must contain ${MIN_PLAYERS}-${MAX_PLAYERS} players`};
  const map=new Map();
  for(const raw of list){
    const id=Number(raw?.playerId),xpts=Number(raw?.xpts),low=Number(raw?.low),high=Number(raw?.high),
      sd=Number(raw?.sd),confidence=Number(raw?.confidence),expectedMinutes=Number(raw?.expectedMinutes),
      availability=Number(raw?.availability),pStart=Number(raw?.pStart),pAppear=Number(raw?.pAppear),
      fixtureCount=Math.trunc(num(raw?.fixtureCount)),noMarket=raw?.noMarketXpts===null||raw?.noMarketXpts===undefined?null:Number(raw.noMarketXpts);
    if(!Number.isInteger(id)||map.has(id))return{error:`duplicate or invalid playerId ${raw?.playerId}`};
    if(![xpts,low,high,sd,confidence,expectedMinutes,availability,pStart,pAppear].every(Number.isFinite))
      return{error:`non-finite projection for player ${id}`};
    if(low>xpts||high<xpts||sd<0||confidence<0||confidence>100||expectedMinutes<0||expectedMinutes>300
      ||availability<0||availability>1||pStart<0||pStart>1||pAppear<0||pAppear>1||fixtureCount<0||fixtureCount>3
      ||xpts<-20||xpts>100||(noMarket!==null&&!Number.isFinite(noMarket)))
      return{error:`projection bounds are invalid for player ${id}`};
    map.set(id,{xpts,low,high,sd,confidence,expectedMinutes,availability,pStart,pAppear,fixtureCount,noMarketXpts:noMarket});
  }
  return{map};
}
async function commitProjection(request,env,origin){
  await ensureSchema(env);
  let bodyText;
  try{bodyText=await request.text()}catch{return response(env,origin,{error:'request body could not be read'},400)}
  if(bodyText.length>1_500_000)return response(env,origin,{error:'projection payload is too large'},413);
  const signed=await verifySignedRequest(request,env,bodyText);
  if(!signed.ok)return response(env,origin,{error:signed.error},signed.status);
  let body;
  try{body=JSON.parse(bodyText)}catch{return response(env,origin,{error:'invalid JSON body'},400)}
  const season=String(body?.season||''),expectedSeason=configuredSeason(env),gw=Math.trunc(Number(body?.gw));
  const modelVersion=String(body?.modelVersion||'').trim(),formulaRevision=String(body?.formulaRevision||'').trim().slice(0,100);
  const weights=body?.weights,weightsHash=String(body?.weightsHash||'').trim().toLowerCase();
  const clientSourceHash=String(body?.clientSourceHash||'').trim().toLowerCase();
  const snapshotChecksum=String(body?.snapshotChecksum||'').trim().slice(0,100);
  const selectionFingerprint=String(body?.selectionFingerprint||'').trim().slice(0,100);
  const sourceDataUpdatedAt=String(body?.sourceDataUpdatedAt||'').trim();
  const sourceDataMode=String(body?.sourceDataMode||'').trim().toUpperCase();
  const localCapturedAt=String(body?.localCapturedAt||'').trim();
  if(season!==expectedSeason)return response(env,origin,{error:`season ${season||'missing'} does not match ${expectedSeason}`},409);
  if(!Number.isInteger(gw)||gw<1||gw>38)return response(env,origin,{error:'invalid gameweek'},400);
  if(!['LIVE','CACHE'].includes(sourceDataMode))return response(env,origin,{error:'sourceDataMode must be LIVE or CACHE'},400);
  if(!/^[A-Za-z0-9._-]{2,60}$/.test(modelVersion)||!formulaRevision)return response(env,origin,{error:'invalid model identity'},400);
  if(!weights||typeof weights!=='object'||Array.isArray(weights))return response(env,origin,{error:'weights object is required'},400);
  const configText=stableJson(weights);
  if(configText.length>120_000)return response(env,origin,{error:'model configuration is too large'},413);
  const computedHash=await sha256(stableJson({version:modelVersion,formulaRevision,weights}));
  if(weightsHash!==computedHash)return response(env,origin,{error:'weightsHash does not match the supplied model configuration'},400);
  const vector=projectionVector(body);
  if(vector.error)return response(env,origin,{error:vector.error},400);

  const ctx=await serverContext(env,gw,season);
  const deadlineMs=Date.parse(ctx.event?.deadline_time||''),receivedMs=Date.now(),sourceMs=Date.parse(sourceDataUpdatedAt),localMs=Date.parse(localCapturedAt);
  if(!Number.isFinite(deadlineMs))return response(env,origin,{error:'deadline is unavailable'},503);
  if(receivedMs>=deadlineMs)return response(env,origin,{error:`GW${gw} projection capture is closed`,code:'CAPTURE_CLOSED'},409);
  if(!Number.isFinite(localMs)||localMs>=deadlineMs||localMs>receivedMs+5*60*1000)return response(env,origin,{error:'local snapshot timestamp is not accountable'},400);
  if(!Number.isFinite(sourceMs))return response(env,origin,{error:'sourceDataUpdatedAt is required'},400);
  const serverHash=String(ctx.meta.data_hash||'').toLowerCase(),serverSourceMs=Date.parse(ctx.meta.last_official_fetch||'');
  if(!serverHash||!clientSourceHash||serverHash!==clientSourceHash){
    return response(env,origin,{error:'Worker source changed after this snapshot; refresh live data and recapture before committing',code:'SOURCE_CHANGED',serverSourceHash:serverHash||null},409);
  }
  if(Number.isFinite(serverSourceMs)&&Math.abs(sourceMs-serverSourceMs)>SOURCE_MAX_DRIFT_MS){
    return response(env,origin,{error:'snapshot source timestamp is too far from the canonical Worker state',code:'SOURCE_STALE'},409);
  }
  if(ctx.players.length<MIN_PLAYERS)return response(env,origin,{error:'server player context is incomplete'},503);
  const serverIds=new Set(ctx.players.map(p=>Number(p.id))),required=Math.max(MIN_PLAYERS,Math.floor(ctx.players.length*.9));
  const matched=[...vector.map.keys()].filter(id=>serverIds.has(id)).length;
  if(matched<required)return response(env,origin,{error:`only ${matched} of ${ctx.players.length} server players matched the projection vector`},400);
  const selection=validateSelection(body?.selection,serverIds);
  const settingsText=stableJson(body?.settings&&typeof body.settings==='object'?body.settings:{});
  if(settingsText.length>250_000)return response(env,origin,{error:'accountability settings payload is too large'},413);

  const fixtures=fixtureMap(ctx.fixtures,gw),snapshotId=crypto.randomUUID(),receivedAt=now();
  const statements=[
    env.DB.prepare(`INSERT INTO evaluation_models(season,model_version,weights_hash,formula_revision,config_json,first_seen_at,last_seen_at)
      VALUES(?1,?2,?3,?4,?5,?6,?6)
      ON CONFLICT(season,model_version,weights_hash) DO UPDATE SET
      formula_revision=excluded.formula_revision,config_json=excluded.config_json,last_seen_at=excluded.last_seen_at`)
      .bind(season,modelVersion,weightsHash,formulaRevision,configText,receivedAt)
  ];
  for(const p of ctx.players){
    const z=vector.map.get(Number(p.id));if(!z)continue;
    statements.push(env.DB.prepare(`INSERT INTO evaluation_predictions(
      season,gw,model_version,weights_hash,snapshot_id,formula_revision,player_id,web_name,team_code,position,price,ownership,status,chance,
      ep_next,current_ppg,prior_points,prior_minutes,prior_starts,prior_points_per_start,fixture_json,client_source_hash,server_source_hash,
      xpts,low,high,sd,confidence,expected_minutes,availability,capture_source,server_received_at,deadline_time,
      predicted_start_probability,predicted_appearance_probability,fixture_count,no_market_xpts,client_snapshot_checksum)
      VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?32,?33,?34,?35,?36,?37,?38)
      ON CONFLICT(season,gw,model_version,weights_hash,player_id) DO UPDATE SET
      snapshot_id=excluded.snapshot_id,formula_revision=excluded.formula_revision,web_name=excluded.web_name,team_code=excluded.team_code,
      position=excluded.position,price=excluded.price,ownership=excluded.ownership,status=excluded.status,chance=excluded.chance,
      ep_next=excluded.ep_next,current_ppg=excluded.current_ppg,prior_points=excluded.prior_points,prior_minutes=excluded.prior_minutes,
      prior_starts=excluded.prior_starts,prior_points_per_start=excluded.prior_points_per_start,fixture_json=excluded.fixture_json,
      client_source_hash=excluded.client_source_hash,server_source_hash=excluded.server_source_hash,xpts=excluded.xpts,low=excluded.low,
      high=excluded.high,sd=excluded.sd,confidence=excluded.confidence,expected_minutes=excluded.expected_minutes,
      availability=excluded.availability,capture_source=excluded.capture_source,server_received_at=excluded.server_received_at,
      deadline_time=excluded.deadline_time,predicted_start_probability=excluded.predicted_start_probability,
      predicted_appearance_probability=excluded.predicted_appearance_probability,fixture_count=excluded.fixture_count,
      no_market_xpts=excluded.no_market_xpts,client_snapshot_checksum=excluded.client_snapshot_checksum
      WHERE excluded.server_received_at>=evaluation_predictions.server_received_at`)
      .bind(
        season,gw,modelVersion,weightsHash,snapshotId,formulaRevision,Number(p.id),p.web_name||'',p.team_code||'?',num(p.element_type),num(p.now_cost),
        num(p.selected_by),p.status||'a',p.chance_next??null,num(p.ep_next),num(p.points_per_game),num(p.prior_points),num(p.prior_minutes),
        num(p.prior_starts),priorPointsPerStart(p),JSON.stringify(fixtures.get(p.team_code)||[]),clientSourceHash,serverHash,z.xpts,z.low,z.high,z.sd,
        z.confidence,z.expectedMinutes,z.availability,`frontend-device:${signed.deviceId}`,receivedAt,ctx.event.deadline_time,z.pStart,z.pAppear,
        z.fixtureCount,z.noMarketXpts,snapshotChecksum
      ));
  }
  for(let i=0;i<statements.length;i+=70)await env.DB.batch(statements.slice(i,i+70));
  const selectionJson=stableJson(selection.value);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO evaluation_personal_snapshots(
      season,gw,model_version,weights_hash,snapshot_id,snapshot_checksum,selection_fingerprint,selection_json,settings_json,local_captured_at,server_received_at)
      VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
      ON CONFLICT(season,gw,model_version,weights_hash) DO UPDATE SET
      snapshot_id=excluded.snapshot_id,snapshot_checksum=excluded.snapshot_checksum,selection_fingerprint=excluded.selection_fingerprint,
      selection_json=excluded.selection_json,settings_json=excluded.settings_json,local_captured_at=excluded.local_captured_at,
      server_received_at=excluded.server_received_at
      WHERE excluded.server_received_at>=evaluation_personal_snapshots.server_received_at`)
      .bind(season,gw,modelVersion,weightsHash,snapshotId,snapshotChecksum,selectionFingerprint,selectionJson,settingsText,localCapturedAt,receivedAt),
    env.DB.prepare(`INSERT INTO evaluation_browser_commits(
      season,gw,model_version,weights_hash,snapshot_id,snapshot_checksum,selection_fingerprint,selection_complete,device_id,body_hash,
      player_count,source_hash,source_data_updated_at,local_captured_at,committed_at,deadline_time)
      VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16)
      ON CONFLICT(season,gw,model_version,weights_hash) DO UPDATE SET
      snapshot_id=excluded.snapshot_id,snapshot_checksum=excluded.snapshot_checksum,selection_fingerprint=excluded.selection_fingerprint,
      selection_complete=excluded.selection_complete,device_id=excluded.device_id,body_hash=excluded.body_hash,player_count=excluded.player_count,
      source_hash=excluded.source_hash,source_data_updated_at=excluded.source_data_updated_at,local_captured_at=excluded.local_captured_at,
      committed_at=excluded.committed_at,deadline_time=excluded.deadline_time
      WHERE excluded.committed_at>=evaluation_browser_commits.committed_at`)
      .bind(season,gw,modelVersion,weightsHash,snapshotId,snapshotChecksum,selectionFingerprint,selection.complete?1:0,signed.deviceId,signed.bodyHash,
        matched,serverHash,sourceDataUpdatedAt,localCapturedAt,receivedAt,ctx.event.deadline_time),
    env.DB.prepare(`UPDATE evaluation_devices SET last_seen_at=?1 WHERE device_id=?2`).bind(receivedAt,signed.deviceId),
    env.DB.prepare(`INSERT INTO meta(key,value,updated_at) VALUES('evaluation_last_projection_at',?1,?1)
      ON CONFLICT(key) DO UPDATE SET value=?1,updated_at=?1`).bind(receivedAt),
    env.DB.prepare(`INSERT INTO meta(key,value,updated_at) VALUES('evaluation_last_projection_gw',?1,?2)
      ON CONFLICT(key) DO UPDATE SET value=?1,updated_at=?2`).bind(String(gw),receivedAt),
  ]);
  return response(env,origin,{
    ok:true,canonical:true,verified:true,season,gw,modelVersion,weightsHash,snapshotId,snapshotChecksum,
    playerCount:matched,required,personalCaptured:selection.complete,sourceHash:serverHash,
    localCapturedAt,serverReceivedAt:receivedAt,deadline:ctx.event.deadline_time,
  });
}
async function status(request,env,origin,url){
  await ensureSchema(env);
  const season=configuredSeason(env),gw=Math.trunc(Number(url.searchParams.get('gw')));
  if(!Number.isInteger(gw)||gw<1||gw>38)return response(env,origin,{error:'valid gw is required'},400);
  const modelVersion=String(url.searchParams.get('model_version')||'').trim();
  const weightsHash=String(url.searchParams.get('weights_hash')||'').trim().toLowerCase();
  const filters=['season=?1','gw=?2'],binds=[season,gw];
  if(modelVersion){filters.push(`model_version=?${binds.length+1}`);binds.push(modelVersion)}
  if(weightsHash){filters.push(`weights_hash=?${binds.length+1}`);binds.push(weightsHash)}
  const [commit,event,countPlayers,meta]=await Promise.all([
    env.DB.prepare(`SELECT * FROM evaluation_browser_commits WHERE ${filters.join(' AND ')} ORDER BY committed_at DESC LIMIT 1`).bind(...binds).first(),
    env.DB.prepare(`SELECT deadline_time FROM events WHERE id=?1`).bind(gw).first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM players`).first(),
    env.DB.prepare(`SELECT key,value FROM meta WHERE key IN('data_hash','last_official_fetch')`).all(),
  ]);
  const m=Object.fromEntries((meta.results||[]).map(r=>[r.key,r.value])),required=Math.max(MIN_PLAYERS,Math.floor(num(countPlayers?.n)*.9));
  let predictionCount=0;
  if(commit?.snapshot_id){
    const row=await env.DB.prepare(`SELECT COUNT(*) AS n FROM evaluation_predictions WHERE season=?1 AND gw=?2 AND snapshot_id=?3`)
      .bind(season,gw,commit.snapshot_id).first();
    predictionCount=num(row?.n);
  }
  const deadline=commit?.deadline_time||event?.deadline_time||null,deadlineMs=Date.parse(deadline||''),committedMs=Date.parse(commit?.committed_at||'');
  const sourceCurrent=!!commit&&!!m.data_hash&&String(commit.source_hash)===String(m.data_hash);
  const verified=!!commit&&predictionCount>=required&&Number.isFinite(committedMs)&&Number.isFinite(deadlineMs)&&committedMs<deadlineMs;
  return response(env,origin,{
    season,gw,canonical:verified,verified,sourceCurrent,
    state:verified?(sourceCurrent?'COMMITTED':'COMMITTED_SOURCE_OLD'):'NOT_COMMITTED',
    playerCount:predictionCount,required,
    snapshotId:commit?.snapshot_id||null,snapshotChecksum:commit?.snapshot_checksum||null,
    selectionFingerprint:commit?.selection_fingerprint||null,personalCaptured:num(commit?.selection_complete)===1,
    modelVersion:commit?.model_version||null,weightsHash:commit?.weights_hash||null,
    localCapturedAt:commit?.local_captured_at||null,serverReceivedAt:commit?.committed_at||null,
    deadline,captureClosed:Number.isFinite(deadlineMs)&&Date.now()>=deadlineMs,
    currentSourceHash:m.data_hash||null,lastOfficialFetch:m.last_official_fetch||null,
  });
}

export async function handleBrowserEvaluationRoute(request,env){
  const url=new URL(request.url);
  if(!['/api/evaluation/device-enrol','/api/evaluation/browser-projections','/api/evaluation/browser-status'].includes(url.pathname))return null;
  const gate=originAllowed(request,env);
  if(!gate.ok)return response(env,gate.origin,{error:'origin not allowed'},403);
  if(request.method==='OPTIONS')return response(env,gate.origin,{},204);
  if(url.pathname==='/api/evaluation/device-enrol'){
    if(request.method!=='POST')return response(env,gate.origin,{error:'POST required'},405);
    return enrolDevice(request,env,gate.origin);
  }
  if(url.pathname==='/api/evaluation/browser-projections'){
    if(request.method!=='POST')return response(env,gate.origin,{error:'POST required'},405);
    return commitProjection(request,env,gate.origin);
  }
  if(request.method!=='GET')return response(env,gate.origin,{error:'GET required'},405);
  return status(request,env,gate.origin,url);
}
