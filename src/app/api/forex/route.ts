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
  const startDate = new Date()

  if (period === '1week') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (period === '1month') {
    startDate.setMonth(startDate.getMonth() - 1)
  } else if (period === '1year') {
    startDate.setFullYear(startDate.getFullYear() - 1)
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
  // Sample dates if too many (e.g., for 1 year, sample weekly)
  let sampledDates = dates
  if (period === '1year' && dates.length > 50) {
    // Sample weekly for 1 year
    sampledDates = dates.filter((_, index) => index % 7 === 0)
  } else if (period === '1month' && dates.length > 30) {
    // Sample every other day for 1 month
    sampledDates = dates.filter((_, index) => index % 2 === 0)
  }

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
  for (const date of sampledDates) {
    try {
      const url = `https://api.currencyapi.com/v3/historical?apikey=${apiKey}&base_currency=USD&date=${date}&currencies=SGD,JPY`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        const usdToSgd = data.data?.SGD?.value || 0
        const usdToJpy = data.data?.JPY?.value || 0
        const sgdToJpy = usdToSgd > 0 ? usdToJpy / usdToSgd : 0

        historicalData.usdToSgd.push({ date, value: usdToSgd })
        historicalData.usdToJpy.push({ date, value: usdToJpy })
        historicalData.sgdToJpy.push({ date, value: sgdToJpy })
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error fetching historical data for ${date}:`, error)
    }
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

    return NextResponse.json({
      current: {
        usdToSgd,
        sgdToJpy,
        usdToJpy,
      },
      historical,
    })
  } catch (error) {
    console.error('Error fetching forex data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forex data' },
      { status: 500 }
    )
  }
}

