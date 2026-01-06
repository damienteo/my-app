import { NextResponse } from 'next/server'

// Route-level caching: cache the entire response for 1 hour
// Each period (1week, 1month, 3months, 6months, 1year) counts as one request
// With 5 periods and 10 requests/hour limit, we cache each period for 1 hour
export const revalidate = 3600

// Gold API (gold-api.com) - Free tier: unlimited real-time requests, 10 historical/hour
// Base URL: https://api.gold-api.com
// Documentation: https://gold-api.com/docs
const GOLD_API_BASE = 'https://api.gold-api.com'
const GOLD_API_KEY = process.env.GOLD_API_KEY || ''

// Alternative: Freegoldprice.org - free hourly API calls
const FREE_GOLD_PRICE_API = 'https://api.freegoldprice.org/v1/latest'

interface HistoricalDataPoint {
  date: string
  value: number
}

// Fetch gold price from Gold API (gold-api.com) or Freegoldprice.org
async function fetchGoldFromAPI(): Promise<{
  price: number
  change: number
  changePercent: number
} | null> {
  // Try Gold API first
  // Endpoint: GET /price/{symbol} (e.g., /price/XAU)
  // Auth: Authorization: Bearer {API_KEY} or x-access-token header
  try {
    const url = `${GOLD_API_BASE}/price/XAU`
    const headers: HeadersInit = {}

    // API key is required for most endpoints
    if (GOLD_API_KEY) {
      headers['Authorization'] = `Bearer ${GOLD_API_KEY}`
      headers['x-access-token'] = GOLD_API_KEY // Try both formats
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 }, // Cache current price for 1 hour
    })

    if (res.ok) {
      const data = await res.json()
      console.log(
        'Gold API current price response:',
        JSON.stringify(data).substring(0, 200)
      )
      // Gold API response format may vary: { price: number, rate: number, ... }
      // or { data: { price: number, ... } }
      const responseData = data.data || data
      const price =
        responseData.price ||
        responseData.rate ||
        responseData.price_per_ounce ||
        responseData.value
      if (price && !isNaN(Number(price))) {
        // Gold API may provide change data
        const change =
          responseData.change ||
          responseData.change_24h ||
          responseData.change_24h_percent ||
          0
        const changePercent =
          responseData.change_percent ||
          responseData.change_percent_24h ||
          responseData.change_24h_percent ||
          0
        return {
          price: Number(price),
          change: Number(change),
          changePercent: Number(changePercent),
        }
      } else {
        console.warn('Gold API: Invalid price in response', data)
      }
    } else {
      const errorText = await res.text().catch(() => res.statusText)
      console.warn(
        `Gold API error: ${res.status} ${res.statusText} - ${errorText}`
      )
    }
  } catch (error) {
    console.warn('Gold API error:', error)
  }

  // Fallback to Freegoldprice.org (no API key required)
  try {
    const res = await fetch(`${FREE_GOLD_PRICE_API}?currency=USD`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    if (res.ok) {
      const data = await res.json()
      // Try common field names
      const price =
        data.price ||
        data.rate ||
        data.gold ||
        data.gold_price ||
        data.price_per_ounce ||
        data.USD?.gold ||
        data.USD?.price
      if (price && !isNaN(Number(price))) {
        // Freegoldprice.org may not provide change, return 0 (will be calculated from historical)
        return { price: Number(price), change: 0, changePercent: 0 }
      }
    }
  } catch (error) {
    console.warn('Freegoldprice.org error:', error)
  }

  return null
}

