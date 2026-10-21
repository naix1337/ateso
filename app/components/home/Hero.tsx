import {useEffect, useMemo, useRef} from 'react';
import {Signet} from '~/components/brand/Signet';
import {Wordmark} from '~/components/brand/Wordmark';
import {gsap, useGsap} from '~/lib/gsap';
import {scrollToTarget, useLenis} from '~/components/motion/SmoothScroll';
import {useMagnetic} from '~/components/motion/useMagnetic';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import {useT} from '~/i18n';
import {mountainPath} from './math';

/**
 * Ruhiger Einstieg: Signet, Wortmarke und Claim vor Bergsilhouetten.
 * Erscheint, sobald der Preloader-Vorhang aufgeht (`revealed`).
 */
export function Hero({revealed}: {revealed: boolean}) {
  const t = useT().hero;
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  useMagnetic(cta, 0.3);

  const layers = useMemo(
    () => [
      {d: mountainPath(21, 78, 44, 0.022), fill: '#1a2633', depth: 10},
      {d: mountainPath(27, 92, 32, 0.034), fill: '#121a24', depth: 22},
      {d: mountainPath(33, 106, 18, 0.05), fill: '#0a0a0a', depth: 36},
    ],
    [],
  );

  // Hinter dem Preloader verstecken, Scroll-Parallax einrichten
  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    gsap.set('[data-hero-signet]', {opacity: 0, yPercent: 30, scale: 0.85});
    gsap.set('[data-letter]', {opacity: 0, yPercent: 60});
    gsap.set('[data-hero-fade]', {opacity: 0, y: 20});

    const scroll = {
      trigger: root.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    };
    gsap.to('[data-hero-content]', {
      yPercent: -35,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: scroll,
    });
    gsap.utils.toArray<SVGElement>('[data-hero-layer]').forEach((layer) => {
      gsap.to(layer, {
        yPercent: Number(layer.dataset.depth) * 0.5,
        ease: 'none',
        scrollTrigger: scroll,
      });
    });
  });

  useEffect(() => {
    if (!revealed || !root.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({defaults: {ease: 'expo.out'}})
        .to('[data-hero-signet]', {
          opacity: 1,
          yPercent: 0,
          scale: 1,
          duration: 1.6,
        })
        .to(
          '[data-letter]',
          {opacity: 1, yPercent: 0, duration: 1.2, stagger: 0.06},
          0.35,
        )
        .to(
          '[data-hero-fade]',
          {opacity: 1, y: 0, duration: 1, stagger: 0.1},
          0.8,
        );
    }, root);
    return () => ctx.kill();
  }, [revealed]);

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="relative h-svh min-h-[600px] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_0%,#1d3348_0%,#0e1722_45%,#0a0a0a_100%)]" />
      <div className="absolute top-[38%] left-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.18)_0%,transparent_65%)]" />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] md:h-[55%]"
        aria-hidden="true"
      >
        {layers.map((layer, i) => (
          <svg
            key={i}
            data-hero-layer
            data-depth={layer.depth}
            viewBox="0 0 200 120"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-full w-full"
          >
            <path d={layer.d} fill={layer.fill} />
          </svg>
        ))}
      </div>

      <div
        data-hero-content
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-[12svh] text-center"
      >
        <p
          data-hero-fade
          className="label mb-10 flex items-center gap-4 text-bone/70"
        >
          <span className="rule-orange" /> {t.eyebrow}
        </p>
        <div data-hero-signet className="w-[min(30vw,170px)]">
          <Signet className="h-auto w-full text-orange drop-shadow-[0_0_50px_rgba(255,90,31,0.35)]" />
        </div>
        <h1 id="hero-title" className="mt-10 w-[min(80vw,620px)]">
          <span className="sr-only">ateso – {t.claim}</span>
          <Wordmark className="h-auto w-full text-bone" aria-hidden="true" />
        </h1>
        <p
          data-hero-fade
          className="label mt-7 text-[0.7rem] text-bone/80 md:text-sm"
        >
          {t.claim}
        </p>
        <div data-hero-fade className="mt-12">
          <button
            ref={cta}
            type="button"
            onClick={() => scrollToTarget(lenis, '#kollektion')}
            className="label rounded-full border border-bone/30 px-8 py-4 text-bone transition-colors hover:border-orange hover:bg-orange hover:text-black"
          >
            {t.cta}
          </button>
        </div>
      </div>

      <div
        data-hero-fade
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="label text-[0.6rem] text-bone/60">{t.scroll}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-bone/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_1.8s_ease-in-out_infinite] bg-orange" />
        </span>
      </div>
    </section>
  );
}
