import {useRef, useState} from 'react';
import {useMagnetic} from '~/components/motion/useMagnetic';
import {Signet} from '~/components/brand/Signet';
import {useT} from '~/i18n';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter-Anmeldung. TODO: Ziel festlegen (Shopify Customer Marketing
 * via customerCreate mit acceptsMarketing oder Klaviyo) – aktuell nur UI + Validierung.
 */
export function Newsletter() {
  const t = useT().newsletter;
  const button = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<'idle' | 'invalid' | 'success'>('idle');
  useMagnetic(button, 0.4);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    setState(EMAIL.test(email) ? 'success' : 'invalid');
  };

  return (
    <section aria-labelledby="newsletter-title" className="relative overflow-hidden bg-orange px-4 py-24 text-black md:px-10 md:py-36">
      <Signet className="pointer-events-none absolute -right-[10vw] -bottom-[12vw] w-[60vw] max-w-[900px] text-black/[0.07]" />
      <div className="relative mx-auto grid max-w-[1800px] gap-12 md:grid-cols-2 md:items-end">
        <div>
          <p className="label text-black/70">{t.eyebrow}</p>
          <h2 id="newsletter-title" className="display mt-5 text-5xl md:text-8xl">
            {t.title}
          </h2>
          <p className="mt-6 max-w-md text-lg text-black/75">{t.text}</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="w-full">
          <label htmlFor="newsletter-email" className="sr-only">
            {t.placeholder}
          </label>
          <div className="flex flex-col gap-4 border-b-2 border-black pb-4 sm:flex-row sm:items-center">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t.placeholder}
              aria-invalid={state === 'invalid'}
              aria-describedby="newsletter-status"
              className="min-w-0 flex-1 bg-transparent py-3 text-xl text-black placeholder:text-black/50 focus:outline-none md:text-2xl"
            />
            <button
              ref={button}
              type="submit"
              className="label rounded-full bg-black px-8 py-5 font-semibold text-bone transition-colors hover:bg-graphite-2 focus-visible:outline-black"
            >
              {t.submit}
            </button>
          </div>
          <p id="newsletter-status" role="status" className="mt-4 min-h-6 text-sm font-medium">
            {state === 'invalid' ? t.invalid : state === 'success' ? t.success : ''}
          </p>
        </form>
      </div>
    </section>
  );
}
