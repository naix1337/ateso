import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router';
import {Signet} from '~/components/brand/Signet';
import {Wordmark} from '~/components/brand/Wordmark';
import {scrollToTarget, useLenis} from '~/components/motion/SmoothScroll';
import {useT} from '~/i18n';
import {useCartUI, useMiniCart} from './CartContext';

const NAV = [
  {key: 'collection', hash: '#kollektion'},
  {key: 'tech', hash: '#technologie'},
  {key: 'lookbook', hash: '#lookbook'},
] as const;

/** Sticky Header: verschwindet beim Runterscrollen, kommt beim Hochscrollen zurück. */
export function SiteHeader() {
  const t = useT().nav;
  const {setOpen} = useCartUI();
  const cart = useMiniCart();
  const lenis = useLenis();
  const {pathname} = useLocation();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 200);
        last = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = cart?.totalQuantity ?? 0;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-out-expo ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${solid ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'}`}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1800px] items-center justify-between px-4 md:px-10">
        <Link
          to="/"
          aria-label={t.home}
          className="flex items-center gap-3 text-bone"
          prefetch="intent"
        >
          <Signet className="h-6 w-auto text-orange" />
          <Wordmark className="h-[18px] w-auto" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden md:block">
          <ul className="flex gap-10">
            {NAV.map(({key, hash}) => (
              <li key={key}>
                <Link
                  to={`/${hash}`}
                  className="label text-bone/70 transition-colors hover:text-bone"
                  onClick={(e) => {
                    if (pathname !== '/') return;
                    e.preventDefault();
                    scrollToTarget(lenis, hash);
                  }}
                >
                  {t[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="label flex items-center gap-3 text-bone/80 transition-colors hover:text-bone"
          aria-label={`${t.cart} (${count})`}
        >
          <span className="hidden sm:inline">{t.cart}</span>
          <span
            className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-[0.7rem] tracking-normal tabular-nums ${
              count > 0 ? 'bg-orange text-black' : 'border border-white/25'
            }`}
          >
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
