# ATESO Homepage – Design & Plan (Schritt 1)

Stand: 2026-10-21 · Grundlage: `ateso-claude-code-prompt.md` · Status: **zur Freigabe**

## 1. Rahmen & Entscheidungen

| Thema | Entscheidung | Quelle |
|---|---|---|
| Kollektions-Bilder | Vorhandene Referenzbilder (`kollektion-10-varianten.jpeg`) als Variantenbilder ausschneiden | Nutzer |
| Logo | Signet + Wortmarke als SVG nachbauen (Vorlage: `logo-board.jpeg`) | Nutzer |
| Shop | Lokal mit Testdaten (Mock-Storefront), kein Shopify-Zugang nötig | Nutzer |
| Live-Domain | `ateso.store` (nur in SEO/Meta/JSON-LD) | Nutzer |
| Higgsfield | 189 Credits → **nur Hero-Fallback-Video**, jede Generierung mit Quote + Freigabe | Budget |
| Jacke | Kein Echtzeit-3D-Modell; Bilder mit Parallax/Tilt, Renderer austauschbar gekapselt | Brief v2 |
| Docker | Dockerfile + Compose werden geschrieben, aber **hier nicht testbar** (Docker nicht installiert) | Umgebung |

**Ehrliche Einschränkung:** Die Varianten-Kacheln im Referenzbild sind nur ca. 260 × 330 px, die Detail-Shots ca. 175 × 160 px. Für eine Vollbild-Kollektion ist das zu klein. Plan: im Layout nicht größer als ca. 2× Originalgröße zeigen und später austauschen. Optional (mit Quote): einzelne Kacheln per Higgsfield-Upscale hochrechnen.

## 2. Konzept & visuelle Richtung

„Kälte, Dunkelheit, ein orangefarbenes Signal.“ Die Seite fühlt sich an wie ein Aufstieg in der blauen Stunde: fast schwarz, kaltes Eislicht von der Seite, Orange nur dort, wo es zählt (Signet, CTA, Zipper). Typografie groß, ruhig, technisch – Labels wie auf Ausrüstung gedruckt.

Referenz-Gefühl: Arc'teryx-Kampagnen (Ruhe, Produktfokus), Awwwards-Scroll-Sites mit gepinntem WebGL-Hero (Lusion, Active Theory), technische Spec-Labels wie bei Outdoor-Hardware.

## 3. Section-Storyboard

| # | Section | Scroll-Länge | Umsetzung |
|---|---|---|---|
| 0 | Preloader | – | SVG-Signet als Linie (stroke-dashoffset) → orange Füllung, % aus echtem Asset-Laden, max. 3 s |
| 1 | Hero „Logo aus dem Gletscher“ | 350vh gepinnt | Desktop: R3F-Szene; mobil/reduced: Video-Scrub bzw. statisches Endframe (s. 4.2) |
| 2 | Manifest | 150vh | „Protection · Movement · Purpose“ als Split-Text-Reveals, 3–4 SVG-Bergsilhouetten-Ebenen mit Parallax |
| 3 | Kollektion | ~400vh gepinnt, horizontal | 10 Varianten, Jacke zentral mit Tilt/Parallax, Swatch-Leiste, Hintergrundfarbe/-verlauf je Variante (Tabelle im Brief) |
| 4 | Tech-Details | 300vh gepinnt | 6 Hotspots (Hardshell, YKK-Zipper, Hood, Ventilation, Cuffs, Patch) – Macro-Bild-Crops mit Zoom + technischem Label |
| 5 | Lookbook | 100vh | Clip-Path-Reveal auf Kampagnenbild (Header der Referenz-Boards), Typo „Any Condition Further“; Video-Slot vorbereitet |
| 6 | Featured Products | normal | 4–8 Produkte aus Mock-Storefront, Hover-Tilt + Bildwechsel, Quick-Add |
| 7 | Newsletter | normal | Magnetic Button, Validierung, Submit als TODO |
| 8 | Footer | normal | großes Wordmark, Links, Social, Impressum/Datenschutz-Platzhalter |

Global: Sticky Header (hide on down / show on up), Cart-Drawer mit Count, Custom Cursor (nur `pointer: fine`), Grain-Overlay, Lenis.

## 4. Tech-Plan

