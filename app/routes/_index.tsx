import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {getHomeCatalog} from '~/lib/catalog';
import {de} from '~/i18n/de';
import {Preloader} from '~/components/home/Preloader';
import {Manifest} from '~/components/home/Manifest';
import {Collection} from '~/components/home/Collection';
import {TechDetails} from '~/components/home/TechDetails';
import {Lookbook} from '~/components/home/Lookbook';
import {FeaturedProducts} from '~/components/home/FeaturedProducts';
import {Newsletter} from '~/components/home/Newsletter';

const SITE_URL = 'https://ateso.store';

export const meta: Route.MetaFunction = ({data}) => {
  const {title, description} = de.meta;
  const image = `${SITE_URL}/assets/img/og.jpg`;
  const variants = data?.collection.variants ?? [];
  const prices = variants.map((v) => Number(v.price.amount));

  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: SITE_URL},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: 'ateso'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: SITE_URL},
    {property: 'og:image', content: image},
    {property: 'og:image:width', content: '1200'},
    {property: 'og:image:height', content: '630'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary_large_image'},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ateso',
        url: SITE_URL,
        logo: `${SITE_URL}/assets/img/og.jpg`,
        slogan: 'Built for Higher Ground',
      },
    },
    ...(variants.length
      ? [
          {
            'script:ld+json': {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: data!.collection.title,
              brand: {'@type': 'Brand', name: 'ateso'},
              image: variants.map((v) => `${SITE_URL}${v.image}.webp`),
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: variants[0].price.currencyCode,
                lowPrice: Math.min(...prices).toFixed(2),
                highPrice: Math.max(...prices).toFixed(2),
                offerCount: variants.length,
              },
            },
          },
        ]
      : []),
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  return getHomeCatalog(context);
}

export default function Homepage() {
  const {collection, featured} = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="sr-only">ateso – {de.hero.claim}</h1>
      <Preloader ready />
      <Manifest />
      <Collection collection={collection} />
      <TechDetails />
      <Lookbook />
      <FeaturedProducts products={featured} />
      <Newsletter />
    </>
  );
}
