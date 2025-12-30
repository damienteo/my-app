import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
import { getYahooSymbol } from '../symbolMapping'

// Route-level caching: cache the entire response for 1 hour
export const revalidate = 3600

// Create Yahoo Finance instance (suppress survey notice)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

interface QuarterlyData {
  date: string // e.g., "4Q2024"
  revenue: number | null
  earnings: number | null
}

// Helper to check if a symbol is an international stock
function isInternationalStock(symbol: string): boolean {
  return symbol.includes('.T') || symbol.includes('.SZ') || symbol.includes('.SS')
}

// Fetch earnings and revenue data from Yahoo Finance
async function fetchEarningsFromYahoo(
  symbol: string
): Promise<QuarterlyData[] | null> {
  try {
    // Map symbol to Yahoo Finance symbol if needed
    const yahooSymbol = getYahooSymbol(symbol)
    console.log(`Fetching earnings data from Yahoo Finance for ${symbol} (${yahooSymbol})`)

    const quoteSummary = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ['earnings'],
    })

    // Check if there are validation errors (common for international stocks)
    if ((quoteSummary as any).errors && (quoteSummary as any).errors.length > 0) {
      console.warn(
        `Yahoo Finance validation errors for ${symbol}:`,
        (quoteSummary as any).errors
      )
      // For international stocks, earnings data may not be available
      if (isInternationalStock(symbol)) {
        console.log(
          `Earnings data may not be available for international stock ${symbol}`
        )
        return null
      }
    }

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
  } catch (error: any) {
    // Handle validation errors gracefully, especially for international stocks
    if (error.name === 'FailedYahooValidationError' || error.message?.includes('validation')) {
      console.warn(
        `Yahoo Finance validation error for ${symbol} (may not support earnings data):`,
        error.message
      )
      if (isInternationalStock(symbol)) {
        console.log(
          `International stock ${symbol} may not have earnings data available`
        )
      }
      return null
    }
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
    // Process in parallel batches to avoid timeout
    const earnings: Record<string, QuarterlyData[] | null> = {}
    const BATCH_SIZE = 8
    const DELAY_BETWEEN_BATCHES = 300

    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE)
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((symbol) => fetchEarningsFromYahoo(symbol))
      )
      
      // Store results
      batch.forEach((symbol, index) => {
        earnings[symbol] = batchResults[index]
      })
      
      // Add delay between batches (not after last batch)
      if (i + BATCH_SIZE < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
      }
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

