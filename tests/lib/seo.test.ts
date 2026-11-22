import {
  PAGE_PATHS,
  SITE_URL,
  canonicalPathname,
  htmlLang,
  languageAlternates,
  localePath,
  ogLocale,
  pageAlternates,
  sitemapEntries,
} from '../../src/lib/seo'

describe('localePath', () => {
  it('builds the English home URL without a trailing slash after the locale', () => {
    expect(localePath('en', '/')).toBe(`${SITE_URL}/en`)
  })

  it('keeps the jp URL prefix for Japanese pages', () => {
    expect(localePath('jp', '/portfolio')).toBe(`${SITE_URL}/jp/portfolio`)
  })
})

describe('pageAlternates', () => {
  it('sets canonical and hreflang for an English inner page', () => {
    expect(pageAlternates('en', '/portfolio')).toEqual({
      canonical: `${SITE_URL}/en/portfolio`,
      languages: {
        en: `${SITE_URL}/en/portfolio`,
        ja: `${SITE_URL}/jp/portfolio`,
        'x-default': `${SITE_URL}/en/portfolio`,
      },
    })
  })

  it('sets canonical on the jp URL and ja as the hreflang key', () => {
    const alternates = pageAlternates('jp', '/daily-checks')
    expect(alternates.canonical).toBe(`${SITE_URL}/jp/daily-checks`)
    expect(alternates.languages.ja).toBe(`${SITE_URL}/jp/daily-checks`)
    expect(alternates.languages.en).toBe(`${SITE_URL}/en/daily-checks`)
    expect(alternates.languages['x-default']).toBe(
      `${SITE_URL}/en/daily-checks`
    )
    expect(Object.keys(alternates.languages)).toEqual(['en', 'ja', 'x-default'])
  })

  it('does not emit hreflang=jp', () => {
    const keys = Object.keys(pageAlternates('jp', '/').languages)
    expect(keys).not.toContain('jp')
  })
})

describe('canonicalPathname', () => {
  it('keeps the homepage canonical to itself', () => {
    expect(canonicalPathname('home')).toBe('/')
    expect(pageAlternates('en', canonicalPathname('home')).canonical).toBe(
      `${SITE_URL}/en`
    )
  })

  it('points About at the homepage so the duplicate URL does not rank separately', () => {
    expect(canonicalPathname('about')).toBe(PAGE_PATHS.home)
    expect(pageAlternates('en', canonicalPathname('about')).canonical).toBe(
      `${SITE_URL}/en`
    )
    expect(pageAlternates('jp', canonicalPathname('about')).canonical).toBe(
      `${SITE_URL}/jp`
    )
  })
})

describe('language helpers', () => {
  it('maps the jp URL locale to ja / ja_JP', () => {
    expect(htmlLang('jp')).toBe('ja')
    expect(ogLocale('jp')).toBe('ja_JP')
    expect(htmlLang('en')).toBe('en')
    expect(ogLocale('en')).toBe('en_US')
  })

  it('points ja hreflang at the /jp URL', () => {
    expect(languageAlternates('/animals').ja).toBe(`${SITE_URL}/jp/animals`)
  })
})

describe('sitemapEntries', () => {
  it('includes both locales for every live page and skips dead routes', () => {
    const urls = sitemapEntries().map((entry) => entry.url)
    expect(urls).toContain(`${SITE_URL}/en`)
    expect(urls).toContain(`${SITE_URL}/jp`)
    expect(urls).toContain(`${SITE_URL}/en/about`)
    expect(urls).toContain(`${SITE_URL}/jp/portfolio`)
    expect(urls).not.toContain(`${SITE_URL}/en/markets`)
    expect(urls).not.toContain(`${SITE_URL}/en/stocks-watch`)
  })

  it('attaches language alternates with ja, not jp', () => {
    const homeEn = sitemapEntries().find(
      (entry) => entry.url === `${SITE_URL}/en`
    )
    expect(homeEn?.alternates.languages).toEqual({
      en: `${SITE_URL}/en`,
      ja: `${SITE_URL}/jp`,
      'x-default': `${SITE_URL}/en`,
    })
  })
})
