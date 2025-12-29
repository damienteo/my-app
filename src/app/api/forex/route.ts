import { NextResponse } from 'next/server'

export const revalidate = 3600 // Revalidate every 1 hour

const CURRENCYAPI_KEY = process.env.CURRENCYAPI_KEY

interface HistoricalDataPoint {
  date: string
  value: number
}

async function fetchHistoricalRates(
  period: string,
  apiKey: string
): Promise<{
  usdToSgd: HistoricalDataPoint[]
  sgdToJpy: HistoricalDataPoint[]
  usdToJpy: HistoricalDataPoint[]
}> {
  const endDate = new Date()
  // Set to end of day to include today
  endDate.setHours(23, 59, 59, 999)
  const startDate = new Date()

  if (period === '1week') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (period === '1month') {
    startDate.setMonth(startDate.getMonth() - 1)
  } else if (period === '3months') {
    startDate.setMonth(startDate.getMonth() - 3)
    startDate.setHours(0, 0, 0, 0)
  } else {
    startDate.setHours(0, 0, 0, 0)
  }

  // CurrencyAPI historical endpoint
  // We'll fetch data for each day in the range
  const dates: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // For free tier, limit to reasonable number of requests
  // Sample dates strategically to stay within API limits
  // IMPORTANT: Fetch from most recent dates backwards to prioritize recent data
  let sampledDates = dates
  if (period === '3months') {
    // For 3 months, sample every 2 days to get ~45 data points
    sampledDates = dates.filter((_, index) => index % 2 === 0)
  } else if (period === '1month') {
    // For 1 month, sample every other day to get ~15 data points
    sampledDates = dates.filter((_, index) => index % 2 === 0)
  }
  // For 1 week, use all dates (7 data points)

  // Reverse the array to fetch from most recent dates first
  // This ensures we get the most current data available
  sampledDates = sampledDates.reverse()

  const historicalData: {
    usdToSgd: HistoricalDataPoint[]
    sgdToJpy: HistoricalDataPoint[]
    usdToJpy: HistoricalDataPoint[]
  } = {
    usdToSgd: [],
    sgdToJpy: [],
    usdToJpy: [],
  }

  // Fetch historical data for each date
  // Note: CurrencyAPI free tier has 300 requests/month, so we'll fetch strategically
  // Also note: CurrencyAPI free tier may have limited historical data availability
  for (const date of sampledDates) {
    try {
      const url = `https://api.currencyapi.com/v3/historical?apikey=${apiKey}&base_currency=USD&date=${date}&currencies=SGD,JPY`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        const usdToSgd = data.data?.SGD?.value || 0
        const usdToJpy = data.data?.JPY?.value || 0
        const sgdToJpy = usdToSgd > 0 ? usdToJpy / usdToSgd : 0

        // Only add if we got valid data
        if (usdToSgd > 0 && usdToJpy > 0) {
          historicalData.usdToSgd.push({ date, value: usdToSgd })
          historicalData.usdToJpy.push({ date, value: usdToJpy })
          historicalData.sgdToJpy.push({ date, value: sgdToJpy })
        }
      } else if (response.status === 429) {
        // Rate limit hit - break and return what we have
        console.warn('CurrencyAPI rate limit reached, returning partial data')
        break
      } else if (response.status === 422 || response.status === 400) {
        // Invalid date or date out of range - skip this date
        // CurrencyAPI free tier may have limited historical data
        console.warn(
          `CurrencyAPI: No data available for ${date} (status: ${response.status})`
        )
        continue
      } else {
        // Log other error statuses for debugging
        const errorText = await response.text().catch(() => 'Unknown error')
        console.warn(
          `CurrencyAPI: Error for ${date} - Status: ${response.status}, Error: ${errorText}`
        )
        continue
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error fetching historical data for ${date}:`, error)
      // Continue to next date even if one fails
    }
  }

  // Sort by date to ensure chronological order
  historicalData.usdToSgd.sort((a, b) => a.date.localeCompare(b.date))
  historicalData.sgdToJpy.sort((a, b) => a.date.localeCompare(b.date))
  historicalData.usdToJpy.sort((a, b) => a.date.localeCompare(b.date))

  // Log data availability info
  if (historicalData.usdToSgd.length > 0) {
    const firstDate = historicalData.usdToSgd[0].date
    const lastDate =
      historicalData.usdToSgd[historicalData.usdToSgd.length - 1].date
    const requestedStart = startDate.toISOString().split('T')[0]
    const requestedEnd = endDate.toISOString().split('T')[0]
    console.log(
      `CurrencyAPI: Requested ${period} period (${requestedStart} to ${requestedEnd}), got ${historicalData.usdToSgd.length} data points from ${firstDate} to ${lastDate}`
    )
  } else {
    const requestedStart = startDate.toISOString().split('T')[0]
    const requestedEnd = endDate.toISOString().split('T')[0]
    console.warn(
      `CurrencyAPI: No historical data available for ${period} period (${requestedStart} to ${requestedEnd})`
    )
  }

  return historicalData
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '1month'

  try {
    // Current rates - ExchangeRate-API (free, no key needed)
    const currentUrl = 'https://api.exchangerate-api.com/v4/latest/USD'
    const currentRes = await fetch(currentUrl)

    if (!currentRes.ok) {
      throw new Error('Failed to fetch current rates')
    }

    const currentData = await currentRes.json()

    const usdToSgd = currentData.rates.SGD
    const usdToJpy = currentData.rates.JPY
    const sgdToJpy = usdToSgd > 0 ? usdToJpy / usdToSgd : 0

    // Historical data - CurrencyAPI
    let historical = {
      usdToSgd: [] as HistoricalDataPoint[],
      sgdToJpy: [] as HistoricalDataPoint[],
      usdToJpy: [] as HistoricalDataPoint[],
    }

    if (CURRENCYAPI_KEY) {
      try {
        historical = await fetchHistoricalRates(period, CURRENCYAPI_KEY)
      } catch (error) {
        console.error('Error fetching historical forex data:', error)
        // Continue without historical data if API fails
      }
    }

    // Calculate requested date range for comparison
    const requestedStartDate = new Date()
    if (period === '1week') {
      requestedStartDate.setDate(requestedStartDate.getDate() - 7)
    } else if (period === '1month') {
      requestedStartDate.setMonth(requestedStartDate.getMonth() - 1)
    } else if (period === '3months') {
      requestedStartDate.setMonth(requestedStartDate.getMonth() - 3)
    }
    const requestedStart = requestedStartDate.toISOString().split('T')[0]
    const requestedEnd = new Date().toISOString().split('T')[0]

    // Determine actual date range of historical data
    const firstDate = historical.usdToSgd[0]?.date || 'N/A'
    const lastDate =
      historical.usdToSgd[historical.usdToSgd.length - 1]?.date || 'N/A'
    const dataPoints = historical.usdToSgd.length

    return NextResponse.json({
      current: {
        usdToSgd,
        sgdToJpy,
        usdToJpy,
      },
      historical,
      dataAvailability: {
        firstDate,
        lastDate,
        dataPoints,
        requestedStart,
        requestedEnd,
        note: 'CurrencyAPI free tier may have limited historical data availability. Data shown reflects what is available from the API.',
      },
    })
  } catch (error) {
    console.error('Error fetching forex data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forex data' },
      { status: 500 }
    )
  }
}
