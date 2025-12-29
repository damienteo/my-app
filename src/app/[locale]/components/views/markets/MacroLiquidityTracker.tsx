'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Section, Paragraph } from '../../common'

interface MacroData {
  rrp: number | null
  bankReserves: number | null
  fedBalanceSheet: number | null
  tga: number | null
  netLiquidity: number | null
  treasury10Y: number | null
  lastUpdated: string
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
  const [isExpanded, setIsExpanded] = useState(false)

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
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('rrp.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.rrp)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('rrp.description')}</p>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm text-gray-300 mb-1">
              {t('bankReserves.title')}
            </h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.bankReserves)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('bankReserves.description')}
            </p>
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
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          {t('lastUpdated')}: {new Date(data.lastUpdated).toLocaleString()}
        </p>

        {/* Collapsible Explanation Section */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-200 font-semibold">
              {t('explanation.title')}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
              {/* Traffic Light Explanation */}
              <div>
                <h3 className="text-lg font-bold text-gray-200 mb-3">
                  {t('explanation.trafficLight.title')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-200">
                        {t('explanation.trafficLight.green.title')}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {t('explanation.trafficLight.green.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-200">
                        {t('explanation.trafficLight.yellow.title')}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {t('explanation.trafficLight.yellow.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-200">
                        {t('explanation.trafficLight.red.title')}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {t('explanation.trafficLight.red.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Explanation */}
              <div>
                <h3 className="text-lg font-bold text-gray-200 mb-3">
                  {t('explanation.data.title')}
                </h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">
                      {t('explanation.data.netLiquidity.title')}
                    </p>
                    <p>{t('explanation.data.netLiquidity.description')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">
                      {t('explanation.data.rrp.title')}
                    </p>
                    <p>{t('explanation.data.rrp.description')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">
                      {t('explanation.data.bankReserves.title')}
                    </p>
                    <p>{t('explanation.data.bankReserves.description')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">
                      {t('explanation.data.fedBalanceSheet.title')}
                    </p>
                    <p>{t('explanation.data.fedBalanceSheet.description')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">
                      {t('explanation.data.tga.title')}
                    </p>
                    <p>{t('explanation.data.tga.description')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">
                      {t('explanation.data.treasury10Y.title')}
                    </p>
                    <p>{t('explanation.data.treasury10Y.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

export default MacroLiquidityTracker
