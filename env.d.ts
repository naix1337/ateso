/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    /** "true" → Startseite und Warenkorb laufen mit lokalen Testdaten (app/lib/mock). */
    USE_MOCK_STOREFRONT?: string;
  }
}
