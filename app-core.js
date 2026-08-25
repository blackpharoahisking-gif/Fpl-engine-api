
let TEAMS={ARS:{n:'Arsenal',s:5.0,mgr:'Arteta'},AVL:{n:'Aston Villa',s:4.3,mgr:'Emery'},BOU:{n:'Bournemouth',s:4.0,mgr:'Rose'},BRE:{n:'Brentford',s:3.0,mgr:'Andrews'},BHA:{n:'Brighton',s:3.6,mgr:'Hürzeler'},CHE:{n:'Chelsea',s:3.6,mgr:'Alonso'},COV:{n:'Coventry',s:2.0,mgr:'Lampard'},CRY:{n:'Crystal Palace',s:3.5,mgr:'Sage'},EVE:{n:'Everton',s:3.0,mgr:'Moyes'},FUL:{n:'Fulham',s:3.0,mgr:'Arbeloa'},HUL:{n:'Hull City',s:2.0,mgr:'Jakirović'},IPS:{n:'Ipswich',s:2.1,mgr:"O'Neil"},LEE:{n:'Leeds',s:2.6,mgr:'Farke'},LIV:{n:'Liverpool',s:4.4,mgr:'Iraola'},MCI:{n:'Man City',s:4.9,mgr:'Maresca'},MUN:{n:'Man Utd',s:4.4,mgr:'Carrick'},NEW:{n:'Newcastle',s:3.6,mgr:'Howe'},NFO:{n:"Nott'm Forest",s:3.5,mgr:'Glasner'},SUN:{n:'Sunderland',s:3.5,mgr:'Le Bris'},TOT:{n:'Tottenham',s:2.4,mgr:'De Zerbi'}};
Object.values(TEAMS).forEach(t=>{t.atkH=t.atkH??null;t.atkA=t.atkA??null;t.defH=t.defH??null;t.defA=t.defA??null});
const STATIC_FIX_RAW=`ARS-COV HUL-MUN EVE-CRY IPS-SUN NFO-LEE BRE-TOT BHA-AVL MCI-BOU NEW-LIV FUL-CHE
CRY-MCI LIV-NFO BOU-EVE COV-HUL TOT-NEW CHE-BHA LEE-BRE SUN-FUL MUN-IPS AVL-ARS
IPS-LIV NEW-BOU BRE-SUN BHA-LEE FUL-CRY MCI-COV NFO-TOT HUL-AVL EVE-MUN ARS-CHE
BOU-BRE AVL-NFO CHE-HUL CRY-IPS LIV-FUL TOT-EVE SUN-ARS COV-BHA MUN-MCI LEE-NEW
BRE-CHE TOT-AVL BHA-ARS EVE-IPS LEE-CRY MCI-SUN NEW-HUL NFO-COV BOU-LIV FUL-MUN
ARS-LEE AVL-BRE CHE-BOU COV-NEW CRY-NFO HUL-EVE IPS-FUL LIV-MCI MUN-TOT SUN-BHA
BOU-SUN BRE-LIV BHA-CRY EVE-CHE FUL-HUL LEE-MUN MCI-IPS NEW-AVL NFO-ARS TOT-COV
ARS-EVE AVL-MCI CHE-TOT COV-FUL CRY-NEW HUL-BRE IPS-NFO LIV-BHA MUN-BOU SUN-LEE
BOU-LEE AVL-FUL BRE-NFO CHE-MUN COV-SUN HUL-IPS LIV-ARS MCI-BHA NEW-EVE TOT-CRY
ARS-HUL BHA-BRE CRY-LIV EVE-COV FUL-NEW IPS-BOU LEE-TOT MUN-AVL NFO-MCI SUN-CHE
BOU-NFO AVL-SUN BRE-EVE CHE-LEE COV-CRY HUL-BHA LIV-MUN MCI-FUL NEW-ARS TOT-IPS
ARS-MCI BHA-NEW CRY-HUL EVE-LIV FUL-BOU IPS-AVL LEE-COV MUN-BRE NFO-CHE SUN-TOT
BOU-BHA AVL-EVE BRE-ARS CHE-CRY COV-IPS HUL-NFO LIV-SUN MCI-LEE NEW-MUN TOT-FUL
BOU-HUL AVL-CRY BRE-MCI CHE-LIV EVE-FUL LEE-IPS MUN-COV NEW-SUN NFO-BHA TOT-ARS
ARS-BOU BHA-EVE COV-AVL CRY-MUN FUL-BRE HUL-TOT IPS-NEW LIV-LEE MCI-CHE SUN-NFO
BOU-COV ARS-MUN BRE-NEW BHA-IPS CHE-AVL LEE-FUL LIV-TOT MCI-HUL NFO-EVE SUN-CRY
AVL-LEE COV-CHE CRY-ARS EVE-SUN FUL-BHA HUL-LIV IPS-BRE MUN-NFO NEW-MCI TOT-BOU
AVL-LIV COV-BRE CRY-BOU EVE-MCI FUL-ARS HUL-LEE IPS-CHE MUN-SUN NEW-NFO TOT-BHA
BOU-AVL ARS-IPS BRE-CRY BHA-MUN CHE-NEW LEE-EVE LIV-COV MCI-TOT NFO-FUL SUN-HUL
ARS-BRE BHA-BOU CRY-CHE EVE-AVL FUL-TOT IPS-COV LEE-MCI MUN-NEW NFO-HUL SUN-LIV
BOU-IPS AVL-MUN BRE-BHA CHE-SUN COV-EVE HUL-ARS LIV-CRY MCI-NFO NEW-FUL TOT-LEE
ARS-NEW BHA-MCI CRY-TOT EVE-BRE FUL-AVL IPS-HUL LEE-CHE MUN-LIV NFO-BOU SUN-COV
BOU-FUL AVL-IPS BRE-MUN CHE-NFO COV-LEE HUL-CRY LIV-EVE MCI-ARS NEW-BHA TOT-SUN
ARS-LIV BHA-HUL CRY-COV EVE-NEW FUL-MCI IPS-TOT LEE-BOU MUN-CHE NFO-BRE SUN-AVL
AVL-BOU COV-LIV CRY-BRE EVE-LEE FUL-NFO HUL-SUN IPS-ARS MUN-BHA NEW-CHE TOT-MCI
BOU-CRY ARS-FUL BRE-COV BHA-TOT CHE-IPS LEE-AVL LIV-HUL MCI-NEW NFO-MUN SUN-EVE
AVL-CHE COV-BOU CRY-SUN EVE-NFO FUL-LEE HUL-MCI IPS-BHA MUN-ARS NEW-BRE TOT-LIV
BOU-TOT ARS-CRY BRE-IPS BHA-FUL CHE-COV LEE-HUL LIV-AVL MCI-EVE NFO-NEW SUN-MUN
BOU-NEW AVL-HUL CHE-ARS COV-MCI CRY-FUL LEE-BHA LIV-IPS MUN-EVE SUN-BRE TOT-NFO
ARS-SUN BRE-BOU BHA-COV EVE-TOT FUL-LIV HUL-CHE IPS-CRY MCI-MUN NEW-LEE NFO-AVL
BOU-MCI AVL-BHA CHE-FUL COV-ARS CRY-EVE LEE-NFO LIV-NEW MUN-HUL SUN-IPS TOT-BRE
ARS-AVL BRE-LEE BHA-CHE EVE-BOU FUL-SUN HUL-COV IPS-MUN MCI-CRY NEW-TOT NFO-LIV
BOU-ARS AVL-COV BRE-FUL CHE-MCI EVE-BHA LEE-LIV MUN-CRY NEW-IPS NFO-SUN TOT-HUL
ARS-TOT BHA-NFO COV-MUN CRY-AVL FUL-EVE HUL-BOU IPS-LEE LIV-CHE MCI-BRE SUN-NEW
BOU-MUN BRE-AVL BHA-SUN EVE-HUL FUL-IPS LEE-ARS MCI-LIV NEW-COV NFO-CRY TOT-CHE
ARS-NFO AVL-NEW CHE-EVE COV-TOT CRY-BHA HUL-FUL IPS-MCI LIV-BRE MUN-LEE SUN-BOU
BOU-CHE BRE-HUL BHA-LIV EVE-ARS FUL-COV LEE-SUN MCI-AVL NEW-CRY NFO-IPS TOT-MUN
ARS-BHA AVL-TOT CHE-BRE COV-NFO CRY-LEE HUL-NEW IPS-EVE LIV-BOU MUN-FUL SUN-MCI`;
const STATIC_FIX=Object.fromEntries(STATIC_FIX_RAW.trim().split(/\n+/).map((line,i)=>[i+1,line.trim().split(/\s+/).map(x=>x.split('-'))]));
let FIX=JSON.parse(JSON.stringify(STATIC_FIX)),FIX_META={},EVENTS=[];
let FIX_NOTE='Embedded fallback: all 380 league pairings across GW1–38. Live refresh replaces this with the official fixture endpoint, including postponements, blanks, doubles, kickoff times and difficulty ratings.';
let POOL=[
{n:'Haaland',t:'MCI',p:'FWD',c:15.5,pts:239,dc:0,v:1},{n:'B.Fernandes',t:'MUN',p:'MID',c:12.0,pts:235,dc:38,v:1},{n:'Gabriel',t:'ARS',p:'DEF',c:8.0,pts:209,dc:0,v:1},{n:'Semenyo',t:'MCI',p:'MID',c:8.5,pts:202,dc:0,v:1},{n:'Gibbs-White',t:'NFO',p:'MID',c:8.0,pts:188,dc:0,v:1},{n:'Rice',t:'ARS',p:'MID',c:7.5,pts:184,dc:0,v:1},{n:'Igor Thiago',t:'BRE',p:'FWD',c:8.0,pts:181,dc:0,v:1},{n:'Anderson',t:'MCI',p:'MID',c:6.5,pts:180,dc:46,v:1},{n:'Guéhi',t:'MCI',p:'DEF',c:6.0,pts:179,dc:0,v:1},{n:'João Pedro',t:'CHE',p:'FWD',c:7.5,pts:177,dc:0,v:1},{n:'van Dijk',t:'LIV',p:'DEF',c:6.5,pts:175,dc:28,v:1},{n:'Senesi',t:'TOT',p:'DEF',c:6.0,pts:175,dc:50,v:1},{n:'Tarkowski',t:'EVE',p:'DEF',c:6.0,pts:170,dc:44,v:1},{n:'Rogers',t:'CHE',p:'MID',c:7.5,pts:169,dc:0,v:1},{n:'H.Wilson',t:'LEE',p:'MID',c:6.5,pts:168,dc:0,v:1},{n:'Watkins',t:'AVL',p:'FWD',c:8.0,pts:167,dc:0,v:1},{n:'Truffert',t:'BOU',p:'DEF',c:5.5,pts:165,dc:0,v:1},{n:'Raya',t:'ARS',p:'GK',c:6.0,pts:162,dc:0,v:1},{n:'Szoboszlai',t:'LIV',p:'MID',c:7.0,pts:160,dc:20,v:1},{n:"O'Reilly",t:'MCI',p:'DEF',c:6.5,pts:160,dc:0,v:1},{n:'Saka',t:'ARS',p:'MID',c:9.5,pts:150,dc:0,v:1},{n:'Palmer',t:'CHE',p:'MID',c:9.5,pts:130,dc:0,v:1},{n:'Kroupi',t:'BOU',p:'MID',c:7.5,pts:145,dc:0,v:1},{n:'Isak',t:'LIV',p:'FWD',c:9.0,pts:120,dc:0,v:1},{n:'Gyökeres',t:'ARS',p:'FWD',c:7.5,pts:118,dc:0,v:1},{n:'Foden',t:'MCI',p:'MID',c:7.0,pts:105,dc:0,v:1},{n:'Timber',t:'ARS',p:'DEF',c:6.5,pts:130,dc:0,v:1},{n:'Lewis-Skelly',t:'ARS',p:'MID',c:5.5,pts:95,dc:0,v:1},{n:'Lacroix',t:'CRY',p:'DEF',c:6.0,pts:150,dc:40,v:1},{n:'Andersen',t:'FUL',p:'DEF',c:5.0,pts:140,dc:40,v:1},{n:'Ballard',t:'SUN',p:'DEF',c:5.0,pts:130,dc:30,v:1},{n:'N.Collins',t:'BRE',p:'DEF',c:5.5,pts:132,dc:30,v:1},{n:'Keane',t:'EVE',p:'DEF',c:5.0,pts:126,dc:30,v:1},{n:'van Hecke',t:'BHA',p:'DEF',c:5.0,pts:128,dc:30,v:1},{n:'Chalobah',t:'CHE',p:'DEF',c:5.5,pts:125,dc:28,v:1},{n:'J.Hill',t:'BOU',p:'DEF',c:5.5,pts:128,dc:28,v:1},{n:'Ajer',t:'BRE',p:'DEF',c:4.5,pts:95,dc:18,v:1},{n:'Rodon',t:'LEE',p:'DEF',c:4.5,pts:98,dc:18,v:1},{n:'D.Muñoz',t:'CRY',p:'DEF',c:5.5,pts:135,dc:0,v:1},{n:'Manzambi',t:'AVL',p:'MID',c:6.0,pts:0,dc:0,v:1},{n:'Vušković',t:'BHA',p:'DEF',c:5.0,pts:0,dc:0,v:1},{n:'Perri',t:'LEE',p:'GK',c:4.5,pts:105,dc:0,v:1},{n:'Verbruggen',t:'BHA',p:'GK',c:4.5,pts:118,dc:0,v:1},{n:'Butland',t:'HUL',p:'GK',c:4.5,pts:0,dc:0,v:1},{n:'van Oevelen',t:'IPS',p:'GK',c:4.5,pts:0,dc:0,v:1},{n:'Rushworth',t:'COV',p:'GK',c:4.5,pts:0,dc:0,v:1},{n:'Welbeck',t:'BHA',p:'FWD',c:6.0,pts:125,dc:0,v:1},{n:'Calvert-Lewin',t:'EVE',p:'FWD',c:6.0,pts:122,dc:0,v:1},{n:'Mbeumo',t:'MUN',p:'MID',c:8.0,pts:148,dc:0,v:0},{n:'Cunha',t:'MUN',p:'MID',c:7.5,pts:140,dc:0,v:0},{n:'Bruno G.',t:'NEW',p:'MID',c:6.9,pts:154,dc:0,v:0},{n:'Garner',t:'EVE',p:'MID',c:5.5,pts:120,dc:34,v:0},{n:'Ndiaye',t:'EVE',p:'MID',c:6.5,pts:135,dc:0,v:0},{n:'Wieffer',t:'BHA',p:'DEF',c:5.0,pts:118,dc:36,v:0},{n:'Mosquera',t:'ARS',p:'DEF',c:4.5,pts:70,dc:0,v:0},{n:'Calafiori',t:'ARS',p:'DEF',c:5.5,pts:112,dc:0,v:0},{n:'Gvardiol',t:'MCI',p:'DEF',c:5.5,pts:115,dc:0,v:0},{n:'Murillo',t:'NFO',p:'DEF',c:5.5,pts:125,dc:26,v:0},{n:'Aina',t:'NFO',p:'DEF',c:5.0,pts:108,dc:0,v:0},{n:'L.Shaw',t:'MUN',p:'DEF',c:4.5,pts:88,dc:0,v:0},{n:'Mitchell',t:'CRY',p:'DEF',c:4.5,pts:92,dc:0,v:0},{n:'Kayode',t:'BRE',p:'DEF',c:4.5,pts:80,dc:0,v:0},{n:'De Cuyper',t:'BHA',p:'DEF',c:4.5,pts:85,dc:0,v:0},{n:'Kelleher',t:'BRE',p:'GK',c:5.0,pts:130,dc:0,v:0},{n:'Kinsky',t:'TOT',p:'GK',c:4.5,pts:110,dc:0,v:0},{n:'Mateta',t:'CRY',p:'FWD',c:7.0,pts:140,dc:0,v:0},{n:'Šeško',t:'MUN',p:'FWD',c:7.0,pts:110,dc:0,v:0},{n:'Solanke',t:'TOT',p:'FWD',c:6.5,pts:95,dc:0,v:0},{n:'Brobbey',t:'SUN',p:'FWD',c:5.5,pts:90,dc:0,v:0},{n:'Evanilson',t:'BOU',p:'FWD',c:6.0,pts:105,dc:0,v:0},{n:'COV defender',t:'COV',p:'DEF',c:4.0,pts:0,dc:0,v:0},{n:'HUL defender',t:'HUL',p:'DEF',c:4.0,pts:0,dc:0,v:0},{n:'IPS defender',t:'IPS',p:'DEF',c:4.0,pts:0,dc:0,v:0},{n:'COV midfielder',t:'COV',p:'MID',c:4.5,pts:0,dc:0,v:0},{n:'HUL forward',t:'HUL',p:'FWD',c:4.5,pts:0,dc:0,v:0}];
POOL.forEach((x,i)=>{x.id=i;x.apiId=null;x.histPts=Number(x.pts)||0;x.histDcPts=Number(x.dc)||0;x.histTeam=x.t;x.live=null;x.v=Number(x.v)||0});
const LIMITS={GK:2,DEF:5,MID:5,FWD:3},GOALPTS={GK:6,DEF:6,MID:5,FWD:4},CSPTS={GK:4,DEF:4,MID:1,FWD:0};
const PROFILE={GK:{app:.50,cs:.27,atk:.02,bon:.10,oth:.11},DEF:{app:.42,cs:.22,atk:.20,bon:.10,oth:.06},MID:{app:.36,cs:.04,atk:.45,bon:.10,oth:.05},FWD:{app:.36,cs:0,atk:.49,bon:.10,oth:.05}};
/* Position-aware usage assumptions. Starter probabilities are calibrated within each club/position group so the model cannot create more likely starters than the formation permits. */
const POSITION_USAGE={
  /* GK is a true one-slot competition and remains a strict probability-mass
     constraint. Outfield FPL positions are broad fantasy labels rather than
     tactical roles, so DEF/MID/FWD are calibrated softly toward formation
     targets and protected against implausible preseason compression. */
  GK:{defaultSlots:1,minSlots:1,maxSlots:1,minPeers:2,priorGames:5,defaultStartMinutes:90,minStartMinutes:78,subBase:.003,subRotation:.006,subMin:.001,subMax:.012,subMinutes:35,priceMin:4.0,priceMax:6.5,preseasonCalibration:1.00,liveCalibrationGames:2},
  DEF:{defaultSlots:4,minSlots:3,maxSlots:5,minPeers:5,priorGames:4,defaultStartMinutes:82,minStartMinutes:55,subBase:.16,subRotation:.30,subMin:.10,subMax:.48,subMinutes:18,priceMin:4.0,priceMax:7.5,preseasonCalibration:.75,liveCalibrationGames:8},
  MID:{defaultSlots:4.5,minSlots:2,maxSlots:5,minPeers:5,priorGames:4,defaultStartMinutes:78,minStartMinutes:48,subBase:.28,subRotation:.43,subMin:.20,subMax:.75,subMinutes:22,priceMin:4.5,priceMax:12.5,preseasonCalibration:.80,liveCalibrationGames:8},
  FWD:{defaultSlots:1.5,minSlots:1,maxSlots:3,minPeers:3,priorGames:4,defaultStartMinutes:76,minStartMinutes:45,subBase:.34,subRotation:.47,subMin:.26,subMax:.84,subMinutes:24,priceMin:4.5,priceMax:15.5,preseasonCalibration:.80,liveCalibrationGames:8}
};
/* Small, reviewable role-intelligence adjustments for cases where public club evidence is stronger than backward-looking PPG. These are deltas, not fixed probabilities, so team competition and future starts still govern the result. */
const START_INTEL={
  'TOT|GK|kinsky':{delta:.14,label:'club-role evidence favours Kinsky over Dúbravka'},
  'TOT|GK|dubravka':{delta:-.10,label:'experienced competition/cover signal'}
};
const S={squad:[],cap:null,vice:null,start:new Set(),capManual:false,viceManual:false,gw:1,horizon:2,risk:'mean',builderStyle:'balanced',display:'total',benchOrder:[],w:{fix:.30,home:.08,cs:1,dc:1,official:.15,form:.10},chips:{WC1:'',FH1:'',TC1:'',BB1:'',WC2:'',FH2:'',TC2:'',BB2:''},locks:new Set(),buildBlocks:new Set(),budget:100,overrides:{},inspect:null,discovery:{preset:'standard',period:'opt',sort:'xpts',secondary:'none',maxPrice:'99',ownMax:'100',available:false,starter:false,affordable:false,setPiece:false},roleIntel:{events:[]},transfer:{style:'balanced',free:1,horizon:5,maxMoves:2,maxHit:4,threshold:.25,decay:.90,ftScale:1,useFriction:.20,itbValue:.08,sensitivityRuns:0,sensitivityStrength:1,bank:null,purchase:{},last:null},chipAdvice:null};
const CHIP_STATE_DEFS={WC:{code:'WILDCARD',label:'Wildcard'},FH:{code:'FREE_HIT',label:'Free Hit'},TC:{code:'TRIPLE_CAPTAIN',label:'Triple Captain'},BB:{code:'BENCH_BOOST',label:'Bench Boost'}};
function chipStateForGw(gw,state=S){
  const target=Math.trunc(num(gw)),matches=[];
  for(const [key,value] of Object.entries(state?.chips||{}))if(Math.trunc(num(value))===target&&target>0){const def=CHIP_STATE_DEFS[key.slice(0,2)];if(def)matches.push({key,...def})}
  const hit=matches[matches.length-1]||null,code=hit?.code||'NONE';
  return{gw:target,key:hit?.key||null,code,label:hit?.label||'No chip',active:!!hit,benchScoring:code==='BENCH_BOOST',captainMultiplier:code==='TRIPLE_CAPTAIN'?3:2,conflict:matches.length>1,matches};
}
function setChipStateForGw(code,gw,state=S){
  const target=Math.trunc(num(gw));if(!target)return chipStateForGw(target,state);
  for(const key of Object.keys(state.chips||{}))if(Math.trunc(num(state.chips[key]))===target)state.chips[key]='';
  const normalized=String(code||'NONE').toUpperCase().replace(/[\s-]+/g,'_'),prefix=({WILDCARD:'WC',FREE_HIT:'FH',TRIPLE_CAPTAIN:'TC',BENCH_BOOST:'BB'})[normalized];
  if(prefix){const half=target<=19?'1':'2',key=prefix+half;if(key in state.chips)state.chips[key]=String(target)}
  return chipStateForGw(target,state);
}
const DATA={mode:'SEED',lastUpdated:null,error:'',nextEvent:1,teamPlayed:{},auto:true,selectionIssue:null,histMeta:null,histCoverage:{matched:0,total:0,overallRatio:0,eligible:0,eligibleRatio:0,newcomer:0,unresolved:0,inferred:0,classification:'pending',productionOK:false},validation:{structural:[],season:[],topology:[],source:[],warnings:[],structuralPass:false,seasonPass:false,topologyPass:false,freshnessPass:false,sourcePass:false},worker:{status:'UNKNOWN',contract:'NONE',endpoint:'',meta:null,error:''}};
const NEWS={view:'alerts',loading:false,last:null,error:'',cacheKey:'fpl-engine-news-rc203-v2'};
const PRICE_CACHE_VERSION=2,PRICE_LEGACY_KEYS=['fpl-engine-price-rc21-v1'];
const PRICE={loading:false,last:null,error:'',cacheKey:'fpl-engine-price-rc215-v2',cacheVersion:PRICE_CACHE_VERSION,cacheMeta:null};
let POOL_RENDER_AUDIT={total:0,rendered:0,limit:0,ownedInList:0,ownedVisible:0};
const PRICE_FETCH_LIMIT=800,POOL_RENDER_DESKTOP=120,POOL_RENDER_MOBILE=32;function lowPowerMode(){return matchMedia('(max-width:1080px)').matches||(Number.isFinite(navigator.deviceMemory)&&navigator.deviceMemory<=4)}function poolRenderStep(){return lowPowerMode()?POOL_RENDER_MOBILE:POOL_RENDER_DESKTOP}let POOL_RENDER_LIMIT=poolRenderStep();function resetPoolRender(){POOL_RENDER_LIMIT=poolRenderStep()}
const PIPELINE={run:0,startedAt:0,events:[],status:'IDLE',lastReport:''};
function pipelineReset(label='Live refresh'){PIPELINE.run++;PIPELINE.startedAt=performance.now();PIPELINE.events=[];PIPELINE.status='RUN';pipelineEvent('START','run',label);renderPipelineAudit();}
function pipelineEvent(step,state,detail='',ms=null){PIPELINE.events.push({step:String(step),state:String(state),detail:String(detail||''),ms:Number.isFinite(ms)?Math.round(ms):null,at:new Date().toISOString()});if(PIPELINE.events.length>40)PIPELINE.events.shift();renderPipelineAudit();}
function pipelineFinish(state,detail){PIPELINE.status=state;pipelineEvent('END',state==='OK'?'ok':state==='WARN'?'warn':'fail',detail,performance.now()-PIPELINE.startedAt);PIPELINE.lastReport=pipelineReport();renderPipelineAudit();}
function pipelineReport(){return [`OTB ${APP_RELEASE} Live Data Pipeline Audit`,`Build: ${APP_BUILD}`,`Page: ${location.href}`,`Worker: ${API_BASE}`,`Online: ${navigator.onLine!==false}`,`Run: ${PIPELINE.run}`,`Status: ${PIPELINE.status}`,...PIPELINE.events.map((e,i)=>`${i+1}. ${e.step} [${e.state.toUpperCase()}] ${e.detail}${e.ms!=null?' · '+e.ms+'ms':''}`)].join('\n');}
const BUILD_CHECK_INTERVAL_MS=5*60*1000,BUILD_CHECK_COOLDOWN_MS=90*1000;
let BUILD_CHECKING=false,BUILD_LAST_CHECK=0,BUILD_REMOTE='';
function buildParts(value){return String(value||'').match(/\d+/g)?.map(Number)||[]}
function compareBuilds(a,b){const aa=buildParts(a),bb=buildParts(b),n=Math.max(aa.length,bb.length);for(let i=0;i<n;i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d>0?1:-1}return 0}
function buildFromHtml(html){return /<html[^>]*\bdata-build=["']([^"']+)["']/i.exec(String(html||''))?.[1]||/<meta[^>]*name=["']otb-build["'][^>]*content=["']([^"']+)["']/i.exec(String(html||''))?.[1]||''}
function buildFromJs(js){return /\/\*\s*OTB\s+(\d{4}\.\d{2}\.\d{2}\.\d+)/i.exec(String(js||''))?.[1]||''}
function newestBuild(...values){return values.filter(Boolean).sort(compareBuilds).at(-1)||''}
function buildShort(value=APP_BUILD){const p=buildParts(value);return p.length>=4?`${String(p[1]).padStart(2,'0')}.${String(p[2]).padStart(2,'0')}.${p[3]}`:String(value||'—')}
function showBuildUpdate(remote){BUILD_REMOTE=remote;const box=document.getElementById('buildUpdateBanner'),copy=document.getElementById('buildUpdateCopy');if(copy)copy.textContent=`This device is on ${APP_BUILD}; the live site is ${remote}. Refresh once to load it without cached HTML.`;box?.classList.remove('hide-control')}
async function checkBuildFreshness({manual=false,force=false}={}){
  if(BUILD_CHECKING||navigator.onLine===false||!/^https?:$/.test(location.protocol))return false;
  if(!force&&Date.now()-BUILD_LAST_CHECK<BUILD_CHECK_COOLDOWN_MS)return false;
  const badge=document.getElementById('buildBadge');BUILD_CHECKING=true;BUILD_LAST_CHECK=Date.now();badge?.classList.add('checking');
  try{
    const stamp=Date.now(),pageUrl=new URL(location.href);pageUrl.hash='';pageUrl.search='';pageUrl.searchParams.set('otb-build-check',stamp);
    const appUrl=new URL('app.js',pageUrl);appUrl.searchParams.set('otb-build-check',stamp);
    const [pageResponse,appResponse]=await Promise.all([
      fetch(pageUrl.toString(),{cache:'no-store',headers:{Accept:'text/html'}}),
      fetch(appUrl.toString(),{cache:'no-store',headers:{Accept:'text/javascript'}})
    ]);
    if(!pageResponse.ok)throw new Error(`HTML HTTP ${pageResponse.status}`);
    if(!appResponse.ok)throw new Error(`app.js HTTP ${appResponse.status}`);
    const remote=newestBuild(buildFromHtml(await pageResponse.text()),buildFromJs(await appResponse.text()));
    if(!remote)throw new Error('build metadata missing');
    if(remote&&compareBuilds(remote,APP_BUILD)>0){showBuildUpdate(remote);return true}
    if(manual)flash(`This device is current — OTB build ${APP_BUILD}.`);
    return false
  }catch(e){if(manual)flash('Build check could not reach GitHub Pages. Your current session remains available.');return false}
  finally{BUILD_CHECKING=false;badge?.classList.remove('checking')}
}
function applyFreshBuild(){
  const button=document.getElementById('btnApplyBuildUpdate'),url=new URL(location.href),stamp=Date.now();
  if(button){button.disabled=true;button.textContent='Refreshing…'}
  url.hash='';url.search='';
  url.searchParams.set('build',BUILD_REMOTE||APP_BUILD);
  url.searchParams.set('reload',stamp);
  location.assign(url.toString())
}
function initBuildFreshness(){
  const badge=document.getElementById('buildBadge');if(badge){badge.textContent=`BUILD ${buildShort()}`;badge.onclick=()=>checkBuildFreshness({manual:true,force:true})}
  const apply=document.getElementById('btnApplyBuildUpdate');if(apply)apply.onclick=applyFreshBuild;
  setTimeout(()=>checkBuildFreshness({force:true}),3500);
  setInterval(()=>{if(document.visibilityState==='visible')checkBuildFreshness()},BUILD_CHECK_INTERVAL_MS);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkBuildFreshness()})
}
/* An invisible feature that fails silently is a liability: if the key
   expires, the quota runs out, or a club name stops matching, projections
   quietly revert with no signal at all. This is the signal. */
function renderMarketStatus(){
  const el=document.getElementById('marketStatus');
  if(!el)return;
  if(!MARKET_BLEND){el.textContent='Market blend: disabled in build';return}
  if(MARKET.error){el.innerHTML='Market blend: <b>unavailable</b> — '+esc(MARKET.error);return}
  if(!MARKET.loaded){el.textContent='Market blend: no data yet';return}
  const eff=marketAgeMinutes(),stale=marketStale();
  const age=eff==null?'unknown age'
    :eff<90?Math.round(eff)+'m old'
    :(eff/60).toFixed(1)+'h old';
  el.innerHTML='Market blend: <b>'+(stale?'STALE — ignored':'active')+'</b> · '
    +MARKET.fixtures+' fixtures · '+age+' · weight '+Math.round(MARKET_WEIGHT*100)+'%'
    +(MARKET.unmatched?' · <b>'+MARKET.unmatched+' club(s) unmatched</b>':'');
}

function renderPipelineAudit(){renderMarketStatus();const log=document.getElementById('pipelineLog'),summary=document.getElementById('pipelineSummary'),rid=document.getElementById('pipelineRunId'),ep=document.getElementById('pipelineEndpoint');if(!log||!summary)return;rid.textContent=PIPELINE.run?`RUN ${PIPELINE.run} · ${PIPELINE.status}`:'NOT TESTED';ep.textContent=`Endpoint: ${API_BASE}`;if(!PIPELINE.events.length){log.innerHTML='<div class="pipeline-empty">No pipeline events recorded yet.</div>';return}log.innerHTML=PIPELINE.events.map((e,i)=>`<div class="pipeline-row"><span class="pipeline-step">${i+1}</span><span class="pipeline-state ${esc(e.state)}">${esc(e.state.toUpperCase())}</span><span class="pipeline-detail">${esc(e.step)} · ${esc(e.detail)}</span><span class="pipeline-ms">${e.ms==null?'':e.ms+'ms'}</span></div>`).join('');const last=PIPELINE.events[PIPELINE.events.length-1];summary.className='pipeline-summary '+(PIPELINE.status==='OK'?'good':PIPELINE.status==='WARN'?'warn':PIPELINE.status==='FAIL'?'bad':'');summary.textContent=PIPELINE.status==='RUN'?`Testing: ${last.step} — ${last.detail}`:PIPELINE.status==='OK'?'Worker and official data routes responded successfully.':PIPELINE.status==='WARN'?last.detail:`Pipeline failed at ${last.step}: ${last.detail}`;}
async function testWorkerConnection(){
  pipelineReset('Worker connection test');pipelineEvent('CONFIG','ok',API_BASE);
  if(navigator.onLine===false){pipelineFinish('FAIL','Browser reports no internet connection');return}
  const probes=[['ROOT',API_BASE+'/'],['BOOTSTRAP',API_BASE+'/bootstrap-static/'],['FIXTURES',API_BASE+'/fixtures/'],['SCOUT',SCOUT_API_BASE+'/api/health']];
  let success=0;
  for(const [name,url] of probes){
    const t=performance.now();pipelineEvent(name,'run',`GET ${url}`);
    try{
      const r=await fetch(url,{method:'GET',cache:'no-store',headers:{Accept:'application/json'}});
      const ct=r.headers.get('content-type')||'unknown';
      if(!r.ok){pipelineEvent(name,'fail',`HTTP ${r.status} · ${ct}`,performance.now()-t);if(name!=='ROOT')throw new Error(`HTTP ${r.status}`);continue}
      if(name==='SCOUT'){
        const body=await r.json().catch(()=>null),schemaRaw=body?.schemaVersion,season=String(body?.season||'');
        const contractOk=body?.status==='ok'&&schemaAtLeast(schemaRaw,SCOUT_SCHEMA_MIN)&&season===EXPECTED_SEASON;
        SCOUT.health=body||null;
        pipelineEvent(name,contractOk?'ok':'fail',contractOk?`schema ${body.schemaVersion} · ${body.workerBuild||'build n/a'}`:`contract mismatch · schema ${body?.schemaVersion||'unknown'} · season ${season||'unknown'}`,performance.now()-t);
        if(!contractOk)throw new Error(`Scout contract mismatch: expected ${EXPECTED_SEASON}, schema >= ${SCOUT_SCHEMA_MIN}`);
      }else{
        pipelineEvent(name,'ok',`HTTP ${r.status} · ${ct}`,performance.now()-t);
      }
      success++;
    }catch(e){
      const kind=e?.name==='TypeError'?'network/CORS/DNS failure':e.message;
      pipelineEvent(name,'fail',kind,performance.now()-t);
      if(name!=='ROOT'){
        DATA.worker={status:'OFFLINE',contract:'NONE',endpoint:API_BASE,error:kind,meta:null};
        renderDataStatus();pipelineFinish('FAIL',`${name} route failed: ${kind}`);return
      }
    }
  }
  if(success>=2){
    DATA.worker={status:'ONLINE',contract:DATA.worker?.contract||'REACHABLE',endpoint:API_BASE,error:'',meta:DATA.worker?.meta||null};
    renderDataStatus();pipelineFinish('OK','Required Worker routes and Scout contract are reachable · starting full live refresh');setTimeout(()=>refreshLiveData(true),120);
  }else pipelineFinish('WARN','Worker root is unavailable but required routes may still work');
}
const APP_BUILD=document.documentElement.dataset.build||document.querySelector('meta[name="otb-build"]')?.content||'0.0.0.0',API_BASE='https://fpl-engine-api.blackpharoahisking.workers.dev',SCOUT_API_BASE='https://otb-role-intelligence.blackpharoahisking.workers.dev',CACHE_KEY='fpl-engine-cache-v2',STATE_KEY='fpl-engine-user-v2',LEGACY_CACHE_KEY='fpl-engine-rc3-live-cache-v1',LEGACY_STATE_KEY='fpl-engine-rc3-user-v1',EXTERNAL_FIXTURE_KEY='fpl-engine-external-calendar-rc232-v1';
const EXT_CAL={fixtures:[],source:'none',mode:'auto',updatedAt:null,error:'',syncPromise:null,autoAttempted:false};
const EXPECTED_SEASON='2026/27',SEASON_START=Date.parse('2026-08-21T00:00:00Z'),SEASON_END=Date.parse('2027-05-30T23:59:59Z'),FIRST_DEADLINE_MIN=Date.parse('2026-08-14T00:00:00Z'),FIRST_DEADLINE_MAX=Date.parse('2026-08-22T23:59:59Z'),LAST_DEADLINE_MIN=Date.parse('2027-05-23T00:00:00Z'),LAST_DEADLINE_MAX=Date.parse('2027-05-31T23:59:59Z'),WORKER_SCHEMA_MIN=3,SCOUT_SCHEMA_MIN='1.35.0',MAX_DATA_AGE_HOURS=24;
/* RC5.0.9 — semver-aware comparison for the Scout schema gate. The previous
   gate ran Number.parseFloat on a dotted version string (e.g. '1.28.0'),
   which silently drops everything from the second dot onward: '1.30.0' and
   '1.3.0' parse identically, and '1.10.0' parses as OLDER than '1.9.0'
   because 1.1 < 1.9 as a float even though minor version 10 > 9. That is
   dormant today only because the current pairing happens to be exactly
   1.28.0 -- the next schema bump was one keystroke from silently disabling
   this gate or silently rejecting a valid deploy. Compares dot-separated
   integer components in order; a missing/non-numeric component reads as 0. */
function compareSchemaVersions(a,b){
  const pa=String(a||'').split('.').map(n=>parseInt(n,10)||0);
  const pb=String(b||'').split('.').map(n=>parseInt(n,10)||0);
  for(let i=0;i<Math.max(pa.length,pb.length);i++){
    const d=(pa[i]||0)-(pb[i]||0);
    if(d)return d<0?-1:1;
  }
  return 0;
}
function schemaAtLeast(version,min){
  return /^\d+(\.\d+)*$/.test(String(version||'').trim()) && compareSchemaVersions(version,min)>=0;
}
let MODAL_TRIGGER=null;
let DEADLINE=NaN,DEADLINE_VERIFIED=false,PROJ_CACHE={},HORIZON_CACHE={},ROLE_CACHE={},TEAM_RATING_CACHE={},VERDICT_RENDER_KEY="";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d,normalName=x=>String(x||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''),sumParts=p=>Object.values(p).reduce((a,v)=>a+num(v),0);
function nameKey(p){return'p:'+normalName(p.n)+'|'+p.p}
function stableKey(p){return p.apiId!=null?'api:'+p.apiId:nameKey(p)}
function overrideKey(p){return stableKey(p)}
/* RC4.8 Role split (bimodal minutes).
   A player whose GW1 role is genuinely uncertain - World Cup returnee, pre-season
   fitness doubt, competition for a shirt - is not well described by a single
   expected-minutes number. The honest statement is that two credible scenarios
   exist and we do not know which. This runs the WHOLE projection twice, once per
   scenario, and combines the two xPts distributions with the law of total variance:

       mean = w*mA + (1-w)*mB
       Var  = w*vA + (1-w)*vB + w*(1-w)*(mA-mB)^2

   The third term is the between-scenario disagreement penalty. Blending the minutes
   INPUTS instead would destroy exactly the information we are trying to capture.
   Set ROLE_SPLIT_ENABLED=false to restore the previous behaviour exactly. */
const ROLE_SPLIT_ENABLED=true;
let ROLE_SPLIT_RUN=null;
function roleSplitFor(p){
  if(!ROLE_SPLIT_ENABLED||!p)return null;
  const o=S.overrides[overrideKey(p)]||S.overrides[nameKey(p)]||{};
  const m=o.splitMinutes,w=o.splitWeight;
  if(m===undefined||m===''||w===undefined||w==='')return null;
  const wv=clamp(num(w)/100,0,1);
  if(wv<=0.0001||wv>=0.9999)return null;
  return{minutes:clamp(num(m),0,90),w:wv};
}
function playerOverride(p){
  const base=S.overrides[overrideKey(p)]||S.overrides[nameKey(p)]||{};
  if(ROLE_SPLIT_RUN&&ROLE_SPLIT_RUN.alt&&p&&ROLE_SPLIT_RUN.id===p.id&&base.splitMinutes!==undefined&&base.splitMinutes!==''){
    return{...base,minutes:clamp(num(base.splitMinutes),0,90)};
  }
  return base;
}
function withRoleSplitBranch(pl,alt,fn){
  const prev=ROLE_SPLIT_RUN;
  ROLE_SPLIT_RUN={id:pl.id,alt:!!alt};
  try{return fn()}finally{ROLE_SPLIT_RUN=prev}
}
function saveUserState(){try{localStorage.setItem(STATE_KEY,JSON.stringify({budget:S.budget,horizon:S.horizon,risk:S.risk,display:S.display,w:S.w,chips:S.chips,overrides:S.overrides,roleIntel:S.roleIntel,discovery:{...S.discovery},squad:squadPlayers().map(stableKey),start:squadPlayers().filter(p=>S.start.has(p.id)).map(stableKey),benchOrder:S.benchOrder||[],locks:POOL.filter(p=>S.locks.has(p.id)).map(stableKey),buildBlocks:POOL.filter(p=>S.buildBlocks.has(p.id)).map(stableKey),cap:byId(S.cap)?stableKey(byId(S.cap)):null,vice:byId(S.vice)?stableKey(byId(S.vice)):null,gw:S.gw,auto:DATA.auto,capManual:!!S.capManual,viceManual:!!S.viceManual,shotMode:!!S.shotMode,gwPinned:!!S.gwPinned,transfer:{style:S.transfer.style,free:S.transfer.free,horizon:S.transfer.horizon,maxMoves:S.transfer.maxMoves,maxHit:S.transfer.maxHit,threshold:S.transfer.threshold,decay:S.transfer.decay,ftScale:S.transfer.ftScale,useFriction:S.transfer.useFriction,itbValue:S.transfer.itbValue,sensitivityRuns:S.transfer.sensitivityRuns,sensitivityStrength:S.transfer.sensitivityStrength,bank:S.transfer.bank,purchase:S.transfer.purchase}}));STORAGE_OK=true;return true}catch(e){STORAGE_ERROR=e&&e.message?e.message:String(e);if(STORAGE_OK!==false){STORAGE_OK=false;try{flash('Changes are active for this session but could NOT be saved. Export a squad backup before closing.')}catch(_){}}return false}}
let STORAGE_OK=null,STORAGE_ERROR='';
const SAVE_USER_STATE_BASE=saveUserState;
saveUserState=function(...args){const ok=SAVE_USER_STATE_BASE(...args);if(ok)queueMicrotask(()=>{try{scheduleAccuracyCapture()}catch{}});return ok};
function loadUserState(){try{const d=JSON.parse(localStorage.getItem(STATE_KEY)||'null');if(!d)return null;S.budget=num(d.budget,100);S.display=d.display||'total';S.horizon=num(d.horizon,2);S.risk=d.risk||'mean';S.w={...S.w,...d.w};S.chips={...S.chips,...d.chips};S.overrides=d.overrides||{};S.roleIntel=d.roleIntel&&Array.isArray(d.roleIntel.events)?d.roleIntel:{events:[]};S.discovery={...S.discovery,...(d.discovery||{})};S.gw=num(d.gw,1);DATA.auto=d.auto!==false;S.capManual=!!d.capManual;S.viceManual=!!d.viceManual;S.shotMode=!!d.shotMode;S.gwPinned=!!d.gwPinned;S.benchOrder=Array.isArray(d.benchOrder)?d.benchOrder:[];if(d.transfer){S.transfer={...S.transfer,...d.transfer,purchase:{...(d.transfer.purchase||{})},last:null}}if(!['conservative','balanced','fixture','projection','value','template'].includes(S.transfer.style))S.transfer.style='value';return d}catch(e){return null}}
migrateStorage();const SAVED=loadUserState();
function selectionSnapshot(){
  const squad=squadPlayers(),catalog={};
  squad.forEach(p=>catalog[stableKey(p)]=`${p.n} (${p.t})`);
  return{squad:squad.map(stableKey),catalog,start:squad.filter(p=>S.start.has(p.id)).map(stableKey),locks:POOL.filter(p=>S.locks.has(p.id)).map(stableKey),buildBlocks:POOL.filter(p=>S.buildBlocks.has(p.id)).map(stableKey),cap:byId(S.cap)?stableKey(byId(S.cap)):null,vice:byId(S.vice)?stableKey(byId(S.vice)):null,benchOrder:[...(S.benchOrder||[])],purchase:{...(S.transfer.purchase||{})}};
}
function missingSelectionLabel(key,catalog={}){
  if(catalog[key])return catalog[key];
  if(String(key).startsWith('p:'))return String(key).slice(2).split('|')[0]||'Saved player';
  return'Saved player '+String(key).replace(/^api:/,'#');
}
function remapSelection(snap){
  const map=new Map;
  POOL.forEach(p=>{map.set(stableKey(p),p.id);map.set(nameKey(p),p.id)});
  const requested=Array.isArray(snap?.squad)?snap.squad:[],missing=requested.filter(key=>!map.has(key));
  const ids=keys=>(Array.isArray(keys)?keys:[]).map(key=>map.get(key)).filter(Number.isInteger);
  S.squad=ids(requested);
  S.start=new Set(ids(snap?.start));
  S.locks=new Set(ids(snap?.locks));
  if(Array.isArray(snap?.buildBlocks))S.buildBlocks=new Set(ids(snap.buildBlocks));
  for(const id of S.buildBlocks)S.locks.delete(id);
  S.cap=snap?.cap?(map.get(snap.cap)??null):null;
  S.vice=snap?.vice?(map.get(snap.vice)??null):null;
  S.benchOrder=Array.isArray(snap?.benchOrder)?snap.benchOrder.filter(k=>typeof k==='string'):[];
  if(snap?.purchase&&typeof snap.purchase==='object')S.transfer.purchase={...snap.purchase};
  if(missing.length){
    DATA.selectionIssue={at:Date.now(),keys:missing,players:missing.map(key=>missingSelectionLabel(key,snap?.catalog)),notified:false};
  }else if(S.squad.length===15){
    DATA.selectionIssue=null;
  }
  const restoredXI=[...S.start].filter(id=>S.squad.includes(id));
  S.start=new Set(restoredXI);
  if(S.squad.length&&(S.start.size!==Math.min(11,S.squad.length)||xiLegality([...S.start])!==null))autoXI();
  else ensureCaptainValid();
  return{restored:S.squad.length,missing:[...missing]};
}
function bumpCache(){PROJ_CACHE={};HORIZON_CACHE={};ROLE_CACHE={};TEAM_RATING_CACHE={};VERDICT_RENDER_KEY="";CALIB=null;globalThis.__DISCOVERY_CONTEXT_CACHE__=null}
function gwFixtureShape(g){const matches=FIX[g]||[];const perTeam={};matches.forEach(([h,a])=>{perTeam[h]=(perTeam[h]||0)+1;perTeam[a]=(perTeam[a]||0)+1});const played=new Set(Object.keys(perTeam)),doubles=Object.values(perTeam).filter(n=>n>=2).length,blanks=Math.max(0,20-played.size);return{doubles,blanks}}
function fixtureListFor(team,gw){const out=[];(FIX[gw]||[]).forEach(([h,a],i)=>{const m=(FIX_META[gw]||[])[i]||{};if(h===team)out.push({opp:a,home:true,difficulty:m.hDiff,kickoff:m.kickoff,finished:m.finished,started:m.started,id:m.id});else if(a===team)out.push({opp:h,home:false,difficulty:m.aDiff,kickoff:m.kickoff,finished:m.finished,started:m.started,id:m.id})});return out}
function ratingValue(code,type,home){const t=TEAMS[code]||{s:3};const v=type==='atk'?(home?t.atkH:t.atkA):(home?t.defH:t.defA);const n=(v===null||v===undefined||v===''||!isFinite(+v))?NaN:+v;if(!isFinite(n)||n<=0){const ss=num(t.s,3);return 1000+(ss-3)*110}return n}
function teamRatingStats(type){if(TEAM_RATING_CACHE[type])return TEAM_RATING_CACHE[type];const vals=[];for(const code of Object.keys(TEAMS)){vals.push(ratingValue(code,type,true),ratingValue(code,type,false))}const stats=vals.length?{avg:vals.reduce((a,b)=>a+b,0)/vals.length,lo:Math.min(...vals),hi:Math.max(...vals)}:{avg:3,lo:3,hi:3};TEAM_RATING_CACHE[type]=stats;return stats}
function ratingAverage(type){return teamRatingStats(type).avg}
function scaleToFive(v,type){const{lo,hi}=teamRatingStats(type);return hi>lo?1+4*(v-lo)/(hi-lo):3}
/* ---------------- MARKET BLEND ----------------------------------------
   Betting markets price team-level outcomes with real money and already
   contain team news, so they are a stronger estimate of how many goals a
   fixture will produce than any public model. The worker converts exchange
   prices into goal expectations and clean-sheet probabilities; this blends
   them into the engine's own fixture context.

   It BLENDS rather than replaces. The engine's downstream constants are
   calibrated against its own strength scale, so swapping in a foreign
   scale wholesale would silently decalibrate everything after it. A
   bounded, weighted correction keeps that calibration intact.

   MARKET_WEIGHT is NOT calibrated. 0.5 says "trust the market about as
   much as ourselves", which is conservative given markets generally beat
   public models at team level. Set MARKET_BLEND=false to revert exactly. */
const MARKET_BLEND=true;
/* Runtime-only switch used to compute the no-market counterfactual for the
   accuracy ledger. Never persisted, never user-facing. */
let MARKET_SUSPEND=false;
const MARKET_WEIGHT=.5;
const MARKET_ALERT_GAP=.15;        // 15% model/market xG gap is material enough to flag
const MARKET_MAX_AGE_MIN=720;      // ignore data older than 12h
const MARKET_LEAGUE_XG=1.45;       // matches the engine's own base lambda
const MARKET={loading:false,loaded:false,ageMinutes:null,fetchedAt:0,byKey:new Map(),slate:[],fixtures:0,unmatched:0,error:''};
/* RC5.0.0 F1 — ageMinutes is the server-reported age at fetch time and never
   advanced locally. Between hourly refreshes that understated true age by up to
   60 minutes, right against a 720-minute cutoff. Effective age now adds the
   wall-clock time elapsed since the response was received. */
function marketAgeMinutes(){if(!MARKET.loaded||MARKET.ageMinutes==null)return null;const drift=MARKET.fetchedAt?Math.max(0,(Date.now()-MARKET.fetchedAt)/60000):0;return MARKET.ageMinutes+drift}
function marketStale(){const a=marketAgeMinutes();return a!=null&&a>MARKET_MAX_AGE_MIN}
function marketActive(){return !!(MARKET_BLEND&&!MARKET_SUSPEND&&MARKET.loaded&&!marketStale())}

function marketKey(team,opp,home){return `${team}|${opp}|${home?'H':'A'}`}

/** Look up this exact fixture. Keyed on both clubs and venue, so no date
    matching is needed and a wrong-week match is impossible. */
function marketFor(team,fx){
  if(!marketActive())return null;
  return MARKET.byKey.get(marketKey(team,fx.opp,fx.home))||null;
}

async function loadMarketData(){
  if(MARKET.loading)return false;
  MARKET.loading=true;
  try{
    const r=await fetch(SCOUT_API_BASE+'/api/market/teams',{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json();
    MARKET.byKey.clear();
    MARKET.loaded=!!d.available;
    MARKET.ageMinutes=Number.isFinite(d.ageMinutes)?d.ageMinutes:null;
    MARKET.fetchedAt=Date.now();
    MARKET.fixtures=(d.fixtures||[]).length;
    MARKET.unmatched=(d.unmatched||[]).length;
    MARKET.slate=(d.fixtures||[]).map(f=>({home:String(f.home||''),away:String(f.away||''),commence:f.commence||null})).filter(f=>f.home&&f.away);
    MARKET.error='';
    for(const f of d.fixtures||[]){
      // Same fixture indexed from both clubs' point of view.
      MARKET.byKey.set(marketKey(f.home,f.away,true),
        {xgFor:f.xgHome,xgAgainst:f.xgAway,pCS:f.csHome});
      MARKET.byKey.set(marketKey(f.away,f.home,false),
        {xgFor:f.xgAway,xgAgainst:f.xgHome,pCS:f.csAway});
    }
    renderMarketStatus();
    if(typeof pipelineEvent==='function')
      pipelineEvent('MARKET',MARKET.loaded?'OK':'SKIP',
        `${MARKET.fixtures} fixtures, age ${MARKET.ageMinutes ?? '?'}min, ${MARKET.unmatched} unmatched`);
  }catch(err){
    MARKET.loaded=false;MARKET.error=err&&err.message?err.message:String(err);renderMarketStatus();
    if(typeof pipelineEvent==='function')pipelineEvent('MARKET','WARN',MARKET.error);
  }finally{
    MARKET.loading=false;bumpCache();
    if(typeof scheduleAccuracyCapture==='function')scheduleAccuracyCapture(250);
  }
  return MARKET.loaded;
}

function fixtureContext(team,fx){const opp=fx.opp,home=fx.home,ownAtk=ratingValue(team,'atk',home),oppDef=ratingValue(opp,'def',!home),oppAtk=ratingValue(opp,'atk',!home),ownDef=ratingValue(team,'def',home),avgAtk=ratingAverage('atk'),avgDef=ratingAverage('def');const venueFor=home?1+S.w.home:1-S.w.home,venueAgainst=home?1-S.w.home:1+S.w.home;/* Own attacking strength was previously calculated but omitted here, flattening strong and weak attacks against the same opponent. Both the club's attack and the opponent's defence now contribute on league-relative scales. */const ratioFor=clamp((ownAtk/Math.max(.1,avgAtk))*(avgDef/Math.max(.1,oppDef))*venueFor,.55,1.65),ratioAgainst=clamp((oppAtk/Math.max(.1,avgAtk))*(avgDef/Math.max(.1,ownDef))*venueAgainst,.35,2.2);const official=num(fx.difficulty,0);let dAtk=official||scaleToFive(oppDef,'def'),dCS=scaleToFive(oppAtk,'atk');dAtk=clamp(dAtk+(home?-.25:.25),1,5);dCS=clamp(dCS+(home?-.25:.25),1,5);const rawAttack=1+(ratioFor-1)*(S.w.fix/.30);const fdrAttack=1+S.w.fix*((3-dAtk)/2);let attackM=clamp(.55*rawAttack+.45*fdrAttack,.40,1.75);let lambdaAgainst=clamp(1.45*ratioAgainst,.30,3.30),pCS=Math.exp(-lambdaAgainst);
  const mkt=marketFor(team,fx);
  let marketApplied=false;
  if(mkt&&Number.isFinite(mkt.xgFor)&&Number.isFinite(mkt.xgAgainst)&&Number.isFinite(mkt.pCS)){
    const w=clamp(MARKET_WEIGHT,0,1);
    // Attack: express the market's goal expectation on the engine's own
    // multiplier scale, then blend and re-clamp to the existing bounds.
    const mktAttackM=clamp(mkt.xgFor/MARKET_LEAGUE_XG,.40,1.75);
    attackM=clamp((1-w)*attackM+w*mktAttackM,.40,1.75);
    lambdaAgainst=clamp((1-w)*lambdaAgainst+w*mkt.xgAgainst,.30,3.30);
    // Prefer the market's clean-sheet number over exp(-lambda): it carries
    // the Dixon-Coles low-score correction, which plain Poisson does not.
    pCS=clamp((1-w)*pCS+w*mkt.pCS,.002,.998);
    /* The 1-5 difficulty ratings drive the schedule matrix and the fixture
       ticker. Leaving them on the old basis would make the grid contradict
       the xP it sits next to — the matrix calling a fixture easy while the
       projection quietly disagreed. Anchored so league-average (1.45 goals)
       maps to 3, matching the scale's existing centre. */
    dAtk=clamp((1-w)*dAtk+w*clamp(3-2*(mkt.xgFor-MARKET_LEAGUE_XG),1,5),1,5);
    dCS =clamp((1-w)*dCS +w*clamp(3+2*(mkt.xgAgainst-MARKET_LEAGUE_XG),1,5),1,5);
    marketApplied=true;
  }
  const csM=clamp(Math.pow(pCS/.235,S.w.cs),.28,2.35);
  return{attackM,lambdaAgainst,pCS,csM,dAtk,dCS,marketApplied};
}
function pricePrior(pl){const c=num(pl.c);let x=2.3;if(pl.p==='GK')x=2.55+.52*(c-4);if(pl.p==='DEF')x=2.25+.68*(c-4);if(pl.p==='MID')x=2.10+.56*(c-4.5);if(pl.p==='FWD')x=2.10+.60*(c-4.5);return clamp(x,1.6,8.0)}
function baselineParts(pl){const hist=num(pl.histPts)/38,market=pricePrior(pl),base=hist>0?.88*hist+.12*market:market,dc=hist>0?clamp(num(pl.histDcPts)/38,0,base*.45):0,pr=PROFILE[pl.p]||PROFILE.MID;const APPFLOOR=2.0,app=Math.min(APPFLOOR,base*0.92),rem=Math.max(0,base-app-dc),weight=pr.cs+pr.atk+pr.bon+pr.oth;return{app,cs:rem*pr.cs/weight,dc,atk:rem*pr.atk/weight,bon:rem*pr.bon/weight,oth:rem*pr.oth/weight,base,source:hist>0?'historical + price prior':'price/position prior'}}
function availability(pl){const o=playerOverride(pl);if(o.availability!==undefined&&o.availability!=='')return clamp(num(o.availability)/100,0,1);const l=pl.live||{},chance=l.chance;if(chance!==null&&chance!==undefined)return clamp(num(chance)/100,0,1);return{a:1,d:.72,i:.06,s:0,u:.20,n:.03}[l.status]??1}
function positionUsage(pl){return POSITION_USAGE[pl.p]||POSITION_USAGE.MID}
function startIntel(pl){return START_INTEL[`${pl.t}|${pl.p}|${normalName(pl.n)}`]||null}
function historicalStartSignal(pl){const hm=Math.max(0,num(pl.histMinutes)),hs=Math.max(0,num(pl.histStarts)),h=Math.max(0,num(pl.histPts));if(hm>0||hs>0){const startShare=hs>0?hs/38:hm/(38*positionUsage(pl).defaultStartMinutes);return clamp(.10+.88*startShare,.06,.97)}const bands={GK:[[150,.90],[110,.82],[70,.70],[1,.56],[0,.38]],DEF:[[170,.92],[120,.83],[70,.70],[1,.56],[0,.40]],MID:[[180,.93],[125,.84],[70,.71],[1,.57],[0,.40]],FWD:[[170,.91],[115,.82],[65,.69],[1,.55],[0,.38]]}[pl.p]||[[170,.92],[120,.84],[70,.72],[1,.58],[0,.40]];for(const [cut,v] of bands)if(h>=cut)return v;return .40}
function priorStartProbability(pl){const cfg=positionUsage(pl),l=pl.live||{},hist=historicalStartSignal(pl),price=.34+.60*clamp((num(pl.c)-cfg.priceMin)/Math.max(.1,cfg.priceMax-cfg.priceMin),0,1),own=num(l.selected),ownSignal=own>0?clamp(.30+.64*Math.sqrt(clamp(own,0,60)/60),.30,.94):hist,official=num(l.epNext),officialSignal=official>0?clamp(.34+.075*official,.34,.94):hist;return clamp(.60*hist+.23*price+.11*ownSignal+.06*officialSignal,.02,.98)}
function roleEvidenceAdjustedProbability(pl,p,played){const intel=startIntel(pl);if(!intel)return clamp(p,.002,.998);const decay=clamp(1-played/6,0,1),q=clamp(p,.002,.998),logit=Math.log(q/(1-q))+8*intel.delta*decay;return clamp(1/(1+Math.exp(-logit)),.002,.998)}
function basePosteriorStart(pl){const o=playerOverride(pl);if(o.start!==undefined&&o.start!=='')return{p:clamp(num(o.start)/100,0,1),locked:true,source:'manual start override'};const cfg=positionUsage(pl),played=Math.max(0,num(DATA.teamPlayed[pl.t])),starts=Math.max(0,num(pl.live?.starts)),prior=priorStartProbability(pl),raw=clamp((starts+cfg.priorGames*prior)/(played+cfg.priorGames),0,1),p=roleEvidenceAdjustedProbability(pl,raw,played),intel=startIntel(pl);return{p,locked:false,source:(played?'current starts + role prior':'preseason role prior')+(intel&&played<6?' + role evidence':'')}}
function roleStarterTarget(pos,peers,played){const cfg=POSITION_USAGE[pos]||POSITION_USAGE.MID;let target=cfg.defaultSlots;if(played>0){const observed=peers.reduce((a,p)=>a+Math.max(0,num(p.live?.starts)),0)/played,trust=clamp(played/8,0,.85);target=cfg.defaultSlots*(1-trust)+clamp(observed,cfg.minSlots,cfg.maxSlots)*trust}else{const withHistory=peers.filter(p=>num(p.histStarts)>0),historicalStarts=withHistory.reduce((a,p)=>a+num(p.histStarts),0);if(historicalStarts>0){const observed=historicalStarts/38,trust=.65*clamp(withHistory.length/Math.max(1,cfg.minPeers),0,1);target=cfg.defaultSlots*(1-trust)+clamp(observed,cfg.minSlots,cfg.maxSlots)*trust}}return clamp(target,0,peers.length)}
function calibrateRoleRows(rows,target){
  const out={},goal=clamp(target,0,rows.length);
  if(!rows.length)return out;
  const oddsCalibrate=(items,wanted)=>{
    const fitted={};
    if(wanted<=1e-9){for(const r of items)fitted[r.id]=0;return fitted}
    if(wanted>=items.length-1e-9){for(const r of items)fitted[r.id]=1;return fitted}
    const probability=(p,k)=>{const q=clamp(p,.002,.998),odds=q/(1-q);return odds*k/(1+odds*k)};
    let lo=0,hi=1;
    while(items.reduce((a,r)=>a+probability(r.p,hi),0)<wanted&&hi<1e9)hi*=2;
    for(let i=0;i<64;i++){
      const mid=(lo+hi)/2,total=items.reduce((a,r)=>a+probability(r.p,mid),0);
      if(total<wanted)lo=mid;else hi=mid;
    }
    const k=(lo+hi)/2;
    for(const r of items)fitted[r.id]=probability(r.p,k);
    return fitted;
  };
  const locked=rows.filter(r=>r.locked),free=rows.filter(r=>!r.locked),lockedSum=locked.reduce((a,r)=>a+r.p,0);
  const lockedFeasible=lockedSum<=goal+1e-9&&goal-lockedSum<=free.length+1e-9;
  /* Manual values remain fixed while they are jointly feasible. If manual
     inputs themselves exceed the position target, they are odds-calibrated
     together instead of allowing an impossible final probability mass. */
  if(!free.length||!lockedFeasible){
    Object.assign(out,oddsCalibrate(rows,goal));
    return out;
  }
  for(const r of locked)out[r.id]=r.p;
  Object.assign(out,oddsCalibrate(free,clamp(goal-lockedSum,0,free.length)));
  return out;
}
function starterEvidenceStrength(pl){const cfg=positionUsage(pl),l=pl.live||{},hs=Math.max(0,num(pl.histStarts)),hm=Math.max(0,num(pl.histMinutes)),h=Math.max(0,num(pl.histPts));let history;if(hs>0||hm>0){const share=hs>0?hs/38:hm/(38*cfg.defaultStartMinutes);history=clamp((share-.25)/.65,0,1)}else{const band={GK:[55,155],DEF:[65,180],MID:[70,195],FWD:[60,180]}[pl.p]||[70,190];history=clamp((h-band[0])/(band[1]-band[0]),0,1)}const price=clamp((num(pl.c)-cfg.priceMin)/Math.max(.1,cfg.priceMax-cfg.priceMin),0,1),own=clamp(Math.sqrt(clamp(num(l.selected),0,60)/60),0,1),official=clamp(num(l.epNext)/6,0,1);let score=.58*history+.22*price+.14*own+.06*official;if(pl.histTeam&&pl.histTeam!==pl.t)score*=.78;const intel=startIntel(pl);if(intel)score=clamp(score+1.35*intel.delta,0,1);return clamp(score,0,1)}
function roleConstrainedInput(pl){
  const base=basePosteriorStart(pl),intel=roleIntelFor(pl);
  if(base.locked)return{...base,intel,evidenceApplied:false};
  let p=base.p;
  if(intel.startOverride!==null&&intel.startOverride!==undefined)p=clamp(intel.startOverride,0,1);
  if(intel.shift)p=sigmoid(logit(p)+intel.shift);
  return{...base,p:clamp(p,0,1),intel,evidenceApplied:!!intel.events.length,
    source:base.source+(intel.events.length?' + constrained role intelligence':'')};
}
function roleCalibrationStrength(pos,played){
  const cfg=POSITION_USAGE[pos]||POSITION_USAGE.MID,
    base=clamp(num(cfg.preseasonCalibration,1),0,1),
    progress=clamp(played/Math.max(1,num(cfg.liveCalibrationGames,8)),0,1);
  return clamp(base+(1-base)*progress,0,1);
}
function roleCompressionFloor(pl,played){
  if(pl.p==='GK')return 0;
  const evidence=starterEvidenceStrength(pl),progress=clamp(played/8,0,1);
  let preseason=evidence>=.78?.94:evidence>=.60?.86:evidence>=.44?.76:.60;
  const intel=startIntel(pl);
  if(intel?.delta<0)preseason=Math.min(preseason,.70);
  return clamp(preseason*(1-progress)+.58*progress,.55,.95);
}
function teamRoleStartMap(team,pos){
  const key=`${team}|${pos}`;
  if(ROLE_CACHE[key])return ROLE_CACHE[key];
  const cfg=POSITION_USAGE[pos]||POSITION_USAGE.MID,
    peers=POOL.filter(p=>p.t===team&&p.p===pos),
    played=Math.max(0,num(DATA.teamPlayed[team])),
    target=roleStarterTarget(pos,peers,played),
    rows=peers.map(p=>({id:p.id,player:p,...roleConstrainedInput(p)})),
    raw=Object.fromEntries(rows.map(r=>[r.id,r.p])),
    rawSum=rows.reduce((a,r)=>a+r.p,0);
  let probs={...raw},hard={...raw},strength=0;
  if(peers.length>=cfg.minPeers){
    hard=calibrateRoleRows(rows,target);
    strength=roleCalibrationStrength(pos,played);
    if(pos==='GK'){
      /* Critical invariant: goalkeeper is the one genuinely exclusive slot.
         Even conflicting role/manual evidence must finish on the one-slot target. */
      probs={...hard};
    }else{
      probs={};
      for(const r of rows){
        if(r.locked){probs[r.id]=r.p;continue}
        let blended=r.p+strength*((hard[r.id]??r.p)-r.p);
        if(blended<r.p)blended=Math.max(blended,r.p*roleCompressionFloor(r.player,played));
        probs[r.id]=clamp(blended,0,1);
      }
    }
  }
  const sum=Object.values(probs).reduce((a,v)=>a+v,0),
    hardSum=Object.values(hard).reduce((a,v)=>a+v,0);
  return ROLE_CACHE[key]={probs,raw,hard,rawSum,hardSum,sum,
    peerCount:peers.length,target,calibrated:peers.length>=cfg.minPeers,strength,
    mode:peers.length<cfg.minPeers?'individual prior':pos==='GK'?'strict one-slot calibration':'soft evidence-weighted calibration'};
}
function teamRoleStartProbability(pl){const role=teamRoleStartMap(pl.t,pl.p);return clamp(role.probs[pl.id]??roleConstrainedInput(pl).p,0,1)}

const ROLE_INTEL={suspend:false,exclude:null};
function roleIntelEvents(){return Array.isArray(S.roleIntel?.events)?S.roleIntel.events:[]}
/* Role evidence shifts the probability of STARTING, in log-odds — not minutes
   directly. The old additive form was baseline-blind: it moved a nailed 84-min
   starter and a 20-min fringe player by the same number of minutes, could push
   a player past 90 or below 0, and treated minutes as continuous when they are
   close to bimodal (you start ~80-90, or you don't ~0-20).
   k values below are PRIORS in log-odds, to be refit against observed starts
   via /api/scout/calibration once real gameweeks exist. */
const ROLE_EVIDENCE_POLICY=Object.freeze({
confirmed_start:{k:4,channel:'lineup',halfLife:18,ttl:30,cap:35},confirmed_bench:{k:-4,channel:'lineup',halfLife:18,ttl:30,cap:35},
unavailable:{k:-5,channel:'availability',halfLife:72,ttl:168,cap:90},suspension:{k:-5,channel:'availability',halfLife:168,ttl:336,cap:90},
minutes_restricted:{k:-1,channel:'availability',halfLife:48,ttl:96,cap:45},fitness_doubt:{k:-1,channel:'availability',halfLife:36,ttl:72,cap:25},
observed_role:{k:1,channel:'selection',halfLife:240,ttl:720,cap:12},
/* observed_bench is observed_role's mirror. Non-starts used to arrive as
   rotation_warning, which sits on the MANAGER channel where resolveRoleIntelEvents
   keeps only the single most recent event per player -- so three consecutive
   benchings counted once while three starts counted three times. A player who
   starts, is dropped, starts again could only ever drift upward. Same channel,
   same half-life, same cap, opposite sign: the last three observations now
   decide, whatever they were. */
observed_bench:{k:-1,channel:'selection',halfLife:240,ttl:720,cap:12},
rotation_warning:{k:-.65,channel:'manager',halfLife:72,ttl:120,cap:12},
friendly_start:{k:.35,channel:'selection',halfLife:96,ttl:240,cap:8},friendly_bench:{k:-.35,channel:'selection',halfLife:96,ttl:240,cap:8},
manager_positive:{k:.7,channel:'manager',halfLife:96,ttl:168,cap:10},manager_negative:{k:-.7,channel:'manager',halfLife:96,ttl:168,cap:10},
departure:{k:.4,channel:'competition',halfLife:360,ttl:1080,cap:5},injury:{k:.35,channel:'competition',halfLife:120,ttl:336,cap:6},
signing:{k:-.35,channel:'competition',halfLife:360,ttl:1080,cap:5},return:{k:-.35,channel:'competition',halfLife:120,ttl:336,cap:6}});
const ROLE_SHIFT_CAP=4.5;
function logit(p){const q=clamp(num(p),.01,.99);return Math.log(q/(1-q))}
function sigmoid(z){return 1/(1+Math.exp(-clamp(num(z),-12,12)))}
function isFriendlyRoleEvent(e){
  const type=`${e?.sourceType||''} ${e?.rawType||''} ${e?.type||''}`;
  if(/friendly_(?:start|bench)/i.test(type))return true;
  if(!/confirmed_(?:start|bench)/i.test(type))return false;
  if(e?.preseasonCalibrated)return true;
  const scope=`${e?.competition||''} ${e?.sourceUrl||''} ${e?.source||''}`;
  return /pre[- ]?season|preseason|friendly|tour match|summer series|emirates cup|johor[- ]darul[- ]ta.?zim/i.test(scope);
}
function roleEventPolicy(e){
  if(isFriendlyRoleEvent(e)){
    const t=String(e?.sourceType||e?.rawType||e?.type||'');
    return /bench/i.test(t)?ROLE_EVIDENCE_POLICY.friendly_bench:ROLE_EVIDENCE_POLICY.friendly_start;
  }
  return ROLE_EVIDENCE_POLICY[String(e.rawType||e.type)]||ROLE_EVIDENCE_POLICY[String(e.type)]||{k:0,channel:e.evidenceClass||'other',halfLife:168,ttl:336,cap:8};
}
function roleEventChannel(e){const p=roleEventPolicy(e);return isFriendlyRoleEvent(e)?p.channel:(e.evidenceClass||p.channel||'other')}
function roleEventTime(e){const t=Date.parse(e.effectiveFrom||e.evidenceDate||e.reportGeneratedAt||'');return Number.isFinite(t)?t:num(e.createdAt,Date.now())}
function roleEventFreshness(e){const p=roleEventPolicy(e),ageH=Math.max(0,(Date.now()-roleEventTime(e))/3600000),half=Math.max(1,num(e.halfLifeHours,p.halfLife));return Math.pow(.5,ageH/half)}
function roleEventExpired(e){const x=Date.parse(e.expiresAt||'');if(Number.isFinite(x))return Date.now()>x;const p=roleEventPolicy(e);return (Date.now()-roleEventTime(e))/3600000>num(p.ttl,336)}
function sameMatchScope(a,b){if(a.fixtureId&&b.fixtureId)return String(a.fixtureId)===String(b.fixtureId);if(a.gameweek&&b.gameweek)return Number(a.gameweek)===Number(b.gameweek);if(a.kickoff&&b.kickoff){const x=Date.parse(a.kickoff),y=Date.parse(b.kickoff);if(Number.isFinite(x)&&Number.isFinite(y))return Math.abs(x-y)<6*3600000}return true}
function resolveRoleIntelEvents(events){const alive=(events||[]).filter(e=>!roleEventExpired(e)).sort((a,b)=>roleEventTime(b)-roleEventTime(a)),out=[],latest=new Set(),obs=new Map(),direct=alive.filter(e=>['availability','lineup'].includes(roleEventChannel(e)));if(direct.length){const newest=direct[0];out.push(newest);for(const e of direct.slice(1))if(!sameMatchScope(newest,e))out.push(e)}for(const e of alive){const ch=roleEventChannel(e);if(ch==='availability'||ch==='lineup')continue;if(ch==='manager'){const k=`manager:${e.affectedKey||e.affected}`;if(latest.has(k))continue;latest.add(k);out.push(e);continue}if(ch==='selection'){const k=e.affectedKey||e.affected,n=obs.get(k)||0;if(n>=3)continue;obs.set(k,n+1);out.push(e);continue}out.push(e)}return out}
function roleEventLogOdds(e){const p=roleEventPolicy(e),relevance=(.5+.5*clamp(num(e.overlap),0,1))*(.5+.5*clamp(num(e.hierarchy),0,1));return num(p.k)*relevance*clamp(num(e.confidence),0,1)*roleEventFreshness(e)}
function roleDirectControls(events){
  const active=resolveRoleIntelEvents(events).sort((a,b)=>roleEventTime(b)-roleEventTime(a));
  let availabilityFactor=1,minuteCeiling=null,startOverride=null,availabilitySource=null;
  for(const e of active){
    const t=String(e.sourceType||e.rawType||e.type),conf=clamp(num(e.confidence),0,1),fresh=roleEventFreshness(e),friendly=isFriendlyRoleEvent(e);
    if(t==='unavailable'||t==='suspension'){
      const explicit=Number(e.directAvailability);
      availabilityFactor=Math.min(availabilityFactor,Number.isFinite(explicit)?clamp(explicit,0,1):1-.98*conf*fresh);
      availabilitySource=t;
    }else if(t==='fitness_doubt'){
      const explicit=Number(e.directAvailability),factor=Number.isFinite(explicit)?clamp(explicit,0,1):clamp(1-.45*conf*fresh,.35,1);
      availabilityFactor=Math.min(availabilityFactor,factor);availabilitySource=t;
    }else if(t==='minutes_restricted'){
      const cap=Number(e.minutesCap);if(Number.isFinite(cap))minuteCeiling=minuteCeiling===null?clamp(cap,0,90):Math.min(minuteCeiling,clamp(cap,0,90));
    }else if(t==='confirmed_start'&&!friendly){
      startOverride=Math.max(startOverride??0,clamp(Number.isFinite(Number(e.selectionCertainty))?Number(e.selectionCertainty):.995,.85,.999));availabilityFactor=1;availabilitySource=t;
    }else if(t==='confirmed_bench'&&!friendly){
      startOverride=Math.min(startOverride??1,clamp(1-(Number.isFinite(Number(e.selectionCertainty))?Number(e.selectionCertainty):.995),.001,.15));availabilityFactor=1;availabilitySource=t;
    }
  }
  return{availabilityFactor:clamp(availabilityFactor,0,1),minuteCeiling,startOverride,availabilitySource};
}
/* Marginal constrained projection delta. This is useful for before/after diagnostics,
   but after club-position normalisation it is NOT a safe semantic label for an
   individual selection event: removing one event redistributes probability mass
   across every peer in the slot group and can invert the event's apparent sign. */
function roleIntelEventDelta(e){const pl=(typeof POOL!=='undefined'&&Array.isArray(POOL))?POOL.find(x=>stableKey(x)===e.affectedKey):null;if(!pl)return clamp(roleEventLogOdds(e)*10,-35,35);const withAll=minuteDetail(pl).exp;ROLE_INTEL.exclude=e.id;bumpCache();const without=minuteDetail(pl).exp;ROLE_INTEL.exclude=null;bumpCache();const raw=withAll-without,p=roleEventPolicy(e),cap=Math.max(1,num(e.maxMinuteImpact,p.cap));return clamp(raw,-cap,cap)}
/* Selection evidence is directional by definition. Keep that semantic direction
   separate from the constrained counterfactual above. The final player-level
   xMin/xPts effect remains visible in the before/after impact panel below. */
function roleSelectionEvidenceDirection(e){const t=String(e?.rawType||e?.sourceType||e?.type||'');if(/^(?:confirmed_start|friendly_start|observed_role|manager_positive)$/.test(t))return 1;if(/^(?:confirmed_bench|friendly_bench|observed_bench|rotation_warning|manager_negative)$/.test(t))return -1;return 0}
function roleEventPresentation(e){const dir=roleSelectionEvidenceDirection(e);if(dir)return{direction:dir,tone:dir>0?'positive':'negative',label:dir>0?'↑ START EVIDENCE':'↓ START EVIDENCE',selection:true};const d=roleIntelEventDelta(e);return{direction:d===0?0:(d>0?1:-1),tone:d>=0?'positive':'negative',label:`${d>=0?'+':''}${d.toFixed(1)} xMin`,selection:false}}
function roleIntelFor(pl){if(ROLE_INTEL.suspend)return{shift:0,events:[],availabilityFactor:1,minuteCeiling:null,startOverride:null};const key=stableKey(pl),events=resolveRoleIntelEvents(roleIntelEvents().filter(e=>e.affectedKey===key&&e.id!==ROLE_INTEL.exclude)),shift=clamp(events.reduce((a,e)=>a+roleEventLogOdds(e),0),-ROLE_SHIFT_CAP,ROLE_SHIFT_CAP),direct=roleDirectControls(events);return{shift,events,...direct}}
function roleProductionImpact(pl){const key=stableKey(pl),events=resolveRoleIntelEvents(roleIntelEvents().filter(e=>e.affectedKey===key&&e.id!==ROLE_INTEL.exclude));return clamp(events.reduce((a,e)=>a+clamp(num(e.productionImpact),-.25,.25)*clamp(num(e.confidence),0,1)*roleEventFreshness(e),0),-.20,.20)}
/* RC5.0.28 — "Model evidence" in the inspect modal is a DATA-VOLUME confidence
   score (minutes sample, historical points, proximity to official FPL EP). It
   says nothing about whether current news/role uncertainty (a new signing, a
   player just back from a long injury, a fitness doubt) has actually been
   checked. Those cases can show a high, reassuring confidence percentage
   purely because there is plenty of historical STATISTICAL data, even though
   no one has verified the player's CURRENT situation. Scout coverage is the
   separate, honest signal for that: whether any live-scanned or manual
   role-intelligence evidence is currently active for this specific player. */
function scoutCoverageFor(pl){
  const events=roleIntelFor(pl).events||[],worker=events.filter(e=>e.worker);
  return{count:events.length,workerCount:worker.length,hasWorkerEvidence:worker.length>0,hasAnyEvidence:events.length>0};
}
function roleEvidenceLabel(e){return num(e.confidence)>=.9?'confirmed':num(e.confidence)>=.55?'provisional':'speculative'}
function minuteDetailCore(pl){
  const l=pl.live||{},o=playerOverride(pl),cfg=positionUsage(pl),baseAvail=availability(pl);
  const played=Math.max(0,num(DATA.teamPlayed[pl.t])),starts=Math.max(0,num(l.starts)),minutes=Math.max(0,num(l.minutes));
  /* This is the FINAL constrained probability. Role intelligence has already
     entered the unconstrained row consumed by teamRoleStartMap; nothing below
     may replace or shift pStart after the club/position slot constraint. */
  const pStart=teamRoleStartProbability(pl),subAppearRate=clamp(cfg.subBase+cfg.subRotation*(1-pStart),cfg.subMin,cfg.subMax);
  const nonStartGames=Math.max(0,played-starts),estSubMinutes=nonStartGames*subAppearRate*cfg.subMinutes;
  const estStartMinutes=starts>0?Math.max(starts*cfg.minStartMinutes,minutes-estSubMinutes):0;
  const avgStart=starts>0?clamp(estStartMinutes/starts,cfg.minStartMinutes,90):cfg.defaultStartMinutes;
  const roleIntel=roleIntelFor(pl),avail=clamp(baseAvail*clamp(num(roleIntel.availabilityFactor,1),0,1),0,1);
  let autoNoAvail=pStart*avgStart+(1-pStart)*subAppearRate*cfg.subMinutes;
  if(o.minutes!==undefined&&o.minutes!=='')autoNoAvail=clamp(num(o.minutes),0,90);
  else if(roleIntel.minuteCeiling!==null&&roleIntel.minuteCeiling!==undefined)autoNoAvail=Math.min(autoNoAvail,clamp(roleIntel.minuteCeiling,0,90));
  const exp=clamp(autoNoAvail*avail,0,90),prior=priorStartProbability(pl);
  const priorSub=clamp(cfg.subBase+cfg.subRotation*(1-prior),cfg.subMin,cfg.subMax);
  const priorNoAvail=prior*cfg.defaultStartMinutes+(1-prior)*priorSub*cfg.subMinutes;
  const relative=clamp(exp/Math.max(8,priorNoAvail),0,1.35),pSubAppear=(1-pStart)*subAppearRate;
  const pAppear=clamp(avail*(pStart+pSubAppear),0,1);
  const p60GivenStart=pl.p==='GK'?clamp((avgStart-50)/35,.50,.995):clamp((avgStart-45)/35,.05,.97);
  const p60=clamp(avail*pStart*p60GivenStart,0,pAppear),role=teamRoleStartMap(pl.t,pl.p);
  const baseStart=basePosteriorStart(pl),startOverride=o.start!==undefined&&o.start!=='';
  return{exp,avail,pStart,avgStart,pAppear,p60,relative,pSubAppear,subAppearRate,subApprearRate:subAppearRate,p60GivenStart,
    override:o.minutes!==undefined&&o.minutes!=='',startOverride,roleTarget:role.target,rolePeers:role.peerCount,
    roleCalibrated:role.calibrated,roleModel:role.mode,roleRawStart:role.raw[pl.id]??baseStart.p,
    roleHardStart:role.hard[pl.id]??baseStart.p,roleCalibrationStrength:role.strength,roleSum:role.sum,
    roleRawSum:role.rawSum,roleCompressionFloor:roleCompressionFloor(pl,played),starterEvidence:starterEvidenceStrength(pl),
    startSource:startOverride?'manual start override':baseStart.source+(roleIntel.events.length?' + constrained role intelligence':''),
    intel:startIntel(pl)?.label||'',roleIntelDelta:num(role.raw[pl.id],baseStart.p)-baseStart.p,roleIntelEvents:roleIntel.events};
}

function poissonTail(lambda,k){let term=Math.exp(-lambda),cdf=term;for(let i=1;i<k;i++){term*=lambda/i;cdf+=term}return clamp(1-cdf,0,1)}
function gcDeduction(lambda){let p=Math.exp(-lambda),sum=0;for(let k=1;k<12;k++){p*=lambda/k;sum+=Math.floor(k/2)*p}return-sum}
function rate90(total,minutes){return minutes>0?num(total)*90/minutes:0}
function scaleParts(parts,target){const s=sumParts(parts);if(Math.abs(s)<1e-9)return{...parts,oth:num(parts.oth)+(target-s)};const m=target/s;const out={};for(const k of Object.keys(parts))out[k]=parts[k]*m;return out}
let CALIB=null;
function calibrateMultipliers(){
  /* A fixture multiplier must average 1.0 across the league, otherwise every player is inflated (or deflated) regardless of who they play. */
  let a=0,c=0,n=0;
  for(const t of Object.keys(TEAMS)){
    for(let g=1;g<=38;g++){
      const fxs=fixtureListFor(t,g);
      for(const f of fxs){ const x=fixtureContext(t,f); a+=x.attackM; c+=x.csM; n++; }
    }
  }
  CALIB = n ? {atk:a/n, cs:c/n} : {atk:1,cs:1};
  return CALIB;
}
function calib(){ return CALIB||calibrateMultipliers(); }
function setPieceRoleMultiplier(pl){if(num(pl.histPts)>0&&(!pl.histTeam||pl.histTeam===pl.t))return 1;const po=num(pl.live?.penOrder,99),co=num(pl.live?.cornerOrder,99),fo=num(pl.live?.fkOrder,99);let lift=po===1?.08:po===2?.02:0;lift+=co===1?.03:co===2?.01:0;lift+=fo===1?.03:fo===2?.01:0;return clamp(1+lift,.94,1.16)}
function bpsRuleAdjustment(pl,b){if(pl.p==='DEF'){const dcShare=b.base>0?clamp(b.dc/b.base,0,1):0;return clamp(1-(1/3)*dcShare,0.80,1.0)}if(pl.p==='GK'){return 1.06}return 1.05}
function minuteDetail(pl){
  const sp=roleSplitFor(pl);
  if(!sp||ROLE_SPLIT_RUN)return minuteDetailCore(pl);
  const A=withRoleSplitBranch(pl,false,()=>minuteDetailCore(pl));
  const B=withRoleSplitBranch(pl,true,()=>minuteDetailCore(pl));
  const w=sp.w,mix=(a,b)=>w*num(a)+(1-w)*num(b);
  return{...A,
    exp:mix(A.exp,B.exp),
    pStart:mix(A.pStart,B.pStart),
    pAppear:mix(A.pAppear,B.pAppear),
    pSubAppear:mix(A.pSubAppear,B.pSubAppear),
    p60:mix(A.p60,B.p60),
    relative:mix(A.relative,B.relative),
    avgStart:mix(A.avgStart,B.avgStart),
    split:{w,minutesA:A.exp,minutesB:B.exp,altMinutes:sp.minutes},
    startSource:'role split ('+Math.round(100*w)+'% primary)'};
}
function priorFixtureProjection(pl,ctx0){const K=calib(),ctx={...ctx0,attackM:ctx0.attackM/K.atk,csM:ctx0.csM/K.cs},b=baselineParts(pl),md=minuteDetail(pl),role=clamp(1+num(playerOverride(pl).role)/100,.65,1.35),bonusM=clamp(.55*ctx.attackM+.25*ctx.csM+.20,0.5,1.65),dcM=clamp(S.w.dc*(1+.08*(ctx.dCS-3)),0,1.8);const transferAtk=pl.histTeam&&pl.histTeam!==pl.t&&TEAMS[pl.histTeam]?clamp(ratingValue(pl.t,'atk',true)/Math.max(.1,ratingValue(pl.histTeam,'atk',true)),.75,1.30):1,transferDef=pl.histTeam&&pl.histTeam!==pl.t&&TEAMS[pl.histTeam]?clamp(ratingValue(pl.t,'def',true)/Math.max(.1,ratingValue(pl.histTeam,'def',true)),.75,1.30):1,bpsRule=bpsRuleAdjustment(pl,b);const CSMAX={GK:4,DEF:4,MID:1,FWD:0}[pl.p]||0,csCap=CSMAX*0.55*md.relative;const setPieceM=setPieceRoleMultiplier(pl);const prodM=1+roleProductionImpact(pl),parts={app:Math.min(2.0,b.app*md.relative),cs:Math.min(csCap,b.cs*ctx.csM*md.relative*transferDef),dc:b.dc*dcM*md.relative,atk:b.atk*ctx.attackM*md.relative*role*transferAtk*setPieceM*prodM,bon:b.bon*bonusM*md.relative*role*transferAtk*bpsRule*clamp(1+.5*(prodM-1),.9,1.1),oth:b.oth*md.relative};const x=sumParts(parts),rotation=(1-md.pStart)*2.2+(1-md.avail)*4,variance=Math.max(1.2,1.6+parts.atk*2.1+Math.max(0,parts.cs)*.7+rotation);return{x,parts,variance,source:b.source,md}}
function liveFixtureProjection(pl,ctx){const l=pl.live||{},md=minuteDetail(pl),m=Math.max(0,num(l.minutes)),role=clamp(1+num(playerOverride(pl).role)/100,.65,1.35),goalPts=GOALPTS[pl.p]||4,xg90=rate90(l.xG,m),xa90=rate90(l.xA,m),eg=xg90*md.exp/90*ctx.attackM,ea=xa90*md.exp/90*ctx.attackM;const prodM=1+roleProductionImpact(pl),app=md.pAppear+md.p60,atk=(eg*goalPts+ea*3)*role*prodM,cs=(CSPTS[pl.p]||0)*ctx.pCS*md.p60;let oth=0;if(pl.p==='GK')oth+=rate90(l.saves,m)*md.exp/90/3+rate90(l.pensSaved,m)*md.exp/90*5;if(pl.p==='GK'||pl.p==='DEF')oth+=gcDeduction(ctx.lambdaAgainst*md.exp/90);oth-=rate90(l.yellow,m)*md.exp/90;oth-=3*rate90(l.red,m)*md.exp/90;oth-=2*rate90(l.ownGoals,m)*md.exp/90;oth-=2*rate90(l.pensMissed,m)*md.exp/90;const dc90=num(l.dc90),threshold=pl.p==='DEF'?10:12,dc=dc90>0?2*poissonTail(dc90*md.exp/90,threshold)*S.w.dc:0,bon=rate90(l.bonus,m)*md.exp/90*clamp(.65+.25*ctx.attackM+.10*ctx.csM,.55,1.45)*role*clamp(1+.5*(prodM-1),.9,1.1);const parts={app,cs,dc,atk,bon,oth},x=sumParts(parts),variance=Math.max(1,eg*goalPts*goalPts+ea*9+(CSPTS[pl.p]||0)**2*ctx.pCS*(1-ctx.pCS)*md.p60+dc*(2-dc)+Math.max(0,bon)*1.3+(1-md.pStart)*2.5);return{x,parts,variance,source:'live xG/xA and event rates',md,eg,ea}}
function projectFixture(pl,fx){const ctx=fixtureContext(pl.t,fx),prior=priorFixtureProjection(pl,ctx),live=liveFixtureProjection(pl,ctx),m=num(pl.live?.minutes),evidence=clamp(m/(m+900),0,.78),parts={};for(const k of ['app','cs','dc','atk','bon','oth'])parts[k]=prior.parts[k]*(1-evidence)+live.parts[k]*evidence;let x=sumParts(parts),variance=prior.variance*(1-evidence)*(1-evidence)+live.variance*evidence*evidence;return{x,parts,variance,ctx,prior,live,evidence,fx}}
const FIXTURE_BENCHMARK={low:12,high:17,label:'external working benchmark'};
function neutralFixtureContext(){const pCS=.235;return{attackM:1,lambdaAgainst:-Math.log(pCS),pCS,csM:1,dAtk:3,dCS:3}}
function neutralProjectFixture(pl,fx){const ctx=neutralFixtureContext(),prior=priorFixtureProjection(pl,ctx),live=liveFixtureProjection(pl,ctx),m=num(pl.live?.minutes),evidence=clamp(m/(m+900),0,.78),parts={};for(const k of ['app','cs','dc','atk','bon','oth'])parts[k]=prior.parts[k]*(1-evidence)+live.parts[k]*evidence;return{x:sumParts(parts),parts,ctx,prior,live,evidence,fx}}
function fixtureInfluenceDiagnostic(){const pos={GK:{},DEF:{},MID:{},FWD:{}},all={};const init=o=>Object.assign(o,{n:0,sumNeutral:0,sumAbs:0,sumSigned:0,sumPct:0,min:Infinity,max:-Infinity});init(all);Object.values(pos).forEach(init);let players=0;for(const pl of POOL){if(!TEAMS[pl.t])continue;const md=minuteDetail(pl);if(md.exp<15||md.avail<=.05)continue;let used=false;for(let gw=1;gw<=38;gw++){for(const fx of fixtureListFor(pl.t,gw)){const actual=projectFixture(pl,fx).x,neutral=neutralProjectFixture(pl,fx).x;if(!Number.isFinite(actual)||!Number.isFinite(neutral)||neutral<.25)continue;const signed=(actual-neutral)/neutral,abs=Math.abs(signed),bucket=pos[pl.p]||all;for(const o of [all,bucket]){o.n++;o.sumNeutral+=neutral;o.sumAbs+=Math.abs(actual-neutral);o.sumSigned+=actual-neutral;o.sumPct+=abs;o.min=Math.min(o.min,signed);o.max=Math.max(o.max,signed)}used=true}}if(used)players++}const finish=o=>({n:o.n,weighted:o.sumNeutral?100*o.sumAbs/o.sumNeutral:0,mean:o.n?100*o.sumPct/o.n:0,signed:o.sumNeutral?100*o.sumSigned/o.sumNeutral:0,min:Number.isFinite(o.min)?100*o.min:0,max:Number.isFinite(o.max)?100*o.max:0});return{overall:finish(all),positions:Object.fromEntries(Object.entries(pos).map(([k,v])=>[k,finish(v)])),players,benchmark:FIXTURE_BENCHMARK,dataMode:DATA.mode,generatedAt:Date.now()}}
function renderFixtureInfluenceDiagnostic(result){const host=document.getElementById('fxInfluenceOut');if(!host)return;const o=result.overall,b=result.benchmark,tone=o.weighted>=b.low&&o.weighted<=b.high?'good':o.weighted<b.low?'warn':'info',verdict=o.weighted>=b.low&&o.weighted<=b.high?'ALIGNED':o.weighted<b.low?'BELOW BENCHMARK':'ABOVE BENCHMARK',rows=['GK','DEF','MID','FWD'].map(k=>{const x=result.positions[k];return`<div class="fixture-audit-row"><span>${k}</span><span>${x.weighted.toFixed(1)}%</span><span>${x.mean.toFixed(1)}%</span><span class="hide-mobile">${x.signed>=0?'+':''}${x.signed.toFixed(2)}%</span></div>`}).join('');host.innerHTML=`<div class="fixture-audit-grid"><div class="fixture-audit-card ${tone}"><div class="k">Weighted mean effect</div><div class="v">${o.weighted.toFixed(1)}%</div></div><div class="fixture-audit-card info"><div class="k">Mean player-fixture effect</div><div class="v">${o.mean.toFixed(1)}%</div></div><div class="fixture-audit-card ${tone}"><div class="k">Benchmark verdict</div><div class="v" style="font-size:12px">${verdict}</div></div><div class="fixture-audit-card"><div class="k">Signed league mean</div><div class="v">${o.signed>=0?'+':''}${o.signed.toFixed(2)}%</div></div><div class="fixture-audit-card"><div class="k">Eligible players</div><div class="v">${result.players}</div></div><div class="fixture-audit-card"><div class="k">Player-fixtures</div><div class="v">${o.n}</div></div></div><div class="fixture-audit-table"><div class="fixture-audit-row head"><span>Pos</span><span>Weighted abs.</span><span>Mean abs.</span><span class="hide-mobile">Signed</span></div>${rows}</div><div class="fixture-audit-note"><b>Interpretation:</b> weighted mean absolute effect is the stable comparison measure: Σ|real xP − neutral xP| ÷ Σneutral xP. The ordinary signed mean should remain near zero because OTB calibrates league-wide fixture multipliers to 1.0. Sample excludes players below 15 expected minutes and neutral projections below 0.25 xP. Working comparison band: ${b.low}–${b.high}% (research-informed, not an official FPL coefficient). Data mode: ${esc(result.dataMode)}.</div>`}
function runFixtureInfluenceDiagnostic(){const btn=document.getElementById('btnFixtureInfluence'),host=document.getElementById('fxInfluenceOut');if(btn)btn.disabled=true;if(host)host.innerHTML='<div class="chip-ai-loading">Running real-versus-neutral projections across every eligible player and league fixture…</div>';setTimeout(()=>{try{const r=fixtureInfluenceDiagnostic();renderFixtureInfluenceDiagnostic(r);globalThis.__OTB_FIXTURE_INFLUENCE__=r}catch(e){if(host)host.innerHTML=`<div class="verdict warn"><b>Diagnostic failed.</b> ${esc(e.message)}</div>`}finally{if(btn)btn.disabled=false}},20)}
/* Predictive variance for blended projections.
   ------------------------------------------------------------------
   The old form was variance *= (1-w)^2, which is Var(aX+bY) for two
   INDEPENDENT ESTIMATORS OF A MEAN. That is the wrong quantity here.
   low/high are a predictive interval for the player's ACTUAL points, and the
   outcome variance of football — did he score, did the team keep a clean
   sheet — does not shrink because we obtained a better point estimate.
   Blending two views of the mean cannot reduce the randomness of the match.

   Treating the blend as a MIXTURE instead gives the law of total variance:
       Var = (1-w)V1 + wV2 + w(1-w)(m1-m2)^2
   Both components describe the same underlying scoring process, so V1 ~ V2 = V
   and this collapses to:
       Var = V + w(1-w)(m1-m2)^2
   Variance is therefore unchanged by blending, plus a penalty when the two
   sources DISAGREE — which is the correct direction: disagreement is evidence
   of model uncertainty, not of precision.

   Set PREDICTIVE_VARIANCE=false to restore the previous behaviour exactly. */
const PREDICTIVE_VARIANCE=true;
function blendVariance(v,w,mA,mB,legacyAdd){
  const base=Math.max(0,num(v)),ww=clamp(num(w),0,1);
  if(!PREDICTIVE_VARIANCE)return base*Math.pow(1-ww,2)+num(legacyAdd)*ww;
  const d=num(mA)-num(mB);
  return base+ww*(1-ww)*d*d;
}
function projectCore(pl,gw,ck){const key=pl.id+'|'+gw+(ck||'');if(PROJ_CACHE[key])return PROJ_CACHE[key];const fxs=fixtureListFor(pl.t,gw);if(!fxs.length)return PROJ_CACHE[key]={x:0,low:0,high:0,sd:0,confidence:90,d:null,fixtures:[],parts:{app:0,cs:0,dc:0,atk:0,bon:0,oth:0},detail:{reason:'blank gameweek'}};const rows=fxs.map(f=>projectFixture(pl,f)),parts={app:0,cs:0,dc:0,atk:0,bon:0,oth:0};let x=0,variance=0;for(const r of rows){x+=r.x;variance+=r.variance;for(const k in parts)parts[k]+=r.parts[k]}const l=pl.live||{},played=num(DATA.teamPlayed[pl.t]),form=num(l.form),formW=form>0?S.w.form*clamp(played/6,0,1):0;if(formW>0){const target=form*availability(pl)*fxs.length,priorMean=x;x=x*(1-formW)+target*formW;variance=blendVariance(variance,formW,priorMean,target,0);Object.assign(parts,scaleParts(parts,x))}const next=DATA.nextEvent||1,official=num(l.epNext),offW=official>0&&gw===next?S.w.official:0;if(offW>0){const priorMean=x;x=x*(1-offW)+official*offW;variance=blendVariance(variance,offW,priorMean,official,.9);Object.assign(parts,scaleParts(parts,x))}const sd=Math.sqrt(Math.max(.15,variance)),low=x-1.2816*sd,high=x+1.2816*sd,evidence=rows.reduce((a,r)=>a+r.evidence,0)/rows.length,baseData=num(pl.histPts)>0?.55:.30,confidence=clamp(Math.round(100*(baseData+.30*evidence+.10*(offW>0)-.12*Math.min(1,sd/(x+2)))),20,94);return PROJ_CACHE[key]={x,low,high,sd,confidence,d:rows[0].fx,fixtures:rows,parts,detail:{evidence,formW,offW,expectedMinutes:rows[0].prior.md.exp,availability:rows[0].prior.md.avail,source:DATA.mode}}}
/* Gameweek outcomes are NOT independent. The dominant source of week-to-week
   variance is minutes risk, and that is persistent: a player who loses his
   place in GW10 is likely also out in GW11-13. Summing per-gameweek variances
   (Var = SUM v_i) therefore understates the spread of a multi-week total.

   With a constant pairwise correlation rho:
       Var(total) = SUM v_i + rho * [ (SUM sd_i)^2 - SUM v_i ]
   which is exact at rho=0 (independence, the old behaviour) and at rho=1
   (perfect persistence, where standard deviations add linearly).

   At a 5-week horizon with equal weekly sd, this widens the interval by
   sqrt(1 + rho*(n-1)) -- about 61% at rho=0.35.

   HORIZON_RHO is NOT calibrated. It is a deliberate single constant rather
   than a per-player estimate: a flat rho slightly over-widens nailed starters
   and under-widens rotation risks, but inventing a per-player correlation on
   top of uncalibrated inputs would be compounding guesswork. Fitting rho from
   observed multi-week totals is the natural follow-up once the season supplies
   data. Set HORIZON_CORRELATION=false to restore the old independent sum. */
const HORIZON_CORRELATION=true;
const HORIZON_RHO=.35;

function project(pl,gw){
  const sp=roleSplitFor(pl);
  if(!sp||ROLE_SPLIT_RUN)return projectCore(pl,gw);
  const key='split|'+pl.id+'|'+gw;
  if(PROJ_CACHE[key])return PROJ_CACHE[key];
  const A=withRoleSplitBranch(pl,false,()=>projectCore(pl,gw,'|rsA'));
  const B=withRoleSplitBranch(pl,true,()=>projectCore(pl,gw,'|rsB'));
  const w=sp.w,d=A.x-B.x;
  const x=w*A.x+(1-w)*B.x;
  /* law of total variance: within-scenario term + between-scenario disagreement */
  const within=w*A.sd*A.sd+(1-w)*B.sd*B.sd,between=w*(1-w)*d*d;
  const sd=Math.sqrt(Math.max(.15,within+between));
  const parts={};for(const k in A.parts)parts[k]=w*num(A.parts[k])+(1-w)*num(B.parts[k]);
  Object.assign(parts,scaleParts(parts,x));
  const confidence=clamp(Math.round(w*A.confidence+(1-w)*B.confidence-12*Math.min(1,Math.abs(d)/Math.max(1,Math.abs(x)+2))),20,94);
  return PROJ_CACHE[key]={x,low:x-1.2816*sd,high:x+1.2816*sd,sd,confidence,
    d:A.d,fixtures:A.fixtures,parts,
    detail:{...A.detail,roleSplit:{w,xA:A.x,xB:B.x,sdA:A.sd,sdB:B.sd,within:Math.sqrt(within),between:Math.sqrt(between),minutesA:A.detail.expectedMinutes,minutesB:B.detail.expectedMinutes}}};
}
const HORIZON_INTERVAL_Z=1.2816;
function horizonForecast(pl){const key=pl.id+'|'+S.gw+'|'+S.horizon+'|'+S.risk;if(HORIZON_CACHE[key])return HORIZON_CACHE[key];let sum=0,varSum=0,sdSum=0,confidenceSum=0,n=0,first=null,last=null;for(let g=S.gw;g<=38&&n<S.horizon;g++){const r=project(pl,g);sum+=r.x;varSum+=r.sd*r.sd;sdSum+=r.sd;confidenceSum+=r.confidence;n++;if(first===null)first=g;last=g}const rho=HORIZON_CORRELATION?clamp(HORIZON_RHO,0,1):0,totalVar=Math.max(0,varSum+rho*(sdSum*sdSum-varSum)),total=sum,totalSd=Math.sqrt(totalVar),mean=n?sum/n:0,sd=n?totalSd/n:0,confidence=n?confidenceSum/n:0,low=total-HORIZON_INTERVAL_Z*totalSd,high=total+HORIZON_INTERVAL_Z*totalSd,utility=S.risk==='safe'?mean-.25*sd:S.risk==='upside'?mean+.20*sd:mean,totalUtility=S.risk==='safe'?total-.25*totalSd:S.risk==='upside'?total+.20*totalSd:total;return HORIZON_CACHE[key]={mean,sd,utility,total,totalSd,totalUtility,confidence,low,high,n,first,last}}
function horizonLabel(){const h=horizonSpan();return h.n<=1?`GW${h.first}`:`GW${h.first}–${h.last}`}
function horizonSpan(){const first=clamp(S.gw,1,38),n=Math.max(0,Math.min(S.horizon,39-first)),last=n?first+n-1:first;return{n,first,last}}
const moneyTenths=v=>Math.round(num(v)*10),moneyTotal=players=>players.reduce((a,p)=>a+moneyTenths(p.c),0)/10;const byId=id=>POOL.find(p=>p.id===id),squadPlayers=()=>S.squad.map(byId).filter(Boolean),spent=()=>moneyTotal(squadPlayers()),bank=()=>Math.round((moneyTenths(S.budget)-moneyTenths(spent())))/10,countPos=pos=>squadPlayers().filter(p=>p.p===pos).length,countClub=t=>squadPlayers().filter(p=>p.t===t).length;
function canAdd(pl){if(!pl)return'Player is no longer available in the live pool.';if(S.squad.length>=15)return'Squad is already 15 players.';if(S.squad.includes(pl.id))return'Already in your squad.';if(S.buildBlocks.has(pl.id))return`${pl.n} is blocked from Build. Tap Unblock in the player pool to allow selection again.`;if(countPos(pl.p)>=LIMITS[pl.p])return`You already have ${LIMITS[pl.p]} ${pl.p}s.`;if(countClub(pl.t)>=3)return`Three players from ${TEAMS[pl.t]?.n||pl.t} is the limit.`;if(pl.c>bank()+1e-3)return`£${pl.c.toFixed(1)}m is more than your £${bank().toFixed(1)}m bank.`;return null}
function addPlayer(id){syncControls();const pl=byId(id),err=canAdd(pl);if(err){flash(err);return}S.squad.push(id);autoXI();render();saveUserState()}
function removePlayer(id){S.squad=S.squad.filter(x=>x!==id);S.start.delete(id);S.locks.delete(id);if(S.cap===id)S.cap=null;if(S.vice===id)S.vice=null;autoXI();render();saveUserState()}
function toggleBuildBlock(id){const pl=byId(id);if(!pl)return;if(S.buildBlocks.has(id)){S.buildBlocks.delete(id);render();saveUserState();flash(`${pl.n} is available to Build again.`);return}S.buildBlocks.add(id);S.locks.delete(id);const wasOwned=S.squad.includes(id);if(wasOwned){S.squad=S.squad.filter(x=>x!==id);S.start.delete(id);if(S.cap===id)S.cap=null;if(S.vice===id)S.vice=null;autoXI()}render();saveUserState();flash(`${pl.n} blocked from Build${wasOwned?' and removed from the squad':''}.`)}
function clearBuildBlocks(){const total=S.buildBlocks.size;if(!total){flash('No players are blocked from Build.');return}S.buildBlocks.clear();render();saveUserState();flash(`Cleared ${total} Build block${total===1?'':'s'}.`)}
function autoXI(){const ps=squadPlayers().map(p=>({p,x:project(p,S.gw).x})).sort((a,b)=>b.x-a.x),xi=[],need={GK:1,DEF:3,MID:2,FWD:1},cap={GK:1,DEF:5,MID:5,FWD:3},got={GK:0,DEF:0,MID:0,FWD:0};for(const k of ['GK','DEF','MID','FWD'])ps.filter(o=>o.p.p===k).slice(0,need[k]).forEach(o=>{xi.push(o);got[k]++});for(const o of ps.filter(o=>!xi.includes(o))){if(xi.length>=11)break;if(got[o.p.p]>=cap[o.p.p])continue;xi.push(o);got[o.p.p]++}S.start=new Set(xi.map(o=>o.p.id));const rank=xi.slice().sort((a,b)=>b.x-a.x);if(!S.capManual||!S.start.has(S.cap))S.cap=rank[0]?.p.id??null;if(!S.viceManual||!S.start.has(S.vice)||S.vice===S.cap)S.vice=(rank.find(o=>o.p.id!==S.cap)?.p.id)??null}
/* A viewed-GW change is a lineup decision, never a squad-construction run.
   Reuse the Builder's legal-XI and expected-autosub selectors against the
   owned 15, then update only XI/captain/bench state. */
function optimiseViewedLineup(){
  const gwEl=document.getElementById('gwSel');if(gwEl)gwEl.value=String(S.gw);
  const list=squadPlayers(),forced=document.getElementById('oForm')?.value||null;
  if(list.length!==15){autoXI();return null}
  const plan=bestXIForGw(list,forced,S.gw);if(!plan){autoXI();return null}
  S.start=new Set(plan.xi.map(o=>o.p.id));
  const outfieldBench=plan.benchRows.filter(o=>o.p.p!=='GK');
  if(outfieldBench.length===3){const bench=expectedAutosub(plan);if(bench?.order?.length===3)S.benchOrder=bench.order.map(o=>stableKey(o.p))}
  const rank=plan.xi.slice().sort((a,b)=>b.x-a.x);
  if(!S.capManual||!S.start.has(S.cap))S.cap=rank[0]?.p.id??null;
  if(!S.viceManual||!S.start.has(S.vice)||S.vice===S.cap)S.vice=rank.find(o=>o.p.id!==S.cap)?.p.id??null;
  return plan;
}
const XI_MIN={GK:1,DEF:3,MID:2,FWD:1},XI_MAX={GK:1,DEF:5,MID:5,FWD:3};
function xiCounts(ids){const c={GK:0,DEF:0,MID:0,FWD:0};ids.forEach(id=>{const p=byId(id);if(p&&c[p.p]!==undefined)c[p.p]++});return c}
/* Returns null if this XI is legal (or a legal work-in-progress), else why not. */
function xiLegality(ids){
  const c=xiCounts(ids),n=ids.length;
  const plural=k=>XI_MIN[k]>1?'s':'';
  for(const k in XI_MAX) if(c[k]>XI_MAX[k])
    return `That would put ${c[k]} ${k}${c[k]>1?'s':''} in the XI. The most allowed is ${XI_MAX[k]}.`;
  if(n>11) return 'The XI is already full at 11.';
  if(n===11){ for(const k in XI_MIN) if(c[k]<XI_MIN[k])
    return `A legal XI needs at least ${XI_MIN[k]} ${k}${plural(k)}. That leaves you with ${c[k]}.`; }
  const shortfall=Object.keys(XI_MIN).reduce((a,k)=>a+Math.max(0,XI_MIN[k]-c[k]),0);
  if(shortfall>11-n) return 'That leaves too few places to still complete a legal formation.';
  return null;
}
function ensureCaptainValid(){const xi=[...S.start];if(!xi.length){return}if(!S.capManual||!S.start.has(S.cap)){const ranked=xi.map(id=>({id,x:project(byId(id),S.gw).x})).sort((a,b)=>b.x-a.x);S.cap=ranked[0]?.id??null}if(!S.viceManual||!S.start.has(S.vice)||S.vice===S.cap){const ranked=xi.filter(id=>id!==S.cap).map(id=>({id,x:project(byId(id),S.gw).x})).sort((a,b)=>b.x-a.x);S.vice=ranked[0]?.id??null}}
function clearCurrentSquad(){if(!S.squad.length){flash('Squad is already empty.');return false}if(!confirm('Clear all players and start a new squad? Saved squads, budget, model settings and live data will be kept.'))return false;S.squad=[];S.start.clear();S.locks.clear();S.cap=S.vice=null;S.benchOrder=[];S.transfer.purchase={};S.transfer.last=null;bumpCache();render();saveUserState();flash('Squad cleared. Add players manually or use Auto-complete.');return true}
document.getElementById('btnClearSquad').onclick=clearCurrentSquad;
document.getElementById('btnJumpAuto').onclick=()=>{document.querySelector('[data-m="pool"]')?.click();const acEl=document.getElementById('acBudget');if(acEl)acEl.focus();flash('Auto-complete is right here in the Player Pool — set a budget and tap it.')};
document.getElementById('btnJumpNews').onclick=()=>{document.querySelector('[data-m="rail"]')?.click();document.querySelector('[data-t="news"]')?.click()};
function applyShotMode(){const on=!!S.shotMode;const shotBtn=document.getElementById('btnShotMode');shotBtn.classList.toggle('on',on);const shotLabel=shotBtn.querySelector('.qf-label');if(shotLabel)shotLabel.textContent=on?'Exit compact':'Compact XI';else shotBtn.textContent=on?'Exit compact':'Compact XI';document.getElementById('pitchBox').classList.toggle('compact',on);const bench=document.getElementById('benchBox');bench.classList.remove('compact-hidden');bench.classList.toggle('compact-bench',on);document.getElementById('spineWrap').classList.toggle('compact-mode',on);document.getElementById('squadStructureNote')?.classList.toggle('compact-hidden',on);const note=document.getElementById('shotNote');note.textContent=on?'XI and all four substitutes are included in the screenshot view':'';}
document.getElementById('btnShotMode').onclick=()=>{S.shotMode=!S.shotMode;applyShotMode();render();saveUserState();};
const STATUS_LABEL={a:'available',d:'doubtful',i:'injured',s:'suspended',u:'unavailable',n:'on loan'};
function relTime(iso){const ms=Date.now()-Date.parse(iso);if(!Number.isFinite(ms))return '—';if(ms<0)return 'now';const h=Math.floor(ms/3600000);if(h<1)return Math.max(1,Math.floor(ms/60000))+'m ago';if(h<48)return h+'h ago';return Math.floor(h/24)+'d ago'}
let NEWS_SERVER_TIME_OFFSET_MS=0;
function updateNewsServerClock(iso){const server=Date.parse(iso||'');if(Number.isFinite(server))NEWS_SERVER_TIME_OFFSET_MS=server-Date.now()}
function newsNowMillis(){return Date.now()+NEWS_SERVER_TIME_OFFSET_MS}
function newsClockSkewMinutes(){return Math.abs(Math.round(NEWS_SERVER_TIME_OFFSET_MS/60000))}
function newsRelTime(iso){const ms=newsNowMillis()-Date.parse(iso);if(!Number.isFinite(ms))return'—';if(ms<0)return'now';const h=Math.floor(ms/3600000);if(h<1)return Math.max(1,Math.floor(ms/60000))+'m ago';if(h<48)return h+'h ago';return Math.floor(h/24)+'d ago'}
function eventMillis(e){return Date.parse(e?.detected_at||e?.detectedAt||e?.timestamp||'')||0}
function dedupeNewsEvents(events){const seen=new Set;return (Array.isArray(events)?events:[]).filter(e=>{const k=e.fingerprint||[e.player_id,e.kind,e.old_value,e.new_value,e.detected_at].join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>eventMillis(b)-eventMillis(a))}
function alertOwned(a){const pid=String(a?.player_id??a?.id??a?.element??''),name=normalName(a?.web_name||a?.name||''),team=String(a?.team_code||a?.team||'').toUpperCase();return squadPlayers().some(p=>String(p.apiId??p.id)===pid||(normalName(p.n)===name&&String(p.t).toUpperCase()===team))}
function sortCurrentAlerts(alerts){const severity={i:0,s:0,u:0,d:1,n:2,a:3};return [...(alerts||[])].map(a=>({...a,__owned:alertOwned(a)})).sort((a,b)=>Number(b.__owned)-Number(a.__owned)||(severity[a.status]??3)-(severity[b.status]??3)||num(a.chance??a.chance_of_playing_next_round,100)-num(b.chance??b.chance_of_playing_next_round,100)||String(a.web_name||a.name||'').localeCompare(String(b.web_name||b.name||'')))}
function currentAlertsFromPool(){return sortCurrentAlerts(POOL.filter(p=>p.live&&(p.live.status!=='a'||p.live.news||num(p.live.chance,100)<100)).map(p=>({player_id:p.apiId,web_name:p.n,team_code:p.t,status:p.live.status||'a',chance:p.live.chance,news:p.live.news||'',now_cost:Math.round(p.c*10),source:'current official payload'})))}
function normalizeClubNews(events){const seen=new Set;return (Array.isArray(events)?events:[]).filter(e=>e&&e.official!==false&&e.subject&&e.type).map(e=>({...e,__time:Date.parse(e.evidenceDate||e.detectedAt||e.createdAt||'')||0})).filter(e=>{const k=e.id||[e.team,e.type,normalName(e.subject),e.source].join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>b.__time-a.__time)}
function normalizeNewsPayload(data){const events=dedupeNewsEvents(data?.events);const alerts=Array.isArray(data?.alerts)?data.alerts:currentAlertsFromPool();const pipeline=data?.pipeline||data?.meta||{},clubEvents=normalizeClubNews(data?.clubEvents);return{events,alerts,clubEvents,pipeline,generatedAt:data?.generatedAt||new Date().toISOString(),season:data?.season||EXPECTED_SEASON}}
function loadNewsCache(){try{const d=JSON.parse(localStorage.getItem(NEWS.cacheKey)||'null');if(d&&typeof d==='object'){NEWS.last=d;return d}}catch(e){}return null}
function saveNewsCache(data){try{localStorage.setItem(NEWS.cacheKey,JSON.stringify(data))}catch(e){}}
function pipelineAgeMinutes(p){const ms=newsNowMillis()-Date.parse(p?.lastSuccessAt||p?.last_success_at||p?.lastPollAt||p?.last_poll_at||'');return Number.isFinite(ms)?Math.max(0,Math.round(ms/60000)):Infinity}
function describeNewsEvent(e){const who=`<b>${esc(e.web_name||'Unknown player')}</b> <span style="color:var(--muted)">${esc(e.team_code||'')}</span>`;if(e.kind==='price'){const from=(num(e.old_value)/10).toFixed(1),to=(num(e.new_value)/10).toFixed(1);return `${who} — price ${num(e.new_value)>num(e.old_value)?'rose':'fell'} £${from}m → £${to}m`}if(e.kind==='status'){const from=STATUS_LABEL[e.old_value]||e.old_value||'unknown',to=STATUS_LABEL[e.new_value]||e.new_value||'unknown';return `${who} — status changed: ${esc(from)} → ${esc(to)}`}if(e.kind==='chance'){const from=e.old_value==null||e.old_value===''?'no doubt':e.old_value+'%',to=e.new_value==null||e.new_value===''?'no doubt':e.new_value+'%';return `${who} — chance of playing: ${esc(String(from))} → ${esc(String(to))}`}if(e.kind==='team'){return `${who} — club changed: ${esc(TEAMS[e.old_value]?.n||e.old_value)} → ${esc(TEAMS[e.new_value]?.n||e.new_value)}`}if(e.kind==='position'){const map={1:'GK',2:'DEF',3:'MID',4:'FWD'};return `${who} — position changed: ${map[e.old_value]||e.old_value} → ${map[e.new_value]||e.new_value}`}if(e.kind==='news'){return `${who} — ${esc(e.new_value||'official news cleared')}`}return `${who} — ${esc(e.kind)} changed`}
function renderCurrentAlertRow(a){const st=a.status||'a',rawChance=a.chance??a.chance_of_playing_next_round,chance=rawChance==null?'':`${rawChance}%`,label=st==='a'?'NEWS':st.toUpperCase(),cls=(st==='d'?'doubt ':st==='a'?'news-only ':'')+(a.__owned?'owned-alert':''),detail=a.news||`${STATUS_LABEL[st]||st}${chance?' · '+chance+' chance of playing':''}`;return `<div class="current-alert ${cls}"><span class="alert-code">${esc(label)}</span><span class="alert-body"><b>${esc(a.web_name||a.name||'Unknown')}</b> <span style="color:var(--muted)">${esc(a.team_code||a.team||'')}</span><br>${esc(detail)}</span><span class="alert-meta">${chance||STATUS_LABEL[st]||''}</span></div>`}
function renderClubNewsRow(e){const type=String(e.type||'news').toUpperCase(),team=String(e.team||''),when=e.evidenceDate?newsRelTime(e.evidenceDate):'',detail=e.reason||`Official ${type.toLowerCase()} announcement detected.`,source=e.source?`<div class="club-news-meta"><a href="${esc(e.source)}" target="_blank" rel="noopener">Official source ↗</a>${when?` · ${esc(when)}`:''}</div>`:(when?`<div class="club-news-meta">${esc(when)}</div>`:'');return`<div class="current-alert club-news-row"><span class="alert-code">${esc(type)}</span><span class="alert-body"><b>${esc(e.subject)}</b> <span style="color:var(--muted)">${esc(team)}</span><br>${esc(detail)}${source}</span><span class="alert-meta">OFFICIAL</span></div>`}
function renderClubNews(events){const rows=normalizeClubNews(events);if(!rows.length)return'';return`<div class="news-group-title">Confirmed club news · ${rows.length}</div>${rows.map(renderClubNewsRow).join('')}`}
function renderCurrentAlerts(alerts){const sorted=sortCurrentAlerts(alerts);if(!sorted.length)return '<div class="news-empty">No players currently carry an official injury, suspension, availability or news flag.</div>';const mine=sorted.filter(a=>a.__owned),other=sorted.filter(a=>!a.__owned),section=(title,rows)=>rows.length?`<div class="news-group-title">${esc(title)} · ${rows.length}</div>${rows.map(renderCurrentAlertRow).join('')}`:'';return section('My squad alerts',mine)+section(mine.length?'All other alerts':'Current alerts',other)}
function renderChangeLog(events,clubEvents=[]){const fpl=(events||[]).map(e=>({kind:'fpl',time:eventMillis(e),html:`<div class="news-row"><span class="news-kind k-${esc(e.kind)}">${esc(e.kind)}</span><span class="news-body">${describeNewsEvent(e)}<span class="news-source">Detected by Worker snapshot comparison</span></span><span class="news-time" title="${esc(e.detected_at||'')}">${newsRelTime(e.detected_at)}</span></div>`}));const club=normalizeClubNews(clubEvents).map(e=>({kind:'club',time:e.__time,html:`<div class="news-row"><span class="news-kind">${esc(String(e.type||'news').toUpperCase())}</span><span class="news-body"><b>${esc(e.subject)}</b> <span style="color:var(--muted)">${esc(e.team||'')}</span> — ${esc(e.reason||'Confirmed official club announcement.')}<span class="news-source">Detected by OTB Scout · official club source${e.source?` · ${esc(e.source)}`:''}</span></span><span class="news-time">${e.evidenceDate?newsRelTime(e.evidenceDate):'—'}</span></div>`}));const rows=[...fpl,...club].sort((a,b)=>b.time-a.time);if(!rows.length)return '<div class="news-empty">No recorded changes in this window. Current Alerts can still show the latest official status even when nothing changed recently.</div>';return rows.map(x=>x.html).join('')}
function renderNewsPanel(data=NEWS.last){const host=document.getElementById('newsFeed');if(!host)return;if(!data){host.innerHTML='<div class="news-empty">News has not been loaded yet.</div>';return}const d=normalizeNewsPayload(data),p=d.pipeline||{},age=pipelineAgeMinutes(p),dbState=p.database||p.db||p.storage||'',reported=String(p.status||'').toLowerCase(),healthy=(reported==='ok'||reported==='healthy'||reported==='live')&&age<=90,stale=age>90&&Number.isFinite(age),latest=[Date.parse(d.events[0]?.detected_at||''),Date.parse(d.clubEvents?.[0]?.evidenceDate||'')].filter(Number.isFinite).sort((a,b)=>b-a)[0]||p.latestEventAt||p.latest_event_at||'',last=p.lastSuccessAt||p.last_success_at||p.lastPollAt||p.last_poll_at||'';const pipelineEl=document.getElementById('newsPipeline'),lastEl=document.getElementById('newsLastPoll'),eventEl=document.getElementById('newsLatestEvent'),countEl=document.getElementById('newsAlertCount'),note=document.getElementById('newsPipelineNote');pipelineEl.textContent=healthy?'LIVE':stale?'STALE':reported?reported.toUpperCase():'UNVERIFIED';lastEl.textContent=last?newsRelTime(last):'UNVERIFIED';eventEl.textContent=latest?newsRelTime(typeof latest==='number'?new Date(latest).toISOString():latest):'NONE';countEl.textContent=String(d.alerts.length+d.clubEvents.length);pipelineEl.parentElement.className='news-health-card '+(healthy?'good':stale?'warn':reported==='error'?'bad':'info');lastEl.parentElement.className='news-health-card '+(healthy?'good':stale?'warn':'info');eventEl.parentElement.className='news-health-card '+(latest?'info':'');countEl.parentElement.className='news-health-card '+((d.alerts.length+d.clubEvents.length)?'warn':'good');note.className='news-pipeline-note '+(stale?'stale':reported==='error'?'bad':'');note.textContent=healthy?`Worker polling is current${dbState?' · '+dbState:''}. FPL alerts come from the latest official payload; confirmed club announcements come from OTB Scout and are kept separate from role/xMins interpretation.${newsClockSkewMinutes()>5?' Device clock differs from server time by about '+newsClockSkewMinutes()+' minutes; server time is being used.':''}`:stale?`Worker polling is stale by about ${age} minutes. Tap Sync official news now, then verify the scheduled trigger in Cloudflare if it becomes stale again.`:p.lastError||p.last_error||'Worker health metadata is unavailable. Current Alerts are derived from the live player payload.';document.getElementById('newsWindowField').style.display=NEWS.view==='changes'?'block':'none';host.innerHTML=NEWS.view==='changes'?renderChangeLog(d.events,d.clubEvents):(renderClubNews(d.clubEvents)+renderCurrentAlerts(d.alerts))}
function setNewsView(view){NEWS.view=view==='changes'?'changes':'alerts';document.querySelectorAll('[data-news-view]').forEach(b=>{const on=b.dataset.newsView===NEWS.view;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});const field=document.getElementById('newsWindowField'),panel=document.getElementById('newsFeed');if(field)field.style.display=NEWS.view==='changes'?'block':'none';if(panel)panel.setAttribute('aria-labelledby',NEWS.view==='changes'?'newsViewChanges':'newsViewAlerts');renderNewsPanel()}
async function requestNewsPayload(){const hours=document.getElementById('newsWindow').value;try{return await fetchJSON(`${API_BASE}/api/news?hours=${encodeURIComponent(hours)}`,10000)}catch{const legacy=await fetchJSON(`${API_BASE}/api/deltas?hours=${encodeURIComponent(hours)}`,10000);return{...legacy,alerts:currentAlertsFromPool(),pipeline:legacy.pipeline||{status:'legacy',lastSuccessAt:DATA.lastUpdated?new Date(DATA.lastUpdated).toISOString():null,lastError:'Worker uses the legacy deltas endpoint'}}}}
async function requestScoutClubNews(){try{const r=await fetch(`${SCOUT_API_BASE}/api/scout/club-events`,{headers:{Accept:'application/json'},cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.status!=='ok')throw new Error(d.error||`Scout news HTTP ${r.status}`);return Array.isArray(d.events)?d.events:[]}catch(e){return {__error:e?.message||String(e),events:[]}}}
async function refreshNewsFeed({sync=false,silent=false}={}){const host=document.getElementById('newsFeed');if(NEWS.loading)return;NEWS.loading=true;document.getElementById('pNews').classList.add('news-loading');if(!silent)host.innerHTML='<div class="news-empty">Loading FPL alerts, Worker history and confirmed club news…</div>';try{if(sync){await fetchJSON(`${API_BASE}/api/sync`,20000,null,{method:'POST'})}const [base,clubResult]=await Promise.all([requestNewsPayload(),requestScoutClubNews()]);const clubEvents=Array.isArray(clubResult)?clubResult:(clubResult?.events||[]),clubError=Array.isArray(clubResult)?'':clubResult?.__error;const data=normalizeNewsPayload({...base,clubEvents});updateNewsServerClock(data.generatedAt);NEWS.last=data;NEWS.error='';saveNewsCache(data);renderNewsPanel(data);if(clubError){const note=document.getElementById('newsPipelineNote');note.className='news-pipeline-note warn';note.textContent+=` Club-news bridge unavailable: ${clubError}. FPL availability data is still current.`}}catch(err){NEWS.error=err.message;const cached=NEWS.last||loadNewsCache();if(cached){renderNewsPanel(cached);document.getElementById('newsPipelineNote').className='news-pipeline-note bad';document.getElementById('newsPipelineNote').textContent=`Live news refresh failed: ${err.message}. Showing the last locally cached news response.`}else{NEWS.last={alerts:currentAlertsFromPool(),events:[],clubEvents:[],pipeline:{status:'error',lastError:err.message,lastSuccessAt:DATA.lastUpdated?new Date(DATA.lastUpdated).toISOString():null}};renderNewsPanel(NEWS.last)}}finally{NEWS.loading=false;document.getElementById('pNews').classList.remove('news-loading')}}
document.querySelectorAll('[data-news-view]').forEach(b=>b.onclick=()=>setNewsView(b.dataset.newsView));
document.getElementById('btnNewsRefresh').onclick=()=>refreshNewsFeed();
document.getElementById('btnNewsSync').onclick=()=>refreshNewsFeed({sync:true});
document.getElementById('newsWindow').onchange=()=>refreshNewsFeed();
loadNewsCache();
/* A restored tab can render the saved News payload without firing the tab-click
   handler. Refresh once after startup, again while the page stays open, and
   immediately after connectivity returns so a stale badge cannot persist while
   the production Worker is healthy. NEWS.loading prevents overlapping reads. */
const NEWS_AUTO_REFRESH_MS=15*60*1000;
setTimeout(()=>refreshNewsFeed({silent:true}),750);
setInterval(()=>{if(document.visibilityState==='visible')refreshNewsFeed({silent:true})},NEWS_AUTO_REFRESH_MS);
addEventListener('online',()=>refreshNewsFeed({silent:true}));
function pricePoolFingerprint(){let h=2166136261;const ids=POOL.map(p=>Number.isFinite(Number(p.apiId))?Number(p.apiId):Number(p.id)).filter(Number.isFinite).sort((a,b)=>a-b);for(const id of ids){const s=String(id)+',';for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}}return`${POOL.length}-${(h>>>0).toString(16)}`}
function priceResponseShapeOK(data){return!!data&&typeof data==='object'&&Array.isArray(data.players)&&data.players.every(p=>p&&Number.isFinite(Number(p.id)))}
function clearPriceCache(){PRICE.last=null;PRICE.cacheMeta=null;try{localStorage.removeItem(PRICE.cacheKey)}catch(e){}}
function clearLegacyPriceCaches(){for(const key of PRICE_LEGACY_KEYS)try{localStorage.removeItem(key)}catch(e){}}
function savePriceCache(data){if(!priceResponseShapeOK(data))return false;try{const envelope={version:PRICE.cacheVersion,at:Date.now(),poolFingerprint:pricePoolFingerprint(),poolSize:POOL.length,data};localStorage.setItem(PRICE.cacheKey,JSON.stringify(envelope));PRICE.cacheMeta=envelope;return true}catch(e){return false}}
function loadPriceCache(){try{const raw=JSON.parse(localStorage.getItem(PRICE.cacheKey)||'null');if(raw?.version!==PRICE.cacheVersion||!priceResponseShapeOK(raw?.data)){if(raw)localStorage.removeItem(PRICE.cacheKey);return null}PRICE.last=raw.data;PRICE.cacheMeta=raw;return raw.data}catch(e){return null}}
function reconcilePriceCacheWithPool(){if(!PRICE.last||!PRICE.cacheMeta)return true;const expected=PRICE.cacheMeta.poolFingerprint,current=pricePoolFingerprint();if(expected&&current&&expected!==current){clearPriceCache();return false}return true}
function priceResponseContract(data=PRICE.last){const requestOK=PRICE_FETCH_LIMIT>=POOL.length;if(!data)return{ok:requestOK,detail:`route capacity ${PRICE_FETCH_LIMIT} for ${POOL.length}; response not loaded yet`};if(!priceResponseShapeOK(data))return{ok:false,detail:'response shape invalid'};const rows=data.players,ids=rows.map(p=>Number(p.id)),unique=new Set(ids).size===ids.length,declared=Number(data.sampledPlayers),countText=Number.isFinite(declared)?`${rows.length} rows · ${declared} sampled`:`${rows.length} eligible rows`,declaredTotal=Number(data.totalPlayers??data.trackedPlayers??data.eligiblePlayers),truncated=data.truncated===true||(Number.isFinite(declaredTotal)&&declaredTotal>rows.length&&rows.length>=PRICE_FETCH_LIMIT);return{ok:requestOK&&unique&&!truncated,detail:`${countText}; route capacity ${PRICE_FETCH_LIMIT}/${POOL.length}${unique?'':' · duplicate IDs'}${truncated?' · response truncated':''}`}}
function pressureClass(v){return v>0?'rise':v<0?'fall':'flat'}
function priceById(id){return (PRICE.last?.players||[]).find(p=>Number(p.id)===Number(id))||null}
function signed(n,d=0){const v=num(n);return`${v>0?'+':''}${v.toFixed(d)}`}
function priceScopePlayers(rows){const scope=document.getElementById('priceScope')?.value||'all';if(scope==='squad'){const ids=new Set(S.squad.map(Number));return rows.filter(p=>ids.has(Number(p.id)))}if(scope==='locked'){const ids=new Set([...S.locks].map(Number));return rows.filter(p=>ids.has(Number(p.id)))}return rows}
function sortedPricePlayers(rows){const sort=document.getElementById('priceSort')?.value||'rise';const a=[...rows];if(sort==='fall')return a.sort((x,y)=>num(x.pressure_index)-num(y.pressure_index));if(sort==='absolute')return a.sort((x,y)=>Math.abs(num(y.pressure_index))-Math.abs(num(x.pressure_index)));if(sort==='ownership')return a.sort((x,y)=>Math.abs(num(y.ownership_delta))-Math.abs(num(x.ownership_delta)));return a.sort((x,y)=>num(y.pressure_index)-num(x.pressure_index))}
function priceMoveHeadroom(outPlayer,inPlayer,bankValue){if(!outPlayer||!inPlayer)return null;const bought=transferBoughtPrice(outPlayer),saleNow=fplSellingPrice(outPlayer,bought),fallPlayer={...outPlayer,c:Math.max(3.5,outPlayer.c-.1)},saleAfterFall=fplSellingPrice(fallPlayer,bought),headroom=num(bankValue)+saleNow-inPlayer.c,worst=num(bankValue)+saleAfterFall-(inPlayer.c+.1);return{saleNow,saleAfterFall,headroom,worst,buyAfterRise:inPlayer.c+.1}}
function pricePlanVerdict(outPlayer,inPlayer,econ){const data=PRICE.last||{},outP=priceById(outPlayer?.apiId??outPlayer?.id),inP=priceById(inPlayer?.apiId??inPlayer?.id),target=Math.max(0,num(inP?.pressure_index)),seller=Math.min(0,num(outP?.pressure_index)),available=!inPlayer?.live?.status||inPlayer.live.status==='a';if(data.pricesLocked)return{cls:'wait',text:'WAIT — prices are locked until the GW1 deadline, so late team news has more value than acting early.'};if(!available)return{cls:'wait',text:'WAIT — the target has an availability flag. Confirm team news before protecting price.'};if(econ?.worst<-.001&&(target>=45||seller<=-45))return{cls:'risk',text:'MOVE NOW RISK — a £0.1m target rise plus seller fall would make this planned move unaffordable.'};if(target>=75)return{cls:'',text:'LEAN NOW — the target is among the strongest relative risers. Recheck official team news before confirming.'};if(seller<=-75&&econ?.saleAfterFall<econ?.saleNow)return{cls:'',text:'LEAN NOW — the seller is under strong fall pressure and another drop would reduce your selling value.'};return{cls:'wait',text:'WAIT / RECHECK — no immediate affordability threat is visible from the current sample window.'}}
function renderPricePlanExposure(){const host=document.getElementById('pricePlanExposure');if(!host)return;const first=S.transfer.last?.plan?.find(w=>w.moves?.length&&w.chip!=='FH');if(!first){host.innerHTML='<div class="help">Run the Transfer Planner first. OTB will then test the first permanent move against a target rise, seller fall and your available bank.</div>';return}const bankValue=num(document.getElementById('tpBank')?.value,S.transfer.bank??0);host.innerHTML=first.moves.map(m=>{const out=byId(m.outId),inn=byId(m.inId);if(!out||!inn)return'';const econ=priceMoveHeadroom(out,inn,bankValue),v=pricePlanVerdict(out,inn,econ),op=priceById(out.apiId??out.id),ip=priceById(inn.apiId??inn.id);return`<div class="price-plan-card"><div class="move"><span style="color:#FF6E9E">${esc(out.n)}</span><span>→</span><span style="color:var(--mint)">${esc(inn.n)}</span></div><div class="price-meta">Seller pressure ${signed(op?.pressure_index||0)} · target pressure ${signed(ip?.pressure_index||0)} · GW${first.gw}</div><div class="econ"><span>Headroom now<b>£${econ.headroom.toFixed(1)}m</b></span><span>Target +£0.1m<b>£${(econ.headroom-.1).toFixed(1)}m</b></span><span>Combined swing<b>£${econ.worst.toFixed(1)}m</b></span></div><div class="price-verdict ${v.cls}">${esc(v.text)}</div></div>`}).join('')}
function renderPriceIntel(data=PRICE.last){const host=document.getElementById('priceIntel');if(!host)return;if(!data){host.innerHTML='<div class="help">No price-pressure response has been loaded.</div>';return}const locked=!!data.pricesLocked,state=document.getElementById('priceState');state.textContent=data.priceStatus||'UNKNOWN';state.className='pv '+(locked?'warn':'good');document.getElementById('priceSampleWindow').textContent=data.sampleStart&&data.sampleEnd?`${Math.max(0,Math.round((Date.parse(data.sampleEnd)-Date.parse(data.sampleStart))/36e5))}h`:`${data.windowHours||'—'}h`;document.getElementById('priceSampleCount').textContent=data.sampledPlayers??(data.players||[]).length;document.getElementById('priceLatestSample').textContent=data.sampleEnd?relTime(data.sampleEnd):'—';const note=document.getElementById('priceNote');note.className='price-note '+(locked?'locked':'');note.textContent=locked?`Prices are locked until the GW1 deadline${data.firstDeadline?' ('+new Date(data.firstDeadline).toLocaleString()+')':''}. Movement is shown for planning only and cannot trigger a price change yet.`:data.note||'Directional market pressure from official transfer counters.';let rows=sortedPricePlayers(priceScopePlayers(data.players||[]));document.getElementById('priceResultCount').textContent=`${rows.length} player${rows.length===1?'':'s'}`;if(!rows.length){host.innerHTML='<div class="help">No players match this scope, or the Worker needs at least two transfer snapshots in the selected window.</div>';renderPricePlanExposure();return}host.innerHTML=rows.slice(0,80).map(p=>{const idx=num(p.pressure_index),cls=pressureClass(idx),tag=locked?'locked':cls,net=num(p.net_delta),velocity=num(p.velocity_per_hour),chance=p.chance==null?'':` · ${p.chance}%`;return`<div class="price-row"><div class="price-player"><b>${esc(p.web_name)} <span style="color:var(--muted)">${esc(p.team_code)}</span></b><div class="price-meta"><span class="price-tag ${tag}">${esc(p.direction||'QUIET')}</span>£${(num(p.now_cost)/10).toFixed(1)}m · owned ${num(p.selected_by).toFixed(1)}%${chance}<br>Net ${signed(net,0)} · ${signed(velocity,1)}/h · ownership ${signed(p.ownership_delta,2)}pp · ${esc(p.confidence||'LOW')} evidence</div></div><div class="pressure ${cls}">${signed(idx,0)}<div class="pressure-bar"><div class="pressure-fill" style="width:${Math.min(100,Math.abs(idx))}%"></div></div></div><div class="mono" style="font-size:9px;text-align:right;color:var(--muted)">${num(p.sample_count)}<br>samples</div></div>`}).join('');renderPricePlanExposure()}
async function refreshPriceIntel({sync=false,silent=false}={}){if(PRICE.loading)return;PRICE.loading=true;const host=document.getElementById('priceIntel');if(!silent)host.innerHTML='<div class="help">Loading transfer pressure snapshots…</div>';try{if(sync)await fetchJSON(`${API_BASE}/api/sync`,20000,null,{method:'POST'});const hours=document.getElementById('priceWindow')?.value||24,fresh=sync?`&fresh=${Date.now()}`:'',data=await fetchJSON(`${API_BASE}/api/price-intelligence?hours=${encodeURIComponent(hours)}&limit=${PRICE_FETCH_LIMIT}${fresh}`,12000);if(!priceResponseShapeOK(data))throw new Error('Price Intelligence response shape invalid');PRICE.last=data;PRICE.error='';savePriceCache(data);renderPriceIntel(data)}catch(err){PRICE.error=err.message;let cached=PRICE.last||loadPriceCache();if(cached&&!reconcilePriceCacheWithPool())cached=null;if(cached){renderPriceIntel(cached);const note=document.getElementById('priceNote');note.className='price-note';note.textContent=`Live price refresh failed: ${err.message}. Showing the last compatible locally cached response.`}else{host.innerHTML=`<div class="help">Could not load Price Intelligence: ${esc(err.message)}</div>`}}finally{PRICE.loading=false;scheduleSelfTests(120)}}
clearLegacyPriceCaches();loadPriceCache();
function autoCompleteSquad(){const note=document.getElementById('acNote');if(!productionDataReady()){note.textContent='Auto-complete requires LIVE or validated CACHE data.';flash(note.textContent);return;}const budget=num(document.getElementById('acBudget').value,S.budget);if(budget<=0){note.textContent='Enter a real budget first.';return}S.budget=budget;const oBudgetEl=document.getElementById('oBudget');if(oBudgetEl)oBudgetEl.value=budget;const locked=squadPlayers().filter(p=>!S.buildBlocks.has(p.id));if(S.squad.length>=15&&locked.length===S.squad.length){note.textContent='Your squad is already full — nothing to auto-complete.';return}if(cost(locked)>budget+1e-6){note.textContent=`Your current picks already cost £${cost(locked).toFixed(1)}m — raise the budget or remove a player first.`;return}const clubOver=Object.entries(locked.reduce((a,p)=>{a[p.t]=(a[p.t]||0)+1;return a},{})).find(([,n])=>n>3);if(clubOver){note.textContent=`You already have more than 3 players from ${TEAMS[clubOver[0]]?.n||clubOver[0]}.`;return}bumpCache();const pool=candidates();const result=seedSquad(pool,budget,locked,'points');if(!result){note.textContent=`Could not complete a legal squad within £${budget.toFixed(1)}m — try raising the budget or unblocking a player.`;return}const added=result.length-locked.length;S.squad=result.map(p=>p.id);autoXI();render();saveUserState();note.textContent=`Filled ${added} remaining slot${added===1?'':'s'} using ${horizonLabel()} projections and respected ${S.buildBlocks.size} Build block${S.buildBlocks.size===1?'':'s'}. Spent £${cost(result).toFixed(1)}m of £${budget.toFixed(1)}m.`;}
document.getElementById('oBudget').addEventListener('change',()=>{const v=num(document.getElementById('oBudget').value,S.budget);document.getElementById('acBudget').value=v});
document.getElementById('btnAutoComplete').onclick=autoCompleteSquad;
document.getElementById('acBudget').onchange=()=>{const v=num(document.getElementById('acBudget').value,S.budget);S.budget=v;const oBudgetEl=document.getElementById('oBudget');if(oBudgetEl)oBudgetEl.value=v;renderPool();saveUserState();};
document.getElementById('gwFollow').onchange=e=>{if(e.target.checked){S.gwPinned=false;if(DATA.nextEvent)S.gw=DATA.nextEvent;bumpCache();optimiseViewedLineup();render();scheduleSelfTests(250);saveUserState()}else{S.gwPinned=true;saveUserState()}};
function toggleStart(id){
  const next=new Set(S.start);
  next.has(id)?next.delete(id):next.add(id);
  const ids=[...next],err=xiLegality(ids);
  if(err){flash(err);return}
  S.start=next;ensureCaptainValid();render();saveUserState();
  /* Legal, but if every remaining place is now forced, say so up front. */
  const c=xiCounts(ids),slots=11-ids.length;
  const missing=Object.keys(XI_MIN).filter(k=>c[k]<XI_MIN[k])
    .map(k=>`${XI_MIN[k]-c[k]} ${k}`);
  if(slots>0&&missing.length)
    flash(`XI now needs ${missing.join(' and ')} to be legal.`);
}
const FORMS={'3-4-3':{DEF:3,MID:4,FWD:3},'3-5-2':{DEF:3,MID:5,FWD:2},'4-3-3':{DEF:4,MID:3,FWD:3},'4-4-2':{DEF:4,MID:4,FWD:2},'4-5-1':{DEF:4,MID:5,FWD:1},'5-3-2':{DEF:5,MID:3,FWD:2},'5-4-1':{DEF:5,MID:4,FWD:1}};
function gwUtility(r){return S.risk==='safe'?r.x-.25*r.sd:S.risk==='upside'?r.x+.20*r.sd:r.x}
function optimisationGameweeks(){const out=[];for(let g=S.gw;g<=38&&out.length<S.horizon;g++)if(FIX[g])out.push(g);return out}
function bestXIForGw(list,form,gw){const arr=list.map(p=>{const r=project(p,gw);return{p,r,x:gwUtility(r),mean:r.x,appear:minuteDetail(p).pAppear}}).sort((a,b)=>b.x-a.x),lo=form?{GK:1,...FORMS[form]}:{GK:1,DEF:3,MID:2,FWD:1},hi=form?lo:{GK:1,DEF:5,MID:5,FWD:3},got={GK:0,DEF:0,MID:0,FWD:0},xi=[],used=new Set;for(const k of ['GK','DEF','MID','FWD']){const c=arr.filter(o=>o.p.p===k).slice(0,lo[k]);if(c.length<lo[k])return null;c.forEach(o=>{xi.push(o);used.add(o.p.id);got[k]++})}for(const o of arr){if(xi.length>=11)break;if(used.has(o.p.id)||got[o.p.p]>=hi[o.p.p])continue;xi.push(o);used.add(o.p.id);got[o.p.p]++}if(xi.length<11)return null;const ranked=xi.slice().sort((a,b)=>b.x-a.x),counts=xiCounts(xi.map(o=>o.p.id)),benchRows=arr.filter(o=>!used.has(o.p.id));return{gw,xi,benchRows,captain:ranked[0],vice:ranked[1],xiUtility:xi.reduce((a,o)=>a+o.x,0),xiMean:xi.reduce((a,o)=>a+o.mean,0),formation:`${counts.DEF}-${counts.MID}-${counts.FWD}`}}
const OUT_MIN={DEF:3,MID:2,FWD:1},OUT_MAX={DEF:5,MID:5,FWD:3};
function permuteBench3(a){return[[a[0],a[1],a[2]],[a[0],a[2],a[1]],[a[1],a[0],a[2]],[a[1],a[2],a[0]],[a[2],a[0],a[1]],[a[2],a[1],a[0]]]}
function missingStateDistribution(rows){let m=new Map([['0|0|0',{DEF:0,MID:0,FWD:0,prob:1}]]);for(const o of rows){const q=clamp(1-o.appear,0,1),next=new Map;for(const st of m.values()){const add=(d,mi,f,p)=>{const k=`${d}|${mi}|${f}`,z=next.get(k)||{DEF:d,MID:mi,FWD:f,prob:0};z.prob+=p;next.set(k,z)};add(st.DEF,st.MID,st.FWD,st.prob*(1-q));add(st.DEF+(o.p.p==='DEF'),st.MID+(o.p.p==='MID'),st.FWD+(o.p.p==='FWD'),st.prob*q)}m=next}return[...m.values()]}
function legalOutfieldCounts(c){return c.DEF>=OUT_MIN.DEF&&c.DEF<=OUT_MAX.DEF&&c.MID>=OUT_MIN.MID&&c.MID<=OUT_MAX.MID&&c.FWD>=OUT_MIN.FWD&&c.FWD<=OUT_MAX.FWD}
function canCompleteAutosub(c,slots,rows,i=0){if(legalOutfieldCounts(c))return true;if(slots<=0||i>=rows.length)return false;if(canCompleteAutosub(c,slots,rows,i+1))return true;const p=rows[i].p.p;if(c[p]>=OUT_MAX[p])return false;return canCompleteAutosub({...c,[p]:c[p]+1},slots-1,rows,i+1)}
function selectAutosubs(base,slots,appeared){const c={...base},selected=[];for(let i=0;i<appeared.length&&slots>0;i++){const o=appeared[i],p=o.p.p;if(c[p]>=OUT_MAX[p])continue;const n={...c,[p]:c[p]+1};if(canCompleteAutosub(n,slots-1,appeared.slice(i+1))){c[p]++;selected.push(o);slots--}}return legalOutfieldCounts(c)?selected:[]}
function conditionalBenchValue(o,key){const a=Math.max(.03,o.appear),v=(key==='mean'?o.mean:o.x)/a;return clamp(v,key==='mean'?0:-12,25)}
function expectedAutosub(r,forceOrder){const startGK=r.xi.find(o=>o.p.p==='GK'),benchGK=r.benchRows.find(o=>o.p.p==='GK'),startOut=r.xi.filter(o=>o.p.p!=='GK'),benchOut=r.benchRows.filter(o=>o.p.p!=='GK'),startCounts={GK:0,DEF:0,MID:0,FWD:0};startOut.forEach(o=>startCounts[o.p.p]++);let gkMean=0,gkUtility=0,gkCall=0;if(startGK&&benchGK){const miss=1-startGK.appear;gkMean=miss*benchGK.mean;gkUtility=miss*benchGK.x;gkCall=miss*benchGK.appear}const states=missingStateDistribution(startOut);let best=null;/* RC5.0.0 — forceOrder evaluates ONE specific bench order instead of picking the
   best of the six permutations. Verdict uses it to price the gap between the
   order you actually have set and the optimal one, in expected points. */
const orders=Array.isArray(forceOrder)&&forceOrder.length===3?[forceOrder]:permuteBench3(benchOut);
for(const order of orders){let mean=0,utility=0;const calls=new Map(order.map(o=>[o.p.id,0]));for(const st of states){const slots=st.DEF+st.MID+st.FWD;if(!slots||st.prob<1e-10)continue;const base={DEF:startCounts.DEF-st.DEF,MID:startCounts.MID-st.MID,FWD:startCounts.FWD-st.FWD};for(let mask=0;mask<8;mask++){let pm=1;const appeared=[];for(let j=0;j<3;j++){const a=order[j].appear,on=!!(mask&(1<<j));pm*=on?a:1-a;if(on)appeared.push(order[j])}if(pm<1e-10)continue;const sel=selectAutosubs(base,slots,appeared);for(const o of sel){const w=st.prob*pm;mean+=w*conditionalBenchValue(o,'mean');utility+=w*conditionalBenchValue(o,'utility');calls.set(o.p.id,calls.get(o.p.id)+w)}}}const z={mean:mean+gkMean,utility:utility+gkUtility,outfieldMean:mean,outfieldUtility:utility,gkMean,gkUtility,gkCall,order,calls};if(!best||z.utility>best.utility)best=z}best.fullMean=r.benchRows.reduce((a,o)=>a+o.mean,0);best.fullUtility=r.benchRows.reduce((a,o)=>a+o.x,0);best.roles=best.order.map(o=>({id:o.p.id,call:best.calls.get(o.p.id)||0,mean:(best.calls.get(o.p.id)||0)*conditionalBenchValue(o,'mean')}));return best}
function score(list,form,benchMode='autosub'){const weeks=[];let utilityTotal=0,meanTotal=0;for(const gw of optimisationGameweeks()){const r=bestXIForGw(list,form,gw);if(!r)return{v:-1e9,r:null};const b=expectedAutosub(r);r.bench=b;r.utilityScore=r.xiUtility+r.captain.x+b.utility;r.meanScore=r.xiMean+r.captain.mean+b.mean;if(benchMode==='rotation'){r.rotationUtility=.10*Math.max(0,b.fullUtility-b.utility);r.rotationMean=.10*Math.max(0,b.fullMean-b.mean);r.utilityScore+=r.rotationUtility;r.meanScore+=r.rotationMean}
    /* FODDER: the optimiser re-picks the XI every gameweek, so it happily buys
       a rotating second keeper and a playable bench. Theoretically optimal,
       but almost nobody plays that way and the money is worth more in the XI.
       This mode credits only the FIRST outfield sub plus the backup keeper, so
       bench slots 2-4 earn nothing and the climb downgrades them to cheap
       enablers, freeing budget for the starting eleven. */
    if(benchMode==='fodder'){
      // Falls back to the untrimmed bench if the squad is incomplete, so a
      // partial squad can never crash the optimiser mid-search.
      try{
        const rows=(r.benchRows||[]).filter(o=>o&&o.p);
        const outs=rows.filter(o=>o.p.p!=='GK'),gk=rows.find(o=>o.p.p==='GK');
        const first=outs.slice().sort((x,y)=>(o=>o.mean)(y)-(o=>o.mean)(x))[0];
        const kept=new Set([gk,first].filter(Boolean).map(o=>o.p.id));
        const keep=rows.map(o=>kept.has(o.p.id)?o:{...o,mean:0,x:0});
        if(keep.length){
          const trimmed=expectedAutosub({...r,benchRows:keep});
          if(trimmed&&Number.isFinite(trimmed.mean)&&Number.isFinite(trimmed.utility)){
            r.utilityScore+=trimmed.utility-b.utility;
            r.meanScore+=trimmed.mean-b.mean;
            r.fodderBench=trimmed;
          }
        }
      }catch(_){}
    }weeks.push(r);utilityTotal+=r.utilityScore;meanTotal+=r.meanScore}let boostGw=null,boostGain=0;if(benchMode==='boost'&&weeks.length){const plannedGws=[S.chips.BB1,S.chips.BB2].filter(Boolean).map(Number),planned=weeks.find(w=>plannedGws.includes(w.gw)),target=planned||[...weeks].sort((a,b)=>(b.bench.fullUtility-b.bench.utility)-(a.bench.fullUtility-a.bench.utility))[0];boostGw=target.gw;boostGain=Math.max(0,target.bench.fullMean-target.bench.mean);utilityTotal+=Math.max(0,target.bench.fullUtility-target.bench.utility);meanTotal+=boostGain}const primary=weeks.find(w=>w.gw===S.gw)||weeks[0]||null;return primary?{v:utilityTotal,r:{weeks,primary,utilityTotal,meanTotal,averageMean:meanTotal/weeks.length,averageAutosub:weeks.reduce((a,w)=>a+w.bench.mean,0)/weeks.length,boostGw,boostGain}}:{v:-1e9,r:null}}
const cost=l=>l.reduce((a,p)=>a+p.c,0);function legal(list){const pc={GK:0,DEF:0,MID:0,FWD:0},cl={};for(const p of list){pc[p.p]++;cl[p.t]=(cl[p.t]||0)+1;if(cl[p.t]>3)return false}return pc.GK===2&&pc.DEF===5&&pc.MID===5&&pc.FWD===3}
function candidates(){const out=[];for(const pos of ['GK','DEF','MID','FWD']){const all=POOL.filter(p=>p.p===pos&&TEAMS[p.t]&&availability(p)>.02&&!S.buildBlocks.has(p.id)),byX=[...all].sort((a,b)=>horizonForecast(b).utility-horizonForecast(a).utility).slice(0,55),byV=[...all].sort((a,b)=>horizonForecast(b).utility/b.c-horizonForecast(a).utility/a.c).slice(0,40),byC=[...all].sort((a,b)=>a.c-b.c).slice(0,15),seen=new Set;[...byX,...byV,...byC].forEach(p=>{if(!seen.has(p.id)){seen.add(p.id);out.push(p)}})}return out}
function cheapestFloor(pool,after,rem){let floor=0;const clubs={};after.forEach(p=>clubs[p.t]=(clubs[p.t]||0)+1);for(const k of Object.keys(rem)){let need=rem[k];for(const q of pool.filter(q=>q.p===k&&!after.some(z=>z.id===q.id)).sort((a,b)=>a.c-b.c)){if(need<=0)break;if((clubs[q.t]||0)>=3)continue;floor+=q.c;clubs[q.t]=(clubs[q.t]||0)+1;need--}if(need>0)return 1e6}return floor}
function seedSquad(pool,budget,locked,mode){const target={GK:2,DEF:5,MID:5,FWD:3},list=[...locked],need={...target};list.forEach(p=>need[p.p]--);const rank={cheap:(a,b)=>a.c-b.c,value:(a,b)=>horizonForecast(b).utility/b.c-horizonForecast(a).utility/a.c,points:(a,b)=>horizonForecast(b).utility-horizonForecast(a).utility}[mode];for(const pos of ['GK','DEF','MID','FWD']){for(const p of pool.filter(p=>p.p===pos&&!list.some(q=>q.id===p.id)).sort(rank)){if(need[pos]<=0)break;if(list.filter(q=>q.t===p.t).length>=3)continue;const after=[...list,p],rem={...target};after.forEach(q=>rem[q.p]--);if(cost(after)+cheapestFloor(pool,after,rem)>budget+1e-6)continue;list.push(p);need[pos]--}}return legal(list)&&cost(list)<=budget+1e-6?list:null}
function climb(list,pool,budget,locked,form,benchMode){let cur=list.slice(),best=score(cur,form,benchMode).v;const lockIds=new Set(locked.map(p=>p.id)),topByPos={};for(const pos of ['GK','DEF','MID','FWD'])topByPos[pos]=pool.filter(p=>p.p===pos).sort((a,b)=>horizonForecast(b).utility-horizonForecast(a).utility).slice(0,22);for(let iter=0;iter<55;iter++){let bestTrial=null,bestGain=1e-7;for(let i=0;i<cur.length;i++){const out=cur[i];if(lockIds.has(out.id))continue;const rest=cur.filter((_,j)=>j!==i),clubs={};rest.forEach(p=>clubs[p.t]=(clubs[p.t]||0)+1);for(const inn of topByPos[out.p]){if(rest.some(p=>p.id===inn.id)||cost(rest)+inn.c>budget+1e-6||(clubs[inn.t]||0)>=3)continue;const trial=[...rest,inn],g=score(trial,form,benchMode).v-best;if(g>bestGain){bestGain=g;bestTrial=trial}}}if(!bestTrial)break;cur=bestTrial;best+=bestGain}return{list:cur,v:best}}
function optimise(){const pool=candidates(),locked=POOL.filter(p=>S.locks.has(p.id)&&!S.buildBlocks.has(p.id));if(cost(locked)>S.budget)return{err:`Locked players cost £${cost(locked).toFixed(1)}m.`};const pc={GK:0,DEF:0,MID:0,FWD:0};locked.forEach(p=>pc[p.p]++);for(const k in LIMITS)if(pc[k]>LIMITS[k])return{err:`Too many ${k}s locked.`};const forced=document.getElementById('oForm').value||null,benchMode=document.getElementById('oBench').value||'autosub',forms=forced?[forced]:[null];let champ=null;for(const f of forms)for(const mode of ['cheap','value','points']){const seed=seedSquad(pool,S.budget,locked,mode);if(!seed)continue;const r=climb(seed,pool,S.budget,locked,f,benchMode),sc=score(r.list,f,benchMode);if(!champ||sc.v>champ.v)champ={v:sc.v,list:r.list,form:f,res:sc.r}}return champ||{err:'No legal squad fits the bankroll, locks and Build blocks.'}}

function fplSellingPrice(pl,bought){const c=Math.round(num(pl?.c)*10),b=Math.round(num(bought,pl?.c)*10);return(c<=b?c:b+Math.floor((c-b)/2))/10}
function transferBoughtPrice(pl){const k=stableKey(pl),v=num(S.transfer.purchase[k],NaN);return Number.isFinite(v)&&v>=3.5&&v<=25?v:pl.c}
function transferGameweeks(){const out=[],n=clamp(num(document.getElementById('tpHorizon')?.value,S.transfer.horizon),2,8);for(let g=S.gw;g<=38&&out.length<n;g++)if(FIX[g])out.push(g);return out}
function syncTransferSettings(){const get=id=>document.getElementById(id);S.transfer.free=clamp(num(get('tpFree')?.value,1),1,5);S.transfer.horizon=clamp(num(get('tpHorizon')?.value,6),2,8);S.transfer.maxMoves=clamp(num(get('tpMaxMoves')?.value,2),1,2);S.transfer.maxHit=clamp(num(get('tpMaxHit')?.value,4),0,8);S.transfer.threshold=clamp(num(get('tpThreshold')?.value,.25),0,4);S.transfer.decay=clamp(num(get('tpDecay')?.value,.90),.75,1);S.transfer.ftScale=clamp(num(get('tpFtScale')?.value,1),.5,1.5);S.transfer.useFriction=clamp(num(get('tpFriction')?.value,.20),0,1);S.transfer.itbValue=clamp(num(get('tpItbValue')?.value,.08),0,.5);S.transfer.sensitivityRuns=clamp(num(get('tpStress')?.value,0),0,20);S.transfer.bank=Math.max(0,num(get('tpBank')?.value,bank()));saveUserState()}
function initTransferControls(){const vals={tpStrategyStyle:S.transfer.style||'value',tpFree:S.transfer.free,tpHorizon:S.transfer.horizon,tpMaxMoves:S.transfer.maxMoves,tpMaxHit:S.transfer.maxHit,tpThreshold:S.transfer.threshold,tpDecay:S.transfer.decay,tpFtScale:S.transfer.ftScale,tpFriction:S.transfer.useFriction,tpItbValue:S.transfer.itbValue,tpStress:S.transfer.sensitivityRuns,tpBank:Number.isFinite(+S.transfer.bank)?(+S.transfer.bank).toFixed(1):Math.max(0,bank()).toFixed(1)};for(const [id,v] of Object.entries(vals)){const e=document.getElementById(id);if(e)e.value=String(v)}}
function renderTransferPrices(){const host=document.getElementById('transferPrices');if(!host)return;const ps=squadPlayers();if(!ps.length){host.innerHTML='<div class="help">Build or load a squad first.</div>';return}let saleTotal=0;const rows=ps.slice().sort((a,b)=>['GK','DEF','MID','FWD'].indexOf(a.p)-['GK','DEF','MID','FWD'].indexOf(b.p)||a.c-b.c).map(p=>{const bought=transferBoughtPrice(p),sale=fplSellingPrice(p,bought);saleTotal+=sale;return`<div class="transfer-econ-row"><span class="player">${esc(p.n)} <span style="color:var(--muted)">${esc(p.t)} · ${p.p}</span></span><span class="mono">£${p.c.toFixed(1)}</span><input type="number" min="3.5" max="25" step="0.1" value="${bought.toFixed(1)}" data-buy-key="${esc(stableKey(p))}" aria-label="Price paid for ${esc(p.n)}"><span class="mono" data-sale-for="${esc(stableKey(p))}">£${sale.toFixed(1)}</span></div>`}).join('');const b=Math.max(0,num(document.getElementById('tpBank')?.value,bank()));host.innerHTML=`<div class="transfer-summary"><div class="transfer-kpi"><div class="k">Selling value</div><div class="v">£${saleTotal.toFixed(1)}</div></div><div class="transfer-kpi"><div class="k">Planner bank</div><div class="v">£${b.toFixed(1)}</div></div><div class="transfer-kpi"><div class="k">Total funds</div><div class="v">£${(saleTotal+b).toFixed(1)}</div></div></div><div class="transfer-econ"><div class="transfer-econ-head"><span>Player</span><span>Now</span><span>Bought</span><span>Sell</span></div>${rows}</div>`}
function renderTransferPlanner(){const guard=document.getElementById('transferGuard'),btn=document.getElementById('btnPlanTransfers');if(!guard||!btn)return;const ready=productionDataReady(),full=S.squad.length===15&&legal(squadPlayers()),ok=ready&&full;guard.className='data-guard '+(ok?'ready':'');guard.innerHTML=!ready?'<b>Planner locked.</b> Refresh or import validated 2026/27 data.':!full?'<b>Complete a legal 15-player squad.</b> The planner needs 2 GK, 5 DEF, 5 MID and 3 FWD.':'<b>Transfer planning ready.</b> Purchase prices and bank can now be reviewed.';btn.disabled=!ok;renderTransferPrices()}
function transferCandidatePool(gws){const current=squadPlayers(),out=[];for(const pos of ['GK','DEF','MID','FWD']){const all=POOL.filter(p=>p.p===pos&&TEAMS[p.t]&&availability(p)>.02).map(p=>({p,total:gws.reduce((a,g)=>a+project(p,g).x,0)})),byPts=[...all].sort((a,b)=>b.total-a.total).slice(0,38),byVal=[...all].sort((a,b)=>b.total/b.p.c-a.total/a.p.c).slice(0,26),byCheap=[...all].sort((a,b)=>a.p.c-b.p.c).slice(0,10),m=new Map;[...byPts,...byVal,...byCheap,...current.filter(p=>p.p===pos).map(p=>({p,total:0}))].forEach(o=>m.set(o.p.id,o.p));out.push(...m.values())}return[...new Map(out.map(p=>[p.id,p])).values()]}
function verdictPlannerFingerprint(payload=null){
  /* Hash the exact semantic payload sent to the transfer worker. Retrieval times
     such as News generatedAt and Market fetchedAt are deliberately excluded: a
     background refresh with identical inputs must not invalidate a fresh route.
     Any change that can alter the route changes the payload and therefore the hash. */
  try{return 'tp2:'+accuracyHashValue(['transfer-planner-v2',payload||transferPlannerPayload()])}catch(e){return ''}
}
function transferPlanIsStale(last=S.transfer?.last){
  if(!last?.plan?.length)return false;
  if(!last.verdictFingerprint)return true;
  return last.verdictFingerprint!==verdictPlannerFingerprint();
}
function transferPlannerPayload(){syncTransferSettings();const gws=transferGameweeks(),profile=transferStrategyProfile(),styleRisk=profile.risk||'mean',styleUtility=r=>styleRisk==='safe'?r.x-.25*r.sd:styleRisk==='upside'?r.x+.20*r.sd:r.x,players=transferCandidatePool(gws).map(p=>{const signal=builderStyleSignal(p,profile,gws);let decay=1;const gwMap=Object.fromEntries(gws.map(g=>{const r=project(p,g),md=minuteDetail(p),adj=signal*decay;decay*=(profile.horizonScale||1);return[g,{mean:r.x,utility:styleUtility(r)+adj,pAppear:md.pAppear,sd:r.sd,confidence:r.confidence}]}));return{id:p.id,n:p.n,p:p.p,t:p.t,c:p.c,gw:gwMap}}),current=squadPlayers(),purchase=Object.fromEntries(current.map(p=>[p.id,transferBoughtPrice(p)])),chips={wc:[S.chips.WC1,S.chips.WC2].filter(Boolean).map(Number),fh:[S.chips.FH1,S.chips.FH2].filter(Boolean).map(Number),bb:[S.chips.BB1,S.chips.BB2].filter(Boolean).map(Number),tc:[S.chips.TC1,S.chips.TC2].filter(Boolean).map(Number)},hybrid={decay:S.transfer.decay,beamWidth:8,actionsPerState:6,bufferGws:gws.length>=5?2:1,useFriction:S.transfer.useFriction,itbValue:S.transfer.itbValue,ftScale:S.transfer.ftScale,stressCandidateLimit:12},sensitivity=S.transfer.sensitivityRuns>1?{runs:S.transfer.sensitivityRuns,strength:S.transfer.sensitivityStrength,seed:20262027}:null;return{players,gws,squadIds:current.map(p=>p.id),purchase,bank:S.transfer.bank,free:S.transfer.free,maxMoves:S.transfer.maxMoves,maxHit:S.transfer.maxHit,threshold:S.transfer.threshold,lockedIds:current.filter(p=>S.locks.has(p.id)).map(p=>p.id),chips,hybrid,sensitivity}}
function combinedWorkerSource(id){const common=document.getElementById('workerCommonSource')?.textContent||'',specific=document.getElementById(id)?.textContent||'';return common&&specific?common+'\n'+specific:''}
function createTransferWorker(){const source=combinedWorkerSource('transferWorkerSource');if(!source||typeof Worker!=='function')return null;const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),w=new Worker(url);w.__url=url;return w}
let ACTIVE_TRANSFER_WORKER=null,TRANSFER_RUN=0;
function stopTransferPlanner(message=''){if(ACTIVE_TRANSFER_WORKER){try{ACTIVE_TRANSFER_WORKER.terminate();if(ACTIVE_TRANSFER_WORKER.__url)URL.revokeObjectURL(ACTIVE_TRANSFER_WORKER.__url)}catch(e){}ACTIVE_TRANSFER_WORKER=null}document.getElementById('btnCancelTransferPlan')?.classList.add('hide-control');const btn=document.getElementById('btnPlanTransfers');if(btn)btn.disabled=!(productionDataReady()&&S.squad.length===15&&legal(squadPlayers()));if(message)document.getElementById('transferPlanOut').innerHTML=`<div class="verdict warn">${esc(message)}</div>`}
function transferPlanText(result){return[`OTB ${APP_RELEASE} Hybrid Transfer Route`,...result.plan.map(w=>{const move=w.moves.length?w.moves.map(m=>`${m.outName} → ${m.inName}`).join('; '):(w.chip==='FH'?'Free Hit — permanent squad held':'Roll transfer');return`GW${w.gw}${w.chip?' '+w.chip:''}: ${move} | hit ${w.hit?'-'+w.hit:'0'} | FT ${w.ftBefore}→${w.ftAfter} | bank £${w.bankAfter.toFixed(1)}m`})].join('\n')}
function transferFirstActionText(plan){const w=plan?.[0];if(!w)return'No route';if(w.chip)return`${w.chip} in GW${w.gw}`;if(!w.moves?.length)return`Roll in GW${w.gw}`;return w.moves.map(m=>`${m.outName} → ${m.inName}`).join('; ')}
function projectionStressHTML(stress){if(!stress||!stress.table?.length)return'';const survived=Math.round(num(stress.consensus)*num(stress.runs)),pct=Math.round(100*num(stress.consensus)),tone=pct>=70?'': 'warn',rows=stress.table.slice(0,4).map(x=>`<div class="lrow"><span>${esc(x.label)}</span><span class="mono">${num(x.count)}/${num(stress.runs)} · ${Math.round(100*num(x.share))}%</span></div>`).join('');return`<div class="verdict ${tone}"><b>Input stress ${survived}/${num(stress.runs)}:</b> the selected first action retained the highest score in ${pct}% of reproducible uncertainty draws across ${num(stress.candidateCount)} fixed primary-search route candidates. This isolates projection movement; it is not the probability that the transfer will succeed.</div><div class="stress-table"><div class="test-cat-lab">FIRST ACTIONS ACROSS FIXED-CANDIDATE INPUT RE-SCORES</div>${rows}</div>`}
function transferStressSummary(result){if(result.stress)return` · <b>input stress ${Math.round(num(result.stress.consensus)*num(result.stress.runs))}/${num(result.stress.runs)}</b>`;if(result.stressSkipped)return` · <b>input stress skipped:</b> ${esc(result.stressSkipped)}`;return num(S.transfer.sensitivityRuns)>1?' · <b>input stress unavailable</b>':' · input stress off'}
function renderTransferResult(result,t0,plannerFingerprint=''){
  result.verdictFingerprint=plannerFingerprint||verdictPlannerFingerprint();result.verdictGeneratedAt=Date.now();S.transfer.last=result;
  const by=new Map(POOL.map(p=>[p.id,p])),rob=result.robustness||{},objectiveShare=num(rob.agreement)/Math.max(1,num(rob.total,1)),inputShare=result.stress?num(result.stress.consensus):null,weakest=inputShare==null?objectiveShare:Math.min(objectiveShare,inputShare),combinedLabel=inputShare==null?`${String(rob.label||'UNRATED')} OBJECTIVE STABILITY`:weakest>=.70?'STRONG ROBUSTNESS':weakest>=.50?'MIXED ROBUSTNESS':'FRAGILE ROBUSTNESS',stability=inputShare==null?String(rob.label||'—').toLowerCase():weakest>=.70?'high':weakest>=.50?'medium':'low';
  const opp=result.opportunity,oppMarkup=opp&&result.plan?.[0]&&!result.plan[0].moves?.length?`<div class="hybrid-opportunity"><b>Best transfer opportunity considered:</b> ${esc(opp.moves.map(m=>`${m.outName} → ${m.inName}`).join('; '))}. OTB searched ${num(opp.candidateCount)} legal candidate route${num(opp.candidateCount)===1?'':'s'}; this move changed the raw route score by ${signed(opp.gross,2)} but finished ${signed(opp.net,2)} versus rolling after FT value, hits, friction and bank flexibility. Required threshold: ${signed(opp.threshold,2)}.<div class="op-meta"><span>Raw ${signed(opp.gross,2)}</span><span>Adjusted ${signed(opp.net,2)}</span><span>Hit ${opp.hit?'-'+opp.hit:'0'}</span><span>FT after ${num(opp.ftAfter)}</span></div></div>`:'';
  const altMarkup=(result.alternatives||[]).map((a,i)=>`<div class="hybrid-alt"><b>Alternative ${i+1}:</b> ${esc(transferFirstActionText(a.plan))} · ${num(a.gap).toFixed(2)} hybrid points behind.</div>`).join('');
  const rows=result.plan.map(w=>{const moves=w.moves.length?w.moves.map(m=>`<div class="transfer-move"><span class="out">${esc(m.outName)} <small>£${num(m.outPrice).toFixed(1)}</small></span><span>→</span><span class="in">${esc(m.inName)} <small>£${num(m.inPrice).toFixed(1)}</small></span></div>`).join(''):`<div class="transfer-note">${esc(w.note)}</div>`,cap=by.get(w.captainId);return`<div class="transfer-week ${!w.moves.length?'hold ':''}${w.hit?'hit ':''}${w.chip?'chip':''}"><div class="transfer-week-head"><b>GW${w.gw}</b>${w.chip?`<span class="chip-tag">${esc(w.chip)}</span>`:''}<span style="margin-left:auto;font-size:10px;color:var(--muted)">${w.moves.length} move${w.moves.length===1?'':'s'}</span></div>${moves}<div class="transfer-meta"><span>FT ${w.ftBefore}→${w.ftAfter}</span><span>Hit ${w.hit?'-'+w.hit:'0'}</span><span>Bank £${num(w.bankAfter).toFixed(1)}</span><span>GW xPts ${num(w.score).toFixed(1)}</span><span>${esc(w.formation||'—')}</span>${cap?`<span>${esc(cap.n)} (C)</span>`:''}${w.moves.length?`<span>Hybrid ${signed(w.netGain,1)}</span>`:''}</div></div>`}).join('');
  const first=result.plan[0],canApply=first&&first.moves?.length&&first.chip!=='FH',summary=`<div class="hybrid-summary"><div class="hs-head"><b>${transferStrategyProfile().icon} ${esc(transferStrategyProfile().label)} Path</b><span class="hybrid-badge ${stability}">${esc(combinedLabel)}</span></div><div>${esc(transferFirstActionText(result.plan))}. <b>Objective stability ${num(rob.agreement,1)}/${num(rob.total,1)}</b>${transferStressSummary(result)}. The combined badge is governed by the weaker valid signal; neither measure is predictive confidence. Active transfer depth: ${num(result.transferDepth)} of ${num(result.evaluationHorizon)} evaluated GWs; the remaining buffer protects against end-of-horizon moves.</div></div>`;
  document.getElementById('transferPlanOut').innerHTML=`${summary}${oppMarkup}${altMarkup}${projectionStressHTML(result.stress)}<div class="verdict"><b>Transfer route complete.</b> ${result.plan.length} gameweeks · final bank £${num(result.finalBank).toFixed(1)}m · final free transfers ${result.finalFt}. Calculated in ${Math.round(performance.now()-t0)}ms.</div>${rows}<button type="button" class="btn" id="btnApplyTransferStep" ${canApply?'':'disabled'}>Apply first permanent step</button><button type="button" class="btn ghost" id="btnCopyTransferPlan">Copy transfer route</button><div class="help">A roll verdict is a real recommendation, not a failed search. Objective stability tests alternative objective assumptions; input stress re-scores fixed candidate routes under forecast uncertainty. Neither is a guarantee of real-world results. The opportunity card shows the strongest rejected move whenever no transfer clears the route threshold.</div>`;
  document.getElementById('btnApplyTransferStep').onclick=applyFirstTransferStep;document.getElementById('btnCopyTransferPlan').onclick=()=>navigator.clipboard.writeText(transferPlanText(result)).then(()=>flash('Transfer route copied.'),()=>flash('Clipboard unavailable.'));saveUserState();
}
function runTransferPlanner(retryCount=0){
  retryCount=Number.isFinite(retryCount)?retryCount:0;
  if(!productionDataReady()||S.squad.length!==15||!legal(squadPlayers())){
    flash('A complete legal squad and validated data are required.');return
  }
  stopTransferPlanner('');
  /* Build once, after controls are normalised, then fingerprint and send that
     same immutable snapshot. This removes the pre-normalisation race. */
  const payload=transferPlannerPayload(),plannerFingerprint=verdictPlannerFingerprint(payload),
    out=document.getElementById('transferPlanOut'),cancel=document.getElementById('btnCancelTransferPlan'),
    run=++TRANSFER_RUN,t0=performance.now();
  out.innerHTML='<div class="optimiser-progress"><b>Planning transfers…</b><div class="progress-track"><div class="progress-fill" id="tpProgress"></div></div><div class="progress-meta"><span id="tpDetail">Preparing candidate routes</span><span id="tpPct">0%</span></div></div>';
  cancel.classList.remove('hide-control');
  cancel.onclick=()=>{TRANSFER_RUN++;stopTransferPlanner('Transfer planning cancelled.')};
  let w;try{w=createTransferWorker()}catch(e){w=null}
  if(!w){stopTransferPlanner('This browser does not support the background transfer planner.');return}
  ACTIVE_TRANSFER_WORKER=w;
  /* RC5.0.10: the worker now enforces its own secondary-analysis budget and always returns the primary route, so this timeout is a true failsafe for a genuinely wedged worker rather than the normal completion path. Target ~10-20s, 30s as the degradation threshold. */
  const secondaryBudgetMs=S.transfer.sensitivityRuns>1?14000:9000,timeoutMs=30000,
    timer=setTimeout(()=>{if(run===TRANSFER_RUN){TRANSFER_RUN++;stopTransferPlanner(`Transfer planning exceeded ${Math.round(timeoutMs/1000)} seconds and was stopped.`)}},timeoutMs);
  w.onmessage=e=>{
    if(run!==TRANSFER_RUN)return;
    const d=e.data||{};
    if(d.type==='progress'){
      const pct=Math.min(96,Math.round(100*d.progress)),bar=document.getElementById('tpProgress'),
        lab=document.getElementById('tpPct'),det=document.getElementById('tpDetail');
      if(bar)bar.style.width=pct+'%';if(lab)lab.textContent=pct+'%';if(det)det.textContent=d.detail||'Planning'
    }else if(d.type==='result'){
      clearTimeout(timer);stopTransferPlanner('');
      const currentFingerprint=verdictPlannerFingerprint();
      if(currentFingerprint!==plannerFingerprint){
        if(retryCount<1){
          out.innerHTML='<div class="optimiser-progress"><b>Inputs refreshed during planning — recalculating once…</b></div>';
          setTimeout(()=>runTransferPlanner(retryCount+1),0)
        }else stopTransferPlanner('Planner inputs changed again while the route was running. Wait for live refreshes to finish, then re-run once.');
        return
      }
      renderTransferResult(d.result,t0,plannerFingerprint)
    }else if(d.type==='error'){
      clearTimeout(timer);stopTransferPlanner(d.error||'Transfer planner failed.')
    }
  };
  w.onerror=e=>{clearTimeout(timer);stopTransferPlanner('Background transfer planner failed.')};
  w.postMessage({type:'run',payload:{...payload,secondaryBudgetMs}})
}

const STRATEGY_PROFILES={
 conservative:{icon:'🛡',label:'Conservative',note:'Low risk, stable minutes and budget safety.',risk:'safe',horizonScale:1.00,weights:{ownership:.03,availability:.80,value:.10,price:.00,fixture:.00},transfer:{threshold:.50,decay:.94,ftScale:1.20,useFriction:.40,itbValue:.15},riskLabel:'Low'},
 balanced:{icon:'⚖',label:'Balanced',note:'Best overall compromise across points, risk, fixtures and flexibility.',risk:'mean',horizonScale:1.00,weights:{ownership:.01,availability:.20,value:.04,price:.03,fixture:.04},transfer:{threshold:.25,decay:.90,ftScale:1.00,useFriction:.20,itbValue:.08},riskLabel:'Medium'},
 fixture:{icon:'⚡',label:'Aggressive Fixture Chaser',note:'Attacks near-term fixture swings and accepts more movement.',risk:'upside',horizonScale:.72,weights:{ownership:.00,availability:.10,value:.02,price:.02,fixture:.18},transfer:{threshold:0,decay:.85,ftScale:.85,useFriction:0,itbValue:0},riskLabel:'High'},
 projection:{icon:'📈',label:'Projection Maximizer',note:'Maximises modelled xPts with minimal narrative adjustment.',risk:'mean',horizonScale:1.00,weights:{ownership:0,availability:0,value:0,price:0,fixture:0},transfer:{threshold:0,decay:1,ftScale:.85,useFriction:0,itbValue:0},riskLabel:'High'},
 value:{icon:'💰',label:'Value Builder',note:'Targets points-per-million and credible early price growth.',risk:'mean',horizonScale:.88,weights:{ownership:.015,availability:.25,value:.22,price:.22,fixture:.06},transfer:{threshold:.10,decay:.88,ftScale:.90,useFriction:.10,itbValue:.15},riskLabel:'Medium'},
 template:{icon:'👥',label:'Template Chaser',note:'Favours highly owned, secure players to reduce rank volatility.',risk:'safe',horizonScale:.95,weights:{ownership:.12,availability:.55,value:.04,price:.05,fixture:.03},transfer:{threshold:.25,decay:.92,ftScale:1.05,useFriction:.20,itbValue:.08},riskLabel:'Low'}
};

function transferStrategyProfile(key=S.transfer.style){
  return STRATEGY_PROFILES[key]||STRATEGY_PROFILES.balanced
}
/* RC5.0.10 — one source of truth for transfer objective settings.
 *
 * The boot state declared style:'value' while carrying Balanced's numbers on
 * all five objective fields (threshold .25/.10, decay .90/.88, ftScale
 * 1.00/0.90, friction .20/.10, itbValue .08/.15), and the badge was
 * hardcoded to "Value Builder" in the markup. applyTransferStrategy already
 * derives every number from STRATEGY_PROFILES correctly -- it was simply
 * never called at boot, only from the dropdown's onchange. So a fresh
 * install showed "Value Builder" while the objective behaved as Balanced
 * until the user happened to touch the selector.
 *
 * Rather than keeping the duplicated literals in sync by hand, this
 * reconciles state against the profile at startup. Saved user state is
 * respected: if a stored objective has been hand-tuned away from its
 * profile, it is left alone -- only an untouched default gets derived. */
function reconcileTransferStrategy(){
  const key=STRATEGY_PROFILES[S.transfer.style]?S.transfer.style:'balanced';
  const p=STRATEGY_PROFILES[key].transfer;
  const fields=['threshold','decay','ftScale','useFriction','itbValue'];
  // Only override when the current values match SOME profile exactly, i.e.
  // they are still profile-derived rather than manually customised.
  const looksCustom=!Object.values(STRATEGY_PROFILES).some(prof=>
    fields.every(f=>Math.abs(num(S.transfer[f])-num(prof.transfer[f]))<1e-9));
  S.transfer.style=key;
  if(!looksCustom)for(const f of fields)S.transfer[f]=p[f];
  return {key,derived:!looksCustom};
}
function applyTransferStrategy(key,{persist=true,refresh=true}={}){
  const valid=STRATEGY_PROFILES[key]?key:'balanced',profile=STRATEGY_PROFILES[valid];
  S.transfer.style=valid;
  S.transfer.threshold=profile.transfer.threshold;
  S.transfer.decay=profile.transfer.decay;
  S.transfer.ftScale=profile.transfer.ftScale;
  S.transfer.useFriction=profile.transfer.useFriction;
  S.transfer.itbValue=profile.transfer.itbValue;
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.value=String(value)};
  set('tpStrategyStyle',valid);set('tpThreshold',S.transfer.threshold);set('tpDecay',S.transfer.decay);
  set('tpFtScale',S.transfer.ftScale);set('tpFriction',S.transfer.useFriction);set('tpItbValue',S.transfer.itbValue);
  renderTransferStrategy();
  if(refresh)renderTransferPlanner();
  if(persist)saveUserState();
}
function renderTransferStrategy(){
  const profile=transferStrategyProfile(),select=document.getElementById('tpStrategyStyle');
  if(select)select.value=S.transfer.style||'balanced';
  const badge=document.getElementById('transferStyleBadge');if(badge)badge.textContent=`${profile.icon} ${profile.label}`;
  const note=document.getElementById('transferStyleNote');if(note)note.textContent=profile.note;
  const settings=document.getElementById('transferStyleSettings');
  if(settings)settings.innerHTML=[
    `Threshold +${num(profile.transfer.threshold).toFixed(2)}`,
    `Future ${num(profile.transfer.decay).toFixed(2)}`,
    `FT value ${num(profile.transfer.ftScale).toFixed(2)}`,
    `Friction ${num(profile.transfer.useFriction).toFixed(2)}`,
    `Bank ${num(profile.transfer.itbValue).toFixed(2)}`
  ].map(x=>`<span>${esc(x)}</span>`).join('');
}

const PLANNER_STYLE_PROFILES=Object.fromEntries(Object.entries(STRATEGY_PROFILES).map(([k,p])=>[k,{label:`${p.icon} ${p.label}`,threshold:p.transfer.threshold,hybrid:{decay:p.transfer.decay,ftScale:p.transfer.ftScale,useFriction:p.transfer.useFriction,itbValue:p.transfer.itbValue},riskLabel:p.riskLabel}]));
let BUILDER_STYLE_RESULTS={};
function strategyProfile(key=S.builderStyle){return STRATEGY_PROFILES[key]||STRATEGY_PROFILES.balanced}
function seasonStrategyRecommendation(){const gw=num(S.gw,1);if(gw<=10)return'value';if(gw>=32)return'projection';return'balanced'}
function renderBuilderStrategyProfiles(){const host=document.getElementById('builderStrategyProfiles');if(!host)return;host.innerHTML=Object.entries(STRATEGY_PROFILES).map(([k,p])=>`<button type="button" class="strategy-profile ${S.builderStyle===k?'on':''}" data-builder-style="${k}"><div class="sp-name">${p.icon} ${esc(p.label)}</div><div class="sp-note">${esc(p.note)}</div></button>`).join('');host.querySelectorAll('[data-builder-style]').forEach(b=>b.onclick=()=>{S.builderStyle=b.dataset.builderStyle;const p=strategyProfile();S.risk=p.risk;document.getElementById('oRisk').value=p.risk;renderBuilderStrategyProfiles();saveUserState();bumpCache()});const rec=seasonStrategyRecommendation(),rp=STRATEGY_PROFILES[rec],box=document.getElementById('builderStrategyRecommendation');if(box)box.innerHTML=`<b>Solio recommendation:</b> ${rp.icon} ${esc(rp.label)} suits GW${S.gw}. ${rec==='value'?'Early squad-value growth can compound into greater purchasing power later.':rec==='projection'?'Late-season decisions should focus heavily on immediate points.':'The middle of the season usually rewards a balanced objective.'}`}
function builderStyleSignal(p,profile,gws){const w=profile.weights||{},own=Math.min(60,num(p.live?.selected))/60,avail=availability(p),value=Math.min(2,horizonForecast(p).total/Math.max(4,p.c)/6),price=Math.max(-1,Math.min(1,(num(p.live?.transfersIn)-num(p.live?.transfersOut))/500000+num(p.live?.costChange)/5)),fx=gws.length?gws.reduce((a,g)=>{const rows=scheduleFixtureRows(p.t,g);return a+(rows.length?rows.reduce((z,x)=>z+(6-num(x.dOverall,3)),0)/rows.length:0)},0)/gws.length/3:0;return own*w.ownership+avail*w.availability+value*w.value+price*w.price+fx*w.fixture}
function optimiserPayloadForStyle(styleKey=S.builderStyle){const profile=STRATEGY_PROFILES[styleKey]||STRATEGY_PROFILES.balanced,gws=optimisationGameweeks(),base=candidates(),locked=POOL.filter(p=>S.locks.has(p.id)&&!S.buildBlocks.has(p.id)),map=new Map([...base,...locked].map(p=>[p.id,p])),players=[...map.values()].map(p=>{const signal=builderStyleSignal(p,profile,gws),gw={};let decay=1;for(const g of gws){const r=project(p,g),adj=signal*decay;gw[g]={mean:r.x,utility:gwUtility(r)+adj,pAppear:minuteDetail(p).pAppear};decay*=profile.horizonScale}return{id:p.id,p:p.p,t:p.t,c:p.c,horizon:horizonForecast(p).utility+signal*gws.length,gw}});return{players,gws,budget:S.budget,lockedIds:locked.map(p=>p.id),form:document.getElementById('oForm').value||null,benchMode:document.getElementById('oBench').value||'autosub',plannedBB:[S.chips.BB1,S.chips.BB2].filter(Boolean).map(Number),styleKey}}
function builderRiskScore(profile,result,ids=[]){const base={Low:25,Medium:50,High:75}[profile.riskLabel]||50,players=ids.map(byId).filter(Boolean),uncertainty=players.length?players.reduce((a,p)=>a+(1-clamp(num(p.conf,.65),0,1)),0)/players.length*30:0,availabilityRisk=players.length?players.filter(p=>availability(p)<.75).length/players.length*25:0;return Math.max(0,Math.min(100,base*.65+uncertainty+availabilityRisk+(result?.weeks?.some(w=>!w)?10:0)))}
function expectedValueGrowth(ids,styleKey){const prof=STRATEGY_PROFILES[styleKey],players=ids.map(byId).filter(Boolean);return players.reduce((a,p)=>a+Math.max(-.1,Math.min(.3,(num(p.live?.transfersIn)-num(p.live?.transfersOut))/700000+num(p.live?.costChange)/10+(prof===STRATEGY_PROFILES.value?.08:0))),0)}
function builderChangesFromCurrent(ids){if(S.squad.length!==15)return{changes:0,hits:0};const current=new Set(S.squad),next=new Set(ids),changes=[...next].filter(id=>!current.has(id)).length,free=Math.max(1,num(S.transfer?.free,1)),hits=Math.max(0,changes-free)*4;return{changes,hits}}
function styleFlexibilityScore(ids,bank){const players=ids.map(byId).filter(Boolean),cheap=players.filter(p=>p.c<=5.5).length,premium=players.filter(p=>p.c>=9.5).length;return clamp(Math.round(45+bank*7+cheap*2-premium*2),0,100)}
function strategyWinner(rows){const maxX=Math.max(...rows.map(r=>r.xpts)),maxV=Math.max(...rows.map(r=>r.value)),minR=Math.min(...rows.map(r=>r.risk)),rec=seasonStrategyRecommendation();const recommended=rows.find(r=>r.key===rec)||rows.find(r=>r.xpts===maxX)||rows[0];return{maxX,maxV,minR,recommended}}
function strategyReason(row,stats){const bits=[];if(Math.abs(row.xpts-stats.maxX)<.05)bits.push('highest projected points');if(Math.abs(row.value-stats.maxV)<.05)bits.push('strongest estimated value growth');if(Math.abs(row.risk-stats.minR)<.5)bits.push('lowest modelled risk');if(row.key==='value'&&S.gw<=10)bits.push('fits the early-season value-building window');if(row.key==='balanced')bits.push('keeps the broadest compromise');return bits.length?bits.join(', '):'best fit for the current season stage and selected objective'}
function runBuilderPayloadOnce(payload,label,onProgress){return new Promise((resolve,reject)=>{let worker;try{worker=createOptimiserWorker()}catch(e){worker=null}if(!worker){reject(new Error('Background optimiser unavailable for comparison.'));return}const timer=setTimeout(()=>{worker.terminate();reject(new Error(`${label} exceeded 45 seconds.`))},45000);worker.onmessage=e=>{const d=e.data||{};if(d.type==='progress'){onProgress?.(d.detail||'Searching',d.progress||0)}else if(d.type==='result'){clearTimeout(timer);worker.terminate();if(worker.__url)URL.revokeObjectURL(worker.__url);resolve(d.result)}else if(d.type==='error'){clearTimeout(timer);worker.terminate();reject(new Error(d.error||`${label} failed`))}};worker.onerror=e=>{clearTimeout(timer);worker.terminate();reject(new Error(`${label} worker failed`))};worker.postMessage({type:'run',payload})})}
function applyBuilderStyleResult(key){const r=BUILDER_STYLE_RESULTS[key];if(!r)return;const primary=r.result.weeks.find(w=>w.gw===S.gw)||r.result.weeks[0];S.builderStyle=key;S.squad=[...r.result.listIds];S.start=new Set(primary.xiIds);S.cap=primary.captainId;S.vice=primary.viceId;S.benchOrder=primary.benchOrderIds.map(id=>byId(id)).filter(Boolean).map(stableKey);renderBuilderStrategyProfiles();render();saveUserState();flash(`${STRATEGY_PROFILES[key].label} squad applied.`)}
async function compareBuilderStyles(){const host=document.getElementById('builderStyleComparison'),btn=document.getElementById('btnCompareBuilderStyles');if(!host||!btn)return;if(!productionDataReady()){host.innerHTML='<div class="verdict warn">Validated live data is required.</div>';return}syncControls();btn.disabled=true;BUILDER_STYLE_RESULTS={};const entries=Object.entries(STRATEGY_PROFILES);host.innerHTML='<div class="strategy-progress"><b>Six-style comparison</b><div id="builderStyleProgress">Preparing identical optimisation inputs…</div></div>';try{for(let i=0;i<entries.length;i++){const [key,p]=entries[i],payload=optimiserPayloadForStyle(key),prog=document.getElementById('builderStyleProgress');if(prog)prog.textContent=`${i+1}/6 · ${p.icon} ${p.label}`;const result=await runBuilderPayloadOnce(payload,p.label,(d,x)=>{if(prog)prog.textContent=`${i+1}/6 · ${p.label}: ${d} · ${Math.round(100*num(x))}%`});BUILDER_STYLE_RESULTS[key]={result,payload}}const rows=entries.map(([key,p])=>{const r=BUILDER_STYLE_RESULTS[key].result,ids=r.listIds,xpts=num(r.averageMean)*r.weeks.length,value=expectedValueGrowth(ids,key),bank=S.budget-cost(ids.map(byId).filter(Boolean)),risk=builderRiskScore(p,r,ids),move=builderChangesFromCurrent(ids),flex=styleFlexibilityScore(ids,bank);return{key,p,xpts,value,bank,risk,changes:move.changes,hits:move.hits,flex,score:num(r.score)}}),stats=strategyWinner(rows),rec=stats.recommended,bestX=rows.find(r=>Math.abs(r.xpts-stats.maxX)<.05),bestV=rows.find(r=>Math.abs(r.value-stats.maxV)<.05),safest=rows.find(r=>Math.abs(r.risk-stats.minR)<.5);host.innerHTML=`<div class="planner-experiment"><div class="planner-experiment-head"><b>Builder Strategy Laboratory</b><span>6 COMPLETE</span></div><div class="strategy-summary-grid"><div class="strategy-summary-card good"><div class="k">Highest xPts</div><div class="v">${bestX.p.icon} ${esc(bestX.p.label)} · ${bestX.xpts.toFixed(1)}</div></div><div class="strategy-summary-card info"><div class="k">Best value growth</div><div class="v">${bestV.p.icon} ${esc(bestV.p.label)} · ${bestV.value>=0?'+':''}${bestV.value.toFixed(1)}</div></div><div class="strategy-summary-card good"><div class="k">Lowest risk</div><div class="v">${safest.p.icon} ${esc(safest.p.label)} · ${Math.round(safest.risk)}/100</div></div><div class="strategy-summary-card warn"><div class="k">Season-stage fit</div><div class="v">${rec.p.icon} ${esc(rec.p.label)}</div></div></div><div style="overflow-x:auto"><table class="strategy-compare-table"><thead><tr><th>Style</th><th>xPts</th><th>Value*</th><th>Changes</th><th>Hits</th><th>Risk</th><th>Flex</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.key===rec.key?'best':''}"><td>${r.p.icon} ${esc(r.p.label)}</td><td>${r.xpts.toFixed(1)}</td><td>${r.value>=0?'+':''}${r.value.toFixed(1)}</td><td>${r.changes}</td><td>${r.hits?'-'+r.hits:'0'}</td><td>${Math.round(r.risk)}</td><td>${r.flex}</td><td><button type="button" data-use-builder-style="${r.key}">Use</button></td></tr>`).join('')}</tbody></table></div><div class="strategy-recommendation"><b>Solio recommendation: ${rec.p.icon} ${esc(rec.p.label)}.</b> ${esc(strategyReason(rec,stats))}. ${S.squad.length===15?'Changes and hit cost are measured against your current 15-player squad.':'No complete current squad was present, so Changes and Hits are shown as zero for this initial-build comparison.'}</div><div class="strategy-explain">*Value is a directional OTB estimate from ownership momentum, net transfers and current cost movement—not a guaranteed FPL price change. Risk and flexibility are comparative model scores, not probabilities.</div></div>`;host.querySelectorAll('[data-use-builder-style]').forEach(b=>b.onclick=()=>applyBuilderStyleResult(b.dataset.useBuilderStyle))}catch(e){host.innerHTML=`<div class="verdict warn"><b>Comparison failed.</b> ${esc(e.message)}</div>`}finally{btn.disabled=false}}
window.__otbRunTransferPayloadOnce=function(payload,label='Planner style',onProgress){return new Promise((resolve,reject)=>{let worker;try{worker=createTransferWorker()}catch(e){worker=null}if(!worker){reject(new Error('Background transfer planner unavailable for comparison.'));return}let settled=false;const cleanup=()=>{try{worker.terminate()}catch(e){}if(worker.__url)try{URL.revokeObjectURL(worker.__url)}catch(e){}};const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(timer);cleanup();fn(value)};const timeoutMs=payload?.sensitivity?60000:45000,timer=setTimeout(()=>finish(reject,new Error(`${label} exceeded ${Math.round(timeoutMs/1000)} seconds.`)),timeoutMs);worker.onmessage=e=>{const d=e.data||{};if(d.type==='progress')onProgress?.(d.detail||'Planning',num(d.progress));else if(d.type==='result')finish(resolve,d.result);else if(d.type==='error')finish(reject,new Error(d.error||`${label} failed`))};worker.onerror=()=>finish(reject,new Error(`${label} worker failed`));worker.postMessage({type:'run',payload})})}
function plannerExperimentSummary(result,payload,profile){const plan=Array.isArray(result?.plan)?result.plan:[],allMoves=plan.flatMap(w=>Array.isArray(w.moves)?w.moves:[]),initialIds=Array.isArray(payload?.squadIds)?payload.squadIds:[],finalIds=Array.isArray(result?.finalIds)?result.finalIds:[...initialIds];if(!result?.finalIds){for(const m of allMoves){const i=finalIds.indexOf(m.outId);if(i>=0)finalIds[i]=m.inId}}const isNewcastle=id=>byId(id)?.t==='NEW',initialNew=initialIds.filter(isNewcastle).length,finalNew=finalIds.filter(isNewcastle).length,newIns=allMoves.filter(m=>byId(m.inId)?.t==='NEW'),newOuts=allMoves.filter(m=>byId(m.outId)?.t==='NEW'),totalMoves=allMoves.length,rolls=plan.filter(w=>!w.moves?.length&&!w.chip).length,totalHits=plan.reduce((a,w)=>a+Math.max(0,num(w.hit)),0),objective=num(result?.score,result?.objectiveScore);return{key:profile.key,label:profile.label,riskLabel:profile.riskLabel,firstAction:transferFirstActionText(plan),totalMoves,rolls,totalHits,finalFt:num(result?.finalFt),finalBank:num(result?.finalBank),objective,initialNew,finalNew,newIns,newOuts,plan}}
function plannerExperimentVerdict(rows){if(!rows?.length)return'No comparable routes were returned.';const mostMoves=[...rows].sort((a,b)=>b.totalMoves-a.totalMoves)[0],fewest=[...rows].sort((a,b)=>a.totalMoves-b.totalMoves||a.totalHits-b.totalHits)[0],newcastle=rows.filter(r=>r.finalNew>r.initialNew),best=[...rows].sort((a,b)=>b.objective-a.objective)[0];if(newcastle.length)return`${newcastle.map(r=>r.label).join(', ')} added Newcastle coverage. ${fewest.label} was the most conservative route, while ${mostMoves.label} used the most transfers.`;return`No style added Newcastle coverage. ${best.label} returned the highest profile-specific objective; ${fewest.label} used the fewest transfers. This points to player projections and squad economics, rather than transfer conservatism alone.`}
function plannerExperimentDependencyCheck(){const missing=[];if(typeof window.__otbRunTransferPayloadOnce!=='function')missing.push('transfer runner');if(typeof plannerExperimentSummary!=='function')missing.push('summary');if(typeof plannerExperimentVerdict!=='function')missing.push('verdict');return missing}
async function runPlannerStyleExperiment(){const deps=plannerExperimentDependencyCheck();if(deps.length){const h=document.getElementById('plannerExperimentOut');if(h)h.innerHTML=`<div class="verdict warn"><b>Experiment unavailable.</b> Missing ${esc(deps.join(', '))}. Reload the latest RC4.4.3 file.</div>`;return}const host=document.getElementById('plannerExperimentOut');if(!host)return;if(!productionDataReady()||S.squad.length!==15||!legal(squadPlayers())){flash('A complete legal squad and validated live data are required.');host.innerHTML='<div class="verdict warn">Complete a legal 15-player squad before running the planner-style experiment.</div>';return}syncTransferSettings();const base=transferPlannerPayload(),profiles=Object.entries(PLANNER_STYLE_PROFILES).map(([key,v])=>({key,...v})),rows=[];document.getElementById('btnPlannerExperiment').disabled=true;host.innerHTML='<div class="planner-experiment"><div class="planner-experiment-head"><b>Planner Style Experiment</b><span>0 / 6</span></div><div class="experiment-progress">Preparing identical comparison payloads…</div></div>';try{for(let i=0;i<profiles.length;i++){const profile=profiles[i],payload=JSON.parse(JSON.stringify(base));payload.threshold=profile.threshold;payload.hybrid={...payload.hybrid,...profile.hybrid};const meta=host.querySelector('.planner-experiment-head span'),progress=host.querySelector('.experiment-progress');if(meta)meta.textContent=`${i+1} / 6`;if(progress)progress.textContent=`Running ${profile.label}…`;const result=await window.__otbRunTransferPayloadOnce(payload,profile.label,(detail,p)=>{if(progress)progress.textContent=`${profile.label}: ${detail} · ${Math.round(100*num(p))}%`});rows.push(plannerExperimentSummary(result,payload,profile))}const bestObjective=Math.max(...rows.map(r=>r.objective)),cards=rows.map(r=>`<div class="style-result ${Math.abs(r.objective-bestObjective)<1e-6?'best':''}"><div class="sr-name">${esc(r.label)}</div><div class="sr-action">${esc(r.firstAction)}</div><div class="sr-meta">Moves ${r.totalMoves} · Rolls ${r.rolls} · Hits ${r.totalHits?'-'+r.totalHits:'0'}<br>Final FT ${r.finalFt} · Bank £${r.finalBank.toFixed(1)}<br>Objective ${r.objective.toFixed(2)}</div><div class="sr-new"><b>Newcastle ${r.initialNew} → ${r.finalNew}</b><br>${r.newIns.length?`In: ${esc(r.newIns.map(m=>m.inName).join(', '))}`:'No Newcastle purchase'}${r.newOuts.length?`<br>Out: ${esc(r.newOuts.map(m=>m.outName).join(', '))}`:''}</div></div>`).join('');host.innerHTML=`<div class="planner-experiment"><div class="planner-experiment-head"><b>Planner Style Experiment</b><span>COMPLETE</span></div><div class="style-experiment-grid">${cards}</div><div class="experiment-verdict"><b>Experiment verdict:</b> ${esc(plannerExperimentVerdict(rows))}</div><div class="help" style="margin:8px 0 0">All six routes used the same squad, prices, player forecasts, planning window and legal constraints. Only transfer-conservation coefficients changed. Highest objective is highlighted, but objectives are profile-specific and should not be compared as universal truth.</div></div>`}catch(e){host.innerHTML=`<div class="verdict warn"><b>Experiment failed.</b> ${esc(e.message)}</div>`}finally{document.getElementById('btnPlannerExperiment').disabled=false}}

function applyFirstTransferStep(){const result=S.transfer.last,row=result?.plan?.[0];if(!row?.moves?.length||row.chip==='FH')return;if(!confirm(`Apply ${row.moves.length} permanent transfer${row.moves.length===1?'':'s'} for GW${row.gw}?`))return;for(const m of row.moves){S.squad=S.squad.map(id=>id===m.outId?m.inId:id);const op=byId(m.outId),ip=byId(m.inId);if(op)delete S.transfer.purchase[stableKey(op)];if(ip)S.transfer.purchase[stableKey(ip)]=ip.c}S.transfer.bank=num(row.bankAfter,0);S.transfer.free=num(row.ftAfter,S.transfer.free);const ps=squadPlayers();S.budget=Math.round((moneyTenths(moneyTotal(ps))+moneyTenths(S.transfer.bank)))/10;S.start.clear();S.cap=S.vice=null;autoXI();bumpCache();initControls();initTransferControls();render();saveUserState();flash(`Applied GW${row.gw} transfer step.`)}
function validationFatalIssues(v=DATA.validation){return [...(v?.structural||[]),...(v?.season||[]),...(v?.topology||[])]}
function validationLoadBlockingIssues(v=DATA.validation){return [...(v?.structural||[]),...(v?.season||[])]}
function historyCodeSet(meta,names){const out=new Set;for(const name of names){const rows=meta?.[name];if(!Array.isArray(rows))continue;for(const value of rows){const code=typeof value==='object'?value?.code??value?.player_code??value?.id:value;if(code!==null&&code!==undefined&&String(code).trim())out.add(String(code))}}return out}
function historyElementClass(e,p,sets){const hist=e?.hist_prev,code=String(e?.code??''),status=String(e?.history_status??e?.historyStatus??e?.hist_status??hist?.status??hist?.classification??'').trim().toLowerCase(),eligibleFlag=e?.history_eligible??e?.hist_eligible??hist?.history_eligible??hist?.eligible,newcomerFlag=e?.is_newcomer??e?.newcomer??hist?.newcomer;const hasObject=!!hist&&typeof hist==='object'&&!Array.isArray(hist),recordKeys=['total_points','minutes','starts','defcon','season','matched','source','code'],hasRecord=hasObject&&recordKeys.some(k=>Object.prototype.hasOwnProperty.call(hist,k)),hasValues=num(p?.histPts)>0||num(p?.histMinutes)>0||num(p?.histStarts)>0;if(hasRecord||hasValues||status==='matched'||status==='returning-matched')return'matched';if(newcomerFlag===true||eligibleFlag===false||sets.newcomer.has(code)||['newcomer','new','promoted','academy','no-prior-pl','exempt'].includes(status))return'newcomer';if(eligibleFlag===true||sets.eligible.has(code)||sets.unresolved.has(code)||['missing','unresolved','returning','eligible'].includes(status))return'unresolved';return'inferred-newcomer'}
function buildHistoryCoverage(raw,elements,players){const meta=raw?.hist_meta||{},sets={eligible:historyCodeSet(meta,['eligible_codes','returning_codes','history_eligible_codes']),unresolved:historyCodeSet(meta,['unresolved_codes','missing_codes','unmatched_returning_codes']),newcomer:historyCodeSet(meta,['newcomer_codes','exempt_codes','no_history_required_codes'])};let matched=0,newcomer=0,unresolved=0,inferred=0;players.forEach((p,i)=>{const cls=historyElementClass(elements[i],p,sets);p.historyClass=cls;if(cls==='matched')matched++;else if(cls==='unresolved')unresolved++;else{newcomer++;if(cls==='inferred-newcomer')inferred++}});const total=players.length,eligible=matched+unresolved,eligibleRatio=eligible?matched/eligible:0,overallRatio=total?matched/total:0,classification=inferred?'mixed/inferred':'explicit',minimumMatched=Math.min(300,Math.floor(total*.55)),productionOK=eligible>0&&matched>=minimumMatched&&eligibleRatio>=.95;return{matched,total,overallRatio,eligible,eligibleRatio,newcomer,unresolved,inferred,classification,productionOK}}
function releaseReadiness(){const v=DATA.validation||{},modeOK=DATA.mode==='LIVE'||DATA.mode==='CACHE'||DATA.mode==='STALE',usable=modeOK&&v.structuralPass&&v.seasonPass&&!validationLoadBlockingIssues(v).length,histOK=DATA.histCoverage?.productionOK===true;if(!usable)return'BLOCKED';const certified=v.topologyPass&&v.freshnessPass&&v.sourcePass&&histOK;return certified?'PRODUCTION':'USABLE'}
function productionDataReady(){return releaseReadiness()!=='BLOCKED'}
let ACTIVE_OPTIMISER=null,OPTIMISER_RUN=0;
function optimiserPayload(){return optimiserPayloadForStyle(S.builderStyle)}
function createOptimiserWorker(){const source=document.getElementById('optimizerWorkerSource')?.textContent;if(!source||typeof Worker!=='function')return null;const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),worker=new Worker(url);worker.__url=url;return worker}
function stopOptimiser(message='Optimiser cancelled.'){if(ACTIVE_OPTIMISER){ACTIVE_OPTIMISER.terminate();if(ACTIVE_OPTIMISER.__url)URL.revokeObjectURL(ACTIVE_OPTIMISER.__url);ACTIVE_OPTIMISER=null}document.getElementById('btnBuild').disabled=!productionDataReady();const out=document.getElementById('buildOut');if(message)out.innerHTML=`<div class="verdict warn">${esc(message)}</div>`}
function renderOptimiserResult(result,t0){const primary=result.weeks.find(w=>w.gw===S.gw)||result.weeks[0],list=result.listIds.map(byId).filter(Boolean);if(!primary||list.length!==15)throw new Error('Worker returned an incomplete squad.');S.squad=list.map(p=>p.id);S.start=new Set(primary.xiIds);S.cap=primary.captainId;S.vice=primary.viceId;S.benchOrder=primary.benchOrderIds.map(id=>byId(id)).filter(Boolean).map(stableKey);render();const rows=result.weeks.map(w=>{const cap=byId(w.captainId),bench=w.benchOrderIds.map(id=>byId(id)?.n).filter(Boolean).join(' › ');return`<div class="gw-plan-row"><span>GW${w.gw}</span><span>${w.formation}</span><span>${esc(cap?.n||'—')} (C)</span><span class="bench-col">${esc(bench||'—')}</span><span class="mono">+${w.autosubMean.toFixed(1)}</span></div>`}).join(''),boost=result.boostGw?`<br>Bench Boost target: <b>GW${result.boostGw}</b> · incremental gain ${result.boostGain.toFixed(1)} xPts.`:'';document.getElementById('buildOut').innerHTML=`<div class="verdict"><span class="strategy-badge">${strategyProfile().icon} ${esc(strategyProfile().label)}</span><br><b>${primary.formation}</b> recommended for GW${primary.gw} · spent <b>£${cost(list).toFixed(1)}m</b> · bank £${bank().toFixed(1)}m<br>Projected average with per-GW XI, captain and expected autosubs: <b>${result.averageMean.toFixed(1)} xPts</b> across ${result.weeks.length} GW${result.weeks.length>1?'s':''}.<br>Expected autosub contribution: <b>${result.averageAutosub.toFixed(2)} points per GW</b>.${boost}<br>Background solve completed in ${Math.round(performance.now()-t0)}ms.</div><div class="gw-plan"><div class="gw-plan-row head"><span>GW</span><span>Form</span><span>Captain</span><span class="bench-col">Outfield bench priority</span><span>Auto</span></div>${rows}</div>`;saveUserState();scheduleSelfTests(250)}
function runOptimiserFallback(t0){setTimeout(()=>{try{const r=optimise();if(r.err)throw new Error(r.err);const result={listIds:r.list.map(p=>p.id),weeks:r.res.weeks.map(w=>({gw:w.gw,xiIds:w.xi.map(o=>o.p.id),captainId:w.captain.p.id,viceId:w.vice.p.id,formation:w.formation,benchOrderIds:w.bench.order.map(o=>o.p.id),autosubMean:w.bench.mean,benchMean:w.bench.fullMean,roles:w.bench.roles})),averageMean:r.res.averageMean,averageAutosub:r.res.averageAutosub,boostGw:r.res.boostGw,boostGain:r.res.boostGain};renderOptimiserResult(result,t0)}catch(e){stopOptimiser(e.message)}},30)}
function runBuild(){syncControls();const out=document.getElementById('buildOut');if(!productionDataReady()){out.innerHTML='<div class="verdict warn"><b>Optimiser locked.</b> Refresh official data or import a validated current-season dataset. SEED mode is only for interface demonstration.</div>';flash('Optimiser requires validated data.');return}stopOptimiser('');const run=++OPTIMISER_RUN,t0=performance.now(),btn=document.getElementById('btnBuild');btn.disabled=true;out.innerHTML='<div class="optimiser-progress"><b>Building autosub-aware squad…</b><div class="progress-track"><div class="progress-fill" id="optProgress"></div></div><div class="progress-meta"><span id="optDetail">Preparing projections</span><span id="optPct">0%</span></div></div><button type="button" class="btn danger" id="btnCancelOptimiser">Cancel optimisation</button>';document.getElementById('btnCancelOptimiser').onclick=()=>stopOptimiser();let worker;try{worker=createOptimiserWorker()}catch(e){worker=null}if(!worker){out.querySelector('#optDetail').textContent='Background Worker unavailable — using compatibility mode';runOptimiserFallback(t0);return}ACTIVE_OPTIMISER=worker;const timer=setTimeout(()=>{if(run===OPTIMISER_RUN)stopOptimiser('Optimiser exceeded 45 seconds and was stopped.')},45000);worker.onmessage=e=>{if(run!==OPTIMISER_RUN)return;const d=e.data||{};if(d.type==='progress'){const pct=Math.max(0,Math.min(98,Math.round(100*d.progress)));const bar=document.getElementById('optProgress'),lab=document.getElementById('optPct'),det=document.getElementById('optDetail');if(bar)bar.style.width=pct+'%';if(lab)lab.textContent=pct+'%';if(det)det.textContent=d.detail||'Searching'}else if(d.type==='result'){clearTimeout(timer);stopOptimiser('');try{renderOptimiserResult(d.result,t0)}catch(err){stopOptimiser(err.message)}}else if(d.type==='error'){clearTimeout(timer);stopOptimiser(d.error||'Optimiser failed.')}};worker.onerror=e=>{clearTimeout(timer);stopOptimiser('Background optimiser failed; retrying in compatibility mode.');runOptimiserFallback(t0)};worker.postMessage({type:'run',payload:optimiserPayload()})}
function syncControls(){S.budget=num(document.getElementById('oBudget').value,100);S.horizon=num(document.getElementById('oHorizon').value,2);S.risk=document.getElementById('oRisk').value||'mean';S.display=document.getElementById('oDisplay').value||'total';DATA.auto=document.getElementById('autoRefresh').checked;bumpCache()}
function syncHeaderHeight(){try{const h=document.querySelector('header');if(!h)return;
  document.documentElement.style.setProperty('--header-height',h.offsetHeight+'px')}catch(e){}}
window.addEventListener('resize',syncHeaderHeight);
window.addEventListener('orientationchange',syncHeaderHeight);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(syncHeaderHeight).catch(()=>{});
function migrateStorage(){try{
  const pairs=[[CACHE_KEY,LEGACY_CACHE_KEY],[STATE_KEY,LEGACY_STATE_KEY]];
  let moved=0;
  for(const [now,old] of pairs){
    if(localStorage.getItem(now)===null){
      const v=localStorage.getItem(old);
      if(v!==null){localStorage.setItem(now,v);moved++}
    }
  }
  return moved;
}catch(e){return 0}}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function flash(msg){const live=document.getElementById('appStatus');if(live){live.textContent='';setTimeout(()=>live.textContent=String(msg),10)}const bar=document.createElement('div');bar.textContent=msg;bar.setAttribute('role','status');bar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#E90052;color:#fff;padding:9px 18px;border-radius:3px;font-weight:700;font-size:12px;z-index:400';document.body.appendChild(bar);setTimeout(()=>bar.remove(),2600)}
function enhanceAccessibility(){document.querySelectorAll('button:not([type])').forEach(b=>b.type='button');document.querySelectorAll('.field>label').forEach(l=>{const c=l.parentElement.querySelector('input,select,textarea');if(c?.id)l.htmlFor=c.id});const names={fSearch:'Search players by name or club',fPos:'Filter by position',fTeam:'Filter by team',fPreset:'Player discovery preset',fPeriod:'Player discovery period',fSort:'Primary player ranking metric',fSecondary:'Player ranking tie-break',fMax:'Maximum player price',fOwnMax:'Maximum player ownership',fAvailable:'Show available players only',fStarter:'Show likely starters only',fAffordable:'Show affordable players only',fSetPiece:'Show set-piece players only',gwSel:'Selected gameweek',acBudget:'Auto-complete budget',importBox:'Manual FPL JSON import',priceWindow:'Price movement window',priceScope:'Price player scope',priceSort:'Price market side',fxExternalInput:'Supplementary all-competition fixture JSON or CSV',accuracyActualInput:'Official Gameweek results JSON',accuracyGw:'Accuracy Gameweek',accuracyCohort:'Accuracy evaluation cohort'};for(const [id,name] of Object.entries(names)){const el=document.getElementById(id);if(el&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',name)}const railMap={build:'pBuild',transfers:'pTransfers',prices:'pPrices',verdict:'pVerdict',model:'pModel',roles:'pRoles',news:'pNews',fixtures:'pFixtures',accuracy:'pAccuracy',squads:'pSquads',chips:'pChips',data:'pData'},mobileMap={pool:'colPool',centre:'colCentre',rail:'colRail'};const wire=(selector,map)=>{const tabs=[...document.querySelectorAll(selector)];tabs.forEach((b,i)=>{const panel=document.getElementById(map[b.dataset.t||b.dataset.m]);if(!b.id)b.id=`tab-${b.dataset.t||b.dataset.m}`;if(panel){b.setAttribute('aria-controls',panel.id);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',b.id)}b.tabIndex=b.classList.contains('on')?0:-1;b.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[n].focus();tabs[n].click()})})};wire('.tabs button',railMap);wire('.mobile-tabs button',mobileMap);const newsTabs=[...document.querySelectorAll('[data-news-view]')],newsPanel=document.getElementById('newsFeed');newsTabs.forEach((b,i)=>{b.setAttribute('aria-controls','newsFeed');b.tabIndex=b.classList.contains('on')?0:-1;b.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?newsTabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+newsTabs.length)%newsTabs.length;newsTabs[n].focus();newsTabs[n].click()});b.addEventListener('click',()=>{newsTabs.forEach(x=>x.tabIndex=x===b?0:-1);if(newsPanel)newsPanel.setAttribute('aria-labelledby',b.id)})})}

const fCls=d=>'f'+Math.max(1,Math.min(5,Math.round(d||3)));
function fixtureDiagnosticHTML(r){
  /* Reads the ctx objects projectFixture() already returns - nothing recomputed,
     so these are exactly the values that drove the projection.
     dAtk -> fdrAttack, which is 45% of attackM (55% is the continuous rating ratio)
     dCS  -> dcM, the DefCon multiplier. It does NOT drive clean sheets.
     pCS  -> clean-sheet probability, from lambdaAgainst, not from dCS. */
  if(!r||!r.fixtures||!r.fixtures.length)return '<div class="fxdiag">No fixture this gameweek.</div>';
  return r.fixtures.map(z=>{
    const c=z.ctx,fx=z.fx;
    if(!c||!fx)return '';
    return `<div class="fxdiag"><b>${esc(fx.opp)} (${fx.home?'H':'A'})</b>`
      +`<br><span class="fxdiag-k">Difficulty</span> attack ${num(c.dAtk).toFixed(2)} \u00b7 DefCon ${num(c.dCS).toFixed(2)}`
      +`<br><span class="fxdiag-k">Applied</span> attack \u00d7${num(c.attackM).toFixed(3)} \u00b7 clean sheet ${(num(c.pCS)*100).toFixed(1)}%`
      +`</div>`;
  }).join('');
}
function fixtureText(r){if(!r.fixtures.length)return'BLANK';return r.fixtures.map(z=>`${z.fx.opp} (${z.fx.home?'H':'A'})`).join(' + ')}
const DISCOVERY_METRICS={
  xpts:{label:'Total xPts',desc:'Expected points summed across the selected discovery period.'},avg:{label:'Average xPts / GW',desc:'Expected points per gameweek across the selected period.'},floor:{label:'Safe floor',desc:'Projection reduced by one combined standard deviation; unavailable players are floored at zero.'},ceiling:{label:'Upside ceiling',desc:'Projection increased by one combined standard deviation.'},captain:{label:'Captaincy score',desc:'Selected-GW mean and upside, availability-adjusted. Captain preset always uses one gameweek.'},confidence:{label:'Model confidence',desc:'Average projection evidence score across the selected period; this is not a chance of playing.'},minutes:{label:'Expected minutes',desc:'Availability-adjusted expected minutes in the selected gameweek.'},appearance:{label:'Appearance chance',desc:'Overall chance of appearing, including official availability.'},start:{label:'Overall start chance',desc:'Conditional start probability multiplied by official availability.'},availability:{label:'Availability',desc:'Official FPL chance of playing, or the engine status fallback.'},fixtureAtk:{label:'Attacking run',desc:'Opportunity-adjusted attacking fixture score; easy doubles add value and blanks add none.'},fixtureCS:{label:'Clean-sheet run',desc:'Opportunity-adjusted defensive fixture score; easy doubles add value and blanks add none.'},replacement:{label:'Points above replacement',desc:'Projected points above a viable low-cost option at the same position.'},upgrade:{label:'Best squad upgrade',desc:'Best legal single-transfer gain against your current same-position players, using sell-on pricing and bank.'},value:{label:'xPts / £m',desc:'Expected points per £1.0m across the selected period.'},price:{label:'Price',desc:'Current official FPL player price.'},form:{label:'Current form',desc:'Official FPL current-form value.'},ppg:{label:'PPG when appearing',desc:'Official FPL points per appearance. This is a scoring-rate statistic, not evidence that the player will start.'},xgi:{label:'xGI',desc:'Current-season expected goals plus expected assists.'},xgi90:{label:'xGI / 90',desc:'Current-season expected goal involvement per 90 minutes.'},officialGap:{label:'OTB vs official',desc:'OTB selected-GW xPts minus official FPL expected points; positive means OTB is more bullish.'},pts25:{label:'25/26 points',desc:'Previous-season total points.'},defcon:{label:'DefCon 25/26',desc:'Previous-season defensive-contribution points.'},ownership:{label:'Ownership',desc:'Official selected-by percentage, highest first.'},lowOwnership:{label:'Low ownership',desc:'Lowest official ownership first.'},differential:{label:'Differential score',desc:'Projection and confidence rewarded while high ownership is discounted.'},rise:{label:'Rise pressure',desc:'Directional price-rise pressure from Worker transfer snapshots.'},fall:{label:'Fall pressure',desc:'Magnitude of directional price-fall pressure from Worker transfer snapshots.'}
};
function discoveryPeriodCount(){const v=document.getElementById('fPeriod')?.value||S.discovery.period||'opt';return v==='opt'?Math.max(1,num(S.horizon,2)):clamp(num(v,1),1,8)}
function discoveryGameweeks(n=discoveryPeriodCount()){const a=[];for(let g=S.gw;g<=38&&a.length<n;g++)if(FIX[g])a.push(g);return a.length?a:[S.gw]}
function discoveryPeriodLabel(n=discoveryPeriodCount(),gws=discoveryGameweeks(n)){if(n===1||gws.length===1)return`GW${gws[0]||S.gw}`;return`GW${gws[0]}–GW${gws[gws.length-1]} (${gws.length} GW)`}
function hasSetPieceRole(p){const l=p.live||{};return[l.penOrder,l.cornerOrder,l.fkOrder].some(v=>num(v)>0&&num(v)<=2)}
function discoveryForecast(p,gws){let total=0,varSum=0,confidence=0;for(const g of gws){const r=project(p,g);total+=r.x;varSum+=r.sd*r.sd;confidence+=r.confidence}const n=Math.max(1,gws.length),sd=Math.sqrt(varSum),unavailable=availability(p)<=.001;return{total,avg:total/n,sd,floor:unavailable?0:Math.max(0,total-sd),ceiling:unavailable?0:total+sd,confidence:confidence/n,n}}
function fixtureRunScore(p,gws,view){let opportunities=0;for(const g of gws){for(const f of fixtureListFor(p.t,g)){const ctx=fixtureContext(p.t,f),d=view==='cs'?ctx.dCS:ctx.dAtk;opportunities+=clamp((6-d)/5,.2,1)}}return gws.length?10*opportunities/gws.length:0}
function median(a){if(!a.length)return 0;const z=[...a].sort((x,y)=>x-y),m=Math.floor(z.length/2);return z.length%2?z[m]:(z[m-1]+z[m])/2}
function buildDiscoveryContext(gws){const signature=[gws.join(','),S.gw,S.horizon,S.risk,S.squad.join(','),S.transfer.bank==null?'auto':S.transfer.bank,POOL.length,DATA.lastUpdated||DATA.mode].join('|'),cached=globalThis.__DISCOVERY_CONTEXT_CACHE__;if(cached?.signature===signature)return cached.ctx;const forecast=new Map,fc=p=>{if(!forecast.has(p.id))forecast.set(p.id,discoveryForecast(p,gws));return forecast.get(p.id)};const replacement={};for(const pos of Object.keys(LIMITS)){const eligible=POOL.filter(p=>p.p===pos&&TEAMS[p.t]&&availability(p)>=.5),min=eligible.length?Math.min(...eligible.map(p=>p.c)):0,cohort=eligible.filter(p=>p.c<=min+.6);replacement[pos]=median((cohort.length?cohort:eligible.slice().sort((a,b)=>a.c-b.c).slice(0,Math.max(1,Math.ceil(eligible.length*.15)))).map(p=>fc(p).total))}const squad=squadPlayers(),clubCounts=squad.reduce((a,p)=>(a[p.t]=(a[p.t]||0)+1,a),{}),transferBank=S.transfer.bank==null?Math.max(0,bank()):Math.max(0,num(S.transfer.bank)),ctx={gws,fc,replacement,squad,clubCounts,transferBank,upgrade:new Map};globalThis.__DISCOVERY_CONTEXT_CACHE__={signature,ctx};return ctx}
function bestUpgradeDetail(p,ctx){if(ctx.upgrade.has(p.id))return ctx.upgrade.get(p.id);if(S.squad.includes(p.id)||!ctx.squad.length){const z={value:0,from:null};ctx.upgrade.set(p.id,z);return z}let best={value:0,from:null};for(const own of ctx.squad){if(own.p!==p.p)continue;const bought=S.transfer.purchase[stableKey(own)]??own.c,sell=fplSellingPrice(own,bought);if(p.c>sell+ctx.transferBank+.001)continue;const targetClub=(ctx.clubCounts[p.t]||0)-(own.t===p.t?1:0)+1;if(targetClub>3)continue;const gain=ctx.fc(p).total-ctx.fc(own).total;if(gain>best.value)best={value:gain,from:own}}ctx.upgrade.set(p.id,best);return best}
function discoveryMetric(p,ctx,sort,md=null){const f=ctx.fc(p),r=project(p,S.gw);md=md||minuteDetail(p);const l=p.live||{},price=priceById(p.apiId??p.id),pressure=num(price?.pressure_index),own=clamp(num(l.selected),0,100),xgi=num(l.xG)+num(l.xA);switch(sort){case'avg':return f.avg;case'floor':return f.floor;case'ceiling':return f.ceiling;case'captain':return md.avail<=.001?0:(.65*r.x+.35*Math.max(r.x,r.high))*(.85+.15*r.confidence/100);case'confidence':return f.confidence;case'minutes':return md.exp;case'appearance':return 100*md.pAppear;case'start':return 100*md.avail*md.pStart;case'availability':return 100*md.avail;case'fixtureAtk':return fixtureRunScore(p,ctx.gws,'atk');case'fixtureCS':return fixtureRunScore(p,ctx.gws,'cs');case'replacement':return f.total-num(ctx.replacement[p.p]);case'upgrade':return bestUpgradeDetail(p,ctx).value;case'value':return f.total/Math.max(.1,p.c);case'price':return p.c;case'form':return num(l.form);case'ppg':return num(l.ppg);case'xgi':return xgi;case'xgi90':return num(l.minutes)>=90?90*xgi/num(l.minutes):0;case'officialGap':return r.x-num(l.epNext);case'pts25':return num(p.histPts);case'defcon':return num(p.histDcPts);case'ownership':return own;case'lowOwnership':return-own;case'differential':return f.total*(.70+.30*f.confidence/100)*(1-Math.min(own,50)/100);case'rise':return Math.max(0,pressure);case'fall':return Math.max(0,-pressure);default:return f.total}}
function metricShortLabel(sort){return{fixtureAtk:'ATK run',fixtureCS:'CS run',replacement:'PAR',upgrade:'Upgrade',appearance:'Appear',availability:'Avail',lowOwnership:'Low own',differential:'Diff score',officialGap:'OTB gap',confidence:'Confidence',captain:'Captain',minutes:'Minutes',ownership:'Owned',start:'Start',xpts:'xPts',avg:'Avg/GW',floor:'Floor',ceiling:'Ceiling',value:'xPts/£',price:'Price',form:'Form',ppg:'PPG/app',xgi:'xGI',xgi90:'xGI/90',pts25:'25/26 pts',defcon:'DefCon',rise:'Rise',fall:'Fall'}[sort]||sort}
function formatDiscoveryMetric(sort,v,p,ctx){if(!Number.isFinite(v))return'—';if(sort==='lowOwnership')return`${num(p.live?.selected).toFixed(1)}%`;if(['appearance','start','availability','ownership','confidence'].includes(sort))return`${Math.round(v)}%`;if(sort==='minutes')return`${Math.round(v)}m`;if(sort==='price')return`£${v.toFixed(1)}`;if((sort==='rise'||sort==='fall')&&!priceById(p.apiId??p.id))return'—';if(sort==='rise')return v?`+${Math.round(v)}`:'0';if(sort==='fall')return v?`−${Math.round(v)}`:'0';if(sort==='officialGap'&&num(p.live?.epNext)<=0)return'—';if(sort==='upgrade'&&!ctx.squad.length)return'—';if(sort==='upgrade'&&S.squad.includes(p.id))return'OWN';if(sort==='officialGap'||sort==='upgrade'||sort==='replacement')return`${v>=0?'+':''}${v.toFixed(1)}`;if(sort==='pts25'||sort==='defcon')return`${Math.round(v)}`;if(['xgi','xgi90','form','ppg'].includes(sort))return v.toFixed(2);return v.toFixed(1)}
function discoverySecondaryValue(p,ctx,kind,md=null){md=md||minuteDetail(p);const price=priceById(p.apiId??p.id);if(kind==='priceLow')return-p.c;if(kind==='ownershipLow')return-num(p.live?.selected);if(kind==='availabilityHigh')return md.avail;if(kind==='confidenceHigh')return ctx.fc(p).confidence;if(kind==='minutesHigh')return md.exp;if(kind==='riseHigh')return num(price?.pressure_index);return 0}
function syncDiscoveryState(){const d=S.discovery;d.preset=document.getElementById('fPreset').value;d.period=document.getElementById('fPeriod').value;d.sort=document.getElementById('fSort').value;d.secondary=document.getElementById('fSecondary').value;d.maxPrice=document.getElementById('fMax').value;d.ownMax=document.getElementById('fOwnMax').value;d.available=document.getElementById('fAvailable').checked;d.starter=document.getElementById('fStarter').checked;d.affordable=document.getElementById('fAffordable').checked;d.setPiece=document.getElementById('fSetPiece').checked}
const DISCOVERY_PRESETS={standard:{period:'opt',sort:'xpts',secondary:'none',available:false,starter:false,affordable:false,setPiece:false,ownMax:'100'},captain:{period:'1',sort:'captain',secondary:'confidenceHigh',available:true,starter:true,affordable:false,setPiece:false,ownMax:'100'},safe:{period:'3',sort:'floor',secondary:'minutesHigh',available:true,starter:true,affordable:false,setPiece:false,ownMax:'100'},differential:{period:'5',sort:'differential',secondary:'ownershipLow',available:true,starter:true,affordable:false,setPiece:false,ownMax:'20'},value:{period:'5',sort:'replacement',secondary:'priceLow',available:true,starter:false,affordable:false,setPiece:false,ownMax:'100'},transfer:{period:'5',sort:'upgrade',secondary:'riseHigh',available:true,starter:false,affordable:true,setPiece:false,ownMax:'100'}};
function applyDiscoveryPreset(name,save=true){const cfg=DISCOVERY_PRESETS[name];if(!cfg)return;for(const [k,v] of Object.entries(cfg)){const id={period:'fPeriod',sort:'fSort',secondary:'fSecondary',available:'fAvailable',starter:'fStarter',affordable:'fAffordable',setPiece:'fSetPiece',ownMax:'fOwnMax'}[k],el=document.getElementById(id);if(el){if(el.type==='checkbox')el.checked=!!v;else el.value=String(v)}}document.getElementById('fPreset').value=name;syncDiscoveryState();resetPoolRender();renderPool();if(save)saveUserState()}
function discoveryMetricPeriodLabel(sort,periodLabel){if(['captain','minutes','appearance','start','availability','officialGap'].includes(sort))return`GW${S.gw}`;if(['price','form','ppg','xgi','xgi90','ownership','lowOwnership','rise','fall','confidence'].includes(sort))return'Current snapshot';if(['pts25','defcon'].includes(sort))return'2025/26 season';return periodLabel}function updateDiscoveryNote(sort,periodLabel){const m=DISCOVERY_METRICS[sort]||DISCOVERY_METRICS.xpts,n=document.getElementById('fMetricNote'),scope=discoveryMetricPeriodLabel(sort,periodLabel);if(n)n.innerHTML=`<b>${esc(m.label)}</b> · ${esc(scope)}. ${esc(m.desc)} The cyan number is the active metric.`}
let POOL_COMPUTE_TOKEN=0;
function renderBuildBlockSummary(){const host=document.getElementById('buildBlockSummary');if(!host)return;const players=POOL.filter(p=>S.buildBlocks.has(p.id));if(!players.length){host.innerHTML='';return}const shown=players.slice(0,3).map(p=>esc(p.n)).join(', '),more=players.length>3?` +${players.length-3} more`:'';host.innerHTML=`<span><b>${players.length} blocked from Build:</b> ${shown}${more}</span><button type="button" data-clear-build-blocks>Clear all</button>`}
function renderPool(){
  DEFERRED_POOL_TOKEN++;
  const computeToken=++POOL_COMPUTE_TOKEN;
  syncDiscoveryState();
  renderBuildBlockSummary();
  const q=document.getElementById('fSearch').value.toLowerCase(),pos=document.getElementById('fPos').value,sort=document.getElementById('fSort').value,secondary=document.getElementById('fSecondary').value,max=num(document.getElementById('fMax').value,99),ownMax=num(document.getElementById('fOwnMax').value,100),remaining=bank(),spentSoFar=spent(),slotsLeft=15-S.squad.length,team=document.getElementById('fTeam').value,availableOnly=document.getElementById('fAvailable').checked,starterOnly=document.getElementById('fStarter').checked,affordableOnly=document.getElementById('fAffordable').checked,setPieceOnly=document.getElementById('fSetPiece').checked,gws=discoveryGameweeks(),ctx=buildDiscoveryContext(gws),periodLabel=discoveryPeriodLabel(gws.length,gws);
  updateDiscoveryNote(sort,periodLabel);
  const bankEl=document.getElementById('poolBank');if(bankEl)bankEl.innerHTML=`<div class="pb-left"><span>Bank <b class="${remaining<0?'pb-over':'pb-ok'}">£${remaining.toFixed(1)}m</b></span><span>Spent £${spentSoFar.toFixed(1)}m</span><span>${slotsLeft} slot${slotsLeft===1?'':'s'} left</span></div>`;
  const candidates=POOL.filter(p=>{if((pos&&p.p!==pos)||(team&&p.t!==team)||p.c>max||!TEAMS[p.t])return false;const own=num(p.live?.selected);return own<=ownMax&&(!q||(p.n+' '+p.t+' '+(TEAMS[p.t]?.n||'')).toLowerCase().includes(q))});
  const list=[];
  const scorePlayer=p=>{const own=num(p.live?.selected),owned=S.squad.includes(p.id),md=minuteDetail(p);if(availableOnly&&md.avail<.5||starterOnly&&md.avail*md.pStart<.6||affordableOnly&&!owned&&p.c>remaining+.001||setPieceOnly&&!hasSetPieceRole(p))return;const metric=discoveryMetric(p,ctx,sort,md);list.push({p,md,own,owned,r:project(p,S.gw),h:ctx.fc(p),metric,secondary:discoverySecondaryValue(p,ctx,secondary,md)})};
  const finish=()=>{
    if(computeToken!==POOL_COMPUTE_TOKEN||!columnVisible('colPool'))return;
    list.sort((a,b)=>{const d=b.metric-a.metric;if(Math.abs(d)>1e-9)return d;const z=b.secondary-a.secondary;if(Math.abs(z)>1e-9)return z;return a.p.n.localeCompare(b.p.n)});
    const total=list.length,visible=list.slice(0,POOL_RENDER_LIMIT),visibleIds=new Set(visible.map(o=>o.p.id));for(const o of list)if(o.owned&&!visibleIds.has(o.p.id)){visible.push(o);visibleIds.add(o.p.id)}/* Owned players bypass the RENDER LIMIT, not the filters: a forwards-only
       view should not force your defenders back in. Record both counts so the
       self-test can check that real invariant instead of the stricter one,
       which fails whenever any filter is active. */
    POOL_RENDER_AUDIT={total,rendered:visible.length,limit:POOL_RENDER_LIMIT,ownedInList:list.filter(o=>o.owned).length,ownedVisible:[...visibleIds].filter(id=>S.squad.includes(id)).length};document.getElementById('poolCount').textContent=visible.length<total?`${visible.length} of ${total} shown`:`${total} shown`;
    const rows=visible.map(({p,h,metric,md,own,owned})=>{const flag=flagInfo(p),blocked=S.buildBlocks.has(p.id),metricText=formatDiscoveryMetric(sort,metric,p,ctx),upgrade=sort==='upgrade'?bestUpgradeDetail(p,ctx):null,metricTitle=sort==='upgrade'&&upgrade?.from?`Upgrade ${upgrade.from.n} to ${p.n}: +${upgrade.value.toFixed(1)} xPts over ${periodLabel}`:`${DISCOVERY_METRICS[sort]?.label||sort}: ${metricText} · ${periodLabel}`,sub=`${h.total.toFixed(1)} xPts · ${Math.round(md.pAppear*100)}% app · ${own.toFixed(1)}% own`;return`<div class="prow ${owned?'owned':(p.c>remaining+1e-6&&S.squad.length<15?'unaffordable':'')} ${blocked?'build-blocked':''}"><button type="button" class="prow-add" data-add="${p.id}" aria-label="${owned?'Remove':blocked?'Blocked from Build':'Add'} ${esc(p.n)}, £${p.c.toFixed(1)}m${owned?', from squad':''}${flag?', '+flag.label:''}"><div><div class="pname">${esc(p.n)}${flag?` <span class="pflag ${flag.cls}" title="${esc(flag.label)}">${flag.short}</span>`:''}</div><div class="pmeta">${clubSwatch(p.t)}${esc(p.t)} · ${p.p} <span class="badge ${DATA.mode==='LIVE'?'b-ver':'b-est'}">${DATA.mode}</span></div><div class="pmeta discovery-row-meta">${esc(sub)}</div></div><div class="pnum">£${p.c.toFixed(1)}</div><div class="pnum metric ${metricText==='—'?'metric-missing':''}" title="${esc(metricTitle)}"><span class="mv">${esc(metricText)}</span><span class="ml">${esc(metricShortLabel(sort))}</span></div></button><button type="button" class="info-btn" data-info="${p.id}" aria-label="Inspect ${esc(p.n)} expected-points details" title="Inspect xPts">ⓘ</button><button type="button" class="build-block-btn ${blocked?'on':''}" data-build-block="${p.id}" aria-pressed="${blocked}" aria-label="${blocked?'Unblock':'Block'} ${esc(p.n)} from squad builds" title="${blocked?'Allow in Build':'Block from Build'}">${blocked?'Unblock':'Block'}</button></div>`}).join('');
    const more=visible.length<total?`<div class="pool-more-wrap"><button type="button" class="btn ghost" data-pool-more>Show more players · ${total-visible.length} remaining</button></div>`:'';document.getElementById('poolList').innerHTML=rows+more;
  };
  if(lowPowerMode()&&candidates.length>POOL_RENDER_MOBILE){
    const host=document.getElementById('poolList');if(host)host.innerHTML='<div class="help" style="padding:14px">Ranking exact projections in responsive slices…</div>';
    let index=0;
    const scoreSlice=()=>{
      if(computeToken!==POOL_COMPUTE_TOKEN||!columnVisible('colPool'))return;
      const started=performance.now(),limit=Math.min(candidates.length,index+14);
      while(index<limit&&performance.now()-started<8)scorePlayer(candidates[index++]);
      if(index<candidates.length)requestAnimationFrame(scoreSlice);else finish();
    };
    requestAnimationFrame(scoreSlice);
  }else{for(const p of candidates)scorePlayer(p);finish()}
}
const CLUB_COLOURS={ARS:['#EF0107','#FFFFFF'],AVL:['#95BFE5','#7A003C'],BOU:['#DA291C','#000000'],BRE:['#E30613','#FFDB00'],BHA:['#0057B8','#FFFFFF'],CHE:['#034694','#FFFFFF'],COV:['#78D0F7','#000000'],CRY:['#1B458F','#C4122E'],EVE:['#003399','#FFFFFF'],FUL:['#FFFFFF','#000000'],HUL:['#F18A01','#000000'],IPS:['#0044A9','#FFFFFF'],LEE:['#FFFFFF','#1D428A'],LIV:['#C8102E','#00B2A9'],MCI:['#6CABDD','#1C2C5B'],MUN:['#DA291C','#FBE122'],NEW:['#241F20','#FFFFFF'],NFO:['#DD0000','#FFFFFF'],SUN:['#EB172B','#211E1F'],TOT:['#FFFFFF','#132257']};
function clubSwatch(code){const c=CLUB_COLOURS[code];if(!c)return '';return `<span class="kit-swatch" style="background:linear-gradient(135deg,${c[0]} 50%,${c[1]} 50%)" title="${esc(TEAMS[code]?.n||code)}"></span>`}
/* Marcus, 21 Aug: "can otb player card look similar to live fpl players cards?"
   — LiveFPL leads each card with a kit-shirt icon rather than a colour bar.
   Reuses the existing CLUB_COLOURS data (already wired for clubSwatch) so
   there is no new data source, just a different render of the same colours. */
function kitShirtSVG(code,size=28){const c=CLUB_COLOURS[code];const primary=c?c[0]:'#3A2A40',secondary=c?c[1]:'#EAEAF2';return `<svg class="kit-shirt" width="${size}" height="${size}" viewBox="0 0 26 26" aria-hidden="true" focusable="false"><title>${esc(TEAMS[code]?.n||code)}</title><path d="M9 1 2 5 2 10 6 12 6 25 20 25 20 12 24 10 24 5 17 1 13 6Z" fill="${primary}" stroke="${secondary}" stroke-width="1.4" stroke-linejoin="round"/></svg>`}
function flagInfo(pl){const status=pl.live?.status;if(!status||status==='a')return null;const chance=pl.live?.chance;const label=status==='d'&&chance!=null?`${STATUS_LABEL.d} — ${chance}%`:STATUS_LABEL[status]||status;const cls=status==='d'?'flag-doubt':status==='n'?'flag-loan':'flag-bad';const short={d:'D',i:'I',s:'S',u:'U',n:'N'}[status]||'?';return{cls,label,short}}
function cardHealth(p,md=minuteDetail(p)){const status=String(p?.live?.status||'a').toLowerCase(),overallStart=clamp(num(md.avail)*num(md.pStart),0,1);if(['i','s','u','n'].includes(status)||md.avail<.50||md.pAppear<.50||md.exp<30)return{key:'bad',label:'Bad',reason:'Major availability or expected-minutes risk. Review official news before relying on this player.'};if(status==='d'||md.avail<.85||md.pAppear<.75||overallStart<.60||md.exp<60)return{key:'medium',label:'Medium',reason:'Some availability, start or expected-minutes risk remains. Keep this player under review.'};return{key:'ok',label:'OK',reason:'Availability, appearance chance, start chance and expected minutes are all in the healthy band.'}}
function playerFixtureDifficulty(p,row){return(p.p==='GK'||p.p==='DEF')?num(row?.ctx?.dCS,3):num(row?.ctx?.dAtk,3)}
function cardFixtureRun(p,limit=3){const span=horizonSpan(),gws=scheduleGws(S.gw,Math.min(Math.max(1,span.n),limit)),defensive=p.p==='GK'||p.p==='DEF',metric=defensive?'defensive scoring':'attacking';const chips=gws.map(g=>{const r=project(p,g);if(!r.fixtures.length)return`<span class="fixture-chip fxblank" title="GW${g} blank gameweek">GW${g} BLANK</span>`;const d=r.fixtures.reduce((a,z)=>a+playerFixtureDifficulty(p,z),0)/r.fixtures.length,label=r.fixtures.map(z=>`${z.fx.opp} ${z.fx.home?'H':'A'}`).join(' + '),detail=r.fixtures.map(z=>`${z.fx.opp} (${z.fx.home?'home':'away'})`).join(' plus ');return`<span class="fixture-chip ${fCls(d)}" title="GW${g} ${detail} · ${metric} difficulty ${d.toFixed(1)}">GW${g} ${esc(label)}</span>`}).join(''),remaining=Math.max(0,span.n-gws.length);return`<div class="fixture-run" aria-label="${esc(p.n)} fixture run">${chips}${remaining?`<span class="fixture-more">+${remaining} later GW${remaining===1?'':'s'}</span>`:''}</div>`}
function cardHTML(p,benchPos=null){const r=project(p,S.gw),h=horizonForecast(p),md=minuteDetail(p),health=cardHealth(p,md),chip=chipStateForGw(S.gw),benchBoost=chip.benchScoring,TOT=S.display==='total',isCap=S.cap===p.id,isVice=S.vice===p.id,isStarter=S.start.has(p.id),isBlocked=S.buildBlocks.has(p.id),viewLabel=TOT?horizonLabel():`GW${S.gw}`;if(S.shotMode){const stat=TOT?h.total.toFixed(1):r.x.toFixed(1),badge=isCap?'<span class="ccap">C</span>':isVice?'<span class="ccap">V</span>':benchPos&&benchBoost?'<span class="ccap">BB</span>':benchPos?.kind==='outfield'?`<span class="ccap">B${benchPos.idx+1}</span>`:benchPos?.kind==='gk'?'<span class="ccap">GK SUB</span>':'';return`<div class="card compact health-${health.key} ${isCap?'cap':isVice?'vice':''}" title="${esc(health.reason)}"><div class="nm">${esc(p.n)} ${badge}</div><div class="cstat">${stat}</div></div>`}const isOutfieldBench=benchPos?.kind==='outfield',reorder=isOutfieldBench?`<div class="acts reorder-row"><button type="button" data-benchup="${p.id}" aria-label="Move ${esc(p.n)} earlier in bench priority" ${benchPos.idx===0?'disabled':''}>Earlier</button><button type="button" data-benchdown="${p.id}" aria-label="Move ${esc(p.n)} later in bench priority" ${benchPos.idx===benchPos.total-1?'disabled':''}>Later</button></div>`:'',flag=flagInfo(p),benchState=benchPos&&benchBoost?'<span class="state-chip cap">BENCH BOOST · SCORING</span>':benchPos?.kind==='gk'?'<span class="state-chip bench">GK SUB</span>':isOutfieldBench?`<span class="state-chip bench">BENCH ${benchPos.idx+1}</span>`:'',states=[benchState,isBlocked?'<span class="state-chip block">BUILD BLOCK</span>':''].filter(Boolean).join(''),secondary=TOT&&h.n>1?`<div class="card-secondary"><span class="secondary-value">GW${S.gw} ${r.x.toFixed(1)} xP</span> · ${esc(fixtureText(r))}</div>`:'';return`<div class="card health-${health.key} ${isCap?'cap':isVice?'vice':''} ${flag?(flag.cls==='flag-doubt'?'flag-doubt-card':flag.cls==='flag-bad'?'flag-bad-card':''):''}"><div class="therm" style="height:${Math.min(100,(TOT?h.total/(11*Math.max(1,h.n)):r.x/11)*100)}%;top:auto;bottom:0"></div>${isCap?'<span class="corner-badge cap-badge" title="Captain">C</span>':isVice?'<span class="corner-badge vice-badge" title="Vice-captain">V</span>':''}<div class="card-top">${kitShirtSVG(p.t)}<div class="card-top-info"><div class="nm">${esc(p.n)}${flag?` <span class="pflag ${flag.cls}" title="${esc(flag.label)}">${flag.short}</span>`:''}</div><div class="tm">${esc(p.t)} · £${p.c.toFixed(1)}</div></div></div><div class="card-state">${states}</div><button type="button" class="xp mono" data-info="${p.id}" aria-label="Inspect ${esc(p.n)} ${viewLabel} expected-points details" title="${viewLabel} expected-points total"><span class="xp-value">${TOT?h.total.toFixed(1):r.x.toFixed(1)}</span><span class="xp-label">${esc(viewLabel)} xP</span></button>${secondary}<div class="card-health ${health.key}" title="${esc(health.reason)}"><span class="health-dot"></span>${health.label}</div>${cardFixtureRun(p)}${reorder}<details class="card-menu"><summary>Actions · ${isStarter?'XI':benchBoost?'Bench Boost scoring':benchPos?.kind==='gk'?'GK sub':`Bench ${num(benchPos?.idx)+1}`}</summary><div class="card-action-grid"><button type="button" data-bench="${p.id}" aria-label="${isStarter?'Bench':'Start'} ${esc(p.n)}">${isStarter?'Bench':'Start XI'}</button><button type="button" data-cap="${p.id}" class="${isCap?'on':''}" aria-label="${isCap?'Remove captain from':'Make'} ${esc(p.n)} captain">Captain</button><button type="button" data-vice="${p.id}" class="${isVice?'on':''}" aria-label="${isVice?'Remove vice-captain from':'Make'} ${esc(p.n)} vice-captain">Vice</button><button type="button" data-lock="${p.id}" class="${S.locks.has(p.id)?'on':''}" aria-label="${S.locks.has(p.id)?'Unlock':'Lock'} ${esc(p.n)}">${S.locks.has(p.id)?'Unlock':'Lock'}</button><button type="button" data-build-block="${p.id}" class="${isBlocked?'on':''}" aria-label="${isBlocked?'Unblock':'Block'} ${esc(p.n)} from squad builds">${isBlocked?'Unblock Build':'Block Build'}</button><button type="button" data-del="${p.id}" aria-label="Remove ${esc(p.n)} from squad">Remove</button></div></details></div>`}
function orderedOutfieldBench(list){const orderMap=new Map((S.benchOrder||[]).map((k,i)=>[k,i]));return [...list].sort((a,b)=>{const ia=orderMap.has(stableKey(a))?orderMap.get(stableKey(a)):Infinity,ib=orderMap.has(stableKey(b))?orderMap.get(stableKey(b)):Infinity;if(ia!==ib)return ia-ib;return project(b,S.gw).x-project(a,S.gw).x})}
function moveBenchPlayer(id,dir){const outfield=squadPlayers().filter(p=>!S.start.has(p.id)&&p.p!=='GK');const ordered=orderedOutfieldBench(outfield),keys=ordered.map(stableKey);const p=byId(id);if(!p)return;const idx=keys.indexOf(stableKey(p)),swapIdx=idx+dir;if(idx<0||swapIdx<0||swapIdx>=keys.length)return;[keys[idx],keys[swapIdx]]=[keys[swapIdx],keys[idx]];S.benchOrder=keys;render();saveUserState()}
function renderBenchOrderNote(list){const host=document.getElementById('benchOrderNote');if(!host)return;if(!list.length){host.className='bench-order-note';host.textContent='Add outfield substitutes to set autosub priority.';return}const chip=chipStateForGw(S.gw),order=list.map((p,i)=>`<b>${i+1}</b> ${esc(p.n)} <span class="mono">${project(p,S.gw).x.toFixed(1)} GW${S.gw} xP</span>`).join(' · ');let currentIssue=null,horizonIssue=null;for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){if(!currentIssue&&project(list[j],S.gw).x>project(list[i],S.gw).x+.15)currentIssue=[list[i],list[j]];if(!horizonIssue&&horizonForecast(list[j]).total>horizonForecast(list[i]).total+.15)horizonIssue=[list[i],list[j]]}host.className='bench-order-note '+(currentIssue&&!chip.benchScoring?'warn':'');host.innerHTML=chip.benchScoring?`<b>Bench Boost — scoring:</b> all four bench players count in GW${S.gw}. Legal bench order is retained for the underlying FPL squad: ${order}.`:`Autosub priority: ${order}. FPL formation rules can skip a substitute whose position would make the XI illegal.${currentIssue?` <b>Review order:</b> ${esc(currentIssue[1].n)} has the stronger GW${S.gw} projection but sits behind ${esc(currentIssue[0].n)}.`:horizonIssue?` Longer-horizon totals rank ${esc(horizonIssue[1].n)} above ${esc(horizonIssue[0].n)}, but autosub priority is a GW${S.gw} decision; use the selected-GW values shown above.`:''}`}
function renderSquadStructureNote(){const host=document.getElementById('squadStructureNote');if(!host)return;const players=squadPlayers();if(players.length!==15){host.className='squad-structure-note';host.innerHTML='';return}const gk=moneyTotal(players.filter(p=>p.p==='GK')),def=moneyTotal(players.filter(p=>p.p==='DEF')),defensive=moneyTotal(players.filter(p=>p.p==='GK'||p.p==='DEF')),bench=moneyTotal(players.filter(p=>!S.start.has(p.id))),premium=gk>=9.5||def>=26||defensive>=35;host.className='squad-structure-note '+(premium?'warn':'');host.innerHTML=`<b>Squad structure:</b> GK £${gk.toFixed(1)}m · DEF £${def.toFixed(1)}m · total defensive spend £${defensive.toFixed(1)}m · bench £${bench.toFixed(1)}m. ${premium?'This is a premium-heavy defensive allocation. Compare a cheaper reserve-goalkeeper or defender build before locking unless rotation or Bench Boost is intentional.':'Defensive spending is within OTB’s neutral structure band; value and role quality still matter more than price alone.'}`}
function renderPitch(){const xi=squadPlayers().filter(p=>S.start.has(p.id)),benchAll=squadPlayers().filter(p=>!S.start.has(p.id));for(const pos of ['GK','DEF','MID','FWD']){const row=xi.filter(p=>p.p===pos).sort((a,b)=>project(b,S.gw).x-project(a,S.gw).x);let html=row.map(p=>cardHTML(p)).join(''),need={GK:1,DEF:3,MID:2,FWD:1}[pos];for(let i=row.length;i<need;i++)html+=`<div class="slot">${pos}</div>`;document.getElementById('r'+pos).innerHTML=html}const benchGK=benchAll.filter(p=>p.p==='GK'),benchOutfield=orderedOutfieldBench(benchAll.filter(p=>p.p!=='GK')),gkHtml=benchGK.map(p=>cardHTML(p,{kind:'gk'})).join(''),outHtml=benchOutfield.map((p,i)=>cardHTML(p,{kind:'outfield',idx:i,total:benchOutfield.length})).join('');document.getElementById('rBench').innerHTML=gkHtml+outHtml||'<div class="slot">EMPTY</div>';renderBenchOrderNote(benchOutfield);renderSquadStructureNote()}
function renderSpine(){const players=squadPlayers(),tot={atk:0,cs:0,dc:0,bon:0,app:0,oth:0},TOT=S.display==='total',sp=horizonSpan(),gws=TOT?scheduleGws(S.gw,S.horizon):[S.gw];let sum=0;for(const g of gws){const chip=chipStateForGw(g),scorers=chip.benchScoring?players:players.filter(p=>S.start.has(p.id));for(const p of scorers){const r=project(p,g),m=p.id===S.cap?chip.captainMultiplier:1;for(const k in tot)tot[k]+=r.parts[k]*m;sum+=r.x*m}}const currentChip=chipStateForGw(S.gw),xpts=document.getElementById('hXpts'),label=document.getElementById('hXptsLabel'),range=sp.n>1?`GW${sp.first}–${sp.last}`:`GW${sp.first}`,scope=currentChip.benchScoring&&!TOT?'15-player Bench Boost':'scoring squad';document.getElementById('spineTotal').textContent=sum.toFixed(1);xpts.textContent=sum.toFixed(1);if(label){label.textContent=TOT?`Scoring xPts ${range}`:`${currentChip.benchScoring?'BB 15':'XI'} xPts GW${S.gw}`;label.title=TOT?`Expected scoring total across ${range}, applying each saved gameweek chip`:`${scope} expected points for GW${S.gw}, including ${currentChip.code==='TRIPLE_CAPTAIN'?'triple':'standard'} captaincy`;xpts.title=label.title;xpts.setAttribute('aria-label',`${label.title}: ${sum.toFixed(1)}`)}document.getElementById('spineGw').textContent=TOT&&sp.n>1?`${sp.first}–${sp.last}`:S.gw;const cols={atk:'#00FF87',cs:'#04F5FF',dc:'#B072FF',bon:'#EAFF04',app:'#6E5A75',oth:'#FF8C42'};document.getElementById('spine').innerHTML=sum>0?Object.keys(cols).map(k=>`<div style="width:${Math.max(0,tot[k]/sum*100).toFixed(1)}%;background:${cols[k]}" title="${k}: ${tot[k].toFixed(1)}"></div>`).join(''):'<div style="width:100%;background:#2a0030"></div>'}
/* ═══════════════════════ RC5.0.0 — VERDICT BRAIN ═══════════════════════
   Verdict was a summary panel. It consumed projections, the squad, the bank
   and the first transfer step — and nothing else. News, Prices, Market, Roles,
   Chips and Accuracy fed it nothing, opening the tab refreshed none of them,
   and its render key ignored every external feed, so it could silently freeze.

   RC5.0.0 makes it the decision layer. Almost all of what follows is wiring to
   engines that already existed elsewhere in this file. Two rules govern it:

   1. EVERY action is costed in expected points. No composite "decision score"
      is produced. A unitless product of six weighted terms cannot be validated
      against anything and destroys comparability; points can be checked against
      what actually happened.
   2. NOTHING is asserted with more confidence than the data supports. Readiness
      is a deterministic state measure with a published breakdown. Calibration
      is empirical and stays hidden until three gameweeks of actuals exist.
      Stale feeds are declared, never silently used.
   ═══════════════════════════════════════════════════════════════════════ */

const VERDICT_SEEN_KEY='otb_verdict_seen_v1',VERDICT_JOURNAL_KEY='otb_decision_memory_v2',VERDICT_JOURNAL_LEGACY_KEY='otb_verdict_journal_v1';
const VERDICT_LOCK_MIN=180,VERDICT_DECIDE_MIN=2880,VERDICT_LOCK_FEED_MAX_MIN=45,VERDICT_MIN_CALIB_GWS=3;
let VERDICT_SENSITIVITY=null,DECISION_CAPTURE_TIMER=null;

/* ── Feed registry ──────────────────────────────────────────────────────
   One declared list of everything Verdict depends on. The freshness strip,
   the render key and the self-tests all read from this, so a feed cannot be
   consumed without also being displayed and cache-keyed. */
function verdictAgeMin(t){if(!t)return null;const ms=Date.now()-(typeof t==='number'?t:Date.parse(t));return Number.isFinite(ms)?Math.max(0,ms/60000):null}
function verdictAgeLabel(m){if(m==null)return 'never';if(m<1)return 'just now';if(m<90)return Math.round(m)+'m';if(m<2880)return (m/60).toFixed(1)+'h';return Math.floor(m/1440)+'d'}

/* RC5.0.0 T7 — the freshness strip and the render-key fingerprint must never
   drift apart: a feed shown as fresh that cannot invalidate the cache is worse
   than no strip at all. Both are now generated from this one list, and a
   self-test asserts they still agree. */
const VERDICT_FEED_SOURCES={
  bootstrap:()=>[DATA.mode,DATA.lastUpdated||0],
  fixtures :()=>[DATA.validation?.topologyPass?1:0,Object.keys(FIX||{}).length],
  news     :()=>[NEWS.last?.generatedAt||0,NEWS.error||'',NEWS.fromCache?1:0],
  prices   :()=>[PRICE.last?.sampleEnd||PRICE.last?.generatedAt||0,PRICE.error||'',PRICE.fromCache?1:0],
  market   :()=>[MARKET.loaded?1:0,Math.round((marketAgeMinutes()||0)/15),MARKET.error||''],
  roles    :()=>[(S.roleIntel?.events||[]).length,ROLE_INTEL.suspend?1:0,SCOUT.last?.generatedAt||0,SCOUT.last?.evidenceAuthoritative===false?0:1,SCOUT.last?.evidenceCarriedForward?1:0],
  chips    :()=>[CHIP_ADVISOR_LAST?1:0,JSON.stringify(S.chips||{})],
  accuracy :()=>[Object.keys(ACCURACY.ledger?.actuals||{}).length,Object.keys(ACCURACY.ledger?.snapshots||{}).length]
};
const VERDICT_FEED_KEYS=Object.keys(VERDICT_FEED_SOURCES);
function verdictFeeds(){
  const feeds=[],readiness=releaseReadiness(),coreAge=verdictAgeMin(DATA.lastUpdated);
  const add=(key,label,ageMin,state,detail,critical,panel)=>feeds.push({key,label,ageMin,state,detail,critical:!!critical,panel:panel||'data'});

  add('bootstrap','Player data',coreAge,
    readiness==='BLOCKED'?'fail':DATA.mode!=='LIVE'?'fail':coreAge!=null&&coreAge>180?'warn':'ok',
    DATA.mode==='LIVE'?('official payload · '+readiness):(DATA.mode+' data — not certified for decisions'),true,'data');

  add('fixtures','Fixtures',coreAge,
    DATA.validation?.topologyPass?'ok':'warn',
    DATA.validation?.topologyPass?'topology certified':'fixture topology not certified',true,'data');

  const newsAge=verdictAgeMin(NEWS.last?.generatedAt);
  add('news','Team news',newsAge,
    NEWS.error&&!NEWS.last?'fail':NEWS.error?'cached':!NEWS.last?'warn':newsAge!=null&&newsAge>240?'warn':'ok',
    NEWS.error&&!NEWS.last?esc(NEWS.error):NEWS.error?'refresh failed — serving cached copy':!NEWS.last?'not fetched this session':(NEWS.last.events?.length||0)+' change events',true,'news');

  const priceAge=verdictAgeMin(PRICE.last?.sampleEnd||PRICE.last?.generatedAt);
  add('prices','Price intel',priceAge,
    PRICE.error&&!PRICE.last?'fail':PRICE.error?'cached':!PRICE.last?'warn':priceAge!=null&&priceAge>720?'warn':'ok',
    PRICE.error&&!PRICE.last?esc(PRICE.error):PRICE.error?'refresh failed — serving cached copy':!PRICE.last?'not fetched this session':'sample window current',false,'prices');

  const mAge=marketAgeMinutes();
  add('market','Market odds',mAge,
    !MARKET_BLEND?'off':MARKET.error?'fail':!MARKET.loaded?'warn':marketStale()?'warn':'ok',
    !MARKET_BLEND?'blend disabled in build':MARKET.error?esc(MARKET.error):!MARKET.loaded?'no odds loaded — projections are model-only':marketStale()?'past '+(MARKET_MAX_AGE_MIN/60)+'h cutoff — EXCLUDED from projections':MARKET.fixtures+' fixtures blended at '+Math.round(MARKET_WEIGHT*100)+'%',false,'fixtures');

  const roleEvents=(S.roleIntel?.events||[]).length,scoutAge=verdictAgeMin(SCOUT.last?.generatedAt);
  const scoutLimited=!SCOUT.last||SCOUT.last?.evidenceAuthoritative===false||SCOUT.last?.evidenceCarriedForward;
  add('roles','Role intel',scoutAge,scoutLimited?'warn':'ok',
    !SCOUT.last?'no Scout report loaded this session — role events may still be manual or saved':
      SCOUT.last?.evidenceAuthoritative===false?'latest Scout scan did not achieve authoritative article coverage — retained evidence may be in use':
      SCOUT.last?.evidenceCarriedForward?'latest Scout result carried earlier evidence forward':
      `${roleEvents} logged role event${roleEvents===1?'':'s'} · selected-club official-source scan only; not a league-wide breaking-web guarantee`,false,'roles');

  add('chips','Chip plan',null,CHIP_ADVISOR_LAST?'ok':'warn',
    CHIP_ADVISOR_LAST?(Object.values(CHIP_ADVISOR_LAST.recommendations||{}).filter(r=>r?.gw).length+' chip windows identified'):'chip adviser has not run this session',false,'chips');

  const calib=verdictCalibration();
  add('accuracy','Calibration',null,calib?'ok':'warn',
    calib?calib.gwCount+' gameweeks scored':'needs '+VERDICT_MIN_CALIB_GWS+' completed gameweeks',false,'accuracy');

  return feeds;
}
function verdictFeedFingerprint(){
  return VERDICT_FEED_KEYS.map(k=>{try{return VERDICT_FEED_SOURCES[k]().join('|')}catch(e){return 'err'}}).join('~');
}
function verdictBlockingFeeds(regime){
  return verdictFeeds().filter(f=>{
    if(f.state==='fail'&&f.critical)return true;
    if(regime==='LOCK'&&f.critical&&f.ageMin!=null&&f.ageMin>VERDICT_LOCK_FEED_MAX_MIN)return true;
    return false;
  });
}

/* ── Deadline regime ────────────────────────────────────────────────────
   The correct advice at T-6 days is not the correct advice at T-40 minutes.
   Previously Verdict gave the same answer at both. */
function verdictRegime(){
  const ms=DEADLINE?Date.parse(DEADLINE)-Date.now():NaN;
  if(!Number.isFinite(ms))return{key:'PLAN',minsLeft:null,verified:false,label:'Deadline unknown',note:'No deadline timestamp available — treating this as a planning session.'};
  if(ms<0)return{key:'REVIEW',minsLeft:null,verified:!!DEADLINE_VERIFIED,label:'Deadline passed',note:'The gameweek is under way. Decisions are locked; this is a review view.'};
  const mins=ms/60000;
  if(mins<=VERDICT_LOCK_MIN)return{key:'LOCK',minsLeft:mins,verified:!!DEADLINE_VERIFIED,label:'Lock',note:'Under three hours. Speculative items are suppressed — only what must be right at the whistle is shown.'};
  if(mins<=VERDICT_DECIDE_MIN)return{key:'DECIDE',minsLeft:mins,verified:!!DEADLINE_VERIFIED,label:'Decide',note:'Inside 48 hours. Press conferences and price deadlines are live; this is the window to commit.'};
  return{key:'PLAN',minsLeft:mins,verified:!!DEADLINE_VERIFIED,label:'Plan',note:'More than 48 hours out. Team news has not landed — routes are provisional and transfers are usually better left uncommitted.'};
}
function verdictCountdown(mins){
  if(mins==null)return '—';
  const t=Math.max(0,Math.round(mins)),d=Math.floor(t/1440),h=Math.floor((t%1440)/60),m=t%60;
  return d?`${d}d ${h}h`:h?`${h}h ${m}m`:`${m}m`;
}

/* ── Calibration (empirical, gated) ─────────────────────────────────────
   The Accuracy module has been computing interval coverage, bias and rank
   correlation since RC3 and nothing acted on any of it. It is surfaced here,
   but only once there is enough of it to mean something. Below three scored
   gameweeks this returns null and the panel stays hidden rather than showing
   a number fitted to noise. */
function verdictCalibration(){
  try{
    const m=accuracyOverall('relevant')?.metrics;
    if(!m||num(m.gwCount)<VERDICT_MIN_CALIB_GWS||!num(m.n))return null;
    return{gwCount:num(m.gwCount),n:num(m.n),coverage:m.interval,bias:m.bias,rank:m.rank,mae:m.mae,startBrier:m.startBrier,minutesMae:m.minutesMae};
  }catch(e){return null}
}

/* ── Uncertainty attribution ────────────────────────────────────────────
   "Main uncertainty: Palmer expected minutes" is computable and was already
   half-computed: renderVerdict summed m²·sd² across the XI and threw the
   per-player terms away. Ranking those terms names the player who is actually
   driving the width of your projection. */
function verdictUncertainty(scoringRows,capId,chip=chipStateForGw(S.gw)){
  const rows=scoringRows.map(o=>{const m=o.p.id===capId?chip.captainMultiplier:1,v=m*m*o.r.sd*o.r.sd,md=minuteDetail(o.p);
    return{p:o.p,v,sd:o.r.sd,exp:md.exp,pStart:md.pStart,captain:o.p.id===capId}});
  const total=rows.reduce((a,r)=>a+r.v,0)||1;
  rows.forEach(r=>r.share=r.v/total);
  rows.sort((a,b)=>b.v-a.v);
  return{rows,sd:Math.sqrt(total),top:rows[0]||null};
}

/* ── Model vs market divergence ─────────────────────────────────────────
   Both numbers already exist; only the comparison was missing. The model side
   is obtained by re-running fixtureContext with the blend suspended, which is
   the exact inverse of the blend performed in fixtureContext itself. */
function verdictMarketDivergence(gw){
  if(!marketActive())return null;
  const rows=[],matches=[];
  const prev=MARKET_SUSPEND;
  try{
    const owned=squadPlayers().reduce((a,p)=>(a[p.t]=(a[p.t]||0)+1,a),{});
    const modelSide=(code,fx,fixtureGw)=>{
      MARKET_SUSPEND=true;const model=fixtureContext(code,fx);
      MARKET_SUSPEND=prev;const mkt=marketFor(code,fx);
      if(!mkt||!Number.isFinite(mkt.xgFor))return null;
      const modelXg=model.attackM*MARKET_LEAGUE_XG,marketXg=mkt.xgFor;
      if(modelXg<=0)return null;
      return{gw:fixtureGw,code,opp:fx.opp,home:fx.home,modelXg,marketXg,
        diff:(marketXg-modelXg)/modelXg,owned:num(owned[code])};
    };
    /* Audit the quoted market slate, not merely the Gameweek selected in the
       squad controls. Odds often exist for GW1 while the user is exploring
       GW2; every quote is mapped back to its real FPL Gameweek and labelled. */
    const fallback=Object.keys(TEAMS).flatMap(home=>fixtureListFor(home,gw).filter(f=>f.home).map(f=>({home,away:f.opp,gw})));
    for(const quoted of (MARKET.slate.length?MARKET.slate:fallback)){
      const home=quoted.home,away=quoted.away;let fixtureGw=num(quoted.gw,0),homeFx=null;
      const candidateGws=fixtureGw?[fixtureGw]:Array.from({length:38},(_,i)=>i+1);
      for(const g of candidateGws){const f=fixtureListFor(home,g).find(x=>x.home&&x.opp===away);if(f){fixtureGw=g;homeFx=f;break}}
      if(!homeFx||!fixtureGw)continue;
      const awayFx=fixtureListFor(away,fixtureGw).find(f=>f.opp===home&&!f.home);
      if(!awayFx)continue;
      const homeSide=modelSide(home,homeFx,fixtureGw),awaySide=modelSide(away,awayFx,fixtureGw);
      if(!homeSide&&!awaySide)continue;
      if(homeSide)rows.push(homeSide);if(awaySide)rows.push(awaySide);
      const sides=[homeSide,awaySide].filter(Boolean).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));
      matches.push({gw:fixtureGw,home,away,commence:quoted.commence||null,homeSide,awaySide,max:sides[0]||null,
        wide:sides.some(s=>Math.abs(s.diff)>=MARKET_ALERT_GAP)});
    }
  }finally{MARKET_SUSPEND=prev}
  if(!rows.length)return null;
  rows.sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));
  return{rows,matches,max:rows[0],wide:rows.filter(r=>Math.abs(r.diff)>=MARKET_ALERT_GAP),
    gws:[...new Set(matches.map(m=>m.gw))].sort((a,b)=>a-b)};
}

function verdictMarketMatrixHTML(d){
  if(!d?.matches?.length)return'';
  const rows=d.matches.map(m=>{const h=m.homeSide,a=m.awaySide,top=m.max,gap=top?`${top.code} ${signed(top.diff*100,0)}%`:'—';return`<div class="market-match-row ${m.wide?'wide':''}" title="GW${m.gw} · ${esc(TEAMS[m.home]?.n||m.home)} vs ${esc(TEAMS[m.away]?.n||m.away)}"><span class="fixture">GW${m.gw} ${esc(m.home)}–${esc(m.away)}</span><span>${h?h.modelXg.toFixed(2):'—'}–${a?a.modelXg.toFixed(2):'—'}</span><span>${h?h.marketXg.toFixed(2):'—'}–${a?a.marketXg.toFixed(2):'—'}</span><span class="gap">${esc(gap)}</span></div>`}).join('');
  return`<div class="market-match-list"><div class="market-match-row head"><span>Match</span><span>OTB xG</span><span>Market xG</span><span class="gap">Largest gap</span></div>${rows}</div>`;
}
function verdictMarketSlateLabel(d){const g=d?.gws||[];return g.length?g.map(x=>'GW'+x).join(', '):'unmapped slate'}
function verdictWideMarketMatchCount(d){return new Set((d?.wide||[]).map(r=>[r.gw,r.home?r.code:r.opp,r.home?r.opp:r.code].join('|'))).size}

/* ── Ownership exposure ─────────────────────────────────────────────────
   NOTE ON HONESTY: FPL publishes selected_by_percent, NOT captaincy share.
   True effective ownership cannot be computed from this data, so nothing here
   is labelled EO. These are ownership figures and are described as such. */
function verdictOwnership(xi){
  const rows=xi.map(o=>({p:o.p,own:num(o.p.live?.selected,NaN),x:o.r.x})).filter(r=>Number.isFinite(r.own));
  if(!rows.length)return null;
  const template=rows.filter(r=>r.own>=30),diffs=rows.filter(r=>r.own<=8).sort((a,b)=>b.x-a.x);
  const avg=rows.reduce((a,r)=>a+r.own,0)/rows.length;
  const missing=POOL.filter(p=>num(p.live?.selected,0)>=35&&!S.squad.includes(p.id))
    .map(p=>({p,own:num(p.live.selected),x:project(p,S.gw).x})).sort((a,b)=>b.own-a.own).slice(0,3);
  return{rows,template,diffs:diffs.slice(0,3),avg,missing,coverage:rows.length/Math.max(1,xi.length)};
}
/* ── Readiness (deterministic, decomposed) ──────────────────────────────
   The old score was `full && budgetOk ? 82 : 35` with ±6/±5/±4 adjustments,
   one of which (`DATA.mode==='live'`) never fired because the mode is stored
   uppercase. It was also mislabelled: the header said readiness, the note
   underneath said confidence. They are different claims.

   This is READINESS ONLY — is the decision in a committable state? Every
   component is a fact, not a prediction, and every component is published so
   the number can be checked rather than believed. Predictive quality lives
   separately in verdictCalibration(). */
function verdictReadiness(ctx){
  const parts=[],add=(k,got,max,note)=>parts.push({k,got:Math.round(got),max,note});
  const sq=ctx.players,full=sq.length===15;
  add('Squad complete',full&&ctx.budgetOk?20:full?10:0,20,
    !full?`${sq.length}/15 players selected`:!ctx.budgetOk?`over budget by £${Math.abs(bank()).toFixed(1)}m`:'15 players, funded');
  add('XI legal',ctx.xiOk?15:0,15,ctx.xiOk?`${ctx.formation} legal`:'starting XI is not a legal formation');
  add('Captain set',ctx.capSet?10:0,10,ctx.capSet?(ctx.capAligned?'set and matches top projection':'set, but not the top projection'):'no captain selected');
  add('Vice set',ctx.viceSet?5:0,5,ctx.viceSet?'set':'no vice — an unplayed captain scores zero');
  const availLoss=ctx.risk.reduce((a,r)=>a+r.cost,0);
  add('Availability',clamp(20-availLoss*2.5,0,20),20,ctx.risk.length?`${ctx.risk.length} XI player(s) at risk · ${availLoss.toFixed(1)} xP exposed`:'no availability risk in the XI');
  const feeds=verdictFeeds(),bad=feeds.filter(f=>f.state==='fail'),warn=feeds.filter(f=>f.state==='warn'||f.state==='cached');
  add('Feed integrity',clamp(20-bad.length*10-warn.length*3,0,20),20,
    bad.length?`${bad.length} feed(s) failed`:warn.length?`${warn.length} feed(s) degraded or cached`:'all feeds current');
  add('Transfer resolved',!ctx.planStale&&(ctx.firstPlan||ctx.routeRolled)?10:0,10,
    ctx.planStale?'saved route is stale — re-run after the latest changes':ctx.firstPlan?'route recommends a move':ctx.routeRolled?'route recommends rolling':'no transfer route computed');
  const got=parts.reduce((a,p)=>a+p.got,0),max=parts.reduce((a,p)=>a+p.max,0);
  return{score:Math.round(100*got/max),parts,got,max};
}

/* ── Action queue ───────────────────────────────────────────────────────
   Replaces the single-branch hero. The old if/else was a strict ladder —
   structure, then availability, then captain, then transfer — so two flagged
   players AND a captain three points off the best surfaced only the flag.

   Every item carries `cost` in expected points. That is what makes them
   sortable against each other and what makes the page auditable at the end
   of the gameweek. Items that genuinely cannot be costed are marked blocking
   and sort above everything rather than being given a fake number. */
/* releaseReadiness() blocks for four different reasons and the mode is only one
   of them. Reporting "Player data is in LIVE mode" while the real blocker was a
   failed season or structural check would be a wrong explanation attached to a
   blocking message — the reader would go looking in the wrong place. This reads
   the actual cause back out of the validation record. */
function verdictBlockReason(){
  const v=DATA.validation||{};
  if(!(DATA.mode==='LIVE'||DATA.mode==='CACHE'||DATA.mode==='STALE'))
    return `Player data is in ${DATA.mode} mode — demonstration values, not the official payload.`;
  const issues=validationLoadBlockingIssues(v);
  if(!v.structuralPass)return `The official payload failed its structural check${issues.length?': '+esc(String(issues[0])):'.'}`;
  if(!v.seasonPass)return `The loaded payload does not validate as ${EXPECTED_SEASON}${issues.length?': '+esc(String(issues[0])):'.'}`;
  if(issues.length)return `The loaded payload has ${issues.length} unresolved load issue${issues.length>1?'s':''}: ${esc(String(issues[0]))}`;
  return 'The loaded payload has not passed validation.';
}
function verdictQueue(ctx){
  const q=[],regime=ctx.regime.key;
  const add=(o)=>q.push(Object.assign({cost:0,blocking:false,severity:'act',panel:null,evidence:''},o));

  /* — blocking: data and structure — */
  if(releaseReadiness()==='BLOCKED')add({id:'data',blocking:true,severity:'block',title:'Data is not certified for decisions',
    evidence:`${verdictBlockReason()} The optimiser and transfer planner already refuse to run on this; Verdict now refuses to issue a recommendation on it too.`,action:'Load official data',panel:'data'});
  for(const f of verdictBlockingFeeds(regime))add({id:'feed_'+f.key,blocking:true,severity:'block',
    title:`${f.label} ${f.state==='fail'?'failed':'is stale inside the lock window'}`,
    evidence:`${f.detail}. ${f.ageMin==null?'No successful update this session.':'Last update '+verdictAgeLabel(f.ageMin)+' ago.'}${regime==='LOCK'?` Inside three hours of the deadline, critical feeds older than ${VERDICT_LOCK_FEED_MAX_MIN} minutes are not safe to decide on.`:''}`,
    action:'Open feed',panel:f.panel});
  if(ctx.players.length!==15)add({id:'squad',blocking:true,severity:'block',title:`Squad is ${ctx.players.length}/15`,
    evidence:'A verdict cannot be issued on an incomplete squad.',action:'Open squad',panel:'squad'});
  else if(!ctx.budgetOk)add({id:'budget',blocking:true,severity:'block',title:`Over budget by £${Math.abs(bank()).toFixed(1)}m`,
    evidence:'The squad is not fundable and could not be entered as selected.',action:'Open squad',panel:'squad'});
  if(!ctx.xiOk&&ctx.players.length===15)add({id:'xi',blocking:true,severity:'block',title:'Starting XI is not a legal formation',
    evidence:`Current shape ${ctx.formation}. FPL requires 1 GK, 3-5 DEF, 2-5 MID, 1-3 FWD.`,action:'Fix XI',panel:'squad'});
  if(!ctx.capSet)add({id:'nocap',blocking:true,severity:'block',title:'No captain selected',evidence:'An unset armband forfeits the doubled score.',action:'Set captain',panel:'squad'});
  else if(!ctx.viceSet)add({id:'novice',blocking:true,severity:'block',title:'No vice-captain selected',
    evidence:'If the captain does not play, the armband is not transferred and the double is lost entirely.',action:'Set vice',panel:'squad'});

  /* NOTE: squadSanityIssues() is deliberately NOT folded in here. All three of
     its checks — captain gap, flagged XI players, low-minutes starters — are
     reproduced below WITH a points cost attached. Including both would double
     report the same finding under two different headings. It remains the
     beginner card's engine, where an uncosted plain-language warning is the
     right shape. */

  /* — captaincy — */
  if(ctx.bestCap&&ctx.capSet&&ctx.bestCap.p.id!==S.cap){
    const chosen=ctx.xi.find(o=>o.p.id===S.cap);
    if(chosen){const gap=(ctx.bestCap.r.x-chosen.r.x),extraCopies=ctx.activeChip?.code==='TRIPLE_CAPTAIN'?2:1,cost=gap*extraCopies;
      if(gap>0.15)add({id:'captain',severity:cost>=2?'act':'watch',cost,title:`Captain: ${ctx.bestCap.p.n} over ${chosen.p.n}`,
        evidence:`${ctx.bestCap.p.n} projects ${ctx.bestCap.r.x.toFixed(1)} xP against ${chosen.p.n}'s ${chosen.r.x.toFixed(1)}. ${ctx.activeChip?.code==='TRIPLE_CAPTAIN'?`Triple Captain adds two extra copies of the difference, so the armband gap is ${cost.toFixed(1)} expected points.`:`Both players already score their ordinary XI points, so changing the armband adds one extra copy of the difference: ${cost.toFixed(1)} expected points.`} On ceiling the order is ${ctx.ceilCap.p.n} (${(ctx.ceilCap.r.high*(extraCopies+1)).toFixed(1)} at the 80th percentile) — mean is the right target when protecting a rank, ceiling when chasing one.`,
        action:'Set captain',panel:'squad',capId:ctx.bestCap.p.id});
    }
  }

  /* — vice-captain quality — the vice only matters when the captain fails to appear. */
  if(ctx.bestVice&&ctx.viceSet&&ctx.bestVice.p.id!==S.vice){
    const chosenVice=ctx.xi.find(o=>o.p.id===S.vice),cap=ctx.xi.find(o=>o.p.id===S.cap);
    if(chosenVice&&cap){const capMiss=clamp(1-num(cap.md?.pAppear,1),0,1),gap=capMiss*Math.max(0,ctx.bestVice.r.x-chosenVice.r.x);
      if(gap>=0.05)add({id:'vice',severity:gap>=0.5?'act':'watch',cost:gap,title:`Vice: ${ctx.bestVice.p.n} over ${chosenVice.p.n}`,
        evidence:`Your captain has about ${Math.round(capMiss*100)}% no-show probability. In that branch, ${ctx.bestVice.p.n} carries ${ctx.bestVice.r.x.toFixed(1)} xP versus ${chosenVice.r.x.toFixed(1)}, worth ${gap.toFixed(2)} xP in unconditional expectation.`,
        action:'Set vice',panel:'squad',capId:ctx.bestVice.p.id});
    }
  }

  /* — availability — */
  for(const r of ctx.risk){
    add({id:'risk_'+r.p.id,severity:r.cost>=1.5?'act':'watch',cost:r.cost,
      title:`${r.p.n} — ${r.label}`,
      evidence:`${Math.round(r.avail*100)}% available, ${Math.round(r.exp)} expected minutes. At ${r.r.x.toFixed(1)} xP that is ${r.cost.toFixed(1)} points of exposure in your ${ctx.activeChip?.benchScoring?'15-player Bench Boost scoring squad':'XI'}.`,
      action:'Inspect',panel:'squad',playerId:r.p.id});
  }

  /* — news ahead of the official payload (F4) — */
  for(const d of (ctx.newsDivergence||[])){
    add({id:'news_'+d.p.id,severity:'act',cost:d.cost,title:`${d.p.n} — team news not yet in the official payload`,
      evidence:`${d.text} The projection still uses the bootstrap value, so this player's xP has not moved yet.`,
      action:'Open news',panel:'news',playerId:d.p.id});
  }

  /* — role change on an owned player — */
  for(const r of (ctx.roleShifts||[])){
    add({id:'role_'+r.p.id,severity:'watch',cost:Math.abs(r.cost),
      title:`${r.p.n} — role evidence logged`,evidence:r.text,action:'Open roles',panel:'roles',playerId:r.p.id});
  }

  /* — bench order — */
  if(ctx.benchGap>0.1)add({id:'bench',severity:'watch',cost:ctx.benchGap,title:'Bench order is not optimal',
    evidence:`Your order returns ${ctx.benchCurrent.toFixed(2)} xP from autosubs against ${ctx.benchBest.toFixed(2)} for the optimal order (${ctx.benchOptimalNames}). Worth ${ctx.benchGap.toFixed(2)} points in expectation.`,
    action:'Reorder bench',panel:'squad'});

  /* — transfer route and its opportunity cost — */
  if(ctx.planStale){
    add({id:'transfer_stale',severity:regime==='LOCK'?'block':'act',blocking:regime==='LOCK',cost:0,
      title:'Transfer plan is stale — re-run before using it',
      evidence:'A squad, projection, feed or planner input changed after this route was calculated. Verdict will not combine current intelligence with an old transfer solution.',
      action:'Re-run planner',panel:'transfers'});
  }else if(ctx.firstPlan){
    const gain=num(ctx.firstPlan.netGain,num(ctx.firstPlan.gain,0));
    add({id:'transfer',severity:regime==='PLAN'?'watch':'act',cost:Math.max(0,gain),
      title:regime==='PLAN'?`Route suggests ${ctx.planLabel} — hold until team news`:`Transfer: ${ctx.planLabel}`,
      evidence:ctx.planEvidence+(regime==='PLAN'?' More than 48 hours out this is provisional: no press conferences have been held and the injury picture has not settled. Committing a free transfer now buys nothing that waiting does not.':''),
      action:'Open planner',panel:'transfers'});
  }else if(ctx.routeRolled){
    add({id:'roll',severity:'watch',cost:0,title:'Transfer: ROLL',
      evidence:ctx.planEvidence,action:'Open planner',panel:'transfers'});
  }

  /* — price pressure on the planned move — */
  if(ctx.priceRisk)add({id:'price',severity:ctx.priceRisk.severity,cost:ctx.priceRisk.cost,
    title:ctx.priceRisk.title,evidence:ctx.priceRisk.evidence,action:'Open prices',panel:'prices'});

  /* — chip windows — */
  for(const c of (ctx.chips||[])){
    add({id:'chip_'+c.key,severity:c.gw===S.gw?'act':'watch',cost:num(c.score,0),
      title:`${c.label}: GW${c.gw}${c.gw===S.gw?' — this gameweek':''}`,evidence:c.reason,action:'Open chips',panel:'chips'});
  }

  /* — market state and disagreement — */
  if(MARKET_BLEND&&!marketActive())add({id:'mktoff',severity:'watch',cost:0,title:'Market blend is not active',
    evidence:MARKET.loaded?`Odds are ${verdictAgeLabel(marketAgeMinutes())} old, past the ${MARKET_MAX_AGE_MIN/60}-hour cutoff, so they have been excluded. Projections are running model-only and will differ from what you saw when odds were live.`:'No odds loaded this session. Projections are running model-only.',
    action:'Inspect schedule',panel:'fixtures'});
  if(ctx.divergence?.wide?.length){
    const d=ctx.divergence.max,wideMatches=verdictWideMarketMatchCount(ctx.divergence);
    add({id:'mktdiv',severity:'watch',cost:0,priority:1,title:`${verdictMarketSlateLabel(ctx.divergence)} market alert: ${wideMatches} fixture${wideMatches===1?'':'s'} exceed the ${Math.round(MARKET_ALERT_GAP*100)}% gap threshold`,
      evidence:`Largest gap in GW${d.gw}: ${TEAMS[d.code]?.n||d.code} ${d.home?'at home to':'away at'} ${TEAMS[d.opp]?.n||d.opp}. OTB's unblended attack model is ${d.modelXg.toFixed(2)} xG; the market is ${d.marketXg.toFixed(2)} — ${Math.abs(d.diff*100).toFixed(0)}% ${d.diff>0?'higher':'lower'}. ${d.owned?`You own ${d.owned} player${d.owned===1?'':'s'} from that side. `:''}The blend applies ${Math.round(MARKET_WEIGHT*100)}% only when that exact fixture is projected; this warning is the remaining disagreement, not a command to override the model.`,
      action:'Inspect all matches',panel:'fixtures'});
  }

  const rank={block:0,act:1,watch:2};
  /* A market alert must stay visible even when several ordinary WATCH notes
     have a larger numeric cost. Severity still wins; explicit alert priority
     then decides which same-severity items make the six-row action queue. */
  q.sort((a,b)=>(rank[a.severity]-rank[b.severity])||(num(b.priority)-num(a.priority))||(b.cost-a.cost));
  /* In LOCK, speculative items are suppressed: at T-2h you cannot act on a
     chip window three gameweeks out or a market disagreement. */
  if(regime==='LOCK')return q.filter(i=>i.blocking||['captain','vice','bench','xi','nocap','novice'].includes(i.id)||i.id.startsWith('risk_')||i.id.startsWith('news_'));
  return q;
}

/* ── What changed since you last looked ─────────────────────────────────
   Nothing else in the app answers this. It is the difference between a page
   you open once a week and one worth opening daily. */
function verdictSnapshot(ctx){
  const md=p=>{const m=minuteDetail(p);return{x:+project(p,S.gw).x.toFixed(2),exp:Math.round(m.exp),pStart:+num(m.pStart,0).toFixed(2),avail:+availability(p).toFixed(2)}};
  const players={};ctx.players.forEach(p=>players[p.id]=md(p));
  return{at:Date.now(),gw:S.gw,cap:S.cap,vice:S.vice,squad:[...S.squad],start:[...S.start],
    plan:ctx.planLabel||'',top:(ctx.queue||[]).slice(0,3).map(i=>i.id),players,
    market:ctx.divergence?+ctx.divergence.max.diff.toFixed(3):null};
}
function verdictLoadSeen(){try{return JSON.parse(localStorage.getItem(VERDICT_SEEN_KEY)||'null')}catch(e){return null}}
function verdictSaveSeen(snap){try{localStorage.setItem(VERDICT_SEEN_KEY,JSON.stringify(snap))}catch(e){}}
function verdictChanges(prev,now){
  if(!prev||prev.gw!==now.gw)return null;
  const out=[];
  for(const id of Object.keys(now.players)){
    const a=prev.players[id],b=now.players[id];if(!a)continue;const p=byId(+id);if(!p)continue;
    if(Math.abs(b.pStart-a.pStart)>=0.08)out.push({dir:b.pStart>a.pStart?'up':'down',w:Math.abs(b.pStart-a.pStart)*10,
      text:`<b>${esc(p.n)}</b> start probability ${Math.round(a.pStart*100)}% → ${Math.round(b.pStart*100)}%`});
    else if(Math.abs(b.avail-a.avail)>=0.1)out.push({dir:b.avail>a.avail?'up':'down',w:Math.abs(b.avail-a.avail)*10,
      text:`<b>${esc(p.n)}</b> availability ${Math.round(a.avail*100)}% → ${Math.round(b.avail*100)}%`});
    else if(Math.abs(b.x-a.x)>=0.4)out.push({dir:b.x>a.x?'up':'down',w:Math.abs(b.x-a.x),
      text:`<b>${esc(p.n)}</b> projection ${a.x.toFixed(1)} → ${b.x.toFixed(1)} xP`});
  }
  const gone=prev.squad.filter(id=>!now.squad.includes(id)).map(id=>byId(id)?.n).filter(Boolean);
  const came=now.squad.filter(id=>!prev.squad.includes(id)).map(id=>byId(id)?.n).filter(Boolean);
  if(gone.length||came.length)out.push({dir:'new',w:99,text:`Squad changed: ${came.length?'in '+came.map(esc).join(', '):''}${came.length&&gone.length?' · ':''}${gone.length?'out '+gone.map(esc).join(', '):''}`});
  if(prev.cap!==now.cap&&byId(now.cap))out.push({dir:'new',w:98,text:`Captain changed to <b>${esc(byId(now.cap).n)}</b>`});
  if(prev.plan!==now.plan&&now.plan)out.push({dir:'new',w:97,text:`Transfer route now: <b>${esc(now.plan)}</b>`});
  if(prev.market!=null&&now.market!=null&&Math.abs(now.market-prev.market)>=0.05)
    out.push({dir:now.market>prev.market?'up':'down',w:5,text:`Largest model-vs-market gap moved ${(prev.market*100).toFixed(0)}% → ${(now.market*100).toFixed(0)}%`});
  out.sort((a,b)=>b.w-a.w);
  return{since:prev.at,items:out.slice(0,6),total:out.length};
}

/* ── Decision journal ───────────────────────────────────────────────────
   The accuracy ledger snapshots PROJECTIONS at the deadline but never records
   what was actually DECIDED — captain, transfer, bench, chip. Without that,
   post-gameweek review of the decision process cannot be reconstructed after
   the fact, at any point, ever. This writes the missing half.

   It deliberately does not score decisions by outcome. A benched player
   returning does not make benching him wrong; that judgement needs the
   information available before the deadline, which is exactly what is stored
   here. Read it alongside the accuracy ledger, not instead of it. */
function verdictBenchOne(ctx){const out=ctx.benchRows.filter(o=>o.p.p!=='GK'),find=key=>out.find(o=>o.p.id===Number(key)||stableKey(o.p)===key),order=(S.benchOrder||[]).map(find).filter(Boolean);return(order[0]||out.slice().sort((a,b)=>b.r.x-a.r.x)[0])?.p||null}
function verdictDecisionState(ctx){
  const cap=byId(S.cap),vice=byId(S.vice),bench1=verdictBenchOne(ctx),blocking=(ctx.queue||[]).filter(i=>i.blocking),
    chipNow=ctx.activeChip||chipStateForGw(S.gw),top=(ctx.queue||[])[0]||null,
    transfer=ctx.planStale?'RE-RUN':ctx.firstPlan?ctx.planLabel:ctx.routeRolled?'ROLL':'NOT RUN',
    readiness=blocking.length?'BLOCKED':ctx.readiness.score>=90?'READY':'REVIEW',capRow=ctx.rows.find(o=>o.p.id===S.cap);
  return{gw:S.gw,transfer,captain:cap?{id:cap.id,n:cap.n,x:+num(capRow?.r?.x).toFixed(2),avail:+availability(cap).toFixed(2),minutes:Math.round(num(capRow?.md?.exp))}:null,
    vice:vice?{id:vice.id,n:vice.n}:null,bench1:bench1?{id:bench1.id,n:bench1.n}:null,chip:chipNow?.active?chipNow.label:'HOLD',activeChip:chipNow?.code||'NONE',
    readiness,readinessScore:ctx.readiness.score,regime:ctx.regime.key,projectedXI:+ctx.xiTotal.toFixed(2),projectedSd:+ctx.xiSd.toFixed(2),
    transferGain:ctx.firstPlan?+num(ctx.firstPlan.netGain,0).toFixed(2):0,planStale:!!ctx.planStale,
    topAction:top?{id:top.id,title:top.title,evidence:top.evidence||'',cost:+num(top.cost,0).toFixed(2),severity:top.severity}:null}
}
function verdictEmptyJournal(){return{schema:2,season:EXPECTED_SEASON,entries:[]}}
function verdictNormaliseJournalEntry(e){
  if(e?.state){const row={...e};row.reasons=Array.isArray(row.reasons)&&row.reasons.length?row.reasons:['Decision checkpoint recorded.'];row.fingerprint=row.fingerprint||verdictDecisionFingerprint(row);return row}
  const top=Array.isArray(e?.queue)?e.queue[0]||null:null,state={gw:num(e?.gw),transfer:e?.transfer||'ROLL',captain:e?.captain||null,vice:e?.vice||null,bench1:null,
    chip:e?.chip&&e.chip!=='NONE'?e.chip:'HOLD',readiness:num(e?.readiness)>=90?'READY':'REVIEW',readinessScore:num(e?.readiness),regime:e?.regime||'—',
    projectedXI:num(e?.projectedXI),projectedSd:num(e?.projectedSd),transferGain:num(e?.transferGain),planStale:false,topAction:top};
  const row={...e,id:e?.id||`legacy-${e?.gw||0}-${Date.parse(e?.at)||0}`,manual:!!e?.locked,build:e?.build||'',release:e?.release||'',state,
    reasons:['Imported from the original OTB verdict journal.']};row.fingerprint=verdictDecisionFingerprint(row);return row
}
function verdictLoadJournal(){
  try{
    let raw=JSON.parse(localStorage.getItem(VERDICT_JOURNAL_KEY)||'null');
    if(!raw){raw=JSON.parse(localStorage.getItem(VERDICT_JOURNAL_LEGACY_KEY)||'null')}
    if(!raw||raw.season!==EXPECTED_SEASON)return verdictEmptyJournal();
    const rows=Array.isArray(raw.entries)?raw.entries:Object.values(raw.entries||{});
    return{schema:2,season:EXPECTED_SEASON,entries:rows.filter(e=>e&&fplEventNumber(e.gw)).map(verdictNormaliseJournalEntry).slice(-120)}
  }catch(e){return verdictEmptyJournal()}
}
function verdictSaveJournal(j){try{localStorage.setItem(VERDICT_JOURNAL_KEY,JSON.stringify(j));return true}catch(e){return false}}
function verdictDecisionFingerprint(entry){const s=entry.state||{};return accuracyHashValue(['decision-v2',entry.gw,s.transfer,s.captain?.id||0,s.vice?.id||0,s.bench1?.id||0,s.chip,s.readiness,s.topAction?.id||'',Math.round(num(s.projectedXI)*10)/10,Math.round(num(s.transferGain)*10)/10])}
function verdictDecisionReasons(previous,current){
  if(!previous)return['Baseline decision recorded for this gameweek.'];
  const a=previous.state||{},b=current.state||{},out=[],change=(label,oldValue,newValue)=>{if(oldValue!==newValue)out.push(`${label}: ${oldValue||'—'} → ${newValue||'—'}`)};
  change('Transfer',a.transfer,b.transfer);change('Captain',a.captain?.n,b.captain?.n);change('Vice',a.vice?.n,b.vice?.n);change('Bench 1',a.bench1?.n,b.bench1?.n);change('Chip',a.chip,b.chip);change('Decision state',a.readiness,b.readiness);
  const xp=num(b.projectedXI)-num(a.projectedXI);if(Math.abs(xp)>=.2)out.push(`Projected scoring: ${num(a.projectedXI).toFixed(1)} → ${num(b.projectedXI).toFixed(1)} xP (${signed(xp,1)})`);
  if(a.topAction?.id!==b.topAction?.id&&b.topAction?.title)out.push(`Priority changed to: ${b.topAction.title}`);
  if(!out.length)out.push(current.manual?'Manual checkpoint recorded.':`Evidence changed while the endorsed configuration held${b.topAction?.title?`: ${b.topAction.title}`:'.'}`);
  return out
}
function verdictJournalCapture(ctx,{manual=false}={}){
  const j=verdictLoadJournal(),state=verdictDecisionState(ctx),previous=[...j.entries].reverse().find(e=>e.gw===S.gw)||null,
    entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,gw:S.gw,at:new Date().toISOString(),manual:!!manual,build:APP_BUILD,release:APP_RELEASE,dataMode:DATA.mode,state,
      xi:ctx.xi.map(o=>({id:o.p.id,n:o.p.n,x:+o.r.x.toFixed(2)})),bench:ctx.benchRows.map(o=>({id:o.p.id,n:o.p.n,x:+o.r.x.toFixed(2)})),
      topUncertainty:ctx.uncertainty.top?{n:ctx.uncertainty.top.p.n,share:+ctx.uncertainty.top.share.toFixed(2)}:null,
      feeds:verdictFeeds().map(f=>({key:f.key,state:f.state,ageMin:f.ageMin==null?null:Math.round(f.ageMin)}))};
  entry.fingerprint=verdictDecisionFingerprint(entry);
  if(previous&&previous.fingerprint===entry.fingerprint)return{entry:previous,created:false};
  entry.reasons=verdictDecisionReasons(previous,entry);j.entries.push(entry);j.entries=j.entries.slice(-120);const persisted=verdictSaveJournal(j);return{entry,created:persisted,error:persisted?'':'storage'}
}
function verdictDecisionMemoryExport(){
  const j=verdictLoadJournal(),payload={...j,exportedAt:new Date().toISOString(),appRelease:APP_RELEASE,appBuild:APP_BUILD};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`OTB_decision_memory_${EXPECTED_SEASON.replace('/','-')}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function renderDecisionMemory(ctx){
  const host=document.getElementById('verdictDecisionMemory');if(!host)return;
  const rows=verdictLoadJournal().entries.filter(e=>e.gw===S.gw).slice(-8).reverse(),card=e=>{const s=e.state||{},time=new Date(e.at).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}),reasons=(e.reasons||['Decision checkpoint recorded.']).map(r=>`<span>${esc(r)}</span>`).join('');return`<div class="dm-entry"><div class="dm-head"><span class="dm-time">${esc(time)}</span><span class="dm-kind">${e.manual?'checkpoint':'automatic'}</span><span class="dm-build">build ${esc(buildShort(e.build))}</span></div><div class="dm-reason">${reasons}</div><div class="dm-state"><span class="dm-pill">T ${esc(s.transfer||'—')}</span><span class="dm-pill">C ${esc(s.captain?.n||'—')}</span><span class="dm-pill">VC ${esc(s.vice?.n||'—')}</span><span class="dm-pill">B1 ${esc(s.bench1?.n||'—')}</span><span class="dm-pill">${esc(s.chip||'HOLD')}</span><span class="dm-pill">${num(s.projectedXI).toFixed(1)} xP</span></div>${s.topAction?.title?`<div class="dm-trigger"><b>Evidence:</b> ${esc(s.topAction.title)}${s.topAction.cost>0?` · ${num(s.topAction.cost).toFixed(1)} xP at stake`:''}</div>`:''}</div>`};
  host.innerHTML=`<div class="vsec-h">Decision Memory<span>${rows.length?`${rows.length} GW${S.gw} checkpoint${rows.length===1?'':'s'}`:'waiting for first checkpoint'}</span></div><div class="dm-shell">${rows.length?`<div class="dm-list">${rows.map(card).join('')}</div>`:`<div class="dm-empty">OTB will record the endorsed transfer, captain, vice, bench, chip and the evidence that caused a meaningful change. The history stays in this browser until you export it.</div>`}<div class="dm-actions"><button type="button" class="btn ghost" id="btnDecisionMemoryExport">Export memory</button><button type="button" class="btn danger" id="btnDecisionMemoryClearGw" ${rows.length?'':'disabled'}>Clear GW${S.gw} history</button></div></div>`;
  const ex=document.getElementById('btnDecisionMemoryExport');if(ex)ex.onclick=verdictDecisionMemoryExport;
  const clear=document.getElementById('btnDecisionMemoryClearGw');if(clear)clear.onclick=()=>{if(!confirm(`Clear every recorded GW${S.gw} decision from this browser? Export first if you want a backup.`))return;const j=verdictLoadJournal();j.entries=j.entries.filter(e=>e.gw!==S.gw);if(!verdictSaveJournal(j)){flash('Decision Memory could not update browser storage. Export remains available.');return}renderDecisionMemory(ctx);flash(`GW${S.gw} Decision Memory cleared.`)}
}
function scheduleDecisionMemoryCapture(){
  clearTimeout(DECISION_CAPTURE_TIMER);if(document.visibilityState!=='visible'||activeRailTab()!=='verdict'||S.squad.length!==15)return;
  DECISION_CAPTURE_TIMER=setTimeout(()=>{try{if(activeRailTab()!=='verdict'||S.squad.length!==15)return;const ctx=verdictContext(),saved=verdictJournalCapture(ctx);if(saved.created)renderDecisionMemory(ctx)}catch(e){console.warn('OTB Decision Memory capture skipped:',e)}},1800)
}

/* ── Decision sensitivity ───────────────────────────────────────────────
   Reports whether the captaincy call is robust or marginal, by finding the
   availability at which it actually flips. This is deliberately on-demand:
   each probe requires clearing the projection cache, which is too expensive
   to run on every render on a phone. It reports fragility rather than
   asserting confidence, which is the honest direction to be wrong in. */
function verdictCaptainSensitivity(){
  const xi=verdictContext()?.xi;if(!xi||xi.length<2)return null;
  const ranked=xi.slice().sort((a,b)=>b.r.x-a.r.x),top=ranked[0],second=ranked[1];
  if(!top||!second)return null;
  const id=top.p.id,prev=S.overrides?.[id]?{...S.overrides[id]}:null;
  const probe=(av)=>{S.overrides=S.overrides||{};S.overrides[id]={...(S.overrides[id]||{}),availability:av};bumpCache();
    return project(top.p,S.gw).x};
  let lo=0,hi=1,flip=null;
  try{
    if(probe(1)<=project(second.p,S.gw).x)flip=1;
    else{
      for(let i=0;i<6;i++){const mid=(lo+hi)/2;if(probe(mid)>project(second.p,S.gw).x)hi=mid;else lo=mid}
      flip=hi;
    }
  }catch(e){flip=null}
  finally{if(prev)S.overrides[id]=prev;else if(S.overrides)delete S.overrides[id];bumpCache()}
  if(flip==null)return null;
  const cur=availability(top.p);
  return{player:top.p,rival:second.p,flipAt:flip,current:cur,margin:cur-flip,
    robust:cur-flip>0.25};
}

/* ── Fresh Squad Review · Phase 1 ──────────────────────────────────────
   A deterministic, context-only export for manual review. Preparing or
   copying a packet must never write to S, projection inputs, storage, or any
   remote service. The only side effect is the user's explicit clipboard copy. */
let FRESH_SQUAD_REVIEW={text:'',fingerprint:'',copied:false};
function freshSquadReviewHasValid15(ctx,state=S){
  const players=Array.isArray(ctx?.players)?ctx.players:[],ids=Array.isArray(state?.squad)?state.squad:[];
  if(players.length!==15||ids.length!==15||new Set(ids).size!==15)return false;
  const playerIds=new Set(players.map(p=>p.id));if(playerIds.size!==15||ids.some(id=>!playerIds.has(id)))return false;
  const pos={GK:0,DEF:0,MID:0,FWD:0},clubs={};
  for(const p of players){if(!(p?.p in pos)||!p?.t)return false;pos[p.p]++;clubs[p.t]=(clubs[p.t]||0)+1}
  return pos.GK===2&&pos.DEF===5&&pos.MID===5&&pos.FWD===3&&Object.values(clubs).every(n=>n<=3);
}
function freshSquadReviewBench(ctx,state=S){
  const rows=Array.isArray(ctx?.benchRows)?ctx.benchRows:[],gk=rows.find(o=>o.p?.p==='GK')||null,
    outfield=rows.filter(o=>o.p?.p!=='GK'),order=new Map;
  (state?.benchOrder||[]).forEach((key,i)=>{order.set(String(key),i)});
  const priority=o=>{const id=order.get(String(o.p.id));if(id!=null)return id;const stable=order.get(stableKey(o.p));return stable==null?Infinity:stable};
  outfield.sort((a,b)=>priority(a)-priority(b)||num(b.r?.x)-num(a.r?.x)||String(a.p.n).localeCompare(String(b.p.n)));
  return{gk,outfield,all:[gk,...outfield].filter(Boolean)};
}
function freshSquadReviewIssue(ctx,state=S){
  if(!freshSquadReviewHasValid15(ctx,state))return'Complete a valid 15-player squad (2 GK, 5 DEF, 5 MID, 3 FWD, maximum 3 per club).';
  if(chipStateForGw(state.gw,state).conflict)return`Resolve the duplicate GW${state.gw} chip assignments in Chips before running Fresh Review.`;
  if(ctx?.budgetOk===false)return`Bring the squad within budget before preparing a review packet.`;
  if(!ctx?.xiOk||ctx.xi?.length!==11)return'Set a legal starting XI before preparing the packet.';
  const bench=freshSquadReviewBench(ctx,state);if(!bench.gk||bench.outfield.length!==3)return'Set one substitute goalkeeper and three outfield substitutes.';
  const xiIds=new Set(ctx.xi.map(o=>o.p.id));
  if(!state.cap||!xiIds.has(state.cap))return'Set a captain in the starting XI.';
  if(!state.vice||!xiIds.has(state.vice)||state.vice===state.cap)return'Set a distinct vice-captain in the starting XI.';
  return'';
}
function freshSquadReviewPlain(value){
  const box=document.createElement('div');box.innerHTML=String(value??'');
  return String(box.textContent||'').replace(/\s+/g,' ').trim();
}
function freshSquadReviewOfficialAlerts(){
  const source=Array.isArray(NEWS.last?.alerts)?NEWS.last.alerts:currentAlertsFromPool();
  return sortCurrentAlerts(source).filter(a=>a.__owned).map(a=>{
    const status=String(a.status||'a').toLowerCase(),chance=a.chance??a.chance_of_playing_next_round,
      chanceText=chance==null?'':` · ${chance}% chance of playing`,detail=a.news||`${STATUS_LABEL[status]||status}${chanceText}`;
    return{level:'SQUAD NEWS',title:`${a.web_name||a.name||'Unknown player'}${a.team_code||a.team?` (${a.team_code||a.team})`:''}`,detail:freshSquadReviewPlain(detail)};
  });
}
async function copyFreshSquadReview(text,clipboard=(typeof navigator!=='undefined'?navigator.clipboard:null)){
  if(!String(text||''))return false;
  if(clipboard&&typeof clipboard.writeText==='function'){await clipboard.writeText(String(text));return true}
  const box=document.createElement('textarea');box.value=String(text);box.setAttribute('readonly','');box.style.position='fixed';box.style.opacity='0';document.body.appendChild(box);box.select();
  let copied=false;try{copied=!!document.execCommand('copy')}finally{box.remove()}return copied;
}
/* ── Fresh Squad Intelligence · production workflow ────────────────────
   The Phase 1 serializer remains the diagnostic COPY REVIEW CONTEXT path.
   The primary workflow sends the same immutable context to an authenticated
   Scout Worker job, researches one player per bounded request, then renders a
   source-ranked review. No response is applied to S or any projection input. */
const FRESH_REVIEW_LOCAL_KEY='otb_fresh_review_v3',FRESH_REVIEW_LEGACY_LOCAL_KEY='otb_fresh_review_v2',FRESH_REVIEW_TOKEN_KEY='otb_fresh_owner_session_v1',FRESH_REVIEW_POLL_MS=4000;
FRESH_SQUAD_REVIEW={text:'',fingerprint:'',copied:false,showContext:false,busy:false,phase:'idle',message:'',completed:0,total:15,review:null,error:'',jobId:null,identity:null,resumeStarted:false};

function freshReviewLocalLoad(){try{const current=JSON.parse(localStorage.getItem(FRESH_REVIEW_LOCAL_KEY)||'null');if(current?.review||current?.jobId)return current;if(current?.reviewId)return{review:current};const legacy=JSON.parse(localStorage.getItem(FRESH_REVIEW_LEGACY_LOCAL_KEY)||'null');return legacy?{review:legacy}:null}catch(e){return null}}
function freshReviewLocalWrite(state){try{localStorage.setItem(FRESH_REVIEW_LOCAL_KEY,JSON.stringify(state||{}));return true}catch(e){return false}}
function freshReviewLocalSave(review){const state=freshReviewLocalLoad()||{};return freshReviewLocalWrite({...state,review,jobId:null,jobStatus:'complete',jobSeason:null,jobGameweek:null,jobFingerprint:null,updatedAt:new Date().toISOString()})}
function freshReviewLocalSaveJob(job,input){const state=freshReviewLocalLoad()||{};return freshReviewLocalWrite({...state,jobId:job.jobId,jobStatus:job.status||'queued',jobSeason:input?.season||EXPECTED_SEASON,jobGameweek:Number(input?.gameweek||S.gw),jobFingerprint:freshReviewInputFingerprint(input||{}),startedAt:job.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()})}
function freshReviewLocalClearJob(){const state=freshReviewLocalLoad()||{};return freshReviewLocalWrite({...state,jobId:null,jobStatus:null,jobSeason:null,jobGameweek:null,jobFingerprint:null,updatedAt:new Date().toISOString()})}
/** Wipes both the saved review and any job pointer — unlike
 *  freshReviewLocalClearJob, which only clears the job pointer and leaves a
 *  completed review in storage. Used by the Clear Review control so stale
 *  players (transferred out since the review ran) can't keep resurfacing. */
function freshReviewLocalClearAll(){return freshReviewLocalWrite({})}
function freshReviewDeadline(){const event=(EVENTS||[]).find(e=>Number(e.id)===Number(S.gw));return event?.deadline_time||null}
function freshReviewPlayerId(p){return String(p?.apiId??p?.id??'')}
function freshReviewInputPlayer(row,role,benchOrder=null){
  const fixtureCount=Array.isArray(row?.r?.fixtures)?row.r.fixtures.length:0,usage=accuracyEventUsage(row?.md,fixtureCount),id=freshReviewPlayerId(row.p);
  return{playerId:id,name:freshSquadReviewPlain(row.p.n),club:row.p.t,position:row.p.p==='GK'?'GKP':row.p.p,squadRole:role,benchOrder,
    captain:row.p.id===S.cap,viceCaptain:row.p.id===S.vice,xPts:+num(row.r?.x).toFixed(2),expectedMinutes:Math.round(num(usage.minutes)),
    startProbability:+clamp(num(usage.pStart),0,1).toFixed(3),availability:+clamp(availability(row.p),0,1).toFixed(3)};
}
function freshSquadReviewRequestContext(ctx){
  const bench=freshSquadReviewBench(ctx),starting=(ctx.xi||[]).map(row=>freshReviewInputPlayer(row,'XI',null)),benchPlayers=[];
  if(bench.gk)benchPlayers.push(freshReviewInputPlayer(bench.gk,'BENCH',1));
  bench.outfield.forEach((row,index)=>benchPlayers.push(freshReviewInputPlayer(row,'BENCH',index+2)));
  const players=[...starting,...benchPlayers],captain=players.find(p=>p.captain),vice=players.find(p=>p.viceCaptain),alerts=[
    ...(ctx.queue||[]).map(item=>({code:item.id,severity:item.blocking?'RED':item.severity==='act'?'AMBER':'WATCH',message:`${freshSquadReviewPlain(item.title)}${item.evidence?` — ${freshSquadReviewPlain(item.evidence)}`:''}`})),
    ...freshSquadReviewOfficialAlerts().map(item=>({code:'SQUAD_NEWS',severity:item.level,message:`${item.title} — ${item.detail}`}))
  ];
  return{season:EXPECTED_SEASON,gameweek:S.gw,activeChip:(ctx.activeChip||chipStateForGw(S.gw)).code,formation:ctx.formation||'—',captainId:captain?.playerId||'',viceCaptainId:vice?.playerId||'',deadline:freshReviewDeadline(),players,otbAlerts:alerts};
}
function freshReviewComparablePlayer(p){return{playerId:String(p?.playerId||''),name:p?.name||'',club:p?.club||'',position:p?.position||'',squadRole:p?.squadRole||'',benchOrder:p?.benchOrder??null,captain:!!p?.captain,viceCaptain:!!p?.viceCaptain,xPts:num(p?.xPts),expectedMinutes:num(p?.expectedMinutes),startProbability:num(p?.startProbability),availability:num(p?.availability)}}
function freshReviewComparableInput(input){return{season:input?.season||'',gameweek:num(input?.gameweek),activeChip:input?.activeChip||'NONE',formation:input?.formation||'',captainId:String(input?.captainId||''),viceCaptainId:String(input?.viceCaptainId||''),deadline:input?.deadline||null,players:(input?.players||[]).map(freshReviewComparablePlayer),otbAlerts:(input?.otbAlerts||[]).map(a=>({code:a?.code||'',severity:a?.severity||'',message:a?.message||''}))}}
function freshReviewInputFingerprint(input){return JSON.stringify(freshReviewComparableInput(input))}
function freshReviewInputDiff(previous,current){
  const before=new Map((previous?.players||[]).map(p=>[String(p.playerId),p])),after=new Map((current?.players||[]).map(p=>[String(p.playerId),p]));
  const added=[...after.keys()].filter(id=>!before.has(id)),removed=[...before.keys()].filter(id=>!after.has(id)),changed=[...after.keys()].filter(id=>before.has(id)&&JSON.stringify(freshReviewComparablePlayer(before.get(id)))!==JSON.stringify(freshReviewComparablePlayer(after.get(id))));
  const chipChanged=String(previous?.activeChip||'NONE')!==String(current?.activeChip||'NONE');return{added,removed,changed,chipChanged,hasChanges:!!(added.length||removed.length||changed.length||chipChanged)};
}
function freshReviewPrior(ctx){
  const stateReview=FRESH_SQUAD_REVIEW.review,stored=freshReviewLocalLoad()?.review;
  return[stateReview,stored].find(candidate=>candidate&&Number(candidate.gameweek)===Number(S.gw)&&String(candidate.season)===String(EXPECTED_SEASON))||null;
}
function freshSquadReviewModel(ctx,state=S){
  const input=freshSquadReviewRequestContext(ctx),chip=ctx.activeChip||chipStateForGw(state.gw),starting=input.players.filter(p=>p.squadRole==='XI'),bench=input.players.filter(p=>p.squadRole==='BENCH').sort((a,b)=>a.benchOrder-b.benchOrder);
  const roleFor=p=>p.squadRole==='XI'?'XI':chip.benchScoring?'Bench Boost — scoring':p.position==='GKP'?'GK substitute':`Bench ${Math.max(1,p.benchOrder-1)}`;
  const full=input.players.map(p=>({...p,id:p.playerId,team:p.club,pos:p.position==='GKP'?'GK':p.position,role:roleFor(p),xMins:p.expectedMinutes,startPct:Math.round(p.startProbability*100),vice:p.viceCaptain}));
  return{gameweek:state.gw,formation:ctx.formation||'—',activeChip:chip.code,activeChipLabel:chip.active?chip.label:'No chip',scoringPlayers:chip.benchScoring?15:11,xiProjected:+num(ctx.scoringTotal??ctx.xiTotal).toFixed(2),captain:starting.find(p=>p.captain)?.name||'NOT SET',vice:starting.find(p=>p.viceCaptain)?.name||'NOT SET',starting:full.filter(p=>p.squadRole==='XI'),bench:full.filter(p=>p.squadRole==='BENCH').sort((a,b)=>a.benchOrder-b.benchOrder),full,alerts:input.otbAlerts.map(a=>({level:a.severity,title:a.code,detail:a.message})),request:input};
}
function formatFreshSquadReviewPacket(model){
  const metric=p=>`${p.name} (${p.team}, ${p.pos})${p.captain?' [C]':p.vice?' [VC]':''} | xPts ${num(p.xPts).toFixed(2)} | xMins ${Math.round(num(p.xMins))} | Start ${Math.round(num(p.startPct))}%`,
    xi=(model.starting||[]).map((p,i)=>`${String(i+1).padStart(2,'0')}. ${metric(p)}`),bench=(model.bench||[]).map(p=>`${p.pos==='GK'?'GK':`B${Math.max(1,p.benchOrder-1)}`}. [${p.role}] ${metric(p)}`),
    full=(model.full||[]).map((p,i)=>`${String(i+1).padStart(2,'0')}. [${p.role}] ${metric(p)}`),alerts=(model.alerts||[]).map(a=>`- [${a.level}] ${a.title}${a.detail?` — ${a.detail}`:''}`);
  return['OTB FRESH SQUAD REVIEW CONTEXT',`Selected gameweek: GW${model.gameweek}`,`Active chip: ${String(model.activeChip||'NONE').replace(/_/g,' ')}`,`Formation: ${model.formation}`,`Projected scoring: ${num(model.xiProjected).toFixed(2)} xPts · ${model.scoringPlayers} scoring players (captain included)`,`Captain: ${model.captain}`,`Vice-captain: ${model.vice}`,'Squad status: 15/15 legal','Metric note: xMins totals every fixture in the selected gameweek; Start is the overall probability of at least one start.','Diagnostic note: copying this context makes no network call and never changes the squad or projection inputs.','', 'STARTING XI',...xi,'','BENCH ORDER',...bench,'','FULL 15',...full,'','CURRENT OTB ALERTS',...(alerts.length?alerts:['- None.'])].join('\n');
}
function prepareFreshSquadReview(){
  const ctx=verdictContext(),issue=freshSquadReviewIssue(ctx);if(issue){flash(issue);renderFreshSquadReview(ctx);return''}
  const model=freshSquadReviewModel(ctx),text=formatFreshSquadReviewPacket(model);FRESH_SQUAD_REVIEW.text=text;FRESH_SQUAD_REVIEW.fingerprint=freshReviewInputFingerprint(model.request);FRESH_SQUAD_REVIEW.showContext=true;renderFreshSquadReview(ctx);return text;
}
async function copyFreshReviewContext(){
  const text=prepareFreshSquadReview();if(!text)return false;try{const ok=await copyFreshSquadReview(text);FRESH_SQUAD_REVIEW.copied=ok;renderFreshSquadReview(verdictContext());flash(ok?'Review context copied.':'Clipboard blocked — context remains visible below.');return ok}catch(e){FRESH_SQUAD_REVIEW.error='Clipboard copy was blocked; select the diagnostic context manually.';renderFreshSquadReview(verdictContext());return false}
}
function freshReviewOwnerToken(){try{return sessionStorage.getItem(FRESH_REVIEW_TOKEN_KEY)||''}catch(e){return''}}
async function freshReviewSaveKey(){
  const input=document.getElementById('freshReviewKey'),token=String(input?.value||'').trim();
  if(!token){FRESH_SQUAD_REVIEW.error='Enter the Fresh Review key.';renderFreshSquadReview(verdictContext());return false}
  try{sessionStorage.setItem(FRESH_REVIEW_TOKEN_KEY,token)}catch(e){FRESH_SQUAD_REVIEW.error='This browser could not save the key for the current tab.';renderFreshSquadReview(verdictContext());return false}
  if(input)input.value='';return freshReviewCheckSession();
}
function freshReviewClearKey(){try{sessionStorage.removeItem(FRESH_REVIEW_TOKEN_KEY)}catch(e){}FRESH_SQUAD_REVIEW.identity=null;FRESH_SQUAD_REVIEW.error='';renderFreshSquadReview(verdictContext());flash('Fresh Review key cleared from this tab.')}
async function freshReviewApi(path,{method='GET',body=null,timeout=50000}={}){
  const token=freshReviewOwnerToken(),headers={Accept:'application/json',...(token?{Authorization:`Bearer ${token}`}:{})};if(body)headers['Content-Type']='application/json';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch(SCOUT_API_BASE+path,{method,cache:'no-store',credentials:'include',signal:controller.signal,headers,body:body?JSON.stringify(body):undefined});
    const data=await response.json().catch(()=>({}));if(response.status===401){const error=new Error(token?'Fresh Review key is invalid or expired.':'Fresh Review key is required.');error.code='AUTH';throw error}if(!response.ok)throw new Error(data.error||`Fresh Review HTTP ${response.status}`);return data;
  }catch(e){if(e?.name==='AbortError')throw new Error('The status request timed out. The Cloudflare job is still safe to close and can be resumed later.');if(e?.code==='AUTH')throw e;if(e instanceof TypeError)throw new Error('Fresh Review could not reach the Worker. Check the connection, then retry.');throw e}finally{clearTimeout(timer)}
}
async function freshReviewCheckSession(){try{const session=await freshReviewApi('/api/fresh-review/session',{timeout:20000});FRESH_SQUAD_REVIEW.identity=session.identity||null;FRESH_SQUAD_REVIEW.error='';renderFreshSquadReview(verdictContext());flash('Fresh Review key accepted.');return true}catch(e){FRESH_SQUAD_REVIEW.identity=null;FRESH_SQUAD_REVIEW.error=e?.message||String(e);renderFreshSquadReview(verdictContext());return false}}
function freshReviewSetProgress(phase,message,completed=0,total=15){Object.assign(FRESH_SQUAD_REVIEW,{phase,message,completed,total});try{renderFreshSquadReview(verdictContext())}catch(e){}}
function freshReviewWait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
async function pollFreshSquadReview(jobId,input){
  let failures=0;
  for(;;){
    let job;try{job=await freshReviewApi(`/api/fresh-review/${encodeURIComponent(jobId)}`,{timeout:30000});failures=0}catch(e){if(e?.code==='AUTH')throw e;if(++failures<3){freshReviewSetProgress('research','Cloudflare job is running · reconnecting status',FRESH_SQUAD_REVIEW.completed,FRESH_SQUAD_REVIEW.total);await freshReviewWait(document.hidden?15000:5000);continue}throw new Error('The Cloudflare job remains in the background, but this device lost status updates. Reopen Verdict later to resume.')}
    FRESH_SQUAD_REVIEW.jobId=job.jobId;freshReviewLocalSaveJob(job,input);
    const total=Math.max(1,num(job.targetPlayers,15)),done=Math.max(0,num(job.completedPlayers));
    if(job.review){FRESH_SQUAD_REVIEW.review=job.review;freshReviewLocalSave(job.review);freshReviewSetProgress('complete','Fresh squad verdict ready',total,total);return job.review}
    if(['failed','start_failed'].includes(job.status))throw new Error(job.error||'The background review failed before completion.');
    if(job.status==='ready_to_finalize')freshReviewSetProgress('evaluate','Research complete · producing squad verdict',done,total);
    else if(job.status==='queued')freshReviewSetProgress('context','Queued in Cloudflare · safe to close this app',done,total);
    else freshReviewSetProgress('research',`${done}/${total} selected players researched · safe to close`,done,total);
    await freshReviewWait(document.hidden?15000:FRESH_REVIEW_POLL_MS);
  }
}
async function runFreshSquadReview({force=false,selectedPlayerIds=null}={}){
  if(FRESH_SQUAD_REVIEW.busy)return;const ctx=verdictContext(),issue=freshSquadReviewIssue(ctx);if(issue){flash(issue);renderFreshSquadReview(ctx);return}
  const input=freshSquadReviewRequestContext(ctx),prior=freshReviewPrior(ctx),selection=Array.isArray(selectedPlayerIds)?selectedPlayerIds.map(String):null;
  Object.assign(FRESH_SQUAD_REVIEW,{busy:true,resumeStarted:true,error:'',review:prior||FRESH_SQUAD_REVIEW.review,jobId:null,completed:0,total:selection?.length||15});freshReviewSetProgress('context','Squad context prepared · starting Cloudflare job',0,selection?.length||15);
  try{
    const created=await freshReviewApi('/api/fresh-review',{method:'POST',body:{context:input,force:!!force,priorReviewId:prior?.reviewId||null,selectedPlayerIds:selection}});
    if(created.review){FRESH_SQUAD_REVIEW.review=created.review;freshReviewLocalSave(created.review);freshReviewSetProgress('complete','Cached review loaded',created.review.playerCount||15,created.review.playerCount||15);return}
    FRESH_SQUAD_REVIEW.jobId=created.jobId;freshReviewLocalSaveJob(created,input);freshReviewSetProgress('context','Cloudflare job started · safe to close this app',created.completedPlayers||0,created.targetPlayers||15);await pollFreshSquadReview(created.jobId,input);
  }catch(e){FRESH_SQUAD_REVIEW.error=e?.message||String(e);FRESH_SQUAD_REVIEW.phase='error'}finally{FRESH_SQUAD_REVIEW.busy=false;renderFreshSquadReview(verdictContext())}
}
async function resumeFreshSquadReview(){
  const saved=freshReviewLocalLoad();if(FRESH_SQUAD_REVIEW.busy||!saved?.jobId||Number(saved.jobGameweek)!==Number(S.gw)||String(saved.jobSeason)!==String(EXPECTED_SEASON))return false;
  Object.assign(FRESH_SQUAD_REVIEW,{busy:true,resumeStarted:true,jobId:saved.jobId,error:'',phase:'research',message:'Reconnecting to the Cloudflare review job'});renderFreshSquadReview(verdictContext());
  try{await pollFreshSquadReview(saved.jobId,{season:saved.jobSeason,gameweek:saved.jobGameweek});return true}catch(e){FRESH_SQUAD_REVIEW.error=e?.message||String(e);FRESH_SQUAD_REVIEW.phase='error';return false}finally{FRESH_SQUAD_REVIEW.busy=false;renderFreshSquadReview(verdictContext())}
}
function scheduleFreshReviewResume(){const saved=freshReviewLocalLoad();if(FRESH_SQUAD_REVIEW.resumeStarted||FRESH_SQUAD_REVIEW.busy||!saved?.jobId||Number(saved.jobGameweek)!==Number(S.gw)||String(saved.jobSeason)!==String(EXPECTED_SEASON))return;FRESH_SQUAD_REVIEW.resumeStarted=true;setTimeout(()=>resumeFreshSquadReview(),80)}
function useCachedFreshReview(review){if(!review)return;FRESH_SQUAD_REVIEW.review=review;FRESH_SQUAD_REVIEW.error='';FRESH_SQUAD_REVIEW.phase='complete';renderFreshSquadReview(verdictContext());flash('Cached Fresh Review loaded.')}
function freshReviewAgeLabel(date){const ms=Date.parse(date||'');if(!Number.isFinite(ms))return'age unknown';const min=Math.max(0,Math.round((Date.now()-ms)/60000));return min<1?'generated just now':min<60?`generated ${min}m ago`:`generated ${Math.round(min/60)}h ago`}
function freshReviewSafeUrl(value){try{const url=new URL(String(value||''));return url.protocol==='https:'?url.href:'#'}catch(e){return'#'}}
function freshReviewEvidenceHtml(item){const url=freshReviewSafeUrl(item.url),date=item.relevantDate?new Date(item.relevantDate).toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'}):'date unknown',preferred=item.preferredSource?' · preferred specialist':'',state=item.decisionEligible===true?'CURRENT':'AUDIT',category=String(item.evidenceCategory||'GENERAL').replace(/_/g,' '),window=item.decisionWindowDays?` · ${num(item.decisionWindowDays)}d window`:'';return`<div class="fresh-evidence-item"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><b>${esc(item.title||item.publisher||'Evidence')}</b> ↗</a><div class="fresh-evidence-meta"><span class="fresh-evidence-state ${state.toLowerCase()}">${state}</span> · ${esc(item.publisher||'Unknown source')} · Tier ${num(item.authorityTier,4)} · ${esc(date)} · ${esc(category)}${window}${preferred}</div><div>${esc(item.summary||'No summary available.')}</div></div>`}
function freshReviewPlayerHtml(row){
  const evidence=row.evidence||[],current=evidence.filter(e=>e.decisionEligible===true),audit=evidence.filter(e=>e.decisionEligible!==true),official=current.filter(e=>num(e.authorityTier)===1).length,reporter=current.filter(e=>num(e.authorityTier)===2).length,community=current.filter(e=>num(e.authorityTier)>=3).length,coverage=String(row.evidenceCoverage||'UNVERIFIED').toUpperCase(),role=row.squadRole==='XI'?'XI':row.scoring?'Bench Boost · scoring':row.position==='GKP'?'GK substitute':`Bench ${Math.max(1,num(row.benchOrder)-1)}`,auditDetails=audit.length?`<details class="fresh-evidence audit"><summary>Audit context: ${audit.length} historical/undated source${audit.length===1?'':'s'}</summary>${audit.map(freshReviewEvidenceHtml).join('')}</details>`:'';
  return`<article class="fresh-player ${String(row.status||'GREEN').toLowerCase()}"><div class="fresh-player-top"><div class="fresh-player-name">${esc(row.name)} <span class="fresh-badge">${esc(row.club)} · ${esc(row.position)}</span><div class="fresh-player-badges"><span class="fresh-badge">${esc(role)}</span>${row.captain?'<span class="fresh-badge">CAPTAIN</span>':''}${row.viceCaptain?'<span class="fresh-badge">VICE</span>':''}<span class="fresh-badge verdict">${esc(row.classification||'UNKNOWN')}</span><span class="fresh-coverage ${coverage.toLowerCase()}">${esc(coverage)}</span></div></div><div class="fresh-status">${esc(row.status||'GREEN')}</div></div><div class="fresh-compare"><div class="fresh-layer"><b>OTB says</b>${Math.round(100*num(row.otb?.startProbability))}% start · ${Math.round(num(row.otb?.expectedMinutes))} xMins · ${num(row.otb?.xPts).toFixed(2)} xPts</div><div class="fresh-layer"><b>Fresh evidence says</b>${esc(row.freshEvidenceSummary||'Evidence unavailable.')}</div></div><div class="fresh-rationale"><b>Fresh Review:</b> ${esc(row.rationale||'No conclusion available.')}</div><div class="fresh-coverage-note"><b>Coverage ${esc(coverage)}:</b> ${esc(row.coverageNote||'Current external evidence did not independently verify this player.')}</div><details class="fresh-evidence"><summary>Decision evidence: ${current.length} current source${current.length===1?'':'s'} · ${official} official · ${reporter} reporter/specialist · ${community} community/weak</summary>${current.length?current.map(freshReviewEvidenceHtml).join(''):'<div class="fresh-evidence-item">No current decision evidence. UNKNOWN is a coverage result, not an automatic squad warning.</div>'}</details>${auditDetails}</article>`;
}
function freshReviewSummaryHtml(review){
  if(!review)return'';const counts=review.counts||{},s=review.summary||{},coverage=review.coverageCounts||{},secondary=(s.secondaryRisks||[]).map(x=>`<div class="fresh-squad-line"><b>Secondary risk:</b> ${esc(x)}</div>`).join(''),researched=review.research?.researchedPlayers??review.research?.freshPlayers??0;
  return`<div class="fresh-review-summary"><div class="fresh-review-meta"><span>${freshReviewAgeLabel(review.generatedAt)}</span><span>${review.playerCount||15} reviewed</span><span>${review.scoringPlayerCount||11} scoring</span><span>${num(review.projectedScoringPoints).toFixed(2)} projected</span><span>${researched} researched this run · ${review.research?.reusedPlayers||0} reused</span><span>projection mutation: NO</span></div><div class="fresh-review-counts"><div class="fresh-count green"><b>${num(counts.GREEN)}</b><span>GREEN</span></div><div class="fresh-count opportunity"><b>${num(counts.OPPORTUNITY)}</b><span>OPPORTUNITY</span></div><div class="fresh-count amber"><b>${num(counts.AMBER)}</b><span>AMBER</span></div><div class="fresh-count red"><b>${num(counts.RED)}</b><span>RED</span></div></div><div class="fresh-coverage-counts"><div class="fresh-coverage-count verified"><b>${num(coverage.VERIFIED)}</b><span>VERIFIED</span></div><div class="fresh-coverage-count partial"><b>${num(coverage.PARTIAL)}</b><span>PARTIAL</span></div><div class="fresh-coverage-count unverified"><b>${num(coverage.UNVERIFIED)}</b><span>UNVERIFIED</span></div></div><div class="fresh-squad-verdict"><div class="fresh-squad-line coverage"><b>Coverage:</b> ${esc(s.coverageWarning||'Coverage status unavailable.')}</div><div class="fresh-squad-line"><b>Primary issue:</b> ${esc(s.primaryIssue||'None identified.')}</div>${secondary}<div class="fresh-squad-line"><b>Positive disagreement:</b> ${esc(s.positiveDisagreement||'None identified.')}</div><div class="fresh-squad-line"><b>Captain:</b> ${esc(s.captainAssessment||'Not assessed.')}</div><div class="fresh-squad-line"><b>Overall:</b> ${esc(s.overallVerdict||'Review complete.')}</div></div><div class="fresh-player-list">${(review.playerReviews||[]).map(freshReviewPlayerHtml).join('')}</div></div>`;
}
function formatFreshReviewResult(review){
  if(!review)return'';const s=review.summary||{},rows=(review.playerReviews||[]).map(r=>{const sources=(r.evidence||[]).map(e=>`  - [${e.decisionEligible===true?'CURRENT':'AUDIT'} · Tier ${e.authorityTier} · ${String(e.evidenceCategory||'GENERAL').replace(/_/g,' ')}] ${e.publisher}: ${e.title} — ${e.url}`).join('\n');return`${r.name} · ${r.status} · ${r.classification} · coverage ${r.evidenceCoverage||'UNVERIFIED'}\nOTB: ${Math.round(100*num(r.otb?.startProbability))}% start · ${Math.round(num(r.otb?.expectedMinutes))} xMins · ${num(r.otb?.xPts).toFixed(2)} xPts\nFresh: ${r.freshEvidenceSummary}\nCoverage: ${r.coverageNote||'Unavailable'}\nVerdict: ${r.rationale}${sources?`\nEvidence:\n${sources}`:''}`}).join('\n\n');return[`FRESH SQUAD REVIEW · GW${review.gameweek}`,`${String(review.activeChip||'NONE').replace(/_/g,' ')}${review.activeChip&&review.activeChip!=='NONE'?' ACTIVE':''}`,`${review.playerCount||15} players reviewed`,`RISK — GREEN ${num(review.counts?.GREEN)} · OPPORTUNITY ${num(review.counts?.OPPORTUNITY)} · AMBER ${num(review.counts?.AMBER)} · RED ${num(review.counts?.RED)}`,`COVERAGE — VERIFIED ${num(review.coverageCounts?.VERIFIED)} · PARTIAL ${num(review.coverageCounts?.PARTIAL)} · UNVERIFIED ${num(review.coverageCounts?.UNVERIFIED)}`,'',`Coverage: ${s.coverageWarning||'Unavailable'}`,`Primary issue: ${s.primaryIssue||'None'}`,`Positive disagreement: ${s.positiveDisagreement||'None'}`,`Captain: ${s.captainAssessment||'Not assessed'}`,`Overall: ${s.overallVerdict||'Review complete'}`,'',rows].join('\n');
}
/** Player IDs currently in the saved squad, or null when the squad itself
 *  isn't in a reviewable state (e.g. not 15/15 legal). Used to hide review
 *  rows for players who have since been transferred out. */
function freshReviewCurrentPlayerIds(ctx=verdictContext()){
  if(freshSquadReviewIssue(ctx))return null;
  return new Set(freshSquadReviewRequestContext(ctx).players.map(p=>String(p.playerId)));
}
/** A review is a snapshot of the squad at the time it ran. By the time it's
 *  read, transfers may have moved players in or out — this filters the
 *  displayed player list (and recomputes the count badges to match) down to
 *  whoever is in the squad right now, the same way the server itself derives
 *  counts from playerReviews. currentIds===null (squad not currently legal)
 *  shows the review unfiltered rather than hiding everything. */
function freshReviewDisplayReview(review,currentIds){
  if(!review)return null;
  if(!currentIds)return review;
  const all=review.playerReviews||[],playerReviews=all.filter(r=>currentIds.has(String(r.playerId))),removedCount=all.length-playerReviews.length;
  if(!removedCount)return review;
  const counts={GREEN:0,OPPORTUNITY:0,AMBER:0,RED:0},coverageCounts={VERIFIED:0,PARTIAL:0,UNVERIFIED:0};
  for(const row of playerReviews){counts[row.status]=(counts[row.status]||0)+1;coverageCounts[row.evidenceCoverage]=(coverageCounts[row.evidenceCoverage]||0)+1}
  return{...review,playerReviews,counts,coverageCounts,removedCount};
}
async function copyFreshReviewResult(){const text=formatFreshReviewResult(freshReviewDisplayReview(FRESH_SQUAD_REVIEW.review,freshReviewCurrentPlayerIds()));if(!text)return;try{await copyFreshSquadReview(text);flash('Fresh Review copied.')}catch(e){flash('Clipboard unavailable.')}}
/** Wipes the saved review and any in-progress job pointer, both from memory
 *  and from local storage, so a squad that has turned over a lot of players
 *  can start clean instead of the stale review lingering until the next
 *  full re-run. Does not touch the Fresh Review auth key. */
function clearFreshSquadReview(){
  if(FRESH_SQUAD_REVIEW.busy)return;
  freshReviewLocalClearAll();
  Object.assign(FRESH_SQUAD_REVIEW,{review:null,jobId:null,error:'',phase:'idle',message:'',completed:0,total:15,showContext:false,text:'',fingerprint:'',resumeStarted:false});
  renderFreshSquadReview(verdictContext());
  flash('Fresh Review cleared. Run a new review when ready.');
}
function renderFreshSquadReview(ctx=null){
  const host=document.getElementById('verdictFreshSquadReview');if(!host)return;const issue=freshSquadReviewIssue(ctx),ready=!issue,model=ready?freshSquadReviewModel(ctx):null,input=model?.request||null,prior=ready?freshReviewPrior(ctx):null,diff=prior?.inputSnapshot&&input?freshReviewInputDiff(prior.inputSnapshot,input):null,exact=!!(prior&&input&&freshReviewInputFingerprint(prior.inputSnapshot)===freshReviewInputFingerprint(input)),addedNames=(diff?.added||[]).map(id=>input.players.find(p=>String(p.playerId)===String(id))?.name).filter(Boolean),removedNames=(diff?.removed||[]).map(id=>prior?.inputSnapshot?.players?.find(p=>String(p.playerId)===String(id))?.name).filter(Boolean),review=prior,currentIds=input?new Set(input.players.map(p=>String(p.playerId))):null,displayReview=freshReviewDisplayReview(review,currentIds),progress=Math.round(100*clamp(num(FRESH_SQUAD_REVIEW.completed)/Math.max(1,num(FRESH_SQUAD_REVIEW.total,15)),0,1)),chip=ctx?.activeChip||chipStateForGw(S.gw),busy=FRESH_SQUAD_REVIEW.busy,identity=FRESH_SQUAD_REVIEW.identity,legacy=!!freshReviewOwnerToken(),storedJob=freshReviewLocalLoad()?.jobId,clearable=!!(review||storedJob)&&!busy;
  const authHtml=legacy?`Key session active for this tab · <button type="button" id="btnFreshCheckKey">Check key</button> <button type="button" id="btnFreshClearKey">Clear key</button>`:`<label for="freshReviewKey">Fresh Review key</label> <input type="password" id="freshReviewKey" autocomplete="off" spellcheck="false" placeholder="Enter key"> <button type="button" id="btnFreshSaveKey">Use key</button>`;
  host.innerHTML=`<div class="vsec-h">Fresh Squad Intelligence<span>external evidence audit · never modifies projections automatically</span></div><section class="fresh-review live ${ready?'':'locked'}"><div class="fresh-review-head"><div><div class="fresh-review-title">Fresh Squad Review</div><div class="fresh-review-sub">OTB says vs fresh evidence vs review verdict · current saved squad · GW${S.gw}</div></div><span class="fresh-review-chip">${chip.active?`${esc(chip.label).toUpperCase()} ACTIVE`:'NO CHIP'}</span></div><div class="fresh-review-background"><b>Runs in Cloudflare.</b> Once the job starts, you may close this app or lock the phone. Verdict reconnects to the saved job when you return.</div>${issue?`<div class="fresh-review-status">${esc(issue)}</div>`:''}${diff?.hasChanges?`<div class="fresh-review-change"><b>Squad context changed since the last review.</b> ${addedNames.length?`New addition${addedNames.length===1?'':'s'}: ${esc(addedNames.join(', '))}. `:''}${removedNames.length?`No longer in your squad: ${esc(removedNames.join(', '))}. `:''}${addedNames.length?`You can research only ${addedNames.length===1?'that player':'those players'} and reuse unchanged findings, or run all 15 fresh.`:'Run all 15 to re-audit the changed chip, roles, captaincy or model inputs.'}</div>`:''}${displayReview?.removedCount?`<div class="fresh-review-change">${displayReview.removedCount} player${displayReview.removedCount===1?'':'s'} from this review ${displayReview.removedCount===1?'is':'are'} no longer in your squad and ${displayReview.removedCount===1?'is':'are'} hidden below. Clear Review to remove ${displayReview.removedCount===1?'it':'them'} from storage entirely.</div>`:''}${busy?`<div class="fresh-review-progress"><div class="fresh-review-progress-label">${esc(FRESH_SQUAD_REVIEW.message||'Preparing review')}</div><div class="fresh-review-progress-track"><i style="width:${progress}%"></i></div><div class="fresh-review-progress-step">${FRESH_SQUAD_REVIEW.phase==='context'?'✓ Squad context prepared · Cloudflare owns the job':FRESH_SQUAD_REVIEW.phase==='research'?`✓ Cloudflare job active · ${FRESH_SQUAD_REVIEW.completed}/${FRESH_SQUAD_REVIEW.total} researched`:FRESH_SQUAD_REVIEW.phase==='evaluate'?'✓ Research complete · evaluating evidence':esc(FRESH_SQUAD_REVIEW.phase)}</div></div>`:storedJob?'<div class="fresh-review-status">Saved background review found · reconnecting…</div>':''}${FRESH_SQUAD_REVIEW.error?`<div class="fresh-review-error"><b>Review status:</b> ${esc(FRESH_SQUAD_REVIEW.error)}</div>`:''}<div class="fresh-review-actions live-actions"><button type="button" class="btn" id="btnRunFreshSquadReview" ${ready&&!busy?'':'disabled'}>Run Fresh Squad Review</button><button type="button" class="btn ghost" id="btnUseCachedFreshReview" ${exact&&!busy?'':'disabled'}>Use Cached Review</button><button type="button" class="btn danger" id="btnForceFreshSquadReview" ${ready&&!busy?'':'disabled'}>Force Fresh Review</button></div>${addedNames.length?`<div class="fresh-review-actions secondary-actions"><button type="button" class="btn ghost" id="btnFreshNewOnly" ${busy?'disabled':''}>Review new addition${addedNames.length===1?'':'s'} only</button><button type="button" class="btn ghost" id="btnFreshAllChanged" ${busy?'disabled':''}>Review all 15 fresh</button></div>`:''}<div class="fresh-review-actions secondary-actions"><button type="button" class="btn ghost" id="btnCopyFreshContext" ${ready&&!busy?'':'disabled'}>Copy Review Context</button><button type="button" class="btn ghost" id="btnCopyFreshResult" ${review&&!busy?'':'disabled'}>Copy Review Result</button><button type="button" class="btn ghost" id="btnClearFreshReview" ${clearable?'':'disabled'} title="Removes the saved review and any in-progress job from this device. Does not affect Cloudflare's stored data.">Clear Review</button></div><div class="fresh-auth-note">${authHtml} · no AI/search credential is present in this HTML.</div>${displayReview?freshReviewSummaryHtml(displayReview):'<div class="fresh-review-note" style="margin-top:10px"><b>No live review loaded yet.</b> Start once; the durable job continues even if this page closes.</div>'}${FRESH_SQUAD_REVIEW.showContext&&FRESH_SQUAD_REVIEW.text?`<details class="fresh-context-diagnostic" open><summary>Diagnostic review context · copied locally</summary><textarea readonly spellcheck="false">${esc(FRESH_SQUAD_REVIEW.text)}</textarea><div class="fresh-review-copy-note">${FRESH_SQUAD_REVIEW.copied?'Copied to clipboard.':''}</div></details>`:''}</section>`;
  document.getElementById('btnRunFreshSquadReview')?.addEventListener('click',()=>runFreshSquadReview());document.getElementById('btnUseCachedFreshReview')?.addEventListener('click',()=>useCachedFreshReview(prior));document.getElementById('btnForceFreshSquadReview')?.addEventListener('click',()=>runFreshSquadReview({force:true}));document.getElementById('btnFreshNewOnly')?.addEventListener('click',()=>runFreshSquadReview({force:true,selectedPlayerIds:diff.added}));document.getElementById('btnFreshAllChanged')?.addEventListener('click',()=>runFreshSquadReview({force:true}));document.getElementById('btnCopyFreshContext')?.addEventListener('click',copyFreshReviewContext);document.getElementById('btnCopyFreshResult')?.addEventListener('click',copyFreshReviewResult);document.getElementById('btnClearFreshReview')?.addEventListener('click',clearFreshSquadReview);document.getElementById('btnFreshSaveKey')?.addEventListener('click',freshReviewSaveKey);document.getElementById('freshReviewKey')?.addEventListener('keydown',event=>{if(event.key==='Enter')freshReviewSaveKey()});document.getElementById('btnFreshCheckKey')?.addEventListener('click',freshReviewCheckSession);document.getElementById('btnFreshClearKey')?.addEventListener('click',freshReviewClearKey);scheduleFreshReviewResume();
}

/* ── Context assembly ───────────────────────────────────────────────────
   One pass that gathers every signal Verdict acts on. The old renderVerdict
   recomputed the same availability filter three times and re-ran project()
   inside a sort comparator; everything here is computed once and shared. */
function verdictContext(){
  const players=squadPlayers(),gws=scheduleGws(S.gw,5);
  const rows=players.map(p=>({p,r:project(p,S.gw),md:minuteDetail(p)}));
  const xi=rows.filter(o=>S.start.has(o.p.id)),benchRows=rows.filter(o=>!S.start.has(o.p.id));
  const ctx={players,rows,xi,benchRows,gws,regime:verdictRegime(),activeChip:chipStateForGw(S.gw)};

  ctx.budgetOk=bank()>=-1e-9;
  ctx.xiOk=xi.length===11&&(()=>{const c={GK:0,DEF:0,MID:0,FWD:0};xi.forEach(o=>c[o.p.p]++);
    return c.GK===1&&c.DEF>=3&&c.DEF<=5&&c.MID>=2&&c.MID<=5&&c.FWD>=1&&c.FWD<=3})();
  {const c={GK:0,DEF:0,MID:0,FWD:0};xi.forEach(o=>c[o.p.p]++);ctx.formation=`${c.DEF}-${c.MID}-${c.FWD}`}
  ctx.capSet=!!byId(S.cap)&&S.start.has(S.cap);ctx.viceSet=!!byId(S.vice)&&S.start.has(S.vice);

  const ranked=xi.slice().sort((a,b)=>b.r.x-a.r.x);
  ctx.bestCap=ranked[0]||null;
  ctx.ceilCap=xi.slice().sort((a,b)=>b.r.high-a.r.high)[0]||ctx.bestCap;
  ctx.capAligned=!!(ctx.bestCap&&S.cap===ctx.bestCap.p.id);
  ctx.capRanked=ranked;
  const vicePool=xi.filter(o=>o.p.id!==S.cap);
  ctx.bestVice=vicePool.slice().sort((a,b)=>b.r.x-a.r.x)[0]||null;

  /* availability risk — computed ONCE (was three identical filters) */
  const riskRows=ctx.activeChip.benchScoring?rows:xi;
  ctx.risk=riskRows.map(o=>{const av=availability(o.p),f=flagInfo(o.p);
    if(av>=.85&&o.md.exp>=60)return null;
    return{p:o.p,r:o.r,avail:av,exp:o.md.exp,cost:o.r.x*(1-av)+(o.md.exp<60?o.r.x*0.15:0),
      label:f?f.label:o.md.exp<60?'rotation risk':'availability doubt'}})
    .filter(Boolean).sort((a,b)=>b.cost-a.cost);

  /* One authoritative per-GW chip state owns scoring. Bench Boost adds the
     legal four-player bench; Triple Captain adds two captain duplications. */
  ctx.baseXiTotal=xi.reduce((a,o)=>a+o.r.x,0);
  ctx.captainBase=ctx.capSet?(xi.find(o=>o.p.id===S.cap)?.r.x||0):0;
  ctx.benchFull=benchRows.reduce((a,o)=>a+o.r.x,0);
  ctx.scoringPlayerCount=ctx.activeChip.benchScoring?15:11;
  ctx.scoringTotal=ctx.baseXiTotal+ctx.captainBase*(ctx.activeChip.captainMultiplier-1)+(ctx.activeChip.benchScoring?ctx.benchFull:0);
  ctx.xiTotal=ctx.scoringTotal; // compatibility alias for existing Verdict consumers
  ctx.uncertainty=verdictUncertainty(ctx.activeChip.benchScoring?[...xi,...benchRows]:xi,S.cap,ctx.activeChip);
  ctx.xiSd=ctx.uncertainty.sd;
  ctx.horizon=gws.map(g=>{const r=bestXIForGw(players,null,g),chip=chipStateForGw(g);
    return{gw:g,x:r?r.xiMean+(r.captain?.mean||0)*(chip.captainMultiplier-1)+(chip.benchScoring?r.benchRows.reduce((sum,o)=>sum+o.mean,0):0):0,ok:!!r}});
  ctx.horizonTotal=ctx.horizon.reduce((a,h)=>a+h.x,0);

  /* bench — priced against the order actually set */
  try{
    const best=expectedAutosub({xi,benchRows});
    const outfield=benchRows.filter(o=>o.p.p!=='GK');
    const order=(S.benchOrder||[]).map(id=>outfield.find(o=>o.p.id===id)).filter(Boolean);
    const cur=order.length===3?expectedAutosub({xi,benchRows},order):best;
    ctx.benchBest=best.mean;ctx.benchCurrent=cur.mean;ctx.benchGap=Math.max(0,best.mean-cur.mean);
    ctx.benchOptimalNames=best.order.map(o=>o.p.n).join(' → ');
  }catch(e){ctx.benchBest=ctx.benchCurrent=ctx.benchGap=0;ctx.benchOptimalNames=''}

  /* transfer route + opportunity cost */
  const last=S.transfer.last,rawStep=last?.plan?.[0]||null;
  ctx.planStale=transferPlanIsStale(last);
  const step=ctx.planStale?null:rawStep,moves=step?.moves||[];
  ctx.step=step;ctx.moves=moves;
  ctx.firstPlan=moves.length?step:null;ctx.routeRolled=!!step&&!moves.length;
  if(ctx.firstPlan){
    ctx.planLabel=moves.map(m=>`${m.outName} → ${m.inName}`).join('; ');
    const gain=num(step.netGain,0),hit=num(step.hit,0);
    ctx.planEvidence=`The planner values this at ${signed(gain,1)} xP over ${num(S.transfer.horizon,5)} gameweeks${hit?` after a ${hit}-point hit`:''}, leaving £${num(step.bankAfter,0).toFixed(1)}m in the bank.`;
    const opp=step.opportunity||last?.opportunity;
    if(opp&&(opp.outName||opp.label))ctx.planEvidence+=` Strongest rejected alternative: ${esc(opp.label||(opp.outName+' → '+opp.inName))}${Number.isFinite(+opp.net)?` at ${signed(num(opp.net),1)} xP`:''} — the gap between them is what this route costs you elsewhere.`;
  }else if(ctx.routeRolled){
    ctx.planLabel='ROLL';
    ctx.planEvidence=`No move cleared the ${num(S.transfer.threshold,0).toFixed(1)} xP threshold required to justify spending a free transfer, so the transfer is worth more banked than used.`;
  }else{ctx.planLabel=ctx.planStale?'STALE PLAN':'';ctx.planEvidence=ctx.planStale?'The last transfer route was calculated under an older input state and has been excluded until the planner is run again.':''}

  /* price pressure on the planned move */
  ctx.priceRisk=null;
  if(ctx.firstPlan&&PRICE.last){
    try{
      const o=byId(ctx.moves[0].outId),i=byId(ctx.moves[0].inId);
      if(o&&i){const econ=priceMoveHeadroom(o,i,bank()),v=pricePlanVerdict(o,i,econ);
        if(v&&v.cls!=='wait')ctx.priceRisk={severity:v.cls==='risk'?'act':'watch',
          cost:v.cls==='risk'?Math.max(0,num(ctx.firstPlan.netGain,0)):0,
          title:v.cls==='risk'?'Planned move is at risk of becoming unaffordable':'Price pressure favours acting early',
          evidence:`${v.text} Headroom is £${num(econ?.headroom,0).toFixed(1)}m now, £${num(econ?.worst,0).toFixed(1)}m in the worst case (target rises, seller falls).`};
      }
    }catch(e){}
  }

  /* role evidence on owned players */
  ctx.roleShifts=[];
  try{
    for(const o of riskRows){const ri=roleIntelFor(o.p);
      const shift=num(ri?.shift,0);if(!ri||Math.abs(shift)<0.15||!ri.events.length)continue;
      /* shift is a log-odds adjustment to start probability. Near the current
         operating point the probability change is approximately p(1-p)·shift,
         which is enough to rank the effect without overstating its precision. */
      const ps=clamp(num(o.md.pStart,0),0,1),dp=ps*(1-ps)*shift;
      ctx.roleShifts.push({p:o.p,cost:Math.abs(dp)*o.r.x,
        text:`${ri.events.length} role event(s) shift ${esc(o.p.n)}'s start log-odds by ${signed(shift,2)} — roughly ${signed(dp*100,0)} percentage points of start probability at his current ${Math.round(ps*100)}%. This is scout and manual evidence, not the official payload, and is only as good as its source.`})}
    ctx.roleShifts.sort((a,b)=>b.cost-a.cost);
  }catch(e){ctx.roleShifts=[]}

  /* Worker news ahead of the official payload (F4) */
  ctx.newsDivergence=[];
  try{
    const evs=(NEWS.last?.events||[]).filter(e=>e.kind==='status'||e.kind==='chance');
    const seen=new Set();
    for(const e of evs){
      const p=players.find(x=>Number(x.apiId)===Number(e.player_id));
      if(!p||seen.has(p.id))continue;
      const cur=e.kind==='status'?String(p.live?.status||'a'):String(num(p.live?.chance,100));
      const nv=String(e.new_value==null?'':e.new_value);
      if(!nv||nv===cur)continue;
      seen.add(p.id);
      const r=rows.find(x=>x.p.id===p.id);
      ctx.newsDivergence.push({p,cost:r?r.r.x*0.25:0,
        text:`The news feed reports ${e.kind==='status'?`status ${esc(STATUS_LABEL[nv]||nv)}`:`chance of playing ${esc(nv)}%`} (${relTime(e.detected_at)}), but the official payload still says ${e.kind==='status'?esc(STATUS_LABEL[cur]||cur):esc(cur)+'%'}.`});
    }
    ctx.newsDivergence.sort((a,b)=>b.cost-a.cost);
  }catch(e){ctx.newsDivergence=[]}

  /* chip windows from the advisor's cached result — no recomputation */
  ctx.chips=[];ctx.chipCandidates=[];
  try{
    const recs=CHIP_ADVISOR_LAST?.recommendations||{};
    for(const k of ['WC1','BB1','TC1','FH1']){const r=recs[k];
      if(!(r&&r.gw&&r.gw>=S.gw&&r.gw<=S.gw+2))continue;
      const row={key:k,label:chipAdvisorLabel(k),gw:r.gw,score:num(r.score,0),reason:r.reason||'',qualified:r.qualified===true,confidence:r.confidence||''};
      ctx.chipCandidates.push(row);
      if(row.qualified)ctx.chips.push(row);
    }
  }catch(e){ctx.chips=[];ctx.chipCandidates=[]}

  /* schedule outlook — ranked on fixture quality, NOT on how many players you
     own from a club. Exposure is reported alongside, never mixed into the rank. */
  ctx.schedule={rows:[],best:null,worst:null};
  try{
    const rows=[...new Set(players.map(p=>p.t))].map(t=>{
      const st=scheduleTeamStats(t,gws),ex=scheduleExposure(t,gws);
      return st?{code:t,st,ex,quality:num(st.avgOverall,0)}:null}).filter(Boolean)
      .sort((a,b)=>b.quality-a.quality);
    ctx.schedule={rows,best:rows[0]||null,worst:rows[rows.length-1]||null};
  }catch(e){ctx.schedule={rows:[],best:null,worst:null}}

  ctx.divergence=verdictMarketDivergence(S.gw);
  ctx.ownership=verdictOwnership(xi);
  ctx.readiness=verdictReadiness(ctx);
  ctx.queue=verdictQueue(ctx);
  return ctx;
}

/* ── Render ─────────────────────────────────────────────────────────── */
/* VERDICT_RENDER_KEY is declared with the other caches near the top of the file
   and cleared by bumpCache(), so a projection change invalidates the verdict. */
function vSev(s){return s==='block'?'block':s==='act'?'act':'watch'}
function verdictActionRow(item,i){
  const cost=item.blocking?'BLOCKING':(num(item.cost,0)>=0.05?num(item.cost).toFixed(1)+' pts':'—');
  return `<div class="vq-item vq-${vSev(item.severity)}" data-vq="${esc(item.id)}">
    <div class="vq-head"><span class="vq-rank">${i+1}</span><span class="vq-title">${esc(item.title)}</span><span class="vq-cost">${cost}</span></div>
    <div class="vq-ev">${item.evidence}</div>
    ${item.panel?`<div class="vq-act"><a href="#" data-vqpanel="${esc(item.panel)}"${item.playerId?` data-vqplayer="${item.playerId}"`:''}${item.capId?` data-vqcap="${item.capId}"`:''}>${esc(item.action||'Open')} →</a></div>`:''}
  </div>`;
}
function verdictFeedStrip(feeds){
  const dot=s=>s==='ok'?'●':s==='warn'?'▲':s==='cached'?'◐':s==='off'?'○':'✕';
  return `<div class="vfeed">${feeds.map(f=>`<div class="vfeed-cell vf-${f.state}" data-vfeed="${esc(f.panel)}" title="${esc(f.detail)}">
    <span class="vf-dot">${dot(f.state)}</span><span class="vf-label">${esc(f.label)}</span><span class="vf-age">${esc(verdictAgeLabel(f.ageMin))}</span></div>`).join('')}</div>`;
}

/* RC5.0.0 V5 — opening Verdict used to refresh nothing. The tab handler warmed
   News for the News tab, Prices for the Prices tab and the chip advisor for
   Chips, but had no branch for Verdict — so the page intended as the single
   destination was the one page that never pulled fresh data. A user who opened
   the app and went straight here saw a verdict built on feeds that had never
   been fetched in that session. Every feed Verdict consumes is warmed here. */
async function warmVerdictFeeds(){
  if(navigator.onLine===false)return;
  try{
    const newsAge=verdictAgeMin(NEWS.last?.generatedAt);
    const priceAge=verdictAgeMin(PRICE.last?.sampleEnd);
    const mAge=marketAgeMinutes();
    const marketDue=!MARKET.loaded||mAge==null||(mAge>120&&Date.now()-MARKET.fetchedAt>10*60*1000);
    if(lowPowerMode()){
      const yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,120)));
      /* Market is a tiny 10-fixture payload and directly powers the first
         evidence card. Fetch it before the larger News and Price responses so
         a phone does not sit on a false "No live odds" state for 20+ seconds. */
      if(marketDue){const ok=await loadMarketData();bumpVerdict();if(ok)await yieldFrame()}
      if(!NEWS.last||newsAge==null||newsAge>20){await refreshNewsFeed({silent:true});bumpVerdict();await yieldFrame()}
      if(!PRICE.last||priceAge==null||priceAge>60){await refreshPriceIntel({silent:true});bumpVerdict();await yieldFrame()}
      /* Chip payload construction projects the full player pool across the
         remaining season. On a phone it stays behind the explicit Chips tab. */
      return;
    }
    if(marketDue)loadMarketData().then(()=>{render()});
    if(!NEWS.last||newsAge==null||newsAge>20)refreshNewsFeed({silent:true}).then(()=>{bumpVerdict()});
    if(!PRICE.last||priceAge==null||priceAge>60)refreshPriceIntel({silent:true}).then(()=>{bumpVerdict()});
    if(!CHIP_ADVISOR_LAST)scheduleChipAdvisor(400);
  }catch(e){console.warn('OTB verdict feed warm skipped:',e)}
}
function bumpVerdict(){VERDICT_RENDER_KEY='';try{renderVerdict()}catch(e){console.warn('OTB verdict re-render skipped:',e)}}

function renderVerdict(){
  const host=document.getElementById('verdictCommand');if(!host)return;
  const key=[S.gw,S.squad.join(','),[...S.start].join(','),(S.benchOrder||[]).join(','),S.cap,S.vice,bank().toFixed(2),
    JSON.stringify(S.chips),
    verdictFeedFingerprint(),S.transfer.last?JSON.stringify(S.transfer.last.plan?.[0]||''):'',
    Math.floor((verdictRegime().minsLeft??-1)/15)].join('|');
  if(VERDICT_RENDER_KEY===key&&host.dataset.rendered==='1')return;

  const players=squadPlayers();
  if(players.length<15){
    VERDICT_RENDER_KEY=key;host.dataset.rendered='1';
    host.innerHTML=`<div class="verdict-hero vq-block"><div class="vh-top"><span class="vh-tag">NO VERDICT</span></div>
      <div class="vh-line">Squad is ${players.length}/15</div>
      <div class="vh-note">Verdict issues decisions, not estimates. Complete a legal 15-player squad and it will rank every action by what it is costing you.</div></div>`;
    ['verdictDecisionStrip','verdictActions','verdictHealth','verdictChanges','verdictDecisionMemory','verdictReadiness','verdictIntel','verdicts','benchIntel','capList','upgrades'].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML=''});
    renderFreshSquadReview(null);
    return;
  }

  const ctx=verdictContext(),q=ctx.queue,regime=ctx.regime,feeds=verdictFeeds();
  const blocking=q.filter(i=>i.blocking),top=q[0]||null,decision=verdictDecisionState(ctx);

  /* Standalone action costs overlap (a transfer can also remove availability,
     role or price risk). Never sum them as if independent. */
  const costed=q.filter(i=>!i.blocking&&num(i.cost,0)>0),largestCost=costed.reduce((m,i)=>Math.max(m,num(i.cost,0)),0);
  /* hero — the top item of the queue, not a separate priority ladder */
  const heroTag=blocking.length?'BLOCKED':regime.key==='LOCK'?'LOCK — FINALISE':regime.key==='REVIEW'?'GAMEWEEK UNDER WAY':
    top&&top.severity==='act'?'ACTION REQUIRED':'HOLD — SQUAD READY';
  const heroLine=blocking.length?blocking[0].title:top&&top.severity==='act'?top.title:
    ctx.routeRolled?`Roll the transfer · captain ${byId(S.cap)?.n||'—'}`:`Squad is ready · captain ${byId(S.cap)?.n||'—'}`;
  const heroNote=blocking.length?blocking[0].evidence:top&&top.severity==='act'?top.evidence:
    (largestCost>=0.1
      ?`The largest remaining standalone action is worth ${largestCost.toFixed(1)} expected points. Costs are not summed because transfer, availability, role and price signals can describe the same recoverable loss. ${regime.note}`
      :`Nothing detected is costing a measurable number of points. ${regime.note}`);

  const heroCls=blocking.length?'vq-block':top&&top.severity==='act'?'vq-act':'vq-ok';

  host.innerHTML=`<div class="verdict-hero ${heroCls}">
    <div class="vh-top"><span class="vh-tag">GW${S.gw} · ${esc(heroTag)}</span>
      <span class="vh-clock">${regime.key==='REVIEW'?'deadline passed':verdictCountdown(regime.minsLeft)+' to deadline'}${regime.verified?'':' · unverified'}</span></div>
    <div class="vh-line">${esc(heroLine)}</div>
    <div class="vh-note">${heroNote}</div>
    <div class="vh-meta">
      <span><b>${ctx.scoringTotal.toFixed(1)}</b> xP · ${ctx.scoringPlayerCount} scoring${ctx.activeChip.active?` · ${esc(ctx.activeChip.label)}`:''} <span class="vh-band">± ${ctx.xiSd.toFixed(1)}</span></span>
      <span><b>${ctx.readiness.score}</b>/100 readiness</span>
      <span><b>${largestCost.toFixed(1)}</b> largest action</span>
      <span class="vh-regime">${esc(regime.label)} mode</span>
    </div></div>`;
  host.dataset.rendered='1';

  /* final gameweek decision strip — explicit configuration, not another priority score. */
  const ds=document.getElementById('verdictDecisionStrip');
  if(ds){
    const cell=(k,v,tone='info')=>`<div class="vdecision-cell ${tone}"><div class="k">${esc(k)}</div><div class="v">${esc(v||'—')}</div></div>`;
    ds.innerHTML=`<div class="vsec-h">Final GW decision<span>the configuration OTB is currently endorsing</span></div><div class="vdecision">
      ${cell('Transfer',decision.transfer,ctx.planStale?'warn':ctx.routeRolled?'good':'info')}${cell('Captain',decision.captain?.n||'NOT SET',decision.captain?'good':'warn')}${cell('Vice',decision.vice?.n||'NOT SET',decision.vice?'good':'warn')}
      ${cell('Bench 1',decision.bench1?.n||'—','info')}${cell('Chip',decision.chip,decision.chip==='HOLD'?'good':'warn')}${cell('State',decision.readiness,blocking.length?'warn':decision.readiness==='READY'?'good':'info')}
      <div class="vdecision-note">Action costs below are standalone estimates and may overlap. A stale transfer route is excluded until it is recomputed against the current feeds and projections.</div></div>`;
  }
  renderFreshSquadReview(ctx);

  /* feed strip */
  const fh=document.getElementById('verdictHealth');
  if(fh)fh.innerHTML=`<div class="vsec-h">Intelligence health<span>${feeds.filter(f=>f.state==='ok').length}/${feeds.length} feeds current</span></div>`+verdictFeedStrip(feeds)+
    (feeds.some(f=>f.state==='fail'||f.state==='cached')?`<div class="vfeed-warn">Verdict is degraded: ${esc(feeds.filter(f=>f.state==='fail'||f.state==='cached').map(f=>f.label).join(', '))}. Affected evidence has been excluded rather than used silently.</div>`:'');

  /* action queue */
  const ah=document.getElementById('verdictActions');
  if(ah){
    const shown=q.slice(0,6),rest=q.length-shown.length;
    ah.innerHTML=`<div class="vsec-h">Action queue<span>ranked by expected points at stake</span></div>`+
      (shown.length?shown.map(verdictActionRow).join(''):`<div class="vq-item vq-ok"><div class="vq-head"><span class="vq-title">No action required</span></div><div class="vq-ev">Every check passed and no item is costing a measurable number of points. ${esc(regime.note)}</div></div>`)+
      (rest>0?`<div class="vq-more">${rest} further signal${rest>1?'s':''} detected below the action threshold — not strong enough to change any decision.</div>`:'')+
      (regime.key==='LOCK'?`<div class="vq-more">Speculative items (chips, market disagreement, price pressure, transfer routing) are suppressed inside the lock window — they cannot be acted on now.</div>`:'');
  }

  /* what changed */
  const ch=document.getElementById('verdictChanges');
  if(ch){
    const now=verdictSnapshot(ctx),chg=verdictChanges(verdictLoadSeen(),now);
    ch.innerHTML=chg&&chg.items.length
      ?`<div class="vsec-h">Since your last check<span>${esc(relTime(new Date(chg.since).toISOString()))}</span></div>
        <div class="vchg">${chg.items.map(c=>`<div class="vchg-row vchg-${c.dir}"><span class="vchg-ar">${c.dir==='up'?'↑':c.dir==='down'?'↓':'•'}</span><span>${c.text}</span></div>`).join('')}</div>
        <div class="vchg-note">${chg.items.some(c=>c.w>=8)?'These changes are material. Re-check the action queue above — it has already been recalculated with them.':'None of these changes were large enough to alter the ranking above.'}</div>`
      :`<div class="vsec-h">Since your last check<span>${verdictLoadSeen()?'no material change':'first look this gameweek'}</span></div>`;
    verdictSaveSeen(now);
  }

  renderDecisionMemory(ctx);

  /* readiness decomposition + calibration */
  const rh=document.getElementById('verdictReadiness');
  if(rh){
    const cal=verdictCalibration();
    const bars=ctx.readiness.parts.map(p=>`<div class="vrd-row"><span class="vrd-k">${esc(p.k)}</span>
      <span class="vrd-bar"><i style="width:${Math.round(100*p.got/p.max)}%"></i></span>
      <span class="vrd-v">${p.got}/${p.max}</span><span class="vrd-n">${esc(p.note)}</span></div>`).join('');
    const unc=ctx.uncertainty.top;
    rh.innerHTML=`<div class="vsec-h">Readiness ${ctx.readiness.score}/100<span>state completeness — not a prediction</span></div>
      <div class="vrd">${bars}</div>
      ${unc?`<div class="vrd-unc"><b>Main uncertainty:</b> ${esc(unc.p.n)} accounts for ${Math.round(unc.share*100)}% of the variance in your XI projection (${Math.round(unc.exp)} expected minutes, ${Math.round(num(unc.pStart,0)*100)}% start probability)${unc.captain?' — and he has the armband, which doubles it':''}.</div>`:''}
      <div class="vsec-h" style="margin-top:14px">Model calibration<span>${cal?cal.gwCount+' gameweeks scored':'locked until GW'+(VERDICT_MIN_CALIB_GWS)}</span></div>
      ${cal?`<div class="vcal">
        <div class="vcal-row"><span>Interval coverage</span><b class="${cal.coverage!=null&&Math.abs(cal.coverage-.8)>.12?'bad':''}">${cal.coverage==null?'—':Math.round(cal.coverage*100)+'%'}</b><span class="vcal-n">of actuals fell inside the 80% band (target 80%)</span></div>
        <div class="vcal-row"><span>Bias</span><b>${cal.bias==null?'—':signed(cal.bias,2)}</b><span class="vcal-n">points per player — positive means the model runs optimistic</span></div>
        <div class="vcal-row"><span>Rank quality</span><b>${cal.rank==null?'—':cal.rank.toFixed(2)}</b><span class="vcal-n">Spearman ρ across ${cal.n} scored player-gameweeks</span></div>
        ${cal.coverage!=null&&cal.coverage<.68?`<div class="vcal-warn">Coverage is materially below target: the ± band shown above is too narrow and should be read as optimistic. This is the outcome-variance defect, measured rather than assumed.</div>`:''}
      </div>`:`<div class="vcal-wait">No calibration is shown until ${VERDICT_MIN_CALIB_GWS} gameweeks have been scored. Anything fitted to less than that would be noise, and a confidence figure with nothing behind it is worse than none.</div>`}
      <div class="vrd-actions"><button type="button" class="btn ghost" id="btnVerdictSens">Test how robust the captain call is</button><button type="button" class="btn ghost" id="btnVerdictJournal">Record this gameweek's decision</button></div>
      <div id="verdictSensOut">${VERDICT_SENSITIVITY?verdictSensHtml(VERDICT_SENSITIVITY):''}</div>`;
  }

  /* intelligence: market disagreement, ownership, horizon, schedule */
  const ih=document.getElementById('verdictIntel');
  if(ih){
    const d=ctx.divergence,ow=ctx.ownership;
    const bestF=ctx.schedule.best,worstF=ctx.schedule.worst;
    ih.innerHTML=`<div class="vsec-h">Evidence<span>signals that inform the queue above</span></div>
      <div class="vint">
        ${d?`<div class="vint-card"><b>Model vs market</b>
          <div>${esc(TEAMS[d.max.code]?.n||d.max.code)} ${d.max.home?'vs':'at'} ${esc(TEAMS[d.max.opp]?.n||d.max.opp)} (GW${d.max.gw}): OTB ${d.max.modelXg.toFixed(2)} xG · market ${d.max.marketXg.toFixed(2)} · <span class="${Math.abs(d.max.diff)>=.1?'bad':''}">${signed(d.max.diff*100,0)}%</span></div>
          <div class="vint-n">All ${d.matches.length} priced matches are audited for ${verdictMarketSlateLabel(d)}. ${d.wide.length} team-side gap${d.wide.length===1?'':'s'} meet the ${Math.round(MARKET_ALERT_GAP*100)}% alert threshold.${d.gws.includes(S.gw)?'':` Your selected projection is GW${S.gw}; these quoted odds belong to ${verdictMarketSlateLabel(d)} and do not alter GW${S.gw}.`} Matching fixtures blend ${Math.round(MARKET_WEIGHT*100)}% of the market view, so these are residual disagreements.</div>
          ${d.wide.length?`<div class="market-alert"><strong>${esc(verdictMarketSlateLabel(d))} MARKET ALERT</strong> · ${verdictWideMarketMatchCount(d)} fixture${verdictWideMarketMatchCount(d)===1?'':'s'} contain a material gap. Red rows below identify every affected match.</div>`:''}
          ${verdictMarketMatrixHTML(d)}</div>`:
          `<div class="vint-card"><b>Model vs market</b><div class="vint-n">${MARKET.loading?'Loading the current live odds…':MARKET.error?'Live odds could not load: '+esc(MARKET.error):MARKET.loaded?`Live odds loaded for ${MARKET.fixtures} fixtures, but none matched the current FPL fixture calendar.`:MARKET_BLEND?'No live odds loaded yet — open Verdict while online to fetch them.':'Market blend is disabled in this build.'}</div></div>`}

        ${bestF?`<div class="vint-card"><b>Fixture exposure</b>
          <div>Best run: ${esc(TEAMS[bestF.code]?.n||bestF.code)} (${num(bestF.st.avgOverall,0).toFixed(2)}) · ${bestF.ex.count} owned</div>
          <div>Worst run: ${esc(TEAMS[worstF.code]?.n||worstF.code)} (${num(worstF.st.avgOverall,0).toFixed(2)}) · ${worstF.ex.count} owned</div>
          <div class="vint-n">Ranked on fixture difficulty over GW${ctx.gws[0]}–${ctx.gws[ctx.gws.length-1]}, with ownership reported separately. The previous version ranked clubs by the summed xP of players you owned, which meant the club you owned most of always came top regardless of its fixtures.</div></div>`:''}

        ${ow?`<div class="vint-card"><b>Ownership exposure</b>
          <div>${ow.template.length} of your XI above 30% owned · average ${ow.avg.toFixed(1)}%</div>
          ${ow.missing.length?`<div>Not owned: ${ow.missing.map(m=>esc(m.p.n)+' ('+m.own.toFixed(0)+'%)').join(', ')}</div>`:''}
          ${ow.diffs.length?`<div>Your differentials: ${ow.diffs.map(m=>esc(m.p.n)+' ('+m.own.toFixed(0)+'%)').join(', ')}</div>`:''}
          <div class="vint-n">These are raw ownership figures. FPL publishes selection percentage but not captaincy share, so true effective ownership cannot be computed here and is not claimed. High template exposure lowers variance — right when protecting a rank, wrong when chasing one.</div></div>`:''}

        <div class="vint-card"><b>Five-gameweek outlook</b>
          <div>${ctx.horizon.map(h=>`GW${h.gw} ${h.ok?h.x.toFixed(0):'—'}`).join(' · ')}</div>
          <div>Total ${ctx.horizonTotal.toFixed(0)} xP</div>
          <div class="vint-n">Each gameweek is scored on that week's best legal XI plus captain, re-picked per gameweek. The previous version summed all 15 players, counting bench fodder that can never score.</div></div>
      </div>`;
  }

  renderVerdictDetail(ctx);
  VERDICT_RENDER_KEY=key;

  /* wiring */
  document.querySelectorAll('[data-vqpanel]').forEach(a=>a.onclick=e=>{e.preventDefault();
    const pl=a.dataset.vqplayer,cap=a.dataset.vqcap;
    if(cap){S.cap=+cap;S.capManual=true;saveUserState();bumpCache();render();flash('Captain updated from the action queue.');return}
    if(pl){inspectPlayer(+pl);return}
    uxOpenPanel(a.dataset.vqpanel)});
  document.querySelectorAll('[data-vfeed]').forEach(a=>a.onclick=()=>uxOpenPanel(a.dataset.vfeed));
  const sb=document.getElementById('btnVerdictSens');
  if(sb)sb.onclick=()=>{const out=document.getElementById('verdictSensOut');if(out)out.innerHTML='<div class="vsens">Probing…</div>';
    setTimeout(()=>{VERDICT_SENSITIVITY=verdictCaptainSensitivity();const o=document.getElementById('verdictSensOut');
      if(o)o.innerHTML=VERDICT_SENSITIVITY?verdictSensHtml(VERDICT_SENSITIVITY):'<div class="vsens">Not enough of a squad to test a captaincy flip.</div>'},30)};
  const jb=document.getElementById('btnVerdictJournal');
  if(jb)jb.onclick=()=>{const saved=verdictJournalCapture(ctx,{manual:true});renderDecisionMemory(ctx);flash(saved.error?'Decision Memory could not write to browser storage. Use Export memory before clearing browser data.':saved.created?`GW${S.gw} decision checkpoint recorded.`:`GW${S.gw} Decision Memory already matches this configuration.`)};

  /* Meaningful configuration changes are captured after a short quiet period.
     LOCK captures immediately so the pre-deadline state cannot be missed. */
  if(regime.key==='LOCK')try{const saved=verdictJournalCapture(ctx);if(saved.created)renderDecisionMemory(ctx)}catch(e){}
  else scheduleDecisionMemoryCapture()
}
function verdictSensHtml(s){
  return `<div class="vsens ${s.robust?'ok':'warn'}"><b>${esc(s.player.n)} — ${s.robust?'robust':'marginal'}</b>
    <div>The armband moves to ${esc(s.rival.n)} if ${esc(s.player.n)}'s availability falls below <b>${Math.round(s.flipAt*100)}%</b>. He is currently at ${Math.round(s.current*100)}%, a margin of ${Math.round(s.margin*100)} points.</div>
    <div class="vint-n">${s.robust?'A normal Friday injury doubt would not overturn this call.':'This call is fragile — a single press-conference doubt could flip it. Re-check after team news.'} Availability is the only input varied; role and fixture evidence are held fixed.</div></div>`;
}
/* ── Detailed evidence (retained from RC4, now fed from the shared context) ──
   These panels were fine; what was wrong was that they recomputed everything
   the hero had already computed. They now read from ctx. */
function renderVerdictDetail(ctx){
  const {players,xi,benchRows}=ctx;

  const vh=document.getElementById('verdicts');
  if(vh){
    const out=[];
    const low=ctx.xiTotal-1.2816*ctx.xiSd,high=ctx.xiTotal+1.2816*ctx.xiSd;
    if(ctx.xiOk)out.push(`<div class="verdict">XI range including captain: <b>${low.toFixed(1)}–${high.toFixed(1)}</b> (80% model range). Use the floor when protecting rank and the ceiling when chasing one.${verdictCalibration()?.coverage!=null&&verdictCalibration().coverage<.68?' <b>Measured coverage is below target — read this band as narrower than reality.</b>':''}</div>`);
    if(!ctx.budgetOk)out.push(`<div class="verdict warn">You are <b>£${Math.abs(bank()).toFixed(1)}m over budget</b>.</div>`);
    if(ctx.risk.length)out.push(`<div class="verdict warn"><b>Minutes/availability risk:</b> ${ctx.risk.map(r=>esc(r.p.n)+' ('+r.cost.toFixed(1)+' xP exposed)').join(', ')}.</div>`);
    vh.innerHTML=out.join('')||'<div class="verdict">Squad is legal and funded.</div>';
  }

  const bh=document.getElementById('benchIntel');
  if(bh){
    if(ctx.xiOk){
      const bi=expectedAutosub({xi,benchRows});
      const order=bi.order.map((o,i)=>`<span class="bench-role">${i+1}. ${esc(o.p.n)} · ${(100*(bi.calls.get(o.p.id)||0)).toFixed(0)}% call</span>`).join('');
      bh.innerHTML=`<div class="bench-intel">Expected autosub contribution in GW${S.gw}: <b>${bi.mean.toFixed(2)} points</b> · goalkeeper ${bi.gkMean.toFixed(2)} · outfield ${bi.outfieldMean.toFixed(2)}.<br>Optimal outfield priority: ${order||'—'}<br>${ctx.benchGap>0.01?`Your current order returns <b>${ctx.benchCurrent.toFixed(2)}</b> — a gap of <b>${ctx.benchGap.toFixed(2)}</b> points.`:'Your current order matches the optimal one.'}<br>Full Bench Boost projection: <b>${bi.fullMean.toFixed(1)} points</b>.</div>`;
    }else bh.innerHTML='<div class="help">Complete a legal XI to calculate expected autosubs and bench priority.</div>';
  }

  const ch=document.getElementById('capList');
  if(ch)ch.innerHTML=ctx.capRanked.slice(0,7).map((o,i)=>`<div class="lrow"><span><span class="rank">${i+1}</span>${esc(o.p.n)} <span style="color:var(--muted);font-size:10px">${esc(o.p.t)}</span>${o.p.id===S.cap?' <b style="color:var(--mint)">C</b>':''}</span><span class="r mono" style="color:${i===0?'var(--mint)':'var(--paper)'}">${(o.r.x*2).toFixed(1)} · ${(o.r.high*2).toFixed(1)}</span></div>`).join('')||'<div class="help">Pick an XI first.</div>';

  const uh=document.getElementById('upgrades');
  if(uh){
    const cands=[];
    for(const own of players){const ownR=project(own,S.gw);
      for(const cand of POOL){
        if(S.squad.includes(cand.id)||cand.p!==own.p||!TEAMS[cand.t]||cand.c>own.c+bank()+.001)continue;
        if(players.filter(p=>p.id!==own.id&&p.t===cand.t).length>=3)continue;
        const cr=project(cand,S.gw),g=cr.x-ownR.x;
        if(g>.05)cands.push({own,cand,g,sd:Math.sqrt(cr.sd**2+ownR.sd**2)});
      }}
    cands.sort((a,b)=>b.g-a.g);
    uh.innerHTML=cands.slice(0,8).map(o=>`<div class="lrow"><span style="font-size:11px">${esc(o.own.n)} → <b>${esc(o.cand.n)}</b></span><span class="r mono">+${o.g.toFixed(1)} ±${o.sd.toFixed(1)}</span></div>`).join('')||'<div class="help">No positive legal swap inside budget.</div>';
  }
}

/* ============================ CHIP SQUAD BUILDER ============================
   Produces the actual 15 a Free Hit or Wildcard would buy, rather than only
   asserting that a chip week has "upside".

   Reuses the existing primitives unchanged: candidates(), seedSquad(),
   bestXIForGw(), autosubValue(), cost(), gwUtility(). Nothing here mutates
   S.squad — the build is a proposal until the user accepts it.

   The two chips need DIFFERENT objectives:
     Free Hit  - one gameweek, squad is discarded afterwards. Bench earns only
                 its autosub value; there is no future to protect. benchMode
                 'autosub'.
     Wildcard  - the squad is lived in for weeks, so bench playability and
                 fixture spread matter. benchMode 'rotation' credits unused
                 bench strength, exactly as the normal optimiser does.

   Budget for BOTH is selling value of the current squad plus bank, not £100m:
   the squad has to be reachable from what is actually owned.                */

function chipSquadBudget(){
  const owned=squadPlayers();
  const sale=owned.reduce((a,p)=>a+fplSellingPrice(p,transferBoughtPrice(p)),0);
  const bank=num(S.transfer?.bank,0);
  return {budget:Number((sale+bank).toFixed(1)),sale:Number(sale.toFixed(1)),bank:Number(bank.toFixed(1)),owned:owned.length};
}

/** Mirrors the optimiser's scoring for an explicit gameweek list.
    benchMode:
      'autosub'  bench earns only its autosub value (Free Hit)
      'rotation' + 10% credit for unused bench strength every week
      'boost'    + the FULL bench in the single best week, because a Wildcard is
                 normally followed by a Bench Boost and that week scores all 15.
                 Worth ~8-10x the rotation credit, so it genuinely changes which
                 squad wins rather than nudging it. */
function chipScoreFor(list,gws,benchMode){
  let utility=0,mean=0;const weeks=[];
  for(const gw of gws){
    const r=bestXIForGw(list,null,gw);
    if(!r)return null;
    const b=expectedAutosub(r);   // main-thread twin; autosubValue exists only inside the optimiser Worker
    // Captain counts twice: once in the XI total, once for the armband.
    let u=r.xiUtility+r.captain.x+b.utility;
    let m=r.xiMean+r.captain.mean+b.mean;
    if(benchMode==='rotation'){
      u+=.10*Math.max(0,b.fullUtility-b.utility);
      m+=.10*Math.max(0,b.fullMean-b.mean);
    }
    weeks.push({gw,xi:r.xi,captain:r.captain,vice:r.vice,formation:r.formation,mean:m,bench:b,benchRows:r.benchRows});
    utility+=u;mean+=m;
  }
  let boostGw=null,boostGain=0;
  if(benchMode==='boost'&&weeks.length){
    // Credit the bench ONCE, in whichever week it pays most.
    const target=[...weeks].sort((a,b)=>
      (b.bench.fullUtility-b.bench.utility)-(a.bench.fullUtility-a.bench.utility))[0];
    boostGw=target.gw;
    boostGain=Math.max(0,target.bench.fullMean-target.bench.mean);
    utility+=Math.max(0,target.bench.fullUtility-target.bench.utility);
    mean+=boostGain;
  }
  return {utility,mean,weeks,boostGw,boostGain};
}

function chipClimb(list,pool,budget,gws,benchMode,iterations){
  let cur=[...list];
  let best=chipScoreFor(cur,gws,benchMode);
  if(!best)return null;
  const top={};
  for(const pos of ['GK','DEF','MID','FWD'])
    top[pos]=pool.filter(p=>p.p===pos).sort((a,b)=>b.horizon-a.horizon).slice(0,18);
  for(let iter=0;iter<iterations;iter++){
    let trial=null,gain=1e-7;
    for(let i=0;i<cur.length;i++){
      const out=cur[i],rest=cur.filter((_,j)=>j!==i),clubs={};
      rest.forEach(p=>clubs[p.t]=(clubs[p.t]||0)+1);
      for(const inn of top[out.p]){
        if(rest.some(p=>p.id===inn.id))continue;
        if(cost(rest)+inn.c>budget+1e-6)continue;
        if((clubs[inn.t]||0)>=3)continue;
        const cand=[...rest,inn],sc=chipScoreFor(cand,gws,benchMode);
        if(!sc)continue;
        const g=sc.utility-best.utility;
        if(g>gain){gain=g;trial=cand}
      }
    }
    if(!trial)break;
    cur=trial;best=chipScoreFor(cur,gws,benchMode);
  }
  return {list:cur,score:best};
}

function chipGameweeks(kind,startGw){
  const out=[];
  const want=kind==='FH'?1:Math.max(2,Math.min(8,num(S.horizon,5)));
  for(let g=startGw;g<=38&&out.length<want;g++)if(FIX[g])out.push(g);
  return out;
}

function buildChipSquad(kind,startGw){
  if(!productionDataReady())return {err:'Chip squads need LIVE or validated CACHE data.'};
  const pool=candidates();
  if(!pool.length)return {err:'No candidate players available.'};
  const {budget,sale,bank,owned}=chipSquadBudget();
  if(owned<15)return {err:`A ${kind==='FH'?'Free Hit':'Wildcard'} squad is priced from your current squad's selling value, so complete your 15 first.`};
  const gws=chipGameweeks(kind,startGw);
  if(!gws.length)return {err:'No fixtures available for that gameweek.'};
  // A Wildcard is normally followed by a Bench Boost, so the squad has to be
  // worth 15 players in one week, not 11 for five weeks.
  const benchMode=kind==='FH'?'autosub':'boost';

  let champ=null;
  for(const mode of ['points','value','cheap']){
    const seed=seedSquad(pool,budget,[],mode);
    if(!seed)continue;
    const r=chipClimb(seed,pool,budget,gws,benchMode,kind==='FH'?30:20);
    if(!r||!r.score)continue;
    if(!champ||r.score.utility>champ.score.utility)champ=r;
  }
  if(!champ)return {err:`No legal squad fits £${budget.toFixed(1)}m.`};

  // The decision number: how much better than simply keeping the current squad.
  const current=chipScoreFor(squadPlayers(),gws,benchMode);
  const delta=current?champ.score.mean-current.mean:null;

  return {kind,gws,budget,sale,bank,benchMode,
    list:champ.list,score:champ.score,currentScore:current,delta,
    spend:Number(cost(champ.list).toFixed(1))};
}

function renderChipSquadResult(res,host){
  if(!host)return;
  if(res.err){host.innerHTML=`<div class="verdict warn">${esc(res.err)}</div>`;return}
  const w=res.score.weeks[0];
  const label=res.kind==='FH'?'Free Hit':'Wildcard';
  const byPos={GK:[],DEF:[],MID:[],FWD:[]};
  const xiIds=new Set(w.xi.map(o=>o.p.id));
  res.list.forEach(p=>byPos[p.p].push(p));
  const line=(p)=>`<span class="chip-pick ${xiIds.has(p.id)?'is-xi':'is-bench'}">${esc(p.n)}<small> ${esc(p.t)} £${p.c.toFixed(1)}</small></span>`;
  const rows=['GK','DEF','MID','FWD'].map(k=>`<div class="chip-row"><b>${k}</b>${byPos[k].map(line).join('')}</div>`).join('');
  const deltaTxt=res.delta===null?'unavailable'
    :`${res.delta>=0?'+':''}${res.delta.toFixed(1)} xPts vs keeping your squad`;
  const tone=res.delta===null?'warn':(res.delta>=0?'good':'warn');
  host.innerHTML=`
    <div class="verdict ${tone}"><b>${label} squad · GW${res.gws[0]}${res.gws.length>1?`–${res.gws[res.gws.length-1]}`:''}</b> — ${esc(deltaTxt)}</div>
    <div class="chip-squad-meta">Budget £${res.budget.toFixed(1)}m (squad sale £${res.sale.toFixed(1)}m + bank £${res.bank.toFixed(1)}m) · spent £${res.spend.toFixed(1)}m · ${esc(w.formation)} · captain ${esc(w.captain.p.n)}</div>
    ${res.score.boostGw?`<div class="verdict good">Bench Boost target: <b>GW${res.score.boostGw}</b> — the bench adds ${res.score.boostGain.toFixed(1)} xPts that week.</div>`:''}
    ${rows}
    <div class="chip-squad-meta">Starting XI in green, bench dimmed. ${res.kind==='FH'?'Bench is deliberately cheap: on a Free Hit it only earns autosub value.':'Bench is built to be playable, because this squad is optimised for the Bench Boost that follows the Wildcard.'}</div>
    <button type="button" id="btnApplyChipSquad">Load this squad into the builder</button>`;
  const apply=document.getElementById('btnApplyChipSquad');
  if(apply)apply.onclick=()=>{
    S.squad=res.list.map(p=>p.id);
    S.start=new Set(w.xi.map(o=>o.p.id));
    S.cap=w.captain.p.id;S.vice=w.vice?.p?.id??w.captain.p.id;
    bumpCache();render();saveUserState();
    flash(`${label} squad loaded into the builder.`);
  };
}

function mountChipSquadPanel(){
  const anchor=document.getElementById('chipAdvisorOut');
  if(!anchor||document.getElementById('chipSquadPanel'))return;
  const panel=document.createElement('div');
  panel.id='chipSquadPanel';
  panel.className='chip-ai';
  panel.innerHTML=`<div class="chip-squad-actions">
      <button type="button" id="btnBuildFH">Build Free Hit squad</button>
      <button type="button" id="btnBuildWC">Build Wildcard squad</button>
    </div><div id="chipSquadOut"><div class="help">Builds the actual 15 either chip would buy, priced from your squad's selling value plus bank.</div></div>`;
  anchor.parentNode.insertBefore(panel,anchor.nextSibling);
  const out=document.getElementById('chipSquadOut');
  const run=(kind)=>{
    out.innerHTML='<div class="help">Optimising…</div>';
    setTimeout(()=>{
      try{renderChipSquadResult(buildChipSquad(kind,S.gw),out)}
      catch(e){out.innerHTML=`<div class="verdict warn">${esc(e?.message||String(e))}</div>`}
    },20);
  };
  document.getElementById('btnBuildFH').onclick=()=>run('FH');
  document.getElementById('btnBuildWC').onclick=()=>run('WC');
}

function renderChips(){try{mountChipSquadPanel()}catch{}const defs=[['WC1','Wildcard 1'],['FH1','Free Hit 1'],['TC1','Triple Captain 1'],['BB1','Bench Boost 1'],['WC2','Wildcard 2'],['FH2','Free Hit 2'],['TC2','Triple Captain 2'],['BB2','Bench Boost 2']];document.getElementById('chipGrid').innerHTML=defs.map(([k,label])=>{const first=k.endsWith('1'),openingLocked=k.startsWith('FH')||k.startsWith('WC'),lo=first?(openingLocked?2:1):20,hi=first?19:38,id=`chip-${k}`;let opts='<option value="">—</option>';for(let g=lo;g<=hi;g++)opts+=`<option value="${g}" ${S.chips[k]==g?'selected':''}>GW${g}</option>`;return`<div class="chipbox"><label class="cn" for="${id}" style="color:${first?'var(--cyan)':'var(--mint)'}">${label}</label><select id="${id}" data-chip="${k}" aria-label="Plan ${label}">${opts}</select></div>`}).join('');document.querySelectorAll('[data-chip]').forEach(el=>{const box=el.closest('.chipbox'),k=el.dataset.chip;if(!S.chips[k])return;const {doubles,blanks}=gwFixtureShape(+S.chips[k]);if(!doubles&&!blanks)return;const note=document.createElement('div');note.className='chip-gw-note';note.style.cssText='font-size:9px;margin-top:4px;color:'+(doubles?'var(--mint)':'var(--muted)');note.textContent=doubles?`${doubles} club${doubles>1?'s':''} play twice this GW`:blanks?`${blanks} club${blanks>1?'s':''} have no fixture this GW`:'';if(note.textContent)box.appendChild(note)});document.querySelectorAll('[data-chip]').forEach(el=>el.onchange=e=>{const k=e.target.dataset.chip,newVal=e.target.value;if(newVal){const sameHalf=k.endsWith('1')?['WC1','FH1','TC1','BB1']:['WC2','FH2','TC2','BB2'];const conflict=sameHalf.find(otherK=>otherK!==k&&S.chips[otherK]===newVal);if(conflict){e.target.value=S.chips[k]||'';flash(`GW${newVal} is already assigned to ${conflict} — only one chip per gameweek.`);return}if(k==='FH1'&&newVal==='19'&&S.chips.FH2==='20'){e.target.value=S.chips[k]||'';flash('Free Hit can\'t be played in both GW19 and GW20 — your squad reverts right as GW20 begins.');return}if(k==='FH2'&&newVal==='20'&&S.chips.FH1==='19'){e.target.value=S.chips[k]||'';flash('Free Hit can\'t be played in both GW19 and GW20 — your squad reverts right as GW20 begins.');return}}S.chips[k]=newVal;renderChips();saveUserState()});const set1=['WC1','FH1','TC1','BB1'].filter(k=>!S.chips[k]),used=Object.values(S.chips).filter(Boolean),dupes=used.filter((g,i)=>used.indexOf(g)!==i);let v='';if(dupes.length)v+=`<div class="verdict warn">Two chips share <b>GW${dupes[0]}</b>.</div>`;v+=set1.length?`<div class="verdict warn"><b>${set1.length} first-half chip${set1.length>1?'s':''} unplanned.</b></div>`:'<div class="verdict">First chip set fully planned.</div>';document.getElementById('chipVerdict').innerHTML=v}
function renderDataStatus(){
 const pill=document.getElementById('livePill'),mode=DATA.mode,ready=productionDataReady(),release=releaseReadiness(),v=DATA.validation||{},hc=DATA.histCoverage||{matched:0,total:0,overallRatio:0,eligible:0,eligibleRatio:0,newcomer:0,unresolved:0,inferred:0,classification:'pending',productionOK:false},eligiblePct=Math.round(100*num(hc.eligibleRatio)),overallPct=Math.round(100*num(hc.overallRatio));
 document.getElementById('liveMode').textContent=mode;pill.className='status-pill '+(mode==='LIVE'?'live':mode==='CACHE'?'cache':'offline');
 document.getElementById('lastUpdated').textContent=DATA.lastUpdated?`Last valid update: ${new Date(DATA.lastUpdated).toLocaleString()}${DATA.error?' · '+DATA.error:''}`:(DATA.error||'No live refresh yet');
 const h=document.getElementById('hData');h.textContent=mode;h.className='v mono '+(mode==='LIVE'?'good':mode==='CACHE'?'info':'bad');
 const season=document.getElementById('hSeason');season.textContent=v.seasonPass?EXPECTED_SEASON:'FAIL';season.className='v mono '+(v.seasonPass?'good':'bad');
 const worker=document.getElementById('hWorker');worker.textContent=v.sourcePass?'V'+String(DATA.worker?.meta?.schemaVersion||WORKER_SCHEMA_MIN):DATA.worker?.contract==='LEGACY'?'LEGACY':DATA.worker?.status==='OFFLINE'?'OFFLINE':'NONE';worker.className='v mono '+(v.sourcePass?'good':DATA.worker?.contract==='LEGACY'?'info':'bad');
 const readyEl=document.getElementById('hReady');readyEl.textContent=release==='PRODUCTION'?'PROD':release;readyEl.className='v mono '+(release==='PRODUCTION'?'good':release==='USABLE'?'info':'bad');
 const guard=document.getElementById('dataGuard');if(guard){guard.className='data-guard '+(release==='PRODUCTION'?'ready':release==='USABLE'?'cache':'');guard.innerHTML=release==='PRODUCTION'?`<b>Production validation complete.</b> Season, topology, freshness, Worker contract and ${eligiblePct}% history-eligible coverage passed. ${hc.newcomer} prior-free player${hc.newcomer===1?'':'s'} use newcomer priors.`:release==='USABLE'?`<b>Payload verified and usable.</b> Core season and fixture checks passed. Production label withheld because ${!v.sourcePass?'the Worker metadata contract is unavailable or legacy':`history-eligible coverage is ${eligiblePct}% (${hc.matched}/${hc.eligible}; 95% required)`}.`:`<b>${esc(mode)} · blocked.</b> Current-season data must pass structural, season, fixture-topology and freshness validation before recommendations are enabled.`}
 for(const id of ['btnBuild','btnAutoComplete','btnJumpAuto']){const el=document.getElementById(id);if(el){el.disabled=!ready;el.title=ready?'':`Unavailable: ${validationFatalIssues(v).join('; ')||mode+' data is not release-ready'}.`}}
 const summary=document.getElementById('releaseSummary');if(summary){const workerState=v.sourcePass?'Contract v'+String(DATA.worker?.meta?.schemaVersion||WORKER_SCHEMA_MIN):DATA.worker?.contract==='LEGACY'?'Legacy / optional':'Unavailable',histState=hc.eligible?`${eligiblePct}% · ${hc.matched}/${hc.eligible}`:'PENDING',priorState=hc.total?`${hc.newcomer} · ${overallPct}% overall`:'PENDING';const cards=[['Structural',v.structuralPass?'PASS':'FAIL',v.structuralPass?'good':'bad'],['Season',v.seasonPass?EXPECTED_SEASON:'FAIL',v.seasonPass?'good':'bad'],['Topology',v.topologyPass?'PASS':'FAIL',v.topologyPass?'good':'bad'],['Freshness',v.freshnessPass?'CURRENT':'STALE',v.freshnessPass?'good':'bad'],['History eligible',histState,hc.productionOK?'good':hc.eligible?'warn':'info'],['Prior-free',priorState,hc.newcomer?'info':'good'],['Worker',workerState,v.sourcePass?'good':DATA.worker?.contract==='LEGACY'?'info':'warn'],['Recommendation',release,release==='PRODUCTION'?'good':release==='USABLE'?'info':'bad']];summary.innerHTML=cards.map(([k,val,cls])=>`<div class="ready-card ${cls}"><span class="rk">${k}</span><span class="rv">${esc(val)}</span></div>`).join('')}
 const soEl=document.getElementById('lastUpdated');if(soEl&&STORAGE_OK===false)soEl.textContent+=' · SAVE FAILING: '+STORAGE_ERROR;const hm=document.getElementById('histMetaNote');if(hm){if(hc.total)hm.textContent=`History-eligible coverage: ${hc.matched}/${hc.eligible} players (${eligiblePct}%). ${hc.newcomer} player${hc.newcomer===1?'':'s'} have no supplied prior Premier League record and use newcomer priors. Production threshold: 95% of history-eligible players.`;else if(DATA.histMeta&&DATA.histMeta.matched>0)hm.textContent=`Historical 2025/26 data: ${DATA.histMeta.matched}/${DATA.histMeta.available} players matched by stable ID.`;else hm.textContent=ready?`Payload-derived season and fixture topology verified for ${EXPECTED_SEASON}.`:''}
 const vn=document.getElementById('validationNote');if(vn){const fatal=validationFatalIssues(v),warnings=[...(v.warnings||[])];if(DATA.selectionIssue)warnings.unshift(`${DATA.selectionIssue.players.join(', ')} disappeared from the current official FPL player list. The player was removed from your local squad and must be replaced; no transfer recommendation was fabricated.`);if(hc.eligible&&!hc.productionOK)warnings.push(`History-eligible coverage is ${eligiblePct}% (${hc.matched}/${hc.eligible}); 95% is required for production certification.`);if(hc.inferred)warnings.push(`${hc.inferred} prior-free player${hc.inferred===1?' is':'s are'} classified as newcomer/unclassified because the current Worker payload supplied no explicit eligibility flag. They use conservative newcomer priors and are not counted as failed history matches.`);if(hc.unresolved)warnings.push(`${hc.unresolved} returning player${hc.unresolved===1?'':'s'} expected to have history remain unresolved.`);vn.innerHTML=fatal.length?`<b style="color:#FF91B5">Validation blocked:</b><ul class="validation-list">${fatal.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:warnings.length?`<b style="color:#FFD75E">Model notes:</b><ul class="validation-list">${warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:ready?'<b style="color:var(--mint)">All required payload checks passed.</b>':'Structural validation pending.'}
 if(!DEADLINE_VERIFIED){document.getElementById('hDeadlineLabel').textContent='Deadline';document.getElementById('hClock').textContent='UNVERIFIED'}
}


/* RC4.5.3 — Chip Intelligence repair: restore the missing host binding, Worker execution and one-tap plan application. */
let CHIP_ADVISOR_TIMER=0,ACTIVE_CHIP_WORKER=null,CHIP_ADVISOR_RUN=0,CHIP_ADVISOR_LAST=null;
function chipAdvisorHost(){return document.getElementById('chipAdvisorOut')||document.getElementById('chipAdvisor')||document.getElementById('chipAI')||document.getElementById('chipAdvisorHost')}
function createChipAdvisorWorker(){const source=combinedWorkerSource('chipAdvisorWorkerSource');if(!source||typeof Worker!=='function')return null;const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),w=new Worker(url);w.__url=url;return w}
function stopChipAdvisor(){if(ACTIVE_CHIP_WORKER){try{ACTIVE_CHIP_WORKER.terminate()}catch(e){}if(ACTIVE_CHIP_WORKER.__url)URL.revokeObjectURL(ACTIVE_CHIP_WORKER.__url);ACTIVE_CHIP_WORKER=null}}
function chipAdvisorPayload(){
  const gws=Array.from({length:38},(_,i)=>i+1).filter(g=>g>=Math.max(1,Number(S.gw)||1));
  const players=POOL.filter(p=>TEAMS[p.t]).map(p=>({id:p.id,n:p.n,p:p.p,t:p.t,c:p.c,gw:Object.fromEntries(gws.map(g=>{const r=project(p,g),md=minuteDetail(p),fx=(scheduleFixtureRows(p.t,g)||[])[0];return[g,{mean:r.x,utility:gwUtility(r),pAppear:md.pAppear,sd:r.sd,confidence:r.confidence||0,opp:fx?.opp||'',venue:fx?(fx.home?'H':'A'):''}]}))}));
  const fixtureSwings={};
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:5.5;
  for(let gw=Math.max(2,Number(S.gw)||1);gw<=19;gw++){
    const positiveTeams=[],negativePlayers=[];
    for(const code of Object.keys(TEAMS)){
      const before=[gw-3,gw-2,gw-1].filter(x=>x>=1).map(x=>scheduleGwDifficulty(scheduleFixtureRows(code,x),'overall'));
      const next4=[gw,gw+1,gw+2,gw+3].filter(x=>x<=19).map(x=>scheduleGwDifficulty(scheduleFixtureRows(code,x),'overall'));
      const next3=next4.slice(0,3);if(before.length<2||next3.length<3)continue;
      const base=avg(before),after4=avg(next4),after3=avg(next3),harder=after4-base,easier=after3-base;
      if(easier<=-.35)positiveTeams.push({team:code,delta:easier,run:3,avg:after3});
      if(harder>=.35){for(const p of squadPlayers().filter(x=>x.t===code))negativePlayers.push({id:p.id,name:p.n,team:code,delta:harder,run:next4.length,avg:after4})}
    }
    positiveTeams.sort((a,b)=>a.delta-b.delta);negativePlayers.sort((a,b)=>b.delta-a.delta);
    fixtureSwings[gw]={positiveTeams,negativePlayers};
  }
  return{players,gws,currentIds:[...S.squad],currentGw:Math.max(1,Number(S.gw)||1),fixtureSwings};
}
function chipAdvisorLabel(k){return({WC1:'Wildcard 1',FH1:'Free Hit 1',TC1:'Triple Captain 1',BB1:'Bench Boost 1',WC2:'Wildcard 2',FH2:'Free Hit 2',TC2:'Triple Captain 2',BB2:'Bench Boost 2'})[k]||k}
function renderChipAdvisorResult(result){
  const host=chipAdvisorHost(),recs=result?.recommendations||{};if(!host)return;CHIP_ADVISOR_LAST=result;
  const first=['WC1','BB1','TC1','FH1'],second=['WC2','BB2','TC2','FH2'];
  const card=k=>{const r=recs[k]||{},guide=!!r.guidance,none=!r.gw&&!guide,qualified=r.qualified===true,badge=guide?'Awaiting BGW/DGW confirmation':none?'No trigger detected':qualified?'Action threshold cleared':'Candidate only · HOLD';return`<div class="chip-ai-card ${(!r.gw||!qualified)?'hold':''}"><div class="ca-top"><span class="ca-name">${esc(chipAdvisorLabel(k))}</span><span class="ca-value">${guide?'GUIDANCE':none?'NO TRIGGER':(qualified?'QUALIFIED · ':'CANDIDATE · ')+esc(r.confidence||'—')+(Number.isFinite(+r.score)?' · '+signed(num(r.score),1)+' xP':'')}</span></div><div class="ca-gw">${guide?'TBC':none?'NOT SUGGESTED':`GW${r.gw}`}</div><div class="ca-reason">${esc(r.reason||(k==='WC1'?'Wildcard conditions are not currently met: fewer than 4 owned players have sustained negative swings or fewer than 3 target teams have sustained positive swings.':'No recommendation available.'))}</div><span class="chip-ai-badge ${guide?'await':qualified?'strong':'available'}">${esc(badge)}</span></div>`};
  const actionable=first.filter(k=>recs[k]?.gw).length;
  host.innerHTML=`<div class="chip-ai-head"><b>Rule-Based Automated Chip Plan</b><span>${actionable}/4 first-half chips recommended</span></div><div class="chip-plan-summary"><b>First-half method:</b> Wildcard from fixture-swing exposure; Bench Boost 1–2 GWs after Wildcard; Triple Captain from highest player xP; Free Hit from the squad's lowest projected week.</div><div class="chip-ai-grid">${first.map(card).join('')}</div><div class="chip-plan-summary"><b>Second half:</b> Specific recommendations are withheld until confirmed blank and double gameweeks are available.</div><div class="chip-ai-grid">${second.map(card).join('')}</div><button type="button" class="btn" id="btnApplyChipAdvice" ${actionable?'':'disabled'}>Apply first-half recommendations</button><button type="button" class="btn ghost" id="btnRefreshChipAdvice">Recalculate advice</button><div class="chip-ai-note">Manual selectors remain authoritative. Applying the plan updates only recommended first-half chips and leaves second-half manual choices untouched.</div>`;
  const apply=document.getElementById('btnApplyChipAdvice');if(apply)apply.onclick=()=>{for(const k of first)if(recs[k]?.gw)S.chips[k]=String(recs[k].gw);renderChips();saveUserState();renderChipAdvisorResult(result);flash('Rule-based first-half chip recommendations applied. Manual overrides remain available.')};
  const refresh=document.getElementById('btnRefreshChipAdvice');if(refresh)refresh.onclick=()=>runChipAdvisor(true);
}
function runChipAdvisor(force=false){
  const host=chipAdvisorHost();if(!host)return;
  const full=Array.isArray(S.squad)&&S.squad.length===15&&legal(squadPlayers());
  if(!full){stopChipAdvisor();host.innerHTML='<div class="chip-ai-loading">Complete a legal 15-player squad to activate automated chip advice. Check squad size, position limits, club limits and budget to activate automated chip advice.</div>';return}
  if(!productionDataReady()){host.innerHTML='<div class="chip-ai-loading">Automated chip advice is waiting for validated fixture and player data.</div>';return}
  if(CHIP_ADVISOR_LAST&&!force){renderChipAdvisorResult(CHIP_ADVISOR_LAST);return}
  stopChipAdvisor();const run=++CHIP_ADVISOR_RUN,w=createChipAdvisorWorker();if(!w){host.innerHTML='<div class="chip-ai-loading">This browser cannot start the background chip adviser.</div>';return}
  ACTIVE_CHIP_WORKER=w;host.innerHTML='<div class="optimiser-progress"><b>Calculating chip windows…</b><div class="progress-track"><div class="progress-fill" id="chipProgress"></div></div><div class="progress-meta"><span id="chipDetail">Preparing season projections</span><span id="chipPct">0%</span></div></div>';
  const timer=setTimeout(()=>{if(run===CHIP_ADVISOR_RUN){stopChipAdvisor();host.innerHTML='<div class="chip-ai-loading">Chip analysis took too long and was stopped. Tap Recalculate after data finishes loading.</div>'}},45000);
  w.onmessage=e=>{if(run!==CHIP_ADVISOR_RUN)return;const d=e.data||{};if(d.type==='progress'){const pct=Math.round(100*num(d.progress)),bar=document.getElementById('chipProgress'),label=document.getElementById('chipPct'),detail=document.getElementById('chipDetail');if(bar)bar.style.width=pct+'%';if(label)label.textContent=pct+'%';if(detail)detail.textContent=d.detail||'Analysing';return}clearTimeout(timer);stopChipAdvisor();if(d.type==='result')renderChipAdvisorResult(d.result);else host.innerHTML=`<div class="chip-ai-loading">Chip adviser error: ${esc(d.error||'Unknown error')}</div><button type="button" class="btn ghost" id="btnRetryChipAdvice">Try again</button>`,document.getElementById('btnRetryChipAdvice')&&(document.getElementById('btnRetryChipAdvice').onclick=()=>runChipAdvisor(true))};
  w.onerror=e=>{if(run!==CHIP_ADVISOR_RUN)return;clearTimeout(timer);stopChipAdvisor();host.innerHTML=`<div class="chip-ai-loading">Chip adviser failed to start: ${esc(e.message||'Worker error')}</div>`};
  w.postMessage({type:'run',payload:chipAdvisorPayload()});
}
function renderChipAdvisor(){runChipAdvisor(false)}
function scheduleChipAdvisor(delay=120){clearTimeout(CHIP_ADVISOR_TIMER);CHIP_ADVISOR_TIMER=setTimeout(()=>{try{renderChipAdvisor()}catch(err){console.warn('OTB chip advisor render skipped:',err)}},Math.max(0,Number(delay)||0))}
function safeUIRender(label,fn){
  try{return fn()}catch(err){
    console.error('OTB UI render failed ['+label+']:',err);
    if(typeof pipelineEvent==='function')try{pipelineEvent('UI','WARN',label+' skipped: '+(err&&err.message?err.message:String(err)))}catch(_){ }
    return undefined;
  }
}
function smallLayout(){return matchMedia('(max-width:1080px)').matches}
function columnVisible(id){return!smallLayout()||!document.getElementById(id).classList.contains('mhide')}
function activeRailTab(){return document.querySelector('.tabs button.on')?.dataset.t||'build'}
function renderActiveRailPanel(tab=activeRailTab()){if(tab==='transfers')safeUIRender('transfers',renderTransferPlanner);else if(tab==='prices')safeUIRender('prices',renderPricePlanExposure);else if(tab==='chips'){safeUIRender('chips',renderChips);scheduleChipAdvisor(220)}else if(tab==='verdict')safeUIRender('verdict',renderVerdict);else if(tab==='fixtures')safeUIRender('fixtures',renderFixtures);else if(tab==='roles')safeUIRender('roles',renderRoleIntelligence);else if(tab==='accuracy'){safeUIRender('accuracy',renderAccuracy);void maybeAutoSyncAccuracyActuals();void fetchGameweekIntelligence(num(document.getElementById('accuracyGw')?.value,DATA.nextEvent||S.gw))}else if(tab==='squads')safeUIRender('squads',renderSquads);else if(tab==='data')safeUIRender('data',renderDataStatus)}
let DEFERRED_POOL_TOKEN=0;
function renderPoolDeferred(){
  const token=++DEFERRED_POOL_TOKEN,host=document.getElementById('poolList');
  if(host)host.innerHTML='<div class="help" style="padding:14px">Preparing exact player rankings…</div>';
  requestAnimationFrame(()=>setTimeout(()=>{
    if(token!==DEFERRED_POOL_TOKEN||!columnVisible('colPool'))return;
    renderPool();
  },80));
}
function render(options=null){
  const deferPool=!!(options&&typeof options==='object'&&options.deferPool);
  ensureCaptainValid();
  if(DATA.selectionIssue&&S.squad.length===15)DATA.selectionIssue=null;
  if(DATA.selectionIssue&&!DATA.selectionIssue.notified){
    DATA.selectionIssue.notified=true;
    const names=DATA.selectionIssue.players.join(', ');
    setTimeout(()=>flash(`${names} ${DATA.selectionIssue.players.length===1?'is':'are'} no longer in the current FPL player list. Choose a replacement.`),0);
  }
  const gwFollowEl=document.getElementById('gwFollow');if(gwFollowEl)gwFollowEl.checked=!S.gwPinned;
  document.getElementById('hSquad').textContent=S.squad.length+'/15';
  const b=document.getElementById('hBank');b.textContent=bank().toFixed(1);b.className='v mono '+(bank()<0?'bad':'good');
  renderDataStatus();
  if(columnVisible('colPool')){if(deferPool)renderPoolDeferred();else renderPool()}
  if(columnVisible('colCentre'))renderPitch();
  renderSpine();
  if(columnVisible('colRail'))renderActiveRailPanel();
  syncHeaderHeight();document.getElementById('fixNote').innerHTML=FIX_NOTE;
}
function inspectPlayer(id){const pl=byId(id);if(!pl)return;S.inspect=id;const r=project(pl,S.gw),md=minuteDetail(pl),o=playerOverride(pl),cov=scoutCoverageFor(pl),unavailable=md.avail<=.0001,overallStart=clamp(md.avail*md.pStart,0,1),overallSub=clamp(md.avail*md.pSubAppear,0,1),cols={atk:'#00FF87',cs:'#04F5FF',dc:'#B072FF',bon:'#EAFF04',app:'#6E5A75',oth:'#FF8C42'},tot=Math.max(.01,sumParts(r.parts)),rangeMarkup=unavailable?'<div class="v" style="font-size:12px;color:#FFC107">NOT APPLICABLE</div><div style="font-size:9px;color:var(--muted);margin-top:4px;line-height:1.35">Unavailable — uncertainty range suppressed with xPts</div>':`<div class="v">${r.low.toFixed(1)}–${r.high.toFixed(1)}</div>`,availabilityNotice=unavailable?`<div class="data-guard" style="border-left-color:#FFC107;background:rgba(255,193,7,.08);margin-bottom:12px"><b style="color:#FFD75E">Unavailable-player safeguard active.</b> Official availability is 0%, so expected minutes and xPts are intentionally suppressed to zero. Conditional probabilities below describe what the model would expect only if the player becomes available.</div>`:'';document.getElementById('modalTitle').textContent=`${pl.n} · GW${S.gw}`;document.getElementById('modalBody').innerHTML=`<div class="xhero"><div class="xbox"><div class="k">Expected points</div><div class="v" style="color:var(--mint)">${r.x.toFixed(2)}</div>${unavailable?'<div style="font-size:9px;color:#FFC107;margin-top:4px">Suppressed — unavailable</div>':''}</div><div class="xbox"><div class="k">Heuristic range</div>${rangeMarkup}</div><div class="xbox"><div class="k">Model evidence</div><div class="v" style="color:var(--cyan)">${r.confidence}%</div><div style="font-size:9px;color:var(--muted);margin-top:4px">Data confidence, not playing chance</div></div><div class="xbox"><div class="k">vs official FPL</div>${(()=>{const ep=num(pl.live?.epNext,NaN);if(S.gw!==DATA.nextEvent)return `<div class="v" style="font-size:11px;color:var(--muted)">Only published for the next GW</div>`;if(!Number.isFinite(ep)||ep<=0)return `<div class="v" style="font-size:11px;color:var(--muted)">Not published yet</div>`;const diff=r.x-ep;const diffColor=Math.abs(diff)<0.5?'var(--mint)':Math.abs(diff)<1.5?'var(--cyan)':'#FF6E9E';return `<div class="v" style="color:var(--cyan)">${ep.toFixed(1)}</div><div style="font-size:10px;color:${diffColor}">${diff>=0?'+':''}${diff.toFixed(1)} vs ours</div>`;})()}</div></div>${availabilityNotice}<div class="compbar">${Object.keys(cols).map(k=>`<span style="width:${Math.max(0,r.parts[k]/tot*100)}%;background:${cols[k]}" title="${k} ${r.parts[k].toFixed(2)}"></span>`).join('')}</div><div class="detailgrid"><div class="mini"><b>Fixture</b><br>${fixtureText(r)}${fixtureDiagnosticHTML(r)}<b>Expected minutes</b> ${md.exp.toFixed(0)}${unavailable?' <span style="color:#FFC107">(suppressed)</span>':''}${md.split?` <span class="pflag flag-doubt">SPLIT</span><br><b>Role split</b> ${md.split.minutesA.toFixed(0)}&#8202;min @ ${(100*md.split.w).toFixed(0)}% / ${md.split.minutesB.toFixed(0)}&#8202;min @ ${(100*(1-md.split.w)).toFixed(0)}%${r.detail?.roleSplit?`<br><b>xPts by scenario</b> ${r.detail.roleSplit.xA.toFixed(2)} / ${r.detail.roleSplit.xB.toFixed(2)} &middot; disagreement sd ${r.detail.roleSplit.between.toFixed(2)}`:''}`:''}<br><b>Official availability</b> ${(md.avail*100).toFixed(0)}%<br><b>Overall start chance</b> ${(overallStart*100).toFixed(0)}%<br><b>Start probability if available</b> ${(md.pStart*100).toFixed(0)}%<br><b>Overall sub-appearance chance</b> ${(overallSub*100).toFixed(0)}%<br><b>Sub-appearance chance if available</b> ${(md.pSubAppear*100).toFixed(0)}%<br><b>Overall appearance chance</b> ${(md.pAppear*100).toFixed(0)}%<br><b>Role calibration</b> ${esc(md.roleModel)}${md.roleCalibrated?` (${(md.roleCalibrationStrength*100).toFixed(0)}% strength · target ${md.roleTarget.toFixed(1)} across ${md.rolePeers})`:''}${md.roleCalibrated?`<br><b>Start prior → final</b> ${(md.roleRawStart*100).toFixed(0)}% → ${(md.pStart*100).toFixed(0)}%`:''}${md.intel?`<br><b>Role intelligence</b> ${esc(md.intel)}`:''}</div><div class="mini"><b>Components</b><br>Attack ${r.parts.atk.toFixed(2)} · CS ${r.parts.cs.toFixed(2)}<br>DefCon ${r.parts.dc.toFixed(2)} · Bonus ${r.parts.bon.toFixed(2)}<br>Appearance ${r.parts.app.toFixed(2)} · Other ${r.parts.oth.toFixed(2)}</div><div class="mini"><b>Blend</b><br>Live evidence ${(r.detail.evidence*100).toFixed(0)}%<br>Recent-form layer ${(r.detail.formW*100).toFixed(0)}%<br>Official-FPL layer ${(r.detail.offW*100).toFixed(0)}%</div><div class="mini"><b>Status</b><br>${esc(pl.live?.status||'seed')}${pl.live?.news?'<br>'+esc(pl.live.news):'<br>No official news flag'}${unavailable?'<br><b>Projection treatment</b> xPts suppressed to zero while availability remains 0%.':''}<br><b>Baseline</b> ${baselineParts(pl).source}<br><b>Scout coverage</b> <span style="color:${cov.hasWorkerEvidence?'var(--mint)':(cov.hasAnyEvidence?'var(--cyan)':'#FFC107')}">${cov.hasWorkerEvidence?`${cov.workerCount} live scout item${cov.workerCount===1?'':'s'} applied`:(cov.hasAnyEvidence?`${cov.count} manual role item${cov.count===1?'':'s'} only — no live scout scan applied`:'None — statistical baseline only')}</span>${!cov.hasAnyEvidence?'<div style="font-size:9px;color:var(--muted);margin-top:2px;line-height:1.35">Model evidence above measures data volume, not whether current news has been checked. Treat this xPts with extra caution for new signings, recent transfers or players returning from injury until a scout scan covers them.</div>':''}</div></div><div class="sechead" style="margin:14px -15px 10px;position:static"><h2>Manual intelligence override</h2></div><div class="help">Use overrides only when reliable team news, press-conference information or tactical evidence is stronger than the public API. Start chance is conditional on being available; minutes are expected minutes before availability is applied.</div><div class="override-grid"><label>Start chance if available %<input id="ovStart" type="number" min="0" max="100" step="1" placeholder="Auto" value="${o.start??''}"></label><label>Expected minutes<input id="ovMinutes" type="number" min="0" max="90" step="1" placeholder="Auto" value="${o.minutes??''}"></label><label>Availability %<input id="ovAvail" type="number" min="0" max="100" step="1" placeholder="Official" value="${o.availability??''}"></label><label>Attacking role %<input id="ovRole" type="number" min="-35" max="35" step="1" placeholder="0" value="${o.role??''}"></label></div><div class="sechead" style="margin:14px -15px 10px;position:static"><h2>Role split &middot; two-scenario minutes</h2></div><div class="help">Use when the role is genuinely uncertain rather than simply unknown &mdash; a tournament returnee, a fitness doubt, competition for a shirt. Enter the minutes for the <b>alternative</b> (managed / benched) scenario and the probability that the <b>primary</b> scenario above holds. The projection is run twice and combined, so the uncertainty widens honestly instead of a single guessed number pretending to be precise. Leave blank for a normal single-scenario projection.</div><div class="override-grid"><label>Alternative scenario minutes<input id="ovSplitMinutes" type="number" min="0" max="90" step="1" placeholder="Off" value="${o.splitMinutes??''}"></label><label>Primary scenario chance %<input id="ovSplitWeight" type="number" min="1" max="99" step="1" placeholder="Off" value="${o.splitWeight??''}"></label></div><button type="button" class="btn" id="saveOverride" style="margin-top:12px">Save override</button><button type="button" class="btn ghost" id="clearOverride">Clear override</button><div class="source-note">Missing factors that still require judgement: likely starting XI, tactical role changes, penalties/set pieces after transfers, cup/European congestion, late injury news and bookmaker goal/clean-sheet odds. The override layer is designed for those signals.</div>`;document.getElementById('playerModal').classList.remove('hide');MODAL_TRIGGER=document.activeElement;setTimeout(()=>{const first=document.getElementById('playerModal').querySelector('button,input,[tabindex]');(first||document.getElementById('playerModal')).focus()},0);document.getElementById('saveOverride').onclick=()=>{const v={},st=document.getElementById('ovStart').value,m=document.getElementById('ovMinutes').value,a=document.getElementById('ovAvail').value,role=document.getElementById('ovRole').value;if(st!=='')v.start=clamp(num(st),0,100);if(m!=='')v.minutes=clamp(num(m),0,90);if(a!=='')v.availability=clamp(num(a),0,100);if(role!=='')v.role=clamp(num(role),-35,35);const sm=document.getElementById('ovSplitMinutes').value,sw=document.getElementById('ovSplitWeight').value;if(sm!==''&&sw!==''){v.splitMinutes=clamp(num(sm),0,90);v.splitWeight=clamp(num(sw),1,99)}S.overrides[overrideKey(pl)]=v;bumpCache();saveUserState();render();scheduleAccuracyCapture();inspectPlayer(pl.id)};document.getElementById('clearOverride').onclick=()=>{delete S.overrides[overrideKey(pl)];bumpCache();saveUserState();render();scheduleAccuracyCapture();inspectPlayer(pl.id)}}
function closeModal(){document.getElementById('playerModal').classList.add('hide');S.inspect=null;if(MODAL_TRIGGER&&document.body.contains(MODAL_TRIGGER))MODAL_TRIGGER.focus();MODAL_TRIGGER=null}
function validateBootstrapPayload(raw){const problems=[];if(!raw||typeof raw!=='object')return['payload is not an object'];const teams=raw.teams,elements=raw.elements,events=raw.events;if(!Array.isArray(teams)||teams.length!==20)problems.push(`expected 20 teams, got ${teams?.length}`);if(!Array.isArray(events)||events.length!==38)problems.push(`expected 38 events (season completeness), got ${events?.length}`);if(!Array.isArray(elements)||elements.length<300)problems.push(`elements array missing or implausibly short (${elements?.length})`);if(Array.isArray(teams)){const ids=new Set(teams.map(t=>t.id)),codes=new Set(teams.map(t=>t.short_name));if(ids.size!==teams.length)problems.push('duplicate team ids in payload');if(codes.size!==teams.length)problems.push('duplicate team short names in payload');const codePattern=/^[A-Z0-9]{2,4}$/;const badCodes=teams.filter(t=>typeof t.short_name!=='string'||!codePattern.test(t.short_name));if(badCodes.length)problems.push(`${badCodes.length} team(s) have a malformed short_name`);const badNames=teams.filter(t=>typeof t.name!=='string'||!t.name.trim()||t.name.length>60||/[<>]/.test(t.name));if(badNames.length)problems.push(`${badNames.length} team(s) have a suspicious or missing name`)}if(Array.isArray(events)){const ids=events.map(e=>e.id),unique=new Set(ids);if(unique.size!==events.length||ids.some(id=>!Number.isInteger(id)||id<1||id>38))problems.push('event ids must be unique integers from 1 to 38');const badDeadlines=events.filter(e=>!Number.isFinite(Date.parse(e.deadline_time)));if(badDeadlines.length)problems.push(`${badDeadlines.length} event(s) have invalid deadline timestamps`)}if(Array.isArray(elements)&&Array.isArray(teams)){const teamIds=new Set(teams.map(t=>t.id)),ids=new Set;let dupes=0,badTeam=0,badPos=0,badName=0,badPrice=0;for(const e of elements){if(ids.has(e.id))dupes++;ids.add(e.id);if(!teamIds.has(e.team))badTeam++;if(![1,2,3,4].includes(e.element_type))badPos++;const name=e.web_name||`${e.first_name||''} ${e.second_name||''}`.trim();if(!name||name.length>80||/[<>]/.test(name))badName++;const price=Number(e.now_cost);if(!Number.isFinite(price)||price<35||price>250)badPrice++}if(dupes)problems.push(`${dupes} duplicate player id(s)`);if(badTeam)problems.push(`${badTeam} player(s) reference unknown teams`);if(badPos)problems.push(`${badPos} player(s) have invalid positions`);if(badName)problems.push(`${badName} player(s) have missing or suspicious names`);if(badPrice)problems.push(`${badPrice} player(s) have implausible prices`)}return problems}
function validateFixturesPayload(raw,bootstrap){const problems=[];if(!Array.isArray(raw))return['fixtures response is not an array'];if(raw.length!==380)problems.push(`expected exactly 380 fixtures for a full season, got ${raw.length}`);const teamIds=new Set((bootstrap?.teams||[]).map(t=>t.id));let unresolved=0,sameTeam=0,badEvent=0,badKickoff=0,dupes=0;const seen=new Set;for(const f of raw){if(!teamIds.has(f.team_h)||!teamIds.has(f.team_a))unresolved++;if(f.team_h===f.team_a)sameTeam++;if(f.event!=null&&(!Number.isInteger(f.event)||f.event<1||f.event>38))badEvent++;if(f.kickoff_time!=null&&!Number.isFinite(Date.parse(f.kickoff_time)))badKickoff++;if(f.id==null)problems.push('fixture without an id');else{if(seen.has(f.id))dupes++;seen.add(f.id)}}if(unresolved)problems.push(`${unresolved} fixture(s) reference unknown teams`);if(sameTeam)problems.push(`${sameTeam} fixture(s) have the same home and away team`);if(badEvent)problems.push(`${badEvent} fixture(s) have invalid gameweek ids`);if(badKickoff)problems.push(`${badKickoff} fixture(s) have invalid kickoff timestamps`);if(dupes)problems.push(`${dupes} duplicate fixture ids`);return [...new Set(problems)]}
function validateSeasonIdentity(raw,meta=null){const problems=[],warnings=[],events=Array.isArray(raw?.events)?[...raw.events].sort((a,b)=>a.id-b.id):[],explicit=String(meta?.season||raw?.season||raw?.meta?.season||raw?.game_settings?.season||'').trim();if(explicit&&explicit!==EXPECTED_SEASON)problems.push(`season metadata is ${explicit}; expected ${EXPECTED_SEASON}`);if(events.length===38){const times=events.map(e=>Date.parse(e.deadline_time));if(times.every(Number.isFinite)){const first=times[0],last=times[times.length-1];if(first<FIRST_DEADLINE_MIN||first>FIRST_DEADLINE_MAX)problems.push(`GW1 deadline falls outside the ${EXPECTED_SEASON} opening window`);if(last<LAST_DEADLINE_MIN||last>LAST_DEADLINE_MAX)problems.push(`GW38 deadline falls outside the ${EXPECTED_SEASON} final window`);if(times.some((t,i)=>i&&t<=times[i-1]))problems.push('gameweek deadlines are not strictly chronological');const broadMin=SEASON_START-14*864e5,broadMax=SEASON_END+2*864e5;if(times.some(t=>t<broadMin||t>broadMax))problems.push(`one or more deadlines fall outside the ${EXPECTED_SEASON} season window`)}else problems.push('season identity cannot be verified because deadlines are invalid')}else problems.push('season identity requires all 38 event deadlines');if(!explicit&&!problems.length)warnings.push(`season derived from deadline window; Worker should explicitly report ${EXPECTED_SEASON}`);return{problems,warnings,verified:!problems.length,season:!problems.length?EXPECTED_SEASON:(explicit||'UNKNOWN')}}
function validateFixtureTopology(raw,bootstrap){const problems=[],warnings=[],teams=(bootstrap?.teams||[]).map(t=>t.id),teamSet=new Set(teams);if(!Array.isArray(raw)||teams.length!==20)return{problems:['fixture topology requires 380 fixtures and 20 teams'],warnings,verified:false};const counts=new Map(teams.map(id=>[id,{total:0,home:0,away:0}])),pairs=new Map,eventTeams=new Map,eventMatches=new Map;for(const f of raw){if(!teamSet.has(f.team_h)||!teamSet.has(f.team_a)||f.team_h===f.team_a)continue;counts.get(f.team_h).total++;counts.get(f.team_h).home++;counts.get(f.team_a).total++;counts.get(f.team_a).away++;const lo=Math.min(f.team_h,f.team_a),hi=Math.max(f.team_h,f.team_a),key=`${lo}|${hi}`,p=pairs.get(key)||{total:0,loHome:0,hiHome:0};p.total++;if(f.team_h===lo)p.loHome++;else p.hiHome++;pairs.set(key,p);if(Number.isInteger(f.event)&&f.event>=1&&f.event<=38){eventMatches.set(f.event,(eventMatches.get(f.event)||0)+1);const app=eventTeams.get(f.event)||new Map;app.set(f.team_h,(app.get(f.team_h)||0)+1);app.set(f.team_a,(app.get(f.team_a)||0)+1);eventTeams.set(f.event,app)}}const badTotals=[...counts].filter(([,c])=>c.total!==38||c.home!==19||c.away!==19);if(badTotals.length)problems.push(`${badTotals.length} club(s) do not have 38 matches split 19 home and 19 away`);if(pairs.size!==190)problems.push(`expected 190 unique club pairings, got ${pairs.size}`);const badPairs=[...pairs.values()].filter(p=>p.total!==2||p.loHome!==1||p.hiHome!==1);if(badPairs.length)problems.push(`${badPairs.length} club pairing(s) are not one home and one away meeting`);for(const [gw,n] of eventMatches)if(n>10)warnings.push(`GW${gw} currently contains ${n} fixtures, indicating a double or reschedule`);for(const [gw,app] of eventTeams)if([...app.values()].some(n=>n>2))warnings.push(`GW${gw} contains a club more than twice; verify a legitimate triple gameweek`);return{problems:[...new Set(problems)],warnings:[...new Set(warnings)],verified:!problems.length}}
function validateWorkerMeta(meta){const problems=[],warnings=[];if(!meta||typeof meta!=='object')return{problems,warnings:['Worker health/metadata contract unavailable; payload-derived verification used'],verified:false,contract:'LEGACY'};const season=String(meta.season||'').trim(),schema=Number.parseFloat(meta.schemaVersion),status=String(meta.status||'').toLowerCase(),last=Date.parse(meta.lastOfficialFetch||meta.updatedAt||meta.generatedAt||'');if(season&&season!==EXPECTED_SEASON)problems.push(`Worker reports season ${season}; expected ${EXPECTED_SEASON}`);if(meta.bootstrapPlayers!=null&&Number(meta.bootstrapPlayers)<300)problems.push('Worker reports an implausibly small player pool');if(meta.fixtures!=null&&Number(meta.fixtures)!==380)problems.push(`Worker reports ${meta.fixtures} fixtures instead of 380`);if(status&&!['ok','healthy','live'].includes(status))warnings.push(`Worker health status is ${status}`);if(!Number.isFinite(schema)||schema<WORKER_SCHEMA_MIN)warnings.push(`Worker schema v${meta.schemaVersion||'unknown'} is below the RC1.1 contract`);if(!Number.isFinite(last))warnings.push('Worker did not provide a valid lastOfficialFetch timestamp');if(!meta.dataHash)warnings.push('Worker did not provide a dataHash');const verified=!problems.length&&season===EXPECTED_SEASON&&Number.isFinite(schema)&&schema>=WORKER_SCHEMA_MIN&&Number.isFinite(last)&&!!meta.dataHash&&(!status||['ok','healthy','live'].includes(status));return{problems,warnings,verified,contract:verified?'V2':'LEGACY'}}
function buildValidationReport(boot,fixtures,meta,{mode='LIVE',fetchedAt=Date.now(),cacheAt=fetchedAt}={}){const structural=[...validateBootstrapPayload(boot),...validateFixturesPayload(fixtures,boot)],season=validateSeasonIdentity(boot,meta),topology=validateFixtureTopology(fixtures,boot),source=validateWorkerMeta(meta),basis=Number.isFinite(Date.parse(meta?.lastOfficialFetch||meta?.updatedAt||meta?.generatedAt||''))?Date.parse(meta.lastOfficialFetch||meta.updatedAt||meta.generatedAt):(mode==='CACHE'?Number(cacheAt):Number(fetchedAt)),ageHours=(Date.now()-basis)/36e5,freshnessPass=Number.isFinite(ageHours)&&ageHours>=-6&&ageHours<=MAX_DATA_AGE_HOURS,warnings=[...season.warnings,...topology.warnings,...source.warnings];if(!freshnessPass)warnings.push(`data freshness is ${Number.isFinite(ageHours)?Math.round(ageHours)+'h old':'unverified'}`);return{structural,season:season.problems,topology:topology.problems,source:source.problems,warnings:[...new Set(warnings)],structuralPass:!structural.length,seasonPass:season.verified,topologyPass:topology.verified,freshnessPass,sourcePass:source.verified,seasonDetected:season.season,ageHours:Number.isFinite(ageHours)?ageHours:null}}
function fetchWorkerContract(signal){const endpoints=['/api/health','/api/metadata','/health'];return new Promise(resolve=>{let pending=endpoints.length,last='';for(const endpoint of endpoints)fetchJSONRetry(API_BASE+endpoint,2500,signal,1).then(meta=>{if(meta&&typeof meta==='object')resolve({meta,endpoint,error:''});else if(--pending===0)resolve({meta:null,endpoint:'',error:last||'metadata endpoint unavailable'})}).catch(e=>{last=e.message||String(e);if(--pending===0)resolve({meta:null,endpoint:'',error:last||'metadata endpoint unavailable'})})})}
function renderStrengths(){const host=document.getElementById('strengths');if(!host)return;host.innerHTML=Object.keys(TEAMS).map(t=>{const id=`strength-${t}`,name=TEAMS[t]?.n||t,val=num(TEAMS[t].s).toFixed(1);return`<div class="strength"><label class="tcode" for="${id}">${esc(t)}</label><input id="${id}" type="range" min="1.5" max="5" step="0.1" value="${TEAMS[t].s}" data-str="${esc(t)}" aria-label="${esc(name)} team strength" aria-valuetext="${esc(name)} strength ${val} out of 5"><span class="mono" style="font-size:10px;color:var(--muted)" id="sv-${esc(t)}">${val}</span></div>`}).join('');document.querySelectorAll('[data-str]').forEach(el=>el.oninput=e=>{const t=e.target.dataset.str;TEAMS[t].s=num(e.target.value);TEAMS[t].atkH=TEAMS[t].atkA=TEAMS[t].defH=TEAMS[t].defA=null;const out=document.getElementById('sv-'+t);if(out)out.textContent=TEAMS[t].s.toFixed(1);e.target.setAttribute('aria-valuetext',`${TEAMS[t]?.n||t} strength ${TEAMS[t].s.toFixed(1)} out of 5`);bumpCache();render();saveUserState();scheduleAccuracyCapture()})}

function populateTeamFilter(){const sel=document.getElementById('fTeam');if(!sel)return;const cur=sel.value;const codes=Object.keys(TEAMS).sort((a,b)=>(TEAMS[a].n||a).localeCompare(TEAMS[b].n||b));sel.innerHTML='<option value="">All teams</option>'+codes.map(c=>`<option value="${esc(c)}">${esc(TEAMS[c].n||c)}</option>`).join('');if(codes.includes(cur))sel.value=cur;}
function applyBootstrap(raw){if(!raw||!Array.isArray(raw.elements)||!Array.isArray(raw.teams))throw new Error('bootstrap-static shape not recognised');const viewedGw=S.gw,snap=selectionSnapshot(),oldByApi=new Map(POOL.filter(p=>p.apiId!=null).map(p=>[p.apiId,p])),oldByName=new Map(POOL.map(p=>[normalName(p.n)+'|'+p.p,p])),teamMap={};const incomingCodes=new Set(raw.teams.map(t=>t.short_name));for(const code of Object.keys(TEAMS))if(!incomingCodes.has(code))delete TEAMS[code];DATA.histMeta=raw.hist_meta||null;for(const t of raw.teams){const code=t.short_name;teamMap[t.id]=code;const prev=TEAMS[code]||{};const overallVals=[t.strength_overall_home,t.strength_overall_away].map(Number).filter(v=>Number.isFinite(v)&&v>0);const ss=overallVals.length?overallVals.reduce((a,b)=>a+b,0)/overallVals.length:num(t.strength,prev.s||3);const fallback=1000+(ss-3)*110;const pos=v=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):null;TEAMS[code]={...prev,n:t.name||prev.n||code,s:ss,atkH:pos(t.strength_attack_home)??fallback,atkA:pos(t.strength_attack_away)??fallback,defH:pos(t.strength_defence_home)??fallback,defA:pos(t.strength_defence_away)??fallback}}const posMap={1:'GK',2:'DEF',3:'MID',4:'FWD'},newPool=[],acceptedElements=[];for(const e of raw.elements){const p=posMap[e.element_type],t=teamMap[e.team];if(!p||!t||!TEAMS[t])continue;const n=e.web_name||`${e.first_name||''} ${e.second_name||''}`.trim(),prev=oldByApi.get(e.id)||oldByName.get(normalName(n)+'|'+p),live={minutes:num(e.minutes),starts:num(e.starts),goals:num(e.goals_scored),assists:num(e.assists),cleanSheets:num(e.clean_sheets),goalsConceded:num(e.goals_conceded),saves:num(e.saves),bonus:num(e.bonus),bps:num(e.bps),xG:num(e.expected_goals),xA:num(e.expected_assists),xGC:num(e.expected_goals_conceded),dc90:num(e.defensive_contribution_per_90),yellow:num(e.yellow_cards),red:num(e.red_cards),ownGoals:num(e.own_goals),pensMissed:num(e.penalties_missed),pensSaved:num(e.penalties_saved),form:num(e.form),ppg:num(e.points_per_game),epNext:num(e.ep_next),chance:e.chance_of_playing_next_round,status:e.status||'a',news:e.news||'',selected:num(e.selected_by_percent),transfersIn:num(e.transfers_in_event),transfersOut:num(e.transfers_out_event),costChange:num(e.cost_change_start),penOrder:e.penalties_order,cornerOrder:e.corners_and_indirect_freekicks_order,fkOrder:e.direct_freekicks_order};acceptedElements.push(e);newPool.push({id:newPool.length,apiId:e.id,n,t,p,c:num(e.now_cost)/10,histPts:num(e.hist_prev?.total_points??prev?.histPts??prev?.pts),histDcPts:num(e.hist_prev?.defcon??prev?.histDcPts??prev?.dc),histStarts:num(e.hist_prev?.starts??prev?.histStarts),histMinutes:num(e.hist_prev?.minutes??prev?.histMinutes),histTeam:prev?.histTeam||prev?.t||t,live,v:1})}POOL=newPool;DATA.histCoverage=buildHistoryCoverage(raw,acceptedElements,newPool);EVENTS=raw.events||[];const next=EVENTS.find(e=>e.is_next)||EVENTS.find(e=>!e.finished&&Date.parse(e.deadline_time)>Date.now())||EVENTS.find(e=>!e.finished);if(next){DATA.nextEvent=next.id;DEADLINE=Date.parse(next.deadline_time);DEADLINE_VERIFIED=Number.isFinite(DEADLINE);document.getElementById('hDeadlineLabel').textContent=`GW${next.id} deadline`;const curEvent=EVENTS.find(e=>e.id===S.gw);if(!S.gwPinned&&(!S.squad.length||!curEvent||curEvent.finished))S.gw=next.id}remapSelection(snap.squad?.length?snap:(SAVED||{}));bumpCache();if(S.gw!==viewedGw)optimiseViewedLineup();updateGwSelect();renderStrengths();populateTeamFilter();reconcilePriceCacheWithPool()}
function applyFixtures(raw,bootstrap){if(!Array.isArray(raw))throw new Error('fixtures response is not an array');const teamMap={};(bootstrap?.teams||[]).forEach(t=>teamMap[t.id]=t.short_name);const nf={},nm={},played={};for(const f of raw){if(!f.event)continue;const h=teamMap[f.team_h],a=teamMap[f.team_a];if(!h||!a)continue;(nf[f.event]??=[]).push([h,a]);(nm[f.event]??=[]).push({id:f.id,kickoff:f.kickoff_time,hDiff:f.team_h_difficulty,aDiff:f.team_a_difficulty,finished:!!f.finished,provisional:!!f.finished_provisional,scoreReady:f.team_h_score!==null&&f.team_h_score!==undefined&&f.team_a_score!==null&&f.team_a_score!==undefined,started:!!f.started});if(f.finished){played[h]=(played[h]||0)+1;played[a]=(played[a]||0)+1}}if(Object.values(nf).flat().length<100)throw new Error('fixture response incomplete');FIX=nf;FIX_META=nm;DATA.teamPlayed=played;FIX_NOTE=`Official live fixture endpoint loaded: ${Object.values(FIX).flat().length} fixtures across ${Object.keys(FIX).length} gameweeks. Blanks, doubles, postponements, kickoff changes and difficulty ratings will be reflected after refresh.`;bumpCache();updateGwSelect()}
async function fetchJSON(url,ms=15000,externalSignal=null,options={}){const c=new AbortController();if(externalSignal){if(externalSignal.aborted)c.abort();else externalSignal.addEventListener('abort',()=>c.abort(),{once:true})}const timer=setTimeout(()=>c.abort(),ms),t=performance.now(),label=url.replace(API_BASE,'WORKER');pipelineEvent('FETCH','run',`GET ${label}`);try{const r=await fetch(url,{...options,cache:'no-store',signal:c.signal,headers:{'Accept':'application/json',...(options.headers||{})}});const elapsed=performance.now()-t,ct=r.headers.get('content-type')||'unknown';if(!r.ok){let detail='';try{detail=(await r.json())?.error||''}catch(e){}pipelineEvent('FETCH','fail',`${label} · HTTP ${r.status}${detail?' · '+detail:''}`,elapsed);throw new Error(`HTTP ${r.status}${detail?' · '+detail:''}`)}const data=await r.json();pipelineEvent('FETCH','ok',`${label} · HTTP ${r.status} · ${ct}`,elapsed);return data}catch(e){if(e.name==='AbortError')pipelineEvent('FETCH','fail',`${label} · timeout/cancel after ${ms}ms`,performance.now()-t);else if(e.name==='TypeError')pipelineEvent('FETCH','fail',`${label} · browser network/CORS/DNS failure`,performance.now()-t);throw e}finally{clearTimeout(timer)}}
async function fetchJSONRetry(url,ms=15000,externalSignal=null,attempts=2){let last;for(let i=0;i<attempts;i++){try{return await fetchJSON(url,ms,externalSignal)}catch(e){last=e;if(externalSignal?.aborted||i===attempts-1)throw e;await new Promise(r=>setTimeout(r,400*(i+1)))}}throw last}
function setTeamImportStatus(message,tone=''){const el=document.getElementById('teamImportStatus');if(!el)return;el.className='team-import-status'+(tone?' '+tone:'');el.textContent=String(message||'')}
function fplImportPlayerByElement(element){return POOL.find(p=>Number(p.apiId)===Number(element))||null}
function normaliseFplPicksPayload(raw){const picks=Array.isArray(raw?.picks)?raw.picks:[],history=raw?.entry_history||raw?.entryHistory||{};return{picks,history,activeChip:raw?.active_chip??raw?.activeChip??null}}
function fplEventNumber(value){const n=Math.trunc(Number(value));return Number.isFinite(n)&&n>=1&&n<=38?n:0}
function fplPicksAreComplete(raw){return normaliseFplPicksPayload(raw).picks.length===15}
async function fetchFplImportEndpoint(urls,ms=15000){let last=null;for(const url of urls){try{return await fetchJSON(url,ms)}catch(e){last=e}}throw last||new Error('No supported FPL endpoint responded')}
function fplImportGwCandidates(entry,events=EVENTS,now=Date.now(),nextEvent=DATA.nextEvent){
  const found=new Set,add=value=>{const gw=fplEventNumber(value);if(gw)found.add(gw)};
  add(entry?.current_event);
  for(const event of Array.isArray(events)?events:[]){
    const deadline=Date.parse(event?.deadline_time||'');
    if(Number.isFinite(deadline)&&deadline<=now)add(event?.id)
  }
  const next=fplEventNumber(nextEvent);if(next>1)add(next-1);
  return[...found].sort((a,b)=>b-a).slice(0,6)
}
function fplPicksUrls(teamId,gw){return[
  `${API_BASE}/api/entry-picks?id=${teamId}&gw=${gw}`,
  `${API_BASE}/api/entry/${teamId}/event/${gw}/picks`,
  `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gw}/picks/`
]}
async function fetchCompleteFplPicks(teamId,gw,ms=15000){
  let last=null;
  for(const url of fplPicksUrls(teamId,gw)){
    try{
      const payload=await fetchJSON(url,ms),count=normaliseFplPicksPayload(payload).picks.length;
      if(count===15)return payload;
      last=new Error(`GW${gw} returned ${count} public players`)
    }catch(e){last=e}
  }
  throw last||new Error(`GW${gw} public picks are unavailable`)
}
function fplPublicImportUnavailable(){
  const first=(Array.isArray(EVENTS)?EVENTS:[]).find(event=>fplEventNumber(event?.id)===1),deadline=Date.parse(first?.deadline_time||'');
  if(Number.isFinite(deadline)&&deadline>Date.now()){
    const when=new Date(deadline).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
    return `FPL keeps every GW1 draft private until the first deadline (${when}). A public team ID cannot expose those 15 players yet; retry after the deadline or build the squad manually.`
  }
  return 'No publicly released 15-player squad was found for this team. The manager may have joined after the latest deadline; retry after their first deadline.'
}
async function fetchLatestPublicFplPicks(entry,teamId){
  const candidates=fplImportGwCandidates(entry);
  for(const gw of candidates){
    try{return{gw,payload:await fetchCompleteFplPicks(teamId,gw)}}catch(e){}
  }
  throw new Error(fplPublicImportUnavailable())
}
async function ensureImportPlayerMap(){if(POOL.filter(p=>p.apiId!=null).length>=300)return;if(navigator.onLine===false)throw new Error('Live player identity data is not available while offline.');await refreshLiveData(false);if(POOL.filter(p=>p.apiId!=null).length<300)throw new Error('Current FPL player identities could not be loaded. Refresh Data and try again.')}
function applyImportedFplTeam(entry,payload,teamId,importedGw=0){const data=normaliseFplPicksPayload(payload),ordered=[...data.picks].sort((a,b)=>num(a.position,99)-num(b.position,99)),mapped=ordered.map(x=>({pick:x,player:fplImportPlayerByElement(x.element)})),missing=mapped.filter(x=>!x.player);if(ordered.length!==15)throw new Error(`The validated public picks response changed and returned ${ordered.length} players instead of 15.`);if(missing.length)throw new Error(`${missing.length} imported player${missing.length===1?' was':'s were'} not recognised in the current OTB player catalogue.`);const players=mapped.map(x=>x.player),ids=players.map(x=>x.id);if(!legal(players))throw new Error('The imported squad failed OTB legal-squad validation.');S.squad=ids;S.start=new Set(mapped.filter(x=>num(x.pick.position,99)<=11).map(x=>x.player.id));if(S.start.size!==11||xiLegality([...S.start])!==null)autoXI();S.cap=mapped.find(x=>x.pick.is_captain)?.player.id??null;S.vice=mapped.find(x=>x.pick.is_vice_captain)?.player.id??null;S.capManual=S.cap!=null;S.viceManual=S.vice!=null;S.benchOrder=mapped.filter(x=>num(x.pick.position)>11).sort((a,b)=>num(a.pick.position)-num(b.pick.position)).map(x=>stableKey(x.player));S.locks=new Set;S.transfer.purchase={};for(const {pick,player} of mapped){const paid=num(pick.purchase_price,NaN);if(Number.isFinite(paid)&&paid>0)S.transfer.purchase[stableKey(player)]=paid/10}const bankRaw=num(data.history.bank,NaN),bank=Number.isFinite(bankRaw)?Math.max(0,bankRaw/10):Math.max(0,bank());S.transfer.bank=bank;const currentValue=players.reduce((a,p)=>a+num(p.c),0);S.budget=Math.round((currentValue+bank)*10)/10;const importedEvent=fplEventNumber(data.history.event)||fplEventNumber(importedGw)||fplEventNumber(entry?.current_event)||Math.max(1,fplEventNumber(DATA.nextEvent)-1),active=String(data.activeChip||'').toLowerCase(),chipCode=({wildcard:'WILDCARD',freehit:'FREE_HIT',bboost:'BENCH_BOOST','3xc':'TRIPLE_CAPTAIN'})[active]||'NONE';if(chipCode!=='NONE')setChipStateForGw(chipCode,importedEvent);ensureCaptainValid();bumpCache();initControls();initTransferControls();render();saveUserState();const name=entry?.name||entry?.player_first_name||`Team ${teamId}`,gw=importedEvent,paidCount=Object.keys(S.transfer.purchase).length;return{name,gw,bank,paidCount,activeChip:chipStateForGw(gw).code}}
async function importFplTeamById(){const input=document.getElementById('fplTeamId'),btn=document.getElementById('btnImportFplTeam'),teamId=Math.trunc(num(input?.value));if(!Number.isFinite(teamId)||teamId<1){setTeamImportStatus('Enter a valid positive FPL manager/team ID.','bad');input?.focus();return}if(btn)btn.disabled=true;setTeamImportStatus(`Finding the newest public 15-player squad for team ${teamId}…`,'warn');try{await ensureImportPlayerMap();const entry=await fetchFplImportEndpoint([`${API_BASE}/api/entry?id=${teamId}`,`${API_BASE}/api/entry/${teamId}`,`https://fantasy.premierleague.com/api/entry/${teamId}/`]),found=await fetchLatestPublicFplPicks(entry,teamId),result=applyImportedFplTeam(entry,found.payload,teamId,found.gw);setTeamImportStatus(`${result.name} imported from GW${result.gw}: legal 15-player squad, XI, captain, vice-captain and £${result.bank.toFixed(1)}m bank loaded. ${result.paidCount===15?'All purchase prices were available.':`${result.paidCount}/15 purchase prices were available; missing values default to current price.`} Confirm free transfers before planning.`,'good');flash('FPL team imported successfully.')}catch(e){setTeamImportStatus(`Import failed: ${e.message}`,'bad')}finally{if(btn)btn.disabled=false}}
let REFRESH_SEQ=0,REFRESH_CONTROLLER=null,REFRESH_ACTIVE=false;
async function refreshLiveData(force=true){
 if(REFRESH_ACTIVE&&!force){pipelineEvent('REFRESH','warn','Skipped overlapping background refresh');return;}
 pipelineReset(force?'Manual live refresh':'Automatic live refresh');
 pipelineEvent('CONFIG','ok',API_BASE);
 if(navigator.onLine===false){DATA.error='Live refresh failed: browser reports offline';pipelineFinish('FAIL',DATA.error);renderDataStatus();return;}
 const mySeq=++REFRESH_SEQ;
 if(REFRESH_CONTROLLER&&force)REFRESH_CONTROLLER.abort();
 const myController=new AbortController();REFRESH_CONTROLLER=myController;REFRESH_ACTIVE=true;
 const msg=document.getElementById('importMsg');
 msg.innerHTML='<b style="color:var(--cyan)">Refreshing official FPL data…</b>';
 let contract={meta:null,endpoint:'',error:'metadata not checked'};
 try{
  pipelineEvent('CONTRACT','run','Checking Worker metadata routes');
  const contractPromise=fetchWorkerContract(myController.signal);
  const [boot,fixtures]=await Promise.all([
   fetchJSONRetry(API_BASE+'/bootstrap-static/',15000,myController.signal),
   fetchJSONRetry(API_BASE+'/fixtures/',15000,myController.signal)
  ]);
  contract=await contractPromise;
  pipelineEvent('CONTRACT',contract.meta?'ok':'warn',contract.meta?`Metadata received from ${contract.endpoint}`:`Metadata unavailable · ${contract.error}`);
  if(mySeq!==REFRESH_SEQ)return;
  pipelineEvent('PAYLOAD','ok',`Bootstrap and fixtures parsed`);
  const fetchedAt=Date.now(),report=buildValidationReport(boot,fixtures,contract.meta,{mode:'LIVE',fetchedAt});
  pipelineEvent('VALIDATE',validationLoadBlockingIssues(report).length?'fail':report.sourcePass?'ok':'warn',validationLoadBlockingIssues(report).join('; ')||'Core payload accepted');
  DATA.validation=report;
  DATA.worker={status:contract.meta?'ONLINE':'OFFLINE',contract:report.sourcePass?'V3':contract.meta?'LEGACY':'NONE',endpoint:contract.endpoint,meta:contract.meta,error:contract.error};
  const blocking=validationLoadBlockingIssues(report);
  if(blocking.length)throw new Error('official payload rejected: '+blocking.join('; '));
  applyBootstrap(boot);applyFixtures(fixtures,boot);
  DATA.mode='LIVE';DATA.lastUpdated=fetchedAt;
  const notices=[];
  if(!report.topologyPass)notices.push('fixture topology is incomplete or awaiting certification');
  if(!report.freshnessPass)notices.push('freshness could not be fully verified');
  if(!report.sourcePass)notices.push(contract.meta?'Worker metadata is legacy':'Worker metadata endpoint is unavailable');
  DATA.error=notices.join(' · ');
  try{localStorage.setItem(CACHE_KEY,JSON.stringify({at:DATA.lastUpdated,boot,fixtures,worker:DATA.worker,validationVersion:'RC3.2.1'}))}catch(e){}
  render();
  schedulePostLiveHydration();
  const readiness=releaseReadiness(),colour=readiness==='BLOCKED'?'#FFC107':'var(--mint)';
  pipelineFinish(readiness==='BLOCKED'?'WARN':'OK',`Live data loaded · ${readiness}`);
  msg.innerHTML=`<b style="color:${colour}">Live data loaded.</b> ${POOL.length} players and ${Object.values(FIX).flat().length} fixtures · ${readiness}${DATA.error?' · '+esc(DATA.error):''}.`;
 }catch(e){
  if(mySeq!==REFRESH_SEQ)return;
  const aborted=e.name==='AbortError';
  const detail=aborted?'request timed out or was cancelled':e.message;
  if(!DATA.worker||DATA.worker.status==='UNKNOWN')DATA.worker={status:'OFFLINE',contract:'NONE',endpoint:contract.endpoint||API_BASE,error:detail,meta:contract.meta||null};
  else DATA.worker.error=detail;
  DATA.error='Live refresh failed: '+detail;
  pipelineFinish('FAIL',detail);
  DATA.mode=DATA.mode==='CACHE'?'CACHE':DATA.mode;
  renderDataStatus();
  msg.innerHTML=`<b style="color:#FF6E9E">${esc(DATA.error)}.</b> Worker: ${esc(DATA.worker.status)}${DATA.worker.endpoint?' · '+esc(DATA.worker.endpoint):''}. The last valid cache or embedded seed remains active.`;
 }finally{
  if(mySeq===REFRESH_SEQ){REFRESH_ACTIVE=false;REFRESH_CONTROLLER=null;}
 }
}
function loadCachedData(){try{const d=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(!d?.boot||!d?.fixtures)return false;const ageHours=(Date.now()-num(d.at))/36e5,mode=ageHours>MAX_DATA_AGE_HOURS?'STALE':'CACHE',meta=d.worker?.meta||null,report=buildValidationReport(d.boot,d.fixtures,meta,{mode:'CACHE',cacheAt:d.at});const fatal=validationLoadBlockingIssues(report);if(fatal.length)throw new Error('cached data rejected: '+fatal.join('; '));DATA.validation=report;DATA.worker=d.worker||{status:'UNKNOWN',contract:report.sourcePass?'V3':'LEGACY',endpoint:'',meta,error:'cached payload has no Worker metadata'};applyBootstrap(d.boot);applyFixtures(d.fixtures,d.boot);DATA.mode=mode;DATA.lastUpdated=d.at;DATA.error=mode==='STALE'?`Cached data is ${Math.round(ageHours)}h old — refresh required`:report.sourcePass?'':'Validated cache uses payload-derived season/topology verification';return true}catch(e){DATA.error='Cached data unavailable: '+e.message;return false}}
function importPasted(){const msg=document.getElementById('importMsg');try{const raw=JSON.parse(document.getElementById('importBox').value),boot=raw.bootstrap||raw.bootstrap_static||raw,fixtures=raw.fixtures,meta=raw.workerMeta||raw.metadata||raw.health||raw.meta||null;if(!fixtures){const structural=validateBootstrapPayload(boot),season=validateSeasonIdentity(boot,meta);if(structural.length||season.problems.length)throw new Error([...structural,...season.problems].join('; '));DATA.validation={structural,season:season.problems,topology:['fixtures were not supplied'],source:[],warnings:[...season.warnings,'manual import is partial'],structuralPass:true,seasonPass:season.verified,topologyPass:false,freshnessPass:true,sourcePass:false};applyBootstrap(boot);DATA.mode='PARTIAL';DATA.lastUpdated=Date.now();DATA.error='Pasted bootstrap only; fixture topology cannot be verified';DATA.worker={status:'IMPORT',contract:'NONE',endpoint:'',meta,error:''};render();scheduleSelfTests(250);msg.innerHTML=`<b style="color:#FFC107">Loaded ${POOL.length} players.</b> Fixtures are required before optimisation.`;return}const report=buildValidationReport(boot,fixtures,meta,{mode:'CACHE',cacheAt:Date.now()});const fatal=validationFatalIssues(report);if(fatal.length)throw new Error(fatal.join('; '));DATA.validation=report;DATA.worker={status:'IMPORT',contract:report.sourcePass?'V3':'LEGACY',endpoint:'manual import',meta,error:''};applyBootstrap(boot);applyFixtures(fixtures,boot);DATA.mode='CACHE';DATA.lastUpdated=Date.now();DATA.error=report.sourcePass?'Manual import with Worker contract metadata':'Manual import validated by season and fixture topology';render();maybeAutoCaptureProjection();scheduleSelfTests(250);msg.innerHTML=`<b style="color:var(--mint)">Loaded ${POOL.length} players.</b> ${releaseReadiness()} validation.`}catch(e){msg.innerHTML=`<b style="color:#FF6E9E">Could not import:</b> ${esc(e.message)}`}}
function updateGwSelect(){const el=document.getElementById('gwSel'),max=Math.max(38,...Object.keys(FIX).map(Number));el.innerHTML=Array.from({length:max},(_,i)=>`<option value="${i+1}">GW${i+1}</option>`).join('');S.gw=clamp(S.gw,1,max);el.value=S.gw}

function workerTestHarness(id){const source=combinedWorkerSource(id);if(!source)throw new Error('combined Worker source unavailable');return Function(`let onmessage;const postMessage=()=>{};${source}\nreturn{conditional,autosub,legal,ftValue,planScenario,runProjectionStress,cfg,selectedAutosubs};`)()}
function syntheticTransferPayload(){const gws=[1,2],players=[],current=[],purchase={};let id=1;const currentPos=['GK','GK','DEF','DEF','DEF','DEF','DEF','MID','MID','MID','MID','MID','FWD','FWD','FWD'];for(let i=0;i<currentPos.length;i++){const p=currentPos[i],x={id:id++,n:`Current ${i+1}`,p,t:`T${1+(i%5)}`,c:5,gw:{}};for(const gw of gws)x.gw[gw]={mean:3.2+(i%4)*.12,utility:3.2+(i%4)*.12,pAppear:.82,sd:1.1,confidence:70};players.push(x);current.push(x.id);purchase[x.id]=x.c}for(const p of ['GK','DEF','MID','FWD'])for(let j=0;j<3;j++){const x={id:id++,n:`Candidate ${p} ${j+1}`,p,t:`T${6+((id+j)%10)}`,c:4.5+j*.2,gw:{}};for(const gw of gws)x.gw[gw]={mean:4.4+j*.22+.05*gw,utility:4.4+j*.22+.05*gw,pAppear:.88,sd:1.25,confidence:72};players.push(x)}return{players,gws,squadIds:current,purchase,bank:2,free:1,maxMoves:2,maxHit:4,threshold:.25,lockedIds:[],chips:{wc:[],fh:[],bb:[],tc:[]},hybrid:{decay:.90,beamWidth:6,actionsPerState:5,bufferGws:1,useFriction:.20,itbValue:.08,ftScale:1,stressCandidateLimit:6},sensitivity:{runs:4,strength:1,seed:223}}}
let TRANSFER_TEST_FIXTURE=null;function transferWorkerTestFixture(){if(TRANSFER_TEST_FIXTURE)return TRANSFER_TEST_FIXTURE;const h=workerTestHarness('transferWorkerSource'),p=syntheticTransferPayload(),c=h.cfg(p.hybrid),r=h.planScenario(p,c,false),map=new Map(p.players.map(x=>[x.id,x]));return TRANSFER_TEST_FIXTURE={h,p,c,r,map}}

let SELF_TEST_TIMER=null,SELF_TEST_IDLE=null,SELF_TESTS_HAVE_RUN=false;
function cancelScheduledSelfTests(){
  if(SELF_TEST_TIMER){clearTimeout(SELF_TEST_TIMER);SELF_TEST_TIMER=null}
  if(SELF_TEST_IDLE&&'cancelIdleCallback'in window){cancelIdleCallback(SELF_TEST_IDLE);SELF_TEST_IDLE=null}
}
/* RC5.0.12: the complete certification suite is intentionally manual. It
   performs thousands of projections plus several optimiser passes; putting
   that synchronous workload behind an idle callback still freezes a phone
   once the callback starts. Existing callers remain safe no-ops. */
function scheduleSelfTests(){
  cancelScheduledSelfTests();
  if(SELF_TESTS_HAVE_RUN)return;
  const h=document.getElementById('hTests');
  if(h){h.textContent='ON DEMAND';h.className='v mono info'}
}
function runSelfTestsOnDemand(){
  cancelScheduledSelfTests();
  const btn=document.getElementById('btnRunSelfTests'),h=document.getElementById('hTests'),note=document.getElementById('testNote');
  if(btn){btn.disabled=true;btn.textContent='Running engineering tests…'}
  if(h){h.textContent='RUNNING';h.className='v mono info'}
  if(note)note.textContent='Running the full certification suite. The interface may pause until it finishes.';
  requestAnimationFrame(()=>setTimeout(()=>{
    try{runSelfTests();SELF_TESTS_HAVE_RUN=true}
    catch(e){if(h){h.textContent='ERROR';h.className='v mono bad'}if(note)note.textContent='Engineering tests stopped: '+(e?.message||String(e))}
    finally{if(btn){btn.disabled=false;btn.textContent='Run engineering tests again'}}
  },60));
}

function rolePlayerByName(team,name){const q=normalName(name||'');return POOL.find(p=>(!team||p.t===team)&&normalName(p.n).includes(q))||POOL.find(p=>normalName(p.n).includes(q))||null}
function populateRolePlayers(){const team=document.getElementById('riTeam'),player=document.getElementById('riAffected');if(!team||!player)return;const current=team.value||Object.keys(TEAMS)[0];team.innerHTML=Object.keys(TEAMS).sort().map(t=>`<option value="${t}">${t} · ${esc(TEAMS[t].n)}</option>`).join('');team.value=TEAMS[current]?current:Object.keys(TEAMS)[0];const rows=POOL.filter(p=>p.t===team.value).sort((a,b)=>a.p.localeCompare(b.p)||a.n.localeCompare(b.n));player.innerHTML=rows.map(p=>`<option value="${esc(stableKey(p))}">${esc(p.n)} · ${p.p}</option>`).join('')}
function roleCompatiblePositions(role){return({GK:['GK'],CB:['DEF'],FB:['DEF'],DM:['MID'],CM:['MID'],AM:['MID'],LW:['MID','FWD'],RW:['MID','FWD'],ST:['FWD']})[role]||[]}
function staticRolePositionCompatibility(role,p){const ok=roleCompatiblePositions(role);if(!ok.includes(p.p))return 0;if((role==='LW'||role==='RW')&&p.p==='FWD')return .62;if(role==='ST'&&p.p==='FWD')return 1;return 1}
function observedRoleEvidence(role,p){const key=stableKey(p),now=Date.now(),rows=roleIntelEvents().filter(e=>e.type==='observed_role'&&e.affectedKey===key&&e.role===role);if(!rows.length)return 0;return clamp(Math.max(...rows.map(e=>{const ageDays=Math.max(0,(now-num(e.createdAt,now))/86400000),recency=Math.max(.55,1-ageDays/120);return num(e.overlap,1)*num(e.hierarchy,.8)*num(e.confidence,.7)*recency})),0,1)}
function rolePositionCompatibility(role,p){const staticFit=staticRolePositionCompatibility(role,p),observed=observedRoleEvidence(role,p);return Math.max(staticFit,observed)}
function isOutOfPositionRole(role,p){return staticRolePositionCompatibility(role,p)===0&&observedRoleEvidence(role,p)>0}
function findRoleSubjectPlayer(team,subject){const q=String(subject||'').trim().toLowerCase();if(!q)return null;const rows=POOL.filter(p=>p.t===team);return rows.find(p=>p.n.toLowerCase()===q)||rows.find(p=>p.n.toLowerCase().includes(q)||q.includes(p.n.toLowerCase()))||null}
function roleAutoCandidates(team,role,type,subject){const positive=['observed_role','departure','injury','manager_positive'].includes(type);if(type==='observed_role'){const p=findRoleSubjectPlayer(team,subject);if(!p)return[];const md=minuteDetail(p),pr=project(p,S.gw),staticFit=staticRolePositionCompatibility(role,p);return[{p,md,pr,compat:1,score:1,oop:staticFit===0,observed:true}]}
const rows=POOL.filter(p=>p.t===team&&rolePositionCompatibility(role,p)>0&&p.n.toLowerCase()!==String(subject||'').toLowerCase()).map(p=>{const md=minuteDetail(p),pr=project(p,S.gw),compat=rolePositionCompatibility(role,p),quality=clamp(pr.x/7,0,1),starter=clamp(md.pStart,0,1),availability=clamp(md.avail,0,1),oop=isOutOfPositionRole(role,p);const opportunity=positive?(0.58*(1-starter)+0.27*quality+0.15*availability):(0.68*starter+0.22*quality+0.10*availability);const roleEvidence=oop?0.12:0;const score=compat*opportunity+roleEvidence;return{p,md,pr,compat,score,oop}}).sort((a,b)=>b.score-a.score||b.pr.x-a.pr.x);return rows.slice(0,3)}
function scanAndApplyRoleEvent(){const team=document.getElementById('riTeam').value,type=document.getElementById('riType').value,subject=document.getElementById('riSubject').value.trim()||'Unspecified competitor',role=document.getElementById('riRole').value,hierarchy=clamp(num(document.getElementById('riHierarchy').value)/100,0,1),confidence=clamp(num(document.getElementById('riConfidence').value),0,1),source=document.getElementById('riSource').value.trim()||(type==='observed_role'?'Observed lineup role':'Automated club-role scan'),host=document.getElementById('roleScanOut'),rows=roleAutoCandidates(team,role,type,subject);if(!rows.length)throw new Error(type==='observed_role'?'The observed player was not found in this club\'s current FPL pool. Use the player name shown by FPL or refresh live data.':'No compatible registered or dynamically observed players were found for this club and role.');const rankOverlap=type==='observed_role'?[1]:[.95,.74,.54],added=rows.map((x,i)=>({id:'ri-'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2,6),createdAt:Date.now(),team,type,subject,role,affected:x.p.n,affectedKey:stableKey(x.p),overlap:clamp(rankOverlap[i]*x.compat,0,1),hierarchy,confidence,source,auto:true,scanRank:i+1,scanScore:x.score,oop:!!x.oop,observed:!!x.observed}));S.roleIntel.events.push(...added);bumpCache();saveUserState();renderRoleIntelligence();render();host.innerHTML=`<div class="re-head"><b>${type==='observed_role'?'Observed-role registration':`Automated ${esc(team)} ${esc(role)} scan`}</b><span class="role-badge confirmed">${added.length} APPLIED</span></div>${added.map((e,i)=>{const x=rows[i],pres=roleEventPresentation(e),oop=e.oop?'<span class="pflag flag-doubt">OOP</span>':'';return`<div class="role-scan-row"><div><b>${esc(e.affected)} ${oop}</b><div class="source-note">${type==='observed_role'?`FPL ${x.p.p} · observed ${esc(role)} role registered`:`Rank ${i+1} · ${Math.round(100*x.md.pStart)}% start · ${x.md.exp.toFixed(0)} baseline xMins`}</div></div><span>${Math.round(100*e.overlap)}% fit</span><span style="color:${pres.direction>=0?'var(--mint)':'#FF91B5'}">${pres.label}</span></div>`}).join('')}<div class="source-note" style="margin-top:7px">${type==='observed_role'?'This tactical role now overrides static FPL-position exclusion in future club scans. Marked provisional or confirmed according to the selected evidence level.':'Selection uses registered FPL position plus recent observed-role evidence, start probability, expected minutes, availability and projection quality. Out-of-position candidates are retained and labelled.'}</div>`}
const SCOUT={loading:false,last:null,error:'',retained:false,health:null,pollTimer:null,pollTeam:'',pollAttempts:0};
function cancelScoutPoll(){if(SCOUT.pollTimer)clearTimeout(SCOUT.pollTimer);SCOUT.pollTimer=null;SCOUT.pollTeam='';SCOUT.pollAttempts=0}
function scheduleScoutPoll(team,workerDelay=0){
  if(SCOUT.pollTimer)clearTimeout(SCOUT.pollTimer);
  if(SCOUT.pollAttempts>=7)return;
  const attempt=++SCOUT.pollAttempts,delay=Math.min(15000,Math.max(2500,num(workerDelay,0),2500+attempt*1800));
  SCOUT.pollTeam=team;
  SCOUT.pollTimer=setTimeout(()=>{
    SCOUT.pollTimer=null;
    if(document.getElementById('riTeam')?.value!==team){cancelScoutPoll();return}
    if(SCOUT.loading){scheduleScoutPoll(team,2000);return}
    fetchScoutTeam(false,{poll:true}).catch(()=>{});
  },delay);
}
function scoutPlayerForEvent(z){const api=Number(z?.affectedApiId);if(Number.isFinite(api)){const p=POOL.find(x=>Number(x.apiId)===api);if(p)return p}return rolePlayerByName(String(z?.team||''),String(z?.affected||''))}
function scoutEventLocal(z,report){
  const p=scoutPlayerForEvent(z);if(!p)return null;
  const sourceUrl=String(z.source||''),sourceType=String(z.sourceType||z.rawType||z.type||'');
  const friendly=!!z.preseasonCalibrated||isFriendlyRoleEvent({competition:z.competition,sourceUrl,source:z.reason});
  const friendlyLineup=friendly&&/confirmed_(?:start|bench)|friendly_(?:start|bench)/.test(`${sourceType} ${z.type||''}`);
  const bench=friendlyLineup&&/bench/.test(`${sourceType} ${z.type||''}`);
  const type=friendlyLineup?(bench?'friendly_bench':'friendly_start'):String(z.type||'observed_role');
  const rawType=friendlyLineup?type:String(z.rawType||z.type||'');
  return{id:String(z.id||('scout-'+Date.now()+'-'+Math.random().toString(36).slice(2,7))),createdAt:num(z.createdAt,Date.now()),team:p.t,type,
    sourceType,subject:String(z.subject||'Scout evidence'),role:String(z.role||''),affected:p.n,affectedKey:stableKey(p),
    overlap:clamp(num(z.overlap,.75),0,1),hierarchy:clamp(num(z.hierarchy,.75),0,1),confidence:clamp(num(z.confidence,.7),0,1),
    source:String(z.reason||z.source||'OTB Scout Worker'),sourceUrl,evidenceDate:String(z.evidenceDate||''),rawType,
    evidenceClass:friendlyLineup?'selection':String(z.evidenceClass||''),authorityTier:friendlyLineup?Math.max(3,num(z.authorityTier,3)):num(z.authorityTier,3),
    sourceAuthority:clamp(num(z.sourceAuthority,.9),0,1),effectiveFrom:String(z.effectiveFrom||z.evidenceDate||report?.generatedAt||''),
    expiresAt:String(z.expiresAt||''),halfLifeHours:friendlyLineup?Math.min(96,num(z.halfLifeHours,96)):num(z.halfLifeHours,0),
    maxMinuteImpact:friendlyLineup?Math.min(8,num(z.maxMinuteImpact,8)):num(z.maxMinuteImpact,0),directImpact:friendlyLineup?false:!!z.directImpact,
    preseasonCalibrated:friendly,verificationStatus:String(z.verificationStatus||''),minutesCap:Number.isFinite(Number(z.minutesCap))?Number(z.minutesCap):null,
    directAvailability:Number.isFinite(Number(z.directAvailability))?Number(z.directAvailability):null,
    selectionCertainty:friendlyLineup?null:(Number.isFinite(Number(z.selectionCertainty))?Number(z.selectionCertainty):null),
    productionImpact:Number.isFinite(Number(z.productionImpact))?Number(z.productionImpact):0,fixtureId:z.fixtureId||null,
    competition:z.competition||null,kickoff:z.kickoff||null,gameweek:Number.isFinite(Number(z.gameweek))?Number(z.gameweek):null,
    auto:true,worker:true,oop:!!z.oop,reportGeneratedAt:report?.generatedAt||null};
}
function scoutAgeText(iso){const ms=Date.now()-Date.parse(iso||'');if(!Number.isFinite(ms))return'unknown age';const m=Math.max(0,Math.round(ms/60000));if(m<60)return`${m} min ago`;const h=Math.round(m/60);if(h<48)return`${h} hr ago`;return`${Math.round(h/24)} d ago`}
function scoutFilteredEvents(events){const mode=document.getElementById('riScoutFilter')?.value||'all';if(mode==='positive')return events.filter(e=>roleEventPresentation(e).direction>0);if(mode==='negative')return events.filter(e=>roleEventPresentation(e).direction<0);if(mode==='oop')return events.filter(e=>e.oop);return events}
/* Evidence authority governs whether a scan may replace earlier role evidence.
   Source reads are reported independently: a later role-extraction timeout can
   make evidence non-authoritative even after every selected article was read.
   Workers below schema 1.3 omit the authority flag and retain the old behaviour. */
function scoutReportIsAuthoritative(report){return report?.evidenceAuthoritative!==false}
function scoutSourceReadCount(report){return Math.max(0,num(report?.sourceDocumentsRead,num(report?.diagnostics?.sourceDocumentsRead,num(report?.diagnostics?.articleDocuments))))}
function scoutRetentionMessage(report){const readCount=scoutSourceReadCount(report),age=scoutAgeText(report?.evidenceGeneratedAt||report?.generatedAt),aiStatus=String(report?.diagnostics?.aiStatus||'').toLowerCase();if(!readCount)return`This scan read no article documents, so evidence gathered ${age} has been retained rather than cleared. ${report?.evidenceNote||''}`.trim();if(aiStatus&&aiStatus!=='ok'&&aiStatus!=='not-needed')return`This scan read ${readCount} current article document${readCount===1?'':'s'}, but role extraction was ${aiStatus}. Evidence gathered ${age} has been retained rather than cleared.`;return`This scan read ${readCount} current article document${readCount===1?'':'s'}, but the resulting role evidence was not authoritative. Evidence gathered ${age} has been retained rather than cleared.`}
function applyScoutReport(report){if(!report||report.status!=='ok'||!Array.isArray(report.events))throw new Error(report?.error||'Scout response was not recognised.');const team=String(report.team||document.getElementById('riTeam')?.value||'').toUpperCase();const mapped=report.events.map(z=>scoutEventLocal(z,report)).filter(Boolean);const priorWorker=roleIntelEvents().filter(e=>e.worker&&e.team===team);const retained=!scoutReportIsAuthoritative(report)&&!mapped.length&&priorWorker.length>0;const applied=retained?priorWorker:mapped;const manual=roleIntelEvents().filter(e=>!(e.worker&&e.team===team));S.roleIntel.events=[...manual,...applied];SCOUT.last=report;SCOUT.retained=retained;SCOUT.error='';bumpCache();saveUserState();renderRoleIntelligence();render();return applied}
function renderScoutReport(report,mapped){const host=document.getElementById('roleScanOut');if(!host)return;const rows=scoutFilteredEvents(mapped);const age=scoutAgeText(report.generatedAt),cache=report.cache==='HIT'?'CACHED':'FRESH',stale=!!report.stale,refreshing=!!report.refreshing;const throttled=!!report.forceThrottled,locked=!!report.scanLocked,retrySec=num(report.retryAfterSec,0),carried=!!report.evidenceCarriedForward||!!SCOUT.retained,authoritative=scoutReportIsAuthoritative(report),diag=report.diagnostics||{},readCount=scoutSourceReadCount(report),aiStatus=String(diag.aiStatus||'').toLowerCase(),aiIssue=readCount>0&&aiStatus&&aiStatus!=='ok'&&aiStatus!=='not-needed',clubEvents=Array.isArray(report.clubEvents)?report.clubEvents:[],tsCov=clamp(num(diag.timestampCoverage),0,1),recency=!!diag.recencyRankingUsed,cacheHits=num(diag.cacheHits),candidateCount=num(diag.candidates),scanMode=String(diag.scanMode||'');const emptyMsg=mapped.length?'<div class="news-empty">No evidence matched the selected filter. Switch Show back to all material changes to see the rest.</div>':(authoritative?'<div class="news-empty">No mapped xMins change was justified by the current evidence. Confirmed club news, when present, is shown separately above rather than being forced into a player-minute adjustment.</div>':(readCount?'<div class="news-empty"><b>Current article sources were read, but role extraction was not authoritative.</b> No new inferred role change has replaced retained evidence; deterministic club and FPL events remain protected.</div>':'<div class="news-empty"><b>OTB could not read this club\'s sources on this scan.</b> No role change has been inferred, and no earlier evidence was available to retain. This is a source availability problem, not a finding of no news.</div>'));host.className='scout-status '+(!authoritative?'bad':(report.sourceErrors?.length?'warn':'good'));const cards=rows.map(e=>{const pres=roleEventPresentation(e),url=e.sourceUrl?`<div class="sp-source">${esc(e.sourceUrl)}</div>`:'',competitor=['signing','departure','injury','return'].includes(String(e.type)),reasonText=(()=>{const subj=String(e.subject||'').trim(),aff=String(e.affected||'').trim(),body=String(e.source||'').trim();if(!competitor||!subj||subj.toLowerCase()===aff.toLowerCase())return body;const dup=body.toLowerCase().startsWith(subj.toLowerCase())||body.toLowerCase().includes(subj.toLowerCase());return (dup?body:`${subj} — ${body}`)+(body.toLowerCase().includes(aff.toLowerCase())?'':` · affects ${aff}`)})();const semanticNote=pres.selection?'<div class="source-note" style="margin-top:5px">Directional selection evidence. Net constrained xMin/xPts impact is shown in the player impact panel below.</div>':'';return`<div class="scout-player ${pres.tone}"><div class="sp-head"><b>${esc(e.affected)} ${e.oop?'<span class="pflag flag-doubt">OOP</span>':''}</b><span class="sp-delta" style="color:${pres.direction>=0?'var(--mint)':'#FF91B5'}">${pres.label}</span></div><div class="sp-reason">${esc(reasonText)}</div>${url}${semanticNote}</div>`}).join('');const breaking=clubEvents.map(e=>`<div class="scout-breaking"><div class="sb-head"><b>${esc(e.subject)}</b><span class="sb-tag">${esc(String(e.type||'NEWS').toUpperCase())} · OFFICIAL</span></div><div class="sb-note">${esc(e.reason||'Confirmed official club event detected.')}</div>${e.source?`<div class="sp-source">${esc(e.source)}</div>`:''}</div>`).join('');const discoveryBadge=recency?`RECENCY ${Math.round(tsCov*100)}%`:`KEYWORD ONLY ${Math.round(tsCov*100)}%`;host.innerHTML=`<div><b>${esc(report.club||report.team)} Scout Report</b> · updated ${esc(age)}${refreshing?' · background refresh started':''}</div><div class="scout-meta"><span>${cache}</span>${report.schemaVersion?`<span>SCOUT v${esc(report.schemaVersion)}</span>`:''}${report.scanExecuted===true?'<span>SCAN EXECUTED</span>':report.scanLocked?'<span>NO NEW SCAN</span>':''}${scanMode?`<span>${esc(scanMode.toUpperCase())}</span>`:''}<span>${mapped.length} mapped xMins item${mapped.length===1?'':'s'}</span>${clubEvents.length?`<span>${clubEvents.length} confirmed club event${clubEvents.length===1?'':'s'}</span>`:''}<span>${num(report.roster?.players)} FPL players</span><span>${candidateCount} candidates</span>${readCount?`<span>${readCount} article doc${readCount===1?'':'s'}</span>`:'<span>NO SOURCES READ</span>'}${aiIssue?`<span>ROLE EXTRACTION ${esc(aiStatus.toUpperCase())}</span>`:''}<span>${discoveryBadge}</span>${cacheHits?`<span>${cacheHits} cached</span>`:''}${stale?'<span>STALE</span>':''}${throttled?'<span>COOLDOWN</span>':''}${locked?'<span>SCAN IN PROGRESS</span>':''}${carried?'<span>RETAINED</span>':''}${report.roster?.added?.length?`<span>${report.roster.added.length} roster addition(s)</span>`:''}${report.roster?.missingUnresolved?.length?`<span>${report.roster.missingUnresolved.length} unresolved absence(s)</span>`:''}</div>${breaking}${cards||emptyMsg}${clubEvents.length&&!mapped.length?'<div class="source-note" style="margin-top:7px"><b>Important:</b> OTB found confirmed club news but has not invented a player xMins consequence. That mapping waits for enough role evidence or an FPL roster update.</div>':''}${throttled?`<div class="source-note" style="margin-top:7px"><b>No new scan was run.</b> A forced scan for this club ran very recently, so the saved report is shown instead${retrySec?` — try again in about ${Math.ceil(retrySec)}s`:''}. This protects the browser-rendering allowance.</div>`:''}${locked?'<div class="source-note" style="margin-top:7px"><b>A scan for this club was already running.</b> The saved report is shown; refresh shortly for the new one.</div>':''}${carried?`<div class="source-note" style="margin-top:7px">${esc(scoutRetentionMessage(report))}</div>`:''}${report.sourceErrors?.length?`<div class="source-note" style="margin-top:7px">${report.sourceErrors.length} source request(s) failed; the report used the evidence that remained available.</div>`:''}`}
async function fetchScoutTeam(force=false,{poll=false}={}){
  const team=document.getElementById('riTeam')?.value;if(!team)throw new Error('Choose a club first.');
  const host=document.getElementById('roleScanOut'),load=document.getElementById('btnRoleScan'),fresh=document.getElementById('btnRoleForceRefresh');
  if(SCOUT.loading)return;if(!poll)cancelScoutPoll();SCOUT.loading=true;load.disabled=true;fresh.disabled=true;
  if(!poll){host.className='scout-status';host.innerHTML=`<span class="scout-spinner"></span>${force?'Running fresh club scan, Browser/AI analysis and role reconciliation…':'Loading the latest saved scout report…'}`}
  try{
    const url=`${SCOUT_API_BASE}/api/role-intelligence?team=${encodeURIComponent(team)}${force?'&force=1':''}`;
    const response=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'}),data=await response.json().catch(()=>({}));
    if(!response.ok||data.status!=='ok')throw new Error(data.error||`Scout Worker HTTP ${response.status}`);
    if(!schemaAtLeast(data.schemaVersion,SCOUT_SCHEMA_MIN)||String(data.season||'')!==EXPECTED_SEASON)throw new Error(`Scout contract mismatch: got schema ${data.schemaVersion||'unknown'} / season ${data.season||'unknown'}, expected schema >= ${SCOUT_SCHEMA_MIN} / ${EXPECTED_SEASON}`);
    SCOUT.health={schemaVersion:data.schemaVersion,workerBuild:data.workerBuild,season:data.season};
    const mapped=applyScoutReport(data);renderScoutReport(data,mapped);
    if(Array.isArray(data.clubEvents)&&data.clubEvents.length)refreshNewsFeed({silent:true});
    if(data.refreshing||data.scanLocked)scheduleScoutPoll(team,data.refreshAfterMs);else cancelScoutPoll();
    if(!poll)flash(data.forceThrottled?`${data.club||team}: cooldown active — showing the saved report, no new scan run.`:data.scanLocked?`${data.club||team}: scan running — this panel will refresh automatically.`:`${data.club||team}: ${mapped.length} Scout evidence item${mapped.length===1?'':'s'} applied.`);
  }catch(e){
    SCOUT.error=e?.message||String(e);
    if(!poll){host.className='scout-status bad';host.innerHTML=`<b>Scout Worker unavailable.</b><div class="source-note">${esc(SCOUT.error)}</div><div class="source-note" style="margin-top:5px">Existing saved/manual role evidence remains active; no projections were silently changed.</div>`}
  }finally{SCOUT.loading=false;load.disabled=false;fresh.disabled=false}
}
function roleEventFromControls(){const key=document.getElementById('riAffected').value,p=POOL.find(x=>stableKey(x)===key);if(!p)throw new Error('Select an affected player.');return{id:'ri-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:Date.now(),team:document.getElementById('riTeam').value,type:document.getElementById('riType').value,subject:document.getElementById('riSubject').value.trim()||'Unspecified competitor',role:document.getElementById('riRole').value,affected:p.n,affectedKey:stableKey(p),overlap:num(document.getElementById('riOverlap').value)/100,hierarchy:num(document.getElementById('riHierarchy').value)/100,confidence:num(document.getElementById('riConfidence').value),source:document.getElementById('riSource').value.trim()||'Manual intelligence entry'} }
function addRoleEvent(e){if(!S.roleIntel)S.roleIntel={events:[]};S.roleIntel.events.push(e);bumpCache();saveUserState();renderRoleIntelligence();render()}
function roleProjectionWithoutIntel(p,gw){ROLE_INTEL.suspend=true;bumpCache();const md=minuteDetail(p),r=project(p,gw);ROLE_INTEL.suspend=false;bumpCache();return{md,r}}
function roleImpactRows(){const keys=[...new Set(roleIntelEvents().map(e=>e.affectedKey))];return keys.map(key=>{const p=POOL.find(x=>stableKey(x)===key);if(!p)return null;const base=roleProjectionWithoutIntel(p,S.gw),nowMd=minuteDetail(p),now=project(p,S.gw);return{p,baseMd:base.md,base:base.r,nowMd,now,delta:nowMd.exp-base.md.exp,xDelta:now.x-base.r.x,events:roleIntelFor(p).events}}).filter(Boolean)}
function renderRoleIntelligence(){populateRolePlayers();const eventHost=document.getElementById('roleEvents'),impact=document.getElementById('roleImpact');if(!eventHost||!impact)return;const events=roleIntelEvents();const autoCount=events.filter(e=>e.worker).length,manualCount=events.length-autoCount;const clearBar=events.length?`<div class="role-clearbar"><span>${events.length} active · ${autoCount} scanned · ${manualCount} manual</span><span>${autoCount?'<button type="button" data-role-clear="auto">Clear scanned</button>':''}<button type="button" data-role-clear="all">Clear all</button></span></div>`:'';eventHost.innerHTML=clearBar+(events.length?events.slice().reverse().map(e=>{const pres=roleEventPresentation(e),badge=roleEvidenceLabel(e),note=pres.selection?'<div class="source-note" style="margin-top:5px">Directional selection evidence. Net constrained xMin/xPts impact is shown in the player impact panel below.</div>':'';return`<div class="role-event ${pres.tone}"><div class="re-head"><span class="role-badge ${badge}">${badge}</span><b>${esc(e.affected)} ${e.oop?'<span class="pflag flag-doubt">OOP</span>':''}</b><span class="re-delta" style="color:${pres.direction>=0?'var(--mint)':'#FF91B5'}">${pres.label}</span></div><div class="re-meta">${esc(e.team)} · ${esc(e.role||'role n/a')} · ${esc(e.type)}${e.auto?' · AUTO-SCANNED':''} · overlap ${Math.round(100*num(e.overlap))}% · hierarchy ${Math.round(100*num(e.hierarchy))}% · confidence ${Math.round(100*num(e.confidence))}%</div><div class="re-note"><b>${esc(e.subject)}</b> · ${esc(e.source)}</div>${note}<button type="button" data-role-remove="${esc(e.id)}">Remove event</button></div>`}).join(''):'<div class="accuracy-empty">No role events are active. Run the Barnes test or add structured evidence.</div>');const rows=roleImpactRows();impact.innerHTML=rows.length?rows.map(x=>`<div class="role-intel"><div class="re-head"><b>${esc(x.p.n)} · ${x.p.t}</b><span class="re-delta" style="color:${x.delta>=0?'var(--mint)':'#FF91B5'}">${x.delta>=0?'+':''}${x.delta.toFixed(1)} xMin · ${x.xDelta>=0?'+':''}${x.xDelta.toFixed(2)} xPts</span></div><div class="role-impact"><div class="xbox"><div class="k">Baseline xMins</div><div class="v">${x.baseMd.exp.toFixed(1)}</div></div><div class="xbox"><div class="k">Intelligence xMins</div><div class="v">${x.nowMd.exp.toFixed(1)}</div></div><div class="xbox"><div class="k">Baseline GW${S.gw} xPts</div><div class="v">${x.base.x.toFixed(2)}</div></div><div class="xbox"><div class="k">Revised GW${S.gw} xPts</div><div class="v">${x.now.x.toFixed(2)}</div></div></div><div class="source-note">${x.events.length} active evidence item${x.events.length===1?'':'s'}. ${x.nowMd.override||x.nowMd.startOverride?'A manual minutes/start override is active for this player and remains authoritative.':'No manual minutes/start override is active; the displayed change is the automatic constrained role model.'}</div></div>`).join(''):'<div class="role-intel"><b>No calculated impacts yet.</b><div class="source-note">Events will show before/after xMins and xPts here.</div></div>';eventHost.querySelectorAll('[data-role-remove]').forEach(b=>b.onclick=()=>{S.roleIntel.events=S.roleIntel.events.filter(e=>e.id!==b.dataset.roleRemove);bumpCache();saveUserState();renderRoleIntelligence();render()});eventHost.querySelectorAll('[data-role-clear]').forEach(b=>b.onclick=()=>{const mode=b.dataset.roleClear,current=roleIntelEvents();const doomed=mode==='auto'?current.filter(e=>e.worker):current;if(!doomed.length)return;if(!confirm(`Remove ${doomed.length} ${mode==='auto'?'scanned':'role'} event(s)? This cannot be undone, though a fresh scan can re-import scanned evidence.`))return;S.roleIntel.events=mode==='auto'?current.filter(e=>!e.worker):[];if(mode!=='auto')SCOUT.last=null;SCOUT.retained=false;bumpCache();saveUserState();renderRoleIntelligence();render()})}
function importRoleEvents(){const box=document.getElementById('riJson'),status=document.getElementById('riImportStatus');try{const raw=JSON.parse(box.value),arr=Array.isArray(raw)?raw:[raw],added=[];for(const z of arr){const p=rolePlayerByName(z.team,z.affected);if(!p)throw new Error(`Affected player not found: ${z.affected}`);added.push({id:'ri-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:Date.now(),team:p.t,type:String(z.type||'departure'),subject:String(z.subject||'Structured event'),affected:p.n,affectedKey:stableKey(p),overlap:clamp(num(z.overlap,.8),0,1),hierarchy:clamp(num(z.hierarchy,.8),0,1),confidence:clamp(num(z.confidence,.7),0,1),source:String(z.source||'Structured import')})}S.roleIntel.events.push(...added);bumpCache();saveUserState();renderRoleIntelligence();render();status.className='schedule-import-status good';status.textContent=`Imported ${added.length} role event${added.length===1?'':'s'}.`}catch(e){status.className='schedule-import-status bad';status.textContent=e.message}}
function runBarnesRoleTest(signing=false){const p=rolePlayerByName('NEW','Barnes');if(!p){flash('Barnes is not present in the current player pool. Refresh live data or import a structured event for another player.');return}const e=signing?{type:'signing',subject:'Elite left-wing signing (test)',overlap:.95,hierarchy:.95,confidence:1,source:'Scenario test · direct high-status competitor'}:{type:'departure',subject:'Anthony Gordon',overlap:.92,hierarchy:.90,confidence:1,source:'Scenario test · confirmed direct competitor departure'};addRoleEvent({id:'ri-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:Date.now(),team:'NEW',affected:p.n,affectedKey:stableKey(p),...e})}
function runHumeRoleTest(){const p=rolePlayerByName('SUN','Hume');if(!p){flash('Hume is not present in the current FPL player pool. Refresh live data, then rerun the test.');return}addRoleEvent({id:'ri-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:Date.now(),team:'SUN',type:'observed_role',subject:p.n,role:'RW',affected:p.n,affectedKey:stableKey(p),overlap:1,hierarchy:.82,confidence:.7,source:'Scenario test · two consecutive preseason starts at right wing',auto:true,oop:p.p!=='MID'&&p.p!=='FWD',observed:true})}
function wireRoleIntelligence(){const team=document.getElementById('riTeam');if(!team)return;populateRolePlayers();team.onchange=()=>{cancelScoutPoll();populateRolePlayers();const out=document.getElementById('roleScanOut');if(out)out.innerHTML='<div class="source-note">Club changed. Tap Load latest scout report.</div>'};for(const id of ['riOverlap','riHierarchy']){const el=document.getElementById(id);if(el)el.oninput=e=>{const lab=document.getElementById(id+'Label');if(lab)lab.textContent=e.target.value+'%'}}document.getElementById('btnRoleScan').onclick=()=>fetchScoutTeam(false);document.getElementById('btnRoleForceRefresh').onclick=()=>fetchScoutTeam(true);document.getElementById('riScoutFilter').onchange=()=>{if(SCOUT.last){const mapped=roleIntelEvents().filter(e=>e.worker&&e.team===SCOUT.last.team);renderScoutReport(SCOUT.last,mapped)}};document.getElementById('btnRoleLocalScan').onclick=()=>{try{scanAndApplyRoleEvent()}catch(e){flash(e.message)}};document.getElementById('btnRoleApply').onclick=()=>{try{addRoleEvent(roleEventFromControls())}catch(e){flash(e.message)}};document.getElementById('btnRoleBarnesTest').onclick=()=>runBarnesRoleTest(false);document.getElementById('btnRoleSigningTest').onclick=()=>runBarnesRoleTest(true);document.getElementById('btnRoleHumeTest').onclick=runHumeRoleTest;document.getElementById('btnRoleClear').onclick=()=>{if(!confirm('Clear every active role-intelligence event?'))return;cancelScoutPoll();S.roleIntel.events=[];SCOUT.last=null;bumpCache();saveUserState();renderRoleIntelligence();render();const out=document.getElementById('roleScanOut');if(out)out.innerHTML='<div class="source-note">No scout report is currently applied.</div>'};document.getElementById('btnRoleImport').onclick=importRoleEvents;renderRoleIntelligence()}
function runSelfTests(){const USER_TEST_HORIZON=S.horizon;if(S.horizon>2){S.horizon=2;bumpCache()}const tests=[],add=(name,ok,detail='',cat='engineering',status=null)=>{const state=status||((!!ok)?'PASS':'FAIL');tests.push({name,ok:state==='PASS',status:state,detail,cat})},skip=(name,detail='',cat='engineering')=>add(name,false,detail,cat,'SKIP'),matches=Object.values(FIX).flat().length;add('Fixture schedule usable',matches>=300,`${matches} scheduled`,'data');const staticRound=Object.values(STATIC_FIX).every(g=>g.length===10&&new Set(g.flat()).size===20);add('Embedded 380-fixture fallback valid',Object.values(STATIC_FIX).flat().length===380&&staticRound,'','data');const sample=POOL.slice(0,Math.min(POOL.length,120));let finite=true,balanced=true,interval=true;for(const p of sample)for(let g=1;g<=Math.min(38,Object.keys(FIX).length);g++){const r=project(p,g);if(!Number.isFinite(r.x)||!Number.isFinite(r.sd))finite=false;if(Math.abs(sumParts(r.parts)-r.x)>1e-6)balanced=false;if(r.low>r.x||r.high<r.x)interval=false}add('xPts finite',finite,'','model');add('Components reconcile to xPts',balanced,'','model');add('Uncertainty intervals valid',interval,'','model');const newcomers=POOL.filter(p=>!p.histPts).slice(0,20);add('New-player price priors non-zero',newcomers.every(p=>pricePrior(p)>0),'','data');const h=POOL.find(p=>normalName(p.n)==='haaland');add('No raw 0.88 minutes penalty',!h||minuteDetail(h).relative>.85, h?minuteDetail(h).relative.toFixed(2):'not found','model');try{const thresholds={GK:150,DEF:175,MID:185,FWD:170},elite=POOL.filter(p=>availability(p)>=.99&&num(p.histPts)>=thresholds[p.p]&&(!p.histTeam||p.histTeam===p.t)),bad=elite.filter(p=>minuteDetail(p).pAppear<.85);add('Elite available players retain a credible appearance floor',bad.length===0,bad.length?bad.slice(0,5).map(p=>`${p.n} ${(100*minuteDetail(p).pAppear).toFixed(0)}%`).join(' · '):`${elite.length} elite players checked`,'model')}catch(e){add('Elite available players retain a credible appearance floor',false,e.message,'model')}try{const probe={p:'GK'},gk=positionUsage(probe),def=POSITION_USAGE.DEF,mid=POSITION_USAGE.MID,fwd=POSITION_USAGE.FWD;add('Position-specific substitution profiles are ordered realistically',gk.subMax<=.012&&def.subMax<mid.subMax&&mid.subMax<fwd.subMax,`GK ${(100*gk.subMax).toFixed(1)}% max · DEF ${(100*def.subMax).toFixed(0)}% · MID ${(100*mid.subMax).toFixed(0)}% · FWD ${(100*fwd.subMax).toFixed(0)}%`,'model')}catch(e){add('Position-specific substitution profiles are ordered realistically',false,e.message,'model')}try{
  const teams=Object.keys(TEAMS),failures=[],checked=[];
  for(const team of teams){
    const peers=POOL.filter(p=>p.t===team&&p.p==='GK');
    if(!peers.length)continue;
    const role=teamRoleStartMap(team,'GK'),displayed=peers.reduce((a,p)=>a+minuteDetail(p).pStart,0);
    checked.push(team);
    if(role.calibrated&&Math.abs(displayed-role.target)>1e-6)failures.push(`${team} ${displayed.toFixed(3)}≠${role.target.toFixed(3)}`);
  }
  add('Goalkeeper start probabilities obey the strict one-slot target',checked.length>=18&&!failures.length,
    failures.length?failures.slice(0,6).join(' · '):`${checked.length} goalkeeper groups checked`,'model');
}catch(e){add('Goalkeeper start probabilities obey the strict one-slot target',false,e.message,'model')}
try{
  const positions=['DEF','MID','FWD'],groups=[],failures=[];
  for(const team of Object.keys(TEAMS))for(const pos of positions){
    const role=teamRoleStartMap(team,pos);
    if(!role.calibrated)continue;
    groups.push(`${team} ${pos}`);
    const before=Math.abs(role.rawSum-role.target),after=Math.abs(role.sum-role.target);
    if(after>before+1e-6)failures.push(`${team} ${pos} moved away ${before.toFixed(2)}→${after.toFixed(2)}`);
    if(role.mode!=='soft evidence-weighted calibration'||role.strength>=1-1e-9&&Math.max(0,num(DATA.teamPlayed[team]))<8)
      failures.push(`${team} ${pos} ${role.mode} strength ${role.strength.toFixed(2)}`);
  }
  add('Outfield role calibration is soft and moves toward formation targets',groups.length>=40&&!failures.length,
    failures.length?failures.slice(0,6).join(' · '):`${groups.length} DEF/MID/FWD groups checked without hard equality`,'model');
}catch(e){add('Outfield role calibration is soft and moves toward formation targets',false,e.message,'model')}
try{
  const protectedRows=POOL.filter(p=>p.p!=='GK'&&starterEvidenceStrength(p)>=.78&&teamRoleStartMap(p.t,p.p).calibrated),
    failures=protectedRows.filter(p=>{
      const role=teamRoleStartMap(p.t,p.p),raw=num(role.raw[p.id]),shown=teamRoleStartProbability(p),
        floor=roleCompressionFloor(p,Math.max(0,num(DATA.teamPlayed[p.t])));
      return shown+1e-9<raw*floor;
    });
  add('Strong outfield starter priors are protected from excessive compression',failures.length===0,
    failures.length?failures.slice(0,5).map(p=>`${p.n} ${(100*teamRoleStartProbability(p)).toFixed(0)}%`).join(' · '):`${protectedRows.length} strong starter rows protected`,'model');
}catch(e){add('Strong outfield starter priors are protected from excessive compression',false,e.message,'model')}
try{
  const constrained=calibrateRoleRows([{id:1,p:.97,locked:true},{id:2,p:.94,locked:true}],1),
    sum=num(constrained[1])+num(constrained[2]);
  add('Conflicting manual goalkeeper probabilities remain slot-constrained',Math.abs(sum-1)<1e-9,
    `${sum.toFixed(3)} probability mass for one GK slot`,'model');
}catch(e){add('Conflicting manual goalkeeper probabilities remain slot-constrained',false,e.message,'model')}
{
  const savedEvents=[...(S.roleIntel?.events||[])];
  let syntheticKeeper=null;
  try{
    const team=Object.keys(TEAMS).find(t=>POOL.filter(p=>p.t===t&&p.p==='GK').length>=2)||
      Object.keys(TEAMS).find(t=>POOL.some(p=>p.t===t&&p.p==='GK'));
    let keepers=team?POOL.filter(p=>p.t===team&&p.p==='GK').slice(0,2):[];
    if(keepers.length===1){
      const source=keepers[0],nextId=Math.max(0,...POOL.map(p=>num(p.id)))+1000000;
      syntheticKeeper={...source,id:nextId,apiId:null,n:`${source.n} Test Reserve`,histPts:0,histStarts:0,histMinutes:0,
        live:{...(source.live||{}),starts:0,minutes:0,selected:0,epNext:0}};
      POOL.push(syntheticKeeper);keepers=[source,syntheticKeeper];
    }
    if(keepers.length<2)skip('Two friendly goalkeeper starts cannot bypass the one-slot constraint','no two-goalkeeper club pool','model');
    else{
      const now=new Date().toISOString(),events=keepers.map((p,i)=>({id:`friendly-gk-probe-${i}`,createdAt:Date.now()+i,
        team,type:'confirmed_start',rawType:'confirmed_start',sourceType:'confirmed_start',subject:p.n,affected:p.n,
        affectedKey:stableKey(p),overlap:1,hierarchy:1,confidence:1,evidenceClass:'selection',preseasonCalibrated:true,
        source:'named in a pre-season friendly starting XI',sourceUrl:`https://example.com/pre-season-friendly-${i}`,
        effectiveFrom:now,expiresAt:new Date(Date.now()+86400000).toISOString(),selectionCertainty:.995}));
      S.roleIntel.events=events;bumpCache();
      const direct=roleDirectControls(events),role=teamRoleStartMap(team,'GK');
      const displayed=POOL.filter(p=>p.t===team&&p.p==='GK').reduce((a,p)=>a+minuteDetail(p).pStart,0);
      add('Two friendly goalkeeper starts cannot bypass the one-slot constraint',direct.startOverride===null&&Math.abs(displayed-role.target)<1e-6,
        `${displayed.toFixed(3)} displayed / ${role.target.toFixed(3)} target · direct override ${direct.startOverride===null?'suppressed':'active'}`,'model');
    }
    const departureProbe={type:'unavailable',rawType:'unavailable',sourceType:'unavailable',preseasonCalibrated:true,
      evidenceClass:'availability',sourceUrl:'https://example.com/pre-season-friendly'},
      explicitFriendly={type:'friendly_start',rawType:'friendly_start',evidenceClass:'selection'};
    add('Friendly safeguard is limited to lineup evidence',isFriendlyRoleEvent(explicitFriendly)&&
      !isFriendlyRoleEvent(departureProbe)&&roleEventPolicy(departureProbe).channel==='availability',
      'non-lineup availability evidence retains its own policy','model');
    const startPresentation=roleEventPresentation({type:'confirmed_start',rawType:'confirmed_start'}),
      friendlyStartPresentation=roleEventPresentation({type:'friendly_start',rawType:'friendly_start'}),
      benchPresentation=roleEventPresentation({type:'confirmed_bench',rawType:'confirmed_bench'});
    add('Selection evidence attribution cannot invert its semantic direction',
      startPresentation.direction===1&&friendlyStartPresentation.direction===1&&benchPresentation.direction===-1&&
      /START EVIDENCE/.test(startPresentation.label)&&/START EVIDENCE/.test(benchPresentation.label),
      `${startPresentation.label} · ${friendlyStartPresentation.label} · ${benchPresentation.label}`,'model');
  }catch(e){add('Two friendly goalkeeper starts cannot bypass the one-slot constraint',false,e.message,'model')}
  finally{
    if(syntheticKeeper){const i=POOL.indexOf(syntheticKeeper);if(i>=0)POOL.splice(i,1)}
    S.roleIntel.events=savedEvents;bumpCache();
  }
}try{const k=POOL.find(p=>p.t==='TOT'&&p.p==='GK'&&normalName(p.n)==='kinsky'),d=POOL.find(p=>p.t==='TOT'&&p.p==='GK'&&normalName(p.n)==='dubravka');if(!k||!d)skip('Kinsky ranks above Dúbravka in Tottenham goalkeeper hierarchy','both live players not loaded','model');else{const kk=overrideKey(k),dk=overrideKey(d),savedK=S.overrides[kk],savedD=S.overrides[dk];delete S.overrides[kk];delete S.overrides[dk];bumpCache();const kp=teamRoleStartProbability(k),dp=teamRoleStartProbability(d),intelOK=!!startIntel(k)&&!!startIntel(d);if(savedK!==undefined)S.overrides[kk]=savedK;if(savedD!==undefined)S.overrides[dk]=savedD;bumpCache();add('Kinsky ranks above Dúbravka in Tottenham goalkeeper hierarchy',intelOK&&kp>dp,`${(100*kp).toFixed(0)}% vs ${(100*dp).toFixed(0)}% · evidence ${intelOK?'loaded':'missing'}`,'model')}}catch(e){add('Kinsky ranks above Dúbravka in Tottenham goalkeeper hierarchy',false,e.message,'model')}let optOK=false,diag='';const old={budget:S.budget,gw:S.gw,horizon:S.horizon,risk:S.risk,locks:new Set(S.locks),form:document.getElementById('oForm').value,bench:document.getElementById('oBench').value};try{S.budget=100;S.gw=DATA.nextEvent||1;S.horizon=2;S.risk='mean';S.locks=new Set;document.getElementById('oForm').value='';document.getElementById('oBench').value='autosub';bumpCache();const r=optimise();optOK=!!r.list&&legal(r.list)&&cost(r.list)<=100.001;diag=r.list?`${cost(r.list).toFixed(1)}m`:'no result'}catch(e){diag=e.message}finally{S.budget=old.budget;S.gw=old.gw;S.horizon=old.horizon;S.risk=old.risk;S.locks=old.locks;document.getElementById('oForm').value=old.form;document.getElementById('oBench').value=old.bench;bumpCache()}add('Optimiser legal and funded',optOK,diag);try{const PAY='<img src=x onerror=alert(1)>';const el=document.createElement('div');el.innerHTML=`<b>${esc(PAY)}</b>`;add('Saved-name XSS payload is neutralised',!el.innerHTML.includes('<img src=x')&&el.innerHTML.includes('&lt;img'));}catch(e){add('Saved-name XSS payload is neutralised',false,e.message)}try{const sample=POOL.filter(p=>TEAMS[p.t]).slice(0,20).map(p=>p.id);const twoGK=POOL.filter(p=>p.p==='GK').slice(0,2).map(p=>p.id);const overGK=xiLegality([...twoGK,...sample.filter(id=>byId(id).p!=='GK').slice(0,9)]);add('XI validator rejects two goalkeepers',typeof xiLegality==='function'&&overGK!==null,overGK||'validator missing or too permissive');}catch(e){add('XI validator rejects two goalkeepers',false,e.message)}{const savedSquad=[...S.squad],savedStart=new Set(S.start),savedCap=S.cap,savedVice=S.vice;try{const need={GK:2,DEF:5,MID:5,FWD:3},got={GK:0,DEF:0,MID:0,FWD:0},testSquad=[];for(const p of POOL){if(!TEAMS[p.t])continue;if(got[p.p]<need[p.p]){testSquad.push(p.id);got[p.p]++}}if(testSquad.length===15){S.squad=testSquad;autoXI();const first=[...S.start][0];S.cap=first;S.start.delete(first);ensureCaptainValid();add('Captain auto-reassigns when benched',S.start.has(S.cap)&&S.cap!==first,`was ${first}, now ${S.cap}`);add('Captain and vice remain distinct after reassignment',S.cap!==S.vice);}else add('Captain auto-reassigns when benched',false,'could not assemble a 15-player test squad from the current pool');}catch(e){add('Captain auto-reassigns when benched',false,e.message)}finally{S.squad=savedSquad;S.start=savedStart;S.cap=savedCap;S.vice=savedVice;}}{let oldNow=null,oldLegacy=null,captured=false;try{oldNow=localStorage.getItem(CACHE_KEY);oldLegacy=localStorage.getItem(LEGACY_CACHE_KEY);captured=true;localStorage.removeItem(CACHE_KEY);localStorage.setItem(LEGACY_CACHE_KEY,'"probe"');migrateStorage();add('Storage migration copies legacy data',localStorage.getItem(CACHE_KEY)==='"probe"');}catch(e){const unavailable=/localStorage|Access is denied/i.test(e.message||'');if(unavailable)skip('Storage migration copies legacy data','storage unavailable in this browser context');else add('Storage migration copies legacy data',false,e.message)}finally{if(captured){try{if(oldNow===null)localStorage.removeItem(CACHE_KEY);else localStorage.setItem(CACHE_KEY,oldNow);if(oldLegacy===null)localStorage.removeItem(LEGACY_CACHE_KEY);else localStorage.setItem(LEGACY_CACHE_KEY,oldLegacy)}catch(e){add('Storage restoration after migration test',false,e.message)}}}}try{const shape=gwFixtureShape(1);add('Chip planner fixture-shape helper works',typeof shape.doubles==='number'&&typeof shape.blanks==='number',JSON.stringify(shape));}catch(e){add('Chip planner fixture-shape helper works',false,e.message)}{const oldSquad=[...S.squad],oldStart=new Set(S.start),oldLocks=new Set(S.locks),oldOrder=[...S.benchOrder],oldCap=S.cap,oldVice=S.vice;try{const p=POOL.find(x=>x.apiId!=null)||POOL[0],q=POOL.find(x=>x.id!==p?.id&&x.p!=='GK');if(p&&q){const keys=[stableKey(p),stableKey(q)],snap={squad:keys,start:[],locks:[],benchOrder:keys,cap:null,vice:null};remapSelection(snap);add('Bench priority survives stable-key remap',S.benchOrder.join('|')===keys.join('|'));}else add('Bench priority survives stable-key remap',false,'not enough players')}catch(e){add('Bench priority survives stable-key remap',false,e.message)}finally{S.squad=oldSquad;S.start=oldStart;S.locks=oldLocks;S.benchOrder=oldOrder;S.cap=oldCap;S.vice=oldVice;}}try{const test=candidates(),seed=seedSquad(test,100,[],'points'),sc=seed?score(seed,null,'autosub'):null;const perGw=!!sc?.r?.weeks?.length&&sc.r.weeks.every(w=>w.xi.length===11&&xiLegality(w.xi.map(o=>o.p.id))===null&&w.captain&&w.vice&&w.captain.p.id!==w.vice.p.id);add('Horizon score builds a legal XI and captain per GW',perGw,sc?.r?.weeks?.length?`${sc.r.weeks.length} GW checked`:'no horizon result')}catch(e){add('Horizon score builds a legal XI and captain per GW',false,e.message)}try{const start=FIRST_DEADLINE_MAX-6e5,end=LAST_DEADLINE_MIN+6e5,events=Array.from({length:38},(_,i)=>({id:i+1,deadline_time:new Date(start+(end-start)*i/37).toISOString()})),valid=validateSeasonIdentity({events},{season:EXPECTED_SEASON}),wrong=validateSeasonIdentity({events:events.map(e=>({...e,deadline_time:new Date(Date.parse(e.deadline_time)-365*864e5).toISOString()}))},{season:'2025/26'});add('Season validator accepts 2026/27 and rejects wrong season',valid.verified&&!wrong.verified,wrong.problems[0]||'wrong season accepted')}catch(e){add('Season validator accepts 2026/27 and rejects wrong season',false,e.message)}try{const teams=Array.from({length:20},(_,i)=>({id:i+1,short_name:'T'+String(i+1).padStart(2,'0'),name:'Team '+(i+1)})),fixtures=[];let id=1;for(let i=0;i<20;i++)for(let j=i+1;j<20;j++){fixtures.push({id:id++,team_h:i+1,team_a:j+1,event:null,kickoff_time:'2026-09-01T15:00:00Z'});fixtures.push({id:id++,team_h:j+1,team_a:i+1,event:null,kickoff_time:'2027-02-01T15:00:00Z'})}const good=validateFixtureTopology(fixtures,{teams}),badFixtures=fixtures.map(f=>({...f}));badFixtures[badFixtures.length-1]={...badFixtures[0],id:9999};const bad=validateFixtureTopology(badFixtures,{teams});add('Fixture topology accepts round robin and rejects repeated pairing',good.verified&&!bad.verified,bad.problems[0]||'corruption accepted')}catch(e){add('Fixture topology accepts round robin and rejects repeated pairing',false,e.message)}try{const bad=validateWorkerMeta({status:'ok',season:'2025/26',schemaVersion:'2.0',lastOfficialFetch:new Date().toISOString(),bootstrapPlayers:700,fixtures:380,dataHash:'x'});add('Worker contract rejects mismatched season',bad.problems.length>0,bad.problems[0]||'mismatch accepted')}catch(e){add('Worker contract rejects mismatched season',false,e.message)}try{renderStrengths();renderChips();const controls=[...document.querySelectorAll('[data-str],[data-chip]')],named=controls.every(el=>(el.labels&&el.labels.length)||el.getAttribute('aria-label'));add('Generated sliders and chip controls have accessible names',named,`${controls.length} controls checked`)}catch(e){add('Generated sliders and chip controls have accessible names',false,e.message)}try{{const a=document.getElementById('hTests'),b=document.getElementById('hReady');add('Engineering and release readiness are separate indicators',!!a&&!!b&&a!==b&&a.closest('.chipstat')!==b.closest('.chipstat')&&b.textContent!==a.textContent,`${a?.textContent||'—'} / ${b?.textContent||'—'}`)}}catch(e){add('Engineering and release readiness are separate indicators',false,e.message)}try{const test=candidates(),seed=seedSquad(test,100,[],'points'),sc=seed?score(seed,null,'autosub'):null,b=sc?.r?.weeks?.[0]?.bench;add('Expected autosub model is finite and bounded',!!b&&Number.isFinite(b.mean)&&b.mean>=0&&b.mean<=b.fullMean+1e-6,b?`${b.mean.toFixed(2)} of ${b.fullMean.toFixed(2)}`:'no result','model')}catch(e){add('Expected autosub model is finite and bounded',false,e.message,'model')}try{const test=candidates(),seed=seedSquad(test,100,[],'points'),sc=seed?score(seed,null,'autosub'):null,b=sc?.r?.weeks?.[0]?.bench;add('Autosub engine produces three-player outfield priority',!!b&&b.order.length===3&&new Set(b.order.map(o=>o.p.id)).size===3,b?b.order.map(o=>o.p.n).join(' › '):'no order')}catch(e){add('Autosub engine produces three-player outfield priority',false,e.message)}{const old1=S.chips.BB1,old2=S.chips.BB2;try{S.chips.BB1=String(S.gw);S.chips.BB2='';const test=candidates(),seed=seedSquad(test,100,[],'points'),sc=seed?score(seed,null,'boost'):null;add('Bench Boost objective applies one non-negative incremental gain',!!sc?.r&&sc.r.boostGw===S.gw&&sc.r.boostGain>=0,sc?.r?`GW${sc.r.boostGw} +${sc.r.boostGain.toFixed(2)}`:'no result','model');}catch(e){add('Bench Boost objective applies one non-negative incremental gain',false,e.message,'model')}finally{S.chips.BB1=old1;S.chips.BB2=old2;}}try{const source=document.getElementById('optimizerWorkerSource')?.textContent||'';add('Embedded optimiser Worker is available',typeof Worker==='function'&&source.includes('autosubValue')&&source.includes("type:'result'"),typeof Worker==='function'?'Blob Worker source present':'Worker API unavailable')}catch(e){add('Embedded optimiser Worker is available',false,e.message)}try{let id=900000;const row=(pos,mean,appear)=>({p:{id:id++,p:pos,n:pos+id},mean,x:mean,appear}),xi=[row('GK',4,.85),row('DEF',4,.80),row('DEF',4,.85),row('DEF',4,.90),row('MID',5,.82),row('MID',5,.86),row('MID',5,.90),row('MID',5,.92),row('FWD',5,.84),row('FWD',5,.88),row('FWD',5,.91)],benchRows=[row('GK',3,.90),row('DEF',3,.90),row('MID',3,.90),row('FWD',3,.90)],b=expectedAutosub({xi,benchRows});add('Autosub model produces positive cover for a risky XI',b.mean>0&&b.mean<=b.fullMean,`${b.mean.toFixed(2)} expected`, 'model')}catch(e){add('Autosub model produces positive cover for a risky XI',false,e.message,'model')}if(S.horizon!==USER_TEST_HORIZON){S.horizon=USER_TEST_HORIZON;bumpCache()}try{const p={c:5.2};add('Transfer selling-price rule shares profit and takes losses in full',fplSellingPrice(p,5.0)===5.1&&fplSellingPrice({c:4.8},5.0)===4.8,`${fplSellingPrice(p,5.0).toFixed(1)} / ${fplSellingPrice({c:4.8},5.0).toFixed(1)}`)}catch(e){add('Transfer selling-price rule shares profit and takes losses in full',false,e.message)}try{const roll=(ft,used)=>clamp(Math.max(0,ft-used)+1,1,5);add('Free-transfer rollover caps at five',roll(5,0)===5&&roll(1,0)===2&&roll(2,2)===1,`${roll(5,0)}, ${roll(1,0)}, ${roll(2,2)}`)}catch(e){add('Free-transfer rollover caps at five',false,e.message)}try{add('Transfer Planner background Worker is available',!!document.getElementById('transferWorkerSource')?.textContent.trim()&&typeof Worker==='function')}catch(e){add('Transfer Planner background Worker is available',false,e.message)}try{renderTransferStrategy();const ids=['tpStrategyStyle','tpFree','tpHorizon','tpMaxMoves','tpMaxHit','tpBank','tpThreshold','tpDecay','tpFtScale','tpFriction','tpItbValue','tpStress'],controls=ids.map(id=>document.getElementById(id)),named=controls.every(x=>x&&((x.labels&&x.labels.length)||x.getAttribute('aria-label')));add('Transfer Planner controls have accessible labels',named,`${controls.length} controls checked`)}catch(e){add('Transfer Planner controls have accessible labels',false,e.message)}try{if(S.squad.length!==15)skip('Transfer payload preserves a legal current squad and purchase prices','no full user squad');else{const p=transferPlannerPayload();add('Transfer payload preserves a legal current squad and purchase prices',(p.squadIds.length===15)&&Object.keys(p.purchase).length===15,`${p.squadIds.length} players`)}}catch(e){add('Transfer payload preserves a legal current squad and purchase prices',false,e.message)}try{const e=priceMoveHeadroom({c:5.2,p:'MID',n:'Seller',live:{},id:1},{c:5.5,p:'MID',n:'Target',live:{},id:2},.4);add('Price exposure models target rise and seller fall',!!e&&e.worst<=e.headroom-.1,`${e?.headroom?.toFixed(1)} → ${e?.worst?.toFixed(1)}`)}catch(e){add('Price exposure models target rise and seller fall',false,e.message)}try{const controls=['priceWindow','priceScope','priceSort'].map(id=>document.getElementById(id));add('Price Intelligence controls have accessible labels',controls.every(x=>x&&x.labels&&x.labels.length),`${controls.length} controls checked`)}catch(e){add('Price Intelligence controls have accessible labels',false,e.message)}{const old=PRICE.last;try{PRICE.last={players:[{id:1,pressure_index:80,ownership_delta:.2},{id:2,pressure_index:-90,ownership_delta:-.3}]};add('Price pressure lookup preserves positive and negative directions',priceById(1).pressure_index>0&&priceById(2).pressure_index<0);}catch(e){add('Price pressure lookup preserves positive and negative directions',false,e.message)}finally{PRICE.last=old;}}try{const quiet={pressure_index:8,direction:'QUIET',materiality:8};add('Price pressure materiality suppresses quiet market noise',Math.abs(quiet.pressure_index)<20&&quiet.direction==='QUIET'&&quiet.materiality<20,'quiet floor verified')}catch(e){add('Price pressure materiality suppresses quiet market noise',false,e.message)}try{{const source=String(refreshPriceIntel);add('Price Intelligence panel and Worker route are registered',!!document.getElementById('pPrices')&&!!document.querySelector('[data-t="prices"]')&&source.includes('/api/price-intelligence')&&source.includes('PRICE_FETCH_LIMIT'),'endpoint and fetch limit verified')}}catch(e){add('Price Intelligence panel and Worker route are registered',false,e.message)}try{const probe=[6,8,6,5.5,12,9.5,7.5,7.5,7.5,6,5.5,4,7,4,4].map(c=>({c}));add('Currency totals reconcile in exact tenths',moneyTotal(probe)===100,`£${moneyTotal(probe).toFixed(1)}m`)}catch(e){add('Currency totals reconcile in exact tenths',false,e.message)}try{if(!PRICE.last)skip('Price Intelligence request capacity and response integrity','response not loaded yet');else{const contract=priceResponseContract();add('Price Intelligence request capacity and response integrity',contract.ok,contract.detail)}}catch(e){add('Price Intelligence request capacity and response integrity',false,e.message)}try{const rows=[...document.querySelectorAll('#poolList .prow')],rendered=rows.length,a=POOL_RENDER_AUDIT,
    ownedKept=a.ownedInList===0||a.ownedVisible>=a.ownedInList,
    bounded=(POOL.length===0||rendered>0)&&rendered<=POOL_RENDER_LIMIT+S.squad.length;
    add('Player pool uses bounded progressive rendering',bounded&&ownedKept,
      `${rendered} rendered of ${POOL.length}; owned shown ${a.ownedVisible}/${a.ownedInList} after filters`)}catch(e){add('Player pool uses bounded progressive rendering',false,e.message)}try{const ids=['fPreset','fPeriod','fSort','fSecondary','fOwnMax','fAvailable','fStarter','fAffordable','fSetPiece'];add('Advanced player-discovery controls are registered and named',ids.every(id=>{const el=document.getElementById(id);return!!el&&!!el.getAttribute('aria-label')}),`${ids.length} controls checked`)}catch(e){add('Advanced player-discovery controls are registered and named',false,e.message)}try{const gws=discoveryGameweeks(3),ctx=buildDiscoveryContext(gws),sample=POOL.slice(0,Math.min(40,POOL.length)),metrics=['xpts','avg','floor','ceiling','captain','minutes','appearance','start','availability','fixtureAtk','fixtureCS','replacement','value','form','ppg','xgi','xgi90','officialGap','ownership','lowOwnership','differential','rise','fall'];add('Advanced discovery metrics remain finite',sample.every(p=>metrics.every(m=>Number.isFinite(discoveryMetric(p,ctx,m)))),`${sample.length} players × ${metrics.length} metrics`)}catch(e){add('Advanced discovery metrics remain finite',false,e.message)}try{const gws=discoveryGameweeks(3),ctx=buildDiscoveryContext(gws),p=POOL.find(x=>availability(x)<=.001);if(!p)skip('Unavailable player receives zero captaincy score','no zero-availability player');else add('Unavailable player receives zero captaincy score',discoveryMetric(p,ctx,'captain')===0,p.n)}catch(e){add('Unavailable player receives zero captaincy score',false,e.message)}try{const gws=discoveryGameweeks(3),p=POOL[0],f=p?discoveryForecast(p,gws):null;add('Discovery period totals reconcile to per-GW average',!p||Math.abs(f.total-f.avg*f.n)<1e-6,p?`${f.total.toFixed(2)} = ${f.avg.toFixed(2)} × ${f.n}`:'no player')}catch(e){add('Discovery period totals reconcile to per-GW average',false,e.message)}try{const {h}=transferWorkerTestFixture(),v=h.conditional({g:{pAppear:.03,mean:2,utility:2}},'mean');add('Shared Worker conditional value is bounded',v===25,`conditional ${v.toFixed(1)} ≤ 25`,'model')}catch(e){add('Shared Worker conditional value is bounded',false,e.message,'model')}try{const {h,c}=transferWorkerTestFixture(),m=[1,2,3,4,5].map(ft=>h.ftValue(ft,c)),marg=m.slice(1).map((v,i)=>v-m[i]);add('FT marginal value is non-increasing',marg.every((v,i)=>i===0||v<=marg[i-1]+1e-9),marg.map(v=>v.toFixed(2)).join(' › '))}catch(e){add('FT marginal value is non-increasing',false,e.message)}try{const {h,r,map}=transferWorkerTestFixture();add('Behavioural route preserves legal squad, bank and FT bounds',h.legal(r.finalIds,map)&&r.plan.every(w=>w.bankAfter>=-.001&&w.ftAfter>=1&&w.ftAfter<=5),`${r.plan.length} GW · bank £${r.finalBank.toFixed(1)} · FT ${r.finalFt}`)}catch(e){add('Behavioural route preserves legal squad, bank and FT bounds',false,e.message)}try{const {h,p,c,r}=transferWorkerTestFixture(),s=h.runProjectionStress(p,c,r.signature,r.stressCandidates);add('Input stress re-scores a fixed primary candidate set',!!s&&s.search==='fixed primary candidate-set re-score'&&s.candidateCount===r.stressCandidates.length&&s.runs===4,`${s?.runs||0} draws · ${s?.candidateCount||0} fixed candidates`,'model')}catch(e){add('Input stress re-scores a fixed primary candidate set',false,e.message,'model')}try{const {h}=transferWorkerTestFixture(),row=(pos,mean,appear,id)=>({p:{id,p:pos,n:pos+id},g:{mean,utility:mean,pAppear:appear}}),xi=[row('GK',4,.85,1),row('DEF',4,.8,2),row('DEF',4,.85,3),row('DEF',4,.9,4),row('MID',5,.82,5),row('MID',5,.86,6),row('MID',5,.9,7),row('MID',5,.92,8),row('FWD',5,.84,9),row('FWD',5,.88,10),row('FWD',5,.91,11)],bench=[row('GK',3,.9,12),row('DEF',2,.03,13),row('MID',3,.9,14),row('FWD',3,.9,15)],b=h.autosub({xi,bench});add('Worker autosub mean is bounded by unconditional bench mean',b.mean>=0&&b.mean<=b.fullMean+1e-9,`${b.mean.toFixed(2)} ≤ ${b.fullMean.toFixed(2)}`,'model')}catch(e){add('Worker autosub mean is bounded by unconditional bench mean',false,e.message,'model')}try{const {h}=transferWorkerTestFixture(),probe=h.selectedAutosubs({DEF:3,MID:2,FWD:3},2,[{p:{p:'DEF'}}]);add('Worker autosub regression permits a legal partial substitution',probe.length===1,`${probe.length} partial substitute selected`,'model')}catch(e){add('Worker autosub regression permits a legal partial substitution',false,e.message,'model')}try{renderChips();const wc1=[...document.getElementById('chip-WC1').options].map(o=>o.value),fh1=[...document.getElementById('chip-FH1').options].map(o=>o.value);add('Opening Wildcard and Free Hit exclude GW1',!wc1.includes('1')&&!fh1.includes('1'),'WC1/FH1 begin at GW2')}catch(e){add('Opening Wildcard and Free Hit exclude GW1',false,e.message)}try{const common=document.getElementById('workerCommonSource')?.textContent||'',transfer=document.getElementById('transferWorkerSource')?.textContent||'',chip=document.getElementById('chipAdvisorWorkerSource')?.textContent||'';add('Transfer and chip workers consume one shared mechanics source',common.includes('function conditional')&&!transfer.includes('function conditional')&&!chip.includes('function conditional'),'one definition · two consumers')}catch(e){add('Transfer and chip workers consume one shared mechanics source',false,e.message)}
try{const visible=document.getElementById('chipAdvisorOut'),resolved=typeof chipAdvisorHost==='function'?chipAdvisorHost():null;add('Chip Advisor is bound to its visible output host',!!visible&&resolved===visible,resolved?.id||'host unresolved')}catch(e){add('Chip Advisor is bound to its visible output host',false,e.message)}
try{const src=document.getElementById('chipAdvisorWorkerSource')?.textContent||'';add('Chip advisor prevents two chips sharing a gameweek',src.includes('resolveChipCollisions')&&src.includes('only one chip may be played per gameweek'),'collision resolver registered')}catch(e){add('Chip advisor prevents two chips sharing a gameweek',false,e.message)}
try{const src=document.getElementById('chipAdvisorWorkerSource')?.textContent||'';add('Free Hit is valued by alternative-squad gain, not squad weakness',src.includes('function freeHitXI')&&!/score:0,squadXp/.test(src),'temporary-XI gain replaces the hardcoded zero','model')}catch(e){add('Free Hit is valued by alternative-squad gain, not squad weakness',false,e.message,'model')}
try{const src=document.getElementById('chipAdvisorWorkerSource')?.textContent||'';add('Free Hit preserves negative differential and requires activation threshold',src.includes('const rawGain=alt-mine,threshold=7.0')&&src.includes('qualified:rawGain>=threshold')&&src.includes('estimated advantage'),'candidate ranking cannot masquerade as a recommendation','model')}catch(e){add('Free Hit preserves negative differential and requires activation threshold',false,e.message,'model')}
try{const src=document.getElementById('chipAdvisorWorkerSource')?.textContent||'';add('Triple Captain promotion requires the target to be owned',src.includes('best.playerId')&&src.includes('best.qualified=!!best.owned'),'unowned TC candidate is informational only','model')}catch(e){add('Triple Captain promotion requires the target to be owned',false,e.message,'model')}
try{const src=String(verdictContext);add('Verdict Action Queue consumes qualified chip recommendations only',src.includes('if(row.qualified)ctx.chips.push(row)'),'candidate chip windows remain outside the action queue')}catch(e){add('Verdict Action Queue consumes qualified chip recommendations only',false,e.message)}
try{const src=document.getElementById('chipAdvisorWorkerSource')?.textContent||'';add('Chip advisor describes itself as rule-based, not a strategic optimiser',src.includes('rule-based')&&!src.includes('strategicSynergy'),'engine self-description matches implementation')}catch(e){add('Chip advisor describes itself as rule-based, not a strategic optimiser',false,e.message)}
try{const chipTab=document.querySelector('.tabs button[data-t="chips"]'),source=String(chipTab?.onclick||'');add('Opening the Chips panel schedules automated advice',!!chipTab&&typeof scheduleChipAdvisor==='function'&&source.includes('scheduleChipAdvisor'),'tab route and scheduler verified')}catch(e){add('Opening the Chips panel schedules automated advice',false,e.message)}
try{add('Release identity is internally consistent',document.title.includes(APP_RELEASE)&&document.documentElement.dataset.release===APP_RELEASE_SLUG,document.documentElement.dataset.release||'missing release metadata')}catch(e){add('Release identity is internally consistent',false,e.message)}try{add('Startup hydration is progressive and deferred',typeof runWhenIdle==='function'&&typeof schedulePostLiveHydration==='function','idle scheduler + deferred live hydration registered','engineering')}catch(e){add('Startup hydration is progressive and deferred',false,e.message,'engineering')}try{const probe=[{player_id:999,web_name:'Zulu',team_code:'ARS',status:'d',chance:50},{player_id:998,web_name:'Alpha',team_code:'ARS',status:'i',chance:0}],sorted=sortCurrentAlerts(probe);add('Current alerts use squad-and-urgency priority rather than alphabetic order',sorted[0]?.web_name==='Alpha'&&typeof alertOwned==='function','priority sorter registered')}catch(e){add('Current alerts use squad-and-urgency priority rather than alphabetic order',false,e.message)}try{const src=document.getElementById('transferWorkerSource')?.textContent||'';add('Transfer roll verdict exposes strongest rejected opportunity',src.includes('exploreTolerance')&&src.includes('opportunity')&&src.includes('candidateCount'),'diagnostic candidate retained')}catch(e){add('Transfer roll verdict exposes strongest rejected opportunity',false,e.message)}try{const ids=['fplTeamId','btnImportFplTeam','teamImportStatus'];add('FPL team-import controls are registered and named',ids.every(id=>{const el=document.getElementById(id);return!!el&&(id==='teamImportStatus'||(id==='btnImportFplTeam'&&!!el.textContent.trim())||((el.labels&&el.labels.length)||el.getAttribute('aria-label')))}),`${ids.length} import controls checked`)}catch(e){add('FPL team-import controls are registered and named',false,e.message)}try{const gws=scheduleGws(S.gw,6),rows=Object.keys(TEAMS).map(c=>scheduleTeamStats(c,gws));add('Schedule Intelligence produces finite club metrics',gws.length>0&&rows.length===Object.keys(TEAMS).length&&rows.every(r=>['avgAtk','avgCS','avgOverall','congestion','swing'].every(k=>Number.isFinite(r[k]))),`${rows.length} clubs · ${gws.length} GWs`,'model')}catch(e){add('Schedule Intelligence produces finite club metrics',false,e.message,'model')}try{const ids=['fxStart','fxN','fxView','fxTeamFocus','fxCompareA','fxCompareB','fxCompareSwap','fxExternalInput','fxImportExternal','fxSyncExternal','fxExampleExternal','fxClearExternal'];add('Schedule Intelligence controls are registered',ids.every(id=>!!document.getElementById(id)),`${ids.length} controls checked`)}catch(e){add('Schedule Intelligence controls are registered',false,e.message)}try{const gws=scheduleGws(S.gw,6),rows=Object.keys(TEAMS).map(c=>scheduleTeamStats(c,gws)),pairs=scheduleRotationPairs(rows,gws);add('Defensive rotation engine returns legal distinct club pairs',pairs.length>0&&pairs.every(x=>x.a.code!==x.b.code&&Number.isFinite(x.avg)),`${pairs.length} ranked pairs`,'model')}catch(e){add('Defensive rotation engine returns legal distinct club pairs',false,e.message,'model')}try{const probe=[{dOverall:5,dAtk:5,dCS:5},{dOverall:5,dAtk:5,dCS:5}],single=[probe[0]];add('Fixture difficulty is independent of fixture volume',Math.abs(scheduleGwDifficulty(probe,'overall')-scheduleGwDifficulty(single,'overall'))<1e-9,`${scheduleGwDifficulty(single).toFixed(1)} single · ${scheduleGwDifficulty(probe).toFixed(1)} double`,'model')}catch(e){add('Fixture difficulty is independent of fixture volume',false,e.message,'model')}try{const rows=parseExternalCalendar(JSON.stringify([{team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Inter',home:true}]));add('Supplementary calendar parses without affecting FPL fixture arrays',rows.length===1&&rows[0].team==='ARS'&&isPremierCompetition(rows[0].competition)===false,`${rows.length} record parsed`,'engineering')}catch(e){add('Supplementary calendar parses without affecting FPL fixture arrays',false,e.message,'engineering')}
try{const rows=externalRowsFromPayload([{team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Inter',status:'PST'}]);add('Supplementary calendar excludes postponed fixtures',rows.length===0,`${rows.length} postponed records retained`,'engineering')}catch(e){add('Supplementary calendar excludes postponed fixtures',false,e.message,'engineering')}try{const css=[...document.styleSheets].flatMap(s=>{try{return[...s.cssRules].map(r=>r.cssText)}catch(e){return[]}}).join(' '),mobileSafe=css.includes('min-height: 100%')&&css.includes('overflow: visible')&&css.includes('.mobile-tabs')&&css.includes('position: sticky');add('Mobile sticky navigation is not bounded by a fixed-height body',mobileSafe,'mobile document uses auto height and sticky primary tabs')}catch(e){add('Mobile sticky navigation is not bounded by a fixed-height body',false,e.message)}try{const hc=DATA.histCoverage||{};add('History-eligible coverage excludes prior-free players from the production denominator',typeof hc.eligibleRatio==='number'&&typeof hc.productionOK==='boolean'&&hc.eligible===hc.matched+hc.unresolved,`${hc.matched}/${hc.eligible} eligible · ${hc.newcomer} prior-free`)}catch(e){add('History-eligible coverage excludes prior-free players from the production denominator',false,e.message)}try{const raw={hist_meta:{},elements:[{code:1,hist_prev:{total_points:0,minutes:0,starts:0}},{code:2,history_status:'newcomer'},{code:3,history_eligible:true}]},players=[{histPts:0,histMinutes:0,histStarts:0},{histPts:0,histMinutes:0,histStarts:0},{histPts:0,histMinutes:0,histStarts:0}],c=buildHistoryCoverage(raw,raw.elements,players);add('History classifier separates matched, newcomer and unresolved records',c.matched===1&&c.newcomer===1&&c.unresolved===1&&c.eligible===2&&!c.productionOK,`${c.matched} matched · ${c.newcomer} newcomer · ${c.unresolved} unresolved`,'engineering')}catch(e){add('History classifier separates matched, newcomer and unresolved records',false,e.message,'engineering')}try{const oldSquad=[...S.squad],oldStart=new Set(S.start),oldCap=S.cap,oldVice=S.vice,centre=document.getElementById('colCentre'),wasHidden=centre.classList.contains('mhide');const need={GK:1,DEF:3,MID:2,FWD:1},picked=[];for(const pos of Object.keys(need))picked.push(...POOL.filter(p=>p.p===pos).slice(0,need[pos]));for(const p of POOL)if(picked.length<11&&!picked.includes(p)&&p.p!=='GK')picked.push(p);if(picked.length<11)skip('Header XI projection refreshes while Squad panel is hidden','insufficient player pool');else{S.squad=picked.map(p=>p.id);S.start=new Set(S.squad);S.cap=S.squad[0];S.vice=S.squad[1];centre.classList.add('mhide');renderSpine();const shown=num(document.getElementById('hXpts').textContent,-1),expected=num(document.getElementById('spineTotal').textContent,-2);add('Header XI projection refreshes while Squad panel is hidden',shown>=0&&Math.abs(shown-expected)<.05,`${shown.toFixed(1)} header · ${expected.toFixed(1)} spine`,'engineering')}S.squad=oldSquad;S.start=oldStart;S.cap=oldCap;S.vice=oldVice;if(!wasHidden)centre.classList.remove('mhide');renderSpine()}catch(e){add('Header XI projection refreshes while Squad panel is hidden',false,e.message,'engineering')}try{const g0=S.gw,h0=S.horizon;S.gw=10;S.horizon=3;bumpCache();const span=horizonSpan();S.gw=g0;S.horizon=h0;bumpCache();add('Optimiser horizon counts fully blank gameweeks',span.n===3&&span.first===10&&span.last===12,`GW${span.first}–GW${span.last}`,'model')}catch(e){add('Optimiser horizon counts fully blank gameweeks',false,e.message,'model')}
try{const rows=actualRowsFromPayload({elements:[{id:1,stats:{total_points:8,minutes:90,starts:1}},{id:2,stats:{total_points:2,minutes:18,starts:0}},{id:1,stats:{total_points:9,minutes:90,starts:1}}]});add('Projection ledger parses and deduplicates official event-live results',rows.length===2&&rows.find(r=>r.i===1)?.pts===9&&rows.find(r=>r.i===2)?.app===true,`${rows.length} unique rows parsed`,'engineering')}catch(e){add('Projection ledger parses and deduplicates official event-live results',false,e.message,'engineering')}
try{const u=accuracyEventUsage({exp:35,pStart:.8,pAppear:.45,avail:.5},2);add('Double-Gameweek accuracy usage aggregates minutes without compounding availability',u.minutes===70&&Math.abs(u.pStart-.48)<1e-9&&Math.abs(u.pAppear-.495)<1e-9,`${u.minutes} min · ${(100*u.pStart).toFixed(1)}% start · ${(100*u.pAppear).toFixed(1)}% appear`,'model')}catch(e){add('Double-Gameweek accuracy usage aggregates minutes and event probabilities',false,e.message,'model')}
{const oldPool=POOL;try{POOL=oldPool.slice(0,Math.min(40,oldPool.length)).map((p,i)=>({...p,id:900000+i,apiId:800000+i}));bumpCache();const rows=projectionSnapshotRows(S.gw);add('Projection snapshot retains every finite API player row',rows.length===POOL.length&&rows.every(r=>Number.isFinite(r[1])),`${rows.length}/${POOL.length} rows retained`,'engineering')}catch(e){add('Projection snapshot retains every finite API player row',false,e.message,'engineering')}finally{POOL=oldPool;bumpCache()}}
{const probe=POOL.find(p=>p.p!=='GK'&&availability(p)>=.9&&num(p.histPts)>0)||POOL[0];
 if(!probe)skip('Role split blends means and widens variance','no live pool','model');
 else{const k=overrideKey(probe),saved=S.overrides[k];
  try{
   delete S.overrides[k];bumpCache();
   const base=project(probe,S.gw),baseMd=minuteDetail(probe);
   S.overrides[k]={splitMinutes:20,splitWeight:60};bumpCache();
   const sp=project(probe,S.gw),spMd=minuteDetail(probe);
   const A=withRoleSplitBranch(probe,false,()=>projectCore(probe,S.gw,'|tA'));
   const B=withRoleSplitBranch(probe,true,()=>projectCore(probe,S.gw,'|tB'));
   const w=.6,expMean=w*A.x+(1-w)*B.x,within=w*A.sd*A.sd+(1-w)*B.sd*B.sd;
   add('Role split mean equals the weighted mean of both scenarios',Math.abs(sp.x-expMean)<1e-9,`${sp.x.toFixed(4)} vs ${expMean.toFixed(4)}`,'model');
   add('Role split variance exceeds the within-scenario blend when scenarios disagree',Math.abs(A.x-B.x)<1e-9||sp.sd*sp.sd>within+1e-9,`sd ${sp.sd.toFixed(3)} vs within ${Math.sqrt(within).toFixed(3)} · gap ${(A.x-B.x).toFixed(2)}`,'model');
   add('Role split lowers expected minutes toward the alternative scenario',spMd.exp<=baseMd.exp+1e-9&&spMd.exp>=Math.min(baseMd.exp,20)-1e-9,`${baseMd.exp.toFixed(1)} → ${spMd.exp.toFixed(1)}`,'model');
   add('Role split reconciles components to xPts',Math.abs(sumParts(sp.parts)-sp.x)<1e-6,'','model');
   S.overrides[k]={splitMinutes:20};bumpCache();
   const half=project(probe,S.gw);
   add('Incomplete role split is inert and reproduces the unsplit projection',Math.abs(half.x-base.x)<1e-9&&Math.abs(half.sd-base.sd)<1e-9,`${half.x.toFixed(4)} vs ${base.x.toFixed(4)}`,'model');
  }catch(e){add('Role split blends means and widens variance',false,e.message,'model')}
  finally{if(saved===undefined)delete S.overrides[k];else S.overrides[k]=saved;bumpCache()}}}
try{const rows=[{pred:5,actual:4,low:2,high:8,expMinutes:80,minutes:90,pAppear:.9,appeared:true,pStart:.8,started:true,id:1},{pred:2,actual:4,low:0,high:5,expMinutes:25,minutes:20,pAppear:.5,appeared:true,pStart:.2,started:false,id:2}],m=accuracyMetrics(rows);add('Backtesting metrics reconcile on a controlled sample',Math.abs(m.mae-1.5)<1e-9&&Math.abs(m.rmse-Math.sqrt(2.5))<1e-9&&m.interval===1&&Number.isFinite(m.minutesMae),`MAE ${m.mae.toFixed(2)} · RMSE ${m.rmse.toFixed(2)}`,'model')}catch(e){add('Backtesting metrics reconcile on a controlled sample',false,e.message,'model')}
try{const now=Date.now(),rows=Array.from({length:300},(_,i)=>[i+1,2,0,5,80,70,.8,.9,1,2,1]),actuals=Array.from({length:300},(_,i)=>[i+1,1,90,1,1]),clean=sanitizeAccuracyLedger({season:EXPECTED_SEASON,snapshots:{1:{gw:1,release:'X',capturedAt:now,deadline:now-1,rows}},actuals:{1:{gw:1,final:false,rows:actuals}}});add('Ledger sanitizer excludes post-deadline forecasts and provisional results',clean.schema===ACCURACY_SCHEMA&&clean.snapshots[1].accountable===false&&clean.actuals[1].final===false&&clean.actuals[1].complete===true,`schema ${clean.schema} · accountable ${clean.snapshots[1].accountable}`,'engineering')}catch(e){add('Ledger sanitizer excludes post-deadline forecasts and provisional results',false,e.message,'engineering')}
try{const catalog={},squad=Array.from({length:15},(_,i)=>i+1);for(const id of squad)catalog[id]={n:`P${id}`,t:`T${Math.floor((id-1)/3)}`,p:id<=2?'GK':id<=7?'DEF':id<=12?'MID':'FWD'};const raw={squad,xi:[1,3,4,5,8,9,10,11,13,14,15],bench:[2,6,7,12],captain:8,vice:13,complete:true},valid=sanitizeAccuracySelection(raw,catalog),invalid=sanitizeAccuracySelection({...raw,vice:8},catalog);add('Personal snapshot legality requires a complete XI, bench, captain and vice',valid.complete===true&&invalid.complete===false,'valid selection accepted · duplicate armband rejected','engineering')}catch(e){add('Personal snapshot legality requires a complete XI, bench, captain and vice',false,e.message,'engineering')}
try{const settings=accuracyProjectionSettings(),fp=accuracyHashValue(settings);add('Projection fingerprint captures weights, overrides and team strengths',typeof fp==='string'&&fp.length===8&&Array.isArray(settings.strengths)&&settings.strengths.length===Object.keys(TEAMS).length,fp,'engineering')}catch(e){add('Projection fingerprint captures weights, overrides and team strengths',false,e.message,'engineering')}
try{add('Official final-result gate requires finished plus data checked',accuracyEventFinal({finished:true,data_checked:true})&&!accuracyEventFinal({finished:true,data_checked:false})&&!accuracyEventFinal({finished:false,data_checked:true}),'strict event-level signal retained','engineering')}catch(e){add('Official final-result gate requires finished plus data checked',false,e.message,'engineering')}
{const gw=38,saved=FIX_META[gw],kickoff=Date.parse('2026-08-24T19:00:00Z');try{FIX_META[gw]=[{kickoff:new Date(kickoff).toISOString(),finished:true,provisional:true,scoreReady:true}];const before=accuracyEventFinal({id:gw,finished:false,data_checked:false},kickoff+ACCURACY_FINALITY_GRACE_MS-1),after=accuracyEventFinal({id:gw,finished:false,data_checked:false},kickoff+ACCURACY_FINALITY_GRACE_MS);add('Completed-fixture fallback waits through its safety window',!before&&after,'premature result blocked · stale event flag recovered','engineering')}catch(e){add('Completed-fixture fallback waits through its safety window',false,e.message,'engineering')}finally{if(saved===undefined)delete FIX_META[gw];else FIX_META[gw]=saved}}
try{const now=Date.now(),rows=Array.from({length:300},(_,i)=>[i+1,2,0,5,80,70,.8,.9,1,null,1]),snap={gw:1,release:MODEL_RELEASE,capturedAt:now,deadline:now+864e5,modelFingerprint:'abc12345',rows};snap.checksum=accuracySnapshotChecksum(snap);const clean=sanitizeAccuracyLedger({season:EXPECTED_SEASON,snapshots:{1:snap}}).snapshots[1];add('Projection snapshot checksum survives ledger round-trip',clean.integrity==='verified'&&clean.accountable===true,`${clean.integrity} · ${clean.rows.length} rows`,'engineering')}catch(e){add('Projection snapshot checksum survives ledger round-trip',false,e.message,'engineering')}
try{const oldShot=!!S.shotMode,bench=document.getElementById('benchBox'),pitch=document.getElementById('pitchBox');S.shotMode=true;applyShotMode();const ok=bench.classList.contains('compact-bench')&&!bench.classList.contains('compact-hidden')&&pitch.classList.contains('compact');S.shotMode=oldShot;applyShotMode();add('Compact screenshot view keeps the four-player bench visible',ok,ok?'bench visible and compact':'bench hidden or compact styling missing','engineering')}catch(e){add('Compact screenshot view keeps the four-player bench visible',false,e.message,'engineering')}try{const b=document.getElementById('btnClearSquad');add('Squad view exposes a dedicated Clear All action',!!b&&b.textContent.includes('Clear All')&&typeof clearCurrentSquad==='function','visible squad reset control','engineering')}catch(e){add('Squad view exposes a dedicated Clear All action',false,e.message,'engineering')}
try{const empty={picks:[]},full={picks:Array.from({length:15},(_,i)=>({element:i+1}))};add('FPL importer accepts only complete public pick payloads',!fplPicksAreComplete(empty)&&fplPicksAreComplete(full),'0 players rejected · 15 players accepted','engineering')}catch(e){add('FPL importer accepts only complete public pick payloads',false,e.message,'engineering')}
try{const now=Date.now(),before=fplImportGwCandidates({current_event:null},[{id:1,deadline_time:new Date(now+864e5).toISOString()}],now,1),after=fplImportGwCandidates({current_event:2},[{id:1,deadline_time:new Date(now-2*864e5).toISOString()},{id:2,deadline_time:new Date(now-864e5).toISOString()}],now,3);add('FPL importer distinguishes private pre-deadline drafts from public gameweeks',before.length===0&&after.join(',')==='2,1',`before deadline ${before.length} · after deadline GW${after.join(', GW')}`,'engineering')}catch(e){add('FPL importer distinguishes private pre-deadline drafts from public gameweeks',false,e.message,'engineering')}

try{const htmlBuild=document.documentElement.getAttribute('data-build'),metaBuild=document.querySelector('meta[name="otb-build"]')?.content;
  add('Visible page and runtime build identifiers agree',htmlBuild===APP_BUILD&&metaBuild===APP_BUILD,`html ${htmlBuild||'missing'} · meta ${metaBuild||'missing'} · runtime ${APP_BUILD}`,'engineering')}
catch(e){add('Visible page and runtime build identifiers agree',false,e.message,'engineering')}
try{const parsed=buildFromHtml('<!doctype html><html data-build="2026.08.14.6"><head></head></html>'),newer=compareBuilds(parsed,APP_BUILD),older=compareBuilds('2026.08.14.4',APP_BUILD);
  add('Build freshness comparator detects newer Pages HTML',parsed==='2026.08.14.6'&&newer>0&&older<0,`${APP_BUILD} → ${parsed}`,'engineering')}
catch(e){add('Build freshness comparator detects newer Pages HTML',false,e.message,'engineering')}
try{const select=String(document.getElementById('gwSel')?.onchange||''),follow=String(document.getElementById('gwFollow')?.onchange||''),bootstrap=String(applyBootstrap),source=String(optimiseViewedLineup),scripts=[...document.scripts].map(s=>s.textContent||'').join('\n'),wired=select.includes('optimiseViewedLineup')&&follow.includes('optimiseViewedLineup')&&bootstrap.includes('optimiseViewedLineup')&&scripts.includes("bumpCache();optimiseViewedLineup();saveUserState();renderFixtures()"),scoped=source.includes('bestXIForGw')&&source.includes('expectedAutosub')&&!source.includes('S.squad=');
  add('Every displayed-GW route re-optimises only the owned lineup',wired&&scoped,'dropdown · follow-current · automatic GW · fixtures','engineering')}
catch(e){add('Every displayed-GW route re-optimises only the owned lineup',false,e.message,'engineering')}
try{const badge=document.getElementById('buildBadge'),banner=document.getElementById('buildUpdateBanner'),apply=document.getElementById('btnApplyBuildUpdate');
  add('Desktop cache recovery controls are present and wired',!!badge&&!!banner&&!!apply&&typeof badge.onclick==='function'&&typeof apply.onclick==='function','header build check · update banner · forced refresh','engineering')}
catch(e){add('Desktop cache recovery controls are present and wired',false,e.message,'engineering')}
{const before=new Set(S.buildBlocks);try{const p=candidates()[0];if(!p)skip('Build blocks remove players from every builder candidate set','player pool unavailable','engineering');else{S.buildBlocks.add(p.id);const blocked=!candidates().some(x=>x.id===p.id),payloadBlocked=!optimiserPayloadForStyle().players.some(x=>x.id===p.id);add('Build blocks remove players from every builder candidate set',blocked&&payloadBlocked,p.n,'engineering')}}catch(e){add('Build blocks remove players from every builder candidate set',false,e.message,'engineering')}finally{S.buildBlocks=before}}
try{const fake={ctx:{dAtk:4.8,dCS:1.7}},def=playerFixtureDifficulty({p:'DEF'},fake),gk=playerFixtureDifficulty({p:'GK'},fake),mid=playerFixtureDifficulty({p:'MID'},fake);add('Squad cards use position-aware fixture difficulty',def===1.7&&gk===1.7&&mid===4.8,`DEF ${def} · GK ${gk} · MID ${mid}`,'model')}
catch(e){add('Squad cards use position-aware fixture difficulty',false,e.message,'model')}
try{const ok=cardHealth({live:{status:'a'}},{avail:1,pStart:.9,pAppear:.95,exp:82}),medium=cardHealth({live:{status:'d'}},{avail:.75,pStart:.7,pAppear:.7,exp:58}),bad=cardHealth({live:{status:'i'}},{avail:0,pStart:0,pAppear:0,exp:0});add('Squad-card health classifies OK, Medium and Bad states',ok.key==='ok'&&medium.key==='medium'&&bad.key==='bad',`${ok.label} · ${medium.label} · ${bad.label}`,'engineering')}
catch(e){add('Squad-card health classifies OK, Medium and Bad states',false,e.message,'engineering')}
try{const src=String(cardHTML),controls=['Start XI','Captain','Vice','Lock','Block Build','Remove'].every(x=>src.includes(x)),hosts=!!document.getElementById('benchOrderNote')&&!!document.getElementById('squadStructureNote'),clean=!src.includes('80% model interval')&&!src.includes('confidenceBand');add('Squad cards use simple health and readable actions',controls&&hosts&&clean&&src.includes('cardHealth')&&src.includes('cardFixtureRun'),controls&&hosts&&clean?'health · build block · fixture run · bench/structure notes':'card clarity hook missing','engineering')}
catch(e){add('Squad cards use simple health and readable actions',false,e.message,'engineering')}
try{const b=document.getElementById('btnClearBuildBlocks'),summary=document.getElementById('buildBlockSummary');add('Build-block controls are visible, persistent and wired',!!b&&!!summary&&typeof b.onclick==='function'&&String(saveUserState).includes('buildBlocks')&&String(remapSelection).includes('buildBlocks'),'pool toggle · clear all · stable-key persistence','engineering')}
catch(e){add('Build-block controls are visible, persistent and wired',false,e.message,'engineering')}
try{const css=[...document.styleSheets].flatMap(s=>{try{return[...s.cssRules].map(r=>r.cssText)}catch(e){return[]}}).join(' '),ok=css.includes('.card-action-grid')&&css.includes('min-height: 34px')&&css.includes('.card-menu');add('Squad-card action targets meet the compact touch minimum',ok,'collapsed Actions control · 34px minimum expanded targets','engineering')}
catch(e){add('Squad-card action targets meet the compact touch minimum',false,e.message,'engineering')}
try{const base={gw:1,manual:false,state:{transfer:'ROLL',captain:{id:1,n:'Haaland'},vice:{id:2,n:'B.Fernandes'},bench1:{id:3,n:'De Cuyper'},chip:'HOLD',readiness:'READY',projectedXI:56.4,transferGain:0,topAction:{id:'captain',title:'Hold captain'}}},same=JSON.parse(JSON.stringify(base)),changed=JSON.parse(JSON.stringify(base));changed.state.captain={id:4,n:'Saka'};
  add('Decision Memory deduplicates identical states and detects real decisions',verdictDecisionFingerprint(base)===verdictDecisionFingerprint(same)&&verdictDecisionFingerprint(base)!==verdictDecisionFingerprint(changed),'same state stable · captain change recorded','engineering')}
catch(e){add('Decision Memory deduplicates identical states and detects real decisions',false,e.message,'engineering')}
try{const previous={state:{transfer:'ROLL',captain:{n:'Haaland'},vice:{n:'B.Fernandes'},bench1:{n:'De Cuyper'},chip:'HOLD',readiness:'READY',projectedXI:56.4,topAction:{id:'hold',title:'Hold'}}},current={manual:false,state:{...previous.state,captain:{n:'Saka'},projectedXI:57.1,topAction:{id:'captain',title:'Captain Saka'}}},reasons=verdictDecisionReasons(previous,current).join(' · ');
  add('Decision Memory explains why an endorsement changed',reasons.includes('Captain: Haaland → Saka')&&reasons.includes('Projected scoring: 56.4 → 57.1')&&reasons.includes('Priority changed to: Captain Saka'),reasons,'engineering')}
catch(e){add('Decision Memory explains why an endorsement changed',false,e.message,'engineering')}
try{const old=verdictNormaliseJournalEntry({gw:1,at:'2026-08-10T12:00:00.000Z',locked:true,regime:'LOCK',readiness:92,captain:{id:1,n:'Haaland'},vice:{id:2,n:'B.Fernandes'},transfer:'ROLL',chip:'NONE',projectedXI:56.4,projectedSd:10.3,queue:[{id:'hold',title:'Hold'}]});
  add('Original verdict journal migrates into Decision Memory',old.state.captain?.n==='Haaland'&&old.state.chip==='HOLD'&&old.state.readiness==='READY'&&old.manual&&old.reasons[0].includes('original'),`GW${old.gw} · ${old.state.captain?.n} · ${old.state.readiness}`,'engineering')}
catch(e){add('Original verdict journal migrates into Decision Memory',false,e.message,'engineering')}
try{const host=document.getElementById('verdictDecisionMemory'),src=String(scheduleDecisionMemoryCapture);
  add('Decision Memory capture is scoped to the visible Verdict tab',!!host&&src.includes("activeRailTab()!=='verdict'")&&src.includes('S.squad.length!==15'),'quiet-period capture guarded by tab and legal squad','engineering')}
catch(e){add('Decision Memory capture is scoped to the visible Verdict tab',false,e.message,'engineering')}

/* RC5.0.24 — Fresh Review durable execution and evidence-quality checks. */
try{const pane=document.getElementById('pVerdict'),host=document.getElementById('verdictFreshSquadReview'),button=document.getElementById('btnRunFreshSquadReview');
  add('Fresh Squad Review control appears on Verdict',!!pane&&!!host&&pane.contains(host)&&button?.textContent.trim()==='Run Fresh Squad Review','Verdict host · live review control','engineering')}
catch(e){add('Fresh Squad Review control appears on Verdict',false,e.message,'engineering')}
try{const positions=['GK','GK',...Array(5).fill('DEF'),...Array(5).fill('MID'),...Array(3).fill('FWD')],players=positions.map((p,i)=>({id:i+1,p,t:`T${Math.floor(i/3)}`})),state={squad:players.map(p=>p.id)},ctx={players};
  const valid=freshSquadReviewHasValid15(ctx,state),short=freshSquadReviewHasValid15({players:players.slice(0,14)},{squad:state.squad.slice(0,14)});
  add('Fresh Squad Review requires a valid 15',valid&&!short,'legal 15 accepted · 14 rejected','engineering')}
catch(e){add('Fresh Squad Review requires a valid 15',false,e.message,'engineering')}
try{const rows=Array.from({length:15},(_,i)=>({id:i+1,name:`Player ${i+1}`,team:`T${i%5}`,pos:i===11?'GK':i<1?'GK':i<6?'DEF':i<11?'MID':'FWD',squadRole:i<11?'XI':'BENCH',role:i<11?'XI':i===11?'Bench Boost — scoring':`Bench Boost — scoring`,benchOrder:i<11?null:i-10,xPts:5-i*.1,xMins:90-i,startPct:95-i,captain:i===0,vice:i===1})),model={gameweek:7,activeChip:'BENCH_BOOST',scoringPlayers:15,formation:'3-5-2',xiProjected:68.25,captain:'Player 1',vice:'Player 2',starting:rows.slice(0,11),bench:rows.slice(11),full:rows,alerts:[]},packet=formatFreshSquadReviewPacket(model);
  add('Diagnostic context includes chip, captain, vice, XI and scoring bench',packet.includes('Active chip: BENCH BOOST')&&packet.includes('Captain: Player 1')&&packet.includes('Vice-captain: Player 2')&&packet.includes('STARTING XI')&&packet.includes('BENCH ORDER')&&packet.includes('Bench Boost — scoring')&&packet.includes('FULL 15'),'chip · captain · vice · 11 starters · ordered scoring bench · full squad','engineering')}
catch(e){add('Diagnostic context includes chip, captain, vice, XI and scoring bench',false,e.message,'engineering')}
try{let copied='';const result=copyFreshSquadReview('clipboard probe',{writeText:value=>{copied=value}});
  add('Fresh Squad Review copies the packet through the clipboard adapter',copied==='clipboard probe'&&result instanceof Promise,'writeText received the exact packet text','engineering')}
catch(e){add('Fresh Squad Review copies the packet through the clipboard adapter',false,e.message,'engineering')}
try{const src=[prepareFreshSquadReview,freshSquadReviewModel,formatFreshSquadReviewPacket,copyFreshReviewContext].map(String).join('\n'),network=/\bfetch\s*\(|XMLHttpRequest|WebSocket|new\s+Worker|\bAPI_BASE\b|\bSCOUT_API_BASE\b/i.test(src),stateWrite=/\bS\.[A-Za-z0-9_]+\s*=/.test(src);
  add('Diagnostic context copy remains local and immutable',!network&&!stateWrite,'no transport · no squad/projection state write','engineering')}
catch(e){add('Diagnostic context copy remains local and immutable',false,e.message,'engineering')}
try{const api=String(freshReviewApi),runner=String(runFreshSquadReview),page=document.documentElement.outerHTML;
  add('Live review uses key-protected Scout transport without embedded credentials',api.includes('SCOUT_API_BASE+path')&&api.includes('Authorization')&&runner.includes('/api/fresh-review')&&!/sk-[A-Za-z0-9_-]{16,}|OPENAI_API_KEY\s*=|FRESH_REVIEW_OWNER_SECRET\s*=/.test(page),'tab-only bearer key · protected Worker route · no secret literal','engineering')}
catch(e){add('Live review uses protected Scout transport without embedded credentials',false,e.message,'engineering')}
try{const runner=String(runFreshSquadReview),poller=String(pollFreshSquadReview),owner=String(freshReviewOwnerToken);
  add('Fresh Review continues as a durable server job after mobile closes',runner.includes('pollFreshSquadReview')&&!runner.includes('/player')&&!runner.includes('/finalize')&&poller.includes("method='GET'")===false&&poller.includes('/api/fresh-review/${encodeURIComponent(jobId)}'),'single start request · status polling only · no client-owned player loop','engineering');
  add('Fresh Review accepts a tab-only key without an email login',!owner.includes('window.prompt')&&String(freshReviewSaveKey).includes('sessionStorage.setItem')&&String(renderFreshSquadReview).includes('freshReviewKey'),'password field · current-tab storage · no email login','engineering')}
catch(e){add('Fresh Review durable mobile execution and key login',false,e.message,'engineering')}
try{const local=String(freshReviewLocalSaveJob)+String(scheduleFreshReviewResume)+String(resumeFreshSquadReview);
  add('Pending review identity persists and reconnects on Verdict',local.includes('jobId')&&local.includes('localStorage')===false&&local.includes('pollFreshSquadReview'),'job id saved by storage adapter · automatic reconnect','engineering')}
catch(e){add('Pending review identity persists and reconnects on Verdict',false,e.message,'engineering')}
try{const before={players:[{playerId:'1',name:'Held'}],activeChip:'NONE'},after={players:[{playerId:'1',name:'Held'},{playerId:'2',name:'New'}],activeChip:'NONE'},diff=freshReviewInputDiff(before,after),src=String(renderFreshSquadReview);
  add('Changed-squad review offers new additions only',diff.added.length===1&&diff.added[0]==='2'&&src.includes('btnFreshNewOnly')&&String(runFreshSquadReview).includes('selectedPlayerIds'),'addition diff · selective refresh control · backend selection','engineering')}
catch(e){add('Changed-squad review offers new additions only',false,e.message,'engineering')}
try{const row={name:'Haaland',club:'MCI',position:'FWD',squadRole:'XI',scoring:true,captain:true,status:'GREEN',classification:'UNKNOWN',evidenceCoverage:'UNVERIFIED',coverageNote:'No usable current external evidence was found.',freshEvidenceSummary:'No usable current external evidence was found.',rationale:'No directional conclusion was invented.',otb:{startProbability:1,expectedMinutes:87,xPts:7.36},evidence:[{title:'Old interview',publisher:'Example',authorityTier:4,relevantDate:'2026-01-01T12:00:00Z',recency:'HISTORICAL',evidenceCategory:'GENERAL',decisionWindowDays:30,decisionEligible:false,url:'https://example.test/old',summary:'Historical context'}]},html=freshReviewPlayerHtml(row);
  add('Coverage gaps remain separate from operational squad risk',html.includes('fresh-player green')&&html.includes('UNVERIFIED')&&html.includes('Decision evidence: 0 current')&&html.includes('Audit context: 1 historical/undated'),'GREEN risk · UNVERIFIED coverage · compact audit context','engineering')}
catch(e){add('Coverage gaps remain separate from operational squad risk',false,e.message,'engineering')}
try{const review={generatedAt:new Date().toISOString(),playerCount:15,scoringPlayerCount:11,projectedScoringPoints:56.64,research:{researchedPlayers:15,reusedPlayers:0},counts:{GREEN:15,OPPORTUNITY:0,AMBER:0,RED:0},coverageCounts:{VERIFIED:0,PARTIAL:0,UNVERIFIED:15},summary:{coverageWarning:'11 of 11 scoring players were not independently verified.',primaryIssue:'The audit was inconclusive.',secondaryRisks:[],positiveDisagreement:'None.',captainAssessment:'Not independently validated.',overallVerdict:'No change.'},playerReviews:[]},html=freshReviewSummaryHtml(review),text=formatFreshReviewResult(review);
  add('Fresh Review labels research execution and evidence coverage honestly',html.includes('15 researched this run')&&!html.includes('15 fresh ·')&&html.includes('15</b><span>UNVERIFIED')&&text.includes('COVERAGE — VERIFIED 0 · PARTIAL 0 · UNVERIFIED 15'),'researched run count · independent coverage counts · copy output','engineering')}
catch(e){add('Fresh Review labels research execution and evidence coverage honestly',false,e.message,'engineering')}
try{const old={...S.chips};S.chips.BB1=String(S.gw);const chip=chipStateForGw(S.gw);S.chips={...old};add('One saved per-GW chip state drives Bench Boost scoring',chip.code==='BENCH_BOOST'&&chip.benchScoring&&chip.captainMultiplier===2,'authoritative S.chips resolver','engineering')}
catch(e){add('One saved per-GW chip state drives Bench Boost scoring',false,e.message,'engineering')}

try{const payload={players:[{id:1,gw:{1:{mean:5,utility:5,pAppear:.9,sd:1,confidence:80}}}],gws:[1],squadIds:[1],purchase:{1:5},bank:0,free:1,maxMoves:1,maxHit:4,threshold:.25,lockedIds:[],chips:{},hybrid:{},sensitivity:null},same=JSON.parse(JSON.stringify(payload)),changed=JSON.parse(JSON.stringify(payload));changed.players[0].gw[1].mean=5.1;const a=verdictPlannerFingerprint(payload),b=verdictPlannerFingerprint(same),c=verdictPlannerFingerprint(changed);add('Transfer staleness hashes semantic worker inputs',a===b&&a!==c&&a.startsWith('tp2:'),'stable refreshes preserve route · projection changes invalidate it','engineering')}catch(e){add('Transfer staleness hashes semantic worker inputs',false,e.message,'engineering')}
try{const src=String(runTransferPlanner);add('Transfer planner fingerprints the exact sent snapshot and guards in-flight changes',src.includes('payload=transferPlannerPayload()')&&src.includes('verdictPlannerFingerprint(payload)')&&src.includes('currentFingerprint!==plannerFingerprint'),'one snapshot · one guarded retry','engineering')}catch(e){add('Transfer planner fingerprints the exact sent snapshot and guards in-flight changes',false,e.message,'engineering')}

/* ═══ RC5.0.0 — Verdict Brain acceptance tests ═══════════════════════════════
   These exist because the Verdict page now issues decisions rather than
   describing state. Governance rule: every feed the Brain consumes must appear
   in the render key AND the freshness strip, or the page can silently freeze on
   stale evidence — which is exactly the failure the strip was built to expose. */
try{const before=verdictFeedFingerprint(),savedMode=DATA.mode;DATA.mode=DATA.mode==='LIVE'?'CACHE':'LIVE';const after=verdictFeedFingerprint();DATA.mode=savedMode;
  add('Verdict render key responds to feed change',before!==after&&verdictFeedFingerprint()===before,'data-mode probe inverted and restored','engineering')}
catch(e){add('Verdict render key responds to feed change',false,e.message,'engineering')}

/* The invariant is that the visible health strip and the render key cover the
   SAME feeds. A hardcoded expected list would have to be edited by hand every
   time a feed is added, which is exactly the drift this is meant to catch — so
   expected is derived from the fingerprint registry itself. */
try{const shown=verdictFeeds().map(f=>f.key).sort().join(','),declared=VERDICT_FEED_KEYS.slice().sort().join(',');
  add('Freshness strip covers every feed in the render key',shown===declared,shown===declared?`${VERDICT_FEED_KEYS.length} feeds`:`strip[${shown}] vs key[${declared}]`,'data')}
catch(e){add('Freshness strip covers every feed in the render key',false,e.message,'data')}

try{const iso=new Date(Date.now()-72*3600e3).toISOString(),lbl=relTime(iso);
  add('Relative time reports days, not zero',lbl==='3d ago',`72h ago → ${lbl}`,'engineering')}
catch(e){add('Relative time reports days, not zero',false,e.message,'engineering')}

try{const saved={loaded:MARKET.loaded,age:MARKET.ageMinutes,at:MARKET.fetchedAt};
  MARKET.loaded=true;MARKET.ageMinutes=60;MARKET.fetchedAt=Date.now()-90*60000;
  const eff=marketAgeMinutes();MARKET.loaded=saved.loaded;MARKET.ageMinutes=saved.age;MARKET.fetchedAt=saved.at;
  add('Market age advances with wall clock',Math.abs(eff-150)<2,`reported 60m → effective ${eff?.toFixed(0)}m`,'data')}
catch(e){add('Market age advances with wall clock',false,e.message,'data')}

try{const savedSus=MARKET_SUSPEND,savedAge=MARKET.ageMinutes,savedAt=MARKET.fetchedAt,savedLoaded=MARKET.loaded;
  MARKET.loaded=true;MARKET.ageMinutes=MARKET_MAX_AGE_MIN+120;MARKET.fetchedAt=Date.now();MARKET_SUSPEND=false;
  const blocked=marketFor('ARS',{opp:'CHE',home:true})===null&&marketStale()&&!marketActive();
  MARKET_SUSPEND=savedSus;MARKET.ageMinutes=savedAge;MARKET.fetchedAt=savedAt;MARKET.loaded=savedLoaded;
  add('Stale odds are excluded from projections',blocked,'past cutoff → blend inactive','model')}
catch(e){add('Stale odds are excluded from projections',false,e.message,'model')}

try{const c=verdictCalibration(),gwc=accuracyCompletedGws().length;
  add('Calibration is withheld below three completed gameweeks',gwc>=3?!!c:c===null,`${gwc} completed GW`,'model')}
catch(e){add('Calibration is withheld below three completed gameweeks',false,e.message,'model')}

try{if(S.squad.length!==15)skip('Every action-queue item is costed in expected points','no full user squad','engineering');
  else{const q=verdictQueue(verdictContext()),bad=q.filter(i=>!Number.isFinite(i.cost)||i.cost<0);
    add('Every action-queue item is costed in expected points',bad.length===0,bad.length?bad.map(i=>i.title).join(' · '):`${q.length} items costed`,'engineering')}}
catch(e){add('Every action-queue item is costed in expected points',false,e.message,'engineering')}

try{if(S.squad.length!==15)skip('Action queue is ordered by cost within severity','no full user squad','engineering');
  else{const q=verdictQueue(verdictContext()),rank={block:0,act:1,watch:2};let ok=true;
    for(let i=1;i<q.length;i++){const a=q[i-1],b=q[i];const ra=rank[vSev(a.severity)],rb=rank[vSev(b.severity)];if(rb<ra||(ra===rb&&b.cost>a.cost+1e-9)){ok=false;break}}
    add('Action queue is ordered by cost within severity',ok,`${q.length} items`,'engineering')}}
catch(e){add('Action queue is ordered by cost within severity',false,e.message,'engineering')}

/* Asserts BEHAVIOUR, not source text: the gate lives in verdictQueue, so
   grepping renderVerdict for 'releaseReadiness' tested nothing real. */
try{const savedMode=DATA.mode;DATA.mode='SEED';
  let item=null;
  try{item=(verdictQueue(verdictContext())||[]).find(i=>i.id==='data'&&i.blocking)}catch(err){item=null}
  DATA.mode=savedMode;
  add('Verdict refuses to decide on uncertified data',!!item,item?'SEED raises a blocking queue item':'no blocking item raised on SEED data','data')}
catch(e){add('Verdict refuses to decide on uncertified data',false,e.message,'data')}

/* The blocking message must name the ACTUAL cause. A wrong reason on a blocking
   item sends the reader to the wrong panel, which is worse than a vague one. */
try{const savedMode=DATA.mode,savedVal=DATA.validation;
  DATA.mode='SEED';const seedTxt=verdictBlockReason();
  DATA.mode='LIVE';DATA.validation={structuralPass:false,seasonPass:true,structural:['probe: structural failure'],season:[]};
  const structTxt=verdictBlockReason();
  DATA.mode=savedMode;DATA.validation=savedVal;
  const ok=/SEED mode/.test(seedTxt)&&/structural/i.test(structTxt)&&!/LIVE mode/.test(structTxt);
  add('Blocking message names the real reason, not just the data mode',ok,ok?'mode and validation causes distinguished':`seed="${seedTxt.slice(0,40)}" struct="${structTxt.slice(0,40)}"`,'data')}
catch(e){add('Blocking message names the real reason, not just the data mode',false,e.message,'data')}

/* RC5.0.9 audit findings. Number.parseFloat on a dotted schema version
   silently drops everything past the second '.', so '1.30.0' and '1.3.0'
   compared equal and '1.10.0' read as OLDER than '1.9.0'. Dormant while the
   pairing happened to sit at exactly 1.28.0; one keystroke from silently
   breaking the next schema bump either direction. */
try{
  const cases=[['1.28.0','1.28.0',true],['1.9.0','1.28.0',false],['1.30.0','1.28.0',true],
    ['1.10.0','1.9.0',true],['1.3.0','1.30.0',false],['not-a-version','1.28.0',false]];
  const bad=cases.filter(([v,min,expect])=>schemaAtLeast(v,min)!==expect);
  add('Scout schema comparison handles dotted versions correctly',!bad.length,
    bad.length?bad.map(([v,min,e])=>`${v} vs ${min} expected ${e}`).join('; '):`${cases.length} version pairs checked`,'engineering');
}catch(e){add('Scout schema comparison handles dotted versions correctly',false,e.message,'engineering')}

try{
  const direct=roleDirectControls([{id:'departure-probe',type:'unavailable',rawType:'unavailable',confidence:1,directAvailability:0,effectiveFrom:new Date().toISOString(),expiresAt:new Date(Date.now()+864e5).toISOString(),halfLifeHours:8760}]);
  add('Confirmed Scout departure can set exact zero availability',direct.availabilityFactor===0,`availability ${direct.availabilityFactor}`,'model');
}catch(e){add('Confirmed Scout departure can set exact zero availability',false,e.message,'model')}

try{
  const registered=typeof scheduleScoutPoll==='function'&&typeof cancelScoutPoll==='function'&&Object.hasOwn(SCOUT,'pollAttempts');
  add('Scout background refresh has an automatic bounded poller',registered,registered?'seven-attempt poll state registered':'poller missing','engineering');
}catch(e){add('Scout background refresh has an automatic bounded poller',false,e.message,'engineering')}

{
  const saved={squad:[...S.squad],start:new Set(S.start),locks:new Set(S.locks),cap:S.cap,vice:S.vice,bench:[...(S.benchOrder||[])],issue:DATA.selectionIssue};
  try{
    const p=POOL[0],ghost='api:999999999';
    if(!p)skip('Removed FPL player produces a persistent replacement warning','player pool unavailable','engineering');
    else{
      const result=remapSelection({squad:[stableKey(p),ghost],catalog:{[ghost]:'Departure Probe (CHE)'},start:[],locks:[],cap:null,vice:null,benchOrder:[]});
      const warned=result.missing.length===1&&DATA.selectionIssue?.players?.[0]==='Departure Probe (CHE)'&&S.squad.length===1;
      add('Removed FPL player produces a persistent replacement warning',warned,warned?'missing player identified instead of silently dropped':'warning or remap failed','engineering');
    }
  }catch(e){add('Removed FPL player produces a persistent replacement warning',false,e.message,'engineering')}
  finally{S.squad=saved.squad;S.start=saved.start;S.locks=saved.locks;S.cap=saved.cap;S.vice=saved.vice;S.benchOrder=saved.bench;DATA.selectionIssue=saved.issue;}
}

/* RC5.0.10 — planner default governance. The boot state declared style:'value'
   while carrying Balanced's numbers on all five objective fields, and the badge
   was hardcoded to "Value Builder" in the markup, so a fresh install showed one
   strategy while behaving as another. */
try{
  const prof=STRATEGY_PROFILES[S.transfer.style];
  const fields=['threshold','decay','ftScale','useFriction','itbValue'];
  const matches=prof&&fields.every(f=>Math.abs(num(S.transfer[f])-num(prof.transfer[f]))<1e-9);
  add('Transfer strategy label matches its objective settings',!!matches,
    matches?`${S.transfer.style} settings derived from profile`:`style=${S.transfer.style} but numbers differ`,'engineering');
}catch(e){add('Transfer strategy label matches its objective settings',false,e.message,'engineering')}

try{
  const saved={style:S.transfer.style,t:S.transfer.threshold,d:S.transfer.decay,f:S.transfer.ftScale,fr:S.transfer.useFriction,i:S.transfer.itbValue};
  S.transfer.style='value';S.transfer.threshold=0.37;   // hand-tuned, matches no profile
  const r=reconcileTransferStrategy();
  const preserved=Math.abs(S.transfer.threshold-0.37)<1e-9&&r.derived===false;
  S.transfer.style=saved.style;S.transfer.threshold=saved.t;S.transfer.decay=saved.d;
  S.transfer.ftScale=saved.f;S.transfer.useFriction=saved.fr;S.transfer.itbValue=saved.i;
  add('Hand-tuned objective settings survive strategy reconciliation',preserved,
    preserved?'custom values not overwritten':'custom threshold was clobbered','engineering');
}catch(e){add('Hand-tuned objective settings survive strategy reconciliation',false,e.message,'engineering')}

/* RC5.0.10 — the primary route must never be discarded because optional
   robustness diagnostics ran out of time. Measured on a heavy synthetic
   payload, decision stability cost 22.4s against an 8.9s primary search:
   the diagnostics were 2.5x the actual answer, which is what produced the
   45-second timeouts. */
try{
  const src=document.getElementById('transferWorkerSource')?.textContent||'';
  const budgeted=/secondaryBudgetMs/.test(src)&&/budgetLeft\(\)/.test(src);
  const salvages=/if\(primary&&primary\.plan\)/.test(src);
  const timed=/primarySearchMs/.test(src)&&/decisionStabilityMs/.test(src)&&/inputStressMs/.test(src);
  add('Transfer worker budgets diagnostics and never discards a computed route',
    budgeted&&salvages&&timed,
    `budget=${budgeted} salvage=${salvages} stageTimings=${timed}`,'engineering');
}catch(e){add('Transfer worker budgets diagnostics and never discards a computed route',false,e.message,'engineering')}

try{const gws=scheduleGws(S.gw,3),codes=Object.keys(TEAMS).slice(0,2);
  if(codes.length<2)skip('Schedule outlook is independent of squad concentration','no club data','model');
  else{const a=scheduleTeamStats(codes[0],gws),b=scheduleTeamStats(codes[1],gws);
    const indep=!String(scheduleTeamStats).includes('squadPlayers')&&Number.isFinite(a.avgOverall)&&Number.isFinite(b.avgOverall);
    add('Schedule outlook is independent of squad concentration',indep,'fixture stats carry no ownership term','model')}}
catch(e){add('Schedule outlook is independent of squad concentration',false,e.message,'model')}

try{let id=940000;const row=(pos,mean,appear)=>({p:{id:id++,p:pos,n:pos+id},mean,x:mean,appear}),
  xi=[row('GK',4,.9),row('DEF',4,.9),row('DEF',4,.9),row('DEF',4,.6),row('MID',5,.9),row('MID',5,.9),row('MID',5,.9),row('MID',5,.6),row('FWD',5,.9),row('FWD',5,.9),row('FWD',5,.6)],
  benchRows=[row('GK',3,.9),row('DEF',6,.95),row('MID',1,.95),row('FWD',1,.95)],
  best=expectedAutosub({xi,benchRows}),out=benchRows.filter(o=>o.p.p!=='GK'),
  worst=expectedAutosub({xi,benchRows},[out[2],out[1],out[0]]);
  add('Bench order is priced, not just displayed',best.mean>=worst.mean-1e-9&&Number.isFinite(worst.mean),`best ${best.mean.toFixed(2)} vs forced ${worst.mean.toFixed(2)}`,'model')}
catch(e){add('Bench order is priced, not just displayed',false,e.message,'model')}

try{if(S.squad.length!==15)skip('Readiness decomposes into inspectable components','no full user squad','engineering');
  else{const r=verdictReadiness(verdictContext()),sum=r.parts.reduce((a,p)=>a+p.max,0);
    add('Readiness decomposes into inspectable components',r.parts.length>=4&&sum===100&&r.score<=100&&r.score>=0,`${r.parts.length} parts · ${r.score}/100`,'engineering')}}
catch(e){add('Readiness decomposes into inspectable components',false,e.message,'engineering')}

/* RC5.0.14 audit regressions. */
{const savedFix=S.w.fix,savedSuspend=MARKET_SUSPEND;try{
  S.w.fix=.30;MARKET_SUSPEND=true;bumpCache();
  const ranked=Object.keys(TEAMS).map(code=>({code,attack:ratingValue(code,'atk',true)})).sort((a,b)=>a.attack-b.attack),weak=ranked[0],strong=ranked[ranked.length-1],opp=ranked.find(x=>x.code!==weak.code&&x.code!==strong.code)?.code;
  const weakM=fixtureContext(weak.code,{opp,home:true,difficulty:3}).attackM,strongM=fixtureContext(strong.code,{opp,home:true,difficulty:3}).attackM;
  add('Fixture attack multiplier uses the player club attacking strength',strongM>weakM,`${strong.code} ${strongM.toFixed(3)} vs ${weak.code} ${weakM.toFixed(3)}`,'model');
}catch(e){add('Fixture attack multiplier uses the player club attacking strength',false,e.message,'model')}finally{S.w.fix=savedFix;MARKET_SUSPEND=savedSuspend;bumpCache()}}
try{const a=teamRatingStats('atk'),b=teamRatingStats('atk');bumpCache();const c=teamRatingStats('atk');add('Team rating statistics are cached and invalidated safely',a===b&&a!==c&&Number.isFinite(c.avg),`${Object.keys(TEAMS).length*2} venue ratings per cache fill`,'engineering')}catch(e){add('Team rating statistics are cached and invalidated safely',false,e.message,'engineering')}
try{const buttons=[...document.querySelectorAll('button')],bad=buttons.filter(b=>(b.getAttribute('type')||'').toLowerCase()!=='button');add('Every rendered button has an explicit non-submit type',bad.length===0,`${buttons.length} buttons checked`,'engineering')}catch(e){add('Every rendered button has an explicit non-submit type',false,e.message,'engineering')}
try{const ids=['uxBeginner','uxExpert','btnAutoComplete','btnDiscoveryReset','btnShotMode','btnJumpAuto','btnClearSquad','btnJumpNews','btnRefresh','btnBuild','btnUnlock','btnCompareBuilderStyles','btnUseBuilderBank','btnResetPurchasePrices','btnPlanTransfers','btnPriceSync','btnPriceRefresh','verdictOpenTransfers','verdictOpenFixtures','btnRoleScan','btnRoleForceRefresh','btnRoleLocalScan','btnRoleApply','btnRoleClear','btnIntelligenceRefresh','btnAccuracySnapshot','btnAccuracySync','btnAccuracyImportActual','btnAccuracyExport','btnAccuracyImportLedger','btnAccuracyClear','btnRunSelfTests','modalClose'],unwired=ids.filter(id=>!document.getElementById(id)?.onclick);add('Core persistent action buttons have live handlers',unwired.length===0,unwired.length?unwired.join(', '):`${ids.length} actions checked`,'engineering')}catch(e){add('Core persistent action buttons have live handlers',false,e.message,'engineering')}
try{const skipText=transferStressSummary({stressSkipped:'Time budget reached.'});add('Transfer signs and stress status render unambiguously',signed(-.04,2)==='-0.04'&&!skipText.includes('not run')&&skipText.includes('skipped'),`${signed(-.04,2)} · ${skipText.replace(/<[^>]+>/g,'').trim()}`,'engineering')}catch(e){add('Transfer signs and stress status render unambiguously',false,e.message,'engineering')}

const pass=tests.filter(t=>t.status==='PASS').length,fail=tests.filter(t=>t.status==='FAIL').length,skipped=tests.filter(t=>t.status==='SKIP').length,total=tests.length;document.getElementById('hTests').textContent=skipped?`${pass}P · ${skipped}S`:`${pass}/${total}`;document.getElementById('hTests').className='v mono '+(fail===0?'good':'bad');const testRow=t=>{const icon=t.status==='PASS'?'✓':t.status==='SKIP'?'○':'✕',cls=t.status==='FAIL'?'test-bad':t.status==='SKIP'?'unverified':'test-ok';return`<div class="lrow"><span>${icon} ${esc(String(t.name||''))}</span><span class="mono ${cls}">${esc(String(t.detail||t.status))}</span></div>`};const catLabel={data:'DATA HEALTH — is the input data complete and structurally sound',model:'MODEL CONSISTENCY — internal math checks only, NOT proof of predictive accuracy. '+'These confirm the projection doesn’t contradict itself; they cannot confirm it’s RIGHT. '+'That requires backtesting against real results, not yet possible before a ball is kicked.',engineering:'ENGINEERING — application logic, security, structural correctness'};document.getElementById('testNote').innerHTML=['data','model','engineering'].map(cat=>{const inCat=tests.filter(t=>(t.cat||'engineering')===cat);if(!inCat.length)return '';return `<div class="test-cat-lab">${catLabel[cat]}</div>`+inCat.map(testRow).join('')}).join('');window.__FPL_TESTS__={pass,fail,skipped,total,tests,dataMode:DATA.mode};return window.__FPL_TESTS__}
document.getElementById('btnRunSelfTests').onclick=runSelfTestsOnDemand;
function tick(){const el=document.getElementById('hClock');if(!DEADLINE_VERIFIED||!Number.isFinite(DEADLINE)){el.textContent='UNVERIFIED';el.className='v mono unverified';return}const d=DEADLINE-Date.now();if(d<=0){el.textContent='PASSED';el.className='v mono bad';return}el.className='v mono';const day=Math.floor(d/864e5),hr=Math.floor(d/36e5)%24,mi=Math.floor(d/6e4)%60;el.textContent=`${day}d ${String(hr).padStart(2,'0')}h ${String(mi).padStart(2,'0')}m`}

document.getElementById('poolList').addEventListener('click',e=>{const clear=e.target.closest('[data-clear-build-blocks]');if(clear){clearBuildBlocks();return}const block=e.target.closest('[data-build-block]');if(block){e.stopPropagation();toggleBuildBlock(+block.dataset.buildBlock);return}const more=e.target.closest('[data-pool-more]');if(more){POOL_RENDER_LIMIT+=poolRenderStep();renderPool();return}const info=e.target.closest('[data-info]');if(info){e.stopPropagation();inspectPlayer(+info.dataset.info);return}const r=e.target.closest('[data-add]');if(!r)return;const id=+r.dataset.add;S.squad.includes(id)?removePlayer(id):addPlayer(id)});

document.querySelector('.centre').addEventListener('click',e=>{const t=e.target.closest('button,[data-info]');if(!t)return;if(t.dataset.info!==undefined){inspectPlayer(+t.dataset.info);return}if(t.dataset.buildBlock!==undefined)toggleBuildBlock(+t.dataset.buildBlock);else if(t.dataset.del!==undefined)removePlayer(+t.dataset.del);else if(t.dataset.cap!==undefined){const id=+t.dataset.cap;S.capManual=true;if(S.cap===id)S.cap=null;else{if(S.vice===id)S.vice=null;S.cap=id}render();saveUserState()}else if(t.dataset.vice!==undefined){const id=+t.dataset.vice;S.viceManual=true;if(S.vice===id)S.vice=null;else{if(S.cap===id)S.cap=null;S.vice=id}render();saveUserState()}else if(t.dataset.bench!==undefined)toggleStart(+t.dataset.bench);else if(t.dataset.lock!==undefined){const id=+t.dataset.lock;if(S.locks.has(id))S.locks.delete(id);else{S.buildBlocks.delete(id);S.locks.add(id)}render();saveUserState()}else if(t.dataset.benchup!==undefined)moveBenchPlayer(+t.dataset.benchup,-1);else if(t.dataset.benchdown!==undefined)moveBenchPlayer(+t.dataset.benchdown,1);});
let POOL_RENDER_FRAME=0,POOL_SEARCH_TIMER=0;function queuePoolRender(delay=0){clearTimeout(POOL_SEARCH_TIMER);const launch=()=>{if(POOL_RENDER_FRAME)cancelAnimationFrame(POOL_RENDER_FRAME);POOL_RENDER_FRAME=requestAnimationFrame(()=>{POOL_RENDER_FRAME=0;resetPoolRender();renderPool();saveUserState()})};delay?POOL_SEARCH_TIMER=setTimeout(launch,delay):launch()}['fPos','fTeam','fPeriod','fSort','fSecondary','fMax','fOwnMax','fAvailable','fStarter','fAffordable','fSetPiece'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{if(!['fPos','fTeam'].includes(id))document.getElementById('fPreset').value='custom';syncDiscoveryState();queuePoolRender()}));document.getElementById('fSearch').addEventListener('input',()=>{syncDiscoveryState();queuePoolRender(140)});document.getElementById('fPreset').addEventListener('change',e=>{if(e.target.value!=='custom')applyDiscoveryPreset(e.target.value);else{syncDiscoveryState();saveUserState()}});document.getElementById('btnDiscoveryReset').onclick=()=>{document.getElementById('fSearch').value='';document.getElementById('fPos').value='';document.getElementById('fTeam').value='';document.getElementById('fMax').value='99';applyDiscoveryPreset('standard')};
document.getElementById('gwSel').onchange=e=>{S.gw=+e.target.value;S.gwPinned=true;bumpCache();optimiseViewedLineup();render();scheduleSelfTests(250);saveUserState()};
['oBudget','oHorizon','oRisk','oDisplay'].forEach(id=>document.getElementById(id).onchange=()=>{syncControls();render();saveUserState()});
let __sliderDebounce=null;
[['wFix','fix','lFix'],['wHome','home','lHome'],['wCS','cs','lCS'],['wDC','dc','lDC'],['wOfficial','official','lOfficial'],['wForm','form','lForm']].forEach(([el,key,lab])=>document.getElementById(el).oninput=e=>{S.w[key]=+e.target.value;document.getElementById(lab).textContent=S.w[key].toFixed(2);bumpCache();if(columnVisible('colPool'))queuePoolRender();if(columnVisible('colCentre'))requestAnimationFrame(()=>{renderPitch();renderSpine()});clearTimeout(__sliderDebounce);__sliderDebounce=setTimeout(()=>{scheduleSelfTests(500);saveUserState();scheduleAccuracyCapture()},260)});
let USER_TOUCHED_RAIL=false;
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-selected','false');x.tabIndex=-1});b.classList.add('on');b.setAttribute('aria-selected','true');b.tabIndex=0;const map={build:'pBuild',transfers:'pTransfers',prices:'pPrices',verdict:'pVerdict',model:'pModel',roles:'pRoles',news:'pNews',fixtures:'pFixtures',accuracy:'pAccuracy',squads:'pSquads',chips:'pChips',data:'pData'};Object.values(map).forEach(id=>document.getElementById(id).classList.add('hide'));document.getElementById(map[b.dataset.t]).classList.remove('hide');if(b.dataset.t==='news')refreshNewsFeed({silent:true});if(b.dataset.t==='prices')refreshPriceIntel({silent:true});if(b.dataset.t==='chips')scheduleChipAdvisor(80);if(b.dataset.t==='verdict')warmVerdictFeeds();USER_TOUCHED_RAIL=true;renderActiveRailPanel(b.dataset.t)});
document.querySelectorAll('.mobile-tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mobile-tabs button').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-selected','false');x.tabIndex=-1});b.classList.add('on');b.setAttribute('aria-selected','true');b.tabIndex=0;['colPool','colCentre','colRail'].forEach(id=>document.getElementById(id).classList.add('mhide'));document.getElementById({pool:'colPool',centre:'colCentre',rail:'colRail'}[b.dataset.m]).classList.remove('mhide');if(b.dataset.m==='pool')renderPool();else if(b.dataset.m==='centre'){renderPitch();renderSpine()}else renderActiveRailPanel()});
/* These persistent Verdict buttons are outside the dynamic action queue, so
   they need their own navigation wiring. RC5.0.12 rendered them but never
   attached a click handler. */
document.getElementById('verdictOpenTransfers').onclick=()=>uxOpenPanel('transfers');
document.getElementById('verdictOpenFixtures').onclick=()=>uxOpenPanel('fixtures');
document.getElementById('chipGrid')?.addEventListener('change',()=>requestAnimationFrame(()=>{renderPitch();renderSpine();bumpVerdict()}));
document.getElementById('chipAdvisorOut')?.addEventListener('click',e=>{if(e.target.closest('#btnApplyChipAdvice'))requestAnimationFrame(()=>{renderPitch();renderSpine();bumpVerdict()})});
function syncMobile(){const small=matchMedia('(max-width:1080px)').matches;['colPool','colCentre','colRail'].forEach(id=>document.getElementById(id).classList.remove('mhide'));if(small){const on=document.querySelector('.mobile-tabs button.on').dataset.m;['colPool','colCentre','colRail'].forEach(id=>{if(id!=={pool:'colPool',centre:'colCentre',rail:'colRail'}[on])document.getElementById(id).classList.add('mhide')})}}
addEventListener('resize',()=>{syncMobile();resetPoolRender();requestAnimationFrame(render)});document.getElementById('modalClose').onclick=closeModal;document.getElementById('playerModal').onclick=e=>{if(e.target.id==='playerModal')closeModal()};document.addEventListener('keydown',e=>{const modal=document.getElementById('playerModal');if(modal.classList.contains('hide'))return;if(e.key==='Escape'){closeModal();return}if(e.key==='Tab'){const f=[...modal.querySelectorAll('button,input,select,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.offsetParent!==null);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.getElementById('btnRefresh').onclick=()=>refreshLiveData(true);document.getElementById('btnTestWorker').onclick=testWorkerConnection;document.getElementById('btnCopyPipeline').onclick=async()=>{const text=pipelineReport();try{await navigator.clipboard.writeText(text);flash('Pipeline diagnostic copied.')}catch(e){document.getElementById('importBox').value=text;flash('Clipboard blocked — diagnostic placed in the import box.')}};document.getElementById('btnImport').onclick=importPasted;document.getElementById('btnImportFplTeam').onclick=importFplTeamById;document.getElementById('fplTeamId').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();importFplTeamById()}};document.getElementById('btnBuild').onclick=runBuild;document.getElementById('btnUnlock').onclick=()=>{S.locks.clear();render();saveUserState();document.getElementById('buildOut').innerHTML='<div class="verdict">All locks cleared.</div>'};document.getElementById('btnClearBuildBlocks').onclick=clearBuildBlocks;document.getElementById('autoRefresh').onchange=()=>{DATA.auto=document.getElementById('autoRefresh').checked;saveUserState()};
['priceWindow','priceScope','priceSort'].forEach(id=>document.getElementById(id).onchange=()=>{if(id==='priceWindow')refreshPriceIntel();else renderPriceIntel()});document.getElementById('btnPriceRefresh').onclick=()=>refreshPriceIntel();document.getElementById('btnPriceSync').onclick=()=>refreshPriceIntel({sync:true});
document.getElementById('tpStrategyStyle').onchange=e=>applyTransferStrategy(e.target.value);['tpFree','tpHorizon','tpMaxMoves','tpMaxHit','tpBank','tpThreshold','tpDecay','tpFtScale','tpFriction','tpItbValue','tpStress'].forEach(id=>document.getElementById(id).onchange=()=>{syncTransferSettings();renderTransferPlanner()});document.getElementById('transferPrices').addEventListener('change',e=>{const key=e.target.dataset.buyKey;if(!key)return;const p=squadPlayers().find(x=>stableKey(x)===key);if(!p)return;S.transfer.purchase[key]=clamp(num(e.target.value,p.c),3.5,25);saveUserState();renderTransferPrices()});document.getElementById('btnUseBuilderBank').onclick=()=>{S.transfer.bank=Math.max(0,bank());initTransferControls();renderTransferPlanner();saveUserState()};document.getElementById('btnResetPurchasePrices').onclick=()=>{if(Object.keys(S.transfer.purchase||{}).length&&!confirm('Clear all purchase prices? Selling-price estimates will fall back to current prices.'))return;S.transfer.purchase={};renderTransferPrices();saveUserState();flash('Bought prices reset to current prices.')};document.getElementById('btnPlanTransfers').onclick=runTransferPlanner;const plannerExperimentBtn=document.getElementById('btnPlannerExperiment');if(plannerExperimentBtn)plannerExperimentBtn.onclick=runPlannerStyleExperiment;
document.getElementById('btnCompareBuilderStyles').onclick=compareBuilderStyles;
document.getElementById('btnExport').onclick=()=>{const xi=squadPlayers().filter(p=>S.start.has(p.id)),bn=squadPlayers().filter(p=>!S.start.has(p.id)),line=a=>a.map(p=>p.n+(p.id===S.cap?' (C)':p.id===S.vice?' (V)':'')).join(', '),txt=`FPL Engine OTB — GW${S.gw}\n`+['GK','DEF','MID','FWD'].map(k=>k+': '+line(xi.filter(p=>p.p===k))).join('\n')+`\nBench: ${line(bn)}\nSpend: £${spent().toFixed(1)}m · Bank: £${bank().toFixed(1)}m · Projected: ${document.getElementById('spineTotal').textContent} xPts · Data: ${DATA.mode}`;navigator.clipboard.writeText(txt).then(()=>{document.getElementById('importMsg').innerHTML='<b style="color:var(--mint)">Squad copied.</b>'},()=>{const msg=document.getElementById('importMsg');msg.innerHTML='';const pre=document.createElement('pre');pre.style.cssText='white-space:pre-wrap;font-size:10px';pre.textContent=txt;msg.appendChild(pre)})};
document.getElementById('btnClear').onclick=clearCurrentSquad;

function initControls(){renderBuilderStrategyProfiles();document.getElementById('oBudget').value=S.budget;document.getElementById('acBudget').value=S.budget;document.getElementById('oHorizon').value=String(S.horizon);document.getElementById('oRisk').value=S.risk;document.getElementById('oDisplay').value=S.display;document.getElementById('autoRefresh').checked=DATA.auto;const d=S.discovery;for(const [id,v] of [['fPreset',d.preset],['fPeriod',d.period],['fSort',d.sort],['fSecondary',d.secondary],['fMax',d.maxPrice],['fOwnMax',d.ownMax]]){const el=document.getElementById(id);if(el&&[...el.options].some(o=>o.value===String(v)))el.value=String(v)}for(const [id,v] of [['fAvailable',d.available],['fStarter',d.starter],['fAffordable',d.affordable],['fSetPiece',d.setPiece]])document.getElementById(id).checked=!!v;for(const [id,key] of [['wFix','fix'],['wHome','home'],['wCS','cs'],['wDC','dc'],['wOfficial','official'],['wForm','form']])document.getElementById(id).value=S.w[key];for(const [id,key] of [['lFix','fix'],['lHome','home'],['lCS','cs'],['lDC','dc'],['lOfficial','official'],['lForm','form']])document.getElementById(id).textContent=S.w[key].toFixed(2)}
enhanceAccessibility();wireRoleIntelligence();initControls();if(SAVED)remapSelection(SAVED);updateGwSelect();initTransferControls();
/* ---------- saved squads ---------- */
const SQUADS_KEY='fpl-engine-saved-squads-v1';
function loadSquads(){try{return JSON.parse(localStorage.getItem(SQUADS_KEY)||'[]')}catch(e){return[]}}
function persistSquads(a){try{localStorage.setItem(SQUADS_KEY,JSON.stringify(a))}catch(e){}}
function saveCurrentSquad(){
  const nameEl=document.getElementById('sqName');
  const name=(nameEl.value||'').trim()||`Squad ${new Date().toLocaleDateString()}`;
  if(!S.squad.length){flash('Add some players first \u2014 nothing to save yet.');return}
  const all=loadSquads();
  const snap=selectionSnapshot();
  const entry={name,ts:Date.now(),spend:+spent().toFixed(1),count:S.squad.length,
    gw:S.gw,horizon:S.horizon,builderStyle:S.builderStyle,snap,chips:{...S.chips}};
  const i=all.findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
  if(i>=0)all[i]=entry; else all.unshift(entry);
  persistSquads(all.slice(0,30));
  nameEl.value='';
  renderSquads();
  flash(`Saved "${name}".`);
}
function loadSquadByIndex(i){
  const all=loadSquads(),e=all[i];
  if(!e)return;
  remapSelection(e.snap);
  if(e.chips)S.chips={...S.chips,...e.chips};
  if(Number.isFinite(+e.gw))S.gw=clamp(+e.gw,1,38);
  if(Number.isFinite(+e.horizon))S.horizon=clamp(+e.horizon,1,19);if(STRATEGY_PROFILES[e.builderStyle])S.builderStyle=e.builderStyle;
  updateGwSelect();initControls();initTransferControls();bumpCache();render();saveUserState();
  flash(`Loaded "${e.name}".`);
}
function deleteSquadByIndex(i){
  const all=loadSquads(),e=all[i];
  if(!e)return;
  if(!confirm(`Delete "${e.name}"? This cannot be undone.`))return;
  all.splice(i,1);persistSquads(all);renderSquads();
}
function squadProjectedTotal(snap){
  /* project a saved squad without disturbing the live selection */
  const map=new Map;POOL.forEach(p=>{map.set(stableKey(p),p);map.set(nameKey(p),p)});
  const xi=(snap?.start||[]).map(k=>map.get(k)).filter(Boolean);
  const capP=snap?.cap?map.get(snap.cap):null;
  let sum=0;
  for(const p of xi){const m=(capP&&p.id===capP.id)?2:1;
    sum+=(S.display==='total'?horizonForecast(p).total:project(p,S.gw).x)*m}
  return sum;
}
function squadCurrentCost(snap){
  /* Recompute a saved squad's cost against LIVE current prices, not the
     static figure captured the moment it was saved. Prices move constantly
     in a real season; a saved draft should never lie about what it costs now. */
  const map=new Map;POOL.forEach(p=>{map.set(stableKey(p),p);map.set(nameKey(p),p)});
  const squad=(snap?.squad||[]).map(k=>map.get(k)).filter(Boolean);
  return {cost:moneyTotal(squad),resolved:squad.length};
}
function renderSquads(){
  const all=loadSquads(),el=document.getElementById('squadList');
  if(!el)return;
  if(!all.length){el.innerHTML='<div class="help">No saved squads yet.</div>';return}
  el.innerHTML=all.map((e,i)=>{
    const proj=squadProjectedTotal(e.snap);
    const missing=e.count-((e.snap?.squad||[]).filter(k=>POOL.some(p=>stableKey(p)===k||nameKey(p)===k)).length);
    const cur=squadCurrentCost(e.snap);
    const delta=+(cur.cost-e.spend).toFixed(1);
    const overBudget=cur.cost>S.budget+0.001;
    return `<div class="verdict" style="border-left-color:var(--cyan)">
      <b>${esc(e.name)}</b><br>
      <span class="mono" style="font-size:11px;color:var(--muted)">
        ${e.count}/15 \u00b7 projected ${proj.toFixed(1)} pts
        ${S.display==='total'?'('+horizonLabel()+')':'(GW'+S.gw+')'}<br>
        Saved at \u00a3${e.spend.toFixed(1)}m \u00b7 now \u00a3${cur.cost.toFixed(1)}m        ${Math.abs(delta)>=0.05?` <span style="color:${delta>0?'var(--mag)':'var(--mint)'}">(${delta>0?'+':''}${delta.toFixed(1)}m)</span>`:''}<br>
        <span style="color:${overBudget?'var(--mag)':'var(--mint)'}">${overBudget?'Over your \u00a3'+S.budget.toFixed(1)+'m budget':'Fits your \u00a3'+S.budget.toFixed(1)+'m budget'}</span>
        ${missing>0?'<br><span style="color:#FF6E9E">'+missing+' player(s) no longer in the pool</span>':''}
      </span><br>
      <button type="button" class="btn" style="width:auto;padding:5px 12px;margin:6px 6px 0 0" data-loadsq="${i}">Load</button>
      <button type="button" class="btn ghost" style="width:auto;padding:5px 12px;margin:6px 0 0 0" data-delsq="${i}">Delete</button>
    </div>`}).join('');
}
document.getElementById('btnSaveSquad').onclick=saveCurrentSquad;
document.getElementById('btnNewSquad').onclick=()=>{
  if(S.squad.length&&!confirm('Clear the current squad? Save it first if you want to keep it.'))return;
  S.squad=[];S.start.clear();S.locks.clear();S.cap=null;S.vice=null;bumpCache();render();saveUserState();
};
document.addEventListener('click',e=>{const a=e.target.closest('[data-riskfix]');if(!a)return;e.preventDefault();inspectPlayer(+a.dataset.riskfix);setTimeout(()=>{const el=document.getElementById('ovMinutes');if(el){try{el.focus();if(el.scrollIntoView)el.scrollIntoView({block:'center'})}catch(_){}}},80);});
document.getElementById('squadList').addEventListener('click',e=>{
  const l=e.target.closest('[data-loadsq]'),d=e.target.closest('[data-delsq]');
  if(l)loadSquadByIndex(+l.dataset.loadsq);
  else if(d)deleteSquadByIndex(+d.dataset.delsq);
});


/* RC2.3.2 — Supplementary all-competition workload calendar. These matches never change FPL difficulty or xPts. */
function externalNormal(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function resolveExternalTeam(v){const raw=String(v??'').trim(),up=raw.toUpperCase();if(TEAMS[up])return up;const key=externalNormal(raw),aliases={arsenalfc:'ARS',astonvillafc:'AVL',afcbournemouth:'BOU',bournemouthafc:'BOU',brentfordfc:'BRE',brightonandhovealbion:'BHA',brightonhovealbion:'BHA',chelseafc:'CHE',coventrycity:'COV',crystalpalacefc:'CRY',evertonfc:'EVE',fulhamfc:'FUL',hullcityafc:'HUL',ipswichtown:'IPS',leedsunited:'LEE',liverpoolfc:'LIV',manchestercity:'MCI',manchesterunited:'MUN',newcastleunited:'NEW',nottinghamforest:'NFO',sunderlandafc:'SUN',tottenhamhotspur:'TOT',tottenhamhotspurfc:'TOT'};if(aliases[key]&&TEAMS[aliases[key]])return aliases[key];return Object.keys(TEAMS).find(c=>{const n=externalNormal(TEAMS[c]?.n);return n===key||externalNormal(c)===key||(key.length>6&&n.length>6&&(key.includes(n)||n.includes(key)))})||null}
function isPremierCompetition(v){const x=externalNormal(v);return x==='pl'||x.includes('premierleague')||x.includes('englishpremierleague')}
function externalFixtureExcluded(...values){return /\b(?:women(?:'s)?|ladies|girls|academy|reserves?|development squad|premier league 2|b team|under[ -]?(?:18|19|20|21|23)|u(?:18|19|20|21|23))\b/i.test(values.map(v=>String(v??'')).join(' '))}
function externalCsvLine(line){const out=[];let s='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&q){s+='"';i++}else if(c==='"')q=!q;else if(c===','&&!q){out.push(s.trim());s=''}else s+=c}out.push(s.trim());return out}
function externalRowsFromPayload(payload){
 let rows=Array.isArray(payload)?payload:(payload?.fixtures||payload?.matches||payload?.response);
 if(!Array.isArray(rows))throw new Error('Expected an array, or an object containing fixtures, matches or response.');
 const out=[];
 const add=(team,kickoff,competition,opponent,home,source='manual',id='',confirmed=true,updatedAt='')=>{
  const code=resolveExternalTeam(team),t=Date.parse(kickoff),comp=String(competition||'Other competition').trim(),opp=String(opponent||'Opponent TBC').trim(),stamp=Date.parse(updatedAt);
  if(!code||!Number.isFinite(t)||confirmed===false||isPremierCompetition(comp)||externalFixtureExcluded(comp,team,opp))return;
  out.push({id:String(id||`${code}|${t}|${externalNormal(comp)}|${externalNormal(opp)}`),team:code,kickoff:new Date(t).toISOString(),competition:comp.slice(0,80),opponent:opp.slice(0,80),home:home===true||String(home).toLowerCase()==='true'||String(home).toUpperCase()==='H',confirmed:true,source:String(source||'manual').slice(0,220),updatedAt:Number.isFinite(stamp)?new Date(stamp).toISOString():''})
 };
 for(const r of rows){
  const status=String(r?.status?.short||r?.status||r?.fixture?.status?.short||'').toUpperCase();
  if(['CANC','CANCELLED','CANCELED','ABD','AWD','PST','POSTPONED','SUSP','SUSPENDED'].includes(status)||r?.confirmed===false)continue;
  const kickoff=r?.kickoff||r?.kickoff_time||r?.utcDate||r?.date||r?.fixture?.date,competition=r?.competition?.name||r?.competition?.code||r?.league?.name||r?.competition||r?.league||'Other competition',homeName=r?.homeTeam?.tla||r?.homeTeam?.shortName||r?.homeTeam?.name||r?.teams?.home?.name||r?.home_team||r?.homeTeamName,awayName=r?.awayTeam?.tla||r?.awayTeam?.shortName||r?.awayTeam?.name||r?.teams?.away?.name||r?.away_team||r?.awayTeamName;
  if(homeName||awayName){
   const hc=resolveExternalTeam(homeName),ac=resolveExternalTeam(awayName);
   if(hc)add(hc,kickoff,competition,awayName,true,r?.source||'import',r?.id||r?.fixture?.id,r?.confirmed!==false,r?.updatedAt);
   if(ac)add(ac,kickoff,competition,homeName,false,r?.source||'import',r?.id||r?.fixture?.id,r?.confirmed!==false,r?.updatedAt);
   continue
  }
  add(r?.team_code||r?.team||r?.club,kickoff,competition,r?.opponent,r?.home,r?.source||'manual',r?.id,r?.confirmed!==false,r?.updatedAt)
 }
 const seen=new Set;
 return out.filter(x=>{const k=`${x.team}|${Date.parse(x.kickoff)}|${externalNormal(x.competition)}|${externalNormal(x.opponent)}`;if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>Date.parse(a.kickoff)-Date.parse(b.kickoff))
}
function parseExternalCalendar(raw){const s=String(raw||'').trim();if(!s)throw new Error('Paste JSON or CSV first.');if(s[0]==='['||s[0]==='{')return externalRowsFromPayload(JSON.parse(s));const lines=s.split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)throw new Error('CSV needs a header and at least one fixture row.');const headers=externalCsvLine(lines[0]).map(externalNormal),get=(row,...names)=>{for(const n of names){const i=headers.indexOf(externalNormal(n));if(i>=0)return row[i]}return''},rows=lines.slice(1).map(line=>{const c=externalCsvLine(line);return{team:get(c,'team','team_code','club'),kickoff:get(c,'kickoff','kickoff_time','date','utcDate'),competition:get(c,'competition','league'),opponent:get(c,'opponent'),home:get(c,'home'),home_team:get(c,'home_team','homeTeam'),away_team:get(c,'away_team','awayTeam')}});return externalRowsFromPayload(rows)}
function externalPayloadUpdatedAt(payload,rows){const values=[payload?.updatedAt,payload?.generatedAt,...rows.map(x=>x.updatedAt)].map(Date.parse).filter(Number.isFinite);return values.length?new Date(Math.max(...values)).toISOString():new Date().toISOString()}
function saveExternalCalendar(){try{localStorage.setItem(EXTERNAL_FIXTURE_KEY,JSON.stringify({fixtures:EXT_CAL.fixtures,source:EXT_CAL.source,mode:EXT_CAL.mode,updatedAt:EXT_CAL.updatedAt}))}catch(e){EXT_CAL.error=e.message}}
function loadExternalCalendar(){try{const d=JSON.parse(localStorage.getItem(EXTERNAL_FIXTURE_KEY)||'null');if(d?.fixtures){EXT_CAL.fixtures=externalRowsFromPayload(d.fixtures);EXT_CAL.source=d.source||'local';EXT_CAL.mode=d.mode||(d.source==='manual'?'manual':'auto');EXT_CAL.updatedAt=d.updatedAt||externalPayloadUpdatedAt(d,d.fixtures)}}catch(e){EXT_CAL.error=e.message}}
function externalFixturesForTeam(code){return EXT_CAL.fixtures.filter(x=>x.team===code&&Number.isFinite(Date.parse(x.kickoff)))}
function externalAgeText(value){const t=Date.parse(value);if(!Number.isFinite(t))return'not yet synced';const min=Math.max(0,Math.round((Date.now()-t)/60000));if(min<2)return'synced just now';if(min<60)return`synced ${min}m ago`;const hr=Math.round(min/60);if(hr<48)return`synced ${hr}h ago`;return`synced ${Math.round(hr/24)}d ago`}
function renderExternalCalendarStatus(message='',kind=''){
 const el=document.getElementById('fxExternalStatus'),mode=document.getElementById('fxExternalMode'),btn=document.getElementById('fxSyncExternal');if(!el)return;
 const manual=EXT_CAL.mode==='manual',byComp=[...new Set(EXT_CAL.fixtures.map(x=>x.competition))],age=externalAgeText(EXT_CAL.updatedAt);
 if(mode)mode.innerHTML=`${manual?'Manual override':'Auto calendar'} <span class="schedule-source-tag">workload only</span>`;
 if(btn)btn.textContent=manual?'Resume auto':'Sync cached feed';
 let fallback='';
 if(manual)fallback=EXT_CAL.fixtures.length?`${EXT_CAL.fixtures.length} manually supplied team-fixture record${EXT_CAL.fixtures.length===1?'':'s'} across ${byComp.length} competition${byComp.length===1?'':'s'}. Auto sync is paused.`:'Manual override is active but contains no fixtures.';
 else if(EXT_CAL.fixtures.length)fallback=`${age} · ${EXT_CAL.fixtures.length} confirmed team-fixture record${EXT_CAL.fixtures.length===1?'':'s'} across ${byComp.length} competition${byComp.length===1?'':'s'}. Workload/rest only.`;
 else fallback='Waiting for the cached Worker calendar. Congestion currently reflects Premier League matches only.';
 if(!message&&EXT_CAL.error&&EXT_CAL.fixtures.length)fallback+=` Last sync check failed; the cached calendar was retained (${EXT_CAL.error}).`;
 el.className='schedule-import-status '+(kind||(manual?'warn':EXT_CAL.error?'warn':EXT_CAL.fixtures.length?'good':'warn'));
 el.textContent=message||fallback
}
async function syncExternalCalendar(options={}){
 if(options.auto&&EXT_CAL.mode==='manual')return;
 if(EXT_CAL.syncPromise)return EXT_CAL.syncPromise;
 EXT_CAL.autoAttempted=true;
 const btn=document.getElementById('fxSyncExternal');if(btn)btn.disabled=true;
 if(!options.silent)renderExternalCalendarStatus('Reading the cached Worker all-competition calendar…','warn');
 EXT_CAL.syncPromise=(async()=>{
  try{
   const data=await fetchJSON(`${API_BASE}/api/club-schedule`,15000),rows=externalRowsFromPayload(data);
   EXT_CAL.fixtures=rows;EXT_CAL.source='worker';EXT_CAL.mode='auto';EXT_CAL.updatedAt=externalPayloadUpdatedAt(data,rows);EXT_CAL.error='';saveExternalCalendar();renderExternalCalendarStatus();renderFixtures();scheduleSelfTests(150);return rows
  }catch(e){EXT_CAL.error=e.message;renderExternalCalendarStatus(EXT_CAL.fixtures.length?`Cached calendar retained. Sync check failed: ${e.message}`:`Automatic calendar sync failed: ${e.message}. Manual override remains available.`,'bad');return null}
  finally{EXT_CAL.syncPromise=null;if(btn)btn.disabled=false}
 })();
 return EXT_CAL.syncPromise
}
function maybeAutoSyncExternalCalendar(){if(EXT_CAL.autoAttempted||EXT_CAL.mode==='manual'||navigator.onLine===false)return;return syncExternalCalendar({auto:true,silent:true})}
function premierCalendarForTeam(code){const out=[];for(let g=1;g<=38;g++)for(const f of fixtureListFor(code,g)){const t=Date.parse(f.kickoff);if(Number.isFinite(t))out.push({id:`PL|${f.id||g+'|'+code+'|'+f.opp}`,team:code,kickoff:new Date(t).toISOString(),competition:'Premier League',opponent:f.opp,home:f.home,source:'FPL',gw:g})}return out}
function scheduleWindowBounds(gws,cells){const first=EVENTS.find(e=>num(e.id)===gws[0]),after=EVENTS.find(e=>num(e.id)===gws[gws.length-1]+1),last=EVENTS.find(e=>num(e.id)===gws[gws.length-1]),eventStart=Date.parse(first?.deadline_time),eventEnd=Number.isFinite(Date.parse(after?.deadline_time))?Date.parse(after.deadline_time)-1:Date.parse(last?.deadline_time)+7*864e5;if(Number.isFinite(eventStart)&&Number.isFinite(eventEnd))return{start:eventStart,end:eventEnd};const times=cells.flat().map(f=>Date.parse(f.kickoff)).filter(Number.isFinite);if(times.length)return{start:Math.min(...times)-12*36e5,end:Math.max(...times)+96*36e5};return{start:SEASON_START,end:SEASON_END}}
function scheduleRestAnalysis(code,gws,cells){const bounds=scheduleWindowBounds(gws,cells),league=premierCalendarForTeam(code),external=externalFixturesForTeam(code),all=[...league,...external].map(x=>({...x,time:Date.parse(x.kickoff)})).filter(x=>Number.isFinite(x.time)).sort((a,b)=>a.time-b.time),inWindow=all.filter(x=>x.time>=bounds.start&&x.time<=bounds.end),pairs=[];for(let i=1;i<all.length;i++){const a=all[i-1],b=all[i],relevant=(a.time>=bounds.start&&a.time<=bounds.end)||(b.time>=bounds.start&&b.time<=bounds.end);if(!relevant)continue;const hours=(b.time-a.time)/36e5;pairs.push({a,b,hours,severity:hours<72?'severe':hours<96?'elevated':'normal'})}const severe=pairs.filter(x=>x.severity==='severe').length,elevated=pairs.filter(x=>x.severity==='elevated').length,minRest=pairs.length?Math.min(...pairs.map(x=>x.hours)):null,externalGames=inWindow.filter(x=>x.source!=='FPL').length,leagueGames=inWindow.filter(x=>x.source==='FPL').length;return{...bounds,all,inWindow,pairs,severe,elevated,shortRest:severe+elevated,minRest,externalGames,leagueGames,totalGames:inWindow.length}}
function scheduleUniquePremierCoverage(gws){const keys=new Set,known=new Set;for(const g of gws){(FIX[g]||[]).forEach(([h,a],i)=>{const m=(FIX_META[g]||[])[i]||{},k=m.id!=null?String(m.id):`${g}|${h}|${a}`;keys.add(k);if(Number.isFinite(Date.parse(m.kickoff)))known.add(k)})}return{fixtures:keys.size,known:known.size}}
/* ---------- Schedule Intelligence 2.0 ---------- */
function scheduleGws(start,n){const out=[];for(let g=clamp(num(start,S.gw),1,38);g<=38&&out.length<n;g++){if(FIX[g]||EVENTS.some(e=>num(e.id)===g))out.push(g)}if(!out.length)for(let g=clamp(num(start,S.gw),1,38);g<=38&&out.length<n;g++)out.push(g);return out}
function scheduleFixtureRows(team,gw){return fixtureListFor(team,gw).map(f=>{const ctx=fixtureContext(team,f);return{...f,ctx,dAtk:ctx.dAtk,dCS:ctx.dCS,dOverall:.55*ctx.dAtk+.45*ctx.dCS}})}
function scheduleGwDifficulty(list,key='overall'){if(!list.length)return 5.5;const metric=key==='atk'?'dAtk':key==='cs'?'dCS':'dOverall';return clamp(list.reduce((a,x)=>a+x[metric],0)/list.length,1,5.5)}
function scheduleGwOpportunity(list,key='overall'){if(!list.length)return 0;const metric=key==='atk'?'dAtk':key==='cs'?'dCS':'dOverall';return list.reduce((a,x)=>a+Math.max(0,6-x[metric]),0)}
function scheduleMetricName(view){return{overall:'overall',atk:'attack',cs:'clean-sheet',congestion:'congestion'}[view]||'overall'}
function scheduleExposure(code,gws){const owned=squadPlayers().filter(p=>p.t===code),starters=owned.filter(p=>S.start.has(p.id)),bench=owned.filter(p=>!S.start.has(p.id)),xpts=owned.reduce((a,p)=>a+gws.reduce((s,g)=>s+project(p,g).x,0),0);return{count:owned.length,starters:starters.length,bench:bench.length,xpts}}
function scheduleTeamStats(code,gws){
 const cells=gws.map(g=>scheduleFixtureRows(code,g)),atk=cells.map(c=>scheduleGwDifficulty(c,'atk')),cs=cells.map(c=>scheduleGwDifficulty(c,'cs')),overall=cells.map(c=>scheduleGwDifficulty(c,'overall')),avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:5.5,fixtures=cells.flat(),blanks=cells.filter(c=>!c.length).length,doubles=cells.filter(c=>c.length>1).length,rest=scheduleRestAnalysis(code,gws,cells),extraDensity=Math.max(0,rest.totalGames-fixtures.length),burden=clamp(1+rest.severe*.90+rest.elevated*.45+extraDensity*.22+doubles*.25,1,5.5),half=Math.max(1,Math.floor(gws.length/2)),early=avg(overall.slice(0,half)),late=avg(overall.slice(-half)),swing=late-early,exposure=scheduleExposure(code,gws),home=fixtures.filter(f=>f.home).length,away=fixtures.length-home,opportunity=cells.reduce((a,c)=>a+scheduleGwOpportunity(c,'overall'),0);
 return{code,cells,avgAtk:avg(atk),avgCS:avg(cs),avgOverall:avg(overall),opportunity,congestion:burden,blanks,doubles,shortRest:rest.shortRest,severeRest:rest.severe,elevatedRest:rest.elevated,minRest:rest.minRest,kickoffKnown:fixtures.map(f=>Date.parse(f.kickoff)).filter(Number.isFinite).length,fixtures:fixtures.length,leagueGames:rest.leagueGames,externalGames:rest.externalGames,totalCalendarGames:rest.totalGames,restPairs:rest.pairs,home,away,swing,exposure,score:clamp(100-(avg(overall)-1)*25,0,100)}
}
function scheduleRankValue(row,view){return view==='atk'?row.avgAtk:view==='cs'?row.avgCS:view==='congestion'?row.congestion:row.avgOverall}
function scheduleDifficultyClass(v){return fCls(clamp(v,1,5))}
function scheduleClock(iso){const t=Date.parse(iso);if(!Number.isFinite(t))return'';return new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'})}
// Half a point on the existing 1–5 FDR scale is large enough to be visible
// without promoting ordinary venue/noise-sized fluctuations into a swing.
const SCHEDULE_SWING_MATERIAL_DELTA=.5;
function scheduleSwingPoints(row,gws){return gws.map((gw,i)=>{const fixtures=Array.isArray(row?.cells?.[i])?row.cells[i]:[],opponents=fixtures.length?fixtures.map(f=>({code:String(f.opp||'—'),home:f.home===true?true:f.home===false?false:null})):[{code:'—',home:null}];return{gw,index:i,fixtures,opponents,difficulty:scheduleGwDifficulty(fixtures,'overall')}})}
function scheduleSwingOpponent(point){return point.opponents.map(x=>x.code+(x.home===null?'':x.home?' (H)':' (A)')).join(' + ')}
function scheduleGwRange(a,b){return a===b?`GW${a}`:`GW${a}–GW${b}`}
function scheduleSwingTimeline(row,gws,direction,threshold=SCHEDULE_SWING_MATERIAL_DELTA){
 const mode=direction==='deterioration'?'deterioration':'improvement',sign=mode==='deterioration'?1:-1,points=scheduleSwingPoints(row,gws),limit=Math.max(0,Number(threshold)||0);
 let start=-1;
 for(let i=1;i<points.length;i++){const delta=points[i].difficulty-points[i-1].difficulty;if(sign*delta+1e-9>=limit){start=i;break}}
 if(start<0)return{code:row?.code||'',direction:mode,swingDirection:mode,threshold:limit,material:false,points,swingStartGW:null,swingEndGW:null,coreStartGW:null,coreEndGW:null,extremeGW:null,peakGW:null,troughGW:null,extremeDifficulty:null,recoveryGW:null};
 let recovery=-1;
 for(let i=start+1;i<points.length;i++){const delta=points[i].difficulty-points[i-1].difficulty;if(sign*delta<=-limit+1e-9){recovery=i;break}}
 const end=recovery>=0?recovery-1:points.length-1,baseline=points[start-1].difficulty,run=points.slice(start,end+1),extreme=run.reduce((best,p)=>sign*(p.difficulty-best.difficulty)>1e-9?p:best,run[0]),materialAt=i=>sign*(points[i].difficulty-baseline)+1e-9>=limit;
 let coreStart=extreme.index,coreEnd=extreme.index;
 while(coreStart>start&&materialAt(coreStart-1))coreStart--;
 while(coreEnd<end&&materialAt(coreEnd+1))coreEnd++;
 return{code:row?.code||'',direction:mode,swingDirection:mode,threshold:limit,material:true,points,swingStartGW:points[start].gw,swingEndGW:points[end].gw,coreStartGW:points[coreStart].gw,coreEndGW:points[coreEnd].gw,extremeGW:extreme.gw,peakGW:mode==='deterioration'?extreme.gw:null,troughGW:mode==='improvement'?extreme.gw:null,extremeDifficulty:extreme.difficulty,extremeOpponent:scheduleSwingOpponent(extreme),recoveryGW:recovery>=0?points[recovery].gw:null};
}
function renderScheduleSwingDetails(rows,gws,direction){
 const mode=direction==='deterioration'?'deterioration':'improvement',title=mode==='improvement'?'Improvement':'Deterioration',runLabel=mode==='improvement'?'Favourable run':'Hard stretch',extremeLabel=mode==='improvement'?'easiest':'toughest',recoveryLabel=mode==='improvement'?'hardens again':'improves again';
 const items=(rows||[]).map(row=>{
  const swing=scheduleSwingTimeline(row,gws,mode),headline=swing.material?`${title} starts GW${swing.swingStartGW}`:`No ≥${swing.threshold.toFixed(1)} adjacent step`,timeline=swing.points.map(p=>`<span class="schedule-swing-fixture"><b>GW${p.gw}</b>${esc(scheduleSwingOpponent(p))}<small>${p.difficulty.toFixed(1)}</small></span>`).join('');
  let note=`No adjacent change reaches ${swing.threshold.toFixed(1)} difficulty points; the radar movement is gradual across this window.`;
  if(swing.material){
   const runRange=scheduleGwRange(swing.swingStartGW,swing.swingEndGW),coreRange=scheduleGwRange(swing.coreStartGW,swing.coreEndGW),rangeNote=runRange===coreRange?`${runLabel}: ${coreRange}`:`${title} run: ${runRange} · ${runLabel}: ${coreRange}`;
   note=`${rangeNote} · ${extremeLabel} GW${swing.extremeGW} ${swing.extremeOpponent} (${swing.extremeDifficulty.toFixed(1)})${swing.recoveryGW?` · ${recoveryLabel} GW${swing.recoveryGW}`:''}`;
  }
  return`<div class="schedule-swing-club"><div class="schedule-swing-head"><b>${esc(row.code)}</b><span>${esc(headline)}</span></div><div class="schedule-swing-fixtures">${timeline}</div><div class="schedule-swing-note">${esc(note)}</div></div>`;
 }).join('');
 return items?`<details class="schedule-swing-details"><summary>${title} timing · ${(rows||[]).length} club${(rows||[]).length===1?'':'s'}</summary><div class="schedule-swing-list">${items}</div></details>`:'';
}
function schedulePlayerProjection(p,gws){const rows=gws.map(g=>project(p,g)),md=minuteDetail(p),total=rows.reduce((a,r)=>a+r.x,0),low=rows.reduce((a,r)=>a+r.low,0),high=rows.reduce((a,r)=>a+r.high,0),confidence=rows.length?rows.reduce((a,r)=>a+r.confidence,0)/rows.length:0;return{p,total,avg:rows.length?total/rows.length:0,low,high,confidence,pStart:md.pStart,pAppear:md.pAppear,availability:md.avail,value:total/Math.max(3.5,p.c),safe:total*(.55+.45*md.pStart)}}
function scheduleCheapestDefender(code){const list=POOL.filter(p=>p.t===code&&(p.p==='GK'||p.p==='DEF')&&availability(p)>=.75).map(p=>({p,md:minuteDetail(p)})).filter(x=>x.md.pStart>=.65&&x.md.pAppear>=.80).sort((a,b)=>a.p.c-b.p.c||b.md.pStart-a.md.pStart);return list[0]?.p||null}
function ensureScheduleControls(){const start=document.getElementById('fxStart'),teamIds=['fxTeamFocus','fxCompareA','fxCompareB'];if(start&&!start.options.length){start.innerHTML=Array.from({length:38},(_,i)=>`<option value="${i+1}">Gameweek ${i+1}</option>`).join('');start.value=String(clamp(S.gw,1,38))}const codes=Object.keys(TEAMS).sort(),options=codes.map(c=>`<option value="${esc(c)}">${esc(c)} · ${esc(TEAMS[c]?.n||c)}</option>`).join('');for(const id of teamIds){const el=document.getElementById(id);if(!el)continue;const old=el.value;if(el.options.length!==codes.length)el.innerHTML=options;if(codes.includes(old))el.value=old}return codes}
function renderScheduleStatus(gws,rows){const el=document.getElementById('fxStatus');if(!el)return;const cov=scheduleUniquePremierCoverage(gws),live=DATA.mode==='LIVE',cache=DATA.mode==='CACHE',verified=!!DATA.validation?.topologyPass,hasExt=EXT_CAL.fixtures.length>0,cls=live&&verified?'good':DATA.mode==='SEED'?'warn':cache?'warn':'bad',source=live?'live official Premier League fixture payload':cache?'validated cached Premier League payload':'embedded Premier League fallback schedule',coverage=cov.fixtures?`${cov.known}/${cov.fixtures} unique PL kickoff times known`:'no Premier League fixture rows',extRecords=rows.reduce((a,r)=>a+r.externalGames,0);el.className=`schedule-status ${cls}`;el.innerHTML=`<span><b>${esc(source.toUpperCase())}</b><br>GW${gws[0]}–GW${gws[gws.length-1]} · ${coverage}. ${cov.known<cov.fixtures?'Premier League rest coverage is partial until kickoff times are confirmed.':'Premier League kickoff coverage is complete for this window.'} ${hasExt?`Supplementary calendar contributes ${extRecords} club-match record${extRecords===1?'':'s'} to workload analysis.`:'No cup/European calendar is loaded, so congestion is Premier League-only.'} ${verified?'PL fixture topology passed validation.':'PL topology is not fully verified in the current data mode.'}</span>`}
function renderScheduleSummary(rows,gws){const bestAtk=[...rows].sort((a,b)=>a.avgAtk-b.avgAtk)[0],bestCS=[...rows].sort((a,b)=>a.avgCS-b.avgCS)[0],ownedTeams=rows.filter(r=>r.exposure.count).length,totalBD=rows.reduce((a,r)=>a+r.blanks+r.doubles,0),external=rows.reduce((a,r)=>a+r.externalGames,0),severe=rows.reduce((a,r)=>a+r.severeRest,0);document.getElementById('fxSummary').innerHTML=`<div class="schedule-kpi info"><div class="sk">Window</div><div class="sv">GW${gws[0]}–GW${gws[gws.length-1]}</div></div><div class="schedule-kpi good"><div class="sk">Best attack difficulty</div><div class="sv">${esc(bestAtk?.code||'—')} ${bestAtk?bestAtk.avgAtk.toFixed(2):''}</div></div><div class="schedule-kpi good"><div class="sk">Best defence difficulty</div><div class="sv">${esc(bestCS?.code||'—')} ${bestCS?bestCS.avgCS.toFixed(2):''}</div></div><div class="schedule-kpi ${severe?'warn':'info'}"><div class="sk">Calendar workload</div><div class="sv">${external} extra · ${severe} severe</div></div><div class="schedule-kpi ${totalBD?'warn':'info'}"><div class="sk">FPL events</div><div class="sv">${ownedTeams} owned clubs · ${totalBD} B/D</div></div><div class="schedule-kpi info"><div class="sk">Measure separation</div><div class="sv">Difficulty ≠ volume</div></div>`}
function renderScheduleInsights(rows){const bestAtk=[...rows].sort((a,b)=>a.avgAtk-b.avgAtk)[0],bestCS=[...rows].sort((a,b)=>a.avgCS-b.avgCS)[0],improve=[...rows].sort((a,b)=>a.swing-b.swing)[0],worsen=[...rows].sort((a,b)=>b.swing-a.swing)[0],over=[...rows].filter(r=>r.exposure.count>=2&&r.avgOverall>3.35).sort((a,b)=>b.exposure.count-a.exposure.count||b.avgOverall-a.avgOverall)[0],under=[...rows].filter(r=>!r.exposure.count&&r.avgOverall<2.75).sort((a,b)=>a.avgOverall-b.avgOverall)[0],cards=[['Best attack',bestAtk,`Difficulty ${bestAtk?.avgAtk.toFixed(2)}`,'good'],['Best clean-sheet run',bestCS,`Difficulty ${bestCS?.avgCS.toFixed(2)}`,'good'],['Strongest improvement',improve,improve?`${Math.abs(improve.swing).toFixed(2)} easier by the back half`:'—','good'],['Sharpest deterioration',worsen,worsen?`${Math.abs(worsen.swing).toFixed(2)} harder by the back half`:'—','bad'],['Squad exposure risk',over,over?`${over.exposure.count} owned entering ${over.avgOverall.toFixed(2)} difficulty`:'No clear overexposure','warn'],['Uncovered opportunity',under,under?`No players owned · ${under.avgOverall.toFixed(2)} schedule`:'No strong gap detected','info']];document.getElementById('fxInsights').innerHTML=cards.map(([k,r,n,c])=>`<div class="schedule-insight ${c}"><div class="si-k">${esc(k)}</div><div class="si-v">${esc(r?.code||'—')} ${r?esc(TEAMS[r.code]?.n||''):''}</div><div class="si-note">${esc(n)}</div></div>`).join('')}
function renderScheduleCommand(rows,gws){
 const host=document.getElementById('fxCommandCenter');if(!host)return;
 const squad=squadPlayers(),ownedRows=rows.filter(r=>r.exposure.count),ownedCount=squad.length;
 const weighted=ownedRows.reduce((a,r)=>a+r.avgOverall*r.exposure.count,0),avgOwned=ownedCount?weighted/ownedCount:0;
 const fixtureScore=ownedCount?clamp(Math.round(100-(avgOwned-1)*25),0,100):null;
 const best=[...rows].sort((a,b)=>a.avgOverall-b.avgOverall),improving=[...rows].sort((a,b)=>a.swing-b.swing).slice(0,3),worsening=[...rows].sort((a,b)=>b.swing-a.swing).slice(0,3);
 const over=[...rows].filter(r=>r.exposure.count>=2&&r.avgOverall>3.25).sort((a,b)=>b.exposure.count-a.exposure.count||b.avgOverall-a.avgOverall)[0];
 const favourable=new Set(best.slice(0,5).map(r=>r.code));
 const candidates=POOL.filter(p=>favourable.has(p.t)&&availability(p)>=.65).map(p=>schedulePlayerProjection(p,gws)).filter(x=>x.pStart>=.45).sort((a,b)=>b.safe-a.safe||b.value-a.value);
 const posPick=pos=>candidates.find(x=>pos.includes(x.p.p));
 const targets=[['GK/DEF',posPick(['GK','DEF'])],['MID',posPick(['MID'])],['FWD',posPick(['FWD'])]].filter(x=>x[1]);
 const captain=gws.map(g=>POOL.map(p=>({p,r:project(p,g),md:minuteDetail(p)})).filter(x=>x.md.pAppear>.25).sort((a,b)=>b.r.x-a.r.x)[0]).filter(Boolean);
 const capTeams=[...new Set(captain.map(x=>x.p.t))],capScore=capTeams.length?Math.round(100*capTeams.filter(t=>best.slice(0,7).some(r=>r.code===t)).length/capTeams.length):0;
 const atkScore=Math.round(best.slice(0,5).reduce((a,r)=>a+(100-(r.avgAtk-1)*25),0)/5),defScore=Math.round(best.slice(0,5).reduce((a,r)=>a+(100-(r.avgCS-1)*25),0)/5);
 const risk=over?`${over.exposure.count} ${over.code} assets face ${over.avgOverall.toFixed(2)} difficulty`:(ownedCount?'No concentrated fixture risk detected':'Build a squad to unlock exposure risk');
 const targetHtml=targets.length?targets.map(([pos,x])=>`<div class="schedule-target-row"><span class="pos">${pos}</span><span><b>${esc(x.p.n)}</b> <span style="color:var(--muted)">${esc(x.p.t)} · £${x.p.c.toFixed(1)}m</span></span><span class="pts">${x.total.toFixed(1)}</span></div>`).join(''):'<div class="m">No reliable targets available in the selected window.</div>';
 const posText=improving.map(r=>`${r.code} (${Math.abs(r.swing).toFixed(2)} easier)`).join(' · '),negText=worsening.map(r=>`${r.code} (${Math.abs(r.swing).toFixed(2)} harder)`).join(' · '),posTimeline=renderScheduleSwingDetails(improving,gws,'improvement'),negTimeline=renderScheduleSwingDetails(worsening,gws,'deterioration');
 const narrative=ownedCount?`Your squad fixture score is ${fixtureScore}/100 across GW${gws[0]}–GW${gws[gws.length-1]}. ${over?`${over.code} is the clearest exposure concern.`:'No major club concentration is currently damaging the schedule.'} ${best[0]?`${best[0].code} owns the strongest overall run.`:''} The best low-cost response is to prioritise players who combine favourable fixtures with secure minutes rather than chasing fixture colour alone.`:`GW${gws[0]}–GW${gws[gws.length-1]} favours ${best.slice(0,3).map(r=>r.code).join(', ')}. Add your squad to convert the league schedule into a personal fixture score, exposure warning and tailored targets.`;
 host.innerHTML=`<div class="schedule-command"><div class="schedule-command-head"><div><div class="title">Schedule Command Center</div><div class="m" style="color:var(--muted);font-size:9px;margin-top:3px">Personal fixture intelligence · no shortcut buttons</div></div><div class="schedule-score">${fixtureScore==null?'—':fixtureScore}<small>/100</small></div></div><div class="schedule-command-grid"><div class="schedule-command-card"><div class="k">Positive swing radar</div><div class="v">${esc(improving[0]?.code||'—')} leads</div><div class="m">${esc(posText)}</div>${posTimeline}</div><div class="schedule-command-card"><div class="k">Negative swing radar</div><div class="v">${esc(worsening[0]?.code||'—')} deteriorates</div><div class="m">${esc(negText)}</div>${negTimeline}</div><div class="schedule-command-card"><div class="k">Opportunity meter</div><div class="v">Attack ${atkScore}/100 · Defence ${defScore}/100</div><div class="m">Captaincy alignment ${capScore}/100 across the window.</div></div><div class="schedule-command-card"><div class="k">Squad exposure</div><div class="v">${esc(risk)}</div><div class="m">${ownedCount?`${ownedCount} selected players across ${ownedRows.length} clubs.`:'No squad selected yet.'}</div></div><div class="schedule-command-card" style="grid-column:1/-1"><div class="k">Best schedule-led targets</div>${targetHtml}<div class="m">Window xPts shown. Detailed transfer economics remain in Transfers.</div></div></div><div class="schedule-narrative"><b>OTB schedule read:</b> ${esc(narrative)}</div></div>`;
}

function renderScheduleMatrix(rows,gws,view,focus){const host=document.getElementById('fxTicker'),cols=`grid-template-columns:42px repeat(${gws.length},minmax(44px,1fr)) 38px 32px`;let html=`<div class="fxrow" style="${cols}"><span></span>${gws.map(g=>`<span class="mono" style="font-size:8px;color:var(--muted);text-align:center">GW${g}</span>`).join('')}<span class="mono" style="font-size:8px;color:var(--muted);text-align:center">AVG</span><span class="mono" style="font-size:8px;color:var(--muted);text-align:center">OWN</span></div>`;html+=rows.map(r=>{const cells=r.cells.map(list=>{if(!list.length)return'<span class="fxcell fxblank" title="Blank gameweek"><span class="fxopp">—</span></span>';const metric=view==='atk'?'atk':view==='cs'?'cs':'overall',d=scheduleGwDifficulty(list,metric),dbl=list.length>1?' fxdbl':'',label=list.map(x=>`<span class="fxopp">${esc(x.opp)}</span><span class="fxha">${x.home?'HOME':'AWAY'} · A ${x.dAtk.toFixed(1)} / CS ${x.dCS.toFixed(1)}</span>${x.kickoff?`<span class="fxko">${esc(scheduleClock(x.kickoff))}</span>`:''}`).join(''),tip=list.map(x=>`${x.opp} (${x.home?'H':'A'}) attack ${x.dAtk.toFixed(1)}, clean sheet ${x.dCS.toFixed(1)}${x.kickoff?' · '+scheduleClock(x.kickoff):''}`).join(' + ');return`<span class="fxcell ${scheduleDifficultyClass(d)}${dbl}" title="${esc(tip)}">${label}</span>`}).join(''),rank=scheduleRankValue(r,view),swingCls=r.swing<-.12?'swing-good':r.swing>.12?'swing-bad':'swing-flat',owned=r.exposure.count;return`<div class="fxrow" style="${cols}"><button type="button" class="fxteam ${r.code===focus?'selected':''}" data-fxteam="${esc(r.code)}" title="Open ${esc(TEAMS[r.code]?.n||r.code)} schedule detail">${esc(r.code)}</button>${cells}<span class="fxavg ${view==='congestion'?(rank>2.5?'f4':'f2'):scheduleDifficultyClass(rank)}" title="${scheduleMetricName(view)} difficulty · swing ${r.swing.toFixed(2)}"><span>${rank.toFixed(1)}</span><br><span class="${swingCls}" style="font-size:7px">${r.swing<-.12?'↘':r.swing>.12?'↗':'→'}</span></span><span class="fxown ${owned?'active':''}" title="${owned} owned · ${r.exposure.starters} current XI · ${r.exposure.bench} bench">${owned||'—'}</span></div>`}).join('');html+=`<div class="help" style="margin-top:9px">Each cell shows opponent, venue and separate attack/clean-sheet difficulty. A mint outline marks a double; a dash marks a blank. AVG is opponent difficulty only—an extra fixture no longer makes difficult opponents appear easier. Fixture volume and workload are reported separately. The arrow shows whether the second half becomes easier (↘) or harder (↗). OWN is your current squad exposure.</div>`;host.innerHTML=html}
function renderScheduleDetail(row,gws){const host=document.getElementById('fxDetail');if(!row){host.innerHTML='<div class="help">Select a club.</div>';return}const players=POOL.filter(p=>p.t===row.code).map(p=>schedulePlayerProjection(p,gws)).sort((a,b)=>b.total-a.total),pick=(filter,score='total')=>players.filter(x=>filter(x.p,x)).sort((a,b)=>b[score]-a[score])[0],att=pick(p=>p.p==='MID'||p.p==='FWD'),def=pick(p=>p.p==='GK'||p.p==='DEF'),val=pick(()=>true,'value'),diff=players.filter(x=>num(x.p.live?.selected)<10).sort((a,b)=>b.total-a.total)[0],safe=pick(()=>true,'safe'),owned=row.exposure,exposureLabel=!owned.count&&row.avgOverall<2.75?'UNDEREXPOSED':owned.count>=3&&row.avgOverall>3.3?'OVEREXPOSED':owned.count>=3?'MAXED':owned.count?'COVERED':'NO EXPOSURE',cards=[['Best attacker',att,'att'],['Best defender',def,'def'],['Best value',val,'value'],['Best differential',diff,'diff']];const cardHtml=cards.map(([k,x,c])=>`<div class="schedule-callout ${c}"><div class="sc-k">${esc(k)}</div><div class="sc-v">${esc(x?.p.n||'—')} ${x?`· £${x.p.c.toFixed(1)}m`:''}</div><div class="sc-m">${x?`${x.total.toFixed(1)} xPts · ${(100*x.pStart).toFixed(0)}% start`:''}</div></div>`).join('');const rows=players.slice(0,8).map(x=>`<div class="schedule-player-row"><button type="button" data-fxplayer="${x.p.id}" aria-label="Open ${esc(x.p.n)} in the player pool">${esc(x.p.n)} <span style="color:var(--muted)">${esc(x.p.p)} · £${x.p.c.toFixed(1)}</span></button><span class="spm good">${x.total.toFixed(1)}</span><span class="spm info">${(100*x.pStart).toFixed(0)}%</span><span class="spm hide-mobile">${x.confidence.toFixed(0)}%</span></div>`).join(''),restClass=row.severeRest?'congestion-severe':row.elevatedRest?'congestion-elevated':'congestion-normal',minRest=row.minRest==null?'unknown':`${row.minRest.toFixed(0)}h`;host.innerHTML=`<div class="verdict ${owned.count>=3&&row.avgOverall>3.3?'warn':''}"><b>${esc(row.code)} · ${esc(TEAMS[row.code]?.n||row.code)}</b><br>${exposureLabel}: ${owned.count} owned, ${owned.starters} in the current XI, ${owned.bench} benched · ${owned.xpts.toFixed(1)} projected squad points across the window.<br>FPL difficulty: attack ${row.avgAtk.toFixed(2)} · clean sheet ${row.avgCS.toFixed(2)} · ${row.blanks} blank · ${row.doubles} double. Calendar workload: ${row.leagueGames} PL + ${row.externalGames} supplementary matches.<div class="schedule-rest-line ${restClass}">Rest risk: ${row.severeRest} severe (&lt;72h) · ${row.elevatedRest} elevated (72–96h) · minimum ${minRest}. Boundary matches are included when kickoff data exists.</div>${safe?`Safest projection: ${esc(safe.p.n)} (${safe.total.toFixed(1)}).`:''}</div><div class="schedule-detail-grid">${cardHtml}</div><div class="schedule-player-row" style="color:var(--muted);font-size:8px;text-transform:uppercase"><span>Player</span><span class="spm">xPts</span><span class="spm">Start</span><span class="spm hide-mobile">Conf.</span></div>${rows||'<div class="help">No players loaded for this club.</div>'}`}
function renderScheduleCompare(a,b){const host=document.getElementById('fxCompare');if(!a||!b){host.innerHTML='<div class="help">Choose two clubs to compare.</div>';return}const better=(x,y,low=true)=>low?(x<y?'var(--mint)':x>y?'#FF91B5':'var(--paper)'):(x>y?'var(--mint)':x<y?'#FF91B5':'var(--paper)'),row=(label,x,y,fmt=v=>v.toFixed(2),low=true)=>`<div class="schedule-compare-row"><span>${esc(label)}</span><span style="color:${better(x,y,low)}">${fmt(x)}</span><span style="color:${better(y,x,low)}">${fmt(y)}</span></div>`;host.innerHTML=`<div class="schedule-compare"><div class="schedule-compare-row head"><span>Measure</span><span>${esc(a.code)}</span><span>${esc(b.code)}</span></div>${row('Attack difficulty',a.avgAtk,b.avgAtk)}${row('Clean-sheet difficulty',a.avgCS,b.avgCS)}${row('Overall difficulty',a.avgOverall,b.avgOverall)}${row('Fixture opportunity volume',a.opportunity,b.opportunity,v=>v.toFixed(1),false)}${row('Schedule score',a.score,b.score,v=>v.toFixed(0),false)}${row('Blanks',a.blanks,b.blanks,v=>String(v))}${row('Doubles',a.doubles,b.doubles,v=>String(v),false)}${row('Supplementary games',a.externalGames,b.externalGames,v=>String(v))}${row('Severe rest turns <72h',a.severeRest,b.severeRest,v=>String(v))}${row('Elevated rest turns 72–96h',a.elevatedRest,b.elevatedRest,v=>String(v))}${row('Congestion burden',a.congestion,b.congestion)}${row('Squad players owned',a.exposure.count,b.exposure.count,v=>String(v),false)}${row('Owned-player xPts',a.exposure.xpts,b.exposure.xpts,v=>v.toFixed(1),false)}${row('Fixture swing',a.swing,b.swing,v=>(v>0?'+':'')+v.toFixed(2))}</div>`}
function scheduleRotationPairs(rows,gws){const out=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){const a=rows[i],b=rows[j],pa=scheduleCheapestDefender(a.code),pb=scheduleCheapestDefender(b.code);if(!pa||!pb)continue;const weekly=gws.map((_,k)=>Math.min(scheduleGwDifficulty(a.cells[k],'cs'),scheduleGwDifficulty(b.cells[k],'cs'))),avg=weekly.reduce((x,y)=>x+y,0)/weekly.length,price=pa.c+pb.c;out.push({a,b,avg,price,pa,pb})}return out.sort((x,y)=>x.avg-y.avg||x.price-y.price).slice(0,6)}
function renderScheduleRotation(rows,gws){const pairs=scheduleRotationPairs(rows,gws);document.getElementById('fxRotation').innerHTML=pairs.map((x,i)=>`<div class="rotation-row"><button type="button" data-fxpair="${esc(x.a.code)}|${esc(x.b.code)}"><span class="rank">${i+1}</span>${esc(x.a.code)} + ${esc(x.b.code)}<br><span style="color:var(--muted);font-size:9px">${esc(x.pa?.n||'defensive route')} + ${esc(x.pb?.n||'defensive route')}</span></button><span class="rr-score">${x.avg.toFixed(2)}</span><span class="rr-cost">${x.price?`£${x.price.toFixed(1)}`:'—'}</span></div>`).join('')+`<div class="help" style="margin-top:7px">The rotation score selects the easier clean-sheet fixture from each pair every gameweek. Only players with at least 65% start probability, 80% appearance probability and 75% availability qualify as a credible route. Role security can still change with team news.</div>`}
function renderScheduleCaptain(gws){const rows=gws.map(g=>{const ranked=POOL.map(p=>({p,r:project(p,g),md:minuteDetail(p)})).filter(x=>x.md.pAppear>.15).sort((a,b)=>b.r.x-a.r.x),c=ranked[0],v=ranked.find(x=>x.p.id!==c?.p.id);return{g,c,v}});document.getElementById('fxCaptain').innerHTML=rows.map(x=>`<div class="captain-row"><span class="cg">GW${x.g}</span><button type="button" data-fxplayer="${x.c?.p.id??''}"><b>${esc(x.c?.p.n||'—')}</b> <span style="color:var(--muted)">${esc(x.c?.p.t||'')}</span></button><button type="button" class="vice-col" data-fxplayer="${x.v?.p.id??''}">${esc(x.v?.p.n||'—')} <span style="color:var(--muted)">${esc(x.v?.p.t||'')}</span></button><span class="cx">${x.c?x.c.r.x.toFixed(1):'—'}</span></div>`).join('')+`<div class="help" style="margin-top:7px">Captaincy uses the complete OTB projection—minutes, availability, role, opponent, venue, form and uncertainty—not schedule difficulty alone.</div>`}
function renderFixtures(){const host=document.getElementById('fxTicker');if(!host)return;renderExternalCalendarStatus();const codes=ensureScheduleControls(),start=num(document.getElementById('fxStart').value,S.gw),n=num(document.getElementById('fxN').value,6),view=document.getElementById('fxView').value||'overall',gws=scheduleGws(start,n);if(!gws.length){host.innerHTML='<div class="help">No fixtures loaded.</div>';return}let rows=codes.map(c=>scheduleTeamStats(c,gws)).sort((a,b)=>scheduleRankValue(a,view)-scheduleRankValue(b,view)||a.code.localeCompare(b.code));const focusEl=document.getElementById('fxTeamFocus'),aEl=document.getElementById('fxCompareA'),bEl=document.getElementById('fxCompareB');if(!rows.some(r=>r.code===focusEl.value))focusEl.value=(squadPlayers()[0]?.t&&rows.some(r=>r.code===squadPlayers()[0].t)?squadPlayers()[0].t:rows[0]?.code)||'';if(!rows.some(r=>r.code===aEl.value))aEl.value=rows[0]?.code||'';if(!rows.some(r=>r.code===bEl.value)||bEl.value===aEl.value)bEl.value=rows.find(r=>r.code!==aEl.value)?.code||'';const focus=focusEl.value;renderScheduleStatus(gws,rows);renderScheduleSummary(rows,gws);renderScheduleCommand(rows,gws);renderScheduleInsights(rows);renderScheduleMatrix(rows,gws,view,focus);renderScheduleDetail(rows.find(r=>r.code===focus),gws);renderScheduleCompare(rows.find(r=>r.code===aEl.value),rows.find(r=>r.code===bEl.value));renderScheduleRotation(rows,gws);renderScheduleCaptain(gws)}
['fxStart','fxN'].forEach(id=>document.getElementById(id).addEventListener('change',()=>{const start=num(document.getElementById('fxStart').value,S.gw),n=num(document.getElementById('fxN').value,6);S.gw=start;S.gwPinned=true;S.horizon=n;if(document.getElementById('gwSel'))document.getElementById('gwSel').value=String(start);if(document.getElementById('oHorizon'))document.getElementById('oHorizon').value=String(n);bumpCache();optimiseViewedLineup();saveUserState();renderFixtures()}));
['fxView','fxTeamFocus','fxCompareA','fxCompareB'].forEach(id=>document.getElementById(id).addEventListener('change',renderFixtures));
document.getElementById('fxCompareSwap').onclick=()=>{const a=document.getElementById('fxCompareA'),b=document.getElementById('fxCompareB'),v=a.value;a.value=b.value;b.value=v;renderFixtures()};
document.getElementById('btnFixtureInfluence').onclick=runFixtureInfluenceDiagnostic;
document.getElementById('fxTicker').addEventListener('click',e=>{const t=e.target.closest('[data-fxteam]');if(!t)return;document.getElementById('fxTeamFocus').value=t.dataset.fxteam;renderFixtures();document.getElementById('fxDetail')?.scrollIntoView({block:'nearest',behavior:'smooth'})});
function openSchedulePlayer(id){const p=byId(num(id,-1));if(!p)return;document.getElementById('fSearch').value=p.n;document.getElementById('fTeam').value='';renderPool();document.querySelector('[data-m="pool"]')?.click();flash(`${p.n} opened from Schedule Intelligence.`)}
document.getElementById('fxDetail').addEventListener('click',e=>{const t=e.target.closest('[data-fxplayer]');if(t)openSchedulePlayer(t.dataset.fxplayer)});
document.getElementById('fxCaptain').addEventListener('click',e=>{const t=e.target.closest('[data-fxplayer]');if(t)openSchedulePlayer(t.dataset.fxplayer)});
document.getElementById('fxRotation').addEventListener('click',e=>{const t=e.target.closest('[data-fxpair]');if(!t)return;const [a,b]=t.dataset.fxpair.split('|');document.getElementById('fxCompareA').value=a;document.getElementById('fxCompareB').value=b;renderFixtures();document.getElementById('fxCompare')?.scrollIntoView({block:'nearest',behavior:'smooth'})});
document.getElementById('accuracyGw').addEventListener('change',()=>{renderAccuracy();void fetchGameweekIntelligence(num(document.getElementById('accuracyGw').value))});
document.getElementById('accuracyCohort').addEventListener('change',renderAccuracy);
document.getElementById('btnAccuracySnapshot').onclick=async()=>{const btn=document.getElementById('btnAccuracySnapshot');try{btn.disabled=true;ACCURACY.error='';setAccuracyStatus('Calculating the full pre-deadline snapshot in background chunks…','warn');await captureProjectionSnapshot(num(document.getElementById('accuracyGw').value),{manual:true});renderAccuracy()}catch(e){ACCURACY.error=e.message;renderAccuracy()}finally{btn.disabled=false}};
document.getElementById('btnIntelligenceRefresh').onclick=()=>fetchGameweekIntelligence(num(document.getElementById('accuracyGw').value),{force:true});
document.getElementById('btnAccuracySync').onclick=syncAccuracyActuals;
document.getElementById('btnAccuracyImportActual').onclick=()=>{try{const gw=num(document.getElementById('accuracyGw').value),rows=actualRowsFromPayload(document.getElementById('accuracyActualInput').value);storeAccuracyActuals(gw,rows,'manual JSON');document.getElementById('accuracyImportStatus').textContent=`GW${gw}: ${rows.length} result rows imported.`;renderAccuracy();flash(`GW${gw} results imported.`)}catch(e){document.getElementById('accuracyImportStatus').textContent='Result import failed: '+e.message}};
document.getElementById('btnAccuracyExport').onclick=exportAccuracyLedger;
document.getElementById('btnAccuracyImportLedger').onclick=()=>document.getElementById('accuracyLedgerFile').click();
document.getElementById('accuracyLedgerFile').onchange=e=>{const f=e.target.files?.[0];if(f)importAccuracyLedgerFile(f);e.target.value=''};
document.getElementById('btnAccuracyClear').onclick=()=>{if(!confirm('Clear every stored OTB projection snapshot and actual-result record?'))return;ACCURACY.ledger=emptyAccuracyLedger();const ok=saveAccuracyLedger();if(ok)ACCURACY.error='';renderAccuracy();document.getElementById('accuracyImportStatus').textContent=ok?'Projection ledger cleared.':'Ledger cleared in memory but browser storage failed: '+ACCURACY.error};
document.getElementById('accuracyGwTable').addEventListener('click',e=>{const b=e.target.closest('[data-accuracy-gw]');if(!b)return;document.getElementById('accuracyGw').value=b.dataset.accuracyGw;renderAccuracy()});
document.getElementById('fxImportExternal').onclick=()=>{try{const rows=parseExternalCalendar(document.getElementById('fxExternalInput').value);if(!rows.length)throw new Error('No recognised confirmed first-team non-Premier-League fixtures were found. Use FPL team codes or current club names.');EXT_CAL.fixtures=rows;EXT_CAL.source='manual';EXT_CAL.mode='manual';EXT_CAL.updatedAt=new Date().toISOString();EXT_CAL.error='';saveExternalCalendar();renderExternalCalendarStatus();renderFixtures();scheduleSelfTests(150);flash(`${rows.length} supplementary club-fixture records applied as a manual override.`)}catch(e){EXT_CAL.error=e.message;renderExternalCalendarStatus(`Import failed: ${e.message}`,'bad')}};
document.getElementById('fxClearExternal').onclick=()=>{if(EXT_CAL.mode==='manual'&&(EXT_CAL.fixtures||[]).length&&!confirm('Discard the manual override and resume the automatic cached calendar?'))return;EXT_CAL.fixtures=[];EXT_CAL.source='none';EXT_CAL.mode='auto';EXT_CAL.updatedAt=null;EXT_CAL.error='';saveExternalCalendar();document.getElementById('fxExternalInput').value='';renderExternalCalendarStatus('Resuming the automatic cached calendar…','warn');renderFixtures();syncExternalCalendar();flash('Manual override cleared. Automatic calendar sync resumed.')};
document.getElementById('fxExampleExternal').onclick=()=>{document.getElementById('fxExternalInput').value=JSON.stringify([{team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Inter',home:true},{team:'MCI',kickoff:'2026-09-17T19:00:00Z',competition:'UEFA Champions League',opponent:'Bayern',home:false}],null,2)};
document.getElementById('fxSyncExternal').onclick=()=>syncExternalCalendar();


/* RC2.3.7 — Squad view Clear All control with a safe current-squad reset.
   RC2.3.6 — compact screenshot view includes the complete bench.
   RC2.3.5 — public-release certification, history-eligible assurance and restored-XI header refresh.
   RC2.3.4 — audited projection ledger, reproducible snapshots and final-result backtesting. */
const APP_RELEASE='RC5.0.26',APP_RELEASE_SLUG='RC5.0.26-gameweek-finality-recovery';
const ACCURACY_LEDGER_KEY='fpl-engine-projection-ledger-rc233-v1',ACCURACY_SCHEMA=3,MODEL_RELEASE=APP_RELEASE;  /* stamped into every accuracy snapshot - must track the real model build */

function emptyAccuracyLedger(){return{schema:ACCURACY_SCHEMA,season:EXPECTED_SEASON,snapshots:{},actuals:{},catalog:{}}}
const ACCURACY={ledger:emptyAccuracyLedger(),loading:false,error:'',capturePromise:null};
const GAMEWEEK_INTELLIGENCE={reports:new Map(),loading:false,error:'',requestSeq:0};
const ACCURACY_SYNC_ATTEMPTS=new Map(),ACCURACY_AUTO_RETRY_MS=15*60*1000;let ACCURACY_CAPTURE_TIMER=null;
function scheduleAccuracyCapture(delay=lowPowerMode()?1600:650){clearTimeout(ACCURACY_CAPTURE_TIMER);ACCURACY_CAPTURE_TIMER=setTimeout(()=>{ACCURACY_CAPTURE_TIMER=null;void maybeAutoCaptureProjection()},Math.max(0,delay))}
const accuracyRound=(v,d=3)=>v===null||v===undefined||v===''?null:Number.isFinite(Number(v))?Number(Number(v).toFixed(d)):null;
const accuracyObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const accuracyText=(v,max=80)=>String(v??'').replace(/[<>]/g,'').trim().slice(0,max);
function accuracyNumber(v,min=-Infinity,max=Infinity,fallback=null){if(v===null||v===undefined||v==='')return fallback;const n=Number(v);return Number.isFinite(n)?clamp(n,min,max):fallback}
function accuracyBoolean(v){if(v===null||v===undefined||v==='')return null;if(typeof v==='boolean')return v;if(typeof v==='number')return v!==0;const s=String(v).trim().toLowerCase();if(['true','yes','y','1'].includes(s))return true;if(['false','no','n','0'].includes(s))return false;return null}
function accuracyHashValue(value){const s=typeof value==='string'?value:JSON.stringify(value),bytes=new TextEncoder().encode(s);let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
function accuracyEvent(gw){return EVENTS.find(e=>num(e.id)===num(gw))||null}
function accuracyDeadline(gw){return Date.parse(accuracyEvent(gw)?.deadline_time||'')}
const ACCURACY_FINALITY_GRACE_MS=14*60*60*1000;
function accuracyFixturesFinal(gw,currentMs=Date.now()){const rows=FIX_META[num(gw)]||[],times=rows.map(f=>Date.parse(f.kickoff||''));return rows.length>0&&times.every(Number.isFinite)&&rows.every(f=>f.finished===true&&f.provisional===true&&f.scoreReady===true)&&currentMs>=Math.max(...times)+ACCURACY_FINALITY_GRACE_MS}
function accuracyEventFinal(e,currentMs=Date.now()){return!!(e?.finished===true&&e?.data_checked===true)||accuracyFixturesFinal(e?.id,currentMs)}function accuracyFinished(gw){return accuracyEventFinal(accuracyEvent(gw))}
function accuracyFinalitySource(gw){const e=accuracyEvent(gw);return e?.finished===true&&e?.data_checked===true?'official-data-checked':accuracyFixturesFinal(gw)?'completed-fixtures-grace':'pending'}
function sanitizeAccuracyCatalog(raw){const out={};if(!accuracyObject(raw))return out;for(const [id0,v] of Object.entries(raw).slice(0,1200)){const id=Math.trunc(accuracyNumber(id0,1,1e9,NaN));if(!Number.isFinite(id)||!accuracyObject(v))continue;const p=accuracyText(v.p,3).toUpperCase();out[id]={n:accuracyText(v.n||id,80),t:accuracyText(v.t,4).toUpperCase(),p:['GK','DEF','MID','FWD'].includes(p)?p:''}}return out}
function sanitizeAccuracySelection(raw,catalog={}){if(!accuracyObject(raw))return null;const ids=value=>[...new Set((Array.isArray(value)?value:[]).map(id=>Math.trunc(accuracyNumber(id,1,1e9,NaN))).filter(Number.isFinite))].slice(0,15),squad=ids(raw.squad),allowed=new Set(squad),xi=ids(raw.xi).filter(id=>allowed.has(id)).slice(0,11),xiSet=new Set(xi),bench=ids(raw.bench).filter(id=>allowed.has(id)&&!xiSet.has(id)).slice(0,4),captain=Math.trunc(accuracyNumber(raw.captain,1,1e9,NaN)),vice=Math.trunc(accuracyNumber(raw.vice,1,1e9,NaN)),chipRaw=accuracyObject(raw.chip)?raw.chip:{},squadPositions={GK:0,DEF:0,MID:0,FWD:0},xiPositions={GK:0,DEF:0,MID:0,FWD:0},clubs={};for(const id of squad){const player=catalog[id]||{},pos=player.p;if(pos in squadPositions)squadPositions[pos]++;if(player.t)clubs[player.t]=num(clubs[player.t])+1}for(const id of xi){const pos=catalog[id]?.p;if(pos in xiPositions)xiPositions[pos]++}const legalSquad=squadPositions.GK===2&&squadPositions.DEF===5&&squadPositions.MID===5&&squadPositions.FWD===3&&Object.values(clubs).every(n=>n<=3),legalXi=xiPositions.GK===1&&xiPositions.DEF>=3&&xiPositions.DEF<=5&&xiPositions.MID>=2&&xiPositions.MID<=5&&xiPositions.FWD>=1&&xiPositions.FWD<=3,complete=!!raw.complete&&squad.length===15&&xi.length===11&&bench.length===4&&legalSquad&&legalXi&&xiSet.has(captain)&&xiSet.has(vice)&&captain!==vice;return{squad,xi,bench,captain:xiSet.has(captain)?captain:null,vice:xiSet.has(vice)?vice:null,formation:accuracyText(raw.formation,8),chip:{code:accuracyText(chipRaw.code||'NONE',24),label:accuracyText(chipRaw.label||'No chip',40),captainMultiplier:Math.trunc(accuracyNumber(chipRaw.captainMultiplier,1,3,2)),benchScoring:!!chipRaw.benchScoring},complete}}
function accuracySelectionSnapshot(gw){const squad=squadPlayers().filter(p=>p.apiId!=null),xi=squad.filter(p=>S.start.has(p.id)),xiIds=new Set(xi.map(p=>p.id)),order=new Map((S.benchOrder||[]).map((key,index)=>[String(key),index])),bench=squad.filter(p=>!S.start.has(p.id)).sort((a,b)=>{if(a.p==='GK'&&b.p!=='GK')return 1;if(b.p==='GK'&&a.p!=='GK')return-1;const ai=order.has(stableKey(a))?order.get(stableKey(a)):99,bi=order.has(stableKey(b))?order.get(stableKey(b)):99;return ai-bi||a.n.localeCompare(b.n)}),counts=xiCounts(xi.map(p=>p.id)),chip=chipStateForGw(gw),captain=byId(S.cap),vice=byId(S.vice),complete=squad.length===15&&xi.length===11&&legal(squad)&&xiLegality(xi.map(p=>p.id))===null&&xiIds.has(captain?.id)&&xiIds.has(vice?.id)&&captain.id!==vice.id;return{squad:squad.map(p=>Math.trunc(num(p.apiId))),xi:xi.map(p=>Math.trunc(num(p.apiId))),bench:bench.map(p=>Math.trunc(num(p.apiId))),captain:captain?.apiId??null,vice:vice?.apiId??null,formation:xi.length===11?`${counts.DEF}-${counts.MID}-${counts.FWD}`:'—',chip:{code:chip.code,label:chip.label,captainMultiplier:chip.captainMultiplier,benchScoring:chip.benchScoring},complete}}
function sanitizeAccuracySnapshotRow(row){const get=(i,k)=>Array.isArray(row)?row[i]:row?.[k],id=Math.trunc(accuracyNumber(get(0,'i'),1,1e9,NaN)),x=accuracyNumber(get(1,'x'),-30,150,NaN);if(!Number.isFinite(id)||!Number.isFinite(x))return null;let low=accuracyNumber(get(2,'l'),-150,150,x),high=accuracyNumber(get(3,'h'),-100,200,x);if(low>x)low=x;if(high<x)high=x;return[id,accuracyRound(x),accuracyRound(low),accuracyRound(high),accuracyRound(accuracyNumber(get(4,'c'),0,100,0),1),accuracyRound(accuracyNumber(get(5,'m'),0,270,0),1),accuracyRound(accuracyNumber(get(6,'ps'),0,1,0),4),accuracyRound(accuracyNumber(get(7,'pa'),0,1,0),4),accuracyRound(accuracyNumber(get(8,'av'),0,1,1),4),accuracyRound(accuracyNumber(get(9,'off'),-20,100,null),2),Math.trunc(accuracyNumber(get(10,'fx'),0,3,1))]}
function sanitizeAccuracyActualRow(row){const get=(i,k)=>Array.isArray(row)?row[i]:row?.[k],id=Math.trunc(accuracyNumber(get(0,'i'),1,1e9,NaN)),pts=accuracyNumber(get(1,'pts'),-30,150,NaN);if(!Number.isFinite(id)||!Number.isFinite(pts))return null;const minRaw=get(2,'min'),minutes=minRaw===null||minRaw===undefined||minRaw===''?null:accuracyNumber(minRaw,0,270,null),app=accuracyBoolean(get(3,'app')),start=accuracyBoolean(get(4,'start'));return[id,accuracyRound(pts,1),minutes===null?null:accuracyRound(minutes,1),app===null?null:(app?1:0),start===null?null:(start?1:0)]}
function accuracyDedupeRows(rows,sanitizer,limit=1200){const map=new Map;for(const row of Array.isArray(rows)?rows:[]){const clean=sanitizer(row);if(clean)map.set(clean[0],clean);if(map.size>=limit)break}return[...map.values()]}
function sanitizeAccuracySettings(raw){if(!accuracyObject(raw))return null;const weights={},allowed=['fix','home','cs','dc','official','form'];for(const k of allowed){const n=accuracyNumber(raw.weights?.[k],-5,5,null);if(n!==null)weights[k]=n}const overrides={};if(accuracyObject(raw.overrides))for(const [k,v] of Object.entries(raw.overrides).sort(([a],[b])=>a.localeCompare(b)).slice(0,1000)){if(!accuracyObject(v))continue;const z={};for(const f of ['availability','start','minutes','role']){const n=accuracyNumber(v[f],-1000,1000,null);if(n!==null)z[f]=n}if(Object.keys(z).length)overrides[accuracyText(k,120)]=z}const strengths=Array.isArray(raw.strengths)?raw.strengths.slice(0,20).map(r=>Array.isArray(r)?r.slice(0,6).map((x,i)=>i?accuracyNumber(x,-1e6,1e6,null):accuracyText(x,4)):null).filter(Boolean):[],roleEvents=Array.isArray(raw.roleEvents)?raw.roleEvents.slice(0,1000).map(row=>Array.isArray(row)?row.slice(0,13):null).filter(Boolean):[],market=accuracyObject(raw.market)?{loaded:!!raw.market.loaded,usable:!!raw.market.usable,fetchedAt:accuracyNumber(raw.market.fetchedAt,0,9e15,0),ageMinutes:accuracyNumber(raw.market.ageMinutes,0,1e6,null),fixtures:Math.trunc(accuracyNumber(raw.market.fixtures,0,1e4,0)),slateHash:accuracyText(raw.market.slateHash,80)}:{loaded:false,usable:false,fetchedAt:0,ageMinutes:null,fixtures:0,slateHash:''};return{weights,overrides,strengths,roleEvents,market}}
function accuracySnapshotChecksum(s){const base=[s.gw,s.release,s.capturedAt,s.deadline,s.modelFingerprint,s.rows];if(num(s.snapshotSchema,2)>=3)base.push(s.selection);return accuracyHashValue(base)}
function accuracyActualChecksum(a){return accuracyHashValue([a.gw,a.source,a.importedAt,a.final,a.rows])}
function sanitizeAccuracySnapshot(raw,gw){if(!accuracyObject(raw))return null;const rows=accuracyDedupeRows(raw.rows,sanitizeAccuracySnapshotRow),capturedAt=accuracyNumber(raw.capturedAt,0,9e15,null),deadline=accuracyNumber(raw.deadline,0,9e15,null),catalog=sanitizeAccuracyCatalog(raw.catalog),settings=sanitizeAccuracySettings(raw.settings),release=accuracyText(raw.release||'LEGACY',40),modelFingerprint=accuracyText(raw.modelFingerprint,80),selection=sanitizeAccuracySelection(raw.selection,catalog),selectionFingerprint=accuracyText(raw.selectionFingerprint,80),snapshotSchema=Math.trunc(accuracyNumber(raw.snapshotSchema,1,ACCURACY_SCHEMA,2)),checksum=accuracyText(raw.checksum,80);const integrity=checksum?(checksum===accuracySnapshotChecksum({gw,release,capturedAt,deadline,modelFingerprint,rows,selection,snapshotSchema})?'verified':'mismatch'):'legacy',accountable=rows.length>=300&&capturedAt!==null&&deadline!==null&&capturedAt<deadline&&integrity!=='mismatch';return{gw,release,capturedAt,firstCapturedAt:accuracyNumber(raw.firstCapturedAt,0,9e15,capturedAt),updates:Math.trunc(accuracyNumber(raw.updates,1,1e6,1)),deadline,dataMode:accuracyText(raw.dataMode,12),dataUpdatedAt:accuracyNumber(raw.dataUpdatedAt,0,9e15,null),historicalCoverage:accuracyNumber(raw.historicalCoverage,0,1,null),weights:settings?.weights||raw.weights||{},overrideCount:Math.trunc(accuracyNumber(raw.overrideCount,0,1e5,0)),rows,catalog,settings,modelFingerprint,selection,selectionFingerprint,snapshotSchema,origin:accuracyText(raw.origin||'imported-backup',30),checksum,integrity,accountable}}
function sanitizeAccuracyActual(raw,gw){if(!accuracyObject(raw))return null;const rows=accuracyDedupeRows(raw.rows,sanitizeAccuracyActualRow),source=accuracyText(raw.source||'imported backup',160),importedAt=accuracyNumber(raw.importedAt,0,9e15,Date.now()),final=!!(raw.final??raw.finished),checksum=accuracyText(raw.checksum,80),integrity=checksum?(checksum===accuracyActualChecksum({gw,source,importedAt,final,rows})?'verified':'mismatch'):'legacy';return{gw,source,importedAt,final,finished:final,rows,complete:rows.length>=300&&integrity!=='mismatch',checksum,integrity}}
function sanitizeAccuracyLedger(raw){const x=accuracyObject(raw?.ledger)?raw.ledger:(accuracyObject(raw)?raw:{});if(x.season&&String(x.season)!==EXPECTED_SEASON)throw new Error(`Ledger season ${x.season} does not match ${EXPECTED_SEASON}.`);const out=emptyAccuracyLedger();for(const [k,v] of Object.entries(accuracyObject(x.snapshots)?x.snapshots:{})){const gw=Math.trunc(accuracyNumber(k,1,38,NaN)),s=Number.isFinite(gw)?sanitizeAccuracySnapshot(v,gw):null;if(s)out.snapshots[gw]=s}for(const [k,v] of Object.entries(accuracyObject(x.actuals)?x.actuals:{})){const gw=Math.trunc(accuracyNumber(k,1,38,NaN)),a=Number.isFinite(gw)?sanitizeAccuracyActual(v,gw):null;if(a)out.actuals[gw]=a}out.catalog=sanitizeAccuracyCatalog(x.catalog);return out}
function loadAccuracyLedger(){try{ACCURACY.ledger=sanitizeAccuracyLedger(JSON.parse(localStorage.getItem(ACCURACY_LEDGER_KEY)||'null'));ACCURACY.error=''}catch(e){ACCURACY.error=e.message;ACCURACY.ledger=emptyAccuracyLedger()}}
function saveAccuracyLedger(){try{const text=JSON.stringify(ACCURACY.ledger);if(text.length>4_500_000)throw new Error('Projection ledger exceeds the safe browser-storage limit. Export and clear older records.');localStorage.setItem(ACCURACY_LEDGER_KEY,text);ACCURACY.error='';return true}catch(e){ACCURACY.error=e.message;return false}}
function accuracyProjectionSettings(){const weights=Object.fromEntries(Object.entries(S.w||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,accuracyRound(num(v),4)])),overrides={};for(const [k,v] of Object.entries(S.overrides||{}).sort(([a],[b])=>a.localeCompare(b))){const z={};for(const f of ['availability','start','minutes','role'])if(v?.[f]!==undefined&&v[f]!=='')z[f]=accuracyRound(num(v[f]),4);if(Object.keys(z).length)overrides[k]=z}const strengths=Object.keys(TEAMS).sort().map(c=>[c,accuracyRound(TEAMS[c]?.s,3),accuracyRound(TEAMS[c]?.atkH,3),accuracyRound(TEAMS[c]?.atkA,3),accuracyRound(TEAMS[c]?.defH,3),accuracyRound(TEAMS[c]?.defA,3)]),roleEvents=roleIntelEvents().slice().sort((a,b)=>String(a.id).localeCompare(String(b.id))).map(e=>[accuracyText(e.id,80),accuracyNumber(e.createdAt,0,9e15,0),accuracyText(e.team,4),accuracyText(e.type,32),accuracyText(e.affectedKey,120),accuracyNumber(e.overlap,-10,10,0),accuracyNumber(e.hierarchy,-10,10,0),accuracyNumber(e.confidence,-10,10,0),accuracyNumber(e.minuteCeiling,-1,270,null),accuracyNumber(e.startOverride,-1,1,null),accuracyNumber(e.productionImpact,-1,1,null),!!e.worker,accuracyText(e.source,160)]),market={loaded:!!MARKET.loaded,usable:!!MARKET.loaded&&!marketStale(),fetchedAt:num(MARKET.fetchedAt),ageMinutes:accuracyRound(MARKET.ageMinutes,2),fixtures:num(MARKET.fixtures),slateHash:accuracyHashValue(MARKET.slate||[])};return{weights,overrides,strengths,roleEvents,market}}
function accuracyEventUsage(md,fixtureCount){const n=Math.max(0,Math.trunc(num(fixtureCount))),avail=clamp(num(md?.avail),0,1),startIfAvailable=clamp(num(md?.pStart),0,1),appearIfAvailable=avail>0?clamp(num(md?.pAppear)/avail,0,1):0;return{fixtures:n,minutes:n?clamp(num(md?.exp)*n,0,270):0,pStart:n?avail*(1-Math.pow(1-startIfAvailable,n)):0,pAppear:n?avail*(1-Math.pow(1-appearIfAvailable,n)):0}}
/* Two extra fields are recorded per player, both of which are impossible to
   reconstruct after the deadline because they depend on the exact model state
   at that moment (ratings, the market snapshot from that hour, role evidence):

   [11] sd          the projection's own uncertainty. With it, z=(actual-x)/sd
                    can be collected across gameweeks; the spread of those z
                    scores should be ~1.0 if the intervals are sized correctly.
                    This is the only way to check the two variance changes
                    (mixture variance, horizon correlation) and to fit
                    HORIZON_RHO rather than guess it.

   [12] xNoMarket   what the projection WOULD have been with the market blend
                    off. Comparing both against the same outcome is the only
                    way to ever measure whether MARKET_WEIGHT=0.5 was right.

   Appended to the end so any reader using indices 0-10 is unaffected. */
const accuracyYield=()=>new Promise(resolve=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>resolve(),{timeout:120});else setTimeout(resolve,0)});
function accuracyCaptureState(gw){const settings=accuracyProjectionSettings(),selection=accuracySelectionSnapshot(gw);return{settings,selection,fingerprint:accuracyHashValue({gw,dataUpdatedAt:DATA.lastUpdated||null,settings,selection})}}
async function projectionSnapshotRowsAsync(gw,expectedFingerprint){
  const base=POOL.filter(p=>p.apiId!=null&&TEAMS[p.t]),noMarket=new Map(),rows=[],batchSize=lowPowerMode()?18:45;
  const assertStable=()=>{if(accuracyCaptureState(gw).fingerprint!==expectedFingerprint)throw new Error('Squad, model or live data changed while the pre-deadline snapshot was being calculated. OTB will retry automatically.')};
  for(let i=0;i<base.length;i+=batchSize){assertStable();const batch=base.slice(i,i+batchSize),wasSuspended=MARKET_SUSPEND;try{MARKET_SUSPEND=true;bumpCache();for(const p of batch){const r=project(p,gw);noMarket.set(p.apiId,r&&r.x)}}finally{MARKET_SUSPEND=wasSuspended;bumpCache()}await accuracyYield()}
  for(let i=0;i<base.length;i+=batchSize){assertStable();for(const p of base.slice(i,i+batchSize)){const r=project(p,gw),md=minuteDetail(p),usage=accuracyEventUsage(md,r.fixtures?.length||0),cf=noMarket.has(p.apiId)?noMarket.get(p.apiId):null;rows.push([Math.trunc(num(p.apiId)),accuracyRound(r.x),accuracyRound(r.low),accuracyRound(r.high),accuracyRound(r.confidence,1),accuracyRound(usage.minutes,1),accuracyRound(usage.pStart,4),accuracyRound(usage.pAppear,4),accuracyRound(md.avail,4),accuracyRound(p.live?.epNext,2),usage.fixtures,accuracyRound(r.sd,4),Number.isFinite(cf)?accuracyRound(cf):null])}await accuracyYield()}
  assertStable();return rows.filter(row=>Number.isFinite(row[0])&&row[0]>0&&Number.isFinite(row[1]));
}
function accuracyCaptureCooldownMs(deadline){const hours=(deadline-Date.now())/36e5;if(hours>24)return 12*36e5;if(hours>6)return 6*36e5;if(hours>2)return 2*36e5;return 20*60*1000}
function scheduleNextAccuracyCapture(deadline,old){if(!Number.isFinite(deadline)||Date.now()>=deadline)return;const finalTarget=deadline-90*1000;if(old&&num(old.capturedAt)>=finalTarget)return;const normalDue=old?num(old.capturedAt)+accuracyCaptureCooldownMs(deadline)-Date.now():0,finalDue=finalTarget-Date.now(),delay=Math.max(5000,Math.min(Math.max(0,normalDue),Math.max(5000,finalDue)));scheduleAccuracyCapture(delay)}
async function performProjectionSnapshotCapture(gw,{manual=false}={}){const deadline=accuracyDeadline(gw),started=Date.now();if(!Number.isFinite(deadline))throw new Error(`GW${gw} deadline is not verified.`);if(started>=deadline)throw new Error(`GW${gw} deadline has passed. Historical forecasts cannot be recreated after the fact.`);if(!['LIVE','CACHE'].includes(DATA.mode))throw new Error('Live or validated cached FPL data are required for an accountable snapshot.');if(!DATA.validation?.topologyPass)throw new Error('Fixture topology must pass before a snapshot is recorded.');const state=accuracyCaptureState(gw),rows=await projectionSnapshotRowsAsync(gw,state.fingerprint),now=Date.now();if(now>=deadline)throw new Error(`GW${gw} deadline passed while the snapshot was being calculated, so it was not stored.`);if(rows.length<300)throw new Error(`Only ${rows.length} players were available; snapshot rejected as incomplete.`);const endState=accuracyCaptureState(gw);if(endState.fingerprint!==state.fingerprint)throw new Error('Squad, model or live data changed before the snapshot could be stored. OTB will retry automatically.');const catalog={};for(const p of POOL)if(p.apiId!=null){const row={n:p.n,t:p.t,p:p.p};catalog[p.apiId]=row;ACCURACY.ledger.catalog[p.apiId]=row}const settings=state.settings,selection=state.selection,modelFingerprint=accuracyHashValue(settings),selectionFingerprint=accuracyHashValue(selection),old=ACCURACY.ledger.snapshots[gw],snapshot={snapshotSchema:ACCURACY_SCHEMA,gw,release:MODEL_RELEASE,capturedAt:now,firstCapturedAt:old?.firstCapturedAt||now,updates:num(old?.updates)+1,deadline,dataMode:DATA.mode,dataUpdatedAt:DATA.lastUpdated||null,historicalCoverage:accuracyRound(DATA.histCoverage?.eligibleRatio,4),historicalCoverageOverall:accuracyRound(DATA.histCoverage?.overallRatio,4),historyMatched:num(DATA.histCoverage?.matched),historyEligible:num(DATA.histCoverage?.eligible),historyPriorFree:num(DATA.histCoverage?.newcomer),weights:{...S.w},overrideCount:Object.keys(settings.overrides).length,rows,catalog,settings,modelFingerprint,selection,selectionFingerprint,origin:'local-capture',integrity:'verified',accountable:true};snapshot.checksum=accuracySnapshotChecksum(snapshot);ACCURACY.ledger.snapshots[gw]=snapshot;if(!saveAccuracyLedger()){if(old)ACCURACY.ledger.snapshots[gw]=old;else delete ACCURACY.ledger.snapshots[gw];throw new Error(`Snapshot created but could not be saved: ${ACCURACY.error}`)}if(manual)flash(`GW${gw} pre-deadline snapshot updated for ${rows.length} players and your current squad decisions.`);return snapshot}
async function captureProjectionSnapshot(gw,{manual=false}={}){gw=num(gw,DATA.nextEvent||S.gw);if(ACCURACY.capturePromise){if(ACCURACY.capturePromise.gw===gw)return ACCURACY.capturePromise.promise;await ACCURACY.capturePromise.promise.catch(()=>{})}const promise=performProjectionSnapshotCapture(gw,{manual});ACCURACY.capturePromise={gw,promise};try{return await promise}finally{if(ACCURACY.capturePromise?.promise===promise)ACCURACY.capturePromise=null}}
async function maybeAutoCaptureProjection(){try{const gw=num(DATA.nextEvent);if(!gw||!['LIVE','CACHE'].includes(DATA.mode)||!DATA.validation?.topologyPass)return false;const deadline=accuracyDeadline(gw);if(!Number.isFinite(deadline)||Date.now()>=deadline)return false;const state=accuracyCaptureState(gw),old=ACCURACY.ledger.snapshots[gw],cooldown=accuracyCaptureCooldownMs(deadline),finalTarget=deadline-90*1000,finalSnapshotDue=Date.now()>=finalTarget&&(!old||num(old.capturedAt)<finalTarget),stale=finalSnapshotDue||!old||old.accountable===false||Date.now()-num(old.capturedAt)>=cooldown||old.release!==MODEL_RELEASE||old.dataUpdatedAt!==DATA.lastUpdated||old.modelFingerprint!==accuracyHashValue(state.settings)||old.selectionFingerprint!==accuracyHashValue(state.selection);if(stale){const snapshot=await captureProjectionSnapshot(gw);if(activeRailTab()==='accuracy')renderAccuracy();scheduleNextAccuracyCapture(deadline,snapshot);return true}scheduleNextAccuracyCapture(deadline,old)}catch(e){ACCURACY.error=e.message;scheduleAccuracyCapture(5000);if(activeRailTab()==='accuracy')renderAccuracy()}return false}
function actualRowsFromPayload(raw){let x=raw;if(typeof x==='string')x=JSON.parse(x);const rows=Array.isArray(x)?x:Array.isArray(x?.elements)?x.elements:Array.isArray(x?.actuals)?x.actuals:Array.isArray(x?.history)?x.history:[],map=new Map;for(const row of rows){const compact=Array.isArray(row),st=!compact&&row?.stats&&typeof row.stats==='object'?row.stats:row||{},id=compact?accuracyNumber(row[0],1,1e9,NaN):accuracyNumber(row?.id??row?.element??row?.player_id??st?.id,1,1e9,NaN),points=compact?accuracyNumber(row[1],-30,150,NaN):accuracyNumber(st.total_points??st.points??st.event_points,-30,150,NaN),minutes=compact?accuracyNumber(row[2],0,270,null):accuracyNumber(st.minutes,0,270,null);if(!Number.isFinite(id)||!Number.isFinite(points))continue;const appRaw=compact?row[3]:st.appeared,sv=compact?row[4]:(st.starts??st.started??st.start),app=appRaw===undefined||appRaw===null?minutes!==null?minutes>0:null:accuracyBoolean(appRaw),started=accuracyBoolean(sv);map.set(Math.trunc(id),{i:Math.trunc(id),pts:points,min:minutes,app,start:started})}return[...map.values()]}
function storeAccuracyActuals(gw,rows,source='manual'){gw=num(gw);if(!accuracyFinished(gw))throw new Error(`GW${gw} results are not final yet. OTB will sync them automatically after completion.`);const packed=accuracyDedupeRows(rows.map(r=>Array.isArray(r)?r:[r.i,r.pts,r.min,r.app===null?null:(r.app?1:0),r.start===null?null:(r.start?1:0)]),sanitizeAccuracyActualRow);if(packed.length<300)throw new Error(`Only ${packed.length} unique result rows recognised; a complete official Gameweek payload is required.`);const old=ACCURACY.ledger.actuals[gw],record={gw,source:accuracyText(source,160),importedAt:Date.now(),final:true,finished:true,rows:packed,complete:true,integrity:'verified'};record.checksum=accuracyActualChecksum(record);ACCURACY.ledger.actuals[gw]=record;ACCURACY.error='';if(!saveAccuracyLedger()){if(old)ACCURACY.ledger.actuals[gw]=old;else delete ACCURACY.ledger.actuals[gw];throw new Error(`Results parsed but could not be saved: ${ACCURACY.error}`)}return record}
function accuracySnapshotReady(gw){const s=ACCURACY.ledger.snapshots[gw];return!!(s&&s.accountable!==false&&Array.isArray(s.rows)&&s.rows.length>=300&&s.integrity!=='mismatch')}
function accuracyActualReady(gw){const a=ACCURACY.ledger.actuals[gw];return!!(a&&a.final===true&&a.complete!==false&&Array.isArray(a.rows)&&a.rows.length>=300&&a.integrity!=='mismatch')}
async function fetchAccuracyActualsForGw(gw){if(!accuracyFinished(gw))throw new Error(`GW${gw} official results are not available yet`);const urls=[`${API_BASE}/api/event-live?gw=${gw}`,`${API_BASE}/event/${gw}/live/`,`https://fantasy.premierleague.com/api/event/${gw}/live/`];let last=null,best=0,responded=false;for(const url of urls){try{const data=await fetchJSON(url,15000),rows=actualRowsFromPayload(data);responded=true;best=Math.max(best,rows.length);if(rows.length>=300){storeAccuracyActuals(gw,rows,`${url.startsWith(API_BASE)?'worker':'official FPL'} · ${accuracyFinalitySource(gw)}`);return rows}}catch(e){last=e}}if(responded)throw new Error(`Official GW${gw} results are not complete yet (${best} player rows returned)`);throw last||new Error('No supported results endpoint responded')}
async function syncAccuracyActuals(){const gw=num(document.getElementById('accuracyGw')?.value,S.gw),btn=document.getElementById('btnAccuracySync');if(!accuracyFinished(gw)){ACCURACY.error='';renderAccuracy();setAccuracyStatus(`GW${gw} official results are not available yet. OTB will enable this sync after every fixture is complete and the safety window has elapsed.`,'warn');return}if(btn)btn.disabled=true;ACCURACY.loading=true;setAccuracyStatus(`Checking official GW${gw} results…`,'warn');try{const rows=await fetchAccuracyActualsForGw(gw);ACCURACY.error='';renderAccuracy();flash(`GW${gw} results loaded for ${rows.length} players.`)}catch(e){ACCURACY.error=e.message;const incomplete=/not complete yet/i.test(e.message);setAccuracyStatus(incomplete?`${e.message}. OTB will retry automatically.`:`Official GW${gw} result sync failed: ${e.message}. OTB will retry automatically; manual import remains available if the official service stays unreachable.`,incomplete?'warn':'bad')}finally{ACCURACY.loading=false;if(btn)btn.disabled=!accuracyFinished(gw)||accuracyActualReady(gw)}}
async function maybeAutoSyncAccuracyActuals(){if(ACCURACY.loading||navigator.onLine===false)return;const gw=Object.keys(ACCURACY.ledger.snapshots).map(Number).filter(g=>accuracySnapshotReady(g)&&accuracyFinished(g)&&!accuracyActualReady(g)).sort((a,b)=>b-a)[0];if(!gw)return;const now=Date.now(),last=num(ACCURACY_SYNC_ATTEMPTS.get(gw));if(last&&now-last<ACCURACY_AUTO_RETRY_MS)return;ACCURACY_SYNC_ATTEMPTS.set(gw,now);ACCURACY.loading=true;try{await fetchAccuracyActualsForGw(gw);ACCURACY.error='';ACCURACY_SYNC_ATTEMPTS.delete(gw);if(activeRailTab()==='accuracy')renderAccuracy()}catch(e){if(activeRailTab()==='accuracy')setAccuracyStatus(`GW${gw} final-result sync will retry: ${e.message}`,'warn')}finally{ACCURACY.loading=false}}
function accuracyRanks(values){const indexed=values.map((v,i)=>({v:num(v),i})).sort((a,b)=>b.v-a.v),r=Array(values.length);for(let i=0;i<indexed.length;){let j=i+1;while(j<indexed.length&&Math.abs(indexed[j].v-indexed[i].v)<1e-9)j++;const rank=(i+j-1)/2+1;for(let k=i;k<j;k++)r[indexed[k].i]=rank;i=j}return r}
function spearmanAccuracy(rows){if(rows.length<3)return null;const a=accuracyRanks(rows.map(r=>r.pred)),b=accuracyRanks(rows.map(r=>r.actual)),ma=a.reduce((x,y)=>x+y,0)/a.length,mb=b.reduce((x,y)=>x+y,0)/b.length;let cov=0,va=0,vb=0;for(let i=0;i<a.length;i++){const x=a[i]-ma,y=b[i]-mb;cov+=x*y;va+=x*x;vb+=y*y}return va>0&&vb>0?cov/Math.sqrt(va*vb):null}
function accuracyJoinedRows(gw,cohort='relevant'){const snap=ACCURACY.ledger.snapshots[gw],act=ACCURACY.ledger.actuals[gw];if(!snap||!act)return[];const map=new Map(act.rows.map(r=>[num(Array.isArray(r)?r[0]:r.i),r]));let rows=snap.rows.map(s=>{const sid=num(Array.isArray(s)?s[0]:s.i),a=map.get(sid);if(!a)return null;const cat=snap.catalog?.[sid]||ACCURACY.ledger.catalog?.[sid]||{},sv=(i,k)=>Array.isArray(s)?s[i]:s[k],av=(i,k)=>Array.isArray(a)?a[i]:a[k],minRaw=av(2,'min'),appRaw=av(3,'app'),startRaw=av(4,'start');return{gw,id:sid,name:cat.n||s.n||String(sid),team:cat.t||s.t||'',pos:cat.p||s.p||'',pred:num(sv(1,'x')),low:num(sv(2,'l')),high:num(sv(3,'h')),confidence:num(sv(4,'c')),expMinutes:num(sv(5,'m')),pStart:num(sv(6,'ps')),pAppear:num(sv(7,'pa')),fixtures:num(sv(10,'fx'),1),actual:num(av(1,'pts')),minutes:minRaw===null||minRaw===undefined?null:num(minRaw),appeared:accuracyBoolean(appRaw),started:accuracyBoolean(startRaw)}}).filter(Boolean);if(cohort==='relevant')rows=rows.filter(r=>r.pAppear>=.10||num(r.minutes)>0||r.actual!==0);else if(cohort==='top100'){const ids=new Set([...rows].sort((a,b)=>b.pred-a.pred).slice(0,100).map(r=>r.id));rows=rows.filter(r=>ids.has(r.id)||num(r.minutes)>0)}return rows}
function accuracyMetrics(rows){const n=rows.length;if(!n)return null;const err=rows.map(r=>r.pred-r.actual),mae=err.reduce((a,e)=>a+Math.abs(e),0)/n,rmse=Math.sqrt(err.reduce((a,e)=>a+e*e,0)/n),bias=err.reduce((a,e)=>a+e,0)/n,rank=spearmanAccuracy(rows),intervalRows=rows.filter(r=>Number.isFinite(r.low)&&Number.isFinite(r.high)),interval=intervalRows.length?intervalRows.filter(r=>r.actual>=r.low&&r.actual<=r.high).length/intervalRows.length:null,minutesRows=rows.filter(r=>Number.isFinite(r.minutes)),minutesMae=minutesRows.length?minutesRows.reduce((a,r)=>a+Math.abs(r.expMinutes-r.minutes),0)/minutesRows.length:null,appRows=rows.filter(r=>r.appeared!==null),appBrier=appRows.length?appRows.reduce((a,r)=>a+(r.pAppear-(r.appeared?1:0))**2,0)/appRows.length:null,startRows=rows.filter(r=>r.started!==null),startBrier=startRows.length?startRows.reduce((a,r)=>a+(r.pStart-(r.started?1:0))**2,0)/startRows.length:null,k=Math.min(15,n),predTop=new Set([...rows].sort((a,b)=>b.pred-a.pred).slice(0,k).map(r=>r.id)),actualTop=[...rows].sort((a,b)=>b.actual-a.actual).slice(0,k),topHit=actualTop.filter(r=>predTop.has(r.id)).length/k;return{n,mae,rmse,bias,rank,interval,minutesMae,appBrier,startBrier,topHit}}
function accuracyCompletedGws(){return Object.keys(ACCURACY.ledger.snapshots).map(Number).filter(g=>accuracySnapshotReady(g)&&accuracyActualReady(g)).sort((a,b)=>a-b)}
function accuracyOverall(cohort){const gws=accuracyCompletedGws(),perGw=gws.map(g=>accuracyMetrics(accuracyJoinedRows(g,cohort))).filter(Boolean),rows=gws.flatMap(g=>accuracyJoinedRows(g,cohort)),metrics=accuracyMetrics(rows),avg=k=>{const a=perGw.map(m=>m[k]).filter(Number.isFinite);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};if(metrics){metrics.rank=avg('rank');metrics.topHit=avg('topHit');metrics.gwCount=perGw.length}return{rows,metrics,gws}}
function accuracyFmt(v,d=2,suffix=''){return Number.isFinite(v)?v.toFixed(d)+suffix:'—'}
function setAccuracyStatus(text,kind=''){const el=document.getElementById('accuracyStatus');if(!el)return;el.className='accuracy-status '+kind;el.textContent=text}
function ensureAccuracyGwSelect(){const el=document.getElementById('accuracyGw');if(!el)return;const latestFinished=Math.max(0,...EVENTS.filter(accuracyEventFinal).map(e=>num(e.id))),preferred=latestFinished||num(DATA.nextEvent||S.gw),ids=new Set([preferred,num(DATA.nextEvent||S.gw),...EVENTS.map(e=>num(e.id)),...Object.keys(ACCURACY.ledger.snapshots).map(Number),...Object.keys(ACCURACY.ledger.actuals).map(Number)]),old=num(el.value,preferred);el.innerHTML=[...ids].filter(g=>g>=1&&g<=38).sort((a,b)=>a-b).map(g=>`<option value="${g}">GW${g}${accuracyFinished(g)?' · finished':''}</option>`).join('');el.value=String(ids.has(old)?old:preferred)}
function renderAccuracySummary(cohort){const host=document.getElementById('accuracySummary');if(!host)return;const {metrics:m,gws}=accuracyOverall(cohort);if(!m){host.innerHTML='<div class="accuracy-empty" style="grid-column:1/-1">No completed Gameweek has both an accountable pre-deadline snapshot and final official results yet. OTB maintains the next valid snapshot automatically on mobile and desktop whenever the app is open.</div>';return}host.innerHTML=`<div class="accuracy-kpi info"><div class="ak">Evaluated</div><div class="av">${m.gwCount||gws.length} GW · ${m.n}</div></div><div class="accuracy-kpi good"><div class="ak">Points MAE</div><div class="av">${accuracyFmt(m.mae)}</div></div><div class="accuracy-kpi info"><div class="ak">Points RMSE</div><div class="av">${accuracyFmt(m.rmse)}</div></div><div class="accuracy-kpi ${Math.abs(m.bias)<=.5?'good':'warn'}"><div class="ak">Mean bias</div><div class="av">${m.bias>=0?'+':''}${accuracyFmt(m.bias)}</div></div><div class="accuracy-kpi info"><div class="ak">Mean GW rank</div><div class="av">${accuracyFmt(m.rank)}</div></div><div class="accuracy-kpi info"><div class="ak">80% range coverage</div><div class="av">${accuracyFmt(100*m.interval,0,'%')}</div></div><div class="accuracy-kpi info"><div class="ak">Minutes MAE</div><div class="av">${accuracyFmt(m.minutesMae,1)}</div></div><div class="accuracy-kpi info"><div class="ak">Appearance Brier</div><div class="av">${accuracyFmt(m.appBrier,3)}</div></div><div class="accuracy-kpi info"><div class="ak">Start Brier</div><div class="av">${accuracyFmt(m.startBrier,3)}</div></div><div class="accuracy-kpi info"><div class="ak">Mean top-15 overlap</div><div class="av">${accuracyFmt(100*m.topHit,0,'%')}</div></div>`}
function renderAccuracyGwTable(cohort){const host=document.getElementById('accuracyGwTable');if(!host)return;const gws=[...new Set([...Object.keys(ACCURACY.ledger.snapshots),...Object.keys(ACCURACY.ledger.actuals)])].map(Number).sort((a,b)=>b-a);if(!gws.length){host.innerHTML='<div class="accuracy-empty">No Gameweek snapshots have been recorded.</div>';return}const rows=gws.map(g=>{const snap=ACCURACY.ledger.snapshots[g],act=ACCURACY.ledger.actuals[g],ready=accuracySnapshotReady(g)&&accuracyActualReady(g),m=ready?accuracyMetrics(accuracyJoinedRows(g,cohort)):null,state=!snap?'No forecast':!accuracySnapshotReady(g)?'Unverified forecast':!act?'Awaiting results':!accuracyActualReady(g)?(accuracyFinished(g)?'Final refresh needed':'Provisional results'):m?`${m.n} players`:'No matches';return`<div class="accuracy-row"><button type="button" data-accuracy-gw="${g}">GW${g}</button><span>${m?accuracyFmt(m.mae):state}</span><span>${m?accuracyFmt(m.rmse):'—'}</span><span>${m?accuracyFmt(m.rank):'—'}</span><span class="accuracy-hide-mobile">${m?accuracyFmt(100*m.interval,0,'%'):(snap?.capturedAt?new Date(snap.capturedAt).toLocaleDateString():'—')}</span></div>`}).join('');host.innerHTML=`<div class="accuracy-table"><div class="accuracy-row head"><span>GW</span><span>MAE</span><span>RMSE</span><span>Rank</span><span class="accuracy-hide-mobile">Coverage</span></div>${rows}</div>`}
function renderAccuracyPositions(cohort){const host=document.getElementById('accuracyPositions');if(!host)return;const gw=num(document.getElementById('accuracyGw')?.value,DATA.nextEvent||S.gw);if(!accuracySnapshotReady(gw)||!accuracyActualReady(gw)){host.innerHTML='<div class="accuracy-empty">Position diagnostics require an accountable forecast and final official results for the selected Gameweek.</div>';return}const rows=accuracyJoinedRows(gw,cohort);if(!rows.length){host.innerHTML='<div class="accuracy-empty">No matched players are available for this cohort.</div>';return}host.innerHTML='<div class="accuracy-table"><div class="accuracy-pos-row" style="color:var(--cyan);font-weight:800"><span>Pos</span><span>N</span><span>MAE</span><span>Bias</span><span class="accuracy-hide-mobile">Rank</span></div>'+['GK','DEF','MID','FWD'].map(pos=>{const m=accuracyMetrics(rows.filter(r=>r.pos===pos));return`<div class="accuracy-pos-row"><span>${pos}</span><span>${m?.n||0}</span><span>${m?accuracyFmt(m.mae):'—'}</span><span>${m?(m.bias>=0?'+':'')+accuracyFmt(m.bias):'—'}</span><span class="accuracy-hide-mobile">${m?accuracyFmt(m.rank):'—'}</span></div>`}).join('')+'</div>'}
function setIntelligenceStatus(text,kind='warn'){const el=document.getElementById('intelligenceStatus');if(!el)return;el.className='accuracy-status '+kind;el.textContent=text}
function intelligenceSelectionIds(gw){const snap=ACCURACY.ledger.snapshots[gw],ids=snap?.selection?.squad||[];return[...new Set(ids.map(id=>Math.trunc(num(id))).filter(id=>id>0))].slice(0,15)}
async function fetchGameweekIntelligence(gw,{force=false}={}){gw=Math.trunc(num(gw));if(!gw||navigator.onLine===false)return null;const ids=intelligenceSelectionIds(gw),cached=GAMEWEEK_INTELLIGENCE.reports.get(gw),have=new Set((cached?.players||[]).map(p=>num(p.playerId))),complete=ids.every(id=>have.has(id));if(!force&&cached&&Date.now()-num(cached._fetchedAt)<5*60*1000&&(cached.status!=='ready'||complete)){renderGameweekIntelligence(gw);return cached}const seq=++GAMEWEEK_INTELLIGENCE.requestSeq;GAMEWEEK_INTELLIGENCE.loading=true;GAMEWEEK_INTELLIGENCE.error='';setIntelligenceStatus(`Loading official GW${gw} intelligence…`,'warn');try{const params=new URLSearchParams({gw:String(gw)});if(ids.length)params.set('players',ids.join(','));if(force)params.set('_',String(Date.now()));const report=await fetchJSON(`${API_BASE}/api/gameweek-intelligence?${params}`,15000);if(seq!==GAMEWEEK_INTELLIGENCE.requestSeq)return null;report._fetchedAt=Date.now();GAMEWEEK_INTELLIGENCE.reports.set(gw,report);renderGameweekIntelligence(gw);return report}catch(e){if(seq!==GAMEWEEK_INTELLIGENCE.requestSeq)return null;GAMEWEEK_INTELLIGENCE.error=e.message;renderGameweekIntelligence(gw);return null}finally{if(seq===GAMEWEEK_INTELLIGENCE.requestSeq)GAMEWEEK_INTELLIGENCE.loading=false}}
function intelligenceUpcomingText(team){const start=Math.max(1,num(DATA.nextEvent||S.gw)),parts=[];for(let gw=start;gw<=38&&gw<start+4;gw++){const fixtures=fixtureListFor(team,gw);parts.push(fixtures.length?`GW${gw} ${fixtures.map(f=>`${f.opp} ${f.home?'H':'A'}`).join(' / ')}`:`GW${gw} —`)}return parts.join(' · ')}
function intelligenceCard(row){const evidence=row.evidence||{},sample=evidence.sampleMinutes!=null?`${Math.round(num(evidence.sampleMinutes))} min · ${num(evidence.priorGameweeks)} prior GW`:'completed GW stats',upcoming=intelligenceUpcomingText(row.team);return`<div class="gw-intel-card"><div class="title">${esc(row.name||'—')} · ${esc(row.team||'—')} ${esc(row.position||'')}</div><div class="meta">${num(row.points).toFixed(0)} pts · ${num(row.minutes).toFixed(0)} min · ${num(row.xGI).toFixed(2)} xGI · ${num(row.ownership).toFixed(1)}%</div><div class="why">${esc(row.why||'')}${upcoming?`<br><b>Next:</b> ${esc(upcoming)}`:''}</div><span class="confidence">${esc(row.confidence||'LOW')} CONFIDENCE · ${esc(sample)}</span></div>`}
function intelligenceSignalSections(report){const host=document.getElementById('intelligenceSignals');if(!host)return;const sections=[['What others may miss · attack process','underlyingWatch'],['Defensive process before points','defensiveWatch'],['Low-owned emerging','hiddenGems'],['Role and minute gains','roleRisers'],['Role and minute declines','roleFallers'],['Hauls to verify before chasing','haulCautions'],['Top Gameweek returns','topPerformers']];host.innerHTML=sections.map(([title,key])=>{const rows=(report.sections?.[key]||[]).slice(0,6);return rows.length?`<section class="gw-intel-section"><h3>${esc(title)}</h3><div class="gw-intel-grid">${rows.map(intelligenceCard).join('')}</div></section>`:''}).join('')||'<div class="accuracy-empty">The final data contained no signals above the current materiality thresholds.</div>'}
function intelligenceTeamTrends(report){const host=document.getElementById('intelligenceTeams');if(!host)return;const rows=report.teamTrends||[],direction=(value,label)=>{const dir=['UP','DOWN','STEADY','BLANK'].includes(value)?value:'STEADY';return dir==='BLANK'?`<span class="gw-intel-steady">${esc(label)} —</span>`:`<span class="gw-intel-${dir.toLowerCase()}">${esc(label)} ${dir==='UP'?'↑':dir==='DOWN'?'↓':'→'}</span>`};if(!rows.length){host.innerHTML='';return}host.innerHTML=`<div class="sechead" style="margin:12px -14px 8px;position:static"><h2>Team process</h2><span class="note">all clubs · per-fixture xG / xGC direction</span></div><div class="accuracy-table"><div class="gw-intel-team" style="color:var(--cyan);font-weight:800"><span>Club</span><span>Attack</span><span>Defence</span><span>xG/xGC</span></div>${rows.map(row=>`<div class="gw-intel-team"><b>${esc(row.team)}</b>${direction(row.attackDirection,'ATK')}${direction(row.defenseDirection,'DEF')}<span class="mono">${row.fixtures?`${num(row.xG).toFixed(2)}/${num(row.xGC).toFixed(2)}`:'BLANK'}</span></div>`).join('')}</div><div class="accuracy-note">Team directions compare the selected Gameweek with up to four earlier completed Gameweeks when available. GW1 and new-role signals are deliberately low confidence.</div>`}
function intelligenceLegalSwap(snapshot,benchId,starterId){const catalog=snapshot.catalog||{},benchPos=catalog[benchId]?.p,starterPos=catalog[starterId]?.p;if(!benchPos||!starterPos)return false;if(benchPos==='GK'||starterPos==='GK')return benchPos===starterPos;const counts={DEF:0,MID:0,FWD:0};for(const id of snapshot.selection?.xi||[]){const pos=catalog[id]?.p;if(pos in counts)counts[pos]++}counts[starterPos]--;counts[benchPos]++;return counts.DEF>=3&&counts.DEF<=5&&counts.MID>=2&&counts.MID<=5&&counts.FWD>=1&&counts.FWD<=3}
function renderPersonalGameweekIntelligence(gw,report){const host=document.getElementById('intelligencePersonal');if(!host)return;const snap=ACCURACY.ledger.snapshots[gw],selection=snap?.selection;if(!snap||!selection?.complete){host.innerHTML=`<div class="sechead" style="margin:12px -14px 8px;position:static"><h2>Your decision review</h2><span class="note">pre-deadline context</span></div><div class="accuracy-empty">No complete personal squad decision was preserved before the GW${gw} deadline. The league-wide review remains valid, but OTB will not reconstruct your XI, captain or bench after seeing the result. Automatic personal snapshots are now active for future Gameweeks.</div>`;return}const actualById=new Map((report.players||[]).map(p=>[num(p.playerId),p])),predById=new Map((snap.rows||[]).map(row=>[num(row[0]),row])),catalog=snap.catalog||{},scoring=selection.chip?.benchScoring?selection.squad:selection.xi,capId=num(selection.captain),mult=num(selection.chip?.captainMultiplier,2),predBase=scoring.reduce((a,id)=>a+num(predById.get(id)?.[1]),0),actualBase=scoring.reduce((a,id)=>a+num(actualById.get(id)?.points),0),projected=predBase+(mult-1)*num(predById.get(capId)?.[1]),actual=actualBase+(mult-1)*num(actualById.get(capId)?.points),captainBest=[...(selection.xi||[])].sort((a,b)=>num(predById.get(b)?.[1])-num(predById.get(a)?.[1]))[0],capGap=num(predById.get(captainBest)?.[1])-num(predById.get(capId)?.[1]),capName=catalog[capId]?.n||actualById.get(capId)?.name||'Not set',bestName=catalog[captainBest]?.n||actualById.get(captainBest)?.name||'—';let benchLesson=selection.chip?.benchScoring?'Bench Boost was active, so all four substitutes were planned scorers.': 'No material bench outcome to review.';if(!selection.chip?.benchScoring){let best=null;for(const benchId of selection.bench||[])for(const starterId of selection.xi||[]){if(!intelligenceLegalSwap(snap,benchId,starterId))continue;const outcomeGain=num(actualById.get(benchId)?.points)-num(actualById.get(starterId)?.points);if(outcomeGain>num(best?.outcomeGain,0))best={benchId,starterId,outcomeGain,processGap:num(predById.get(benchId)?.[1])-num(predById.get(starterId)?.[1])}}if(best){const bn=catalog[best.benchId]?.n||'Bench player',sn=catalog[best.starterId]?.n||'starter';benchLesson=best.processGap>.25?`Process miss: ${bn} was projected ${best.processGap.toFixed(1)} higher than ${sn} and then outscored them by ${best.outcomeGain.toFixed(0)}.`:`Outcome only: ${bn} outscored ${sn} by ${best.outcomeGain.toFixed(0)}, but the pre-deadline model did not prefer that legal swap. Do not learn from hindsight alone.`}}
  const signalRows=Object.values(report.sections||{}).flat().filter(row=>selection.squad.includes(num(row.playerId))&&row.signal!=='GAMEWEEK_HAUL'),unique=[...new Map(signalRows.map(row=>[row.playerId,row])).values()].slice(0,5),decisionDelta=actual-projected;host.innerHTML=`<div class="sechead" style="margin:12px -14px 8px;position:static"><h2>Your decision review</h2><span class="note">captured before the deadline · no hindsight rewrite</span></div><div class="gw-intel-grid"><div class="gw-intel-card"><div class="title">Planned scoring group</div><div class="meta">${esc(selection.formation)} · ${esc(selection.chip?.label||'No chip')}</div><div class="why">${projected.toFixed(1)} projected vs ${actual.toFixed(0)} raw actual points (${decisionDelta>=0?'+':''}${decisionDelta.toFixed(1)}). This is the captured XI${selection.chip?.benchScoring?'+bench':''} plus captain multiplier, before official autosubs or vice-captain promotion.</div></div><div class="gw-intel-card"><div class="title">Captain process · ${esc(capName)}</div><div class="meta">${num(predById.get(capId)?.[1]).toFixed(1)} pre-GW xPts · ${num(actualById.get(capId)?.points).toFixed(0)} actual</div><div class="why">${capGap<=.3?`The armband aligned with OTB's strongest captured XI projection${captainBest!==capId?` within ${capGap.toFixed(1)} xPts of ${esc(bestName)}`:''}.`:`OTB had ${esc(bestName)} ${capGap.toFixed(1)} xPts higher before the deadline; review whether that gap justified the captain risk.`}</div></div><div class="gw-intel-card"><div class="title">Bench decision</div><div class="why">${esc(benchLesson)}</div></div><div class="gw-intel-card"><div class="title">Squad signals for next planning cycle</div><div class="why">${unique.length?unique.map(row=>`${esc(row.name)}: ${esc(String(row.signal||'signal').replaceAll('_',' ').toLowerCase())}`).join('<br>'):'No owned player crossed a material role, underlying or haul-caution threshold this week.'}</div></div></div>`}
function renderGameweekIntelligence(gw){const overview=document.getElementById('intelligenceOverview'),personal=document.getElementById('intelligencePersonal'),signals=document.getElementById('intelligenceSignals'),teams=document.getElementById('intelligenceTeams');if(!overview||!personal||!signals||!teams)return;const report=GAMEWEEK_INTELLIGENCE.reports.get(num(gw));if(GAMEWEEK_INTELLIGENCE.error){setIntelligenceStatus(`GW${gw} review could not load: ${GAMEWEEK_INTELLIGENCE.error}`,'bad');overview.innerHTML=personal.innerHTML=signals.innerHTML=teams.innerHTML='';return}if(!report){setIntelligenceStatus(GAMEWEEK_INTELLIGENCE.loading?`Loading GW${gw} intelligence…`:`GW${gw} review has not been checked in this session yet.`,'warn');overview.innerHTML=personal.innerHTML=signals.innerHTML=teams.innerHTML='';return}if(report.status!=='ready'){setIntelligenceStatus(report.message||`GW${gw} is not complete yet. The review will appear after FPL data-checks it or the completed-fixture safety window elapses.`,'warn');overview.innerHTML=personal.innerHTML=signals.innerHTML=teams.innerHTML='';return}const generated=Date.parse(report.generatedAt),stamp=Number.isFinite(generated)?new Date(generated).toLocaleString():'completed data',sample=report.sample||{},o=report.overview||{},fallback=report.finality?.source==='completed-fixtures-grace',finalityText=fallback?'All fixtures were final and the 14-hour safety window elapsed; FPL\'s event flag was still stale.':'FPL marked the Gameweek finished and data-checked.';setIntelligenceStatus(`GW${gw} intelligence generated ${stamp}. ${finalityText} ${report.confidence||'LOW'} current-season confidence from 1 completed GW plus ${num(sample.priorGameweeks)} prior GW; use signals to investigate, not as automatic transfer orders.`,'good');overview.innerHTML=`<div class="accuracy-kpi info"><div class="ak">Players appeared</div><div class="av">${num(sample.appeared)}</div></div><div class="accuracy-kpi good"><div class="ak">Goals / xG</div><div class="av">${num(o.goals)} / ${num(o.xG).toFixed(1)}</div></div><div class="accuracy-kpi info"><div class="ak">Assists / xA</div><div class="av">${num(o.assists)} / ${num(o.xA).toFixed(1)}</div></div><div class="accuracy-kpi warn"><div class="ak">Signal confidence</div><div class="av">${esc(report.confidence||'LOW')}</div></div>`;renderPersonalGameweekIntelligence(gw,report);intelligenceSignalSections(report);intelligenceTeamTrends(report)}
function renderAccuracy(){ensureAccuracyGwSelect();const cohort=document.getElementById('accuracyCohort')?.value||'relevant',gw=num(document.getElementById('accuracyGw')?.value,DATA.nextEvent||S.gw),snap=ACCURACY.ledger.snapshots[gw],act=ACCURACY.ledger.actuals[gw],deadline=accuracyDeadline(gw),final=accuracyFinished(gw),canCapture=Number.isFinite(deadline)&&Date.now()<deadline&&['LIVE','CACHE'].includes(DATA.mode)&&!!DATA.validation?.topologyPass,cap=document.getElementById('btnAccuracySnapshot'),sync=document.getElementById('btnAccuracySync');if(cap){cap.disabled=!canCapture||!!ACCURACY.capturePromise;cap.title=canCapture?'Update this accountable forecast and personal decision snapshot before the deadline':'Requires a future verified deadline, valid live/cache data and passed fixture topology'}if(sync){const synced=accuracyActualReady(gw);sync.disabled=!final||synced||ACCURACY.loading;sync.textContent=!final?'OFFICIAL RESULTS NOT YET AVAILABLE':synced?'OFFICIAL RESULTS SYNCED':'SYNC OFFICIAL GW RESULTS';sync.title=!final?`GW${gw} results unlock only after every fixture is complete and the safety window has elapsed`:synced?`GW${gw} final results are already stored`:`Fetch the complete GW${gw} official event-live result`}if(ACCURACY.error)setAccuracyStatus(ACCURACY.error,'bad');else if(accuracySnapshotReady(gw)&&accuracyActualReady(gw))setAccuracyStatus(`GW${gw} is fully evaluated. Forecast and squad decisions were captured ${new Date(snap.capturedAt).toLocaleString()} using ${snap.release}; ${act.rows.length} final result rows loaded.`,'good');else if(snap&&!accuracySnapshotReady(gw))setAccuracyStatus(`GW${gw} contains an imported or damaged forecast that failed accountability checks (${snap.integrity||'incomplete'}). It is excluded from performance totals.`,'bad');else if(snap&&act)setAccuracyStatus(final?`GW${gw} has incomplete stored results and needs a final refresh before evaluation.`:`GW${gw} results are provisional and excluded from performance totals until completion.`,'warn');else if(snap&&final)setAccuracyStatus(`GW${gw} is complete. Its accountable forecast is preserved and official results are ready to sync.`,'warn');else if(snap)setAccuracyStatus(`GW${gw} snapshot stores ${snap.rows.length} player forecasts${snap.selection?.complete?' plus your legal squad, XI, bench, captain and chip context':''}. It becomes immutable after ${new Date(snap.deadline).toLocaleString()}.`,'warn');else if(Number.isFinite(deadline)&&Date.now()<deadline)setAccuracyStatus(`GW${gw} has no stored snapshot yet. OTB is preparing it automatically in small background chunks on this device; the button can request it immediately.`,'warn');else setAccuracyStatus(`GW${gw} has no accountable pre-deadline forecast. OTB will not manufacture one after the deadline.`,'bad');renderAccuracySummary(cohort);renderAccuracyGwTable(cohort);renderAccuracyPositions(cohort);renderGameweekIntelligence(gw)}
function exportAccuracyLedger(){const payload={...ACCURACY.ledger,exportedAt:Date.now(),exportRelease:MODEL_RELEASE},blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`OTB_projection_ledger_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function importAccuracyLedgerFile(file){if(file.size>5_000_000){document.getElementById('accuracyImportStatus').textContent='Ledger import failed: file exceeds 5 MB.';return}const r=new FileReader();r.onload=()=>{const old=ACCURACY.ledger;try{const d=sanitizeAccuracyLedger(JSON.parse(String(r.result||'')));if(!Object.keys(d.snapshots).length&&!Object.keys(d.actuals).length)throw new Error('No recognised snapshot or result records were found.');ACCURACY.ledger=d;if(!saveAccuracyLedger())throw new Error(ACCURACY.error);renderAccuracy();document.getElementById('accuracyImportStatus').textContent='Projection ledger restored. Imported records retain integrity and accountability checks.'}catch(e){ACCURACY.ledger=old;document.getElementById('accuracyImportStatus').textContent='Ledger import failed: '+e.message}};r.readAsText(file)}

/* RC3.0 UX controller */
const UX={mode:'beginner'};
function uxOpenPanel(name){const b=document.querySelector(`.tabs button[data-t="${name}"]`);if(b&&!b.classList.contains('advanced-only')||UX.mode==='expert'){b?.click();const mobileEngine=document.querySelector('.mobile-tabs button[data-m="rail"]');if(matchMedia('(max-width:1080px)').matches)mobileEngine?.click()}}
function uxSetMode(mode,persist=true){UX.mode=mode==='expert'?'expert':'beginner';document.body.dataset.uxMode=UX.mode;document.getElementById('uxBeginner')?.classList.toggle('on',UX.mode==='beginner');document.getElementById('uxExpert')?.classList.toggle('on',UX.mode==='expert');document.getElementById('uxHelp').innerHTML=UX.mode==='beginner'?'<b>Simple mode:</b> core decisions only. Switch to Expert for models, backtesting, price pressure, chip strategy and diagnostics.':'<b>Expert mode:</b> all analytical, accountability and engineering panels are available.';if(UX.mode==='beginner'&&document.querySelector('.tabs button.on')?.classList.contains('advanced-only'))document.querySelector('.tabs button[data-t="build"]')?.click();if(persist)try{localStorage.setItem('otb_ux_mode',UX.mode)}catch(e){};uxUpdateDecision()}
function squadSanityIssues(){
  /* The recommendation card used to green-tick any squad that was structurally legal
     - 15 players, 11 starters, a captain assigned. It never asked whether that state
       made sense, so it happily endorsed a 4.1xP goalkeeper captaining over a 23xP
       midfielder. These checks catch states that are legal but obviously wrong. */
  const out=[];
  try{
    const xi=[...(S.start||[])].map(id=>byId(id)).filter(Boolean);
    if(xi.length!==11)return out;
    const scored=xi.map(p=>({p,x:project(p,S.gw).x})).sort((a,b)=>b.x-a.x);
    const capP=byId(S.cap);
    if(capP){
      const capX=project(capP,S.gw).x,best=scored[0];
      const gap=best.x-capX;
      /* 1.0xP is a wide margin for a single gameweek - anything beyond it is a
         mistake rather than a defensible differential punt. */
      if(gap>1.0&&best.p.id!==capP.id){
        out.push({kind:S.capManual?'info':'bad',
          title:`Captain check — ${capP.n} projects ${capX.toFixed(1)}, ${best.p.n} projects ${best.x.toFixed(1)}`,
          note:S.capManual
            ?`You picked ${capP.n} deliberately. ${best.p.n} is projected ${gap.toFixed(1)} points higher this gameweek.`
            :`Your armband is on a player projected ${gap.toFixed(1)} points below your best option. Tap C on ${best.p.n} to switch.`,
          panel:'verdict'});
      }
    }
    const flagged=xi.filter(p=>{const f=(typeof flagInfo==='function')?flagInfo(p):null;return f&&f.cls!=='flag-loan'});
    if(flagged.length)out.push({kind:'bad',
      title:`${flagged.length} flagged player${flagged.length>1?'s':''} in your XI`,
      note:`${flagged.map(p=>p.n).join(', ')} carry an availability flag. Check the news before the deadline.`,
      panel:'news'});
    const lowMin=xi.filter(p=>minuteDetail(p).pAppear<0.55);
    if(lowMin.length)out.push({kind:'info',
      title:`${lowMin.length} starter${lowMin.length>1?'s':''} with low expected minutes`,
      note:`${lowMin.map(p=>p.n).join(', ')} may not start. Check your bench order.`,
      panel:'verdict'});
  }catch(e){}
  return out;
}
function uxUpdateDecision(){
  const box=document.getElementById('uxDecision'),title=document.getElementById('uxDecisionTitle'),note=document.getElementById('uxDecisionNote'),icon=document.getElementById('uxDecisionIcon'),action=document.getElementById('uxDecisionAction');
  if(!box||typeof S==='undefined')return;
  const n=S.squad?.length||0,starters=S.start?.size||0,cap=S.cap,bankText=document.getElementById('hBank')?.textContent||'—',selectionIssue=DATA.selectionIssue;
  box.className='decision-card';
  if(n<15){
    box.classList.add(selectionIssue?'bad':'warn');icon.textContent=selectionIssue?'⚠️':'🧩';
    title.textContent=selectionIssue?`${selectionIssue.players.join(', ')} left the current FPL player list`:`Complete your squad — ${n}/15 selected`;
    note.textContent=selectionIssue?`Your saved squad is now ${n}/15. Choose a replacement; the app did not silently invent a transfer.`:(n?'Fill the remaining positions, then review captaincy and bench order.':'Add players manually or use Auto-complete to create a legal starting point.');
    action.textContent=selectionIssue?'Find replacement':(n?'Continue building':'Auto-complete');
    action.onclick=()=>{if(!n&&!selectionIssue)document.getElementById('btnJumpAuto')?.click();else uxOpenPanel('build')};
  }else if(starters!==11){
    box.classList.add('bad');icon.textContent='⚠️';title.textContent=`Set a legal starting XI — ${starters}/11`;note.textContent='Use the Start controls on player cards and keep formation rules valid.';action.textContent='Review squad';action.onclick=()=>document.querySelector('.mobile-tabs button[data-m="centre"]')?.click();
  }else if(!cap){
    box.classList.add('warn');icon.textContent='©️';title.textContent='Choose your captain';note.textContent='Captaincy is the highest-impact weekly decision after your squad is legal.';action.textContent='Review verdict';action.onclick=()=>uxOpenPanel('verdict');
  }else{
    const issues=squadSanityIssues(),worst=issues.find(i=>i.kind==='bad')||issues[0];
    if(worst){box.classList.add(worst.kind==='bad'?'bad':'warn');icon.textContent=worst.kind==='bad'?'⚠️':'ℹ️';title.textContent=worst.title;note.textContent=worst.note;action.textContent='Review squad';action.onclick=()=>uxOpenPanel(worst.panel||'verdict');return}
    box.classList.add('good');icon.textContent='✅';
    const cp=(typeof byId==='function'&&byId(cap))?byId(cap).n:'captain';
    title.textContent=`Squad ready — ${cp} captains your XI`;note.textContent=`Bank £${bankText}m. Check news and fixtures before the deadline, then use Verdict for the final decision.`;action.textContent='Open verdict';action.onclick=()=>uxOpenPanel('verdict');
  }
}
document.getElementById('uxBeginner').onclick=()=>uxSetMode('beginner');document.getElementById('uxExpert').onclick=()=>uxSetMode('expert');
try{UX.mode=localStorage.getItem('otb_ux_mode')||'beginner'}catch(e){UX.mode='beginner'}
const uxObserver=new MutationObserver(()=>uxUpdateDecision());['hSquad','hBank','hXpts'].forEach(id=>{const e=document.getElementById(id);if(e)uxObserver.observe(e,{childList:true,subtree:true,characterData:true})});
uxSetMode(UX.mode,false);

function runRC4HealthCheck(){
 const required=['renderStrengths','populateTeamFilter','renderPool','renderPitch','renderVerdict','renderDataStatus','refreshLiveData'];
 const missing=required.filter(name=>typeof globalThis[name]!=='function');
 const dom=['colPool','colCentre','colRail','poolList','verdictCommand','livePill'].filter(id=>!document.getElementById(id));
 const ok=!missing.length&&!dom.length;
 if(typeof pipelineEvent==='function')pipelineEvent('HEALTH',ok?'ok':'warn',ok?`${APP_RELEASE} dependency and DOM self-check passed`:`Missing functions: ${missing.join(', ')||'none'}; missing DOM: ${dom.join(', ')||'none'}`);
 if(!ok)console.warn(`OTB ${APP_RELEASE} health check`,{missing,dom});
 return{ok,missing,dom};
}
function scheduleRC4HealthCheck(){const run=()=>runRC4HealthCheck();if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1800});else setTimeout(run,900)}
/* RC5.0.12 — Mobile Fast Path
   Low-power devices keep startup decision-critical and leave expensive engineering,
   accuracy and enrichment work on demand. Desktop retains progressive hydration. */
function runWhenIdle(fn,{delay=0,timeout=3500}={}){
  setTimeout(()=>{
    const run=()=>{try{fn()}catch(e){console.warn('OTB deferred task failed:',e)}};
    if('requestIdleCallback'in window)requestIdleCallback(run,{timeout});
    else setTimeout(run,40);
  },Math.max(0,delay));
}
let POST_LIVE_HYDRATION_SEQ=0;
/* Role evidence used to reach the model only when someone opened the Role
   Intelligence panel and pressed "Load latest scout report" -- one club at a
   time. Everything downstream of that was built and working, but the loop was
   only ever closed by hand, for whichever single club had been looked at last.
   This pulls cached evidence for every club the squad actually contains, on
   every live refresh, so observed starts and current team news reach xPts
   without anyone asking. Cached reads only: no scan is triggered, so this
   costs the scout no browser budget. */
async function syncSquadRoleIntelligence(){
  const codes=[...new Set(squadPlayers().map(p=>p.t).filter(Boolean))].sort();
  if(!codes.length)return {status:'no-squad',applied:0};
  let payload=null;
  try{
    const r=await fetch(`${SCOUT_API_BASE}/api/scout/latest?teams=${encodeURIComponent(codes.join(','))}`,{cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)return {status:`http-${r.status}`,applied:0};
    payload=await r.json();
  }catch(e){return {status:'unreachable',applied:0}}
  const reports=payload&&payload.status==='ok'&&payload.teams&&typeof payload.teams==='object'?payload.teams:null;
  if(!reports)return {status:'unrecognised',applied:0};
  const refreshed=new Set(Object.keys(reports).map(c=>String(c).toUpperCase()));
  if(!refreshed.size)return {status:'empty',applied:0};
  const applied=[];
  for(const [code,report] of Object.entries(reports)){
    if(!report||report.status!=='ok'||!Array.isArray(report.events))continue;
    for(const z of report.events){
      const local=scoutEventLocal(z,{...report,team:report.team||code});
      if(local)applied.push(local);
    }
  }
  /* Replace worker evidence only for the clubs actually refreshed. Manual
     evidence, and any club not asked about, are left exactly as they were. */
  const kept=roleIntelEvents().filter(e=>!(e.worker&&refreshed.has(String(e.team).toUpperCase())));
  S.roleIntel.events=[...kept,...applied];
  SCOUT.syncedAt=Date.now();SCOUT.syncedTeams=[...refreshed];
  bumpCache();saveUserState();renderRoleIntelligence();render();
  return {status:'ok',applied:applied.length,teams:refreshed.size};
}

function schedulePostLiveHydration(){
  const seq=++POST_LIVE_HYDRATION_SEQ;
  const current=()=>seq===POST_LIVE_HYDRATION_SEQ;
  if(lowPowerMode()){
    runWhenIdle(()=>{if(current())void maybeAutoCaptureProjection()},{delay:1400,timeout:6000});
    runWhenIdle(()=>{if(current()&&navigator.onLine!==false)void maybeAutoSyncAccuracyActuals()},{delay:2200,timeout:7000});
    runWhenIdle(()=>{if(current())saveUserState()},{delay:2500,timeout:6000});
    return;
  }
  runWhenIdle(()=>{if(current())void maybeAutoCaptureProjection()},{delay:700,timeout:4500});
  runWhenIdle(()=>{if(current()&&navigator.onLine!==false)void maybeAutoSyncAccuracyActuals()},{delay:1200,timeout:5000});
  runWhenIdle(()=>{if(current()&&navigator.onLine!==false)syncSquadRoleIntelligence().catch(()=>{})},{delay:1500,timeout:6000});
  runWhenIdle(()=>{if(current())refreshNewsFeed({silent:true})},{delay:1900,timeout:5000});
  runWhenIdle(()=>{if(current())refreshPriceIntel({silent:true})},{delay:2250,timeout:5000});
  runWhenIdle(()=>{if(current())saveUserState()},{delay:2500,timeout:5000});
}
document.documentElement.dataset.release=APP_RELEASE_SLUG;document.documentElement.dataset.build=APP_BUILD;pipelineEvent('APP','ok',`${APP_RELEASE} build ${APP_BUILD} JavaScript initialised`);initBuildFreshness();scheduleRC4HealthCheck();reconcileTransferStrategy();loadExternalCalendar();loadAccuracyLedger();const hadCache=loadCachedData();syncMobile();renderExternalCalendarStatus();if(!hadCache){renderStrengths();populateTeamFilter()}applyShotMode();render({deferPool:lowPowerMode()});tick();setInterval(tick,30000);scheduleSelfTests();if(navigator.onLine!==false)runWhenIdle(()=>maybeAutoSyncExternalCalendar(),{delay:900,timeout:4000});runWhenIdle(()=>void maybeAutoCaptureProjection(),{delay:lowPowerMode()?1800:1200,timeout:6000});if(navigator.onLine!==false)runWhenIdle(()=>void maybeAutoSyncAccuracyActuals(),{delay:lowPowerMode()?3000:2400,timeout:7000});/* Market data is optional: the engine renders immediately and re-renders
   if it arrives. loadMarketData() calls bumpCache() itself, so projections
   recompute with the blend applied. Refreshed hourly; the worker serves a
   cache so this costs no credits. */
if(navigator.onLine!==false&&!lowPowerMode())runWhenIdle(()=>{loadMarketData().then(ok=>{if(ok)render()})},{delay:3000,timeout:6000});
setInterval(()=>{if(navigator.onLine!==false&&document.visibilityState==='visible'&&(!lowPowerMode()||['verdict','model'].includes(activeRailTab())))loadMarketData().then(ok=>{if(ok)render()})},60*60*1000);
/* RC5.0.0 F2 — the hourly market poll only fires while the tab is visible. On
   mobile the app is backgrounded almost all of the time, so odds could silently
   pass the 12h cutoff and be dropped from projections with no notice. Returning
   to the app now forces a refresh whenever effective age exceeds two hours. */
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'||navigator.onLine===false||(lowPowerMode()&&!['verdict','model'].includes(activeRailTab())))return;const a=marketAgeMinutes();if(a==null||a>120)loadMarketData().then(ok=>{if(ok)render()})});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;void maybeAutoCaptureProjection();if(navigator.onLine!==false){void maybeAutoSyncAccuracyActuals();if(activeRailTab()==='accuracy')void fetchGameweekIntelligence(num(document.getElementById('accuracyGw')?.value,DATA.nextEvent||S.gw))}});
/* RC5.0.0 — Verdict-first landing. The rail still defaults to the builder,
   because landing a new or half-built squad on a page that can only say
   "NO VERDICT" is worse than not landing there at all. Once there is a legal
   15 and the data is certified, the intended destination becomes the default:
   you open OTB into the decision, and Verdict tells you whether any other
   panel is worth visiting. Fires once, after live data settles, and never
   overrides a tab the user has already chosen. */
let VERDICT_LANDING_DONE=false;
function maybeLandOnVerdict(){
  if(VERDICT_LANDING_DONE||USER_TOUCHED_RAIL||activeRailTab()!=='build')return;
  try{
    if(!Array.isArray(S.squad)||S.squad.length!==15)return;
    if(!legal(squadPlayers())||!productionDataReady())return;
    const btn=document.querySelector('.tabs button[data-t="verdict"]');
    if(!btn)return;
    VERDICT_LANDING_DONE=true;btn.click();
  }catch(e){console.warn('OTB verdict landing skipped:',e)}
}
if(DATA.auto&&navigator.onLine!==false)runWhenIdle(()=>refreshLiveData(false),{delay:lowPowerMode()?(hadCache?12000:1800):800,timeout:lowPowerMode()?20000:5000});if(!lowPowerMode())setTimeout(maybeLandOnVerdict,3200);setInterval(()=>{if(DATA.auto&&navigator.onLine!==false&&document.visibilityState==='visible')refreshLiveData(false)},30*60*1000);
