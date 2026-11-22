import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { type PageKey, canonicalPathname, pageAlternates } from './seo'

export async function generatePageMetadata({
  params,
  page,
}: {
  params: Promise<{ locale: string }>
  page: PageKey
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const pathname = canonicalPathname(page)
  const pageTitle = t(`${page}.title`)
  const description = t(`${page}.description`)

  // Do not set `openGraph` here. A child `openGraph` object replaces the
  // parent one (including the generated image from opengraph-image.tsx).
  // Title, description, and canonical still populate og:title / og:url.
  return {
    title: page === 'home' ? { absolute: pageTitle } : pageTitle,
    description,
    alternates: pageAlternates(locale, pathname),
  }
}
