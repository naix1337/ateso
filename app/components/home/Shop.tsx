import {useCallback, useRef, useState} from 'react';
import {formatPrice, useT} from '~/i18n';
import {useCartAction} from '~/components/layout/CartContext';
import {gsap, useGsap} from '~/lib/gsap';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import type {CollectionData, CollectionVariant} from '~/lib/catalog-data';
import {Picture} from './Picture';
import {ProductDialog} from './ProductDialog';

/**
 * Produkte direkt zum Kauf: eine Karte je Farbvariante mit Warenkorb-Button.
 * Klick auf die Jacke öffnet die Produktansicht mit allen Eigenschaften.
 */
export function Shop({collection}: {collection: CollectionData}) {
  const t = useT().shop;
  const root = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const close = useCallback(() => setSelected(null), []);

  useGsap(
    root,
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-card]', {
        opacity: 0,
        y: 60,
        duration: 1,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {trigger: root.current, start: 'top 75%'},
      });
    },
    [],
    {defer: true},
  );

  return (
    <section
      ref={root}
      id="shop"
      aria-labelledby="shop-title"
      className="bg-black px-4 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-12 md:mb-16">
          <p className="label flex items-center gap-4 text-bone/60">
            <span className="rule-orange" /> {t.eyebrow}
          </p>
          <h2 id="shop-title" className="display mt-5 text-4xl md:text-6xl">
            {t.title}
          </h2>
          <p className="mt-4 max-w-xl text-bone/70">{t.text}</p>
        </div>

        {collection.variants.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-5">
            {collection.variants.map((variant, i) => (
              <li key={variant.name} data-card>
                <ProductCard
                  title={collection.title}
                  variant={variant}
                  onOpen={() => setSelected(i)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-bone/60">{t.empty}</p>
        )}
      </div>

      <ProductDialog
        collection={collection}
        index={selected}
        onIndexChange={setSelected}
        onClose={close}
      />
    </section>
  );
}

function ProductCard({
  title,
  variant,
  onOpen,
}: {
  title: string;
  variant: CollectionVariant;
  onOpen: () => void;
}) {
  const t = useT().shop;
  const {submit, busy, data} = useCartAction(`shop-${variant.name}`);
  const buyable = Boolean(variant.merchandiseId) && variant.available;

  return (
    <article className="group flex h-full flex-col">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`${title} ${variant.name} – ${t.details}`}
        className="relative block aspect-[520/544] overflow-hidden bg-graphite-1 text-left"
      >
        <Picture
          src={variant.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        {!variant.available ? (
          <span className="label absolute top-3 left-3 bg-black/80 px-2 py-1 text-[0.6rem] text-bone">
            {t.soldOut}
          </span>
        ) : null}
        <span className="label absolute inset-x-3 bottom-3 bg-black/70 py-2 text-center text-[0.6rem] text-bone opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
          {t.details}
        </span>
      </button>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{variant.name}</h3>
            <p className="label mt-1 text-[0.6rem] text-bone/60">
              {variant.color}
            </p>
          </div>
          <p className="shrink-0 text-sm tabular-nums">
            {formatPrice(variant.price.amount, variant.price.currencyCode)}
          </p>
        </div>
        <button
          type="button"
          disabled={!buyable || busy}
          onClick={() =>
            variant.merchandiseId &&
            submit({
              intent: 'add',
              merchandiseId: variant.merchandiseId,
              quantity: 1,
            })
          }
          className="label mt-4 w-full bg-bone py-3 text-[0.62rem] font-semibold text-black transition hover:bg-orange disabled:cursor-not-allowed disabled:bg-graphite-2 disabled:text-bone/60"
        >
          {!variant.available
            ? t.soldOut
            : busy
              ? t.adding
              : data?.cart
                ? t.added
                : t.addToCart}
        </button>
      </div>
    </article>
  );
}
