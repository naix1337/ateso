import {useEffect, useRef} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {formatPrice, useT} from '~/i18n';
import {useCartAction, useCartUI} from '~/components/layout/CartContext';
import {useLenis} from '~/components/motion/SmoothScroll';
import type {CollectionData} from '~/lib/catalog-data';
import {Picture} from './Picture';

type ProductDialogProps = {
  collection: CollectionData;
  /** Index der gewählten Variante, null = geschlossen. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/** Produktansicht: Bild, Farbwahl, Warenkorb und die Eigenschaften der Jacke. */
export function ProductDialog({
  collection,
  index,
  onIndexChange,
  onClose,
}: ProductDialogProps) {
  const t = useT().product;
  const tShop = useT().shop;
  const panel = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const {open: cartOpen} = useCartUI();
  const open = index !== null;
  const variant = open ? collection.variants[index] : null;
  const {submit, busy} = useCartAction('product-dialog');

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, lenis, onClose]);

  // Nach dem Hinzufügen öffnet sich der Warenkorb – Produktansicht schließen
  useEffect(() => {
    if (cartOpen && open) onClose();
  }, [cartOpen, open, onClose]);

  const buyable = Boolean(variant?.merchandiseId) && variant?.available;

  return (
    <AnimatePresence>
      {variant ? (
        <div className="fixed inset-0 z-[75] flex items-end justify-center md:items-center md:p-8">
          <motion.button
            type="button"
            aria-label={t.close}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            tabIndex={-1}
            data-lenis-prevent
            className="relative grid max-h-[92svh] w-full max-w-6xl overflow-y-auto bg-graphite-1 outline-none md:max-h-[88svh] md:grid-cols-2"
            initial={{opacity: 0, y: 60}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 60}}
            transition={{type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.6}}
          >
            <button
              type="button"
              onClick={onClose}
              className="label absolute top-4 right-4 z-10 bg-black/60 px-3 py-2 text-[0.62rem] text-bone hover:text-orange"
            >
              {t.close}
            </button>

            {/* Bild */}
            <div
              className="relative aspect-[520/544] md:sticky md:top-0 md:aspect-auto md:h-[88svh] md:self-start"
              style={{background: variant.mood}}
            >
              <Picture
                key={variant.name}
                src={variant.image}
                alt={`${collection.title} in ${variant.name} (${variant.color})`}
                className="absolute inset-0 h-full w-full object-cover md:object-contain"
              />
            </div>

            {/* Infos */}
            <div className="p-6 md:p-10">
              <p className="label flex items-center gap-4 text-bone/60">
                <span className="rule-orange" /> {t.eyebrow}
              </p>
              <h2
                id="product-title"
                className="display mt-4 text-4xl md:text-5xl"
              >
                {collection.title}
              </h2>
              <p className="mt-3 text-xl tabular-nums">
                {formatPrice(variant.price.amount, variant.price.currencyCode)}
              </p>

              <p className="label mt-8 text-bone/60">
                {t.color}: <span className="text-bone">{variant.name}</span> ·{' '}
                {variant.color}
              </p>
              <div
                role="group"
                aria-label={t.color}
                className="mt-3 flex flex-wrap gap-2"
              >
                {collection.variants.map((v, i) => (
                  <button
                    key={v.name}
                    type="button"
                    aria-label={`${v.name} – ${v.color}`}
                    aria-pressed={i === index}
                    onClick={() => onIndexChange(i)}
                    className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                      i === index
                        ? 'border-orange'
                        : 'border-white/15 hover:border-white/50'
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full ${v.available ? '' : 'opacity-40'}`}
                      style={{background: v.swatch}}
                    />
                  </button>
                ))}
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
                className="label mt-8 w-full bg-orange py-4 font-semibold text-black transition hover:bg-bone disabled:cursor-not-allowed disabled:bg-graphite-2 disabled:text-bone/60"
              >
                {!variant.available
                  ? tShop.soldOut
                  : busy
                    ? tShop.adding
                    : tShop.addToCart}
              </button>

              <h3 className="label mt-12 text-bone/60">{t.featuresTitle}</h3>
              <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                {t.features.map((feature) => (
                  <li key={feature.id} className="flex gap-4 py-4">
                    <Picture
                      src={`/assets/img/detail-${feature.id}`}
                      alt=""
                      loading="lazy"
                      className="h-20 w-20 shrink-0 object-cover"
                    />
                    <div>
                      <p className="label text-[0.62rem] text-orange">
                        {feature.label}
                      </p>
                      <p className="mt-1 font-semibold">{feature.title}</p>
                      <p className="mt-1 text-sm text-bone/70">
                        {feature.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
