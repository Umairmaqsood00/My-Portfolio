"use client";

/**
 * Generative ambient score — no audio files. A slow, detuned pad and a soft
 * water bed run through a synthetic reverb; rings ring a chime and the hand
 * breaking the surface makes a splash. Browsers only allow audio after a user
 * gesture, so nothing is created until the visitor turns sound on.
 */

const PREF_KEY = "sound";
// D · A · C# · E over a low D — open and unresolved, so it never feels like a loop.
const PAD = [73.42, 146.83, 220, 277.18, 329.63];
const CHIMES = [587.33, 659.25, 880, 987.77, 1174.66];

type Listener = () => void;

class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private tone: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private listeners = new Set<Listener>();
  on = false;

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.on;

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private build() {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Everything goes through one tone filter (closes as you dive) into dry + reverb.
    const bus = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2600;
    tone.Q.value = 0.4;
    bus.connect(tone);

    const dry = ctx.createGain();
    dry.gain.value = 0.62;
    const verb = ctx.createConvolver();
    verb.buffer = impulse(ctx, 5, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.7;
    tone.connect(dry).connect(master);
    tone.connect(verb).connect(wet).connect(master);

    // Pad: two slightly detuned voices per note, each breathing on its own slow LFO.
    PAD.forEach((freq, i) => {
      const voice = ctx.createGain();
      voice.gain.value = i === 0 ? 0.05 : 0.028;
      [-5, 5].forEach((cents, j) => {
        const osc = ctx.createOscillator();
        osc.type = j === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        osc.detune.value = cents;
        osc.connect(voice);
        osc.start();
      });
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.04 + i * 0.023;
      const depth = ctx.createGain();
      depth.gain.value = voice.gain.value * 0.8;
      lfo.connect(depth).connect(voice.gain);
      lfo.start();
      voice.connect(bus);
    });

    // Water bed: brown noise, band-passed low, with slow swells.
    this.noise = brownNoise(ctx, 4);
    const water = ctx.createBufferSource();
    water.buffer = this.noise;
    water.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 420;
    band.Q.value = 0.7;
    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.11;
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.07;
    const swellDepth = ctx.createGain();
    swellDepth.gain.value = 0.06;
    swell.connect(swellDepth).connect(waterGain.gain);
    swell.start();
    water.connect(band).connect(waterGain).connect(bus);
    water.start();

    this.ctx = ctx;
    this.master = master;
    this.bus = bus;
    this.tone = tone;
  }

  async setOn(on: boolean) {
    if (on === this.on) return;
    this.on = on;
    this.emit();
    try {
      localStorage.setItem(PREF_KEY, on ? "on" : "off");
    } catch {}

    if (on && !this.ctx) this.build();
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    if (on) {
      await ctx.resume();
      master.gain.linearRampToValueAtTime(0.85, now + 2.5);
    } else {
      master.gain.linearRampToValueAtTime(0, now + 0.8);
      window.setTimeout(() => !this.on && ctx.suspend(), 900);
    }
  }

  toggle = () => this.setOn(!this.on);

  /** Returning visitors who left sound on get it back on their first interaction. */
  restorePreference() {
    let wanted = false;
    try {
      wanted = localStorage.getItem(PREF_KEY) === "on";
    } catch {}
    if (!wanted) return () => {};
    const start = () => {
      cleanup();
      this.setOn(true);
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return cleanup;
  }

  /** 0 at the surface → 1 at the bottom: the score gets darker as you dive. */
  setDepth(depth: number) {
    if (!this.ctx || !this.tone) return;
    this.tone.frequency.setTargetAtTime(2600 - depth * 2000, this.ctx.currentTime, 0.5);
  }

  chime(stage: number) {
    const ctx = this.ctx;
    if (!this.on || !ctx || !this.bus) return;
    const now = ctx.currentTime;
    const base = CHIMES[Math.min(stage, CHIMES.length - 1)];
    [
      [1, 0.09],
      [2.004, 0.025],
      [3.01, 0.01],
    ].forEach(([mult, level]) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = base * mult;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(level, now + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      osc.connect(env).connect(this.bus!);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  splash(strength = 1) {
    const ctx = this.ctx;
    if (!this.on || !ctx || !this.bus || !this.noise) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2200, now);
    lp.frequency.exponentialRampToValueAtTime(260, now + 1.4);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.35 * strength, now + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    src.connect(lp).connect(env).connect(this.bus);
    src.start(now, Math.random() * 2);
    src.stop(now + 1.7);
  }
}

function impulse(ctx: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return buffer;
}

function brownNoise(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

export const ambient = new Ambient();
