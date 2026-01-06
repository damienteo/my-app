import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Route-level caching: cache the entire response for 5 minutes
// S&P 500 data doesn't need to update every minute
export const revalidate = 300

// Create Yahoo Finance instance (suppress survey notice)
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
})

const SP500_SYMBOL = '^GSPC'
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred'
const FRED_SERIES_ID = 'SP500' // FRED series ID for S&P 500

// Helper to get FRED API key
function getFredApiKey(): string {
  return process.env.FRED_API_KEY || process.env.NEXT_PUBLIC_FRED_API_KEY || ''
}

interface FredObservation {
  date: string
  value: string
}

interface FredResponse {
  observations: FredObservation[]
}

interface HistoricalDataPoint {
  date: string
  value: number
}

// Fetch S&P 500 current price from FRED as fallback
async function fetchSP500FromFRED(): Promise<{
  price: number
  change: number
  changePercent: number
} | null> {
  try {
    const apiKey = getFredApiKey()
    if (!apiKey) {
      console.warn('FRED API key not available for S&P 500 fallback')
      return null
    }

    // Fetch last 2 observations to calculate change
    const url = `${FRED_BASE_URL}/series/observations?series_id=${FRED_SERIES_ID}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.warn(
        `FRED API error for S&P 500: ${response.status} ${response.statusText}`
      )
      return null
    }

    const data: FredResponse = await response.json()

    if (!data.observations || data.observations.length < 2) {
      console.warn('FRED: Insufficient data points for S&P 500')
      return null
    }

    const current = parseFloat(data.observations[0].value)
    const previous = parseFloat(data.observations[1].value)

    if (isNaN(current) || isNaN(previous) || current === 0 || previous === 0) {
      console.warn('FRED: Invalid S&P 500 data values')
      return null
    }

    const change = current - previous
    const changePercent = (change / previous) * 100

    console.log(
      `S&P 500 fetched from FRED: ${current.toFixed(2)} (${
        change >= 0 ? '+' : ''
      }${change.toFixed(2)}, ${
        changePercent >= 0 ? '+' : ''
      }${changePercent.toFixed(2)}%)`
    )

    return { price: current, change, changePercent }
  } catch (error) {
    console.error('Error fetching S&P 500 from FRED:', error)
    return null
  }
}

// Fetch S&P 500 historical data from FRED as fallback
async function fetchSP500HistoricalFromFRED(
  period: '1week' | '1month' | '3months' | '6months' | '1year'
): Promise<HistoricalDataPoint[]> {
  try {
    const apiKey = getFredApiKey()
    if (!apiKey) {
      console.warn('FRED API key not available for S&P 500 historical fallback')
      return []
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    if (period === '1week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === '1month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === '3months') {
      startDate.setMonth(startDate.getMonth() - 3)
    } else if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6)
    } else if (period === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1)
    }

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const url = `${FRED_BASE_URL}/series/observations?series_id=${FRED_SERIES_ID}&api_key=${apiKey}&file_type=json&observation_start=${startDateStr}&observation_end=${endDateStr}&sort_order=asc`
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.warn(
        `FRED API error for S&P 500 historical: ${response.status} ${response.statusText}`
      )
      return []
    }

    const data: FredResponse = await response.json()

    if (!data.observations || data.observations.length === 0) {
      console.warn('FRED: No historical data available for S&P 500')
      return []
    }

    // Convert to our format
    const result = data.observations
      .filter((obs) => obs.value !== '.' && obs.value !== '') // Filter out missing data
      .map((obs) => {
        const value = parseFloat(obs.value)
        if (isNaN(value) || value <= 0) return null
        return {
          date: obs.date,
          value: value,
        }
      })
      .filter(
        (item: HistoricalDataPoint | null): item is HistoricalDataPoint =>
          item !== null
      )
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log(
      `S&P 500 historical data fetched from FRED: ${result.length} data points`
    )
    return result
  } catch (error) {
    console.error('Error fetching S&P 500 historical data from FRED:', error)
    return []
  }
}

async function fetchHistoricalData(
  period: '1week' | '1month' | '3months' | '6months' | '1year',
  useFREDFallback: boolean = false
): Promise<HistoricalDataPoint[]> {
  // If FRED fallback is requested, try FRED first
  if (useFREDFallback) {
    const fredData = await fetchSP500HistoricalFromFRED(period)
    if (fredData.length > 0) {
      return fredData
    }
    // If FRED fails, still try Yahoo Finance
  }

  try {
    console.log(
      `Fetching S&P 500 historical data from Yahoo Finance, period: ${period}`
    )

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    if (period === '1week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === '1month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === '3months') {
      startDate.setMonth(startDate.getMonth() - 3)
    } else if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6)
    } else if (period === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1)
    }

    // Use chart() method (recommended, replaces deprecated historical())
    const chart = await yahooFinance.chart(SP500_SYMBOL, {
      period1: Math.floor(startDate.getTime() / 1000),
      period2: Math.floor(endDate.getTime() / 1000),
      interval: '1d', // Daily interval
    })

    if (
      !chart ||
      !chart.quotes ||
      !Array.isArray(chart.quotes) ||
      chart.quotes.length === 0
    ) {
      console.warn(
        `No historical data available from Yahoo Finance for ${SP500_SYMBOL}`
      )
      // Try FRED fallback if Yahoo Finance has no data
      if (!useFREDFallback) {
        return await fetchSP500HistoricalFromFRED(period)
      }
      return []
    }

    // Convert to our format
    const result = chart.quotes
      .map((quote: any) => {
        if (!quote.date || !quote.close) return null
        return {
          date: new Date(quote.date * 1000).toISOString().split('T')[0],
          value: quote.close,
        }
      })
      .filter(
        (item: HistoricalDataPoint | null): item is HistoricalDataPoint =>
          item !== null && item.value > 0
      )
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log(
      `S&P 500 historical data fetched successfully: ${result.length} data points`
    )
    return result
  } catch (error: any) {
    // Handle rate limit errors - try FRED fallback
    const isRateLimit =
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('rate limit') ||
      error.message?.includes('crumb')

    if (isRateLimit) {
      console.warn(
        `Rate limit error fetching historical data for ${SP500_SYMBOL}: ${error.message}`
      )
      // Try FRED fallback if we haven't already
      if (!useFREDFallback) {
        console.log('Attempting FRED fallback for historical data')
        return await fetchSP500HistoricalFromFRED(period)
      }
      return []
    }
    // Handle "No data found" errors gracefully
    if (
      error.message?.includes('No data found') ||
      error.message?.includes('delisted')
    ) {
      console.warn(
        `No historical data available for ${SP500_SYMBOL}: ${error.message}`
      )
      // Try FRED fallback if we haven't already
      if (!useFREDFallback) {
        return await fetchSP500HistoricalFromFRED(period)
      }
      return []
    }
    console.error(
      `Error fetching S&P 500 historical data from Yahoo Finance:`,
      error
    )
    // Try FRED fallback as last resort
    if (!useFREDFallback) {
      return await fetchSP500HistoricalFromFRED(period)
    }
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') || '1month') as
    | '1week'
    | '1month'
    | '3months'
    | '6months'
    | '1year'

  try {
    // Fetch current price with retry logic for rate limits
    let quote: any = null
    let retries = 0
    const maxRetries = 2 // Reduced retries since we have FRED fallback

    while (retries <= maxRetries) {
      try {
        quote = await yahooFinance.quote(SP500_SYMBOL)
        break // Success, exit retry loop
      } catch (error: any) {
        // Check if it's a rate limit error
        const isRateLimit =
          error.message?.includes('429') ||
          error.message?.includes('Too Many Requests') ||
          error.message?.includes('rate limit') ||
          error.message?.includes('crumb')

        if (isRateLimit && retries < maxRetries) {
          retries++
          // Exponential backoff: wait 2^retries seconds
          const waitTime = Math.pow(2, retries) * 1000
          console.warn(
            `Yahoo Finance rate limited, retrying in ${waitTime}ms (attempt ${retries}/${maxRetries})`
          )
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        } else if (isRateLimit) {
          // Max retries reached, try FRED fallback
          console.warn(
            'Yahoo Finance rate limit exceeded, attempting FRED fallback'
          )
          const fredData = await fetchSP500FromFRED()
          if (fredData) {
            // Fetch historical data from FRED since Yahoo Finance is rate limited
            const historical = await fetchHistoricalData(period, true)

            // Calculate change based on period (compare current to first historical data point)
            let change = fredData.change
            let changePercent = fredData.changePercent
            if (historical.length > 0) {
              const firstPrice = historical[0].value
              change = fredData.price - firstPrice
              changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0
            }

            return NextResponse.json({
              current: {
                price: fredData.price,
                change,
                changePercent,
              },
              historical,
              period,
              timestamp: new Date().toISOString(),
              source: 'FRED', // Indicate fallback source
            })
          }
          // FRED also failed, return rate limit error
          return NextResponse.json(
            {
              error: 'Rate limit exceeded. Please try again later.',
              rateLimited: true,
            },
            { status: 429 }
          )
        } else {
          // Not a rate limit error, throw it
          throw error
        }
      }
    }

    if (!quote || quote.regularMarketPrice === undefined) {
      // Try FRED as fallback
      console.warn('Yahoo Finance quote failed, attempting FRED fallback')
      const fredData = await fetchSP500FromFRED()
      if (fredData) {
        // Use FRED for historical data since Yahoo Finance failed
        const historical = await fetchHistoricalData(period, true)

        // Calculate change based on period (compare current to first historical data point)
        let change = fredData.change
        let changePercent = fredData.changePercent
        if (historical.length > 0) {
          const firstPrice = historical[0].value
          change = fredData.price - firstPrice
          changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0
        }

        return NextResponse.json({
          current: {
            price: fredData.price,
            change,
            changePercent,
          },
          historical,
          period,
          timestamp: new Date().toISOString(),
          source: 'FRED',
        })
      }

      return NextResponse.json(
        { error: 'Failed to fetch S&P 500 current price' },
        { status: 500 }
      )
    }

    const currentPrice = quote.regularMarketPrice

    // Fetch historical data (will fallback to FRED if rate limited)
    const historical = await fetchHistoricalData(period, false)

    // Calculate change based on period (compare current to first historical data point)
    let change = 0
    let changePercent = 0
    if (historical.length > 0) {
      const firstPrice = historical[0].value
      change = currentPrice - firstPrice
      changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0
    } else {
      // Fallback to daily change if no historical data available
      change = quote.regularMarketChange || 0
      changePercent = quote.regularMarketChangePercent || 0
    }

    return NextResponse.json({
      current: {
        price: currentPrice,
        change,
        changePercent,
      },
      historical,
      period,
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance',
    })
  } catch (error: any) {
    console.error('Error fetching S&P 500 data:', error)

    // Check if it's a rate limit error
    const isRateLimit =
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('rate limit') ||
      error.message?.includes('crumb')

    if (isRateLimit) {
      // Last attempt: try FRED fallback
      const fredData = await fetchSP500FromFRED()
      if (fredData) {
        // Use FRED for historical data since Yahoo Finance is rate limited
        const historical = await fetchHistoricalData(period, true)

        // Calculate change based on period (compare current to first historical data point)
        let change = fredData.change
        let changePercent = fredData.changePercent
        if (historical.length > 0) {
          const firstPrice = historical[0].value
          change = fredData.price - firstPrice
          changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0
        }

        return NextResponse.json({
          current: {
            price: fredData.price,
            change,
            changePercent,
          },
          historical,
          period,
          timestamp: new Date().toISOString(),
          source: 'FRED',
        })
      }

      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          rateLimited: true,
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch S&P 500 data' },
      { status: 500 }
    )
  }
}
