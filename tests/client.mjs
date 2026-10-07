// Boots the real browser scripts against a stub DOM/canvas and drives menus + every
// level for a while, so exceptions in render/menu code surface without a browser.
import fs from 'node:fs';
import vm from 'node:vm';

const noop = () => {};
const ctx2d = new Proxy({}, {
  get: (t, k) => k in t ? t[k] : (k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop),
  set: (t, k, v) => { t[k] = v; return true; },
});
const makeCanvas = () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d, addEventListener: noop, focus: noop });
const listeners = {};
let rafCb = null;
const sandbox = {
  console, Math, JSON, Object, Array, Map, Set, Number, String, Promise, Date,
  performance: { now: () => Date.now() },
  innerWidth: 1280, innerHeight: 720,
  localStorage: { _s: {}, getItem(k) { return this._s[k] ?? null; }, setItem(k, v) { this._s[k] = v; } },
  navigator: { getGamepads: () => [] },
  document: { getElementById: makeCanvas, createElement: makeCanvas },
  addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
  requestAnimationFrame: cb => { rafCb = cb; },
  setInterval: noop,
  Image: class { set src(v) { setTimeout(() => this.onload && this.onload(), 0); } },
};
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
vm.runInContext(scripts.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n') + '\n;globalThis.__x = { game, update, draw, LEVELS, startLevel, Input };', ctx);
const { game, update, draw, LEVELS, startLevel, Input } = ctx.__x;
ctx.SPRITES = {};

const key = (code, down) => (listeners[down ? 'keydown' : 'keyup'] || []).forEach(f => f({ code, repeat: false, preventDefault: noop }));
const frame = () => { update(); draw(); };
const tap = code => { key(code, true); frame(); key(code, false); frame(); };

let errors = 0;
function guard(label, fn) { try { fn(); console.log('ok   ' + label); } catch (e) { errors++; console.log('FAIL ' + label + ': ' + e.stack.split('\n').slice(0, 3).join(' | ')); } }

guard('title screen', () => { for (let i = 0; i < 30; i++) frame(); });
guard('controls overlay', () => { game.menuIndex = 2; tap('Space'); frame(); tap('Space'); });
guard('level select', () => { game.screen = 'select'; for (let i = 0; i < 10; i++) frame(); tap('Escape'); });
guard('sub-frame tap starts the game', () => { game.screen = 'title'; game.menuIndex = 0; key('Space', true); key('Space', false); frame(); if (game.screen !== 'play') throw new Error('screen is ' + game.screen); });
LEVELS.forEach((L, i) => guard(`level ${i + 1} plays + draws`, () => {
  startLevel(i);
  const seq = ['KeyD', 'Space', 'KeyQ', 'KeyW', 'KeyD', 'KeyE', 'KeyQ', 'KeyF', 'ShiftLeft', 'KeyA', 'KeyS'];
  for (let f = 0; f < 600; f++) {
    if (f % 40 === 0) key(seq[(f / 40) % seq.length], true);
    if (f % 40 === 25) key(seq[(f / 40 | 0) % seq.length], false);
    frame();
    if (game.screen !== 'play') break;
  }
}));
guard('pause menu', () => { startLevel(0); tap('Escape'); for (let i = 0; i < 5; i++) frame(); tap('ArrowDown'); tap('Space'); });
guard('death + restart', () => { startLevel(0); game.world.kill('spike'); for (let i = 0; i < 70; i++) frame(); if (game.world.state !== 'play') throw new Error('no restart'); });
guard('clear + end screens', () => { startLevel(LEVELS.length - 1); const w = game.world; w.state = 'clear'; w.stateT = 0; for (let i = 0; i < 60; i++) frame(); tap('Space'); for (let i = 0; i < 100; i++) frame(); if (game.screen !== 'end') throw new Error('screen ' + game.screen); });
process.exit(errors ? 1 : 0);
