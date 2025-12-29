'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Section, Paragraph } from '../../common'

interface HistoricalDataPoint {
  date: string
  value: number
}

interface MacroData {
  rrp: number | null
  bankReserves: number | null
  fedBalanceSheet: number | null
  tga: number | null
  netLiquidity: number | null
  treasury10Y: number | null
  sofr: number | null
  iorb: number | null
  sofrIorbSpread: number | null
  highYieldSpreads: number | null
  vix: number | null
  netLiquidityZScore: number | null
  redLines?: {
    bankReserves: boolean
    rrp: boolean
    sofrSpread: boolean
    netLiquidityZScore: boolean
  }
  lastUpdated: string
  historical?: {
    rrp: HistoricalDataPoint[]
    bankReserves: HistoricalDataPoint[]
    fedBalanceSheet: HistoricalDataPoint[]
    tga: HistoricalDataPoint[]
    treasury10Y: HistoricalDataPoint[]
    netLiquidity: HistoricalDataPoint[]
    sofr: HistoricalDataPoint[]
    iorb: HistoricalDataPoint[]
    sofrIorbSpread: HistoricalDataPoint[]
    highYieldSpreads: HistoricalDataPoint[]
    vix: HistoricalDataPoint[]
  }
}

const formatCurrency = (value: number | null): string => {
  if (value === null) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(2)}`
}

const formatPercent = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

const formatBasisPoints = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)} bps`
}

// Calculate proximity to red line threshold (0-100%, where 100% = at threshold)
const calculateProximity = (
  current: number | null,
  threshold: number,
  isLowerBetter: boolean = false
): number | null => {
  if (current === null) return null

  if (isLowerBetter) {
    // For metrics where lower is better (e.g., Z-Score where -2.0 is threshold)
    // Calculate how close we are to the threshold from above
    // If threshold is -2.0 and current is -1.35, we're 67.5% of the way there
    const range = 0 - threshold // e.g., 0 - (-2.0) = 2.0
    if (range === 0) return null
    const distance = current - threshold // e.g., -1.35 - (-2.0) = 0.65
    return Math.max(0, Math.min(100, (1 - distance / range) * 100))
  } else {
    // For metrics where higher is better (e.g., Bank Reserves, RRP)
    // Calculate how close we are to the threshold from below
    if (threshold === 0) return null
    return Math.max(0, Math.min(100, (current / threshold) * 100))
  }
}

// Get color based on proximity
const getProximityColor = (proximity: number | null): string => {
  if (proximity === null) return 'bg-gray-600'
  if (proximity >= 100) return 'bg-red-500'
  if (proximity >= 80) return 'bg-yellow-500'
  if (proximity >= 60) return 'bg-yellow-400'
  return 'bg-green-500'
}

// Proximity indicator component
const ProximityIndicator: React.FC<{
  current: number | null
  threshold: number
  isLowerBetter?: boolean
  formatValue: (val: number | null) => string
  proximityLabel: string
  thresholdLabel: string
}> = ({
  current,
  threshold,
  isLowerBetter = false,
  formatValue,
  proximityLabel,
  thresholdLabel,
}) => {
  const proximity = calculateProximity(current, threshold, isLowerBetter)

  if (proximity === null) return null

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400">
          {proximityLabel}: {proximity.toFixed(0)}%
        </span>
        <span className="text-gray-400">
          {thresholdLabel}: {formatValue(threshold)}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getProximityColor(
            proximity
          )}`}
          style={{ width: `${Math.min(100, proximity)}%` }}
        />
      </div>
    </div>
  )
}

// Format date for chart display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

// Format chart value for tooltip
const formatChartValue = (
  value: number,
  isPercent: boolean = false
): string => {
  if (isPercent) return `${value.toFixed(2)}%`
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(0)}`
}

const getTrafficLightColor = (
  netLiquidity: number | null
): 'red' | 'yellow' | 'green' => {
  if (netLiquidity === null) return 'yellow'

  // These thresholds are examples - adjust based on your analysis
  // Typically, lower net liquidity indicates tighter conditions
  if (netLiquidity < 2e12) return 'red' // Critical
  if (netLiquidity < 3e12) return 'yellow' // Warning
  return 'green' // Healthy
}

