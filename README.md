# Droober & RC: Two Places at Once

A 2D pixel puzzle-platformer. Droober does the heavy lifting; RC, his goo companion, roams free.
You swap between them to be in two places at once.

## Play

```
node serve.mjs        # http://localhost:5177/
```

Opening `index.html` directly also works (classic scripts, no modules, no build step).

## Who can do what

| | Droober | RC |
|---|---|---|
| Move | walk, run, jump, double jump, crouch | flies freely (like Morph), settles when left alone |
| Crates | pick up, carry (one jump only), throw, set down | can't lift or push |
| Heavy blocks / cranks / platforms | shoves blocks, turns cranks | too squishy |
| Buttons, levers | yes | yes |
| Pressure plates | yes | normal plates only; big plates need real weight |
| Grates | blocked | oozes through |
| Spikes | ouch | immune |
| Zaps | ouch | pops |

**Team move: RC glide.** With RC riding on his head, Droober double jumps and holds jump: RC
grabs on and holds him up for about 70 frames. That roughly doubles his reach (8.9 tiles to 16+), so wide gaps
need RC with him, while plates often need RC somewhere else. That tension is the game.

## Controls

| Action | Keys | Gamepad |
|---|---|---|
| Move / fly | A D (W S for RC) or arrows | stick / d-pad |
| Jump (twice for double) | Space | A |
| Run | Shift | RT |
| Crouch | S / Down | down |
| Grab, throw, use | E (S+E sets a crate down) | X |
| Swap Droober and RC | Q / Tab | LB / RB |
| Call RC / drop RC | F | B |
| Restart, pause, mute | R, Esc, M | Back, Start |

## Levels

1. Juice Run (movement) · 2. Goo Buddy (swap, grates, buttons, call) · 3. Hold the Door (plates)
4. Heavy Lifting (crates) · 5. Goo Glider (glide) · 6. Stand-In (crate holds a plate so RC can glide)
7. Block Party (heavy blocks + RC lever) · 8. Crank Shaft (cranks, zap plate, goo tunnel)
9. Tick Tock (timed button race) · 10. Two Places at Once (everything)

## Layout

- `src/world.js`: simulation, pure logic, no canvas. Fixed 60 Hz step, Celeste-style integer movement.
- `src/levels.js`: levels built with a tile-coordinate builder. Reach numbers are documented at the top.
- `src/render.js`, `src/font.js`: all drawing (procedural tiles and devices, 5x7 bitmap font).
- `src/main.js`: menus, save data (localStorage), loop. `src/audio.js`: synthesized SFX and music.
- `assets/sheet-source.png` is the original turnaround sheet; `tools/extract-sprites.mjs` cuts it into
  `assets/sprites.png` + `src/sprites.js` with a zero-dep PNG codec (`tools/png.mjs`).

## Tests

```
node tests/levels.mjs    # structure + wiring of every level (--dump prints ASCII maps)
node tests/rules.mjs     # ability rules (RC can't push, grates, heavy plates, glide needs RC...)
node tests/solve.mjs     # a bot plays every level start to finish through the real simulation
node tests/client.mjs    # boots the browser scripts on a stub canvas, drives menus + every level
node tests/physics.mjs   # prints measured jump reach
```

Change a level or a physics constant, run `solve.mjs`. If a level becomes unsolvable, it fails.
