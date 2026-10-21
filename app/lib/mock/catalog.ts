/**
 * Testdaten (Mock-Modus). Preise und IDs sind erfunden.
 */
import {
  VARIANT_META,
  type CollectionData,
  type ProductCard,
} from '../catalog-data';

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

const featuredPicks: Array<[variant: string, hover: string]> = [
  ['Summit', 'detail-zipper'],
  ['Glacier', 'detail-fabric'],
  ['Signal', 'detail-hood'],
  ['Alpine', 'detail-cuffs'],
];

export const MOCK_FEATURED: ProductCard[] = featuredPicks.map(
  ([name, hover]) => {
    const variant = MOCK_COLLECTION.variants.find((v) => v.name === name)!;
    return {
      key: variant.merchandiseId!,
      handle: MOCK_COLLECTION.handle,
      title: `${MOCK_COLLECTION.title} – ${variant.name}`,
      subtitle: variant.color,
      price: variant.price,
      image: variant.image,
      hoverImage: `/assets/img/${hover}`,
      merchandiseId: variant.merchandiseId,
      available: variant.available,
    };
  },
);

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
