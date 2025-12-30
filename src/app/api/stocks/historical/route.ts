import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Route-level caching: cache the entire response for 1 hour
export const revalidate = 3600

// Create Yahoo Finance instance (suppress survey notice)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

async function fetchHistoricalData(
  symbol: string,
  period: '1week' | '1month' | '3months' | '1year'
): Promise<Array<{ date: string; price: number }> | null> {
  try {
    console.log(
      `Fetching historical data from Yahoo Finance for ${symbol}, period: ${period}`
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
    } else if (period === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1)
    }

    // Fetch historical data from Yahoo Finance
    const historical: any = await yahooFinance.historical(symbol, {
      period1: Math.floor(startDate.getTime() / 1000),
      period2: Math.floor(endDate.getTime() / 1000),
      interval: '1d', // Daily interval
    })

    if (!historical || !Array.isArray(historical) || historical.length === 0) {
      console.warn(
        `No historical data available from Yahoo Finance for ${symbol}`
      )
      return null
    }

    // Convert to our format
    const result = historical
      .map((item: any) => ({
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        price: item.close || 0,
      }))
      .filter(
        (item: { date: string; price: number }) => item.date && item.price > 0
      )
      .sort(
        (
          a: { date: string; price: number },
          b: { date: string; price: number }
        ) => a.date.localeCompare(b.date)
      )

    console.log(
      `Historical data fetched successfully for ${symbol}: ${result.length} data points`
    )
    return result
  } catch (error) {
    console.error(
      `Error fetching historical data from Yahoo Finance for ${symbol}:`,
      error
    )
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []
  const period = (searchParams.get('period') || '1year') as
    | '1week'
    | '1month'
    | '3months'
    | '1year'

  console.log(
    `Historical data API called: symbols=${symbols.join(',')}, period=${period}`
  )

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
  }

  try {
    // Fetch historical data with delay to avoid rate limiting
    const historical: Record<
      string,
      Array<{ date: string; price: number }> | null
    > = {}

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      historical[symbol] = await fetchHistoricalData(symbol, period)
    }

    const resultCount = Object.values(historical).filter(
      (h) => h !== null
    ).length
    console.log(
      `Historical data API response: ${resultCount}/${symbols.length} symbols have data`
    )

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
