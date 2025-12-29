import { NextResponse } from 'next/server'

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred'
const FRED_SERIES_URL = `${FRED_BASE_URL}/series`
const FRED_OBSERVATIONS_URL = `${FRED_BASE_URL}/series/observations`

// Helper to get API key
function getFredApiKey(): string {
  return process.env.FRED_API_KEY || process.env.NEXT_PUBLIC_FRED_API_KEY || ''
}

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
    const apiKey = getFredApiKey()
    const url = `${FRED_SERIES_URL}?series_id=${seriesId}&api_key=${apiKey}&file_type=json`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(
        `FRED API error for ${seriesId} series info: ${response.status} ${response.statusText}`
      )
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
    const apiKey = getFredApiKey()
    const url = `${FRED_OBSERVATIONS_URL}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`
    const response = await fetch(url)

    if (!response.ok) {
      // Log more details for debugging
      const errorText = await response.text().catch(() => response.statusText)
      console.error(
        `FRED API error for ${seriesId}: ${response.status} ${response.statusText}`,
        errorText
      )
      throw new Error(
        `FRED API error: ${response.status} ${response.statusText}`
      )
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
    const apiKey = getFredApiKey()
    // Calculate date 5 years ago
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 5)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const url = `${FRED_OBSERVATIONS_URL}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDateStr}&observation_end=${endDateStr}&sort_order=asc`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      console.error(
        `FRED API error for ${seriesId} historical: ${response.status} ${response.statusText}`,
        errorText
      )
      throw new Error(
        `FRED API error: ${response.status} ${response.statusText}`
      )
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
  // Check for API key - try both env var names for compatibility
  const apiKey =
    process.env.FRED_API_KEY || process.env.NEXT_PUBLIC_FRED_API_KEY || ''

  if (!apiKey) {
    console.error('FRED_API_KEY is not set. Check your .env.local file.')
    return NextResponse.json(
      { error: 'FRED_API_KEY is not configured' },
      { status: 500 }
    )
  }

  try {
    const seriesIds = [
      'RRPONTSYD',
      'WRESBAL',
      'WALCL',
      'WTREGEN',
      'DGS10',
      'SOFR', // Secured Overnight Financing Rate
      'IORB', // Interest on Reserve Balances
      'BAMLH0A0HYM2', // High Yield Credit Spreads
      'VIXCLS', // VIX (as proxy for volatility/MOVE)
    ]

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
    const sofr = convertValue(observationResults[5], seriesInfoResults[5])
    const iorb = convertValue(observationResults[6], seriesInfoResults[6])
    const highYieldSpreads = convertValue(
      observationResults[7],
      seriesInfoResults[7]
    )
    const vix = convertValue(observationResults[8], seriesInfoResults[8])

    // Calculate SOFR-IORB Spread (in basis points)
    const sofrIorbSpread =
      sofr !== null && iorb !== null ? (sofr - iorb) * 100 : null

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

    // Calculate Net Liquidity Z-Score
    const netLiquidityMean =
      netLiquidityHist.length > 0
        ? netLiquidityHist.reduce((sum, item) => sum + item.value, 0) /
          netLiquidityHist.length
        : null
    const netLiquidityStdDev =
      netLiquidityMean !== null && netLiquidityHist.length > 1
        ? Math.sqrt(
            netLiquidityHist.reduce(
              (sum, item) => sum + Math.pow(item.value - netLiquidityMean, 2),
              0
            ) /
              (netLiquidityHist.length - 1)
          )
        : null
    const netLiquidityZScore =
      netLiquidity !== null &&
      netLiquidityMean !== null &&
      netLiquidityStdDev !== null &&
      netLiquidityStdDev > 0
        ? (netLiquidity - netLiquidityMean) / netLiquidityStdDev
        : null

    // Calculate historical SOFR-IORB spread
    const sofrHist =
      historicalData.find((d) => d.seriesId === 'SOFR')?.data || []
    const iorbHist =
      historicalData.find((d) => d.seriesId === 'IORB')?.data || []

    const sofrMap = new Map(sofrHist.map((item) => [item.date, item.value]))
    const iorbMap = new Map(iorbHist.map((item) => [item.date, item.value]))

    const sofrIorbSpreadHist = sofrHist
      .map((item) => {
        const iorbValue = iorbMap.get(item.date)
        if (iorbValue !== undefined) {
          return {
            date: item.date,
            value: (item.value - iorbValue) * 100, // Convert to basis points
          }
        }
        return null
      })
      .filter((item): item is { date: string; value: number } => item !== null)

    // Check Red Lines
    const redLines = {
      bankReserves: bankReserves !== null && bankReserves < 2.7e12,
      rrp: rrp !== null && rrp < 50e9,
      sofrSpread: sofrIorbSpread !== null && sofrIorbSpread > 20,
      netLiquidityZScore:
        netLiquidityZScore !== null && netLiquidityZScore < -2.0,
    }

    return NextResponse.json({
      rrp,
      bankReserves,
      fedBalanceSheet,
      tga,
      netLiquidity,
      treasury10Y,
      sofr,
      iorb,
      sofrIorbSpread,
      highYieldSpreads,
      vix,
      netLiquidityZScore,
      redLines,
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
        sofr: sofrHist,
        iorb: iorbHist,
        sofrIorbSpread: sofrIorbSpreadHist,
        highYieldSpreads:
          historicalData.find((d) => d.seriesId === 'BAMLH0A0HYM2')?.data || [],
        vix: historicalData.find((d) => d.seriesId === 'VIXCLS')?.data || [],
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
