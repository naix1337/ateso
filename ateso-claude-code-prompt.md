# ATESO – Homepage (Shopify Hydrogen, 3D Scroll Experience)

## Rolle & Ziel
Du bist Senior Creative Developer + 3D/Motion Designer. Baue die **Homepage** für **ATESO** – eine Alpine-Performance-Bergsportmarke (Rebrand von MAKARA). Die Seite soll auf Award-Niveau (Awwwards/FWA) wirken: cinematic, extrem flüssige Scroll-Effekte, hochmoderne Animationen. Sie muss von Anfang an **shop-ready** sein (Shopify Storefront API), Shop-Seiten (PLP, PDP, Cart-Page) folgen später – **nicht Teil dieses Auftrags**.

## Offene Rahmendaten (vor Start ausfüllen)
- **Shopify-Store:** Live-Domain `ateso.store`; `.myshopify.com`-Domain + Storefront-Token folgen – ohne Token läuft alles im **Mock-Modus** (lokale JSON-Fixtures im Storefront-API-Format, per Env-Flag umschaltbar).
- **Higgsfield-Budget:** aktuell 189 Credits (Starter-Plan). Jede Generierung einzeln mit Credit-Quote freigeben lassen.
- **Logo-Dateien:** `referenzen/logo/ateso-signet.svg`, `referenzen/logo/ateso-wordmark.svg` (Vektor-Originale, **nicht nachbauen**). Falls nicht vorhanden: stoppen und nachfragen, bevor das Signet nachgezeichnet wird.

## Schritt 0 – Setup & Tools (Pflicht, vor dem ersten Code)
1. Prüfe, welche Skills, Plugins und MCP-Server tatsächlich verfügbar und **verbunden** sind. Melde fehlende/getrennte sofort, statt sie stillschweigend zu überspringen.
2. Nutze die relevanten davon, mindestens:
   - `superpowers:brainstorming` (Konzeptphase) und `frontend-design` (visuelle Richtung)
   - `ui-ux-pro-max`, **falls installiert** (inkl. Brainstorm- und Feedback-Gates)
   - 21st.dev MCP (`magic`) für React/Tailwind-Komponenten, **falls verbunden** – sonst selbst bauen
   - **Higgsfield MCP** für alle generierten visuellen Assets (siehe Schritt 2)
3. `git init` im Projektordner, `.gitignore` (node_modules, .env, große Roh-Assets).

## Schritt 1 – Plan & Freigabe
Starte im **Plan Mode** und lege vor, bevor irgendetwas gebaut oder generiert wird:
- Konzept + visuelle Richtung (2–3 Moodboard-Sätze, Referenz-Sites)
- Section-Storyboard mit Scroll-Längen
- Asset-Liste mit **Credit-Schätzung** pro Asset
- Tech-Plan inkl. Mobile-/Fallback-Strategie
→ Erst nach meiner Freigabe weiter.

## Brand
- Name: **ateso** (Wortmarke immer klein, breite geometrische Kursive, siehe Logo-Board)
- Signet: stilisierter Gipfel / Pfeil-„A“ (zwei Flächen mit diagonalem Schnitt, Spitze nach oben)
- Claims: „Built for Higher Ground“, „Alpine Performance“, „Protection · Movement · Purpose“, „Any Condition Further“
- Zielgruppe: 18–35, Alpinisten, die Ausrüstung wirklich brauchen
- Referenzen in `referenzen/` – zuerst analysieren:
  - `logo-board.jpeg` – Signet, Wortmarke, Kombination, einfarbige Varianten, Icon-Anwendungen
  - `kollektion-10-varianten.jpeg` – **maßgebliche** Variantenübersicht + Detail-Shots
  - `kollektion-5-varianten.jpeg` – ältere Version, nur für Stimmung/Details (bei Widerspruch gilt die 10er-Übersicht)

### Design-Tokens
| Token | Wert | Einsatz |
|---|---|---|
| `--black` | `#0A0A0A` | Haupt-Hintergrund |
| `--graphite-1` / `--graphite-2` | `#1A1A1A` / `#2A2A2A` | Flächen, Karten |
| `--orange` | `#FF5A1F` | Signet, CTAs, Akzente, Zipper-Highlights |
| `--bone` | `#F2EFE8` | Wortmarke, Text |
| `--ice-1` / `--ice-2` | `#BFD9E6` / `#E8F4FA` | Gletscher, Licht, Reflexionen |

- Look: **Schwarz + Orange + Gletschereis**. Dunkel, kontrastreich, kaltes Licht, Eis-Transmission. Orange sparsam – nur Signet, CTAs, Zipper.
- Typo: Labels in geometrischer Grotesk (Space Grotesk oder Inter Tight), UPPERCASE, letter-spacing 0.3em; große Display-Headlines. Kontraste WCAG AA.
- Designsprache aus den Referenzen: Rubber-Patch (matt, Ton-in-Ton), Wassertropfen auf Hardshell, YKK-Zipper mit orangem Pull, technische Labels mit dünner oranger Linie.

