/**
 * Schneidet Varianten-, Detail- und Lookbook-Bilder aus den Referenz-Boards
 * und exportiert AVIF + WebP nach public/assets/img.
 * Aufruf: npm run assets
 */
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';

const OUT = 'public/assets/img';
const TEN = 'referenzen/kollektion-10-varianten.jpeg';
const FIVE = 'referenzen/kollektion-5-varianten.jpeg';

// Kachelraster im 10er-Board: 5 Spalten, Jacke oberhalb des Labels
const cols = [0, 265, 528, 787, 1050];
const variantRows = [
  {top: 276, names: ['aurora', 'summit', 'ridgeline', 'glacier', 'sandstone']},
  {top: 605, names: ['forest', 'terra', 'alpine', 'shadow', 'signal']},
];

const crops = [
  ...variantRows.flatMap(({top, names}) =>
    names.map((name, i) => ({
      src: TEN,
      name: `variant-${name}`,
      box: {left: cols[i], top, width: 260, height: 272},
      width: 520,
    })),
  ),
  // Detailleiste im 5er-Board (größere Kacheln)
  ...[
    ['patch', 12],
    ['hood', 226],
    ['zipper', 444],
    ['fabric', 662],
    ['vent', 878],
    ['cuffs', 1096],
    ['interior', 1316],
  ].map(([name, left]) => ({
    src: FIVE,
    name: `detail-${name}`,
    box: {left, top: 773, width: 204, height: 172},
    width: 612,
  })),
  {src: FIVE, name: 'lookbook', box: {left: 392, top: 0, width: 806, height: 370}, width: 1612},
  {src: FIVE, name: 'lookbook-back', box: {left: 1200, top: 0, width: 336, height: 370}, width: 672},
];

await mkdir(OUT, {recursive: true});
for (const {src, name, box, width} of crops) {
  const img = sharp(src).extract(box).resize({width, kernel: 'lanczos3'}).sharpen({sigma: 0.6});
  await img.clone().avif({quality: 55}).toFile(`${OUT}/${name}.avif`);
  await img.clone().webp({quality: 78}).toFile(`${OUT}/${name}.webp`);
  console.log('✓', name);
}

// GPU-Benchmarks für detect-gpu lokal ausliefern (kein CDN-Request)
import {cp} from 'node:fs/promises';
await cp('node_modules/detect-gpu/dist/benchmarks', 'public/assets/gpu', {recursive: true});
console.log('✓ gpu benchmarks');

// OG-Image (1200×630) aus dem Logo-Nachbau
const logo = await import('../app/components/brand/logo-geometry.ts');
const wordmark = logo.WORDMARK_LETTERS.flatMap((l) => l.paths)
  .map((d) => `<path fill-rule="evenodd" d="${d}"/>`)
  .join('');
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#1d3348"/><stop offset="1" stop-color="#0A0A0A"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <svg x="450" y="70" width="300" height="208" viewBox="${logo.SIGNET_VIEWBOX}"><g fill="#FF5A1F" stroke="#FF5A1F" stroke-width="10" stroke-linejoin="round"><path d="${logo.pointsToPath(logo.SIGNET_PEAK)}"/><path d="${logo.pointsToPath(logo.SIGNET_BASE)}"/></g></svg>
  <svg x="300" y="320" width="600" height="94" viewBox="${logo.WORDMARK_VIEWBOX}"><g fill="#F2EFE8" transform="${logo.WORDMARK_SKEW}">${wordmark}</g></svg>
  <text x="600" y="500" fill="#F2EFE8" fill-opacity="0.75" font-family="Arial, sans-serif" font-size="22" letter-spacing="9" text-anchor="middle">BUILT FOR HIGHER GROUND</text>
</svg>`;
await sharp(Buffer.from(og)).jpeg({quality: 86}).toFile(`${OUT}/og.jpg`);
console.log('✓ og.jpg');
