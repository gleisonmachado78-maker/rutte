/**
 * Sons ambientes do Foco, gerados no próprio navegador (Web Audio) — sem arquivos de áudio,
 * funcionam offline e no HTML único do celular. Cada som é ruído filtrado + pequenos eventos
 * aleatórios (gotas, estalos, pássaros). Opcional: desligado por padrão.
 */

export type AmbientId = 'chuva' | 'mar' | 'floresta' | 'lareira' | 'branco' | 'marrom' | 'alfa';

export const AMBIENTS: { id: AmbientId; label: string; emoji: string; desc: string }[] = [
  { id: 'chuva', label: 'Chuva', emoji: '🌧️', desc: 'Chuva constante com gotas' },
  { id: 'mar', label: 'Mar', emoji: '🌊', desc: 'Ondas indo e voltando' },
  { id: 'floresta', label: 'Floresta', emoji: '🌳', desc: 'Vento nas folhas e pássaros' },
  { id: 'lareira', label: 'Lareira', emoji: '🔥', desc: 'Fogo baixo estalando' },
  { id: 'branco', label: 'Ruído branco', emoji: '📻', desc: 'Abafa conversas e barulhos' },
  { id: 'marrom', label: 'Ruído marrom', emoji: '🟤', desc: 'Grave e suave, bom para TDAH' },
  { id: 'alfa', label: 'Ondas alfa', emoji: '🎧', desc: 'Batida binaural de 10 Hz (use fone)' },
];

type Ctx = AudioContext;
interface Playing {
  id: AmbientId;
  out: GainNode;
  stop: () => void;
}

const buffers = new Map<string, AudioBuffer>();

/** 6 s de ruído (branco, rosa ou marrom) para tocar em loop. */
function noise(ctx: Ctx, kind: 'white' | 'pink' | 'brown') {
  const key = `${kind}:${ctx.sampleRate}`;
  const cached = buffers.get(key);
  if (cached) return cached;
  const len = ctx.sampleRate * 6;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w * 0.5;
      else if (kind === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    // emenda suave do loop
    const fade = Math.floor(ctx.sampleRate * 0.05);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      d[i] *= k;
      d[len - 1 - i] *= k;
    }
  }
  buffers.set(key, buf);
  return buf;
}

function loop(ctx: Ctx, kind: 'white' | 'pink' | 'brown') {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx, kind);
  src.loop = true;
  return src;
}

function filter(ctx: Ctx, type: BiquadFilterType, freq: number, q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function gain(ctx: Ctx, v: number) {
  const g = ctx.createGain();
  g.gain.value = v;
  return g;
}

/** Repete `fn` em intervalos aleatórios entre min e max ms. */
function every(min: number, max: number, fn: () => void) {
  let t = 0;
  let alive = true;
  const tick = () => {
    if (!alive) return;
    fn();
    t = window.setTimeout(tick, min + Math.random() * (max - min));
  };
  t = window.setTimeout(tick, min + Math.random() * (max - min));
  return () => {
    alive = false;
    window.clearTimeout(t);
  };
}

/** Rajada curta de ruído (gota, estalo). */
function burst(ctx: Ctx, out: AudioNode, opts: { freq: number; q: number; vol: number; dur: number; type?: BiquadFilterType }) {
  const src = loop(ctx, 'white');
  const f = filter(ctx, opts.type ?? 'bandpass', opts.freq, opts.q);
  const g = gain(ctx, 0);
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
  src.connect(f).connect(g).connect(out);
  src.start(t, Math.random() * 5);
  src.stop(t + opts.dur + 0.05);
}

/** Canto curto de pássaro (seno com varredura de frequência). */
function chirp(ctx: Ctx, out: AudioNode) {
  const base = 2600 + Math.random() * 1600;
  const notes = 2 + Math.floor(Math.random() * 4);
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 1.6 - 0.8;
  pan.connect(out);
  for (let n = 0; n < notes; n++) {
    const t = ctx.currentTime + n * (0.11 + Math.random() * 0.05);
    const o = ctx.createOscillator();
    const g = gain(ctx, 0);
    o.type = 'sine';
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.3), t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(pan);
    o.start(t);
    o.stop(t + 0.1);
  }
}

