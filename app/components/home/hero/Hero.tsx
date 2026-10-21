import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {Wordmark} from '~/components/brand/Wordmark';
import {gsap, ScrollTrigger, useGsap} from '~/lib/gsap';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import {useT} from '~/i18n';
import {HeroFallback} from './HeroFallback';

const GlacierScene = lazy(() => import('./GlacierScene'));

/**
 * pending  – noch keine Entscheidung (SSR/erster Frame, zeigt den 2.5D-Aufbau)
 * webgl    – Echtzeit-3D (Desktop, GPU-Tier ≥ 2)
 * fallback – 2.5D-Sequenz (mobil, schwache GPU)
 * static   – prefers-reduced-motion: Endbild ohne Pinning
 */
type Mode = 'pending' | 'webgl' | 'fallback' | 'static';

async function detectMode(): Promise<Mode> {
  if (prefersReducedMotion()) return 'static';
  const forced = new URLSearchParams(window.location.search).get('hero');
  if (forced === 'webgl' || forced === 'fallback' || forced === 'static') return forced;
  try {
    const {getGPUTier} = await import('detect-gpu');
    const gpu = await Promise.race([
      getGPUTier({benchmarksURL: '/assets/gpu'}),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (gpu && gpu.tier >= 2 && !gpu.isMobile && window.innerWidth >= 768) return 'webgl';
  } catch {
    // keine WebGL-Unterstützung → Fallback
  }
  return 'fallback';
}

export function Hero({onReady}: {onReady: () => void}) {
  const t = useT().hero;
  const section = useRef<HTMLElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [mode, setMode] = useState<Mode>('pending');
  const [active, setActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    detectMode().then((m) => !cancelled && setMode(m));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === 'fallback' || mode === 'static') onReady();
  }, [mode, onReady]);

  useGsap(
    section,
    () => {
      if (mode === 'pending') return;

      if (mode === 'static') {
        gsap.set('[data-hint]', {opacity: 0});
        gsap.set('[data-signet]', {opacity: 1});
        gsap.set('[data-wall], [data-crack]', {opacity: 0});
        gsap.set('[data-glow]', {opacity: 0.45});
        return;
      }

      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      // Szene nur rendern, solange der Hero sichtbar ist
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => setActive(self.isActive),
      });

      const tl = gsap.timeline({
        defaults: {ease: 'none'},
        scrollTrigger: {trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.6},
      });
      tl.to('[data-hint]', {opacity: 0, y: 20, duration: 0.05}, 0)
        .to('[data-eyebrow]', {opacity: 0, duration: 0.08}, 0.12)
        .fromTo(
          '[data-letter]',
          {opacity: 0, yPercent: 70, filter: 'blur(10px)'},
          {opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.06, stagger: 0.018, ease: 'power2.out'},
          0.84,
        )
        .fromTo('[data-claim]', {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.06}, 0.93)
        .set({}, {}, 1);

      if (mode === 'fallback') {
        gsap.utils.toArray<SVGElement>('[data-layer]').forEach((layer) => {
          const depth = Number(layer.dataset.depth);
          tl.fromTo(layer, {yPercent: 0, scale: 1}, {yPercent: depth * 30, scale: 1 + depth * 0.25, duration: 0.6}, 0);
        });
        tl.fromTo('[data-ice]', {scale: 0.7}, {scale: 1.05, duration: 0.45}, 0)
          .fromTo('[data-glow]', {opacity: 0.15}, {opacity: 1, duration: 0.25}, 0.25)
          .to('[data-crack]', {strokeDashoffset: 0, duration: 0.16, stagger: 0.008}, 0.3)
          .to('[data-wall], [data-crack]', {opacity: 0, scale: 1.25, filter: 'blur(8px)', duration: 0.2}, 0.46)
          .fromTo(
            '[data-signet]',
            {opacity: 0, yPercent: 40, scale: 0.75, rotateY: -50},
            {opacity: 1, yPercent: -10, scale: 1, rotateY: 0, duration: 0.28, ease: 'power2.out'},
            0.56,
          )
          .to('[data-glow]', {opacity: 0.35, duration: 0.15}, 0.8);
      }
    },
    [mode],
  );

  const isStatic = mode === 'static';

  return (
    <section ref={section} className={`relative ${isStatic ? 'h-svh' : 'h-[350vh]'}`} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        ateso – {t.claim}
      </h1>
      <div className="sticky top-0 h-svh overflow-hidden">
        {mode === 'webgl' ? (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <GlacierScene progress={progress} active={active} onReady={onReady} />
            </Suspense>
          </div>
        ) : (
          <HeroFallback ref={fallback} />
        )}

        <div className="pointer-events-none absolute inset-0">
          <div data-eyebrow className="absolute top-[calc(var(--header-h)+2rem)] left-4 md:left-10">
            <span className="rule-orange mb-3" />
            <p className="label text-bone/70">{t.eyebrow}</p>
          </div>

          <div className="absolute inset-x-0 top-[66%] flex flex-col items-center px-6">
            <Wordmark className="h-auto w-[min(78vw,640px)] text-bone" aria-hidden="true" />
            <p data-claim className="label mt-6 text-[0.7rem] text-bone/80 md:text-sm">
              {t.claim}
            </p>
          </div>

          <div data-hint className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
            <span className="label text-[0.6rem] text-bone/60">{t.scroll}</span>
            <span className="relative block h-12 w-px overflow-hidden bg-bone/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_1.8s_ease-in-out_infinite] bg-orange" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
