import core from './index-core.js';
import { handleBrowserEvaluationRoute } from './evaluation-device.js';

const FPL_ORIGIN='https://fantasy.premierleague.com/api';
const CORS={
  'access-control-allow-origin':'*',
  'access-control-allow-methods':'GET, OPTIONS',
  'access-control-allow-headers':'content-type',
};

const positiveInt=value=>{
  const n=Math.trunc(Number(value));
  return Number.isFinite(n)&&n>0?n:0;
};
const validGw=value=>{
  const n=positiveInt(value);
  return n>=1&&n<=38?n:0;
};
const errorJson=(message,status=400)=>new Response(JSON.stringify({error:message}),{
  status,
  headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...CORS},
});

async function proxyFpl(path,cacheSeconds=30){
  const upstream=await fetch(`${FPL_ORIGIN}${path}`,{
    headers:{accept:'application/json','user-agent':'FPLEngine/2.29 public-read-proxy'},
    cf:{cacheTtl:cacheSeconds,cacheEverything:true},
  });
  const body=await upstream.arrayBuffer();
  const contentType=upstream.headers.get('content-type')||'application/json; charset=utf-8';
  return new Response(body,{
    status:upstream.status,
    headers:{
      'content-type':contentType,
      'cache-control':upstream.ok?`public, max-age=${cacheSeconds}`:'no-store',
      ...CORS,
    },
  });
}

async function publicFplRoute(request){
  if(request.method!=='GET')return null;
  const url=new URL(request.url);
  const path=url.pathname.replace(/\/+$/,'')||'/';
  let match;

  if(path==='/api/entry'){
    const id=positiveInt(url.searchParams.get('id'));
    return id?proxyFpl(`/entry/${id}/`,60):errorJson('A valid FPL team id is required.');
  }

  match=path.match(/^\/api\/entry\/(\d+)$/);
  if(match){
    const id=positiveInt(match[1]);
    return id?proxyFpl(`/entry/${id}/`,60):errorJson('A valid FPL team id is required.');
  }

  if(path==='/api/entry-history'){
    const id=positiveInt(url.searchParams.get('id'));
    return id?proxyFpl(`/entry/${id}/history/`,60):errorJson('A valid FPL team id is required.');
  }

  match=path.match(/^\/api\/entry\/(\d+)\/history$/);
  if(match){
    const id=positiveInt(match[1]);
    return id?proxyFpl(`/entry/${id}/history/`,60):errorJson('A valid FPL team id is required.');
  }

  if(path==='/api/entry-picks'){
    const id=positiveInt(url.searchParams.get('id'));
    const gw=validGw(url.searchParams.get('gw'));
    return id&&gw?proxyFpl(`/entry/${id}/event/${gw}/picks/`,30):errorJson('Valid FPL team id and gameweek are required.');
  }

  match=path.match(/^\/api\/entry\/(\d+)\/event\/(\d+)\/picks$/);
  if(match){
    const id=positiveInt(match[1]),gw=validGw(match[2]);
    return id&&gw?proxyFpl(`/entry/${id}/event/${gw}/picks/`,30):errorJson('Valid FPL team id and gameweek are required.');
  }

  if(path==='/api/event-live'){
    const gw=validGw(url.searchParams.get('gw'));
    return gw?proxyFpl(`/event/${gw}/live/`,20):errorJson('A valid gameweek is required.');
  }

  match=path.match(/^\/event\/(\d+)\/live$/);
  if(match){
    const gw=validGw(match[1]);
    return gw?proxyFpl(`/event/${gw}/live/`,20):errorJson('A valid gameweek is required.');
  }

  return null;
}

export default {
  async scheduled(event,env,ctx){
    if(typeof core?.scheduled==='function')return core.scheduled(event,env,ctx);
  },
  async fetch(request,env,ctx){
    try{
      const evaluation=await handleBrowserEvaluationRoute(request,env);
      if(evaluation)return evaluation;
    }catch(err){
      const origin=request.headers.get('origin')||'';
      const allowed=String(env.EVALUATION_ALLOWED_ORIGIN||env.ALLOWED_ORIGIN||'').trim();
      return new Response(JSON.stringify({error:`Canonical evaluation route failed: ${String(err?.message||err)}`}),{
        status:500,
        headers:{
          'content-type':'application/json; charset=utf-8',
          'cache-control':'no-store',
          'access-control-allow-origin':allowed||origin||'*',
          'access-control-allow-methods':'GET, POST, OPTIONS',
          'access-control-allow-headers':'content-type, authorization, x-admin-key, x-evaluation-key, x-evaluation-device, x-evaluation-timestamp, x-evaluation-signature',
        },
      });
    }
    if(request.method==='OPTIONS'){
      const url=new URL(request.url);
      if(url.pathname.startsWith('/api/entry')||url.pathname.startsWith('/api/event-live')||/^\/event\/\d+\/live\/?$/.test(url.pathname)){
        return new Response(null,{status:204,headers:CORS});
      }
      return core.fetch(request,env,ctx);
    }
    try{
      const proxied=await publicFplRoute(request);
      if(proxied)return proxied;
    }catch(err){
      return errorJson(`FPL public read failed: ${String(err?.message||err)}`,502);
    }
    return core.fetch(request,env,ctx);
  },
};