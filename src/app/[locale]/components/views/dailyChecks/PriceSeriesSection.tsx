'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

import { Section } from '../../common'
import { raisedPanel } from '../../common/classes'
import PeriodToggle from './PeriodToggle'
import {
  PRICE_PERIODS,
  chartDomain,
  formatChartDate,
  formatMoney,
  formatSignedMoney,
  formatSignedPercent,
  isRateLimitError,
  type PricePeriod,
  type PriceSeriesConfig,
  type ChartPoint,
} from './priceSeries'

const PriceLineChart = dynamic(() => import('./PriceLineChart'), {
  ssr: false,
  loading: () => <div className="h-[300px]" />,
})

type SeriesData = {
  current: {
    price: number
    change: number
    changePercent: number
  }
  historical: ChartPoint[]
  source?: string
}

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-900/30 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-800/90 px-4 py-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="text-sm text-gray-300">{label}</p>
      </div>
    </div>
  )
}

const PriceSeriesSection = ({ series }: { series: PriceSeriesConfig }) => {
  const t = useTranslations('DailyChecksPage')
  const [period, setPeriod] = useState<PricePeriod>('1month')
  const [data, setData] = useState<SeriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(series.url(period), {
          signal: abortController.signal,
        })
        if (!res.ok) {
          throw new Error(series.fetchError)
        }
        const body = (await res.json()) as SeriesData
        if (isMounted) setData(body)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError' && isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void load()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [period, series])

  const loadingLabel = t(`${series.id}.loading`)

  if (loading && !data) {
    return (
      <Section className="min-h-[36rem]">
        <p className="text-gray-300">{loadingLabel}</p>
      </Section>
    )
  }

  if (error && !data) {
    return (
      <Section>
        {isRateLimitError(error) ? (
          <div>
            <p className="mb-2 text-yellow-400">{t('price.rateLimitError')}</p>
            <p className="text-sm text-gray-400">
              {t('price.rateLimitMessage')}
            </p>
          </div>
        ) : (
          <p className="text-red-400">{error || t(`${series.id}.error`)}</p>
        )}
      </Section>
    )
  }

  if (!data) return null

  const positive = data.current.change >= 0

  return (
    <Section className="relative">
      {loading ? <LoadingOverlay label={loadingLabel} /> : null}
      <h2 className="mb-4 text-2xl font-bold text-gray-200">
        {t(`${series.id}.title`)}
      </h2>

      <PeriodToggle
        periods={PRICE_PERIODS}
        value={period}
        onChange={setPeriod}
        label={(item) => t(`periods.${item}`)}
        className="justify-center sm:justify-start"
      />

      <div className={`${raisedPanel} mb-6`}>
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">{t('price.currentPrice')}</p>
          {data.source ? (
            <p className="text-xs text-gray-500 italic">
              {t('price.dataSource')}: {data.source}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-3">
          <p className="text-2xl font-mono font-bold text-ink tabular-nums sm:text-3xl">
            {formatMoney(data.current.price, series.withDollar)}
          </p>
          <div
            className={`text-base font-semibold sm:text-lg ${
              positive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatSignedMoney(data.current.change, series.withDollar)} (
            {formatSignedPercent(data.current.changePercent)})
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-200">
          {t('price.chartTitle')}
        </h3>
        {data.historical.length > 0 ? (
          <PriceLineChart
            data={data.historical}
            formatDate={formatChartDate}
            formatValue={(value) => formatMoney(value, series.withDollar)}
            domain={chartDomain(data.historical)}
          />
        ) : (
          <p className="py-8 text-center text-gray-400">
            {t('price.noHistoricalData')}
          </p>
        )}
      </div>
    </Section>
  )
}

export default PriceSeriesSection
