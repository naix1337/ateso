/** Kleine, deterministische Helfer für prozedurale Geometrie und Scroll-Phasen. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Fortschritt von p innerhalb [a, b] als 0..1. */
export const range = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Seedbarer PRNG (mulberry32) – gleiche Szene bei jedem Laden. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

/** Fraktales Rauschen, Wertebereich ca. 0..1. */
export function fbm(x: number, y: number, octaves = 5) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp;
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

/** Grat-Rauschen für schärfere Bergkämme. */
export function ridged(x: number, y: number, octaves = 5) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise(x * freq, y * freq) * 2 - 1);
    sum += n * n * amp;
    freq *= 2.1;
    amp *= 0.5;
  }
  return sum;
}
