import { NextResponse } from 'next/server'

const FRED_API_KEY = process.env.FRED_API_KEY || ''
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred'
const FRED_SERIES_URL = `${FRED_BASE_URL}/series`
const FRED_OBSERVATIONS_URL = `${FRED_BASE_URL}/series/observations`

interface FredObservation {
  date: string
  value: string
}

interface FredResponse {
  observations: FredObservation[]
}

interface FredSeriesInfo {
  units: string
  units_short: string
}

interface FredSeriesResponse {
  seriess: FredSeriesInfo[]
}

// Fetch series info to get units
async function fetchSeriesInfo(seriesId: string): Promise<string | null> {
  try {
    const url = `${FRED_SERIES_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data: FredSeriesResponse = await response.json()

    if (data.seriess && data.seriess.length > 0) {
      return data.seriess[0].units_short || data.seriess[0].units
    }

    return null
  } catch (error) {
    console.error(`Error fetching series info for ${seriesId}:`, error)
    return null
  }
}

async function fetchFredObservation(seriesId: string): Promise<number | null> {
  try {
    const url = `${FRED_OBSERVATIONS_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
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
    console.error(`Error fetching observation for ${seriesId}:`, error)
    return null
  }
}

async function fetchFredHistoricalData(
  seriesId: string,
  units: string | null
): Promise<Array<{ date: string; value: number }> | null> {
  try {
    // Calculate date 5 years ago
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 5)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const url = `${FRED_OBSERVATIONS_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDateStr}&observation_end=${endDateStr}&sort_order=asc`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.statusText}`)
    }

    const data: FredResponse = await response.json()

    if (data.observations && data.observations.length > 0) {
      return data.observations
        .filter((obs) => obs.value !== '.' && obs.value !== '') // Filter out missing data
        .map((obs) => {
          let value = parseFloat(obs.value)
          if (isNaN(value)) return null

          // Convert based on units
          if (units && (units.includes('Millions') || units.includes('Mil'))) {
            value = value * 1e6
          } else if (
            units &&
            (units.includes('Billions') || units.includes('Bil'))
          ) {
            value = value * 1e9
          } else if (
            units &&
            (units.includes('Thousands') || units.includes('Thou'))
          ) {
            value = value * 1e3
          }

          return { date: obs.date, value }
        })
        .filter(
          (item): item is { date: string; value: number } => item !== null
        )
    }

    return null
  } catch (error) {
    console.error(`Error fetching historical data for ${seriesId}:`, error)
    return null
  }
}

function convertValue(
  value: number | null,
  units: string | null
): number | null {
  if (value === null) return null

  // Convert based on units - most FRED series are in millions
  // Check if units indicate millions and convert to actual dollars
  if (units && (units.includes('Millions') || units.includes('Mil'))) {
    return value * 1e6 // Convert millions to dollars
  } else if (units && (units.includes('Billions') || units.includes('Bil'))) {
    return value * 1e9 // Convert billions to dollars
  } else if (units && (units.includes('Thousands') || units.includes('Thou'))) {
    return value * 1e3 // Convert thousands to dollars
  }
  // If units are "Percent" or "Index" or "Number", don't convert
  return value
}

export async function GET() {
  if (!FRED_API_KEY) {
    console.error('FRED_API_KEY is not set')
    return NextResponse.json(
      { error: 'FRED_API_KEY is not configured' },
      { status: 500 }
    )
  }

  try {
    const seriesIds = ['RRPONTSYD', 'WRESBAL', 'WALCL', 'WTREGEN', 'DGS10']

    // Fetch all series info and observations in parallel
    const [seriesInfoResults, observationResults] = await Promise.all([
      Promise.all(seriesIds.map((id) => fetchSeriesInfo(id))),
      Promise.all(seriesIds.map((id) => fetchFredObservation(id))),
    ])

    // Convert values based on units
    const rrp = convertValue(observationResults[0], seriesInfoResults[0])
    const bankReserves = convertValue(
      observationResults[1],
      seriesInfoResults[1]
    )
    const fedBalanceSheet = convertValue(
      observationResults[2],
      seriesInfoResults[2]
    )
    const tga = convertValue(observationResults[3], seriesInfoResults[3])
    const treasury10Y = convertValue(
      observationResults[4],
      seriesInfoResults[4]
    )

    // Calculate Net Liquidity Index
    const netLiquidity =
      fedBalanceSheet !== null && tga !== null && rrp !== null
        ? fedBalanceSheet - tga - rrp
        : null

    // Fetch historical data
    const historicalData = await Promise.all(
      seriesIds.map(async (id, index) => {
        const units = seriesInfoResults[index]
        const data = await fetchFredHistoricalData(id, units)
        return { seriesId: id, data }
      })
    )

    // Calculate historical Net Liquidity
    const fedBalanceSheetHist =
      historicalData.find((d) => d.seriesId === 'WALCL')?.data || []
    const tgaHist =
      historicalData.find((d) => d.seriesId === 'WTREGEN')?.data || []
    const rrpHist =
      historicalData.find((d) => d.seriesId === 'RRPONTSYD')?.data || []

    // Create a map of dates to values for efficient lookup
    const tgaMap = new Map(tgaHist.map((item) => [item.date, item.value]))
    const rrpMap = new Map(rrpHist.map((item) => [item.date, item.value]))

    const netLiquidityHist = fedBalanceSheetHist
      .map((item) => {
        const tgaValue = tgaMap.get(item.date)
        const rrpValue = rrpMap.get(item.date)

        if (tgaValue !== undefined && rrpValue !== undefined) {
          return {
            date: item.date,
            value: item.value - tgaValue - rrpValue,
          }
        }
        return null
      })
      .filter((item): item is { date: string; value: number } => item !== null)

    return NextResponse.json({
      rrp,
      bankReserves,
      fedBalanceSheet,
      tga,
      netLiquidity,
      treasury10Y,
      lastUpdated: new Date().toISOString(),
      historical: {
        rrp: historicalData.find((d) => d.seriesId === 'RRPONTSYD')?.data || [],
        bankReserves:
          historicalData.find((d) => d.seriesId === 'WRESBAL')?.data || [],
        fedBalanceSheet:
          historicalData.find((d) => d.seriesId === 'WALCL')?.data || [],
        tga: historicalData.find((d) => d.seriesId === 'WTREGEN')?.data || [],
        treasury10Y:
          historicalData.find((d) => d.seriesId === 'DGS10')?.data || [],
        netLiquidity: netLiquidityHist,
      },
    })
  } catch (error) {
    console.error('Error fetching macro data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch macro data' },
      { status: 500 }
    )
  }
}
