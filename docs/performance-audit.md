# Performance audit

This is a walkthrough of how the site was measured, why each slow page was slow, and what changed. The numbers are from one lab run on this machine, before and after the same commands. They are not field data from real visitors. Lighthouse on a laptop is useful for catching multi-megabyte mistakes. It is a poor way to judge a 50 ms difference.

The production build is Next.js 16.4.6 with Turbopack. Pages live under `src/app/[locale]` and are translated with next-intl (`en` and `jp`).

## 1. The three tools

### `next build`

```bash
npm run build
```

The route table at the end of the build is the first thing to read. Next.js 16 prints three kinds of route:

| Mark | Meaning |
| --- | --- |
| `○` Static | One HTML file, shared by every visitor. No per-request render. |
| `●` SSG | Same idea, but the path has a dynamic segment (`[locale]`) that was filled in by `generateStaticParams`. `/en/about` and `/jp/about` are separate static files. |
| `ƒ` Dynamic | Rendered on the server for every request. |

A dynamic page cannot be cached at the edge as a finished document. The response on the baseline build was:

```text
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
```

After the i18n fix, the same URL is:

```text
x-nextjs-cache: HIT
x-nextjs-prerender: 1
Cache-Control: s-maxage=31536000
```

That header change is the evidence that the page is static. Lighthouse on localhost will not show it as a big LCP win, because the dev machine answers in about 30 ms either way. On Vercel, a dynamic route is a serverless function. A static route is a file. Cold starts show up for the first kind and not the second.

Next.js 16 removed the old "First Load JS" column from this table. The Next.js 16 upgrade notes say the number disagreed between Turbopack and Webpack and did not describe a React Server Components app honestly. Do not go looking for it. Use Lighthouse for what the browser downloads, and the bundle analyzer for which package is inside a chunk.

### Bundle analyzer

There are two analyzers, because Next.js 16 builds with Turbopack and the older plugin is Webpack-only.

**Turbopack, which is what `npm run build` ships:**

```bash
npx next analyze --output --snapshot baseline
npx next analyze export --snapshot baseline > /tmp/bundle-graph.jsonl
```

`next analyze` does not write a deployable build. It writes a module graph to `.next/diagnostics/analyze`. Open the interactive view with `npx next analyze` (no `--output`) and filter by route, then by client or server. `route-summaries.json` in that folder is the size of everything the route *references*, including every font file the CSS points at. That is why every page showed about 5.8 MB of "client" gzip in the summary: it was counting the whole Noto Sans JP family, not the slices the browser fetches for one page. Use it to compare routes (daily checks is larger than about by the chart library). Use Lighthouse for the bytes on the wire.

**Webpack treemap, behind `ANALYZE=true`:**

`@next/bundle-analyzer` is installed as a devDependency. `next.config.mjs` enables it only when `ANALYZE=true`. Production `next build` is Turbopack, so the plugin does nothing on a normal build. The npm script forces Webpack:

```bash
npm run analyze
# which is: ANALYZE=true next build --webpack
```

Webpack writes HTML treemaps (client, server, edge) and does not open a browser (`openAnalyzer: false`). Those treemaps are a second view of the modules. They are not the chunks Turbopack ships. When the two disagree, trust Turbopack plus Lighthouse.

### Lighthouse

Mobile lab run, performance category only, simulated throttling. That is the mobile preset: a slow phone and a slow network, applied as a simulation rather than by actually throttling the machine.

```bash
npm run build
npm start -- --port 3000

lighthouse http://127.0.0.1:3000/en/about \
  --only-categories=performance \
  --form-factor=mobile \
  --screenEmulation.mobile \
  --throttling-method=simulate \
  --output json --output html \
  --output-path /tmp/lh/en-about \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --quiet
```

Pages measured, in English and Japanese:

- `/en` and `/jp` (home, same content as About)
- `/about`
- `/portfolio`
- `/daily-checks`
- `/cpf-forecast`
- `/animals`

`/` redirects to `/en`.

What the metrics mean:

