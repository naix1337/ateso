# ateso – Storefront (Shopify Hydrogen)

Homepage der Alpine-Performance-Marke **ateso** mit scroll-gesteuerten Animationen.
Shop-ready über die Shopify Storefront API,
läuft lokal komplett mit Testdaten.

- Brief: [`ateso-claude-code-prompt.md`](./ateso-claude-code-prompt.md)
- Design & Plan: [`docs/superpowers/specs/2026-10-21-ateso-homepage-design.md`](./docs/superpowers/specs/2026-10-21-ateso-homepage-design.md)

## Stack

Hydrogen (React Router 7) · TypeScript · Tailwind CSS v4 · GSAP ScrollTrigger · Lenis · motion

## Schnellstart (lokal, Testdaten)

Voraussetzung: Node 22 oder 24.

```bash
npm install
cp .env.example .env        # USE_MOCK_STOREFRONT="true" ist voreingestellt
npm run dev                 # http://localhost:3000 (oder nächster freier Port)
```

## Mock-Modus vs. echter Store

`USE_MOCK_STOREFRONT="true"` (oder kein `PUBLIC_STOREFRONT_API_TOKEN`) →
Startseite und Warenkorb nutzen `app/lib/mock/catalog.ts` (1 Jacke × 10 Farben,
Preise/IDs erfunden). Der Warenkorb liegt in der Session; Checkout ist deaktiviert.

Für den echten Store in `.env`:

```bash
USE_MOCK_STOREFRONT="false"
PUBLIC_STORE_DOMAIN="xxx.myshopify.com"   # nicht ateso.store
PUBLIC_STOREFRONT_API_TOKEN="…"
PUBLIC_STOREFRONT_ID="…"
PRIVATE_STOREFRONT_API_TOKEN="…"
PUBLIC_CHECKOUT_DOMAIN="…"
```

Erwartet wird ein Produkt mit Handle `technical-shell-jacket`, dessen Varianten eine
Option mit den Werten `Aurora`, `Summit`, … `Signal` haben (siehe `VARIANT_META` in
`app/lib/catalog-data.ts`). Fehlende Varianten werden angezeigt, sind aber nicht kaufbar.
Checkout läuft immer über Shopify.

Alternativ Variablen ziehen: `npx shopify hydrogen link` und `npx shopify hydrogen env pull`.

## Struktur

```
app/
  components/
    brand/        Signet + Wortmarke (SVG-Nachbau, logo-geometry.ts)
    home/         Preloader, Hero, Manifest, Shop + ProductDialog, Newsletter
    layout/       Header, Footer, CartDrawer, Cursor, RouteProgress, LegalPage
    motion/       Lenis-SmoothScroll, reduced motion, magnetische Buttons
  i18n/           de.ts (+ Struktur für en.ts)
  lib/            catalog (Mock/Live), cart.server, gsap-Helfer, redirect-Schutz
  routes/         _index, api.cart, impressum, datenschutz (+ Hydrogen-Skeleton-Routen)
scripts/build-assets.mjs   Asset-Pipeline
server/node-server.mjs     Node-Server für Self-Hosting
```

Die übrigen Routen (`products`, `collections`, `cart`, `account`, …) stammen aus dem
Hydrogen-Skeleton und sind die Basis für die späteren Shop-Seiten.

## Asset-Pipeline

```bash
npm run assets
```

Schneidet aus den Referenz-Boards in `referenzen/` die Varianten-, Detail- und
Lookbook-Bilder aus und schreibt AVIF + WebP nach
`public/assets/img/` und erzeugt das OG-Image. Die Ergebnisse sind eingecheckt.

Austausch gegen echte Fotos: gleiche Dateinamen in `public/assets/img/` ablegen
(`variant-<name>.avif/.webp`, `detail-<id>.avif/.webp`), Crop-Liste im Skript anpassen.

Logo: `app/components/brand/logo-geometry.ts` ist ein **Nachbau** nach dem Logo-Board.
Sobald Original-Vektoren vorliegen, die Pfade dort ersetzen – Header, Preloader,
Footer und OG-Image ziehen automatisch nach.

Drop-Seite: `/drop` zählt bis `DROP_DATE` in `app/lib/drop.ts` herunter (ohne Header/Footer).
## Deployment

### Shopify Oxygen (primär)

```bash
npx shopify hydrogen link     # einmalig mit dem Store verbinden
npx shopify hydrogen deploy
```

Env-Variablen im Shopify-Admin (Hydrogen → Storefront → Environment) setzen.

### Docker / Node (Self-Hosting)

```bash
SESSION_SECRET="…" docker compose up --build    # http://localhost:3000
```

Ohne Docker: `npm run build && npm run start:node`.

Der Node-Server (`server/node-server.mjs`) führt den Worker-Build unter Node aus,
liefert `dist/client` statisch (mit Brotli/Gzip) aus. Unterschiede zu Oxygen:

- kein Edge-Cache (`caches` ist ein No-op) – Storefront-Antworten werden nicht gecacht
- `waitUntil`-Arbeit ohne Shutdown-Garantie
- keine Oxygen-Header (z. B. Buyer-IP für Analytics)
- `PUBLIC_ORIGIN=https://ateso.store` setzen; `TRUST_PROXY=true` nur hinter eigenem Proxy

> Das Docker-Image wurde in der Entwicklungsumgebung nicht gebaut (Docker war nicht
> installiert). Der Node-Server selbst ist mit dem Production-Build getestet.

## Qualität

- `prefers-reduced-motion`: kein Lenis, keine Scroll-Animationen, kein Cursor
- Sections unterhalb des Folds initialisieren ihre Animationen in Idle-Zeit
- Lighthouse-Werte nach Entfernen des Gletscher-Heros noch nicht neu gemessen

## Offene Punkte

- Original-Logo-Vektoren statt Nachbau
- Höher aufgelöste Produktfotos (aktuell Ausschnitte der Referenz-Boards, ca. 260 px breit)
- Neuer Einstieg/Hero (der Gletscher-Hero wurde entfernt), Lookbook-Film
- Newsletter-Anbindung (Shopify Customer Marketing oder Klaviyo)
- Impressum/Datenschutz mit geprüften Texten
- EN-Übersetzung (`app/i18n/en.ts`) und Locale-Routing
- Shop-Seiten im ateso-Design (PDP, PLP, Cart-Page)
"# ateso" 
