import { Noto_Sans_JP } from 'next/font/google'

// One variable file per unicode slice, instead of separate files for
// weights 400, 500, and 700. `preload` stays off: the browser should
// download only the slices that the Japanese text actually uses.
// `subsets` cannot name a Japanese subset (Google's metadata only lists
// latin, latin-ext, cyrillic, and vietnamese). The Japanese glyphs still
// arrive as unicode-range slices; see docs/performance-audit.md.
export const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-noto',
  preload: false,
  adjustFontFallback: true,
})
