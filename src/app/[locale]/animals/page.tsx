import React from 'react'
import { useTranslations } from 'next-intl'

import { generatePageMetadata } from '../../../lib/pageMetadata'
import { Paragraph } from '../components/common'
import PageContainer from '../components/layout/PageContainer'
import AnimalsGallery from './AnimalsGallery'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return generatePageMetadata({ params, page: 'animals' })
}

const Animals: React.FunctionComponent = () => {
  const t = useTranslations('AnimalsPage')
  return (
    <PageContainer title={t('header')}>
      <Paragraph className="max-w-2xl">{t('description')}</Paragraph>
      <AnimalsGallery />
    </PageContainer>
  )
}

export default Animals
