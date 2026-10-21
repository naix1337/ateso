/** Typen und Gestaltungsdaten der Kollektion (ohne Server-Abhängigkeiten). */
export type Money = {amount: string; currencyCode: string};

export type VariantMeta = {
  name: string;
  color: string;
  swatch: string;
  /** Hintergrund-Stimmung der Kollektion (CSS-Gradient). */
  mood: string;
  image: string;
};

export type CollectionVariant = VariantMeta & {
  /** null = nicht kaufbar (z. B. Variante fehlt im echten Store). */
  merchandiseId: string | null;
  available: boolean;
  price: Money;
};

export type CollectionData = {
  title: string;
  handle: string;
  variants: CollectionVariant[];
};

export type ProductCard = {
  key: string;
  handle: string;
  title: string;
  subtitle: string;
  price: Money;
  image: string | null;
  hoverImage: string | null;
  merchandiseId: string | null;
  available: boolean;
};

const img = (name: string) => `/assets/img/${name}`;

/** Gestaltungsdaten je Variante – gelten im Mock- und im Live-Modus. */
export const VARIANT_META: VariantMeta[] = [
  {name: 'Aurora', color: 'All Black', swatch: '#111111', mood: 'radial-gradient(120% 90% at 50% 70%, #23262b 0%, #0a0a0a 70%)', image: img('variant-aurora')},
  {name: 'Summit', color: 'Black / Orange', swatch: '#ff5a1f', mood: 'radial-gradient(120% 90% at 50% 80%, #4a2414 0%, #120b08 55%, #0a0a0a 85%)', image: img('variant-summit')},
  {name: 'Ridgeline', color: 'Graphite / Black', swatch: '#4a4d52', mood: 'radial-gradient(120% 90% at 50% 40%, #3a3f46 0%, #15171a 60%, #0a0a0a 90%)', image: img('variant-ridgeline')},
  {name: 'Glacier', color: 'Ice Blue / Black', swatch: '#6f9cc4', mood: 'radial-gradient(120% 90% at 50% 30%, #3f6c8c 0%, #142636 55%, #0a0a0a 90%)', image: img('variant-glacier')},
  {name: 'Sandstone', color: 'Sand / Black', swatch: '#d8cdb8', mood: 'radial-gradient(120% 90% at 50% 70%, #5a4a35 0%, #1e1912 60%, #0a0a0a 90%)', image: img('variant-sandstone')},
  {name: 'Forest', color: 'Deep Green / Black', swatch: '#3c4a33', mood: 'radial-gradient(120% 90% at 50% 70%, #2a3a26 0%, #10170e 60%, #0a0a0a 90%)', image: img('variant-forest')},
  {name: 'Terra', color: 'Rust / Black', swatch: '#a4512a', mood: 'radial-gradient(120% 90% at 50% 70%, #5c2c17 0%, #1d0f09 60%, #0a0a0a 90%)', image: img('variant-terra')},
  {name: 'Alpine', color: 'White / Black', swatch: '#ecedee', mood: 'radial-gradient(120% 90% at 50% 25%, #6b7b88 0%, #1f262c 55%, #0a0a0a 90%)', image: img('variant-alpine')},
  {name: 'Shadow', color: 'Titanium / Black', swatch: '#2f3134', mood: 'radial-gradient(120% 90% at 50% 40%, #2b3240 0%, #10131a 60%, #0a0a0a 90%)', image: img('variant-shadow')},
  {name: 'Signal', color: 'Orange / Black', swatch: '#ff6a1a', mood: 'radial-gradient(120% 90% at 50% 85%, #7a2e0e 0%, #2a1208 50%, #0a0a0a 85%)', image: img('variant-signal')},
];
