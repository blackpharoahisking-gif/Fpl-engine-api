import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const core = readFileSync(new URL('../app-core.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../FPL_Engine_OTB.html', import.meta.url), 'utf8');
const cardSource = core.match(/function intelligenceCard\(row\)\{[\s\S]*?\nfunction intelligenceSignalSections/)?.[0]
  ?.replace(/\nfunction intelligenceSignalSections[\s\S]*$/, '') || '';
const snapshotRowSanitizerSource = core.match(/function sanitizeAccuracySnapshotRow\(row\)\{[^\n]+/)?.[0] || '';

function renderCard(row) {
  const context = {
    num(value, fallback = 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    },
    esc(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    },
    intelligenceUpcomingText: () => 'GW2 BBB H',
  };
  vm.createContext(context);
  vm.runInContext(`${cardSource};this.rendered=intelligenceCard(${JSON.stringify(row)});`, context);
  return context.rendered;
}

test('low-owned cards render the persistence status, frequency and rolling evidence', () => {
  const rendered = renderCard({
    name: 'Signal', team: 'AAA', position: 'MID', signal: 'LOW_OWNED_EMERGING',
    points: 8, minutes: 90, xGI: .62, ownership: 4.2, why: 'Current-week evidence.',
    evidenceLabel: 'EARLY_SAMPLE', evidence: { sampleMinutes: 250, priorGameweeks: 2 },
    persistence: {
      status: 'REPEATED', signalGameweeks: 2, sampleGameweeks: 3,
      rollingXGI: 1.42, rollingMinutes: 250, rollingStarts: 3,
    },
  });
  assert.match(rendered, /REPEATED SIGNAL/);
  assert.match(rendered, /2 of 3 sampled GWs/);
  assert.match(rendered, /Rolling 3 GWs: 1\.42 xGI · 250 min · 3 starts/);
  assert.match(rendered, /4\.2% owned at review capture/);
  assert.match(rendered, /EARLY SAMPLE EVIDENCE/);
});

test('other Review cards stay compact when persistence does not apply', () => {
  const rendered = renderCard({
    name: 'Haul', team: 'AAA', position: 'FWD', signal: 'GAMEWEEK_HAUL',
    points: 12, minutes: 90, xGI: .3, ownership: 20, why: 'A haul.',
  });
  assert.doesNotMatch(rendered, /gw-intel-persistence/);
  assert.doesNotMatch(rendered, /owned at review capture/);
});

test('Review stylesheet distinguishes new, repeated and established persistence', () => {
  assert.match(html, /\.gw-intel-persistence\.repeated/);
  assert.match(html, /\.gw-intel-persistence\.established/);
  assert.match(html, /rolling five-Gameweek sample/i);
});

test('accountability reload preserves uncertainty and no-market diagnostics', () => {
  const context = {
    Math,
    Number,
    clamp(value, min, max) { return Math.min(max, Math.max(min, value)); },
    accuracyNumber(value, min = -Infinity, max = Infinity, fallback = null) {
      if (value === null || value === undefined || value === '') return fallback;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
    },
    accuracyRound(value, digits = 3) {
      return value === null || value === undefined || value === ''
        ? null
        : Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : null;
    },
  };
  vm.createContext(context);
  const raw = [1, 5.125, 1.25, 9, 82.4, 78.5, .81, .94, 1, 5.2, 1, 3.1416, 4.875];
  vm.runInContext(`${snapshotRowSanitizerSource};this.cleaned=sanitizeAccuracySnapshotRow(${JSON.stringify(raw)});`, context);
  assert.deepEqual(Array.from(context.cleaned), raw);
  assert.equal(context.cleaned.length, 13);
});
