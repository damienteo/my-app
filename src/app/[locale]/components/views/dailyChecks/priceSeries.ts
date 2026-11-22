export const PRICE_PERIODS = [
  '1week',
  '1month',
  '3months',
  '6months',
  '1year',
] as const

export type PricePeriod = (typeof PRICE_PERIODS)[number]

export type ChartPoint = {
  date: string
  value: number
}

type PriceSeriesId = 'sp500' | 'gold' | 'bitcoin' | 'ethereum'

export type PriceSeriesConfig = {
  id: PriceSeriesId
  url: (period: PricePeriod) => string
  /** Shown when the request fails, before the translated fallback. */
  fetchError: string
  /** Crypto prices are in dollars. The index and gold are not. */
  withDollar: boolean
}

export const priceSeries: PriceSeriesConfig[] = [
  {
    id: 'sp500',
    url: (period) => `/api/sp500?period=${period}`,
    fetchError: 'Failed to fetch S&P 500 data',
    withDollar: false,
  },
  {
    id: 'gold',
    url: (period) => `/api/gold?period=${period}`,
    fetchError: 'Failed to fetch gold data',
    withDollar: false,
  },
  {
    id: 'bitcoin',
    url: (period) => `/api/crypto?crypto=bitcoin&period=${period}`,
    fetchError: 'Failed to fetch Bitcoin data',
    withDollar: true,
  },
  {
    id: 'ethereum',
    url: (period) => `/api/crypto?crypto=ethereum&period=${period}`,
    fetchError: 'Failed to fetch Ethereum data',
    withDollar: true,
  },
]

export function formatChartDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatFixed(value: number, digits = 2): string {
  return value.toFixed(digits)
}

/** Y-axis range with a little air above and below the series. */
export function chartDomain(
  data: readonly ChartPoint[],
  paddingRatio = 0.1
): [number, number] {
  if (data.length === 0) return [0, 100]

  let min = data[0].value
  let max = data[0].value
  for (const point of data) {
    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
  }

  const padding = (max - min) * paddingRatio
  return [min - padding, max + padding]
}

export function isRateLimitError(message: string): boolean {
  return message.toLowerCase().includes('rate limit') || message.includes('429')
}

export function formatMoney(value: number, withDollar: boolean): string {
  return `${withDollar ? '$' : ''}${formatFixed(value)}`
}

/**
 * A positive change gets a plus. A negative change keeps the minus that
 * `toFixed` already prints, and the dollar sign stays in front of that
 * minus (`$-12.00`), which is how the crypto cards were written.
 */
export function formatSignedMoney(value: number, withDollar: boolean): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatMoney(value, withDollar)}`
}

export function formatSignedPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatFixed(value)}%`
}
