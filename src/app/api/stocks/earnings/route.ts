import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Route-level caching: cache the entire response for 1 hour
export const revalidate = 3600

// Create Yahoo Finance instance (suppress survey notice)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

interface QuarterlyData {
  date: string // e.g., "4Q2024"
  revenue: number | null
  earnings: number | null
}

// Fetch earnings and revenue data from Yahoo Finance
async function fetchEarningsFromYahoo(
  symbol: string
): Promise<QuarterlyData[] | null> {
  try {
    console.log(`Fetching earnings data from Yahoo Finance for ${symbol}`)

    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ['earnings'],
    })

    if (!quoteSummary?.earnings?.financialsChart) {
      console.warn(`No earnings data available from Yahoo Finance for ${symbol}`)
      return null
    }

    const quarterly = quoteSummary.earnings.financialsChart.quarterly || []

    if (quarterly.length === 0) {
      console.warn(`No quarterly data available for ${symbol}`)
      return null
    }

    // Map to our format - keep chronological order (oldest to newest)
    const data: QuarterlyData[] = quarterly
      .map((q: any) => ({
        date: q.date || '',
        revenue: q.revenue || null,
        earnings: q.earnings || null,
      }))
      .filter((q: QuarterlyData) => q.date) // Filter out entries without dates

    console.log(
      `Earnings data fetched successfully for ${symbol}: ${data.length} quarters`
    )
    return data
  } catch (error) {
    console.error(
      `Error fetching earnings data from Yahoo Finance for ${symbol}:`,
      error
    )
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
  }

  try {
    const earnings: Record<string, QuarterlyData[] | null> = {}

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      // Add delay to avoid rate limiting
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      earnings[symbol] = await fetchEarningsFromYahoo(symbol)
    }

    return NextResponse.json({
      earnings,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching earnings data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    )
  }
}

