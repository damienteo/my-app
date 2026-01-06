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

interface SP500Data {
  current: {
    price: number
    change: number
    changePercent: number
  }
  historical: HistoricalDataPoint[]
  source?: string // 'Yahoo Finance' or 'FRED'
  rateLimited?: boolean
}

const SP500Section = () => {
  const t = useTranslations('DailyChecksPage.sp500')
  const [period, setPeriod] = useState<Period>('1month')
  const [sp500, setSp500] = useState<SP500Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let abortController = new AbortController()

    const fetchSP500 = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/sp500?period=${period}`, {
          signal: abortController.signal,
        })
        if (!res.ok) {
          throw new Error('Failed to fetch S&P 500 data')
        }
        const data = await res.json()
        // Only update state if component is still mounted and period hasn't changed
        if (isMounted) {
          setSp500(data)
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

    fetchSP500()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [period])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatPrice = (price: number): string => {
    return price.toFixed(2)
  }

  // Calculate Y-axis domain based on data range
  const getYAxisDomain = (data: HistoricalDataPoint[]): [number, number] => {
    if (data.length === 0) return [0, 100]
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const padding = range * 0.1 // 10% padding on each side
    return [min - padding, max + padding]
  }

  // Show full loading component only on initial load (no data)
  if (loading && !sp500) {
    return (
      <Section>
        <p className="text-gray-300">{t('loading')}</p>
      </Section>
    )
  }

  // Show error only if no data exists
  if (error && !sp500) {
    // Check if it's a rate limit error
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

  // If no data but not loading/error, show nothing
  if (!sp500) {
    return null
  }

  const isPositive = sp500.current.change >= 0

  return (
    <Section className="relative">
      {/* Loading overlay for subsequent loads */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2 bg-gray-800/90 px-4 py-3 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-300">{t('loading')}</p>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('title')}</h2>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2 flex-wrap justify-center sm:justify-start">
        {(['1week', '1month', '3months', '6months', '1year'] as Period[]).map(
          (p) => (
            <button
              key={p}
              onClick={() => {
                if (period !== p) {
                  setPeriod(p)
                }
              }}
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

      {/* Current Price */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
          <p className="text-sm text-gray-400">{t('currentPrice')}</p>
          {sp500.source && (
            <p className="text-xs text-gray-500 italic">
              {t('dataSource')}: {sp500.source}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {formatPrice(sp500.current.price)}
          </p>
          <div
            className={`text-base sm:text-lg font-semibold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatPrice(sp500.current.change)} ({isPositive ? '+' : ''}
            {sp500.current.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">
          {t('chartTitle')}
        </h3>
        {sp500.historical.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sp500.historical}>
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
                domain={getYAxisDomain(sp500.historical)}
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
                stroke="#3B82F6"
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

export default SP500Section
