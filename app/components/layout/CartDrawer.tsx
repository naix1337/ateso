import {useEffect, useRef} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {formatPrice, useT} from '~/i18n';
import {useCartAction, useCartUI, useMiniCart} from './CartContext';
import {useLenis} from '~/components/motion/SmoothScroll';
import type {MiniCartLine} from '~/lib/cart.server';

export function CartDrawer() {
  const t = useT().cart;
  const {open, setOpen} = useCartUI();
  const cart = useMiniCart();
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, lenis, setOpen]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label={t.close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            tabIndex={-1}
            data-lenis-prevent
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-graphite-1 outline-none"
            initial={{x: '100%'}}
            animate={{x: 0}}
            exit={{x: '100%'}}
            transition={{type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.6}}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <p className="label text-bone">
                {t.title}{' '}
                <span className="text-orange">
                  ({cart?.totalQuantity ?? 0})
                </span>
              </p>
              <button
                type="button"
                className="label text-bone/70 hover:text-orange"
                onClick={() => setOpen(false)}
              >
                {t.close}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart && cart.lines.length > 0 ? (
                <ul className="divide-y divide-white/10">
                  {cart.lines.map((line) => (
                    <CartLine key={line.id} line={line} />
                  ))}
                </ul>
              ) : (
                <p className="py-12 text-center text-bone/60">{t.empty}</p>
              )}
            </div>

            <div className="border-t border-white/10 px-6 py-6">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="label text-bone/60">{t.subtotal}</span>
                <span className="text-lg font-semibold">
                  {formatPrice(
                    cart?.subtotal.amount ?? 0,
                    cart?.subtotal.currencyCode,
                  )}
                </span>
              </div>
              {cart?.checkoutUrl ? (
                <a
                  href={cart.checkoutUrl}
                  className="label block w-full bg-orange py-4 text-center font-semibold text-black transition hover:bg-bone"
                >
                  {t.checkout}
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="label block w-full cursor-not-allowed bg-orange/40 py-4 text-center font-semibold text-black/70"
                  >
                    {t.checkout}
                  </button>
                  {cart?.mock ? (
                    <p className="mt-3 text-center text-xs text-bone/60">
                      {t.mockCheckout}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function CartLine({line}: {line: MiniCartLine}) {
  const t = useT().cart;
  const {submit, busy} = useCartAction(`line-${line.id}`);
  const update = (quantity: number) =>
    submit({intent: 'update', lineId: line.id, quantity});

  return (
    <li
      className={`flex gap-4 py-4 transition-opacity ${busy ? 'opacity-50' : ''}`}
    >
      <div className="h-24 w-20 shrink-0 overflow-hidden bg-graphite-2">
        {line.image ? (
          <img
            src={line.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col">
        <p className="font-semibold">{line.title}</p>
        <p className="label mt-1 text-bone/60">{line.variantTitle}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center border border-white/15">
            <button
              type="button"
              aria-label={t.decrease}
              className="h-8 w-8 hover:text-orange"
              onClick={() => update(line.quantity - 1)}
            >
              –
            </button>
            <span className="w-8 text-center text-sm tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label={t.increase}
              className="h-8 w-8 hover:text-orange"
              onClick={() => update(line.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="text-sm">
            {formatPrice(line.amount, line.currencyCode)}
          </span>
        </div>
        <button
          type="button"
          className="label mt-2 self-start text-[0.6rem] text-bone/60 hover:text-orange"
          onClick={() => submit({intent: 'remove', lineId: line.id})}
        >
          {t.remove}
        </button>
      </div>
    </li>
  );
}