| Metric | What it measures | Rough "good" line |
| --- | --- | --- |
| Performance score | Weighted mix of the metrics below. A single bad one can sink it. | 90–100 |
| FCP | First Contentful Paint. First time any text or image is painted. | under 1.8 s |
| LCP | Largest Contentful Paint. When the largest visible element finishes painting. This is the one visitors feel as "the page showed up". | under 2.5 s |
| TBT | Total Blocking Time. Main-thread work that blocks input, mostly JavaScript parse and execute. | under 200 ms |
| CLS | Cumulative Layout Shift. How much the page jumps after paint. | under 0.1 |
| Transfer | `total-byte-weight`. Bytes on the wire for that load, after gzip. | smaller is better |

Read the network table in the report, sorted by transfer size. The score tells you that something is wrong. The network table tells you what.

These runs did not have `OPENWEATHER_API_KEY` or the other provider keys, so weather fails and some charts stay empty. Gold and bitcoin still returned, because those providers do not need a key. Compare runs that were taken the same way. Do not compare this lab to the production CrUX report without saying so.

## 2. What the baseline showed

### Every page was dynamic

`npm run build` on the starting commit:

```text
┌ ○ /_not-found
├ ƒ /[locale]
├ ƒ /[locale]/about
├ ƒ /[locale]/animals
├ ƒ /[locale]/cpf-forecast
├ ƒ /[locale]/daily-checks
├ ƒ /[locale]/markets
├ ƒ /[locale]/portfolio
├ ƒ /[locale]/stocks-watch
└ ƒ /api/...
```

Nothing under `[locale]` was static. The pages do not call `cookies()` or `headers()` themselves. next-intl does. `getRequestConfig` in `src/i18n/request.ts` awaited `requestLocale`, and next-intl implements that by reading the `x-next-intl-locale` request header. Reading headers opts the route into dynamic rendering. The library's own error text says so, and points at `setRequestLocale` as the old escape hatch.

`setRequestLocale` is deprecated in next-intl 4.15. Next.js 16.3 added `next/root-params`, which reads the `[locale]` segment without touching the request. That is what the current next-intl setup guide uses. `generateStaticParams` is still required, or Next has no list of locales to prerender.

The middleware (`src/proxy.ts`) still runs and still sets the `NEXT_LOCALE` cookie. Middleware does not, by itself, make the page dynamic.

### Fonts

`src/app/[locale]/layout.tsx` loaded four Google fonts through `next/font`, on every page:

| Font | What the build emitted |
| --- | --- |
| Geist | Variable, latin, one 29 KB woff2, preloaded. This is the body font. |
| Space Grotesk | Variable, latin, one 22 KB woff2, preloaded. Used for headings. |
| Geist Mono | Variable, latin, one 23 KB woff2, preloaded. Only used inside Recharts. |
| Noto Sans JP | Weights 400, 500, and 700. **372 `@font-face` rules** in a 277 KB stylesheet (97 KB gzip). |

`subsets: ['latin']` does not limit Noto Sans JP to Latin. Google's metadata for that family only lists `latin`, `latin-ext`, `cyrillic`, and `vietnamese`. The Japanese glyphs are shipped as about 120 unicode-range slices per weight. Asking for `latin` still produced the full slice set, three times.

That stylesheet was on English pages. The navbar label "日本語" is not in Geist, and Noto was the next family in the stack, so English pages also downloaded at least one Noto slice (about 19 KB) on top of the 97 KB of CSS. Japanese pages downloaded about 500 KB of slices, because the text actually uses those ranges, and sometimes more than one weight.

`preload: false` was already set on Noto, so the slices were not all preloaded. The CSS still was.

### Images

Portfolio used raw `<img>` tags for PNGs:

| File | Pixels | Bytes |
| --- | --- | --- |
| `payments-agreement.png` | 2850×1536 | 1.2 MB |
| `thunderdome.png` | 2872×1586 | 688 KB |
| `fireman-game.png` | 1976×1032 | 608 KB |
| `budget-planner.png` | 1277×826 | 29 KB |

