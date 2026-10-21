import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {Aside} from '~/components/Aside';
import {isMockStorefront} from '~/lib/catalog';
import {getCart} from '~/lib/cart.server';
import {SmoothScroll} from '~/components/motion/SmoothScroll';
import {CartUIProvider} from '~/components/layout/CartContext';
import {CartDrawer} from '~/components/layout/CartDrawer';
import {SiteHeader} from '~/components/layout/SiteHeader';
import {SiteFooter} from '~/components/layout/SiteFooter';
import {Cursor} from '~/components/layout/Cursor';
import {RouteProgress} from '~/components/layout/RouteProgress';

export type RootLoader = typeof loader;

/**
 * Root-Daten nur nach Mutationen (z. B. Warenkorb) oder manueller
 * Revalidierung neu laden.
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({formMethod, currentUrl, nextUrl}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader({context}: Route.LoaderArgs) {
  const {storefront, env, cart} = context;
  const mock = isMockStorefront(env);

  return {
    mock,
    miniCart: await getCart(context),
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    // Analytics nur gegen einen echten Store
    analytics: mock
      ? null
      : {
          cart: cart.get(),
          shop: getShopAnalytics({storefront, publicStorefrontId: env.PUBLIC_STOREFRONT_ID}),
          consent: {
            checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
            storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
            withPrivacyBanner: false,
            country: storefront.i18n.country,
            language: storefront.i18n.language,
          },
        },
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  if (!data) return <Outlet />;

  const page = (
    <SmoothScroll>
      <CartUIProvider>
        {/* Aside.Provider bleibt für die (später auszubauenden) Shop-Routen des Skeletons */}
        <Aside.Provider>
          <a
            href="#inhalt"
            className="label sr-only z-[100] bg-orange px-4 py-3 text-black focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Zum Inhalt springen
          </a>
          <RouteProgress />
          <SiteHeader />
          <CartDrawer />
          <main id="inhalt">
            <Outlet />
          </main>
          <SiteFooter mock={data.mock} />
          <Cursor />
          <div className="grain" aria-hidden="true" />
        </Aside.Provider>
      </CartUIProvider>
    </SmoothScroll>
  );

  if (!data.analytics) return page;

  return (
    <Analytics.Provider cart={data.analytics.cart} shop={data.analytics.shop} consent={data.analytics.consent}>
      {page}
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unbekannter Fehler';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-black p-8 text-bone">
      <div className="text-center">
        <p className="label text-orange">Fehler {errorStatus}</p>
        <h1 className="display mt-4 text-5xl">Falscher Grat.</h1>
        {errorMessage ? <pre className="mt-6 text-sm whitespace-pre-wrap text-bone/60">{errorMessage}</pre> : null}
        <a href="/" className="label mt-8 inline-block border-b border-orange pb-1">
          Zur Startseite
        </a>
      </div>
    </div>
  );
}
