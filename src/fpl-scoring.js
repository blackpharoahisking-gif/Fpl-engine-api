/**
 * Official Fantasy Premier League scoring policy used by OTB for 2026/27.
 *
 * Keep every rule-dependent analytical calculation behind this versioned
 * table. The post-Gameweek review deliberately excludes actual bonus from its
 * repeatable-process baseline because bonus is an outcome, not an input signal.
 */

export const FPL_SCORING_POLICY = Object.freeze({
  version: 'fpl-scoring-2026-27-v1',
  season: '2026/27',
  appearance: Object.freeze({ under60: 1, atLeast60: 2 }),
  goal: Object.freeze({ 1: 10, 2: 6, 3: 5, 4: 4 }),
  assist: 3,
  cleanSheet: Object.freeze({ 1: 4, 2: 4, 3: 1, 4: 0 }),
  saves: Object.freeze({ every: 3, points: 1 }),
  penaltySave: 5,
  penaltyMiss: -2,
  ownGoal: -2,
  yellowCard: -1,
  redCard: -3,
  goalsConceded: Object.freeze({ positions: Object.freeze([1, 2]), every: 2, points: -1 }),
  defensiveContribution: Object.freeze({
    2: Object.freeze({ threshold: 10, points: 2 }),
    3: Object.freeze({ threshold: 12, points: 2 }),
    4: Object.freeze({ threshold: 12, points: 2 }),
  }),
});

const finite = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function appearanceProcessPoints(row) {
  const minutes = Math.max(0, finite(row?.minutes));
  if (minutes <= 0) return 0;
  const starts = Math.max(0, Math.trunc(finite(row?.starts)));
  if (starts <= 1) {
    return minutes >= 60
      ? FPL_SCORING_POLICY.appearance.atLeast60
      : FPL_SCORING_POLICY.appearance.under60;
  }

  // Event-live is aggregated at Gameweek level. This is exact when each start
  // reaches 60 minutes and a conservative approximation for unusual DGW splits.
  const fullAppearances = Math.min(starts, Math.floor(minutes / 60));
  return fullAppearances * FPL_SCORING_POLICY.appearance.atLeast60
    + (starts - fullAppearances) * FPL_SCORING_POLICY.appearance.under60;
}

export function defensiveContributionProcessPoints(row) {
  const position = Math.trunc(finite(row?.position));
  const rule = FPL_SCORING_POLICY.defensiveContribution[position];
  if (!rule) return 0;
  const contributions = Math.max(0, finite(row?.defensive_contribution));
  const starts = Math.max(1, Math.trunc(finite(row?.starts)));
  const thresholdHits = Math.min(starts, Math.floor(contributions / rule.threshold));
  return thresholdHits * rule.points;
}

export function repeatableProcessBreakdown(row) {
  const position = Math.trunc(finite(row?.position));
  const appearance = appearanceProcessPoints(row);
  const expectedAttack = finite(row?.expected_goals) * finite(FPL_SCORING_POLICY.goal[position], 4)
    + finite(row?.expected_assists) * FPL_SCORING_POLICY.assist;
  const cleanSheet = Math.max(0, finite(row?.clean_sheets))
    * finite(FPL_SCORING_POLICY.cleanSheet[position]);
  const saves = Math.floor(Math.max(0, finite(row?.saves)) / FPL_SCORING_POLICY.saves.every)
    * FPL_SCORING_POLICY.saves.points;
  const defensiveContribution = defensiveContributionProcessPoints(row);
  const repeatable = appearance + expectedAttack + cleanSheet + saves + defensiveContribution;
  return {
    scoringVersion: FPL_SCORING_POLICY.version,
    appearance,
    expectedAttack,
    cleanSheet,
    saves,
    defensiveContribution,
    repeatable,
    bonusExcluded: Math.max(0, finite(row?.bonus)),
  };
}
