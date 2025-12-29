'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Section } from '../components/common'
import StockCategorySection from '../components/views/stocksWatch/StockCategorySection'
import { stockCategories } from '../../../../constants'

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
  quoteTimestamp?: number
}

// Cache TTLs
const CACHE_TTL_QUOTES = 60 * 1000 // 1 minute

// Rate limit tracking
const RATE_LIMIT_WARNING_THRESHOLD = 50 // Warn at 50 calls/min
let apiCallCount = 0
let apiCallWindowStart = Date.now()

const StocksWatchClient = () => {
  const t = useTranslations('StocksWatchPage')
  const [stockData, setStockData] = useState<Record<string, StockData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const allSymbols = stockCategories.flatMap((category) =>
    category.stocks.map((stock) => stock.symbol)
  )

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
        const symbolsParam = allSymbols.join(',')
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
    [allSymbols.join(','), isCacheValid, trackApiCall]
  )

  // Initial load - quotes only
  useEffect(() => {
    let isMounted = true

    const loadInitial = async () => {
      setLoading(true)
      await fetchQuotes()
      if (isMounted) {
        setLoading(false)
      }
    }

    loadInitial()

    return () => {
      isMounted = false
    }
  }, [fetchQuotes])

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

    fetchQuotes(true)
  }, [fetchQuotes])

  if (loading) {
    return (
      <div className="flex flex-col max-w-6xl px-4 sm:px-6 mx-auto py-8">
        <Section>
          <p className="text-gray-300">{t('loading')}</p>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors font-medium"
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

      {/* Stock Categories */}
      {stockCategories.map((category) => (
        <StockCategorySection
          key={category.id}
          category={category}
          stockData={stockData}
        />
      ))}
    </div>
  )
}

export default StocksWatchClient
