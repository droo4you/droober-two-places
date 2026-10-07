// Synthesized chiptune SFX and a tiny looping soundtrack. No audio files.
const Audio8 = {
  ctx: null, master: null, musicGain: null, muted: false, musicOn: true, step: 0, nextT: 0, timer: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.22;
    this.musicGain.connect(this.master);
    this.nextT = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 50);
  },
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.02);
  },
  tone(type, f0, f1, dur, vol = 0.3, when = 0, dest = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || this.master);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.2, hp = 800, when = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master);
    s.start(t);
  },
  sfx(name) {
    if (!this.ctx || this.muted) return;
    const T = this.tone.bind(this);
    switch (name) {
      case 'jump': T('square', 300, 620, 0.12, 0.18); break;
      case 'djump': T('square', 520, 1040, 0.12, 0.16); T('triangle', 780, 1300, 0.1, 0.12, 0.03); break;
      case 'glide': T('triangle', 900, 500, 0.35, 0.12); break;
      case 'land': this.noise(0.06, 0.12, 300); break;
      case 'bonk': T('square', 180, 120, 0.08, 0.15); break;
      case 'swap': T('triangle', 440, 660, 0.06, 0.18); T('triangle', 660, 990, 0.06, 0.15, 0.06); break;
      case 'call': T('sine', 600, 900, 0.1, 0.2); T('sine', 900, 1200, 0.1, 0.18, 0.1); break;
      case 'stay': T('sine', 700, 500, 0.12, 0.18); break;
      case 'mount': T('sine', 300, 900, 0.15, 0.25); break;
      case 'dismount': T('sine', 800, 300, 0.15, 0.2); break;
      case 'splat': T('sine', 200, 80, 0.12, 0.25); break;
      case 'pickup': T('square', 220, 440, 0.08, 0.15); break;
      case 'throw': this.noise(0.1, 0.12, 1500); T('square', 400, 200, 0.1, 0.1); break;
      case 'drop': T('square', 260, 180, 0.08, 0.12); break;
      case 'thud': this.noise(0.08, 0.18, 200); T('sine', 120, 60, 0.1, 0.25); break;
      case 'thudHeavy': this.noise(0.15, 0.25, 100); T('sine', 90, 40, 0.2, 0.35); break;
      case 'push': this.noise(0.05, 0.06, 600); break;
      case 'pushHeavy': this.noise(0.09, 0.1, 200); break;
      case 'plateOn': T('square', 330, 330, 0.05, 0.14); T('square', 495, 495, 0.08, 0.14, 0.05); break;
      case 'plateOff': T('square', 495, 495, 0.05, 0.12); T('square', 330, 330, 0.08, 0.12, 0.05); break;
      case 'button': T('square', 660, 660, 0.05, 0.18); T('square', 990, 990, 0.1, 0.16, 0.05); break;
      case 'lever': T('square', 200, 400, 0.06, 0.15); this.noise(0.04, 0.1, 2000); break;
      case 'door': T('sawtooth', 110, 160, 0.25, 0.08); break;
      case 'hum': T('triangle', 140, 150, 0.15, 0.05); break;
      case 'tick': T('square', 1200, 1200, 0.03, 0.08); break;
      case 'tickFast': T('square', 1600, 1600, 0.03, 0.1); break;
      case 'timeout': T('square', 400, 200, 0.2, 0.15); break;
      case 'zapOn': this.noise(0.08, 0.06, 3000); break;
      case 'juice': [784, 988, 1319].forEach((f, i) => T('square', f, f, 0.07, 0.13, i * 0.06)); break;
      case 'die': T('square', 500, 60, 0.5, 0.2); this.noise(0.3, 0.12, 400); break;
      case 'pop': T('sine', 900, 100, 0.3, 0.25); this.noise(0.15, 0.1, 1500); break;
      case 'poof': this.noise(0.12, 0.1, 1000); break;
      case 'nope': T('square', 150, 150, 0.06, 0.1); T('square', 120, 120, 0.08, 0.1, 0.07); break;
      case 'blip': T('triangle', 500, 500, 0.04, 0.08); break;
      case 'clear': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => T('square', f, f, 0.12, 0.14, i * 0.09)); break;
      case 'menu': T('triangle', 600, 600, 0.04, 0.14); break;
      case 'select': T('square', 660, 990, 0.08, 0.15); break;
    }
  },
  // 2-bar loop, 8th notes. Bass + lead + soft hat.
  schedule() {
    if (!this.ctx || !this.musicOn) return;
    const spb = 60 / 118 / 2;
    const lead = [72, 0, 76, 79, 0, 76, 74, 0, 72, 0, 69, 72, 0, 74, 76, 0, 77, 0, 76, 74, 0, 72, 74, 0, 76, 0, 72, 0, 69, 0, 67, 0];
    const bass = [48, 48, 55, 48, 45, 45, 52, 45, 41, 41, 48, 41, 43, 43, 50, 47];
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    while (this.nextT < this.ctx.currentTime + 0.25) {
      const s = this.step % 32;
      const n = lead[s];
      if (n) this.tone('square', mtof(n), mtof(n), spb * 0.9, 0.11, this.nextT - this.ctx.currentTime, this.musicGain);
      if (s % 2 === 0) { const b = bass[(s / 2) % 16]; this.tone('triangle', mtof(b), mtof(b), spb * 1.8, 0.3, this.nextT - this.ctx.currentTime, this.musicGain); }
      this.nextT += spb; this.step++;
    }
  },
};
