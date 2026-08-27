/* OTB scoring integrity layer — 2026.08.26.4
   ---------------------------------------------------------------
   Purpose: make displayed xPts components obey the actual FPL scoring laws.

   This is deliberately global and player/club agnostic. It fixes three
   structural issues in the core model without changing fixture strength,
   market weight, role probabilities, attack coefficients or chip logic:

   1) FPL's historical `defensive_contribution` field is a RAW ACTION COUNT,
      not FPL points. Convert it to a threshold probability (DEF 10 CBIT,
      MID/FWD 12 CBIRT) and cap the expectation at the rules-law maximum of
      two points per fixture.
   2) Appearance points are exactly P(appearance) + P(60+), never a scaled
      historical bucket.
   3) Clean-sheet points are a gross scoring event, exactly
      position-CS-points * P(CS) * P(60+). Expected goals-conceded deductions
      stay in Other. Aggregate form/FPL forecast blending may change the total
      mean, but it is not allowed to rescale these law-bounded components;
      its residual is carried transparently in Other / calibration.
*/
(function installOtbScoringIntegrity(){
  const VERSION='2026.08.26.4';
  const READY_TIMEOUT_MS=20000;
  const startedAt=Date.now();
  let installed=false;

  function runtimeReady(){
    return typeof baselineParts==='function'
      &&typeof priorFixtureProjection==='function'
      &&typeof liveFixtureProjection==='function'
      &&typeof projectCore==='function'
      &&typeof inspectPlayer==='function'
      &&typeof minuteDetail==='function'
      &&typeof fixtureListFor==='function'
      &&typeof poissonTail==='function'
      &&typeof gcDeduction==='function'
      &&typeof pricePrior==='function'
      &&typeof positionUsage==='function'
      &&typeof sumParts==='function'
      &&typeof clamp==='function'
      &&typeof num==='function'
      &&typeof CSPTS!=='undefined'
      &&typeof PROFILE!=='undefined'
      &&typeof S!=='undefined';
  }

  function dcThreshold(pl){
    if(pl?.p==='DEF')return 10;
    if(pl?.p==='MID'||pl?.p==='FWD')return 12;
    return 0;
  }

  function historicalDcRate90(pl){
    const threshold=dcThreshold(pl),actions=Math.max(0,num(pl?.histDcPts)),minutes=Math.max(0,num(pl?.histMinutes));
    if(!threshold||!actions||minutes<=0)return 0;
    return actions*90/minutes;
  }

  /* Aggregate history does not tell us which individual matches crossed the
     threshold. This is used only to reserve a sensible share of the historical
     baseline before its flexible attack/bonus/other remainder is allocated.
     The actual fixture projection below uses the current expected minutes. */
  function historicalDcPointsPerGw(pl){
    const threshold=dcThreshold(pl),actions=Math.max(0,num(pl?.histDcPts)),minutes=Math.max(0,num(pl?.histMinutes)),starts=Math.max(0,num(pl?.histStarts));
    if(!threshold||!actions||minutes<=0)return 0;
    const rate90=actions*90/minutes;
    if(starts>0){
      const cfg=positionUsage(pl),avgStart=clamp(minutes/starts,num(cfg?.minStartMinutes,45),90),startShare=clamp(starts/38,0,1);
      return clamp(2*startShare*poissonTail(rate90*avgStart/90,threshold),0,2);
    }
    return clamp(2*poissonTail(actions/38,threshold),0,2);
  }

  function fixtureDcRateMultiplier(ctx){
    /* Harder defensive fixtures can create more actions. Apply the old
       difficulty modifier to the ACTION RATE, never to awarded FPL points. */
    const difficulty=clamp(num(ctx?.dCS,3),1,5),modelWeight=clamp(num(S?.w?.dc,1),0,1.5);
    return modelWeight*clamp(1+.08*(difficulty-3),.84,1.16);
  }

  function expectedDcPoints(pl,md,ctx,rate90){
    const threshold=dcThreshold(pl);
    if(!threshold||!Number.isFinite(rate90)||rate90<=0||num(md?.exp)<=0)return 0;
    const lambda=Math.max(0,rate90)*fixtureDcRateMultiplier(ctx)*clamp(num(md.exp),0,90)/90;
    return clamp(2*poissonTail(lambda,threshold),0,2);
  }

  function exactAppearancePoints(md){
    return clamp(num(md?.pAppear)+num(md?.p60),0,2);
  }

  function exactCleanSheetPoints(pl,ctx,md){
    const award=Math.max(0,num(CSPTS[pl?.p])),p60=clamp(num(md?.p60),0,1),pCS=clamp(num(ctx?.pCS),0,1),cap=award*p60;
    return clamp(award*pCS*p60,0,cap);
  }

  function expectedGcDeduction(pl,ctx,md){
    if(pl?.p!=='GK'&&pl?.p!=='DEF')return 0;
    const exposure=clamp(num(md?.exp),0,90)/90;
    return gcDeduction(Math.max(0,num(ctx?.lambdaAgainst))*exposure);
  }

  function projectionCaps(pl,fixtures,md){
    const n=Math.max(0,num(fixtures,0)),p60=clamp(num(md?.p60),0,1),csAward=Math.max(0,num(CSPTS[pl?.p]));
    return{app:2*n,dc:dcThreshold(pl)?2*n:0,cs:csAward*p60*n};
  }

  function install(){
    if(installed||!runtimeReady())return false;
    installed=true;

    const coreBaselineParts=baselineParts;
    const corePriorFixtureProjection=priorFixtureProjection;
    const coreLiveFixtureProjection=liveFixtureProjection;
    const coreProjectCore=projectCore;
    const coreInspectPlayer=inspectPlayer;

    baselineParts=function(pl){
      const hist=num(pl?.histPts)/38,market=pricePrior(pl),base=hist>0?.88*hist+.12*market:market,
        dc=hist>0?historicalDcPointsPerGw(pl):0,pr=PROFILE[pl?.p]||PROFILE.MID,
        app=Math.min(2.0,base*.92),rem=Math.max(0,base-app-dc),weight=pr.cs+pr.atk+pr.bon+pr.oth;
      return{app,cs:rem*pr.cs/weight,dc,atk:rem*pr.atk/weight,bon:rem*pr.bon/weight,oth:rem*pr.oth/weight,base,
        source:hist>0?'historical + price prior · DC thresholded':'price/position prior'};
    };

    priorFixtureProjection=function(pl,ctx){
      /* Let the mature core retain attack/bonus calibration and transfer/role
         handling, but replace the three rules-bounded components afterwards.
         Because baselineParts above now uses DC POINT expectation rather than
         raw actions, the flexible remainder is no longer starved by a unit bug. */
      const r=corePriorFixtureProjection(pl,ctx),md=r.md,parts={...r.parts};
      parts.app=exactAppearancePoints(md);
      parts.cs=exactCleanSheetPoints(pl,ctx,md);
      parts.dc=expectedDcPoints(pl,md,ctx,historicalDcRate90(pl));
      parts.oth=num(parts.oth)+expectedGcDeduction(pl,ctx,md);
      const x=sumParts(parts),rotation=(1-num(md.pStart))*2.2+(1-num(md.avail))*4,
        variance=Math.max(1.2,1.6+Math.max(0,num(parts.atk))*2.1+Math.max(0,num(parts.cs))*.7+rotation);
      return{...r,x,parts,variance,integrity:{version:VERSION,appExact:true,csGross:true,dcThresholded:true}};
    };

    liveFixtureProjection=function(pl,ctx){
      const r=coreLiveFixtureProjection(pl,ctx),md=r.md,parts={...r.parts},liveRate=Math.max(0,num(pl?.live?.dc90));
      parts.app=exactAppearancePoints(md);
      parts.cs=exactCleanSheetPoints(pl,ctx,md);
      parts.dc=expectedDcPoints(pl,md,ctx,liveRate);
      /* The core live branch already places its Poisson goals-conceded
         deduction in Other, so do not add it a second time here. */
      const x=sumParts(parts),goalPts=({GK:10,DEF:6,MID:5,FWD:4}[pl?.p]||4),dc=num(parts.dc),
        variance=Math.max(1,
          num(r.eg)*goalPts*goalPts+num(r.ea)*9+
          Math.pow(Math.max(0,num(CSPTS[pl?.p])),2)*clamp(num(ctx?.pCS),0,1)*(1-clamp(num(ctx?.pCS),0,1))*clamp(num(md.p60),0,1)+
          dc*(2-dc)+Math.max(0,num(parts.bon))*1.3+(1-num(md.pStart))*2.5);
      return{...r,x,parts,variance,integrity:{version:VERSION,appExact:true,csGross:true,dcThresholded:true}};
    };

    projectCore=function(pl,gw,ck){
      const r=coreProjectCore(pl,gw,ck);
      if(!r||!Array.isArray(r.fixtures)||!r.fixtures.length)return r;

      /* Form and official-FPL layers are forecasts of the TOTAL mean. The old
         scaleParts() call rescaled every component and could push appearance,
         CS or DC beyond the laws that created them. Rebuild components from
         the already-projected fixtures, then carry only the aggregate forecast
         adjustment in Other / calibration. */
      const parts={app:0,cs:0,dc:0,atk:0,bon:0,oth:0};
      for(const row of r.fixtures)for(const k of Object.keys(parts))parts[k]+=num(row?.parts?.[k]);
      const preBlend=sumParts(parts),calibrationDelta=num(r.x)-preBlend;
      parts.oth+=calibrationDelta;

      const md=minuteDetail(pl),caps=projectionCaps(pl,r.fixtures.length,md);
      /* These clamps should normally be no-ops because each fixture branch is
         already lawful. They are defence-in-depth against future regressions. */
      parts.app=clamp(parts.app,0,caps.app);
      parts.dc=clamp(parts.dc,0,caps.dc);
      parts.cs=clamp(parts.cs,0,caps.cs);
      parts.oth+=num(r.x)-sumParts(parts);

      const out={...r,parts,detail:{...(r.detail||{}),scoringIntegrity:{version:VERSION,calibrationDelta,caps}}};
      try{PROJ_CACHE[pl.id+'|'+gw+(ck||'')]=out}catch(_){}
      return out;
    };

    function patchInspectCopy(){
      const modal=document.getElementById('modalBody');if(!modal)return;
      const boxes=[...modal.querySelectorAll('.xbox')],official=boxes.find(box=>String(box.querySelector('.k')?.textContent||'').trim().toLowerCase()==='vs official fpl');
      if(official){
        const diff=official.lastElementChild,text=String(diff?.textContent||'').trim(),m=text.match(/^([+-]?\d+(?:\.\d+)?)\s+vs ours$/i);
        if(diff&&m)diff.textContent=`OTB ${m[1]} vs FPL`;
      }
      const component=[...modal.querySelectorAll('.mini')].find(el=>String(el.querySelector('b')?.textContent||'').trim()==='Components');
      if(component){
        let html=component.innerHTML;
        html=html.replace(/ · CS (?!\(gross\))/,' · CS (gross) ');
        html=html.replace(/ · Other (?!\/ calibration)/,' · Other / calibration ');
        component.innerHTML=html;
      }
    }

    inspectPlayer=function(id){const out=coreInspectPlayer(id);patchInspectCopy();return out};

    function auditGameweek(gw=S.gw){
      const failures=[];let checked=0;
      for(const pl of POOL||[]){
        const fxs=fixtureListFor(pl.t,gw);if(!fxs.length)continue;
        const r=project(pl,gw);checked++;
        const md=minuteDetail(pl),caps=projectionCaps(pl,fxs.length,md),sum=sumParts(r.parts);
        if(Math.abs(sum-num(r.x))>1e-7)failures.push(`${pl.n}:components!=xPts`);
        if(num(r.parts.app)>caps.app+1e-9||num(r.parts.app)<-1e-9)failures.push(`${pl.n}:appearance-cap`);
        if(num(r.parts.dc)>caps.dc+1e-9||num(r.parts.dc)<-1e-9)failures.push(`${pl.n}:dc-cap`);
        if(num(r.parts.cs)>caps.cs+1e-9||num(r.parts.cs)<-1e-9)failures.push(`${pl.n}:cs-cap`);
        for(const row of r.fixtures||[]){
          const rmd=row?.prior?.md||md,appExpected=exactAppearancePoints(rmd),rowCsCap=Math.max(0,num(CSPTS[pl.p]))*clamp(num(rmd.p60),0,1);
          if(Math.abs(num(row.parts?.app)-appExpected)>1e-7)failures.push(`${pl.n}:appearance-not-exact`);
          if(num(row.parts?.dc)>2+1e-9||num(row.parts?.dc)<-1e-9)failures.push(`${pl.n}:fixture-dc-cap`);
          if(num(row.parts?.cs)>rowCsCap+1e-9||num(row.parts?.cs)<-1e-9)failures.push(`${pl.n}:fixture-cs-cap`);
        }
      }
      const result={ok:failures.length===0,version:VERSION,gw,checked,failures:[...new Set(failures)],generatedAt:new Date().toISOString()};
      globalThis.__OTB_SCORING_INTEGRITY_AUDIT__=result;
      try{if(typeof pipelineEvent==='function')pipelineEvent('SCORING-INTEGRITY',result.ok?'ok':'warn',result.ok?`${checked} player projections obey component scoring caps`:`${result.failures.length} scoring invariant failure(s): ${result.failures.slice(0,3).join(', ')}`)}catch(_){}
      return result;
    }

    globalThis.__OTB_SCORING_INTEGRITY__={
      version:VERSION,dcThreshold,historicalDcRate90,historicalDcPointsPerGw,
      expectedDcPoints,exactAppearancePoints,exactCleanSheetPoints,auditGameweek
    };

    try{bumpCache();render({deferPool:typeof lowPowerMode==='function'&&lowPowerMode()})}catch(err){console.warn('OTB scoring integrity initial render skipped',err)}
    try{if(typeof pipelineEvent==='function')pipelineEvent('SCORING-INTEGRITY','ok','FPL component laws active · DC thresholded · appearance exact · CS gross')}catch(_){}
    return true;
  }

  function waitForCore(){
    if(runtimeReady()){install();return}
    if(Date.now()-startedAt>=READY_TIMEOUT_MS){console.warn('OTB scoring integrity could not find the core runtime');return}
    setTimeout(waitForCore,40);
  }

  waitForCore();
})();
