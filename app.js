/* OTB 2026.08.29.4 — frozen-input variance propagation repair.
   Preserves the proven live/core-first startup contract and every existing
   decision/model layer. The repair is a bounded post-core layer: it fixes
   predictive-mixture variance propagation, shared horizon uncertainty,
   Schedule captain risk consumption and OTB-generated full-XI fallbacks,
   while recording the 2026.08.28.1 legacy-vs-repaired probe on identical
   frozen inputs before the XI fallback changes can affect the comparison. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.29.4';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.29.4';

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
  live.src='app-live-points.js?v=2026.08.29.4-live';
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

    /* Identity correction remains deliberately late and non-critical. */
    append('release-identity.js?v=2026.08.29.4-release','release-identity helper');

    /* Bounded live-season variance repair. It retains direct references to the
       loaded 08.28.1 core functions, so its frozen probe executes the actual
       old and new consumers against one pinned state rather than reconstructing
       a historical number from memory or from later market data. */
    append('variance-propagation.js?v=2026.08.29.4-variance','variance propagation repair');

    /* Belief Capture v0 is a passive sidecar. It only observes already-produced
       decision state and fails open: a recorder failure cannot block OTB-live. */
    append('belief-capture.js?v=belief-capture-v0.1','belief capture recorder');
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();
