/* OTB release identity helper — 2026.08.28.1
   ---------------------------------------------------------------
   Non-critical, bounded release metadata repair. It never participates in
   core startup and deliberately uses no MutationObserver, so it cannot create
   a self-triggering microtask loop that starves app initialisation. */
(function installOtbReleaseIdentity(){
  'use strict';
  const RELEASE='2026.08.28.1';

  const parts=v=>String(v||'').split('.').map(x=>Number.parseInt(x,10)||0);
  function compare(a,b){
    const aa=parts(a),bb=parts(b),n=Math.max(aa.length,bb.length);
    for(let i=0;i<n;i++){
      const d=(aa[i]||0)-(bb[i]||0);
      if(d)return d>0?1:-1;
    }
    return 0;
  }
  const newer=(a,b)=>compare(a,b)>=0?(a||b):(b||a);
  const short=v=>{
    const p=String(v||'').split('.');
    return p.length>=4?p.slice(1).join('.'):String(v||'');
  };

  function currentIdentity(){
    const html=String(document.documentElement?.dataset?.build||'');
    const meta=String(document.querySelector?.('meta[name="otb-build"]')?.content||'');
    return newer(newer(html,meta),RELEASE);
  }

  function normalizeUrl(build){
    try{
      const url=new URL(location.href);
      const requested=url.searchParams.get('build')||'';
      const safe=newer(requested,build);
      if(requested!==safe){
        url.searchParams.set('build',safe);
        history.replaceState(history.state,'',url.href);
      }else if(!requested){
        url.searchParams.set('build',build);
        history.replaceState(history.state,'',url.href);
      }
    }catch(_){ }
  }

  function applyIdentity(){
    const build=currentIdentity();
    const html=String(document.documentElement?.dataset?.build||'');
    if(document.documentElement?.dataset&&compare(html,build)<0)document.documentElement.dataset.build=build;
    const meta=document.querySelector?.('meta[name="otb-build"]');
    if(meta&&compare(String(meta.content||''),build)<0)meta.content=build;
    const badge=document.getElementById?.('buildBadge');
    if(badge&&compare(String(badge.textContent||'').replace(/^BUILD\s+/i,'2026.'),build)<0)badge.textContent=`BUILD ${short(build)}`;
    normalizeUrl(build);
    globalThis.__OTB_RELEASE_IDENTITY__={release:RELEASE,current:build,compare,newer,apply:applyIdentity};
    return build;
  }

  applyIdentity();

  /* Bounded late-write repair only. No observers, intervals or recursive
     scheduling. Older compatibility layers finish during this boot window. */
  for(const delay of [100,500,1500,4000,8000])setTimeout(applyIdentity,delay);
})();
