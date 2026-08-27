/* OTB release identity guard — 2026.08.26.6
   ---------------------------------------------------------------
   A production build may include compatibility layers whose own feature
   revision is older than the top-level app release. Those layers must never
   be allowed to overwrite the release identity of the runtime that loaded
   them. This guard also repairs stale bookmarked ?build= cache keys so a
   successful upgrade remains upgraded on the next reload. */
(function installOtbReleaseIdentity(){
  'use strict';
  const RELEASE='2026.08.26.6';
  let applying=false;

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
    if(applying)return currentIdentity();
    applying=true;
    try{
      const build=currentIdentity();
      if(document.documentElement?.dataset)document.documentElement.dataset.build=build;
      const meta=document.querySelector?.('meta[name="otb-build"]');if(meta&&compare(meta.content,build)<0)meta.content=build;
      const badge=document.getElementById?.('buildBadge');
      if(badge&&compare(String(badge.textContent||'').replace(/^BUILD\s+/i,'2026.'),build)<0)badge.textContent=`BUILD ${short(build)}`;
      normalizeUrl(build);
      globalThis.__OTB_RELEASE_IDENTITY__={release:RELEASE,current:build,compare,newer,apply:applyIdentity};
      return build;
    }finally{applying=false}
  }

  applyIdentity();

  /* Legacy layers currently mutate data-build/meta during late boot. Observe
     those two authoritative metadata locations only; do not watch badge text,
     so the normal "checking for update" UI remains free to use the badge. */
  try{
    const observer=new MutationObserver(()=>queueMicrotask(applyIdentity));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-build']});
    const meta=document.querySelector('meta[name="otb-build"]');
    if(meta)observer.observe(meta,{attributes:true,attributeFilter:['content']});
    globalThis.__OTB_RELEASE_IDENTITY_OBSERVER__=observer;
  }catch(_){ }

  /* Reassert through the asynchronous core/live boot window. These are cheap,
     bounded checks and catch a late legacy write even where MutationObserver
     is unavailable or throttled. */
  for(const delay of [50,250,1000,3000,8000])setTimeout(applyIdentity,delay);
})();