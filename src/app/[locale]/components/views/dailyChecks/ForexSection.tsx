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

type Period = '1week' | '1month' | '3months'

interface HistoricalDataPoint {
  date: string
  value: number
}

interface ForexData {
  current: {
    usdToSgd: number
    sgdToJpy: number
    usdToJpy: number
  }
  historical: {
    usdToSgd: HistoricalDataPoint[]
    sgdToJpy: HistoricalDataPoint[]
    usdToJpy: HistoricalDataPoint[]
  }
}

const ForexSection = () => {
  const t = useTranslations('DailyChecksPage.forex')
  const [period, setPeriod] = useState<Period>('1month')
  const [forex, setForex] = useState<ForexData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let abortController = new AbortController()

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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  if (loading) {
    return (
      <Section>
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

      {/* Period Selector */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['1week', '1month', '3months'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              if (period !== p) {
                setPeriod(p)
              }
            }}
            className={`px-4 py-2 rounded-full transition-colors font-medium ${
              period === p
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {p === '1week'
              ? t('periods.1week')
              : p === '1month'
              ? t('periods.1month')
              : t('periods.3months')}
          </button>
        ))}
      </div>

      {/* Current Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">{t('rates.usdToSgd')}</p>
          <p className="text-2xl font-bold text-white">
            {forex.current.usdToSgd.toFixed(4)}
          </p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">{t('rates.sgdToJpy')}</p>
          <p className="text-2xl font-bold text-white">
            {forex.current.sgdToJpy.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">{t('rates.usdToJpy')}</p>
          <p className="text-2xl font-bold text-white">
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
              startDate: formatDate(forex.historical.usdToSgd[0].date),
              endDate: formatDate(
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forex.historical.usdToSgd}>
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
                  tickFormatter={(value) => value.toFixed(4)}
                  domain={getYAxisDomain(forex.historical.usdToSgd)}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? value.toFixed(4) : 'N/A'
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

        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            {t('rates.sgdToJpy')}
          </h3>
          {forex.historical.sgdToJpy.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forex.historical.sgdToJpy}>
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
                  tickFormatter={(value) => value.toFixed(2)}
                  domain={getYAxisDomain(forex.historical.sgdToJpy)}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? value.toFixed(2) : 'N/A'
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
                  stroke="#10B981"
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

        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            {t('rates.usdToJpy')}
          </h3>
          {forex.historical.usdToJpy.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forex.historical.usdToJpy}>
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
                  tickFormatter={(value) => value.toFixed(2)}
                  domain={getYAxisDomain(forex.historical.usdToJpy)}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? value.toFixed(2) : 'N/A'
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
                  stroke="#F59E0B"
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
      </div>
    </Section>
  )
}

export default ForexSection
