import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CLUB_SCHEDULE_SOURCES,
  clubScheduleHealthFromMeta,
  dedupeFixtures,
  mergeSourceResults,
  parseEflMatches,
  parseFaCupHtml,
  parseUefaMatches,
  refreshClubSchedule,
  zeroYieldRegressions,
} from '../src/club-schedule.js';

const teams = [
  ['ARS','Arsenal'],['AVL','Aston Villa'],['BOU','Bournemouth'],['BRE','Brentford'],
  ['BHA','Brighton'],['CHE','Chelsea'],['COV','Coventry City'],['CRY','Crystal Palace'],
  ['EVE','Everton'],['FUL','Fulham'],['HUL','Hull City'],['IPS','Ipswich Town'],
  ['LEE','Leeds'],['LIV','Liverpool'],['MCI','Man City'],['MUN','Man Utd'],
  ['NEW','Newcastle'],['NFO',"Nott'm Forest"],['TOT','Spurs'],['SUN','Sunderland'],
].map(([code,name])=>({code,name}));

const updatedAt='2026-08-12T00:00:00.000Z';

function eflMatch(id,home,away,kickoff='2026-08-25 18:45:00',extra={}){
  return{type:'match',id,attributes:{
    kickOffDateUTC:kickoff,TBC:'',homeTeam:{officialName:home},awayTeam:{officialName:away},
    matchPeriod:'PreMatch',postponementReason:null,competitionID:2,...extra
  }};
}

test('EFL normalizer returns confirmed PL club records and rejects TBC or postponed ties',()=>{
  const payload={data:[
    eflMatch('a','Stoke City','Hull City'),
    eflMatch('b','Nottingham Forest','Leeds United','2026-08-25 19:00:00'),
    eflMatch('c','Chelsea FC','Luton Town','2026-08-25 14:00:00',{TBC:'DATE_AND_TIME'}),
    eflMatch('d','Everton','Preston North End','2026-08-26 19:00:00',{postponementReason:'Postponed'}),
  ]};
  const rows=parseEflMatches(payload,teams,updatedAt);
  assert.deepEqual(rows.map(row=>[row.team,row.opponent,row.home]),[
    ['HUL','Stoke City',false],
    ['LEE','Nottingham Forest',false],
    ['NFO','Leeds United',true],
  ]);
  assert.deepEqual(Object.keys(rows[0]),['team','kickoff','competition','opponent','home','confirmed','source','updatedAt']);
  assert.ok(rows.every(row=>row.confirmed&&row.source===CLUB_SCHEDULE_SOURCES.eflCup));
});

test('UEFA normalizer accepts adult first teams and excludes youth or women fixtures',()=>{
  const senior=(name,code='GER')=>({internationalName:name,countryCode:code,teamTypeDetail:'DOMESTIC_MEN_TEAM_A',isPlaceHolder:false});
  const definition={id:'1',name:'UEFA Champions League',source:CLUB_SCHEDULE_SOURCES.ucl};
  const payload=[
    {competition:{id:'1',sex:'MALE',age:'ADULT'},status:'UPCOMING',kickOffTime:{dateTime:'2026-09-16T19:00:00Z'},homeTeam:senior('Arsenal','ENG'),awayTeam:senior('Bayern München')},
    {competition:{id:'1',sex:'FEMALE',age:'ADULT'},status:'UPCOMING',kickOffTime:{dateTime:'2026-09-17T19:00:00Z'},homeTeam:{...senior('Arsenal Women','ENG'),teamTypeDetail:'DOMESTIC_WOMEN_TEAM_A'},awayTeam:{...senior('Lyon Women'),teamTypeDetail:'DOMESTIC_WOMEN_TEAM_A'}},
    {competition:{id:'1',sex:'MALE',age:'YOUTH'},status:'UPCOMING',kickOffTime:{dateTime:'2026-09-18T19:00:00Z'},homeTeam:{...senior('Arsenal U19','ENG'),teamTypeDetail:'DOMESTIC_MEN_TEAM_U19'},awayTeam:{...senior('Inter U19'),teamTypeDetail:'DOMESTIC_MEN_TEAM_U19'}},
  ];
  const rows=parseUefaMatches(payload,teams,definition,updatedAt);
  assert.equal(rows.length,1);
  assert.equal(rows[0].team,'ARS');
  assert.equal(rows[0].opponent,'Bayern München');
});

