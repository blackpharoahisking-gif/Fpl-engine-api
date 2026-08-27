/* OTB 2026.08.26.6 — player market-impact explainability.
   Preserves live-points/chip-history, signed D1 accountability, global market
   projection hydration and scoring-integrity behaviour. Adds an inspector-only
   counterfactual showing model-only xPts versus the normal market-blended xPts. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.6';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.6';

  const append=(src,label,onload=null)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    if(typeof onload==='function')script.onload=onload;
    script.onerror=()=>console.error(`OTB ${label} failed to load`);
    (document.body||document.documentElement).appendChild(script);
    return script;
  };

  /* Install first. It rewrites stale ?build= links to the newest runtime and
     watches only the release metadata, so old feature layers can never lower
     the global build identity after they finish booting. */
  append('release-identity.js?v=2026.08.26.6-release','release-identity guard');

  const accountability=()=>append('cloud-accountability.js?v=2026.08.26.2-cloud','canonical-accountability layer');
  append('app-live-points.js?v=2026.08.26.6-live','live-points layer',()=>{
    /* app-live-points appends app-core.js. Feature bridges wait for the core
       globals, so they remain thin, reversible production layers. */
    append('scoring-integrity.js?v=2026.08.26.4-scoring','scoring-integrity layer');
    append('market-projection-sync.js?v=2026.08.26.4-market','market projection sync');
    append('market-impact-inspector.js?v=2026.08.26.6-market-impact','player market-impact inspector');
    accountability();
  });
})();