import { NextResponse } from 'next/server'

// Route-level caching: cache the entire response for 60 seconds
export const revalidate = 60

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

interface StockQuote {
  c: number // Current price
  d: number // Change
  dp: number // Percent change
  h: number // High price of the day
  l: number // Low price of the day
  o: number // Open price of the day
  pc: number // Previous close price
  t: number // Timestamp
}

interface CandleData {
  c: number[] // Close prices
  h: number[] // High prices
  l: number[] // Low prices
  o: number[] // Open prices
  s: string // Status
  t: number[] // Timestamps
  v: number[] // Volume
}

interface YearHighLow {
  high: number | null
  low: number | null
}

async function fetchYearHighLow(symbol: string): Promise<YearHighLow> {
  if (!FINNHUB_API_KEY) {
    console.warn(`FINNHUB_API_KEY not set for year high/low fetch: ${symbol}`)
    return { high: null, low: null }
  }

  try {
    // Calculate 1 year ago (use 380 days to ensure full year of trading days)
    const to = Math.floor(Date.now() / 1000)
    const from = Math.floor((Date.now() - 380 * 24 * 60 * 60 * 1000) / 1000)

    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    console.log(
      `Fetching year high/low for ${symbol}: from ${new Date(
        from * 1000
      ).toISOString()} to ${new Date(to * 1000).toISOString()}`
    )

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Reduced to 1 hour cache for testing
      cache: 'force-cache',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.warn(
        `Finnhub year high/low API error for ${symbol}: Status ${response.status}, Response: ${errorText}`
      )
      return { high: null, low: null }
    }

    const data: CandleData = await response.json()

    console.log(
      `Year high/low response for ${symbol}: status=${data.s}, dataPoints=${
        data.h?.length || 0
      }, firstHigh=${data.h?.[0]}, lastHigh=${data.h?.[data.h?.length - 1]}`
    )

    if (data.s !== 'ok' || !data.h || !data.l || data.h.length === 0) {
      console.warn(
        `Invalid year high/low data for ${symbol}: status=${
          data.s
        }, hasHigh=${!!data.h}, hasLow=${!!data.l}, highLength=${
          data.h?.length || 0
        }`
      )
      return { high: null, low: null }
    }

    // Filter out invalid values (0 or negative)
    const allHighs = data.h.filter((h) => h > 0)
    const allLows = data.l.filter((l) => l > 0)

    if (allHighs.length === 0 || allLows.length === 0) {
      console.warn(
        `No valid price data for ${symbol} year high/low: validHighs=${allHighs.length}, validLows=${allLows.length}`
      )
      return { high: null, low: null }
    }

    // Calculate 1-year high and low from all high/low prices
    const high = Math.max(...allHighs)
    const low = Math.min(...allLows)

    console.log(
      `52W High/Low calculated for ${symbol}: High=${high}, Low=${low}, DataPoints=${allHighs.length}`
    )

    return { high, low }
  } catch (error) {
    console.error(`Error fetching year high/low for ${symbol}:`, error)
    return { high: null, low: null }
  }
}

async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  if (!FINNHUB_API_KEY) {
    console.error(`FINNHUB_API_KEY is not set for quote fetch: ${symbol}`)
    return null
  }

  try {
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    console.log(`Fetching quote for ${symbol}`)

    // Cache individual API calls for 60 seconds (matches route-level cache)
    const response = await fetch(url, {
      next: { revalidate: 60 },
      cache: 'force-cache', // Use cached data when available
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.warn(
        `Finnhub quote API error for ${symbol}: Status ${response.status}, Response: ${errorText}`
      )

      if (response.status === 429) {
        console.warn(`Finnhub rate limit reached for ${symbol}`)
        return null
      }
      return null
    }

    const data: StockQuote = await response.json()

    console.log(`Quote response for ${symbol}:`, JSON.stringify(data))

    if (data.c === 0 && data.d === 0 && data.dp === 0) {
      console.warn(
        `No data available for ${symbol} - received all zeros: c=${data.c}, d=${data.d}, dp=${data.dp}`
      )
      return null
    }

    console.log(
      `Quote fetched successfully for ${symbol}: price=${data.c}, change=${data.d} (${data.dp}%)`
    )
    return data
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: 'FINNHUB_API_KEY is not configured' },
      { status: 500 }
    )
  }

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
  }

  try {
    // Fetch quotes and 1-year high/low with delay to respect rate limits
    const quotes: Record<string, StockQuote | null> = {}
    const yearHighLow: Record<string, YearHighLow> = {}

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      // Add 200ms delay between requests (60 calls/min = 1 call/second)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Fetch quote and 1-year high/low in parallel for each symbol
      const [quote, highLow] = await Promise.all([
        fetchQuote(symbol),
        fetchYearHighLow(symbol),
      ])

      quotes[symbol] = quote
      yearHighLow[symbol] = highLow
    }

    return NextResponse.json({
      quotes,
      yearHighLow,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching stock quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock quotes' },
      { status: 500 }
    )
  }
}
