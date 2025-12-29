import React from 'react'
import { useTranslations } from 'next-intl'
import { Header, InfoPopup, Paragraph } from '../../common'

const Intro: React.FunctionComponent = () => {
  const t = useTranslations('CPFForecastPage.intro')
  return (
    <div>
      <div className="flex">
        <Header text={t('title')} className="mb-2 mr-1" />{' '}
        <InfoPopup title={t('disclaimer.title')}>
          <Paragraph className="mb-6 text-gray-300">
            {t('disclaimer.notFinancialAdvice')}
          </Paragraph>
          <Paragraph className="mb-6 text-gray-300">
            {t('disclaimer.notEmployee')}
          </Paragraph>
          <Paragraph className="mb-6 text-gray-300">
            {t('disclaimer.researchBased')}
          </Paragraph>
          <Paragraph className="mb-6 text-gray-300">
            {t('disclaimer.corrections')}
          </Paragraph>
          <Paragraph className="mb-6 text-gray-300">
            {t('disclaimer.thankYou')}
          </Paragraph>
        </InfoPopup>
      </div>
    </div>
  )
}

export default Intro
