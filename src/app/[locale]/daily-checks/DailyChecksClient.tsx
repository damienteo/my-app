'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import PageContainer from '../components/layout/PageContainer'
import WeatherSection from '../components/views/dailyChecks/WeatherSection'
import ForexSection from '../components/views/dailyChecks/ForexSection'
import PriceSeriesSection from '../components/views/dailyChecks/PriceSeriesSection'
import { priceSeries } from '../components/views/dailyChecks/priceSeries'

const DailyChecksClient = () => {
  const t = useTranslations('DailyChecksPage')
  return (
    <PageContainer title={t('title')}>
      <WeatherSection />
      <ForexSection />
      {priceSeries.map((series) => (
        <PriceSeriesSection key={series.id} series={series} />
      ))}
    </PageContainer>
  )
}

export default DailyChecksClient
