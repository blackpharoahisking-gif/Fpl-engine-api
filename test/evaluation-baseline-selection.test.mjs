import assert from 'node:assert/strict';
import test from 'node:test';

import { nextEvaluationBaselineEvent } from '../src/index-core.js';

test('an expired unfinished Gameweek cannot block the next baseline window', () => {
  const currentMs = Date.parse('2026-08-28T17:00:00Z');
  const events = [
    { id: 3, finished: false, deadline_time: '2026-09-12T13:30:00Z' },
    { id: 1, finished: false, deadline_time: '2026-08-21T17:30:00Z' },
    { id: 2, finished: false, deadline_time: '2026-08-28T17:30:00Z' },
  ];

  assert.equal(nextEvaluationBaselineEvent(events, currentMs)?.id, 2);
});

test('baseline selection returns no event when every deadline has passed', () => {
  const currentMs = Date.parse('2026-08-28T17:30:00Z');
  const events = [
    { id: 1, finished: false, deadline_time: '2026-08-21T17:30:00Z' },
    { id: 2, finished: false, deadline_time: '2026-08-28T17:30:00Z' },
    { id: 99, finished: false, deadline_time: 'not-a-date' },
  ];

  assert.equal(nextEvaluationBaselineEvent(events, currentMs), null);
});
