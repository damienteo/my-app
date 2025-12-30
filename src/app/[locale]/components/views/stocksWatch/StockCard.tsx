'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Stock {
  symbol: string
  name: string
  exchange: string
  market: string
}

interface StockQuote {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
  t: number
}

interface StockData {
  symbol: string
  quote: StockQuote | null
  historical: Array<{ date: string; price: number }> | null
  quoteTimestamp?: number
  historicalTimestamp?: number
}

interface StockCardProps {
  stock: Stock
  data: StockData | undefined
}

const StockCard: React.FC<StockCardProps> = ({ stock, data }) => {
  const t = useTranslations('StocksWatchPage')
  const quote = data?.quote
  const historical = data?.historical || []

  const formatPrice = (price: number | null): string => {
    if (price === null) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const formatPercent = (value: number | null): string => {
    if (value === null) return 'N/A'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getYAxisDomain = (data: Array<{ price: number }>): [number, number] => {
    if (data.length === 0) return [0, 100]
    const values = data.map((d) => d.price)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const padding = range * 0.1
    return [min - padding, max + padding]
  }

  const changeColor = quote && quote.dp >= 0 ? 'text-green-400' : 'text-red-400'

  // Calculate 52-week high/low from historical data
  const yearHighLow = React.useMemo(() => {
    if (historical.length === 0) return { high: null, low: null }
    const prices = historical.map((d) => d.price).filter((p) => p > 0)
    if (prices.length === 0) return { high: null, low: null }
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
    }
  }, [historical])

  return (
    <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white">{stock.name}</h3>
        <p className="text-sm text-gray-400">
          {stock.symbol} • {stock.exchange}
        </p>
      </div>

      {quote ? (
        <>
          <div className="mb-3">
            <p className="text-2xl font-bold text-white">
              {formatPrice(quote.c)}
            </p>
            <p className={`text-sm font-semibold ${changeColor}`}>
              {formatPrice(quote.d)} ({formatPercent(quote.dp)})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
            <div>
              <span className="text-gray-500">52W High:</span>{' '}
              {yearHighLow.high !== null
                ? formatPrice(yearHighLow.high)
                : formatPrice(quote.h)}
            </div>
            <div>
              <span className="text-gray-500">52W Low:</span>{' '}
              {yearHighLow.low !== null
                ? formatPrice(yearHighLow.low)
                : formatPrice(quote.l)}
            </div>
            <div>
              <span className="text-gray-500">Open:</span>{' '}
              {formatPrice(quote.o)}
            </div>
            <div>
              <span className="text-gray-500">Prev Close:</span>{' '}
              {formatPrice(quote.pc)}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-sm mb-3">{t('noData')}</p>
      )}

      {historical.length > 0 ? (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historical}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                style={{ fontSize: '10px' }}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '10px' }}
                domain={getYAxisDomain(historical)}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                dataKey="price"
                stroke={quote && quote.dp >= 0 ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-500 text-xs italic">{t('noHistoricalData')}</p>
      )}
    </div>
  )
}

export default StockCard
