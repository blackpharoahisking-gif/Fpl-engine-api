/* OTB 2026.08.26.8 — immutable accountability + decision governance.
   Preserves the proven 08.26.4/08.26.7 live-core-first startup contract.
   New accountability/governance layers are passive post-core bridges: they do
   not participate in core startup and do not alter projection maths. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.8';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.8';

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
  live.src='app-live-points.js?v=2026.08.26.8-live';
  live.async=false;
  live.onload=()=>{
    /* Every layer below waits for core globals and therefore cannot block or
       own initialisation. Projection semantics remain in core/scoring/market. */
    append('scoring-integrity.js?v=2026.08.26.4-scoring','scoring-integrity layer');
    append('market-projection-sync.js?v=2026.08.26.8-market','market projection sync');
    append('market-impact-inspector.js?v=2026.08.26.6-market-impact','player market-impact inspector');
    accountability();
    append('accountability-v2.js?v=2026.08.26.8-accountability-v2','immutable accountability v2');
    append('accountability-governance.js?v=2026.08.26.8-governance','decision/accountability governance');

    /* Identity correction remains deliberately last and non-critical. */
    append('release-identity.js?v=2026.08.26.8-release','release-identity helper');
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();