On a phone those images are displayed at roughly half of a 1024 px column, or 95% of the viewport. The browser was still downloading the full PNG. Lighthouse's LCP element on `/en/portfolio` was that first image, at 4.4 s, and the page transferred 3.0 MB.

`TableC1_AllocationRates.png` (1226×645, 227 KB) is the same kind of tag, inside the CPF withdrawal popup. It is not on the first load. It was switched to `next/image` anyway.

Animals already used `next/image`, with `unoptimized`, because the optimizer does not help GIFs. There are 24 GIFs, **191 MB** on disk. The largest is `nara-deer.gif` at 14.4 MB, and the frames are small (often under 600 px). Lighthouse's mobile run loaded the ones near the viewport and transferred **74 MB** in English and **81 MB** in Japanese. LCP was 144 s and 194 s. That is the GIF download, under simulated slow 4G, not a JavaScript problem. FCP stayed at 1.5 s because the heading paints before the clips.

### JavaScript

Client chunks on the baseline build, sniffed for package names:

| Package | Where it actually is |
| --- | --- |
| `recharts` | A 370 KB chunk (107 KB gzip). Referenced by daily checks, and also by markets and stocks-watch, which call `notFound()` before rendering. Not referenced by about, portfolio, animals, or CPF. |
| `yahoo-finance2` | API routes only (`/api/sp500`, `/api/stocks/*`). It does not leak into the client graph. |
| `dayjs` | CPF forecast client, because the calculator imports it. Not on other pages. |
| `constants.ts` | The navbar imported `navLinks` from a module that also holds the entire stock watchlist. The client chunk for the layout contained the string `NVIDIA`. Every page downloaded that. |

Daily checks imported Recharts at the top of each section, so the browser downloaded and parsed it even while the section was still showing "loading".

The navbar has to be a client component: it holds the open menu, the locale toggle, and `usePathname`. That part is justified. The stock list riding along with it was not.

### Daily checks fetches

The page is a client component that `fetch`es `/api/*` after hydration. The API routes already declared `export const revalidate`. Several upstream `fetch` calls did not pass `next: { revalidate }` and so were uncached whenever the handler ran:

- `src/app/api/weather/route.ts` (both OpenWeather calls)
- `src/app/api/forex/route.ts` (the current rate and each historical day)

Crypto, gold, and the S&P routes already passed `next.revalidate`. Under `next start`, those route handlers still respond without a public `Cache-Control` header. The cache is Next's data cache on the server, not the browser. A first visit still waits on the client fetch. Caching helps the second request and the upstream rate limits.

### Baseline Lighthouse

Mobile, simulated, one run. Transfer is `total-byte-weight`.