const MacroLiquidityTracker: React.FunctionComponent = () => {
  const t = useTranslations('MarketsPage.MacroTracker')
  const [data, setData] = useState<MacroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/macro-data')

        if (!response.ok) {
          throw new Error('Failed to fetch macro data')
        }

        const macroData: MacroData = await response.json()
        setData(macroData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Section>
        <Paragraph>{t('loading')}</Paragraph>
      </Section>
    )
  }

  if (error || !data) {
    return (
      <Section>
        <Paragraph className="text-red-400">{error || t('error')}</Paragraph>
      </Section>
    )
  }

  const trafficLightColor = getTrafficLightColor(data.netLiquidity)

  return (
    <Section>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-300">{t('title')}</h2>
        <p className="text-sm text-gray-300 mb-6">{t('description')}</p>

        {/* Traffic Light Indicator */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full border-4 border-gray-600 ${
                trafficLightColor === 'red'
                  ? 'bg-red-500'
                  : trafficLightColor === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            />
            <span className="mt-2 text-sm font-semibold text-gray-200">
              {trafficLightColor === 'red'
                ? t('status.critical')
                : trafficLightColor === 'yellow'
                ? t('status.warning')
                : t('status.healthy')}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-gray-200">
              {t('netLiquidity.title')}
            </h3>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data.netLiquidity)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('netLiquidity.formula')}
            </p>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 bg-gray-800 rounded-lg border ${
              data.redLines?.rrp ? 'border-red-500 border-2' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-300">
                {t('rrp.title')}
              </h3>
              {data.redLines?.rrp && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                  {t('redLine.warning')}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.rrp)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('rrp.description')}</p>
            <ProximityIndicator
              current={data.rrp}
              threshold={50e9}
              formatValue={formatCurrency}
              proximityLabel={t('redLine.proximity')}
              thresholdLabel={t('redLine.threshold')}
            />
            {data.redLines?.rrp && (
              <p className="text-xs text-red-400 mt-1">
                {t('redLine.rrp.threshold')}
              </p>
            )}
          </div>

          <div
            className={`p-4 bg-gray-800 rounded-lg border ${
              data.redLines?.bankReserves
                ? 'border-red-500 border-2'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-300">
                {t('bankReserves.title')}
              </h3>
              {data.redLines?.bankReserves && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                  {t('redLine.warning')}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.bankReserves)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('bankReserves.description')}
            </p>
            <ProximityIndicator
              current={data.bankReserves}
              threshold={2.7e12}
              formatValue={formatCurrency}
              proximityLabel={t('redLine.proximity')}
              thresholdLabel={t('redLine.threshold')}
            />
            {data.redLines?.bankReserves && (
              <p className="text-xs text-red-400 mt-1">
                {t('redLine.bankReserves.threshold')}
              </p>
            )}
          </div>

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('fedBalanceSheet.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.fedBalanceSheet)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('fedBalanceSheet.description')}
            </p>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('tga.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.tga)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('tga.description')}</p>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('treasury10Y.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatPercent(data.treasury10Y)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('treasury10Y.description')}
            </p>
          </div>

          {/* Early Warning Signals */}
          <div
            className={`p-4 bg-gray-800 rounded-lg border ${
              data.redLines?.sofrSpread
                ? 'border-red-500 border-2'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-300">
                {t('sofrIorbSpread.title')}
              </h3>
              {data.redLines?.sofrSpread && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                  {t('redLine.warning')}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {formatBasisPoints(data.sofrIorbSpread)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('sofrIorbSpread.description')}
            </p>
            <ProximityIndicator
              current={data.sofrIorbSpread}
              threshold={20}
              formatValue={(val) => `${val?.toFixed(0) || 0} bps`}
              proximityLabel={t('redLine.proximity')}
              thresholdLabel={t('redLine.threshold')}
            />
            {data.redLines?.sofrSpread && (
              <p className="text-xs text-red-400 mt-1">
                {t('redLine.sofrSpread.threshold')}
              </p>
            )}
          </div>

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('highYieldSpreads.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatBasisPoints(data.highYieldSpreads)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('highYieldSpreads.description')}
            </p>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('vix.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {data.vix !== null ? data.vix.toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('vix.description')}</p>
          </div>

          {data.netLiquidityZScore !== null && (
            <div
              className={`p-4 bg-gray-800 rounded-lg border ${
                data.redLines?.netLiquidityZScore
                  ? 'border-red-500 border-2'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm text-gray-300">
                  {t('netLiquidityZScore.title')}
                </h3>
                {data.redLines?.netLiquidityZScore && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    {t('redLine.warning')}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white">
                {data.netLiquidityZScore.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('netLiquidityZScore.description')}
              </p>
              <ProximityIndicator
                current={data.netLiquidityZScore}
                threshold={-2.0}
                isLowerBetter={true}
                formatValue={(val) => val?.toFixed(1) || '0.0'}
                proximityLabel={t('redLine.proximity')}
                thresholdLabel={t('redLine.threshold')}
              />
              {data.redLines?.netLiquidityZScore && (
                <p className="text-xs text-red-400 mt-1">
                  {t('redLine.netLiquidityZScore.threshold')}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          {t('lastUpdated')}: {new Date(data.lastUpdated).toLocaleString()}
        </p>

        {/* Historical Charts Section */}
        {data.historical && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-200 mb-4">
              {t('charts.title')}
            </h3>

            {/* Net Liquidity Chart */}
            {data.historical.netLiquidity.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.netLiquidity')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.netLiquidity}>
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
                      tickFormatter={(value) => formatChartValue(value)}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : 'N/A'
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
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300 mb-3">
                    <span className="font-semibold">
                      {t('explanation.data.netLiquidity.title')}:
                    </span>{' '}
                    {t('explanation.data.netLiquidity.description')}
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-300">
                      {t('explanation.trafficLight.title')}:
                    </p>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-semibold text-gray-300">
                            {t('explanation.trafficLight.green.title')}:
                          </span>{' '}
                          {t('explanation.trafficLight.green.description')}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-semibold text-gray-300">
                            {t('explanation.trafficLight.yellow.title')}:
                          </span>{' '}
                          {t('explanation.trafficLight.yellow.description')}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-semibold text-gray-300">
                            {t('explanation.trafficLight.red.title')}:
                          </span>{' '}
                          {t('explanation.trafficLight.red.description')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fed Balance Sheet Chart */}
            {data.historical.fedBalanceSheet.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.fedBalanceSheet')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.fedBalanceSheet}>
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
                      tickFormatter={(value) => formatChartValue(value)}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : 'N/A'
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
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">
                      {t('explanation.data.fedBalanceSheet.title')}:
                    </span>{' '}
                    {t('explanation.data.fedBalanceSheet.description')}
                  </p>
                </div>
              </div>
            )}

            {/* Bank Reserves Chart */}
            {data.historical.bankReserves.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.bankReserves')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.bankReserves}>
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
                      tickFormatter={(value) => formatChartValue(value)}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : 'N/A'
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
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">
                      {t('explanation.data.bankReserves.title')}:
                    </span>{' '}
                    {t('explanation.data.bankReserves.description')}
                  </p>
                </div>
              </div>
            )}

            {/* Reverse Repo Chart */}
            {data.historical.rrp.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.rrp')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.rrp}>
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
                      tickFormatter={(value) => formatChartValue(value)}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : 'N/A'
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
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">
                      {t('explanation.data.rrp.title')}:
                    </span>{' '}
                    {t('explanation.data.rrp.description')}
                  </p>
                </div>
              </div>
            )}

            {/* Treasury General Account Chart */}
            {data.historical.tga.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.tga')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.tga}>
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
                      tickFormatter={(value) => formatChartValue(value)}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : 'N/A'
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
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">
                      {t('explanation.data.tga.title')}:
                    </span>{' '}
                    {t('explanation.data.tga.description')}
                  </p>
                </div>
              </div>
            )}

            {/* 10-Year Treasury Yield Chart */}
            {data.historical.treasury10Y.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.treasury10Y')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.treasury10Y}>
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
                      tickFormatter={(value) => formatPercent(value)}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatPercent(value) : 'N/A'
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
                      stroke="#06B6D4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">
                      {t('explanation.data.treasury10Y.title')}:
                    </span>{' '}
                    {t('explanation.data.treasury10Y.description')}
                  </p>
                </div>
              </div>
            )}

            {/* SOFR-IORB Spread Chart */}
            {data.historical.sofrIorbSpread &&
              data.historical.sofrIorbSpread.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-lg font-semibold text-gray-200 mb-4">
                    {t('charts.sofrIorbSpread')}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.historical.sofrIorbSpread}>
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
                        tickFormatter={(value) => `${value.toFixed(0)} bps`}
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value !== undefined ? formatBasisPoints(value) : 'N/A'
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
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">
                        {t('explanation.data.sofrIorbSpread.title')}:
                      </span>{' '}
                      {t('explanation.data.sofrIorbSpread.description')}
                    </p>
                  </div>
                </div>
              )}

            {/* High Yield Credit Spreads Chart */}
            {data.historical.highYieldSpreads &&
              data.historical.highYieldSpreads.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-lg font-semibold text-gray-200 mb-4">
                    {t('charts.highYieldSpreads')}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.historical.highYieldSpreads}>
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
                        tickFormatter={(value) => `${value.toFixed(0)} bps`}
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value !== undefined ? formatBasisPoints(value) : 'N/A'
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
                        stroke="#EC4899"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">
                        {t('explanation.data.highYieldSpreads.title')}:
                      </span>{' '}
                      {t('explanation.data.highYieldSpreads.description')}
                    </p>
                  </div>
                </div>
              )}

            {/* VIX Chart */}
            {data.historical.vix && data.historical.vix.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                  {t('charts.vix')}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.vix}>
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
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
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
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">
                      {t('explanation.data.vix.title')}:
                    </span>{' '}
                    {t('explanation.data.vix.description')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}

export default MacroLiquidityTracker
