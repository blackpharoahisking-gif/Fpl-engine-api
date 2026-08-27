/* OTB 2026.08.26.7 — restore last-known-good startup order.
   Reverts the production boot sequence to the proven 08.26.4 shape: the live
   layer loads first and appends app-core.js; scoring, market hydration and the
   inspector-only market-impact bridge remain passive post-core layers. The
   release-identity helper is loaded last and cannot gate core startup. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.7';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.7';

  const append=(src,label)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onerror=()=>console.error(`OTB ${label} failed to load`);
    (document.body||document.documentElement).appendChild(script);
    return script;
  };

  const accountability=()=>append('cloud-accountability.js?v=2026.08.26.2-cloud','canonical-accountability layer');

  /* Last-known-good 08.26.4 startup contract: live/core first. */
  const live=document.createElement('script');
  live.src='app-live-points.js?v=2026.08.26.7-live';
  live.async=false;
  live.onload=()=>{
    /* app-live-points appends app-core.js. These bridges wait for core globals
       and therefore cannot block or own initialisation. */
    append('scoring-integrity.js?v=2026.08.26.4-scoring','scoring-integrity layer');
    append('market-projection-sync.js?v=2026.08.26.7-market','market projection sync');
    append('market-impact-inspector.js?v=2026.08.26.6-market-impact','player market-impact inspector');
    accountability();

    /* Identity correction is deliberately last and non-critical. */
    append('release-identity.js?v=2026.08.26.7-release','release-identity helper');
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();
