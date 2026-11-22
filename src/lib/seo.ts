export const SITE_URL = 'https://www.damienteo.com'

const locales = ['en', 'jp'] as const
type AppLocale = (typeof locales)[number]

export const PAGE_PATHS = {
  home: '/',
  about: '/about',
  portfolio: '/portfolio',
  dailyChecks: '/daily-checks',
  cpfForecast: '/cpf-forecast',
  animals: '/animals',
} as const

export type PageKey = keyof typeof PAGE_PATHS

/** Live, indexable routes. */
const SITEMAP_PATHS = [
  PAGE_PATHS.home,
  PAGE_PATHS.about,
  PAGE_PATHS.portfolio,
  PAGE_PATHS.dailyChecks,
  PAGE_PATHS.cpfForecast,
  PAGE_PATHS.animals,
] as const

export function htmlLang(locale: string): 'en' | 'ja' {
  return locale === 'jp' ? 'ja' : 'en'
}

export function ogLocale(locale: string): 'en_US' | 'ja_JP' {
  return locale === 'jp' ? 'ja_JP' : 'en_US'
}

export function otherLocale(locale: string): AppLocale {
  return locale === 'jp' ? 'en' : 'jp'
}

/**
 * `/about` renders the same About page as `/`. Canonicalize About onto the
 * locale home so the two URLs do not compete. Home stays canonical to itself.
 */
export function canonicalPathname(page: PageKey): string {
  if (page === 'about') {
    return PAGE_PATHS.home
  }
  return PAGE_PATHS[page]
}

export function localePath(locale: string, pathname: string): string {
  const suffix = pathname === '/' ? '' : pathname
  return `${SITE_URL}/${locale}${suffix}`
}

/**
 * HTML hreflang keys must be BCP 47 (`ja`), while the URL prefix stays `jp`.
 */
export function languageAlternates(pathname: string): {
  en: string
  ja: string
  'x-default': string
} {
  return {
    en: localePath('en', pathname),
    ja: localePath('jp', pathname),
    'x-default': localePath('en', pathname),
  }
}

export function pageAlternates(
  locale: string,
  pathname: string
): {
  canonical: string
  languages: ReturnType<typeof languageAlternates>
} {
  return {
    canonical: localePath(locale, pathname),
    languages: languageAlternates(pathname),
  }
}

export function sitemapEntries(): {
  url: string
  alternates: { languages: ReturnType<typeof languageAlternates> }
}[] {
  return SITEMAP_PATHS.flatMap((pathname) =>
    locales.map((locale) => ({
      url: localePath(locale, pathname),
      alternates: { languages: languageAlternates(pathname) },
    }))
  )
}
