'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Section } from '../components/common'
import StockCategorySection from '../components/views/stocksWatch/StockCategorySection'
import {
  aiRoboticsCategories,
  magnificent7Categories,
  powerHungryCategories,
  longevityCategories,
  hedgeCategories,
  StockCategory,
  Stock,
} from '../../../../constants'

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

// Cache TTLs
const CACHE_TTL_QUOTES = 60 * 1000 // 1 minute
const CACHE_TTL_HISTORICAL = 60 * 60 * 1000 // 1 hour
const CACHE_TTL_FINANCIALS = 60 * 60 * 1000 // 1 hour (financial data changes less frequently)
const CACHE_TTL_EARNINGS = 60 * 60 * 1000 // 1 hour (earnings data changes less frequently)

// Rate limit tracking
const RATE_LIMIT_WARNING_THRESHOLD = 50 // Warn at 50 calls/min
let apiCallCount = 0
let apiCallWindowStart = Date.now()

const StocksWatchClient = () => {
  const t = useTranslations('StocksWatchPage')
  const period = '1year' as const // Fixed to 1 year
  const [stockData, setStockData] = useState<Record<string, StockData>>({})
  const [loading, setLoading] = useState(true)
  const [loadingHistorical, setLoadingHistorical] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Get all symbols from all sections, removing duplicates
  const allSymbols = [
    ...aiRoboticsCategories,
    ...magnificent7Categories,
    ...powerHungryCategories,
    ...longevityCategories,
    ...hedgeCategories,
  ].flatMap((category) => category.stocks.map((stock) => stock.symbol))
  const uniqueSymbols = Array.from(new Set(allSymbols))

  // Track API calls for rate limiting
  const trackApiCall = useCallback(() => {
    const now = Date.now()
    // Reset counter if window expired (1 minute)
    if (now - apiCallWindowStart > 60 * 1000) {
      apiCallCount = 0
      apiCallWindowStart = now
    }
    apiCallCount++

    if (apiCallCount >= RATE_LIMIT_WARNING_THRESHOLD) {
      setRateLimitWarning(true)
    } else {
      setRateLimitWarning(false)
    }
  }, [])

  // Check cache validity
  const isCacheValid = useCallback(
    (timestamp: number | undefined, ttl: number): boolean => {
      if (!timestamp) return false
      return Date.now() - timestamp < ttl
    },
    []
  )

  // Fetch quotes
  const fetchQuotes = useCallback(
    async (force = false) => {
      try {
        setError(null)
        if (loading) setLoadingStep('quotes')

        // Check cache first
        const cachedData = localStorage.getItem('stocks_quotes')
        if (!force && cachedData) {
          const parsed = JSON.parse(cachedData)
          const cacheTime = parsed.timestamp || 0

          if (isCacheValid(cacheTime, CACHE_TTL_QUOTES)) {
            setStockData((prev) => {
              const updated = { ...prev }
              Object.keys(parsed.quotes).forEach((symbol) => {
                updated[symbol] = {
                  ...updated[symbol],
                  symbol,
                  quote: parsed.quotes[symbol],
                  quoteTimestamp: cacheTime,
                }
              })
              return updated
            })
            setLastRefresh(new Date(cacheTime))
            return
          }
        }

        trackApiCall()
        const symbolsParam = uniqueSymbols.join(',')
        // Route-side caching handles this (60s cache on server via revalidate)
        const res = await fetch(`/api/stocks/quotes?symbols=${symbolsParam}`)

        if (!res.ok) {
          throw new Error('Failed to fetch stock quotes')
        }

        const data = await res.json()
        const timestamp = Date.now()

        // Update cache
        localStorage.setItem(
          'stocks_quotes',
          JSON.stringify({
            quotes: data.quotes,
            timestamp,
          })
        )

        // Update state
        setStockData((prev) => {
          const updated = { ...prev }
          Object.keys(data.quotes).forEach((symbol) => {
            updated[symbol] = {
              ...updated[symbol],
              symbol,
              quote: data.quotes[symbol],
              quoteTimestamp: timestamp,
            }
          })
          return updated
        })
        setLastRefresh(new Date())
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    },
    [uniqueSymbols.join(','), isCacheValid, trackApiCall]
  )

  // Fetch historical data
  const fetchHistorical = useCallback(
    async (force = false) => {
      console.log(`fetchHistorical called: force=${force}`)
      try {
        setLoadingHistorical(true)
        if (loading) setLoadingStep('historical')

        // Check cache first
        const cacheKey = 'stocks_historical'
        const cachedData = localStorage.getItem(cacheKey)

        if (!force && cachedData) {
          const parsed = JSON.parse(cachedData)
          const cacheTime = parsed.timestamp || 0

          if (isCacheValid(cacheTime, CACHE_TTL_HISTORICAL)) {
            // Check if cached data actually has historical data
            const hasData =
              parsed.historical &&
              Object.values(parsed.historical).some(
                (h: any) => h && Array.isArray(h) && h.length > 0
              )

            if (hasData) {
              console.log('Using cached historical data')
              setStockData((prev) => {
                const updated = { ...prev }
                Object.keys(parsed.historical).forEach((symbol) => {
                  updated[symbol] = {
                    ...updated[symbol],
                    symbol,
                    historical: parsed.historical[symbol],
                    historicalTimestamp: cacheTime,
                  }
                })
                return updated
              })
              setLoadingHistorical(false)
              return
            } else {
              console.log('Cached historical data is empty, fetching new data')
            }
          } else {
            console.log('Cache expired, fetching new historical data')
          }
        } else {
          console.log('No cache or force=true, fetching historical data')
        }

        trackApiCall()
        const symbolsParam = uniqueSymbols.join(',')
        console.log(
          `Fetching historical data for symbols: ${symbolsParam}, period: ${period}`
        )
        const res = await fetch(
          `/api/stocks/historical?symbols=${symbolsParam}&period=${period}`
        )

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error')
          console.warn(
            `Failed to fetch historical data: Status ${res.status}, ${errorText}`
          )
          setLoadingHistorical(false)
          return
        }

        const data = await res.json()
        console.log('Historical data received:', {
          symbols: Object.keys(data.historical || {}),
          dataPoints: Object.values(data.historical || {}).map(
            (h: any) => h?.length || 0
          ),
        })
        const timestamp = Date.now()

        // Update cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            historical: data.historical,
            timestamp,
          })
        )

        // Update state
        setStockData((prev) => {
          const updated = { ...prev }
          Object.keys(data.historical).forEach((symbol) => {
            updated[symbol] = {
              ...updated[symbol],
              symbol,
              historical: data.historical[symbol],
              historicalTimestamp: timestamp,
            }
          })
          return updated
        })
      } catch (err) {
        console.warn('Error fetching historical data:', err)
      } finally {
        setLoadingHistorical(false)
      }
    },
    [uniqueSymbols.join(','), period, isCacheValid, trackApiCall]
  )

  // Fetch financial data
  const fetchFinancials = useCallback(
    async (force = false) => {
      try {
        // Check cache first
        const cacheKey = 'stocks_financials'
        const cachedData = localStorage.getItem(cacheKey)

        if (!force && cachedData) {
          const parsed = JSON.parse(cachedData)
          const cacheTime = parsed.timestamp || 0

          if (isCacheValid(cacheTime, CACHE_TTL_FINANCIALS)) {
            setStockData((prev) => {
              const updated = { ...prev }
              Object.keys(parsed.financials).forEach((symbol) => {
                updated[symbol] = {
                  ...updated[symbol],
                  symbol,
                  financials: parsed.financials[symbol],
                  financialsTimestamp: cacheTime,
                }
              })
              return updated
            })
            return
          }
        }

        trackApiCall()
        const symbolsParam = uniqueSymbols.join(',')
        const res = await fetch(
          `/api/stocks/financials?symbols=${symbolsParam}`
        )

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error')
          console.warn(
            `Failed to fetch financial data: Status ${res.status}, ${errorText}`
          )
          return
        }

        const data = await res.json()
        const timestamp = Date.now()

        // Update cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            financials: data.financials,
            timestamp,
          })
        )

        // Update state
        setStockData((prev) => {
          const updated = { ...prev }
          Object.keys(data.financials).forEach((symbol) => {
            updated[symbol] = {
              ...updated[symbol],
              symbol,
              financials: data.financials[symbol],
              financialsTimestamp: timestamp,
            }
          })
          return updated
        })
      } catch (err) {
        console.warn('Error fetching financial data:', err)
      }
    },
    [uniqueSymbols.join(','), isCacheValid, trackApiCall]
  )

  // Fetch earnings data
  const fetchEarnings = useCallback(
    async (force = false) => {
      try {
        if (loading) setLoadingStep('earnings')
        // Check cache first
        const cacheKey = 'stocks_earnings'
        const cachedData = localStorage.getItem(cacheKey)

        if (!force && cachedData) {
          const parsed = JSON.parse(cachedData)
          const cacheTime = parsed.timestamp || 0

          if (isCacheValid(cacheTime, CACHE_TTL_EARNINGS)) {
            setStockData((prev) => {
              const updated = { ...prev }
              Object.keys(parsed.earnings).forEach((symbol) => {
                updated[symbol] = {
                  ...updated[symbol],
                  symbol,
                  earnings: parsed.earnings[symbol],
                  earningsTimestamp: cacheTime,
                }
              })
              return updated
            })
            return
          }
        }

        trackApiCall()
        const symbolsParam = uniqueSymbols.join(',')
        const res = await fetch(`/api/stocks/earnings?symbols=${symbolsParam}`)

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error')
          console.warn(
            `Failed to fetch earnings data: Status ${res.status}, ${errorText}`
          )
          return
        }

        const data = await res.json()
        const timestamp = Date.now()

        // Update cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            earnings: data.earnings,
            timestamp,
          })
        )

        // Update state
        setStockData((prev) => {
          const updated = { ...prev }
          Object.keys(data.earnings).forEach((symbol) => {
            updated[symbol] = {
              ...updated[symbol],
              symbol,
              earnings: data.earnings[symbol],
              earningsTimestamp: timestamp,
            }
          })
          return updated
        })
      } catch (err) {
        console.warn('Error fetching earnings data:', err)
      }
    },
    [uniqueSymbols.join(','), isCacheValid, trackApiCall]
  )

  // Initial load - quotes, historical data, financials, and earnings
  useEffect(() => {
    let isMounted = true

    const loadInitial = async () => {
      setLoading(true)
      setCompletedSteps([])

      setLoadingStep('quotes')
      await fetchQuotes()
      if (isMounted) setCompletedSteps(['quotes'])

      setLoadingStep('historical')
      await fetchHistorical()
      if (isMounted) setCompletedSteps(['quotes', 'historical'])

      setLoadingStep('financials')
      await fetchFinancials()
      if (isMounted) setCompletedSteps(['quotes', 'historical', 'financials'])

      setLoadingStep('earnings')
      await fetchEarnings()
      if (isMounted) {
        setCompletedSteps(['quotes', 'historical', 'financials', 'earnings'])
        setLoadingStep(null)
        setLoading(false)
      }
    }

    loadInitial()

    return () => {
      isMounted = false
    }
  }, [fetchQuotes, fetchHistorical, fetchFinancials, fetchEarnings])

  // Auto-refresh quotes every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuotes()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchQuotes])

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    // Clear client-side cache
    localStorage.removeItem('stocks_quotes')
    localStorage.removeItem('stocks_historical')
    localStorage.removeItem('stocks_financials')
    localStorage.removeItem('stocks_earnings')

    fetchQuotes(true)
    fetchHistorical(true)
    fetchFinancials(true)
    fetchEarnings(true)
  }, [fetchQuotes, fetchHistorical, fetchFinancials, fetchEarnings])

  if (loading) {
    const getLoadingMessage = () => {
      if (!loadingStep) return t('loading')
      return t(`loadingSteps.${loadingStep}` as any, { default: t('loading') })
    }

    const allSteps = ['quotes', 'historical', 'financials', 'earnings']
    const getStepLabel = (step: string) => {
      return t(`loadingSteps.${step}` as any, { default: step })
    }

    return (
      <div className="flex flex-col max-w-6xl px-4 sm:px-6 mx-auto py-8">
        <Section>
          <div className="flex flex-col items-center justify-center py-12">
            {/* Spinner */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>

            {/* Current loading message */}
            <p className="text-gray-300 text-lg font-medium mb-6">
              {getLoadingMessage()}
            </p>

            {/* Progress steps */}
            <div className="w-full max-w-md space-y-2">
              {allSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(step)
                const isCurrent = loadingStep === step
                const isPending = !isCompleted && !isCurrent

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isCompleted
                        ? 'bg-green-900/20 border border-green-700/50'
                        : isCurrent
                        ? 'bg-blue-900/20 border border-blue-700/50'
                        : 'bg-gray-800/20 border border-gray-700/50'
                    }`}
                  >
                    {/* Checkmark or spinner */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {isCompleted ? (
                        <svg
                          className="w-5 h-5 text-green-400"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Step label */}
                    <span
                      className={`text-sm ${
                        isCompleted
                          ? 'text-green-400'
                          : isCurrent
                          ? 'text-blue-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {getStepLabel(step)}
                    </span>
                  </div>
                )
              })}
            </div>

            {loadingStep && (
              <p className="text-gray-500 text-sm mt-4">
                {t('loadingSteps.description', { count: uniqueSymbols.length })}
              </p>
            )}
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div className="flex flex-col max-w-6xl px-4 sm:px-6 mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-200">{t('title')}</h1>
        <div className="flex items-center gap-4">
          {rateLimitWarning && (
            <div className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm">
              {t('rateLimitWarning')}
            </div>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={loadingHistorical}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('refresh')}
          </button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-gray-400 mb-4">
          {t('lastUpdated')}: {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* AI & Robotics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-6">
          {t('sections.aiRobotics')}
        </h2>
        {aiRoboticsCategories.map((category) => (
          <StockCategorySection
            key={category.id}
            category={category}
            stockData={stockData}
          />
        ))}
      </div>

      {/* Power Hungry Section */}
      <div className="mb-8">
        {powerHungryCategories.map((category) => (
          <StockCategorySection
            key={category.id}
            category={category}
            stockData={stockData}
          />
        ))}
      </div>

      {/* Longevity Section */}
      <div className="mb-8">
        {longevityCategories.map((category) => (
          <StockCategorySection
            key={category.id}
            category={category}
            stockData={stockData}
          />
        ))}
      </div>

      {/* Hedge Section */}
      <div className="mb-8">
        {hedgeCategories.map((category) => (
          <StockCategorySection
            key={category.id}
            category={category}
            stockData={stockData}
          />
        ))}
      </div>

      {/* Magnificent 7 Section */}
      <div className="mb-8">
        {magnificent7Categories.map((category) => (
          <StockCategorySection
            key={category.id}
            category={category}
            stockData={stockData}
          />
        ))}
      </div>
    </div>
  )
}

export default StocksWatchClient