### Kollektion (Varianten)
| Name | Farbe | Hintergrund-Stimmung |
|---|---|---|
| Aurora | All Black | dunkler Fels |
| Summit | Black / Orange | Abendglühen am Grat |
| Ridgeline | Graphite / Black | Nebel, Grauwolken |
| Glacier | Ice Blue / Black | Gletscher, Eis |
| Sandstone | Sand / Black | warmer Fels |
| Forest | Deep Green / Black | Bergwald |
| Terra | Rust / Black | rötlicher Fels |
| Alpine | White / Black | Schneegipfel |
| Shadow | Titanium / Black | Dämmerung |
| Signal | Orange / Black | Sonnenuntergang |

## Tech-Stack
- **Shopify Hydrogen** (React Router v7) + TypeScript (strict)
- **Shopify Storefront API** für Produkte und Cart; Checkout immer über Shopify Checkout
- Tailwind CSS v4
- **React Three Fiber + drei** (MeshTransmissionMaterial, Environment, useGLTF) – **nur Desktop / starke GPU**
- **GSAP + ScrollTrigger** (pinning, scrubbing), **Lenis** für Smooth Scroll (eine gemeinsame RAF-Loop)
- `motion` für UI-Microinteractions
- Postprocessing: Bloom (dezent), Noise/Grain, Vignette
- **Deployment:**
  - Primär **Shopify Oxygen** (Standard-Hydrogen-Build).
  - Zusätzlich **Docker/Node**: Hydrogen läuft standardmäßig als Worker – dafür einen eigenen Node-Server-Entry (Express bzw. `@react-router/node` + Mini-Oxygen-kompatible Env/Cache-Abstraktion) bauen. Erst als **letzten Schritt**, und im README dokumentieren, welche Oxygen-Features unter Docker fehlen.

## Hero – „Das Logo kommt aus dem Gletscher“ (Kernstück)
Scroll-gesteuerte Sequenz (gepinnt, ca. 300–400vh, scrub):
1. **Start:** blaue Stunde, Kamera schwebt tief über einer Gletscherzunge, Nebel, Schneedrift-Partikel, kaltes Rim-Light.
2. **0–30 %:** Kamera fährt über den Gletscher auf eine Eiswand zu. Im Eis schimmert schwach ein oranges Glühen.
3. **30–60 %:** Eis bekommt Risse (Crack-Shader oder vorfragmentierte Geometrie), Eisbrocken brechen ab, Licht dringt heraus.
4. **60–85 %:** Das **orange Signet** (aus `ateso-signet.svg` extrudiert, leicht glänzend, Eis-Partikel perlen ab) steigt empor und dreht in die Frontalansicht.
5. **85–100 %:** Wortmarke **ateso** (aus `ateso-wordmark.svg`) baut sich Buchstabe für Buchstabe darunter auf, Claim „Built for Higher Ground“ blendet ein, Scroll-Hint verschwindet.

**Zwei Render-Pfade (Pflicht):**
- **Desktop + GPU-Tier ≥ 2:** Echtzeit-3D (R3F). Gletscher-Szene darf prozedural/stilisiert sein (Displacement + Transmission + Nebel) – kein fotoreales GLB nötig.
- **Mobil / `prefers-reduced-motion` / schwache GPU:** **Standard-Pfad** = Higgsfield-Video derselben Sequenz, per Scroll gescrubbt (Frame-Sequence als AVIF/WebP-Sprite oder `<video>`-currentTime mit Keyframe-dichtem Encoding). Bei `prefers-reduced-motion`: statisches Endframe + sanftes Fade.

## Homepage-Sections (Storyboard)
1. **Preloader:** Signet zeichnet sich als Linie, füllt sich orange, Fortschritt in %, Übergang direkt in den Hero. Max. 2–3 s, danach weiter nachladen.
2. **Hero:** Gletscher-Sequenz (s. o.).
3. **Manifest:** „Protection · Movement · Purpose“ – Split-Text-Reveals, große Typo, Parallax-Bergsilhouetten in Ebenen.
4. **Kollektion (Pinned Horizontal Scroll):** Jacke im Zentrum, rotiert mit Scroll; Swatches für alle 10 Varianten mit Morph/Fade; Hintergrund wechselt laut Varianten-Tabelle.
   - **Umsetzung:** Pro Variante eine **360°-Turntable-Bildsequenz** (z. B. 36–48 Frames, aus Higgsfield-Video extrahiert), per Scroll gescrubbt. Kein Echtzeit-GLB der Jacke – generierte Kleidungs-Meshes sind für Nahaufnahmen nicht sauber genug.
   - Alternative, falls ich später ein echtes Jacken-Modell (CLO3D/Marvelous) liefere: Komponente so kapseln, dass ein GLB-Renderer austauschbar ist.
