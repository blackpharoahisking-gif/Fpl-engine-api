/* OTB 2026.08.27.1 — decision-interface integrity.
   Preserves the proven live/core-first startup contract and all 08.26.9 role
   freshness behaviour. This release changes decision classification/copy only;
   projection, scoring, DefCon, market weights and minutes maths are untouched. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.27.1';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.27.1';

  const append=(src,label)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onerror=()=>console.error(`OTB ${label} failed to load`);
    (document.body||document.documentElement).appendChild(script);
    return script;
  };

  const accountability=()=>append('cloud-accountability.js?v=2026.08.26.2-cloud','legacy canonical-accountability layer');

  /* Last-known-good startup contract: live/core first. */
  const live=document.createElement('script');
  live.src='app-live-points.js?v=2026.08.27.1-live';
  live.async=false;
  live.onload=()=>{
    /* Every layer below waits for core globals and therefore cannot block or
       own initialisation. Projection semantics remain in core/scoring/market. */
    append('scoring-integrity.js?v=2026.08.26.4-scoring','scoring-integrity layer');
    append('market-projection-sync.js?v=2026.08.26.8-market','market projection sync');
    append('market-impact-inspector.js?v=2026.08.26.6-market-impact','player market-impact inspector');
    append('role-freshness-sync.js?v=2026.08.26.9-role-freshness','role freshness downstream sync');
    accountability();
    append('accountability-v2.js?v=2026.08.26.8-accountability-v2','immutable accountability v2');
    append('accountability-governance.js?v=2026.08.26.8-governance','decision/accountability governance');
    append('decision-interface-integrity.js?v=2026.08.27.1-decision-integrity','decision-interface integrity');

    /* Identity correction remains deliberately last and non-critical. */
    append('release-identity.js?v=2026.08.27.1-release','release-identity helper');
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();
