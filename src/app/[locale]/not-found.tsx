import React from 'react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/src/i18n/navigation'
import { focusRing } from './components/common/classes'
import PageContainer from './components/layout/PageContainer'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.notFound')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function NotFound() {
  const t = await getTranslations('Metadata.notFound')

  return (
    <PageContainer title={t('title')} className="space-y-4">
      <p className="text-base leading-relaxed text-ink">{t('body')}</p>
      <Link
        href="/"
        className={`inline-flex text-accent-text underline-offset-2 hover:underline ${focusRing}`}
      >
        {t('home')}
      </Link>
    </PageContainer>
  )
}
