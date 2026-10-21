# ATESO – Homepage (Shopify Hydrogen, 3D Scroll Experience)

## Rolle & Ziel
Du bist Senior Creative Developer + 3D/Motion Designer. Baue die **Homepage** für **ATESO** – eine Alpine-Performance-Bergsportmarke (Rebrand von MAKARA). Die Seite soll auf Award-Niveau (Awwwards/FWA) wirken: cinematic, extrem flüssige 3D-Scroll-Effekte, hochmoderne Animationen. Sie muss von Anfang an **shop-ready** sein (Shopify Storefront API), Shop-Seiten folgen später.

## Schritt 0 – Skills & Tools (Pflicht, vor dem ersten Code)
1. Liste alle verfügbaren Skills, Plugins und MCP-Server auf (`/skills`, `/plugins`, `/mcp`).
2. Nutze **alle relevanten** davon, mindestens:
   - `ui-ux-pro-max` (inkl. Brainstorm- und Feedback-Gates einhalten)
   - `frontend-design`
   - 21st.dev MCP für hochwertige React/Tailwind-Komponenten
   - **Higgsfield MCP** für alle visuellen Assets (siehe Schritt 2)
3. Starte im **Plan Mode**: Konzept, Section-Storyboard, Asset-Liste, Tech-Plan → mir zur Freigabe vorlegen, erst dann bauen.

## Brand
- Name: **ateso** (Wortmarke immer klein, kursiv/geometrisch)
- Signet: stilisierter Gipfel / Pfeil-„A“ (zwei Flächen, Spitze nach oben)
- Claims: „Built for Higher Ground“, „Alpine Performance“, „Protection · Movement · Purpose“
- Zielgruppe: 18–35, Alpinisten, die Ausrüstung wirklich brauchen
- Referenzbilder liegen in `/reference` (Logo-Board, Kollektion, Detail-Shots) – zuerst analysieren.

### Design-Tokens
| Token | Wert | Einsatz |
|---|---|---|
| `--black` | `#0A0A0A` | Haupt-Hintergrund |
| `--graphite` | `#1A1A1A` / `#2A2A2A` | Flächen, Karten |
| `--orange` | `#FF5A1F` | Signet, CTAs, Akzente, Zipper-Highlights |
| `--bone` | `#F2EFE8` | Wortmarke, Text |
| `--ice` | `#BFD9E6` → `#E8F4FA` | Gletscher, Licht, Reflexionen |

- Look: **Schwarz + Orange + Gletschereis**. Dunkel, kontrastreich, kaltes Licht, Eis-Transmission.
- Typo: geometrische Grotesk mit weitem Tracking für Labels (z. B. Space Grotesk / Inter Tight, UPPERCASE, letter-spacing 0.3em), große Display-Headlines.
- Details aus den Referenzen als Designsprache nutzen: Rubber-Patch, Wassertropfen auf Hardshell, YKK-Zipper mit orangem Pull, technische Labels.

## Tech-Stack
- **Shopify Hydrogen** (React Router v7) + TypeScript
- **Shopify Storefront API** für Produkte, Cart, Checkout (Shopify Checkout/Payments)
- Tailwind CSS v4
- **React Three Fiber + drei** (MeshTransmissionMaterial, Environment, useGLTF, ScrollControls falls passend)
- **GSAP + ScrollTrigger** (pinning, scrubbing), **Lenis** für Smooth Scroll
- `motion` (Framer Motion) für UI-Microinteractions
- Postprocessing: Bloom (dezent), Noise/Grain, Vignette
- **Deploy-agnostisch**: Primär Shopify Oxygen, zusätzlich lauffähig als Node-Server im **Docker-Container** für Self-Hosting (Dockerfile + `docker-compose.yml`). Checkout immer über Shopify.

## Hero – „Das Logo kommt aus dem Gletscher“ (Kernstück)
Scroll-gesteuerte 3D-Sequenz (gepinnt, ca. 300–400vh, scrub):
1. **Start:** Nacht/blaue Stunde, Kamera schwebt tief über einer Gletscherzunge, Nebel, Schneedrift-Partikel, kaltes Rim-Light.
2. **Scroll 0–30 %:** Kamera fährt über den Gletscher auf eine Eiswand zu. Im Eis schimmert schwach ein oranges Glühen.
3. **Scroll 30–60 %:** Eis bekommt Risse (Crack-Shader / fragmentierte Geometrie), Eisbrocken brechen ab, Licht dringt heraus.
4. **Scroll 60–85 %:** Das **orange Signet** (aus SVG extrudiert, leicht glänzend, Eis-Partikel perlen ab) steigt aus dem Gletscher empor und dreht in die Frontalansicht.
5. **Scroll 85–100 %:** Wortmarke **ateso** setzt sich Buchstabe für Buchstabe darunter zusammen, Claim „Built for Higher Ground“ blendet ein, Scroll-Hint verschwindet.
- Fallback (mobil / `prefers-reduced-motion` / schwache GPU): Higgsfield-Video derselben Sequenz, per Scroll gescrubbt (Frame-Sequence oder `<video>` currentTime).

