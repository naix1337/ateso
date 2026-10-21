import {Link} from 'react-router';
import {Wordmark} from '~/components/brand/Wordmark';
import {Signet} from '~/components/brand/Signet';
import {useT} from '~/i18n';

export function SiteFooter({mock}: {mock: boolean}) {
  const t = useT().footer;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-4 pt-20 pb-8 md:px-10">
      <div className="mx-auto grid max-w-[1800px] gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Signet className="h-10 w-auto text-orange" />
          <p className="label mt-6 text-bone/60">{t.claim}</p>
        </div>
        {t.columns.map((col) => (
          <div key={col.title}>
            <p className="label mb-5 text-bone/60">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith('http') ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noreferrer"
                      className="text-bone/80 transition-colors hover:text-orange"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-bone/80 transition-colors hover:text-orange"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Wordmark
        className="mx-auto mt-24 block h-auto w-full max-w-[1800px] text-bone/[0.06]"
        aria-hidden="true"
      />

      <div className="mx-auto mt-6 flex max-w-[1800px] flex-col justify-between gap-2 text-xs text-bone/50 sm:flex-row">
        <p>
          © {year} ateso. {t.rights}
        </p>
        {mock ? (
          <p className="label text-[0.6rem] text-orange">
            Demo-Modus · Testdaten
          </p>
        ) : (
          <p>ateso.store</p>
        )}
      </div>
    </footer>
  );
}
