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

// Removed CandleData and YearHighLow interfaces - year high/low requires paid subscription

// Note: Year high/low requires paid Finnhub subscription (403 error on free tier)
// The UI will fall back to displaying daily high/low instead

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
    // Fetch quotes with delay to respect rate limits
    const quotes: Record<string, StockQuote | null> = {}

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      // Add 200ms delay between requests (60 calls/min = 1 call/second)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      quotes[symbol] = await fetchQuote(symbol)
    }

    return NextResponse.json({
      quotes,
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
