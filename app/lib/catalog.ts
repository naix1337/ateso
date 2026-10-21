/**
 * Daten für den Shop der Startseite: die Jacke mit allen Farbvarianten.
 * Im Mock-Modus aus app/lib/mock/catalog.ts, sonst über die Storefront API –
 * beide Wege liefern dieselben Typen, die Komponenten merken keinen Unterschied.
 */
import type {RouterContextProvider} from 'react-router';
import {MOCK_COLLECTION} from './mock/catalog';
import {VARIANT_META, type CollectionData, type Money} from './catalog-data';

export * from './catalog-data';

export const COLLECTION_HANDLE = 'technical-shell-jacket';

export function isMockStorefront(env: Env) {
  return env.USE_MOCK_STOREFRONT === 'true' || !env.PUBLIC_STOREFRONT_API_TOKEN;
}

export async function getHomeCatalog(
  context: Readonly<RouterContextProvider>,
): Promise<{collection: CollectionData}> {
  if (isMockStorefront(context.env)) {
    return {collection: MOCK_COLLECTION};
  }

  const {product} = await context.storefront.query(HOME_CATALOG_QUERY, {
    variables: {handle: COLLECTION_HANDLE},
    cache: context.storefront.CacheShort(),
  });

  return {
    collection: mapCollection(product ?? null),
  };
}

type LiveProduct = {
  title: string;
  handle: string;
  variants: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      price: Money;
      selectedOptions: Array<{name: string; value: string}>;
    }>;
  };
} | null;

/** Varianten des echten Produkts per Optionswert (Name) den Gestaltungsdaten zuordnen. */
function mapCollection(product: LiveProduct): CollectionData {
  if (!product) {
    return {
      ...MOCK_COLLECTION,
      variants: MOCK_COLLECTION.variants.map((v) => ({
        ...v,
        merchandiseId: null,
        available: false,
      })),
    };
  }
  return {
    title: product.title,
    handle: product.handle,
    variants: VARIANT_META.map((meta) => {
      const live = product.variants.nodes.find((node) =>
        node.selectedOptions.some(
          (o) => o.value.toLowerCase() === meta.name.toLowerCase(),
        ),
      );
      return {
        ...meta,
        merchandiseId: live?.id ?? null,
        available: live?.availableForSale ?? false,
        price: live?.price ?? MOCK_COLLECTION.variants[0].price,
      };
    }),
  };
}

const HOME_CATALOG_QUERY = `#graphql
  query HomeCatalog($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      title
      handle
      variants(first: 50) {
        nodes {
          id
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
  }
` as const;
