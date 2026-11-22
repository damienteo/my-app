/**
 * Normalize Yahoo Finance chart/historical timestamps to YYYY-MM-DD (UTC).
 * chart() quotes use Date objects; other sources may use Unix seconds or ISO strings.
 */
export function toIsoDay(value: Date | number | string): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null
    }
    return value.toISOString().split('T')[0]
  }

  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value
    const date = new Date(ms)
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return date.toISOString().split('T')[0]
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return date.toISOString().split('T')[0]
  }

  return null
}

export interface ChartQuoteLike {
  date?: Date | number | string | null
  close?: number | null
}

export interface HistoricalDataPoint {
  date: string
  value: number
}

export function mapYahooChartQuotesToHistorical(
  quotes: ChartQuoteLike[]
): HistoricalDataPoint[] {
  return quotes
    .map((quote) => {
      if (quote.date == null || quote.close == null) {
        return null
      }
      const isoDay = toIsoDay(quote.date)
      if (!isoDay || quote.close <= 0) {
        return null
      }
      return { date: isoDay, value: quote.close }
    })
    .filter((item): item is HistoricalDataPoint => item !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
}