| Page | Score | LCP | CLS | TBT | FCP | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/en` | 99 | 1.5 s | 0.000 | 90 ms | 1.5 s | 475 KiB |
| `/en/about` | 99 | 1.5 s | 0.000 | 70 ms | 1.5 s | 475 KiB |
| `/en/portfolio` | 84 | 4.4 s | 0.000 | 34 ms | 1.5 s | 3.0 MiB |
| `/en/daily-checks` | 94 | 1.5 s | 0.059 | 264 ms | 1.5 s | 564 KiB |
| `/en/cpf-forecast` | 100 | 1.5 s | 0.000 | 64 ms | 1.5 s | 461 KiB |
| `/en/animals` | 72 | 144.2 s | 0.091 | 120 ms | 1.5 s | 74.4 MiB |
| `/jp` | 99 | 1.5 s | 0.000 | 74 ms | 1.5 s | 917 KiB |
| `/jp/about` | 99 | 1.5 s | 0.000 | 104 ms | 1.5 s | 917 KiB |
| `/jp/portfolio` | 74 | 9.0 s | 0.000 | 104 ms | 1.5 s | 3.4 MiB |
| `/jp/daily-checks` | 72 | 1.5 s | 0.594 | 247 ms | 1.5 s | 824 KiB |
| `/jp/cpf-forecast` | 99 | 1.5 s | 0.000 | 70 ms | 1.5 s | 936 KiB |
| `/jp/animals` | 71 | 193.7 s | 0.111 | 64 ms | 1.5 s | 81.3 MiB |

Home and About match because they render the same component. Japanese pages cost about 450 KB more than English ones, and almost all of that difference is font files.

The Japanese daily-checks score of 72 is not a slow server. LCP was already 1.5 s. CLS was 0.594, which is past the "poor" line of 0.25. The layout-shift audit named the gold and bitcoin cards: they render as one line of "loading", then expand into a title, period buttons, a price, and a 300 px chart. That push is the shift.

## 3. What changed, and why

Each change is the smallest edit that removes a cost measured above. The loaded pages use the same type, the same colours, and the same layout.

### Static rendering for every locale page

`src/i18n/request.ts` now reads the locale from `next/root-params` instead of the request header. `src/app/[locale]/layout.tsx` exports `generateStaticParams` for `en` and `jp`.

`setRequestLocale` was not added. It still works, but next-intl marks it deprecated and the root-params path is the one the current docs describe. It also avoids calling `setRequestLocale` in every page, which the old API required.

After the change the route table lists `● /en`, `● /jp`, and the same for every page. API routes stay `ƒ`, which is correct: they depend on the query string and on upstream data.

### Fonts

- Geist Mono is `preload: false`. Pages without a chart no longer download it during first paint. Daily checks still downloads it, because the chart CSS uses `--font-mono`. Confirmed in the after Lighthouse run: the mono file is absent on About and present on daily checks.
- Noto Sans JP is a variable font (`weight: 'variable'`, `font-weight: 100 900`). The stylesheet went from 372 faces / 277 KB (97 KB gzip) to 124 faces / 93 KB (33 KB gzip). One file per unicode slice covers every weight the CSS asks for, including `font-semibold`.
- The English font stack no longer names `--font-noto`. An undefined CSS variable would invalidate the whole `font-family`, so the Japanese family is only added under `html[lang='jp']`. English Lighthouse runs downloaded **zero** Noto woff2 files. The three characters in the "日本語" toggle use the browser's fallback CJK font. That is a small difference on the toggle only.
- The Noto CSS file is still linked on English pages. `next/font` CSS is part of the layout's module graph, and both locales share one layout, so Turbopack emits one stylesheet for both. The woff2 files are not fetched until a character hits a `unicode-range` *and* the family is in the used `font-family`. English text never asks for them. Removing the CSS link itself would mean a separate layout per locale, or a hand-maintained subset file. That was left as a follow-up.

### Portfolio and the CPF table

The four portfolio screenshots and the CPF allocation table use `next/image` with the real pixel dimensions and a `sizes` hint. The first portfolio image is `priority` so it is the LCP candidate and is preloaded. On the mobile run the payments screenshot arrived as a 750 px-wide optimized image at **19 KB**, down from 1.2 MB. Thunderdome was 18 KB, down from 688 KB. The page's image total was 59 KB.

### Animal clips

The GIFs were re-encoded with ffmpeg to H.264, original frame size, no audio, `crf 28`:

```bash
ffmpeg -i clip.gif -movflags +faststart -pix_fmt yuv420p -an \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -crf 28 -preset fast clip.mp4
```

191 MB of GIF became 21 MB of MP4. The page renders `<video muted loop playsInline>` at the same 384 px width (`w-96`) as the old `width={384}` images, with the real aspect ratio so the box does not start as a square and then jump (that jump was the old CLS of about 0.1). The first clip loads immediately. The rest use `preload="none"` until they are near the viewport. `prefers-reduced-motion: reduce` leaves them paused.

Lighthouse still scrolls and fetched the first three clips (about 1.4 MB of video) instead of eight GIFs. LCP went from 144 s to 3.1 s. The filmstrip in the Lighthouse report is the same goats and the same snowy tree. The codec changed; the frames did not get a new crop or a new order.

### Charts

Recharts stays on the client. Charts need state, resize observers, and pointer events, so they cannot become server components. What changed:

- The line chart JSX lives in `PriceLineChart.tsx`.
- Each section loads it with `next/dynamic` and `ssr: false`, and only mounts it once there is a series to draw.
- The loading state of those sections has `min-h-[36rem]`, close to the height of the loaded card, so the gold and bitcoin blocks stop shoving the rest of the page down.

The chart stroke, tooltip, axis format, and 300 px height are the same. Bitcoin and ethereum still format as dollars. The USD/JPY series still uses the muted stroke it had before. Recharts is still about 110 KB gzip on daily checks once a quote arrives, which is what the lab run did. It is not on About, Portfolio, Animals, or CPF.

### The stock list left the shared bundle

`navLinks` moved to `src/config/navLinks.ts`. The navbar imports that file, not `constants.ts`.

The watchlist moved to `src/config/stocks.ts`. CPF client components import CPF numbers from `constants.ts`, which no longer contains the stock tables. Markets and stocks-watch are still `notFound()` and still ship their own client code, but that code is not in the About document.

### Upstream fetch cache

Weather and forex `fetch` calls now pass `next: { revalidate }` with the same lifetime as the route (`600` s and `3600` s). This caches the upstream response inside Next's data cache when the handler runs. It does not make the browser skip the `/api` request on a first visit.

### Speed Insights

`@vercel/speed-insights` is a dependency, and `<SpeedInsights />` is in the root layout next to Google Analytics. It records Core Web Vitals from real sessions, which is the number this lab run cannot give you.

It does nothing useful until it is turned on for the Vercel project: Project, then Speed Insights, then Enable. After that, production deployments start sending data. The local `next start` server is not the Vercel platform, so the script request is a no-op here. The script is small next to the 89 KB Google tag, which is now the largest single script on pages that do not show a chart.

## 4. After, measured the same way

`npm run lint` (typecheck and ESLint), `npm test` (84 tests), and `npm run build` all passed. The route table is `●` for every locale page and `ƒ` for every API route.

| Page | Score | LCP | CLS | TBT | FCP | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/en` | 99 → 100 | 1.5 s → 1.2 s | 0 → 0 | 90 → 32 ms | 1.5 s → 1.2 s | 475 → 409 KiB |
| `/en/about` | 99 → 100 | 1.5 s → 1.2 s | 0 → 0 | 70 → 38 ms | 1.5 s → 1.2 s | 475 → 409 KiB |
| `/en/portfolio` | 84 → 90 | 4.4 s → 3.5 s | 0 → 0 | 34 → 88 ms | 1.5 s → 1.2 s | 3.0 MiB → 423 KiB |
| `/en/daily-checks` | 94 → 93 | 1.5 s → 1.1 s | 0.059 → 0 | 264 → 330 ms | 1.5 s → 1.1 s | 564 → 501 KiB |
| `/en/cpf-forecast` | 100 → 99 | 1.5 s → 1.2 s | 0 → 0 | 64 → 122 ms | 1.5 s → 1.2 s | 461 → 398 KiB |
| `/en/animals` | 72 → 94 | 144.2 s → 3.1 s | 0.091 → 0 | 120 → 72 ms | 1.5 s → 1.2 s | 74.4 → 1.7 MiB |
| `/jp` | 99 → 100 | 1.5 s → 1.2 s | 0 → 0 | 74 → 91 ms | 1.5 s → 1.2 s | 917 → 872 KiB |
| `/jp/about` | 99 → 99 | 1.5 s → 1.2 s | 0 → 0 | 104 → 104 ms | 1.5 s → 1.2 s | 917 → 872 KiB |
| `/jp/portfolio` | 74 → 86 | 9.0 s → 4.2 s | 0 → 0 | 104 → 82 ms | 1.5 s → 1.2 s | 3.4 MiB → 900 KiB |
| `/jp/daily-checks` | 72 → 91 | 1.5 s → 1.2 s | 0.594 → 0 | 247 → 366 ms | 1.5 s → 1.2 s | 824 → 761 KiB |
| `/jp/cpf-forecast` | 99 → 99 | 1.5 s → 1.2 s | 0 → 0 | 70 → 94 ms | 1.5 s → 1.2 s | 936 → 873 KiB |
| `/jp/animals` | 71 → 92 | 193.7 s → 3.3 s | 0.111 → 0 | 64 → 66 ms | 1.5 s → 1.2 s | 81.3 → 1.9 MiB |

