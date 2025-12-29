import { NextResponse } from 'next/server'

const FRED_API_KEY = process.env.FRED_API_KEY || ''
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations'

interface FredObservation {
  date: string
  value: string
}

interface FredResponse {
  observations: FredObservation[]
}

async function fetchFredData(seriesId: string): Promise<number | null> {
  if (!FRED_API_KEY) {
    console.error('FRED_API_KEY is not set')
    return null
  }

  try {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.statusText}`)
    }

    const data: FredResponse = await response.json()

    if (data.observations && data.observations.length > 0) {
      const latest = data.observations[0]
      const value = parseFloat(latest.value)
      return isNaN(value) ? null : value
    }

    return null
  } catch (error) {
    console.error(`Error fetching ${seriesId}:`, error)
    return null
  }
}

export async function GET() {
  try {
    // Fetch all required data in parallel
    const [rrp, bankReserves, fedBalanceSheet, tga, treasury10Y] =
      await Promise.all([
        fetchFredData('RRPONTSYD'), // Reverse Repo
        fetchFredData('WRESBAL'), // Bank Reserves
        fetchFredData('WALCL'), // Fed Balance Sheet (Total Assets)
        fetchFredData('WTREGEN'), // Treasury General Account
        fetchFredData('DGS10'), // 10-Year Treasury Yield
      ])

    // Calculate Net Liquidity Index
    const netLiquidity =
      fedBalanceSheet !== null && tga !== null && rrp !== null
        ? fedBalanceSheet - tga - rrp
        : null

    return NextResponse.json({
      rrp,
      bankReserves,
      fedBalanceSheet,
      tga,
      netLiquidity,
      treasury10Y,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching macro data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch macro data' },
      { status: 500 }
    )
  }
}
