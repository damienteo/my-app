'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Stock } from '../../../../../../constants'

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

interface StockFinancials {
  peRatio: number | null
  marketCap: number | null
  cash: number | null
  totalCash: number | null
  freeCashFlow: number | null
  trailingPE?: number | null
  forwardPE?: number | null
}

interface QuarterlyEarnings {
  date: string
  revenue: number | null
  earnings: number | null
}

interface StockData {
  symbol: string
  quote: StockQuote | null
  historical: Array<{ date: string; price: number }> | null
  financials: StockFinancials | null
  earnings: QuarterlyEarnings[] | null
  quoteTimestamp?: number
  historicalTimestamp?: number
  financialsTimestamp?: number
  earningsTimestamp?: number
}

interface StockCardProps {
  stock: Stock
  data: StockData | undefined
}

const StockCard: React.FC<StockCardProps> = ({ stock, data }) => {
  const t = useTranslations('StocksWatchPage')
  const quote = data?.quote
  const historical = data?.historical || []
  const apiFinancials = data?.financials || null
  const earnings = data?.earnings || []

  const formatPrice = (price: number | null): string => {
    if (price === null) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const formatPercent = (value: number | null): string => {
    if (value === null) return 'N/A'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Format large numbers (cash, market cap) to readable format
  const formatLargeNumber = (value: number | null): string => {
    if (value === null || value === 0) return 'N/A'
    if (value >= 1_000_000_000_000) {
      return `~$${(value / 1_000_000_000_000).toFixed(1)}T`
    } else if (value >= 1_000_000_000) {
      return `~$${(value / 1_000_000_000).toFixed(1)}B`
    } else if (value >= 1_000_000) {
      return `~$${(value / 1_000_000).toFixed(0)}M`
    } else {
      return `~$${value.toFixed(0)}`
    }
  }

  // Get financial data: use API data only, show N/A if unavailable
  const getFinancials = () => {
    // Use API financials only - no hardcoded fallback
    const apiPeRatio =
      apiFinancials?.peRatio ?? apiFinancials?.trailingPE ?? null
    const apiCash = apiFinancials?.totalCash ?? apiFinancials?.cash ?? null

    return {
      peRatio: apiPeRatio !== null ? apiPeRatio : null,
      cash: apiCash !== null ? formatLargeNumber(apiCash) : null,
    }
  }

  const financials = getFinancials()

  // Format earnings/revenue for chart (in millions)
  const formatEarningsValue = (value: number | null): number => {
    if (value === null) return 0
    return value / 1_000_000 // Convert to millions
  }

  // Format quarter label (e.g., "4Q2024" -> "Q4 FY24")
  const formatQuarterLabel = (dateStr: string): string => {
    // Format: "4Q2024" -> "Q4 FY24"
    const match = dateStr.match(/(\d)Q(\d{4})/)
    if (match) {
      const quarter = match[1]
      const year = match[2]
      const shortYear = year.slice(-2)
      return `Q${quarter} FY${shortYear}`
    }
    return dateStr
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

      {/* Financial Information */}
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('financials.cash')}:</span>
            <span className="text-gray-300">{financials.cash || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('financials.peRatio')}:</span>
            <span className="text-gray-300">
              {financials.peRatio !== null && financials.peRatio !== undefined
                ? typeof financials.peRatio === 'number'
                  ? financials.peRatio.toFixed(1) + 'x'
                  : financials.peRatio
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings vs Revenue Chart */}
      {earnings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-300">
              {t('earnings.title')}
            </h4>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={earnings.map((e) => ({
                  date: formatQuarterLabel(e.date),
                  revenue: formatEarningsValue(e.revenue),
                  earnings: formatEarningsValue(e.earnings),
                }))}
                margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '10px' }}
                  tickFormatter={(value) => `$${value}M`}
                />
                <Tooltip
                  formatter={(
                    value: number | undefined,
                    name: string | undefined
                  ) => {
                    if (value === undefined) return 'N/A'
                    const label =
                      name === 'revenue'
                        ? t('earnings.revenue')
                        : t('earnings.earnings')
                    return [`$${value.toFixed(2)}M`, label]
                  }}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    color: '#F3F4F6',
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === 'revenue'
                      ? t('earnings.revenue')
                      : t('earnings.earnings')
                  }
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  name="revenue"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="earnings"
                  fill="#F97316"
                  name="earnings"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(() => {
        // Convert symbol to translation key format (replace "." with "_")
        const translationKey = stock.symbol.replace(/\./g, '_')
        const description = t(`descriptions.${translationKey}` as any)
        return (
          description && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          )
        )
      })()}
    </div>
  )
}

export default StockCard
