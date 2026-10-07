# Droober & RC: Two Places at Once

Vanilla canvas puzzle-platformer, zero deps, no build step. Classic `<script>` tags share globals
(load order in index.html matters). Serve with `node serve.mjs` (port 5177).

## Ability split (the user's spec; do not drift from it)
- Droober: walk, run, jump, double jump, crouch, grab/carry/throw crates, push heavy blocks, turn cranks.
- RC: flies freely like Morph, presses buttons/levers, weighs normal plates. Cannot lift or push anything.
- Team move: RC glide. RC riding + double jump + hold jump = hover. Gaps of 11+ tiles need it.

## Working rules
- After touching `src/world.js` or `src/levels.js`, run `node tests/solve.mjs`. The bot routes in
  `tests/solve.mjs` are the proof each level is solvable; update the route when you change a level.
- Reach numbers (from `tests/physics.mjs`) are in the header of `src/levels.js`. Design against them.
- Sprites come from `assets/sheet-source.png` via `node tools/extract-sprites.mjs`. Don't hand-edit `src/sprites.js`.
- The Chrome automation tab is usually "hidden", so requestAnimationFrame stalls. Drive frames manually
  from devtools (`update(); draw();` are globals, `window.__game` is the state) instead of assuming a bug.
- In-game copy: uppercase bitmap font only has A-Z 0-9 and basic punctuation (see `GLYPHS`). No em dashes.
- Known gotcha for players: setting a crate down in front and then walking forward shoves it off a plate. Hop it.
