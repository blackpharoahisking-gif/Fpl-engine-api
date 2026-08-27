/* OTB 2026.08.26.3 — global market projection hydration.
   Preserves the existing 2026.08.26.1 live-points/chip-history patch and
   2026.08.26.2 signed D1 accountability layer, then adds a lifecycle bridge
   that keeps fresh market evidence available to projections on every tab,
   including low-power/mobile sessions. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.3';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.3';

  const accountability=()=>{
    const script=document.createElement('script');
    script.src='cloud-accountability.js?v=2026.08.26.2-cloud';
    script.async=false;
    script.onerror=()=>console.error('OTB canonical-accountability layer failed to load');
    (document.body||document.documentElement).appendChild(script);
  };

  const live=document.createElement('script');
  live.src='app-live-points.js?v=2026.08.26.3-live';
  live.async=false;
  live.onload=()=>{
    /* app-live-points asynchronously appends app-core.js. The market bridge
       therefore waits for the core globals before doing anything; loading it
       here is safe and keeps this change independent of projection maths. */
    const market=document.createElement('script');
    market.src='market-projection-sync.js?v=2026.08.26.3-market';
    market.async=false;
    market.onerror=()=>console.error('OTB market projection sync failed to load');
    (document.body||document.documentElement).appendChild(market);
    accountability();
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();