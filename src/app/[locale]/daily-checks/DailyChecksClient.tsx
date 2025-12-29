'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import WeatherSection from '../components/views/dailyChecks/WeatherSection'
import ForexSection from '../components/views/dailyChecks/ForexSection'

const DailyChecksClient = () => {
  const t = useTranslations('DailyChecksPage')
  return (
    <div className="flex flex-col max-w-6xl px-4 sm:px-6 mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-200 mb-6">{t('title')}</h1>
      <WeatherSection />
      <ForexSection />
    </div>
  )
}

export default DailyChecksClient

