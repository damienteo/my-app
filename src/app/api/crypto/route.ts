import { NextResponse } from 'next/server'

export const revalidate = 3600 // Cache for 1 hour

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const COINCAP_BASE = 'https://api.coincap.io/v2'

interface HistoricalDataPoint {
  date: string
  value: number
}

type CryptoId = 'bitcoin' | 'ethereum'
type CoinCapId = 'bitcoin' | 'ethereum'

// CoinGecko ID to CoinCap ID mapping
const COINCAP_ID_MAP: Record<CryptoId, CoinCapId> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
}

// Fetch crypto price from CoinGecko (no API key required)
async function fetchCryptoFromCoinGecko(
  cryptoId: CryptoId
): Promise<{
  price: number
  change: number
  changePercent: number
} | null> {
  try {
    const url = `${COINGECKO_BASE}/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = await res.json()
      const crypto = data[cryptoId]
      if (crypto && crypto.usd) {
        return {
          price: crypto.usd,
          change: crypto.usd_24h_change || 0,
          changePercent: crypto.usd_24h_change || 0,
        }
      }
    } else {
      const errorText = await res.text().catch(() => res.statusText)
      console.warn(
        `CoinGecko error for ${cryptoId}: ${res.status} ${res.statusText} - ${errorText}`
      )
    }
  } catch (error) {
    console.warn(`CoinGecko error for ${cryptoId}:`, error)
  }
  return null
}

// Fallback: CoinCap API (no API key required)
async function fetchCryptoFromCoinCap(
  cryptoId: CryptoId
): Promise<{
  price: number
  change: number
  changePercent: number
} | null> {
  try {
    const coinCapId = COINCAP_ID_MAP[cryptoId]
    const url = `${COINCAP_BASE}/assets/${coinCapId}`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = await res.json()
      const crypto = data.data
      if (crypto && crypto.priceUsd) {
        const price = parseFloat(crypto.priceUsd)
        const change24h = parseFloat(crypto.changePercent24Hr || '0')
        return {
          price,
          change: (price * change24h) / 100,
          changePercent: change24h,
        }
      }
    } else {
      const errorText = await res.text().catch(() => res.statusText)
      console.warn(
        `CoinCap error for ${cryptoId}: ${res.status} ${res.statusText} - ${errorText}`
      )
    }
  } catch (error) {
    console.warn(`CoinCap error for ${cryptoId}:`, error)
  }
  return null
}

// Fetch historical data from CoinGecko
async function fetchHistoricalFromCoinGecko(
  cryptoId: CryptoId,
  period: '1week' | '1month' | '3months' | '6months' | '1year'
): Promise<HistoricalDataPoint[]> {
  try {
    // Map period to days
    const days =
      period === '1week'
        ? 7
        : period === '1month'
        ? 30
        : period === '3months'
        ? 90
        : period === '6months'
        ? 180
        : 365

    const url = `${COINGECKO_BASE}/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.prices && Array.isArray(data.prices)) {
        return data.prices.map(([timestamp, price]: [number, number]) => ({
          date: new Date(timestamp).toISOString().split('T')[0],
          value: price,
        }))
      }
    } else {
      const errorText = await res.text().catch(() => res.statusText)
      console.warn(
        `CoinGecko historical error for ${cryptoId}: ${res.status} ${res.statusText} - ${errorText}`
      )
    }
  } catch (error) {
    console.warn(`CoinGecko historical error for ${cryptoId}:`, error)
  }
  return []
}

// Fallback: CoinCap historical data
async function fetchHistoricalFromCoinCap(
  cryptoId: CryptoId,
  period: '1week' | '1month' | '3months' | '6months' | '1year'
): Promise<HistoricalDataPoint[]> {
  try {
    const coinCapId = COINCAP_ID_MAP[cryptoId]
    const endDate = new Date()
    const startDate = new Date()
    if (period === '1week') startDate.setDate(startDate.getDate() - 7)
    else if (period === '1month') startDate.setMonth(startDate.getMonth() - 1)
    else if (period === '3months') startDate.setMonth(startDate.getMonth() - 3)
    else if (period === '6months') startDate.setMonth(startDate.getMonth() - 6)
    else if (period === '1year')
      startDate.setFullYear(startDate.getFullYear() - 1)

    const startMs = startDate.getTime()
    const endMs = endDate.getTime()

    const url = `${COINCAP_BASE}/assets/${coinCapId}/history?interval=d1&start=${startMs}&end=${endMs}`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.data && Array.isArray(data.data)) {
        return data.data
          .map((item: any) => ({
            date: new Date(item.time).toISOString().split('T')[0],
            value: parseFloat(item.priceUsd),
          }))
          .filter((d: HistoricalDataPoint) => !isNaN(d.value) && d.value > 0)
          .sort((a: HistoricalDataPoint, b: HistoricalDataPoint) =>
            a.date.localeCompare(b.date)
          )
      }
    } else {
      const errorText = await res.text().catch(() => res.statusText)
      console.warn(
        `CoinCap historical error for ${cryptoId}: ${res.status} ${res.statusText} - ${errorText}`
      )
    }
  } catch (error) {
    console.warn(`CoinCap historical error for ${cryptoId}:`, error)
  }
  return []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const crypto = (searchParams.get('crypto') || 'bitcoin') as CryptoId
  const period = (searchParams.get('period') || '1month') as
    | '1week'
    | '1month'
    | '3months'
    | '6months'
    | '1year'

  // Validate crypto parameter
  if (crypto !== 'bitcoin' && crypto !== 'ethereum') {
    return NextResponse.json(
      { error: 'Invalid crypto parameter. Use "bitcoin" or "ethereum"' },
      { status: 400 }
    )
  }

  try {
    // Try CoinGecko first (no API key required)
    let cryptoData = await fetchCryptoFromCoinGecko(crypto)

    // Fallback to CoinCap if CoinGecko fails
    if (!cryptoData) {
      console.log(`CoinGecko failed for ${crypto}, trying CoinCap fallback`)
      cryptoData = await fetchCryptoFromCoinCap(crypto)
    }

    if (!cryptoData) {
      return NextResponse.json(
        { error: `Failed to fetch ${crypto} price from available APIs` },
        { status: 500 }
      )
    }

    // Fetch historical data
    let historical = await fetchHistoricalFromCoinGecko(crypto, period)
    if (historical.length === 0) {
      console.log(
        `CoinGecko historical failed for ${crypto}, trying CoinCap fallback`
      )
      historical = await fetchHistoricalFromCoinCap(crypto, period)
    }

    // Calculate change based on period (compare current to first historical data point)
    let change = cryptoData.change
    let changePercent = cryptoData.changePercent
    if (historical.length > 0) {
      const firstPrice = historical[0].value
      change = cryptoData.price - firstPrice
      changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0
    }

    // Determine source
    const source = 'CoinGecko / CoinCap'

    return NextResponse.json({
      current: {
        price: cryptoData.price,
        change,
        changePercent,
      },
      historical,
      period,
      timestamp: new Date().toISOString(),
      source,
    })
  } catch (error: any) {
    console.error(`Error fetching ${crypto} data:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${crypto} data` },
      { status: 500 }
    )
  }
}

