'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Section } from '../../common'
import { raisedPanel } from '../../common/classes'
import dynamic from 'next/dynamic'
import PeriodToggle from './PeriodToggle'
import { chartDomain, formatChartDate, type ChartPoint } from './priceSeries'

const PriceLineChart = dynamic(() => import('./PriceLineChart'), {
  ssr: false,
  loading: () => <div className="h-[300px]" />,
})

const FOREX_PERIODS = ['1week', '1month', '3months'] as const

type Period = (typeof FOREX_PERIODS)[number]

interface ForexData {
  current: {
    usdToSgd: number
    sgdToJpy: number
    usdToJpy: number
  }
  historical: {
    usdToSgd: ChartPoint[]
    sgdToJpy: ChartPoint[]
    usdToJpy: ChartPoint[]
  }
}

const ForexSection = () => {
  const t = useTranslations('DailyChecksPage.forex')
  const periods = useTranslations('DailyChecksPage.periods')
  const price = useTranslations('DailyChecksPage.price')
  const [period, setPeriod] = useState<Period>('1month')
  const [forex, setForex] = useState<ForexData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const fetchForex = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/forex?period=${period}`, {
          signal: abortController.signal,
        })
        if (!res.ok) {
          throw new Error('Failed to fetch forex data')
        }
        const data = await res.json()
        // Only update state if component is still mounted and period hasn't changed
        if (isMounted) {
          setForex(data)
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name !== 'AbortError' && isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchForex()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [period])

  if (loading) {
    return (
      <Section className="min-h-[36rem]">
        <p className="text-gray-300">{t('loading')}</p>
      </Section>
    )
  }

  if (error || !forex) {
    return (
      <Section>
        <p className="text-red-400">{error || t('error')}</p>
      </Section>
    )
  }

  return (
    <Section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('title')}</h2>

      <PeriodToggle
        periods={FOREX_PERIODS}
        value={period}
        onChange={setPeriod}
        label={(item) => periods(item)}
      />

      {/* Current Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={raisedPanel}>
          <p className="text-sm text-gray-400 mb-1">{t('rates.usdToSgd')}</p>
          <p className="text-2xl font-mono tabular-nums font-bold text-ink">
            {forex.current.usdToSgd.toFixed(4)}
          </p>
        </div>
        <div className={raisedPanel}>
          <p className="text-sm text-gray-400 mb-1">{t('rates.sgdToJpy')}</p>
          <p className="text-2xl font-mono tabular-nums font-bold text-ink">
            {forex.current.sgdToJpy.toFixed(2)}
          </p>
        </div>
        <div className={raisedPanel}>
          <p className="text-sm text-gray-400 mb-1">{t('rates.usdToJpy')}</p>
          <p className="text-2xl font-mono tabular-nums font-bold text-ink">
            {forex.current.usdToJpy.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Data Availability Notice */}
      {forex.historical.usdToSgd.length > 0 && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-400">
            {t('dataAvailability', {
              count: forex.historical.usdToSgd.length,
              startDate: formatChartDate(forex.historical.usdToSgd[0].date),
              endDate: formatChartDate(
                forex.historical.usdToSgd[forex.historical.usdToSgd.length - 1]
                  .date
              ),
            })}
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            {t('rates.usdToSgd')}
          </h3>
          {forex.historical.usdToSgd.length > 0 ? (
            <PriceLineChart
              data={forex.historical.usdToSgd}
              formatDate={formatChartDate}
              formatValue={(value) => value.toFixed(4)}
              domain={chartDomain(forex.historical.usdToSgd)}
            />
          ) : (
            <p className="text-gray-400 text-center py-8">
              {price('noHistoricalData')}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            {t('rates.sgdToJpy')}
          </h3>
          {forex.historical.sgdToJpy.length > 0 ? (
            <PriceLineChart
              data={forex.historical.sgdToJpy}
              formatDate={formatChartDate}
              formatValue={(value) => value.toFixed(2)}
              domain={chartDomain(forex.historical.sgdToJpy)}
            />
          ) : (
            <p className="text-gray-400 text-center py-8">
              {price('noHistoricalData')}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            {t('rates.usdToJpy')}
          </h3>
          {forex.historical.usdToJpy.length > 0 ? (
            <PriceLineChart
              data={forex.historical.usdToJpy}
              formatDate={formatChartDate}
              formatValue={(value) => value.toFixed(2)}
              domain={chartDomain(forex.historical.usdToJpy)}
              stroke="var(--color-muted)"
            />
          ) : (
            <p className="text-gray-400 text-center py-8">
              {price('noHistoricalData')}
            </p>
          )}
        </div>
      </div>
    </Section>
  )
}

export default ForexSection
