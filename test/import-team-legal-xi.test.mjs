import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const app=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');

/* Marcus, 21 Aug: "I got 22 pts not 27 ... fix it" — after using the newly
   fixed Import Team button, the app showed "Set a legal starting XI —
   15/11" and summed points for all 15 imported players instead of 11.

   Root cause: applyImportedFplTeam() decided who was "in the starting XI"
   with `multiplier>0 || position<=11`. FPL's official picks endpoint sets
   `position` to the manager's ORIGINAL squad order (1-11 starters, 12-15
   bench) and leaves it there permanently, but updates `multiplier` to
   reflect what actually scored after autosubs run: 0 for an original
   starter who didn't play and got subbed out, >0 for a bench player who
   was subbed in. The OR kept BOTH — the subbed-out original starter
   (position<=11, regardless of multiplier) AND the subbed-in bench player
   (multiplier>0, regardless of position) — so any gameweek with autosubs
   imported more than 11 "starters", which is exactly the illegal 15/11
   state, and the live-points sum then counted extra players FPL's own
   total does not.

   The fix uses only `position<=11`: the manager's actual pre-deadline
   starting XI, which is what OTB should show for forward planning anyway
   (captain/vice are already taken from is_captain/is_vice_captain, not
   from any post-match promotion) — never a mix of the two signals. */

test('importing a team decides the starting XI from squad position alone, not blended with post-match multiplier',()=>{
  const fn=app.match(/function applyImportedFplTeam\([\s\S]*?\n\}/);
  assert.ok(fn,'applyImportedFplTeam must exist');
  const body=fn[0];
  assert.doesNotMatch(body,/multiplier\)>0\s*\|\|\s*num\(x\.pick\.position\)/,
    'S.start must not be built from multiplier OR position — that reintroduces the 15/11 import bug');
  assert.match(body,/S\.start=new Set\(mapped\.filter\(x=>num\(x\.pick\.position,\s*99\)<=11\)/,
    'S.start must come from squad position alone, matching how cap/vice are already taken from is_captain/is_vice_captain rather than post-match state');
});

test('a corrupted or unexpected import still self-heals to a legal 11-player XI instead of persisting an illegal one',()=>{
  const fn=app.match(/function applyImportedFplTeam\([\s\S]*?\n\}/);
  assert.ok(fn);
  assert.match(fn[0],/if\(S\.start\.size!==11\|\|xiLegality\(\[\.\.\.S\.start\]\)!==null\)autoXI\(\)/,
    'must self-heal via autoXI(), the same pattern already used when restoring saved state');
});

test('imported captain and vice-captain survive captain validation',()=>{
  const fn=app.match(/function applyImportedFplTeam\([\s\S]*?\n\}/);
  assert.ok(fn,'applyImportedFplTeam must exist');
  const body=fn[0];
  assert.match(body,/S\.capManual=S\.cap!=null;S\.viceManual=S\.vice!=null;/,
    'the imported FPL armbands must be marked authoritative before ensureCaptainValid runs');
  assert.ok(body.indexOf('S.capManual=S.cap!=null')<body.indexOf('ensureCaptainValid()'),
    'manual flags must be set before validation can auto-replace the imported armbands');
});
