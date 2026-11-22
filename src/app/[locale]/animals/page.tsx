import React from 'react'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'

import { Header, Paragraph } from '../components/common'
import AnimalsGallery from './AnimalsGallery'

export const metadata: Metadata = {
  title: 'Animals',
  description: 'Spotted while traveling',
}

const Animals: React.FunctionComponent = () => {
  const t = useTranslations('AnimalsPage')
  return (
    <>
      <Header text={t('header')} />
      <Paragraph className="max-w-2xl">{t('description')}</Paragraph>
      <AnimalsGallery />
    </>
  )
}

export default Animals
