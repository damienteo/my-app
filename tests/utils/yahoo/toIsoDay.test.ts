import {
  mapYahooChartQuotesToHistorical,
  toIsoDay,
} from '../../../utils/yahoo/toIsoDay'

describe('toIsoDay', () => {
  test('converts Date input to YYYY-MM-DD', () => {
    const date = new Date('2025-06-15T16:00:00.000Z')
    expect(toIsoDay(date)).toBe('2025-06-15')
  })

  test('converts Unix seconds input', () => {
    expect(toIsoDay(1718452800)).toBe('2024-06-15')
  })

  test('converts ISO string input', () => {
    expect(toIsoDay('2024-03-10T12:00:00.000Z')).toBe('2024-03-10')
  })

  test('passes through existing YYYY-MM-DD strings', () => {
    expect(toIsoDay('2024-01-02')).toBe('2024-01-02')
  })

  test('returns null for invalid values', () => {
    expect(toIsoDay(new Date('invalid'))).toBeNull()
    expect(toIsoDay(Number.NaN)).toBeNull()
  })
})

describe('mapYahooChartQuotesToHistorical', () => {
  test('returns dates sorted ascending', () => {
    const quotes = [
      { date: new Date('2025-03-01T00:00:00.000Z'), close: 5100 },
      { date: new Date('2025-01-15T00:00:00.000Z'), close: 4800 },
      { date: new Date('2025-02-10T00:00:00.000Z'), close: 4950 },
    ]

    const result = mapYahooChartQuotesToHistorical(quotes)
    expect(result.map((p) => p.date)).toEqual([
      '2025-01-15',
      '2025-02-10',
      '2025-03-01',
    ])
  })

  test('last point is near today for recent Yahoo-style quotes', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)

    const weekAgo = new Date(yesterday)
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)

    const result = mapYahooChartQuotesToHistorical([
      { date: weekAgo, close: 5800 },
      { date: yesterday, close: 5900 },
    ])

    const lastDate = new Date(result[result.length - 1].date + 'T00:00:00.000Z')
    const diffDays =
      (today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDays).toBeLessThan(3)
  })

  test('does not produce scrambled far-future years from Date objects', () => {
    const quotes = [
      { date: new Date('2025-08-20T00:00:00.000Z'), close: 6400 },
      { date: new Date('2025-05-16T00:00:00.000Z'), close: 5900 },
    ]
    const result = mapYahooChartQuotesToHistorical(quotes)
    expect(result.every((p) => p.date.startsWith('2025-'))).toBe(true)
  })
})
