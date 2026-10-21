import {de, type Dictionary} from './de';

const dictionaries: Record<string, Dictionary> = {de};

export const DEFAULT_LOCALE = 'de';

/** Aktuell nur DE; Locale-Erkennung (Pfad/Cookie) kommt mit EN. */
export function useT(locale: string = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? de;
}

export function formatPrice(amount: string | number, currencyCode = 'EUR') {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
}
