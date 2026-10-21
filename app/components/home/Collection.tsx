import {useRef, useState} from 'react';
import {gsap, ScrollTrigger, useGsap} from '~/lib/gsap';
import {scrollToTarget, useLenis} from '~/components/motion/SmoothScroll';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import {useCartAction} from '~/components/layout/CartContext';
import {formatPrice, useT} from '~/i18n';
import type {CollectionData} from '~/lib/catalog-data';
import {Picture} from './Picture';

/**
 * Gepinnter Horizontal-Scroll durch alle Farbvarianten. Die Jacke ist ein
 * Bild-Stapel (Block „Jacke“) – später durch Turntable-Sequenz oder GLB ersetzbar.
 */
export function Collection({collection}: {collection: CollectionData}) {
  const t = useT().collection;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const jacket = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const variants = collection.variants;
  const n = variants.length;
  const current = variants[active];
  const {submit, busy} = useCartAction('collection');

  useGsap(
    root,
    () => {
      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const pos = self.progress * n;
          const idx = Math.min(n - 1, Math.floor(pos));
          setActive((prev) => (prev === idx ? prev : idx));
          if (jacket.current && !prefersReducedMotion()) {
            // „Dreht mit dem Scroll“: leichte Rotation innerhalb jeder Variante
            const local = pos - idx - 0.5;
            jacket.current.style.transform = `rotateY(${local * -26}deg) translateX(${local * -3}%)`;
          }
        },
      });

      if (track.current) {
        gsap.to(track.current, {
          x: () => -(track.current!.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true},
        });
      }
      return () => trigger.kill();
    },
    [n],
  );

  const goTo = (i: number) => {
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    scrollToTarget(lenis, top + ((i + 0.5) / n) * scrollable);
  };

  return (
    <section
      ref={root}
      id="kollektion"
      aria-labelledby="collection-title"
      className="relative"
      style={{height: `${n * 65 + 100}vh`}}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Stimmungs-Hintergrund je Variante */}
        {variants.map((v, i) => (
          <div
            key={v.name}
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-1000 ease-out-expo"
            style={{background: v.mood, opacity: i === active ? 1 : 0}}
          >
            {Math.abs(i - active) <= 1 ? (
              <Picture
                src={v.image}
                className="absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl"
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
        ))}

        {/* Variantennamen laufen horizontal durch */}
        <div
          ref={track}
          aria-hidden="true"
          className="display absolute top-1/2 left-0 flex -translate-y-1/2 gap-[6vw] pl-[30vw] text-[22vw] whitespace-nowrap select-none md:text-[15vw]"
        >
          {variants.map((v, i) => (
            <span key={v.name} className={`transition-colors duration-700 ${i === active ? 'text-bone/[0.09]' : 'text-outline'}`}>
              {v.name}
            </span>
          ))}
        </div>

        {/* Jacke */}
        <div className="absolute inset-0 flex items-center justify-center [perspective:1400px]">
          <div ref={jacket} className="relative aspect-[520/544] h-[52svh] max-h-[560px] transition-transform duration-300 ease-out md:h-[62svh]">
            {variants.map((v, i) => (
              <Picture
                key={v.name}
                src={v.image}
                alt={i === active ? `${collection.title} in ${v.name} (${v.color})` : ''}
                aria-hidden={i !== active}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-out-expo [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_74%)]"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: `scale(${i === active ? 1 : 0.92})`,
                  filter: i === active ? 'none' : 'blur(8px)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Info + Kaufen */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 md:px-10 md:pb-10">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label flex items-center gap-4 text-bone/60">
                <span className="rule-orange" /> {t.eyebrow}
              </p>
              <h2 id="collection-title" className="sr-only">
                {t.title}
              </h2>
              <p className="display mt-4 text-5xl md:text-7xl" aria-live="polite">
                {current.name}
              </p>
              <p className="label mt-2 text-bone/60">
                {current.color} · {formatPrice(current.price.amount, current.price.currencyCode)}
              </p>
              <button
                type="button"
                disabled={!current.merchandiseId || !current.available || busy}
                onClick={() => current.merchandiseId && submit({intent: 'add', merchandiseId: current.merchandiseId, quantity: 1})}
                className="label mt-5 inline-flex items-center gap-3 bg-orange px-6 py-4 font-semibold text-black transition hover:bg-bone disabled:cursor-not-allowed disabled:bg-graphite-2 disabled:text-bone/50"
              >
                {busy ? t.adding : current.available ? t.addToCart : t.soldOut}
              </button>
            </div>

            <div>
              <p className="label mb-3 text-right text-bone/60 tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </p>
              <div role="group" aria-label={t.variantLabel} className="flex flex-wrap gap-2 md:justify-end">
                {variants.map((v, i) => (
                  <button
                    key={v.name}
                    type="button"
                    aria-label={`${v.name} – ${v.color}`}
                    aria-pressed={i === active}
                    onClick={() => goTo(i)}
                    className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                      i === active ? 'border-orange' : 'border-white/15 hover:border-white/50'
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full" style={{background: v.swatch}} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
