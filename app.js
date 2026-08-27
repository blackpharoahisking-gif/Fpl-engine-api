/* OTB 2026.08.26.5 — monotonic release identity.
   Preserves the existing live-points/chip-history, signed D1 accountability,
   global market-projection hydration and scoring-integrity layers, while a
   tiny release guard prevents older compatibility layers or stale build query
   parameters from downgrading the identity of a newer runtime. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.5';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.5';

  const append=(src,label)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onerror=()=>console.error(`OTB ${label} failed to load`);
    (document.body||document.documentElement).appendChild(script);
    return script;
  };

  /* Install first. It rewrites stale ?build= links to the newest runtime and
     watches only the release metadata, so old feature layers can never lower
     the global build identity after they finish booting. */
  append('release-identity.js?v=2026.08.26.5-release','release-identity guard');

  const accountability=()=>append('cloud-accountability.js?v=2026.08.26.2-cloud','canonical-accountability layer');
  const live=append('app-live-points.js?v=2026.08.26.5-live','live-points layer');
  live.onload=()=>{
    /* app-live-points appends app-core.js. Both feature bridges below wait for
       the core globals, so they remain thin, reversible production layers. */
    append('scoring-integrity.js?v=2026.08.26.4-scoring','scoring-integrity layer');
    append('market-projection-sync.js?v=2026.08.26.4-market','market projection sync');
    accountability();
  };
})();