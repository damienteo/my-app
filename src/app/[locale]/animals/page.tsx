import React from 'react'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'

import { Paragraph } from '../components/common'
import PageContainer from '../components/layout/PageContainer'
import AnimalsGallery from './AnimalsGallery'

export const metadata: Metadata = {
  title: 'Animals',
  description: 'Spotted while traveling',
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
