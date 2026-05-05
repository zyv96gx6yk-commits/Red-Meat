# Red Meat Bograshov · Website

A high-performance, bilingual (Hebrew RTL / English LTR) static website for **רד מיט בוגרשוב — Red Meat Bograshov**, the South-American sandwich shop at **9 Bograshov St, Tel Aviv-Yafo** (☎ 03-508-7758).

Built as plain HTML / CSS / vanilla JS — no build step, no framework, no tracker — so it ships in a few KB and deploys anywhere static hosting is supported (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, etc.).

## Features

- **Bilingual & RTL/LTR** — switch between Hebrew (default) and English with one click; persists per visitor. URL `?lang=en` is honored.
- **Accessibility (IS 5568 / WCAG 2.1 AA)** — full keyboard nav, ARIA roles, focus rings, skip link, dedicated accessibility menu (high-contrast / invert / grayscale / bigger or smaller text / readable font / letter spacing / link emphasis / motion stop / big cursor) with `localStorage` persistence. Dedicated `legal/accessibility.html` statement.
- **Israeli ecosystem integrations**
  - Reservations: **Tabit**, **Ontopo**
  - Delivery: **Wolt**, **10bis**, **Mishloha**, **Cibus**
  - Maps: Google Maps embed + **Waze** & **Google Maps** deeplinks
- **Interactive on-page menu** — tabbed (sandwiches / rolls / salads / sides / drinks / dessert) with full Hebrew + English copy, prices in ₪.
- **Conversion-optimized** — sticky thumb-bar at the bottom on mobile (Order Delivery / Book Table / Call), big tap targets (≥44 px).
- **SEO** — Schema.org `Restaurant` JSON-LD, OpenGraph, hreflang, sitemap.xml, robots.txt.
- **PWA** — installable web manifest.
- **Live "Open now / Closed" indicator** in the top bar based on the schedule.
- **Legal** — Accessibility statement, Privacy policy and Terms of service tailored to Israeli law (חוק הגנת הפרטיות, חוק הגנת הצרכן, IS 5568).

## File map

```
.
├─ index.html                Main bilingual page
├─ manifest.webmanifest      PWA manifest
├─ robots.txt
├─ sitemap.xml
├─ assets/
│  ├─ css/styles.css         All styles (mobile-first, ~12 KB)
│  ├─ js/i18n.js             Hebrew + English dictionary
│  ├─ js/main.js             Lang switch, tabs, a11y, hours, form
│  └─ img/favicon.svg
└─ legal/
   ├─ accessibility.html     הצהרת נגישות
   ├─ privacy.html           מדיניות פרטיות
   └─ terms.html             תנאי שימוש
```

## Local preview

No build step required.

```bash
# Python 3 (built-in)
python3 -m http.server 8080

# or Node (one-shot)
npx serve .
```

Open <http://localhost:8080>.

## Deployment

### Netlify (drag-and-drop or CLI)
```bash
# from the project root
npx netlify-cli deploy --dir=. --prod
```

### Vercel
```bash
npx vercel --prod
```

### Cloudflare Pages
- Build command: *(leave empty)*
- Build output directory: `/`

### GitHub Pages
- Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`.

### Custom domain checklist
1. Point `redmeat-bograshov.co.il` (or final domain) to host's CNAME / A record.
2. Force HTTPS in host settings (Let's Encrypt is free).
3. Update the canonical URL in `index.html` (`<link rel="canonical">`) and `sitemap.xml` if you change domains.
4. Replace the placeholder Instagram/Facebook URLs in the footer.
5. Drop a real high-resolution OG cover at `assets/img/og-cover.jpg` (1200×630).
6. Add the real Tabit / Wolt restaurant URLs once published (search “Red Meat Bograshov” in each platform).

## Editing content

- **Menu, prices, descriptions:** edit in `index.html` (DOM is the source of truth) and the matching translations in `assets/js/i18n.js` (key → text).
- **Hours:** edit the table in `index.html` and the `HOURS` array in `assets/js/main.js`.
- **Phone:** search for `03-508-7758` / `+97235087758`.

## Performance notes

- Total payload first paint: ~30 KB gzip (HTML + CSS + i18n + JS).
- Fonts: Google Fonts via async `media=print` swap so the first paint isn't blocked. Falls back to system Arial / Heebo immediately on slow networks.
- Map iframe is `loading="lazy"`.
- No third-party trackers by default.

## Browser support

Chrome / Safari / Edge / Firefox — last 2 versions; iOS Safari ≥ 14; Samsung Internet ≥ 14.

## License

© Red Meat Bograshov. All rights reserved.

