import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Route-level caching: cache the entire response for 1 hour (financial data changes less frequently)
export const revalidate = 3600

// Create Yahoo Finance instance (suppress survey notice)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

interface StockFinancials {
  peRatio: number | null // Trailing P/E ratio
  marketCap: number | null // Market capitalization
  cash: number | null // Cash and cash equivalents (from balance sheet)
  totalCash: number | null // Total cash (including short-term investments)
  freeCashFlow: number | null // Free cash flow (TTM)
  trailingPE?: number | null // Alternative P/E field name
  forwardPE?: number | null // Forward P/E
}

// Fetch financial data from Yahoo Finance
async function fetchFinancialsFromYahoo(
  symbol: string
): Promise<StockFinancials | null> {
  try {
    console.log(`Fetching financial data from Yahoo Finance for ${symbol}`)

    const quote = await yahooFinance.quote(symbol)

    if (!quote) {
      console.warn(`No data available from Yahoo Finance for ${symbol}`)
      return null
    }

    // Log what fields are actually available
    console.log(`Yahoo Finance quote fields for ${symbol}:`, Object.keys(quote))
    console.log(`Cash-related fields:`, {
      totalCash: quote.totalCash,
      cash: quote.cash,
      totalCashPerShare: quote.totalCashPerShare,
    })

    // Try quoteSummary for more detailed financial data
    let cash = null
    let freeCashFlow = null

    try {
      const quoteSummary = await yahooFinance.quoteSummary(symbol, {
        modules: ['financialData'],
      })

      // Extract cash and free cash flow from financialData
      if (quoteSummary?.financialData) {
        const financialData = quoteSummary.financialData
        cash = financialData.totalCash || null
        freeCashFlow = financialData.freeCashflow || null
      }
    } catch (summaryError) {
      console.warn(`Could not fetch quoteSummary for ${symbol}:`, summaryError)
    }

    // Extract financial metrics from Yahoo Finance quote
    const financials: StockFinancials = {
      peRatio: quote.trailingPE || quote.trailingPegRatio || null,
      trailingPE: quote.trailingPE || null,
      forwardPE: quote.forwardPE || null,
      marketCap: quote.marketCap || null,
      cash: cash || quote.totalCash || quote.cash || null,
      totalCash: cash || quote.totalCash || quote.cash || null,
      freeCashFlow: freeCashFlow || quote.freeCashflow || null,
    }

    console.log(
      `Financial data fetched successfully for ${symbol}: P/E=${financials.peRatio}, MarketCap=${financials.marketCap}, Cash=${financials.cash}`
    )
    return financials
  } catch (error) {
    console.error(
      `Error fetching financial data from Yahoo Finance for ${symbol}:`,
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
    const financials: Record<string, StockFinancials | null> = {}

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      // Add delay to avoid rate limiting
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      financials[symbol] = await fetchFinancialsFromYahoo(symbol)
    }

    return NextResponse.json({
      financials,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    )
  }
}
