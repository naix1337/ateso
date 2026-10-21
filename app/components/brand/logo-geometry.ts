/**
 * Nachbau von Signet und Wortmarke nach `referenzen/logo-board.jpeg`.
 * Keine Original-Vektoren vorhanden – sobald welche existieren, hier ersetzen.
 */

type Point = readonly [number, number];

/** Signet: zwei Flächen, Koordinaten im viewBox-Raum (SIGNET_VIEWBOX). */
export const SIGNET_PEAK: Point[] = [
  [557, 48],
  [930, 648],
  [525, 405],
  [590, 237],
  [195, 455],
];

export const SIGNET_BASE: Point[] = [
  [475, 362],
  [385, 535],
  [355, 558],
  [45, 650],
  [150, 545],
];

export const SIGNET_VIEWBOX = '30 30 915 635';

export function pointsToPath(points: readonly Point[]) {
  return `M${points.map(([x, y]) => `${x},${y}`).join('L')}Z`;
}

/** Abgerundetes Rechteck als Pfad-Segment (für evenodd-Aussparungen). */
function rr(x: number, y: number, w: number, h: number, r: number) {
  const k = Math.min(r, w / 2, h / 2);
  return (
    `M${x + k},${y}H${x + w - k}Q${x + w},${y} ${x + w},${y + k}` +
    `V${y + h - k}Q${x + w},${y + h} ${x + w - k},${y + h}` +
    `H${x + k}Q${x},${y + h} ${x},${y + h - k}` +
    `V${y + k}Q${x},${y} ${x + k},${y}Z`
  );
}

/**
 * Wortmarke „ateso“: aufrecht konstruiert (x-Höhe 180, Strich 48),
 * die Kursive entsteht über WORDMARK_SKEW.
 * Jeder Buchstabe besteht aus mehreren Pfaden; Aussparungen per evenodd.
 */
const H = 180;
const T = 48;

function letterA(x: number) {
  return [
    rr(x + 24, 0, 246, T, 22),
    rr(x + 222, 0, T, H, 22),
    rr(x, 76, 270, H - 76, 34) + rr(x + T, 76 + 40, 270 - 2 * T, 26, 12),
  ];
}

function letterT(x: number) {
  return [
    rr(x + 28, -52, T + 4, H + 52, 20),
    rr(x, 0, 190, T - 4, 18),
    rr(x + 28, H - T, 172, T, 24),
  ];
}

function letterE(x: number) {
  return [
    rr(x, 0, 270, 112, 38) + rr(x + T, 44, 270 - 2 * T, 28, 12),
    rr(x, 40, T, H - 40, 22),
    rr(x, H - T, 262, T, 24),
  ];
}

function letterS(x: number) {
  return [
    rr(x + 20, 0, 250, T - 4, 22),
    rr(x, 0, T + 4, 104, 26),
    rr(x, 66, 270, 40, 20),
    rr(x + 218, 66, T + 4, H - 66, 26),
    rr(x, H - T, 270, T, 24),
  ];
}

function letterO(x: number) {
  return [rr(x, 0, 300, H, 46) + rr(x + T + 4, T - 4, 300 - 2 * (T + 4), H - 2 * (T - 4), 16)];
}

const GAP = 34;
const letters = [
  {char: 'a', width: 270, build: letterA},
  {char: 't', width: 200, build: letterT},
  {char: 'e', width: 270, build: letterE},
  {char: 's', width: 270, build: letterS},
  {char: 'o', width: 300, build: letterO},
] as const;

export const WORDMARK_LETTERS = (() => {
  let x = 70;
  return letters.map(({char, width, build}) => {
    const glyph = {char, paths: build(x)};
    x += width + GAP;
    return glyph;
  });
})();

/** Leichte Kursive wie im Logo-Board. */
export const WORDMARK_SKEW = 'skewX(-22)';
export const WORDMARK_VIEWBOX = '-20 -60 1600 250';
