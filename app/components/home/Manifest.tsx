import {useMemo, useRef} from 'react';
import {gsap, useGsap} from '~/lib/gsap';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import {useT} from '~/i18n';
import {fbm, ridged} from './hero/math';

function mountainPath(
  seed: number,
  base: number,
  amplitude: number,
  roughness: number,
) {
  const pts: string[] = [];
  for (let x = 0; x <= 200; x += 2) {
    const y =
      base -
      ridged(x * roughness + seed, seed * 1.7) * amplitude -
      fbm(x * 0.05, seed) * amplitude * 0.3;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M0,120 L${pts.join(' L')} L200,120 Z`;
}

/** „Protection · Movement · Purpose“ mit Split-Text-Reveals vor parallaxen Bergebenen. */
export function Manifest() {
  const t = useT().manifest;
  const root = useRef<HTMLElement>(null);

  const layers = useMemo(
    () => [
      {d: mountainPath(1, 70, 48, 0.02), fill: '#121820', speed: -8},
      {d: mountainPath(4, 84, 38, 0.03), fill: '#0f141a', speed: -16},
      {d: mountainPath(8, 96, 26, 0.045), fill: '#0c1015', speed: -26},
      {d: mountainPath(12, 108, 14, 0.06), fill: '#0a0a0a', speed: -38},
    ],
    [],
  );

  useGsap(
    root,
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>('[data-word]').forEach((word) => {
        gsap.fromTo(
          word.querySelectorAll('[data-char]'),
          {yPercent: 110, rotate: 6},
          {
            yPercent: 0,
            rotate: 0,
            stagger: 0.025,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: word,
              start: 'top 88%',
              end: 'top 50%',
              scrub: 0.8,
            },
          },
        );
      });

      gsap.utils.toArray<SVGElement>('[data-mountain]').forEach((layer) => {
        gsap.to(layer, {
          yPercent: Number(layer.dataset.speed),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.from('[data-manifest-body]', {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {trigger: '[data-manifest-body]', start: 'top 85%'},
      });
    },
    [],
    {defer: true},
  );

  return (
    <section
      ref={root}
      id="manifest"
      className="relative overflow-hidden bg-black pt-40 pb-[45vh] md:pt-56"
    >
      <div className="relative z-10 mx-auto max-w-[1800px] px-4 md:px-10">
        <p className="label mb-10 flex items-center gap-4 text-bone/60">
          <span className="rule-orange" /> {t.eyebrow}
        </p>

        <h2 className="display text-[17vw] md:text-[12vw]">
          {t.words.map((word, i) => (
            <span key={word} className="block">
              <span className="sr-only">{word}</span>
              <span
                data-word
                aria-hidden="true"
                className={`inline-flex overflow-hidden pb-[0.08em] ${i === 1 ? 'md:ml-[12vw]' : i === 2 ? 'md:ml-[24vw]' : ''}`}
              >
                {word.split('').map((char, j) => (
                  <span
                    key={j}
                    data-char
                    className="inline-block will-change-transform"
                  >
                    {char}
                  </span>
                ))}
                {i < t.words.length - 1 ? (
                  <span data-char className="inline-block text-orange">
                    ·
                  </span>
                ) : null}
              </span>
            </span>
          ))}
        </h2>

        <p
          data-manifest-body
          className="mt-16 max-w-xl text-lg leading-relaxed text-bone/70 md:mt-24 md:ml-[24vw] md:text-xl"
        >
          {t.body}
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vh]"
        aria-hidden="true"
      >
        {layers.map((layer, i) => (
          <svg
            key={i}
            data-mountain
            data-speed={layer.speed}
            viewBox="0 0 200 120"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-full w-full"
          >
            <path d={layer.d} fill={layer.fill} />
          </svg>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </div>
    </section>
  );
}