## Homepage-Sections (Storyboard)
1. **Preloader:** Signet zeichnet sich als Linie, füllt sich orange, Fortschritt in %, Übergang direkt in den Hero.
2. **Hero:** Gletscher-Sequenz (s. o.).
3. **Manifest:** „Protection · Movement · Purpose“ – Split-Text-Reveals, große Typo, Parallax-Bergsilhouetten in Ebenen.
4. **Kollektion (Pinned Horizontal Scroll):** 3D-Jacke (GLB) im Zentrum, rotiert mit Scroll; Farbvarianten wechseln per Swatch mit Morph/Fade: Aurora, Summit, Ridgeline, Glacier, Sandstone, Forest, Terra, Alpine, Shadow, Signal. Hintergrund wechselt passend zur Variante (Fels, Eis, Wald, Sonnenuntergang).
5. **Tech-Details:** Kamera zoomt auf Hotspots der 3D-Jacke: 3-Lagen-Hardshell (Wassertropfen-Shader), YKK-Zipper, Hood-System, Unterarm-Ventilation, Cuffs, Logo-Patch. Je Hotspot Label im technischen Stil.
6. **Lookbook / Film:** Fullscreen-Higgsfield-Video (Models in Alpinszenen), Clip-Path-Reveal, darüber Statement-Typo.
7. **Featured Products:** Grid aus Storefront API (Live-Daten, Placeholder wenn leer), Hover: 3D-Tilt + Bildwechsel, Quick-Add-to-Cart vorbereitet.
8. **Newsletter-CTA:** Orange Akzent, Magnetic Button.
9. **Footer:** Großes ateso-Wordmark, Links, Social, Rechtliches (Impressum/Datenschutz als Platzhalter).

Global: Custom Cursor (dezent, magnetisch), Page Transitions vorbereitet, Grain-Overlay, sticky Header der beim Runterscrollen verschwindet, Cart-Icon mit Count (Storefront Cart).

## Schritt 2 – Assets mit Higgsfield
Erzeuge und organisiere in einem Higgsfield-Projekt „ATESO“ (Referenzbilder aus `/reference` als Brand-/Produkt-Referenz anlegen):
- **3D (Scene Builder 3D → GLB):** Gletscher-/Eiswand-Szene, Signet-Modell, Hardshell-Jacke (Basis für Farbvarianten). Optimieren: Draco/Meshopt, KTX2-Texturen, Ziel < 3 MB pro Modell.
- **Videos:** Hero-Fallback-Sequenz (Logo bricht aus Gletscher), Lookbook-Film, Loops für Kollektionshintergründe. 16:9 und 9:16.
- **Bilder:** Produkt-Shots je Farbvariante (konsistent zu den Referenzen), Lookbook mit Models in Alpinszenen, Macro-Detail-Shots.
- **Ads/Social:** Launch-Set (Feed 1:1/4:5, Story 9:16) im gleichen Look.
- Vor großen Batches: Credits-Quote zeigen und Freigabe holen.
- Alle Assets nach `/public/assets/{3d,video,img}` exportieren, Videos als WebM + MP4, Bilder AVIF/WebP.

## Qualität & Performance
- Lighthouse mobil: Performance ≥ 85, Accessibility ≥ 95
- 3D lazy-loaden (erst nach Preloader/Intersection), GPU-Tier-Erkennung (`detect-gpu`), adaptive DPR
- 60 fps auf aktuellem Mittelklasse-Laptop, keine Layout-Shifts
- `prefers-reduced-motion` vollständig respektieren
- Responsive: 375 px bis 2560 px
- SEO: Meta, OG-Images, JSON-LD (Organization, Product)
- Sprache: Deutsch, i18n-Struktur für EN vorbereiten
- Env-Variablen für Shopify (`PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`), `.env.example` anlegen

## Arbeitsweise
1. Plan Mode → Freigabe
2. Higgsfield-Assets (zuerst Hero-Szene + Signet)
3. Projekt-Setup Hydrogen + Design-Tokens + Lenis/GSAP
4. Hero-Sequenz bauen → mir Zwischenstand zeigen (Feedback-Gate)
5. Restliche Sections
6. Performance-Pass, Mobile-Fallbacks, Docker-Setup
7. README mit Setup, Deploy (Oxygen + Docker), Asset-Pipeline

Commits klein und sauber, nach jeder Section. Frag nach, wenn eine Entscheidung den Look stark beeinflusst.
