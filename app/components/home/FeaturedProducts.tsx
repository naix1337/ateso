import {useRef, useState} from 'react';
import {formatPrice, useT} from '~/i18n';
import {useCartAction} from '~/components/layout/CartContext';
import {Signet} from '~/components/brand/Signet';
import {gsap, useGsap} from '~/lib/gsap';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';
import type {ProductCard} from '~/lib/catalog-data';
import {Picture} from './Picture';

export function FeaturedProducts({products}: {products: ProductCard[]}) {
  const t = useT().featured;
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    gsap.from('[data-card]', {
      opacity: 0,
      y: 80,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {trigger: root.current, start: 'top 75%'},
    });
  });

  return (
    <section ref={root} aria-labelledby="featured-title" className="bg-black px-4 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="label flex items-center gap-4 text-bone/60">
              <span className="rule-orange" /> {t.eyebrow}
            </p>
            <h2 id="featured-title" className="display mt-5 text-4xl md:text-6xl">
              {t.title}
            </h2>
          </div>
        </div>

        {products.length ? (
          <ul className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.key} data-card>
                <Card product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-bone/60">{t.empty}</p>
        )}
      </div>
    </section>
  );
}

function Card({product}: {product: ProductCard}) {
  const t = useT().featured;
  const {submit, busy, data} = useCartAction(`card-${product.key}`);
  const [tilt, setTilt] = useState({x: 0, y: 0, hover: false});

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 12, hover: true});
  };

  return (
    <article className="group">
      <div className="[perspective:1000px]">
        <div
          onPointerMove={onMove}
          onPointerLeave={() => setTilt({x: 0, y: 0, hover: false})}
          className="relative aspect-[4/5] overflow-hidden bg-graphite-1 transition-transform duration-300 ease-out"
          style={{transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`}}
        >
          {product.image ? (
            <>
              <Picture
                src={product.image}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out-expo group-hover:scale-105"
              />
              {product.hoverImage ? (
                <Picture
                  src={product.hoverImage}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out-expo group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="grid h-full place-items-center">
              <Signet className="w-1/3 text-graphite-2" />
            </div>
          )}

          <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-[opacity,transform] duration-500 ease-out-expo md:translate-y-4 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <button
              type="button"
              disabled={!product.merchandiseId || !product.available || busy}
              onClick={() => product.merchandiseId && submit({intent: 'add', merchandiseId: product.merchandiseId, quantity: 1})}
              className="label w-full bg-bone py-3 text-[0.65rem] font-semibold text-black transition hover:bg-orange disabled:bg-graphite-2 disabled:text-bone/50"
            >
              {busy ? '…' : data?.cart ? t.added : t.quickAdd}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{product.title}</h3>
          <p className="label mt-1 text-[0.62rem] text-bone/60">{product.subtitle}</p>
        </div>
        <p className="shrink-0 tabular-nums">{formatPrice(product.price.amount, product.price.currencyCode)}</p>
      </div>
    </article>
  );
}