### 4.1 Projekt
- `npm create @shopify/hydrogen` (Skeleton, TypeScript, Tailwind v4) direkt im Repo-Root, damit Docker/README einfach bleiben.
- Abhängigkeiten: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`, `lenis`, `motion`, `detect-gpu`.
- Design-Tokens als CSS-Variablen + Tailwind-`@theme`.
- i18n: Strings in `app/i18n/de.ts`, Struktur für `en.ts` vorbereitet.

### 4.2 Hero – zwei Render-Pfade
- **Echtzeit (Desktop, GPU-Tier ≥ 2):** prozedurale Gletscher-Ebene (Displacement-Noise), Eiswand aus vorfragmentierten Voronoi-ähnlichen Stücken (im Code generiert), MeshTransmissionMaterial, Nebel, Instanced-Schneepartikel, oranges PointLight hinter dem Eis. Signet aus dem nachgebauten SVG extrudiert. Kamera-Pfad + Fragment-Animation über eine GSAP-Timeline, an ScrollTrigger gescrubbt. Postprocessing: Bloom, Noise, Vignette.
- **Fallback (mobil, schwache GPU):** Higgsfield-Video (9:16 + 16:9) per Scroll gescrubbt – **nur nach Credit-Freigabe**. Ohne Video: 2.5D-Fallback (Gradient-Himmel, Eis-Bild-Ebenen, Signet-SVG steigt auf) – kostet keine Credits.
- **`prefers-reduced-motion`:** statische Endkomposition (Signet + Wortmarke + Claim), kein Pinning.

### 4.3 Mock-Storefront
- `USE_MOCK_STOREFRONT=true` (Default lokal): eigener Adapter mit gleicher Signatur wie `storefront.query()`; Antworten aus `app/mocks/*.json` im Storefront-API-Format (10 Jacken-Varianten als ein Produkt mit Varianten + 3–5 Zusatzprodukte als Platzhalter).
- Cart im Mock-Modus: Cookie/Session-basiert, gleiche Komponenten wie später echt.
- Umschalten auf echten Store = nur Env-Variablen setzen.

### 4.4 Logo-Nachbau
- Signet: zwei Flächen (großes Dreieck mit diagonalem Schnitt + Unterteil), Pfade nach dem Logo-Board gezeichnet.
- Wortmarke „ateso“: eigene SVG-Pfade, breite geometrische Kursive wie im Board.
- **Feedback-Gate:** Vergleich nebeneinander mit dem Board, bevor es überall eingebaut wird.

### 4.5 Performance & Qualität
- 3D per dynamic import nach Preloader, `detect-gpu`, adaptive DPR, Render-Pause außerhalb des Viewports.
- Ziele: Lighthouse mobil Perf ≥ 85 / A11y ≥ 95 (Fallback-Pfad), Desktop-3D ≥ 70 bei 60 fps, CLS < 0.05.
- SEO: Meta, OG-Image, JSON-LD (Organization `ateso.store`, Product aus Mocks).

## 5. Asset-Liste & Credits

| Asset | Quelle | Credits |
|---|---|---|
| 10 Varianten-Bilder | Crop aus `kollektion-10-varianten.jpeg` | 0 |
| 6–7 Detail-Shots | Crop aus beiden Kollektions-Boards (größere Version jeweils) | 0 |
| Kampagnen-/Lookbook-Bild | Header aus `kollektion-5-varianten.jpeg` | 0 |
| Signet + Wortmarke | SVG-Nachbau | 0 |
| Bergsilhouetten, Eis-Texturen | prozedural / SVG im Code | 0 |
| Hero-Fallback-Video 16:9 (+ 9:16) | Higgsfield | **Quote vor Generierung** |
| Optional: Upscale Varianten-Kacheln | Higgsfield | Quote, nur bei Bedarf |

Bilder werden als AVIF + WebP nach `public/assets/img/` exportiert.

## 6. Ablauf & Feedback-Gates

1. Hydrogen-Setup, Tokens, Lenis/GSAP, Mock-Storefront, Logo-SVGs → **Gate: Logo-Vergleich**
2. Hero Echtzeit-Pfad + reduced-motion-Pfad → **Gate: Hero-Zwischenstand**
3. Hero-Fallback-Video (Quote → Freigabe → Generierung) oder 2.5D-Fallback
4. Kollektion + Tech-Details → **Gate**
5. Manifest, Lookbook, Featured, Newsletter, Footer, Header/Cart
6. Performance-/A11y-Pass mit echten Lighthouse-Werten
7. Dockerfile/Compose (ungetestet markiert), README

Commits nach jeder Section.

## 7. Nicht Teil dieses Auftrags
Shop-Seiten (PLP/PDP/Cart-Page), Ads/Social-Set, echter Newsletter-Versand, echtes Jacken-3D-Modell, Live-Deployment.

## 8. Meine Entscheidungen (bitte prüfen)
- Hydrogen direkt im Repo-Root.
- Hero-Eiswand prozedural statt aus Higgsfield-3D (spart Credits, besser kontrollierbar).
- Ohne Video-Freigabe gibt es einen 2.5D-Fallback statt eines leeren Mobile-Heros.
- Lookbook nutzt vorerst ein Standbild; Video-Slot bleibt vorbereitet.
- Mock-Produkte: 1 Jacke mit 10 Farbvarianten + einige Platzhalter-Produkte (Namen/Preise erfunden, klar als Mock markiert).