5. **Tech-Details:** Zoom auf Hotspots der Jacke: 3-Lagen-Hardshell (Wassertropfen-Detail), YKK-Zipper, Hood-System, Unterarm-Ventilation, Cuffs, Logo-Patch. Umsetzung mit Macro-Shots + Ken-Burns/Parallax-Zoom und technischen Labels (Stil wie Detailleiste im Referenzboard). Optional dezenter WebGL-Wassertropfen-Shader über dem Hardshell-Bild.
6. **Lookbook / Film:** Fullscreen-Higgsfield-Video (Models in Alpinszenen), Clip-Path-Reveal, darüber Statement-Typo „Any Condition Further“.
7. **Featured Products:** Grid aus Storefront API (Mock-Fixtures solange kein Store), Hover: 3D-Tilt + Bildwechsel, Quick-Add-to-Cart funktionsfähig gegen Storefront-Cart.
8. **Newsletter-CTA:** Orange Akzent, Magnetic Button. Formular nur UI + Validierung, Ziel-Endpoint als TODO (Shopify Customer-Marketing oder Klaviyo – entscheide ich später).
9. **Footer:** Großes ateso-Wordmark, Links, Social, Rechtliches (Impressum/Datenschutz als Platzhalter-Routen).

Global: Custom Cursor (dezent, magnetisch, nur bei `pointer: fine`), Page Transitions vorbereitet, Grain-Overlay, sticky Header (verschwindet beim Runterscrollen, erscheint beim Hochscrollen), Cart-Icon mit Count (Storefront Cart).

## Schritt 2 – Assets mit Higgsfield
Lege ein Higgsfield-Projekt „ATESO“ an und hinterlege die Referenzbilder als Brand-/Produkt-Referenz. **Vor jedem Batch Credits-Quote zeigen und Freigabe holen.** Reihenfolge nach Priorität:

**P1 (Hero & Kollektion – blockierend):**
- Hero-Fallback-Video: Logo bricht aus Gletscher (16:9 + 9:16). Signet als Referenzbild mitgeben, Form muss exakt stimmen.
- Gletscher-/Eis-Texturen bzw. HDRI-Stimmung für die Echtzeit-Szene.
- Turntable-Videos der Jacke je Variante (konsistent zu `kollektion-10-varianten.jpeg`). Erst **eine** Variante als Test → Freigabe → Rest.

**P2:**
- Macro-Detail-Shots (Patch, Tropfen, Zipper, Hood, Vent, Cuffs).
- Lookbook-Film + Stills mit Models in Alpinszenen (16:9 + 9:16).
- Hintergrund-Loops für die Kollektion (kurz, nahtlos, < 2 MB je Loop).

**Nicht in diesem Auftrag:** Ads/Social-Launch-Set (separates Projekt).

**Export:** nach `public/assets/{video,img,seq}`; Videos WebM (AV1/VP9) + MP4 (H.264), Bilder AVIF + WebP. Rohdateien nicht ins Repo – Pfad in `assets/README.md` dokumentieren. Optional generiertes 3D (Signet) mit Draco/Meshopt + KTX2, < 3 MB.

## Qualität & Performance
- Lighthouse **mobil** (Video-Pfad): Performance ≥ 85, Accessibility ≥ 95. Desktop-3D-Pfad: ≥ 70 akzeptabel, 60 fps auf aktuellem Mittelklasse-Laptop.
- 3D-Bundle per dynamic import, erst nach Preloader/Intersection; GPU-Tier-Erkennung (`detect-gpu`), adaptive DPR, Szene pausieren wenn außer Sicht.
- Keine Layout-Shifts (CLS < 0.05); Videos mit Poster + feste Aspect-Ratio.
- `prefers-reduced-motion` vollständig respektieren (kein Scrubbing, kein Lenis, kein Cursor-Effekt).
- Tastatur bedienbar, sichtbare Focus-States, Alt-Texte, Videos ohne Ton oder mit Untertitel/Mute.
- Responsive: 375 px bis 2560 px.
- SEO: Meta, OG-Images, JSON-LD (Organization, Product).
- Sprache: Deutsch, i18n-Struktur für EN vorbereiten (Strings nicht hardcoden).
- Env: `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, `SESSION_SECRET`, `USE_MOCK_STOREFRONT` → `.env.example` anlegen.

## Arbeitsweise
1. Schritt 0 (Setup) + Schritt 1 (Plan) → Freigabe
2. Higgsfield P1-Assets (zuerst Hero-Video + eine Jacken-Variante)
3. Projekt-Setup Hydrogen + Design-Tokens + Lenis/GSAP + Mock-Storefront
4. Hero (beide Render-Pfade) bauen → **Zwischenstand zeigen (Feedback-Gate)**
5. Kollektion + Tech-Details → **Feedback-Gate**
6. Restliche Sections + P2-Assets
7. Performance-/A11y-Pass, Mobile-Fallbacks prüfen (echte Messwerte berichten)
8. Docker/Node-Setup
9. README: Setup, Mock-Modus, Deploy (Oxygen + Docker), Asset-Pipeline

Commits klein und sauber, mindestens nach jeder Section. Frag nach, wenn eine Entscheidung den Look stark beeinflusst – und melde ehrlich, wenn ein Ziel (z. B. Lighthouse) nicht erreicht wird.
