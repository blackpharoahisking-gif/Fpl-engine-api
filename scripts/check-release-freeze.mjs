import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const MODEL_SEMANTIC_FILES=new Set([
  'app-core.js','scoring-integrity.js','market-projection-sync.js','app-live-points.js'
]);
export function isProductionFile(path){
  return !!path && !/^(?:test\/|tests\/|docs\/|scripts\/|\.github\/|README(?:\.|$)|LICENSE(?:\.|$))/.test(path);
}
export function freezeDecision({deadlineMs,nowMs=Date.now(),files=[],breakGlass=false}={}){
  const until=deadlineMs-nowMs,modelTouched=files.some(f=>MODEL_SEMANTIC_FILES.has(f)),productionTouched=files.some(isProductionFile);
  if(!Number.isFinite(until)||until<=0)return{allowed:true,mode:'POST_DEADLINE',modelTouched,productionTouched};
  if(until<=90*60*1000&&productionTouched)return{allowed:!!breakGlass,mode:'FULL_FREEZE',modelTouched,productionTouched,requiresBreakGlass:true};
  if(until<=6*60*60*1000&&modelTouched)return{allowed:!!breakGlass,mode:'MODEL_FREEZE',modelTouched,productionTouched,requiresBreakGlass:true};
  return{allowed:true,mode:until<=6*60*60*1000?'MODEL_FREEZE':'OPEN',modelTouched,productionTouched};
}
async function nextDeadlineMs(){
  if(process.env.OTB_DEADLINE_ISO){const t=Date.parse(process.env.OTB_DEADLINE_ISO);if(Number.isFinite(t))return t}
  const r=await fetch('https://fantasy.premierleague.com/api/bootstrap-static/',{headers:{accept:'application/json','user-agent':'OTB-release-governance'}});
  if(!r.ok)throw new Error(`FPL deadline lookup failed: HTTP ${r.status}`);
  const data=await r.json(),now=Date.now(),events=(data?.events||[]).map(e=>Date.parse(e.deadline_time||'')).filter(Number.isFinite).filter(t=>t>now).sort((a,b)=>a-b);
  if(!events.length)throw new Error('No future FPL deadline found');
  return events[0];
}
function changedFiles(){
  if(process.env.OTB_CHANGED_FILES)return process.env.OTB_CHANGED_FILES.split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean);
  const base=process.env.BASE_SHA,head=process.env.HEAD_SHA||'HEAD';
  if(!base)throw new Error('BASE_SHA or OTB_CHANGED_FILES is required');
  return execFileSync('git',['diff','--name-only',base,head],{encoding:'utf8'}).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
}
export async function main(){
  const files=changedFiles(),deadlineMs=await nextDeadlineMs(),title=String(process.env.PR_TITLE||''),breakGlass=/\[P0-BREAK-GLASS\]/i.test(title),d=freezeDecision({deadlineMs,files,breakGlass});
  const hours=(deadlineMs-Date.now())/36e5;
  console.log(`OTB release gate: ${d.mode} · T${hours>=0?'-':'+'}${Math.abs(hours).toFixed(2)}h · ${files.length} changed file(s)`);
  if(breakGlass)console.log('P0 break-glass marker present. Accountability/build drift remains mandatory; only the release freeze is bypassed.');
  if(!d.allowed){
    const scope=d.mode==='FULL_FREEZE'?'production deploys':'projection/scoring semantic changes';
    throw new Error(`${scope} are frozen before the FPL deadline. Use [P0-BREAK-GLASS] only for a genuine P0 incident.`);
  }
}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href)main().catch(err=>{console.error(err?.stack||err);process.exitCode=1});
