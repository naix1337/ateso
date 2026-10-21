import {useEffect, useRef, useState} from 'react';
import {gsap} from '~/lib/gsap';
import {
  SIGNET_BASE,
  SIGNET_PEAK,
  SIGNET_VIEWBOX,
  pointsToPath,
} from '~/components/brand/logo-geometry';
import {useLenis} from '~/components/motion/SmoothScroll';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import {useT} from '~/i18n';

const MAX_WAIT = 3000;

/**
 * Signet zeichnet sich als Linie, füllt sich orange, Fortschritt in %.
 * Endet, sobald `ready` gesetzt ist (spätestens nach 3 s), und gibt den Scroll frei.
 */
export function Preloader({ready}: {ready: boolean}) {
  const t = useT().preloader;
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const value = useRef({v: 0});
  const exiting = useRef(false);

  // Scroll sperren, solange der Preloader steht
  useEffect(() => {
    if (done) return;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
    };
  }, [lenis, done]);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), MAX_WAIT);
    return () => clearTimeout(id);
  }, []);

  // Phase 1: Linie zeichnen, Zähler bis 80 %
  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const render = () => {
        if (counter.current)
          counter.current.textContent = String(
            Math.round(value.current.v),
          ).padStart(2, '0');
      };
      intro.current = gsap
        .timeline()
        .fromTo(
          '[data-stroke]',
          {strokeDashoffset: 1},
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: 'power2.inOut',
            stagger: 0.15,
          },
          0,
        )
        .to(
          value.current,
          {v: 80, duration: 1.4, ease: 'power1.out', onUpdate: render},
          0,
        );
    }, root);
    return () => ctx.revert();
  }, []);

  // Phase 2: füllen, 100 %, Vorhang hoch
  useEffect(() => {
    if (!(ready || timedOut) || !root.current || exiting.current) return;
    exiting.current = true;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const render = () => {
        if (counter.current)
          counter.current.textContent = String(
            Math.round(value.current.v),
          ).padStart(2, '0');
      };
      const exit = gsap.timeline({
        delay: reduced
          ? 0
          : Math.max(
              0,
              (intro.current?.duration() ?? 0) - (intro.current?.time() ?? 0),
            ),
        onComplete: () => {
          window.scrollTo(0, 0);
          setDone(true);
        },
      });
      if (reduced) {
        exit.to(root.current, {opacity: 0, duration: 0.3});
        return;
      }
      exit
        .to(
          value.current,
          {v: 100, duration: 0.5, ease: 'power2.out', onUpdate: render},
          0,
        )
        .to(
          '[data-fill]',
          {fillOpacity: 1, duration: 0.5, ease: 'power2.out'},
          0.1,
        )
        .to(
          '[data-signet-wrap]',
          {scale: 0.9, duration: 0.4, ease: 'power2.in'},
          0.6,
        )
        .to(
          root.current,
          {clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut'},
          0.75,
        );
    }, root);
    // kein revert: der Preloader wird nach dem Exit ausgehängt
    void ctx;
  }, [ready, timedOut]);

  if (done) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      aria-label={t.label}
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-black"
      style={{clipPath: 'inset(0% 0% 0% 0%)'}}
    >
      <div data-signet-wrap className="w-28 md:w-36">
        <svg
          viewBox={SIGNET_VIEWBOX}
          className="h-auto w-full overflow-visible"
          aria-hidden="true"
        >
          {[SIGNET_PEAK, SIGNET_BASE].map((points, i) => (
            <path
              key={i}
              data-stroke
              data-fill
              d={pointsToPath(points)}
              fill="#FF5A1F"
              fillOpacity={0}
              stroke="#FF5A1F"
              strokeWidth={8}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          ))}
        </svg>
      </div>
      <p className="label mt-10 flex items-baseline gap-3 text-bone/60">
        <span
          ref={counter}
          className="w-8 text-right font-semibold text-bone tabular-nums"
        >
          00
        </span>
        <span>%</span>
      </p>
    </div>
  );
}
