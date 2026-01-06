'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Section } from '../../common'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Period = '1week' | '1month' | '3months' | '6months' | '1year'

interface HistoricalDataPoint {
  date: string
  value: number
}

interface GoldData {
  current: {
    price: number
    change: number
    changePercent: number
  }
  historical: HistoricalDataPoint[]
  source?: string
  rateLimited?: boolean
}

const GoldSection = () => {
  const t = useTranslations('DailyChecksPage.gold')
  const [period, setPeriod] = useState<Period>('1month')
  const [gold, setGold] = useState<GoldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let abortController = new AbortController()

    const fetchGold = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/gold?period=${period}`, {
          signal: abortController.signal,
        })
        if (!res.ok) throw new Error('Failed to fetch gold data')
        const data = await res.json()
        if (isMounted) setGold(data)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError' && isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchGold()
    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [period])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const formatPrice = (price: number) => price.toFixed(2)

  const getYAxisDomain = (data: HistoricalDataPoint[]): [number, number] => {
    if (data.length === 0) return [0, 100]
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const padding = range * 0.1
    return [min - padding, max + padding]
  }

  if (loading && !gold) {
    return (
      <Section>
        <p className="text-gray-300">{t('loading')}</p>
      </Section>
    )
  }

  if (error && !gold) {
    const isRateLimit =
      error?.toLowerCase().includes('rate limit') || error?.includes('429')
    return (
      <Section>
        {isRateLimit ? (
          <div>
            <p className="text-yellow-400 mb-2">{t('rateLimitError')}</p>
            <p className="text-sm text-gray-400">{t('rateLimitMessage')}</p>
          </div>
        ) : (
          <p className="text-red-400">{error || t('error')}</p>
        )}
      </Section>
    )
  }

  if (!gold) return null

  const isPositive = gold.current.change >= 0

  return (
    <Section className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2 bg-gray-800/90 px-4 py-3 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-300">{t('loading')}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('title')}</h2>

      <div className="mb-6 flex gap-2 flex-wrap justify-center sm:justify-start">
        {(['1week', '1month', '3months', '6months', '1year'] as Period[]).map(
          (p) => (
            <button
              key={p}
              onClick={() => period !== p && setPeriod(p)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full transition-colors font-medium ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {p === '1week'
                ? t('periods.1week')
                : p === '1month'
                ? t('periods.1month')
                : p === '3months'
                ? t('periods.3months')
                : p === '6months'
                ? t('periods.6months')
                : t('periods.1year')}
            </button>
          )
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
          <p className="text-sm text-gray-400">{t('currentPrice')}</p>
          {gold.source && (
            <p className="text-xs text-gray-500 italic">
              {t('dataSource')}: {gold.source}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {formatPrice(gold.current.price)}
          </p>
          <div
            className={`text-base sm:text-lg font-semibold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatPrice(gold.current.change)} ({isPositive ? '+' : ''}
            {gold.current.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">
          {t('chartTitle')}
        </h3>
        {gold.historical.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gold.historical}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatPrice(value)}
                domain={getYAxisDomain(gold.historical)}
              />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? formatPrice(value) : 'N/A'
                }
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                  color: '#F3F4F6',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FBBF24"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">
            {t('noHistoricalData')}
          </p>
        )}
      </div>
    </Section>
  )
}

export default GoldSection

