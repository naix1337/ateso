/**
 * Deutsche Texte der Startseite. Für EN eine `en.ts` mit gleicher Struktur
 * anlegen und in `app/i18n/index.ts` registrieren.
 */
export const de = {
  meta: {
    title: 'ateso – Alpine Performance | Built for Higher Ground',
    description:
      'Technische Hardshells für Alpinisten. Protection · Movement · Purpose. Die Technical Shell Collection von ateso.',
  },
  nav: {
    collection: 'Kollektion',
    tech: 'Technologie',
    lookbook: 'Lookbook',
    cart: 'Warenkorb',
    home: 'ateso Startseite',
  },
  preloader: {label: 'Aufstieg wird vorbereitet'},
  hero: {
    claim: 'Built for Higher Ground',
    eyebrow: 'Alpine Performance',
    cta: 'Kollektion entdecken',
    scroll: 'Scrollen',
  },
  manifest: {
    eyebrow: 'Manifest',
    words: ['Protection', 'Movement', 'Purpose'],
    body: 'Wir bauen Ausrüstung für die Momente, in denen es darauf ankommt. Für Grate im Sturm, für den letzten Meter vor dem Gipfel, für alle, die ihre Ausrüstung wirklich brauchen.',
  },
  collection: {
    eyebrow: 'Technical Shell Collection',
    title: 'Zehn Farben. Eine Haltung.',
    addToCart: 'In den Warenkorb',
    adding: 'Wird hinzugefügt …',
    soldOut: 'Ausverkauft',
    variantLabel: 'Farbvariante',
  },
  tech: {
    eyebrow: 'Technologie',
    title: 'Jedes Detail hat eine Aufgabe.',
    hotspots: [
      {
        id: 'fabric',
        label: 'Material',
        title: '3-Lagen-Hardshell',
        text: 'Wasserdicht und atmungsaktiv. Wasser perlt ab, Dampf entweicht.',
      },
      {
        id: 'zipper',
        label: 'YKK® Zipper',
        title: 'Wetterfeste Reißverschlüsse',
        text: 'Abgedeckte Zipper mit griffigen Pulls – auch mit Handschuhen.',
      },
      {
        id: 'hood',
        label: 'Hood-System',
        title: '3D-Verstellung',
        text: 'Helmkompatible Kapuze, die mit dem Kopf mitgeht.',
      },
      {
        id: 'vent',
        label: 'Ventilation',
        title: 'Unterarm-Zips',
        text: 'Schnelle Temperaturregulierung beim Aufstieg.',
      },
      {
        id: 'cuffs',
        label: 'Cuffs',
        title: 'Verstellbare Bündchen',
        text: 'Handschuhfreundlich, dicht gegen Schnee.',
      },
      {
        id: 'patch',
        label: 'Logo-Patch',
        title: 'Mattes Gummi',
        text: 'Ton in Ton oder mit Akzent – robust wie die Jacke.',
      },
    ],
  },
  lookbook: {
    eyebrow: 'Lookbook',
    statement: ['Any', 'Condition', 'Further'],
    caption: 'Technical Shell Collection 2025',
  },
  featured: {
    eyebrow: 'Ausgewählt',
    title: 'Bereit für den Aufstieg',
    quickAdd: 'Schnell hinzufügen',
    added: 'Hinzugefügt',
    viewAll: 'Alle Produkte',
    empty: 'Produkte folgen in Kürze.',
  },
  newsletter: {
    eyebrow: 'Newsletter',
    title: 'Als Erste am Berg.',
    text: 'Drops, Touren und Tech-Updates. Kein Spam, nur Höhenmeter.',
    placeholder: 'E-Mail-Adresse',
    submit: 'Anmelden',
    invalid: 'Bitte eine gültige E-Mail-Adresse eingeben.',
    success: 'Danke! Du bist dabei. (Demo – Versand noch nicht verbunden)',
  },
  cart: {
    title: 'Warenkorb',
    empty: 'Dein Warenkorb ist leer.',
    subtotal: 'Zwischensumme',
    checkout: 'Zur Kasse',
    mockCheckout: 'Demo-Modus: Checkout erst mit echtem Shopify-Store.',
    remove: 'Entfernen',
    close: 'Schließen',
    increase: 'Menge erhöhen',
    decrease: 'Menge verringern',
  },
  footer: {
    claim: 'Built for Higher Ground',
    columns: [
      {
        title: 'Shop',
        links: [
          {label: 'Kollektion', to: '/#kollektion'},
          {label: 'Technologie', to: '/#technologie'},
          {label: 'Lookbook', to: '/#lookbook'},
        ],
      },
      {
        title: 'Social',
        links: [
          {label: 'Instagram', to: 'https://instagram.com'},
          {label: 'TikTok', to: 'https://tiktok.com'},
          {label: 'YouTube', to: 'https://youtube.com'},
        ],
      },
      {
        title: 'Rechtliches',
        links: [
          {label: 'Impressum', to: '/impressum'},
          {label: 'Datenschutz', to: '/datenschutz'},
        ],
      },
    ],
    rights: 'Alle Rechte vorbehalten.',
  },
} as const;

export type Dictionary = typeof de;