Read the score next to the column that moved.

- Animals moved because the transfer collapsed. LCP is now one video, not a 10 MB GIF. 3.1 s is still only "needs improvement" (the line for good LCP is 2.5 s). The first clip is 630 KB.
- Portfolio moved because the PNGs became small responsive images. English transfer went from 3.0 MB to 423 KB. Japanese portfolio is higher because it still downloads the Noto slices.
- Japanese daily checks moved because CLS went from 0.594 to 0. The score jump is the layout shift, not a faster server.
- About gained about 0.3 s of LCP and about 70 KB, mostly the Noto CSS shrinking and the mono font no longer being preloaded. It was already a small page.
- TBT went **up** on daily checks and on the English CPF page. One lab run moves TBT by tens of milliseconds, and these pages now also request the Speed Insights script. Do not treat 264 ms → 330 ms as a regression you can quote to a single millisecond. Do treat it as "deferring Recharts did not, in this run, make the main thread quieter." The charts still parse as soon as data arrives, which happened during the trace.

The static-rendering win is the cache header, not this table. Re-measure LCP from Vercel Speed Insights after a few days of traffic if you want the field number.

## 5. Left undone, on purpose

**Subset Noto to the characters in `messages/jp.json`.** Japanese pages still download about 500 KB of slices, and English pages still download a 33 KB stylesheet full of `@font-face` rules they never use. A subset font (one woff2, the glyphs the site actually prints) would cut both. The tradeoff is tofu: a new kanji in a translation renders as a box until the subset is rebuilt. A system stack (`Hiragino Sans`, `Yu Gothic`, `Noto Sans JP`) would cost zero bytes and would change how Japanese text looks on each operating system.

