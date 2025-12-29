import { NextResponse } from 'next/server'

// Route-level caching: cache the entire response for 1 hour
export const revalidate = 3600

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

interface CandleData {
  c: number[] // Close prices
  h: number[] // High prices
  l: number[] // Low prices
  o: number[] // Open prices
  s: string // Status
  t: number[] // Timestamps
  v: number[] // Volume
}

async function fetchHistoricalData(
  symbol: string,
  from: number,
  to: number
): Promise<Array<{ date: string; price: number }> | null> {
  if (!FINNHUB_API_KEY) {
    return null
  }

  try {
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`

    // Cache individual API calls for 1 hour (matches route-level cache)
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      cache: 'force-cache', // Use cached data when available
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`Finnhub rate limit reached for historical ${symbol}`)
        return null
      }
      return null
    }

    const data: CandleData = await response.json()

    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      return null
    }

    return data.t.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      price: data.c[index],
    }))
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []
  const period = searchParams.get('period') || '1month'

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
    // Calculate time range
    const to = Math.floor(Date.now() / 1000)
    const from = (() => {
      const date = new Date()
      if (period === '1week') {
        date.setDate(date.getDate() - 7)
      } else if (period === '1month') {
        date.setMonth(date.getMonth() - 1)
      } else if (period === '3months') {
        date.setMonth(date.getMonth() - 3)
      }
      return Math.floor(date.getTime() / 1000)
    })()

    // Fetch historical data with delay
    const historical: Record<
      string,
      Array<{ date: string; price: number }> | null
    > = {}

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
      historical[symbol] = await fetchHistoricalData(symbol, from, to)
    }

    return NextResponse.json({
      historical,
      period,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
}
