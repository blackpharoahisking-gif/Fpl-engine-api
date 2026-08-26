/* OTB 2026.08.26.2 — canonical D1 projection accountability.
   This lightweight production loader preserves the existing 2026.08.26.1
   live-points/chip-history patch byte-for-byte, then adds the signed D1
   accountability layer. */
(function loadOtbProductionLayers(){
  const BUILD='2026.08.26.2';
  document.documentElement.dataset.build=BUILD;
  const meta=document.querySelector('meta[name="otb-build"]');if(meta)meta.content=BUILD;
  const badge=document.getElementById('buildBadge');if(badge)badge.textContent='BUILD 08.26.2';

  const live=document.createElement('script');
  live.src='app-live-points.js?v=2026.08.26.2-live';
  live.async=false;
  live.onload=()=>{
    const accountability=document.createElement('script');
    accountability.src='cloud-accountability.js?v=2026.08.26.2-cloud';
    accountability.async=false;
    accountability.onerror=()=>console.error('OTB canonical-accountability layer failed to load');
    (document.body||document.documentElement).appendChild(accountability);
  };
  live.onerror=()=>console.error('OTB live-points layer failed to load');
  (document.body||document.documentElement).appendChild(live);
})();