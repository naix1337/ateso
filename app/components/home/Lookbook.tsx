import {useRef} from 'react';
import {gsap, useGsap} from '~/lib/gsap';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import {useT} from '~/i18n';
import {Picture} from './Picture';

type LookbookProps = {
  /** Optionales Video (z. B. Higgsfield-Film): {webm, mp4, poster}. Ohne Video wird das Standbild gezeigt. */
  video?: {webm: string; mp4: string; poster: string};
};

/** Vollbild-Kampagne mit Clip-Path-Reveal und Statement-Typo. */
export function Lookbook({video}: LookbookProps) {
  const t = useT().lookbook;
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({
      defaults: {ease: 'none'},
      scrollTrigger: {trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6},
    });
    tl.fromTo('[data-frame]', {clipPath: 'inset(24% 20% 24% 20%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45}, 0)
      .fromTo('[data-media]', {scale: 1.3}, {scale: 1, duration: 0.7}, 0)
      .fromTo('[data-statement]', {yPercent: 110}, {yPercent: 0, stagger: 0.07, duration: 0.2, ease: 'power3.out'}, 0.35)
      .fromTo('[data-inset]', {opacity: 0, y: 80}, {opacity: 1, y: 0, duration: 0.2}, 0.6)
      .set({}, {}, 1);
  });

  return (
    <section ref={root} id="lookbook" aria-labelledby="lookbook-title" className="relative h-[230vh] bg-black">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-frame className="absolute inset-0 overflow-hidden">
          <div data-media className="absolute inset-0">
            {video ? (
              <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster={video.poster} aria-hidden="true">
                <source src={video.webm} type="video/webm" />
                <source src={video.mp4} type="video/mp4" />
              </video>
            ) : (
              <Picture
                src="/assets/img/lookbook"
                alt="Zwei Alpinisten in ateso-Hardshells vor verschneiten Gipfeln"
                className="h-full w-full object-cover object-[50%_30%]"
                loading="lazy"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.35)_0%,rgba(10,10,10,0.1)_40%,rgba(10,10,10,0.85)_100%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-[1800px] px-4 pb-10 md:px-10 md:pb-16">
          <p className="label mb-6 flex items-center gap-4 text-bone/70">
            <span className="rule-orange" /> {t.eyebrow}
          </p>
          <h2 id="lookbook-title" className="display text-[16vw] md:text-[10vw]">
            {t.statement.map((word, i) => (
              <span key={word} className="block overflow-hidden pb-[0.06em]">
                <span data-statement className={`block ${i === 1 ? 'text-orange' : ''}`}>
                  {word}
                </span>
              </span>
            ))}
          </h2>
          <p className="label mt-6 text-bone/60">{t.caption}</p>
        </div>

        <div data-inset className="absolute top-[calc(var(--header-h)+2rem)] right-4 z-10 hidden w-[16vw] max-w-[260px] md:right-10 md:block">
          <Picture src="/assets/img/lookbook-back" alt="Rückansicht mit Kapuze" className="aspect-[336/370] w-full object-cover" loading="lazy" />
          <p className="label mt-3 text-[0.6rem] text-bone/60">Back Detail</p>
        </div>
      </div>
    </section>
  );
}