test('FA Cup parser converts official UK local kickoff time and rejects academy rows',()=>{
  const html=`<div class="mod-FACup-fixtures"><table class="gTable">
    <tr><td class="headl">Tuesday 25 August 2026</td><td class="headr">Second Round</td></tr>
    <tr class="even"><td class="cOne first"><time>19:45</time></td><td class="cThree">Stoke City</td><td class="cFive">Hull City</td></tr>
    <tr class="odd"><td class="cOne first"><time>20:00</time></td><td class="cThree">Arsenal U21</td><td class="cFive">Chelsea Academy</td></tr>
  </table></div>`;
  const rows=parseFaCupHtml(html,teams,updatedAt);
  assert.equal(rows.length,1);
  assert.equal(rows[0].team,'HUL');
  assert.equal(rows[0].kickoff,'2026-08-25T18:45:00.000Z');
  assert.equal(rows[0].competition,'FA Cup');
});

test('dedupe uses club, kickoff, opponent and competition identity',()=>{
  const fixture={team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Inter',home:true,confirmed:true,source:CLUB_SCHEDULE_SOURCES.ucl,updatedAt};
  const later={...fixture,updatedAt:'2026-08-12T06:00:00Z'};
  const rows=dedupeFixtures([fixture,later,{...fixture,competition:'FA Cup'}]);
  assert.equal(rows.length,2);
  assert.equal(rows.find(row=>row.competition==='UEFA Champions League').updatedAt,'2026-08-12T06:00:00.000Z');
});

test('failed source retains its last-known-good fixtures while successful source is replaced',()=>{
  const oldEfl={team:'HUL',kickoff:'2026-08-25T18:45:00Z',competition:'Carabao Cup',opponent:'Stoke City',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.eflCup,updatedAt:'2026-08-11T00:00:00Z'};
  const oldUefa={team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Inter',home:true,confirmed:true,source:CLUB_SCHEDULE_SOURCES.ucl,updatedAt:'2026-08-11T00:00:00Z'};
  const freshUefa={...oldUefa,opponent:'Bayern München',updatedAt};
  const merged=mergeSourceResults([oldEfl,oldUefa],[
    {source:CLUB_SCHEDULE_SOURCES.eflCup,ok:false,fixtures:[],error:'upstream timeout'},
    {source:CLUB_SCHEDULE_SOURCES.ucl,ok:true,fixtures:[freshUefa],error:''},
  ]);
  assert.equal(merged.length,2);
  assert.ok(merged.some(row=>row.team==='HUL'&&row.updatedAt==='2026-08-11T00:00:00.000Z'));
  assert.ok(merged.some(row=>row.opponent==='Bayern München'));
  assert.ok(!merged.some(row=>row.opponent==='Inter'));
});

class MemoryStatement{
  constructor(db,sql){this.db=db;this.sql=sql;this.args=[]}
  bind(...args){this.args=args;return this}
  async all(){
    if(/SELECT code,name FROM teams/.test(this.sql))return{results:this.db.teams};
    if(/SELECT key,value,updated_at FROM meta/.test(this.sql))return{results:[...this.db.meta].map(([key,row])=>({key,value:row.value,updated_at:row.updatedAt}))};
    throw new Error(`Unexpected all query: ${this.sql}`)
  }
  async first(){
    const literal=this.sql.match(/WHERE key='([^']+)'/)?.[1];
    if(literal)return this.db.meta.get(literal)||null;
    throw new Error(`Unexpected first query: ${this.sql}`)
  }
  async run(){
    if(/INSERT INTO meta/.test(this.sql)){
      const [key,value,updatedAt]=this.args;this.db.meta.set(key,{value,updatedAt});return{meta:{changes:1}}
    }
    throw new Error(`Unexpected run query: ${this.sql}`)
  }
}

class MemoryDb{
  constructor(initial={}){
    this.teams=teams;
    this.meta=new Map(Object.entries(initial).map(([key,value])=>[key,{value,updatedAt:updatedAt}]));
  }
  prepare(sql){return new MemoryStatement(this,sql)}
  async batch(statements){for(const statement of statements)await statement.run();return statements.map(()=>({success:true}))}
}

test('refresh persists partial success without wiping failed-provider data, then preserves it when all providers fail',async()=>{
  const oldEfl={team:'HUL',kickoff:'2026-08-25T18:45:00Z',competition:'Carabao Cup',opponent:'Stoke City',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.eflCup,updatedAt:'2026-08-11T00:00:00Z'};
  const freshUefa={team:'ARS',kickoff:'2026-09-16T19:00:00Z',competition:'UEFA Champions League',opponent:'Bayern München',home:true,confirmed:true,source:CLUB_SCHEDULE_SOURCES.ucl,updatedAt};
  const db=new MemoryDb({season:'2026/27',club_schedule_json:JSON.stringify([oldEfl]),club_schedule_updated_at:'2026-08-11T00:00:00Z'});
  const env={DB:db};
  const partial=await refreshClubSchedule(env,{nowMs:Date.parse(updatedAt),sourceLoaders:[
    async()=>({source:CLUB_SCHEDULE_SOURCES.eflCup,ok:false,fixtures:[],error:'timeout'}),
    async()=>({source:CLUB_SCHEDULE_SOURCES.ucl,ok:true,fixtures:[freshUefa],error:''}),
  ]});
  assert.equal(partial.ok,true);
  assert.equal(partial.staleSourcesRetained,true);
  const afterPartial=JSON.parse(db.meta.get('club_schedule_json').value);
  assert.equal(afterPartial.length,2);
  assert.ok(afterPartial.some(row=>row.team==='HUL'));
  assert.ok(afterPartial.some(row=>row.team==='ARS'));
  const savedJson=db.meta.get('club_schedule_json').value;
  const savedUpdatedAt=db.meta.get('club_schedule_updated_at').value;

  const failed=await refreshClubSchedule(env,{nowMs:Date.parse('2026-08-12T06:00:00Z'),sourceLoaders:[
    async()=>({source:CLUB_SCHEDULE_SOURCES.eflCup,ok:false,fixtures:[],error:'still down'}),
    async()=>({source:CLUB_SCHEDULE_SOURCES.ucl,ok:false,fixtures:[],error:'also down'}),
  ]});
  assert.equal(failed.ok,false);
  assert.equal(db.meta.get('club_schedule_json').value,savedJson);
  assert.equal(db.meta.get('club_schedule_updated_at').value,savedUpdatedAt);
});

/* Regression tests for the 20 Aug 2026 miss: Brighton played a Conference
   League playoff at Tromso and the fixture never reached the congestion
   calendar. All three UEFA calls returned 200, parsed cleanly, matched nothing,
   and still counted as successful, so health reported no European problem. */

const UECL={id:'2032',name:'UEFA Conference League',source:CLUB_SCHEDULE_SOURCES.uecl};

function ueclMatch(overrides={}){
  return{
    competition:{id:'2032',sex:'MALE',age:'ADULT'},
    status:'UPCOMING',
    kickOffTime:{dateTime:'2026-08-20T18:00:00Z'},
    homeTeam:{internationalName:'Tromso',teamTypeDetail:'DOMESTIC_MEN_TEAM_A'},
    awayTeam:{internationalName:'Brighton',teamTypeDetail:'DOMESTIC_MEN_TEAM_A'},
    ...overrides,
  };
}

test('UEFA parser keeps a playoff-round tie under a qualifying competition id',()=>{
  const rows=parseUefaMatches([ueclMatch({competition:{id:'2032_QUAL',sex:'MALE',age:'ADULT'}})],teams,UECL,updatedAt);
  assert.equal(rows.length,1);
  assert.equal(rows[0].team,'BHA');
  assert.equal(rows[0].home,false);
  assert.equal(rows[0].competition,'UEFA Conference League');
});

test('UEFA parser keeps a first-team tie whose team type is an unrecognised senior label',()=>{
  const rows=parseUefaMatches([ueclMatch({
    awayTeam:{internationalName:'Brighton',teamTypeDetail:'DOMESTIC_MEN_TEAM_QUALIFIER'},
  })],teams,UECL,updatedAt);
  assert.equal(rows.length,1);
  assert.equal(rows[0].team,'BHA');
});

test('an unresolved placeholder opponent no longer erases the tracked club fixture',()=>{
  const rows=parseUefaMatches([ueclMatch({
    homeTeam:{internationalName:'Winner Q3 Path C',isPlaceHolder:true},
  })],teams,UECL,updatedAt);
  assert.equal(rows.length,1);
  assert.equal(rows[0].team,'BHA');
  assert.equal(rows[0].home,false);
});

test('women and youth team types are still rejected after the allowlist became a blocklist',()=>{
  for(const teamTypeDetail of ['DOMESTIC_WOMEN_TEAM_A','DOMESTIC_MEN_TEAM_U19','DOMESTIC_MEN_TEAM_U21','DOMESTIC_YOUTH_TEAM']){
    const rows=parseUefaMatches([ueclMatch({awayTeam:{internationalName:'Brighton',teamTypeDetail}})],teams,UECL,updatedAt);
    assert.equal(rows.length,0,teamTypeDetail);
  }
});

test('a genuinely different competition is still rejected, and the reason is counted',()=>{
  const stats={};
  const rows=parseUefaMatches([ueclMatch({competition:{id:'1',sex:'MALE',age:'ADULT'}})],teams,UECL,updatedAt,stats);
  assert.equal(rows.length,0);
  assert.equal(stats.competition,1);
  assert.equal(stats.kept,0);
  assert.equal(stats.total,1);
});

test('drop telemetry attributes every rejected row to a specific filter',()=>{
  const stats={};
  const rows=parseUefaMatches([
    ueclMatch(),
    ueclMatch({status:'POSTPONED'}),
    ueclMatch({awayTeam:{internationalName:'Brighton Women',teamTypeDetail:'DOMESTIC_WOMEN_TEAM_A'}}),
    ueclMatch({homeTeam:{internationalName:'Tromso'},awayTeam:{internationalName:'Molde'}}),
  ],teams,UECL,updatedAt,stats);
  assert.equal(rows.length,1);
  assert.deepEqual(
    {total:stats.total,kept:stats.kept,status:stats.status,nonSenior:stats.nonSenior,noTrackedClub:stats.noTrackedClub},
    {total:4,kept:1,status:1,nonSenior:1,noTrackedClub:1}
  );
});

test('a source that regresses to zero rows is flagged and keeps its last-known-good fixtures',()=>{
  const priorUefa={team:'BHA',kickoff:'2026-08-20T18:00:00Z',competition:'UEFA Conference League',opponent:'Tromso',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.uecl,updatedAt:'2026-08-19T00:00:00Z'};
  const results=[{source:CLUB_SCHEDULE_SOURCES.uecl,ok:true,fixtures:[],error:''}];
  assert.deepEqual(zeroYieldRegressions([priorUefa],results),[CLUB_SCHEDULE_SOURCES.uecl]);
  const merged=mergeSourceResults([priorUefa],results);
  assert.equal(merged.length,1,'the European fixture must survive a silently empty parse');
  assert.equal(merged[0].team,'BHA');
});

test('a source that has never yielded rows is not treated as a regression',()=>{
  const priorEfl={team:'HUL',kickoff:'2026-08-25T18:45:00Z',competition:'Carabao Cup',opponent:'Stoke City',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.eflCup,updatedAt:'2026-08-19T00:00:00Z'};
  const results=[{source:CLUB_SCHEDULE_SOURCES.faCup,ok:true,fixtures:[],error:''}];
  assert.deepEqual(zeroYieldRegressions([priorEfl],results),[]);
});

test('health reports partial and names the degraded provider when a source silently empties',()=>{
  const nowMs=Date.parse('2026-08-20T18:00:00Z');
  const fixture={team:'HUL',kickoff:'2026-08-25T18:45:00Z',competition:'Carabao Cup',opponent:'Stoke City',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.eflCup,updatedAt:'2026-08-20T14:00:00Z'};
  const health=clubScheduleHealthFromMeta({
    club_schedule_json:JSON.stringify([fixture]),
    club_schedule_updated_at:'2026-08-20T14:00:00Z',
    club_schedule_last_error:'',
    club_schedule_source_report:JSON.stringify([
      {source:CLUB_SCHEDULE_SOURCES.eflCup,ok:true,yielded:1,degraded:false,error:null},
      {source:CLUB_SCHEDULE_SOURCES.uecl,ok:true,yielded:0,degraded:true,error:null,detail:{total:64,kept:0,competition:64}},
    ]),
  },nowMs);
  assert.equal(health.status,'partial','a zero-yield provider must not read as a clean bill of health');
  assert.deepEqual(health.degradedSources,[CLUB_SCHEDULE_SOURCES.uecl]);
  assert.deepEqual(health.fixturesByCompetition,{'Carabao Cup':1});
  assert.equal(health.sources.find(s=>s.source===CLUB_SCHEDULE_SOURCES.uecl).detail.competition,64);
});

test('health stays ok when every provider yields and nothing regressed',()=>{
  const nowMs=Date.parse('2026-08-20T18:00:00Z');
  const fixture={team:'BHA',kickoff:'2026-08-20T18:00:00Z',competition:'UEFA Conference League',opponent:'Tromso',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.uecl,updatedAt:'2026-08-20T14:00:00Z'};
  const health=clubScheduleHealthFromMeta({
    club_schedule_json:JSON.stringify([fixture]),
    club_schedule_updated_at:'2026-08-20T14:00:00Z',
    club_schedule_last_error:'',
    club_schedule_source_report:JSON.stringify([{source:CLUB_SCHEDULE_SOURCES.uecl,ok:true,yielded:1,degraded:false,error:null}]),
  },nowMs);
  assert.equal(health.status,'ok');
  assert.deepEqual(health.degradedSources,[]);
  assert.deepEqual(health.fixturesByCompetition,{'UEFA Conference League':1});
});

test('refresh persists a per-source report and retains European rows when UEFA silently empties',async()=>{
  const priorUefa={team:'BHA',kickoff:'2026-08-20T18:00:00Z',competition:'UEFA Conference League',opponent:'Tromso',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.uecl,updatedAt:'2026-08-19T00:00:00Z'};
  const freshEfl={team:'HUL',kickoff:'2026-08-25T18:45:00Z',competition:'Carabao Cup',opponent:'Stoke City',home:false,confirmed:true,source:CLUB_SCHEDULE_SOURCES.eflCup,updatedAt};
  const db=new MemoryDb({season:'2026/27',club_schedule_json:JSON.stringify([priorUefa]),club_schedule_updated_at:'2026-08-19T00:00:00Z'});
  const result=await refreshClubSchedule({DB:db},{nowMs:Date.parse(updatedAt),sourceLoaders:[
    async()=>({source:CLUB_SCHEDULE_SOURCES.eflCup,ok:true,fixtures:[freshEfl],error:'',yielded:1}),
    async()=>({source:CLUB_SCHEDULE_SOURCES.uecl,ok:true,fixtures:[],error:'',yielded:0,detail:{total:64,kept:0,competition:64}}),
  ]});
  assert.equal(result.ok,true);
  assert.equal(result.sourcesDegraded,1);
  assert.deepEqual(result.degraded,[CLUB_SCHEDULE_SOURCES.uecl]);
  assert.equal(result.staleSourcesRetained,true);

  const saved=JSON.parse(db.meta.get('club_schedule_json').value);
  assert.ok(saved.some(row=>row.team==='BHA'),'the silently-emptied provider must keep its European fixture');
  assert.ok(saved.some(row=>row.team==='HUL'));

  const report=JSON.parse(db.meta.get('club_schedule_source_report').value);
  const uecl=report.find(row=>row.source===CLUB_SCHEDULE_SOURCES.uecl);
  assert.equal(uecl.ok,true);
  assert.equal(uecl.yielded,0);
  assert.equal(uecl.degraded,true);
  assert.equal(uecl.detail.competition,64);

  const health=clubScheduleHealthFromMeta({
    ...Object.fromEntries([...db.meta].map(([k,v])=>[k,v.value])),
  },Date.parse(updatedAt));
  assert.equal(health.status,'partial');
  assert.deepEqual(health.degradedSources,[CLUB_SCHEDULE_SOURCES.uecl]);
});
