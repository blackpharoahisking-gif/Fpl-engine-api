/* OTB 2026.08.26.4 — scoring integrity invariants.
   Preserves the existing live-points/chip-history, signed D1 accountability
   and global market-projection hydration layers, then installs a generic
   scoring-law bridge so every player projection obeys FPL component ceilings. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.4';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.4';

  const accountability=()=>{
    const script=document.createElement('script');
    script.src='cloud-accountability.js?v=2026.08.26.2-cloud';
    script.async=false;
    script.onerror=()=>console.error('OTB canonical-accountability layer failed to load');
    (document.body||document.documentElement).appendChild(script);
  };

  const live=document.createElement('script');
  live.src='app-live-points.js?v=2026.08.26.4-live';
  live.async=false;
  live.onload=()=>{
    /* app-live-points appends app-core.js. Both bridges below wait for the
       core globals, so they remain thin, reversible production layers. */
    const scoring=document.createElement('script');
    scoring.src='scoring-integrity.js?v=2026.08.26.4-scoring';
    scoring.async=false;
    scoring.onerror=()=>console.error('OTB scoring-integrity layer failed to load');
    (document.body||document.documentElement).appendChild(scoring);

    const market=document.createElement('script');
    market.src='market-projection-sync.js?v=2026.08.26.4-market';
    market.async=false;
    market.onerror=()=>console.error('OTB market projection sync failed to load');
    (document.body||document.documentElement).appendChild(market);
    accountability();
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();