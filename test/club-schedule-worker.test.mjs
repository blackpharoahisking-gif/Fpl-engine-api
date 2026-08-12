import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CLUB_SCHEDULE_SOURCES,
  dedupeFixtures,
  mergeSourceResults,
  parseEflMatches,
  parseFaCupHtml,
  parseUefaMatches,
  refreshClubSchedule,
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