/** Monta o som e devolve como parar os eventos extras. */
function build(ctx: Ctx, id: AmbientId, out: GainNode): () => void {
  const sources: AudioScheduledSourceNode[] = [];
  const start = <T extends AudioScheduledSourceNode>(s: T) => (sources.push(s), s.start(), s);
  let extra = () => {};

  if (id === 'chuva') {
    const s = start(loop(ctx, 'pink'));
    s.connect(filter(ctx, 'highpass', 350)).connect(filter(ctx, 'lowpass', 7000)).connect(gain(ctx, 0.9)).connect(out);
    extra = every(25, 140, () => burst(ctx, out, { freq: 2500 + Math.random() * 3500, q: 1.5, vol: 0.04 + Math.random() * 0.1, dur: 0.03 + Math.random() * 0.05 }));
  } else if (id === 'mar') {
    const s = start(loop(ctx, 'brown'));
    const swell = gain(ctx, 0.45);
    const lfo = start(ctx.createOscillator());
    lfo.frequency.value = 0.09;
    lfo.connect(gain(ctx, 0.4)).connect(swell.gain);
    const lp = filter(ctx, 'lowpass', 900);
    const lfo2 = start(ctx.createOscillator());
    lfo2.frequency.value = 0.09;
    lfo2.connect(gain(ctx, 500)).connect(lp.frequency);
    s.connect(lp).connect(swell).connect(out);
  } else if (id === 'floresta') {
    const s = start(loop(ctx, 'pink'));
    const wind = gain(ctx, 0.25);
    const lfo = start(ctx.createOscillator());
    lfo.frequency.value = 0.05;
    lfo.connect(gain(ctx, 0.15)).connect(wind.gain);
    s.connect(filter(ctx, 'bandpass', 1200, 0.4)).connect(wind).connect(out);
    extra = every(2500, 9000, () => chirp(ctx, out));
  } else if (id === 'lareira') {
    const s = start(loop(ctx, 'brown'));
    s.connect(filter(ctx, 'lowpass', 420)).connect(gain(ctx, 0.8)).connect(out);
    const crackle = every(40, 600, () => burst(ctx, out, { freq: 1800 + Math.random() * 3000, q: 0.8, vol: 0.05 + Math.random() * 0.25, dur: 0.008 + Math.random() * 0.03, type: 'highpass' }));
    const pop = every(1500, 6000, () => burst(ctx, out, { freq: 900, q: 1, vol: 0.3, dur: 0.06 }));
    extra = () => (crackle(), pop());
  } else if (id === 'branco') {
    start(loop(ctx, 'white')).connect(filter(ctx, 'lowpass', 9000)).connect(gain(ctx, 0.35)).connect(out);
  } else if (id === 'marrom') {
    start(loop(ctx, 'brown')).connect(filter(ctx, 'lowpass', 1200)).connect(gain(ctx, 0.9)).connect(out);
  } else if (id === 'alfa') {
    // 200 Hz na esquerda e 210 Hz na direita → batida de 10 Hz (faixa alfa), com ruído rosa bem baixo
    const merger = ctx.createChannelMerger(2);
    [200, 210].forEach((hz, ch) => {
      const o = start(ctx.createOscillator());
      o.frequency.value = hz;
      o.connect(gain(ctx, 0.12)).connect(merger, 0, ch);
    });
    merger.connect(out);
    start(loop(ctx, 'pink')).connect(filter(ctx, 'lowpass', 2000)).connect(gain(ctx, 0.12)).connect(out);
  }

  return () => {
    extra();
    sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* já parado */
      }
    });
  };
}

let playing: Playing | null = null;
let previewTimer = 0;
let previewing = false;
const FADE = 1.2;

/** Toca (ou troca para) um som com fade; volume de 0 a 1. */
export function playAmbient(ctx: AudioContext | null, id: AmbientId, volume: number) {
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  // tocar "de verdade" cancela o fim de uma amostra em andamento
  window.clearTimeout(previewTimer);
  previewing = false;
  if (playing?.id === id) {
    setAmbientVolume(ctx, volume);
    return;
  }
  stopAmbient(ctx);
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + FADE);
  out.connect(ctx.destination);
  const stopNodes = build(ctx, id, out);
  playing = { id, out, stop: stopNodes };
}

export function setAmbientVolume(ctx: AudioContext | null, volume: number) {
  if (!ctx || !playing) return;
  playing.out.gain.cancelScheduledValues(ctx.currentTime);
  playing.out.gain.setTargetAtTime(Math.max(0.0001, volume), ctx.currentTime, 0.1);
}

export function stopAmbient(ctx: AudioContext | null) {
  window.clearTimeout(previewTimer);
  previewing = false;
  if (!playing || !ctx) {
    playing = null;
    return;
  }
  const p = playing;
  playing = null;
  p.out.gain.cancelScheduledValues(ctx.currentTime);
  p.out.gain.setTargetAtTime(0.0001, ctx.currentTime, FADE / 4);
  window.setTimeout(() => {
    p.stop();
    p.out.disconnect();
  }, FADE * 1000 + 200);
}

export const ambientPlaying = () => playing?.id ?? null;
/** Uma amostra está tocando (o timer parado não deve cortá-la). */
export const ambientPreviewing = () => previewing;

/** Amostra de alguns segundos (para escolher o som com o timer parado). */
export function previewAmbient(ctx: AudioContext | null, id: AmbientId, volume: number, ms = 6000) {
  playAmbient(ctx, id, volume);
  window.clearTimeout(previewTimer);
  previewing = true;
  previewTimer = window.setTimeout(() => stopAmbient(ctx), ms);
}
