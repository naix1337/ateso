/**
 * 2.5D-Fallback für Mobilgeräte/schwache GPUs und Basis für reduced motion:
 * Himmel, Bergebenen, Eiswand mit Rissen und aufsteigendes Signet – reines SVG/CSS.
 * Wird ein Higgsfield-Video ergänzt, kann es hier als unterste Ebene gescrubbt werden.
 */
import {forwardRef, useMemo} from 'react';
import {Signet} from '~/components/brand/Signet';
import {fbm, ridged, seeded} from './math';

function ridgePath(
  seed: number,
  base: number,
  amplitude: number,
  roughness: number,
) {
  const points: string[] = [];
  for (let x = 0; x <= 100; x += 1) {
    const y =
      base -
      (ridged(x * roughness + seed, seed) * amplitude +
        fbm(x * 0.08, seed) * amplitude * 0.4);
    points.push(`${x},${y.toFixed(2)}`);
  }
  return `M0,100 L${points.join(' L')} L100,100 Z`;
}

const CRACKS = (() => {
  const rand = seeded(11);
  return Array.from({length: 9}, () => {
    let x = 50 + (rand() - 0.5) * 6;
    let y = 50 + (rand() - 0.5) * 6;
    const angle = rand() * Math.PI * 2;
    const segs = [`M${x.toFixed(1)},${y.toFixed(1)}`];
    for (let i = 0; i < 5; i++) {
      const a = angle + (rand() - 0.5) * 0.9;
      const len = 3 + rand() * 5;
      x += Math.cos(a) * len;
      y += Math.sin(a) * len * 0.8;
      segs.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return segs.join(' ');
  });
})();

export const HeroFallback = forwardRef<HTMLDivElement>(
  function HeroFallback(_, ref) {
    const layers = useMemo(
      () => [
        {d: ridgePath(2, 62, 34, 0.035), fill: '#1b2633', depth: 0.15},
        {d: ridgePath(5, 72, 26, 0.05), fill: '#2a3c50', depth: 0.3},
        {d: ridgePath(9, 84, 16, 0.07), fill: '#8fb3c9', depth: 0.55},
      ],
      [],
    );

    return (
      <div
        ref={ref}
        className="absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Himmel: blaue Stunde */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#1d3348_0%,#0b1520_45%,#05080d_100%)]" />

        {layers.map((layer, i) => (
          <svg
            key={i}
            data-layer={i}
            data-depth={layer.depth}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-[70%] w-full will-change-transform"
          >
            <path d={layer.d} fill={layer.fill} />
          </svg>
        ))}

        {/* Eiswand mit Glühen und Rissen */}
        <div
          data-ice
          className="absolute top-1/2 left-1/2 aspect-[4/3] w-[min(78vw,720px)] -translate-x-1/2 -translate-y-[40%]"
        >
          <div
            data-glow
            className="absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,rgba(255,106,42,0.9)_0%,rgba(255,90,31,0.25)_35%,transparent_65%)] opacity-20 blur-2xl"
          />
          <div
            data-wall
            className="absolute inset-0 bg-[linear-gradient(160deg,rgba(232,244,250,0.55),rgba(143,179,201,0.35)_45%,rgba(40,70,95,0.6))] backdrop-blur-sm"
            style={{
              clipPath:
                'polygon(8% 12%, 30% 2%, 62% 6%, 92% 0%, 100% 40%, 96% 100%, 4% 100%, 0% 46%)',
            }}
          />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {CRACKS.map((d, i) => (
              <path
                key={i}
                data-crack
                d={d}
                fill="none"
                stroke="#ffb27a"
                strokeWidth={0.6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{filter: 'drop-shadow(0 0 1.5px #ff5a1f)'}}
              />
            ))}
          </svg>
        </div>

        {/* Signet */}
        <div
          data-signet
          className="absolute top-[38%] left-1/2 w-[min(46vw,300px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
        >
          <Signet className="h-auto w-full text-orange drop-shadow-[0_0_40px_rgba(255,90,31,0.55)]" />
        </div>

        {/* Bodennebel */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#05080d] via-[#0b1520]/70 to-transparent" />
      </div>
    );
  },
);