// Fetch historical gold data from Gold API (gold-api.com)
// Free tier: 10 requests/hour - each period counts as one request
// Cache each period for 1 hour to ensure we don't exceed the limit
// Documentation: https://gold-api.com/docs
async function fetchGoldHistoricalFromAPI(
  period: '1week' | '1month' | '3months' | '6months' | '1year'
): Promise<HistoricalDataPoint[]> {
  // Calculate date range and convert to Unix timestamps
  const endDate = new Date()
  const startDate = new Date()
  if (period === '1week') startDate.setDate(startDate.getDate() - 7)
  else if (period === '1month') startDate.setMonth(startDate.getMonth() - 1)
  else if (period === '3months') startDate.setMonth(startDate.getMonth() - 3)
  else if (period === '6months') startDate.setMonth(startDate.getMonth() - 6)
  else if (period === '1year')
    startDate.setFullYear(startDate.getFullYear() - 1)

  const startTimestamp = Math.floor(startDate.getTime() / 1000)
  const endTimestamp = Math.floor(endDate.getTime() / 1000)

  // Determine groupBy based on period length
  // For short periods, use 'day', for longer periods use 'week' or 'month'
  const groupBy =
    period === '1week' || period === '1month'
      ? 'day'
      : period === '3months'
      ? 'week'
      : 'month'

  // Gold API (gold-api.com) - Free tier: 10 historical requests/hour
  // Endpoint: GET /history
  // Parameters: symbol, startTimestamp, endTimestamp, groupBy, aggregation, orderBy
  // Auth: x-api-key header (required)
  try {
    if (!GOLD_API_KEY) {
      console.warn(
        'Gold API key not provided - historical data requires API key'
      )
      return []
    }

    // Build query parameters
    const params = new URLSearchParams({
      symbol: 'XAU',
      startTimestamp: startTimestamp.toString(),
      endTimestamp: endTimestamp.toString(),
      groupBy: groupBy,
      aggregation: 'avg', // Use average price for the period
      orderBy: 'asc', // Oldest first
    })

    const url = `${GOLD_API_BASE}/history?${params.toString()}`
    const headers: HeadersInit = {
      'x-api-key': GOLD_API_KEY, // Required header per documentation
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 }, // Cache each period for 1 hour to stay within 10 requests/hour limit
    })

    if (res.ok) {
      const data = await res.json()
      console.log(
        `Gold API historical response for ${period}:`,
        JSON.stringify(data).substring(0, 300)
      )
      // Gold API returns array of objects with time period and price aggregation fields
      // Format: [{ day: "2024-01-01", avg_price: 2000.50 }, ...]
      // or [{ month: "2024-01", avg_price: 2000.50 }, ...]
      // Fields depend on groupBy: day, week, month, year
      // Price fields depend on aggregation: avg_price, max_price, min_price
      const series = Array.isArray(data) ? data : []

      if (series.length > 0) {
        const result = series
          .map((item: any) => {
            // Extract date from period field
            // API returns: day, week, month, year, or year_month (e.g., "2025-01")
            const date =
              item.year_month ||
              item.day ||
              item.week ||
              item.month ||
              item.year ||
              item.date
            // Extract price from aggregation field (avg_price, max_price, min_price)
            // Price may be a string or number
            const price =
              item.avg_price || item.max_price || item.min_price || item.price

            if (!date || price === undefined || price === null) return null

            // Convert price to number (handle string numbers)
            const priceNum =
              typeof price === 'string' ? parseFloat(price) : Number(price)
            if (isNaN(priceNum) || priceNum <= 0) return null

            // Convert date to YYYY-MM-DD format
            let dateStr: string
            if (typeof date === 'string') {
              // Handle formats like "2024-01-01", "2024-01", "2024", "2025-01" (year_month)
              if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateStr = date // Already YYYY-MM-DD
              } else if (date.match(/^\d{4}-\d{2}$/)) {
                // Month format (e.g., "2025-01" or "2024-01"), use first day of month
                dateStr = `${date}-01`
              } else if (date.match(/^\d{4}$/)) {
                // Year format, use January 1st
                dateStr = `${date}-01-01`
              } else {
                // Try parsing as ISO date
                dateStr = new Date(date).toISOString().split('T')[0]
              }
            } else {
              dateStr = new Date(date).toISOString().split('T')[0]
            }

            return {
              date: dateStr,
              value: priceNum,
            }
          })
          .filter(
            (d: HistoricalDataPoint | null): d is HistoricalDataPoint =>
              d !== null
          )
          .sort((a, b) => a.date.localeCompare(b.date))

        console.log(
          `Gold API: Processed ${result.length} historical data points for ${period}`
        )
        return result
      } else {
        console.warn(
          `Gold API: No historical data found in response for ${period}`
        )
      }
    } else {
      const errorText = await res.text().catch(() => res.statusText)
      // Handle rate limit (429) gracefully
      if (res.status === 429) {
        console.warn(
          'Gold API rate limit reached (10 requests/hour). Historical data unavailable.'
        )
      } else {
        console.warn(
          `Gold API historical error: ${res.status} ${res.statusText} - ${errorText}`
        )
      }
    }
  } catch (error: any) {
    console.error('Gold API historical error:', error)
    console.error('Error details:', error.message, error.stack)
  }

  return []
}

async function fetchHistoricalData(
  period: '1week' | '1month' | '3months' | '6months' | '1year'
): Promise<HistoricalDataPoint[]> {
  // Use free gold APIs for historical data (no Yahoo Finance)
  return await fetchGoldHistoricalFromAPI(period)
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
    // Use free gold APIs (Gold API or Freegoldprice.org) instead of Yahoo Finance
    const goldData = await fetchGoldFromAPI()

    if (!goldData) {
      return NextResponse.json(
        { error: 'Failed to fetch gold price from available APIs' },
        { status: 500 }
      )
    }

    // Fetch historical data
    const historical = await fetchHistoricalData(period)

    // Calculate change based on period (compare current to first historical data point)
    let change = goldData.change
    let changePercent = goldData.changePercent
    if (historical.length > 0) {
      const firstPrice = historical[0].value
      change = goldData.price - firstPrice
      changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0
    }

    // Determine source
    const source = GOLD_API_KEY
      ? 'Gold API (gold-api.com)'
      : 'Freegoldprice.org'

    return NextResponse.json({
      current: {
        price: goldData.price,
        change,
        changePercent,
      },
      historical,
      period,
      timestamp: new Date().toISOString(),
      source,
    })
  } catch (error: any) {
    console.error('Error fetching gold data:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to fetch gold data',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