**Render daily checks on the server with `revalidate`.** The HTML would include the quotes, so the client would not wait on six round trips. The tradeoff is that the build (and every revalidation) needs the API keys, a failed upstream gets baked in until the next revalidate, and the page stops being a fully static file. The chart library would still be client JavaScript.

**Drop the unused markets and stocks-watch imports.** Both pages call `notFound()` immediately, but the client components are still compiled. Deleting or lazy-loading those imports shrinks the build. It does not change a page anyone can open.

**Google Analytics.** `gtag/js` is about 89 KB on every page, larger than any of our own scripts on About. `@next/third-parties` already loads it after hydration. Removing it makes the lab nicer and throws away the analytics.

**The message catalog.** `messages/en.json` is 33 KB and is sent with every page because the provider sits in the layout. Passing only `NavLinks` plus the current page's namespace would trim the RSC payload. The tradeoff is another provider per page, and it is easy to forget a namespace.

**Replacing dayjs.** It is only on the CPF page, and that page already scores 99. Swapping it for `Date` saves a small chunk and risks the forecast's month arithmetic. Not worth it next to the image and font work.

**Shorter animal clips.** A few MP4s are still 1–3 MB (`goats.mp4` is 2.9 MB) because the source GIF is long, not because the frame is large. A higher `crf` or a lower frame rate would shrink them and soften the picture. The lazy loader already keeps them off the first paint.

**More than one Lighthouse run.** Medians of three runs would make the TBT column trustworthy. The animals, portfolio, and CLS results are large enough that one run is enough to believe them.

## 6. Repeating the after measurement

```bash
git switch <this branch>
npm ci
npm run lint
npm test
npm run build
npm start -- --port 3000
# then the lighthouse command from section 1, for each URL
npx next analyze --output
```

Expect `●` on the locale pages, `Cache-Control: s-maxage=31536000` on `/en/about`, no Noto woff2 requests on an English page, and the portfolio images served from `/_next/image`.
