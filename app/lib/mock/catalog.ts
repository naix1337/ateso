/**
 * Testdaten (Mock-Modus). Preise und IDs sind erfunden.
 */
import {VARIANT_META, type CollectionData} from '../catalog-data';

const PRICE = {amount: '449.00', currencyCode: 'EUR'};

export const mockVariantId = (name: string) =>
  `gid://shopify/ProductVariant/mock-${name.toLowerCase()}`;

export const MOCK_COLLECTION: CollectionData = {
  title: 'Technical Shell Jacket',
  handle: 'technical-shell-jacket',
  variants: VARIANT_META.map((meta) => ({
    ...meta,
    merchandiseId: mockVariantId(meta.name),
    available: meta.name !== 'Sandstone',
    price: PRICE,
  })),
};

/** Alle kaufbaren Mock-Varianten, für den Mock-Warenkorb. */
export const MOCK_MERCHANDISE = new Map(
  MOCK_COLLECTION.variants.map((v) => [
    v.merchandiseId!,
    {
      title: MOCK_COLLECTION.title,
      variantTitle: v.name,
      image: v.image,
      price: v.price,
      available: v.available,
    },
  ]),
);
