import en from '../../messages/en.json'
import jp from '../../messages/jp.json'
import {
  chartDomain,
  formatFixed,
  formatMoney,
  formatSignedMoney,
  formatSignedPercent,
  isRateLimitError,
  priceSeries,
} from '../../src/app/[locale]/components/views/dailyChecks/priceSeries'

describe('chartDomain', () => {
  it('gives an empty series a range the axis can draw', () => {
    expect(chartDomain([])).toEqual([0, 100])
  })

  it('adds ten percent of the range on each side', () => {
    expect(
      chartDomain([
        { date: 'a', value: 10 },
        { date: 'b', value: 20 },
      ])
    ).toEqual([9, 21])
  })

  it('honours a caller-supplied padding ratio', () => {
    expect(
      chartDomain(
        [
          { date: 'a', value: 0 },
          { date: 'b', value: 100 },
        ],
        0
      )
    ).toEqual([0, 100])
  })
})

describe('isRateLimitError', () => {
  it('matches a rate-limit message without caring about case', () => {
    expect(isRateLimitError('Rate Limit exceeded')).toBe(true)
  })

  it('matches an HTTP 429', () => {
    expect(isRateLimitError('status 429')).toBe(true)
  })

  it('ignores other failures', () => {
    expect(isRateLimitError('Failed to fetch gold data')).toBe(false)
  })
})

describe('price formatting', () => {
  it('leaves the index and gold without a currency sign', () => {
    expect(formatMoney(12.5, false)).toBe('12.50')
  })

  it('puts the dollar sign where the crypto cards put it', () => {
    expect(formatSignedMoney(12, true)).toBe('+$12.00')
    expect(formatSignedMoney(-12, true)).toBe('$-12.00')
  })

  it('keeps the minus that toFixed already prints', () => {
    expect(formatSignedPercent(-1.2)).toBe('-1.20%')
    expect(formatSignedPercent(1.2)).toBe('+1.20%')
  })

  it('formats a fixed number of digits', () => {
    expect(formatFixed(1, 4)).toBe('1.0000')
  })
})

describe('shared daily-checks copy', () => {
  const assetIds = ['sp500', 'gold', 'bitcoin', 'ethereum'] as const

  it.each([
    ['en', en],
    ['jp', jp],
  ] as const)(
    '%s keeps the repeated price lines in one place',
    (_locale, messages) => {
      const page = messages.DailyChecksPage
      expect(page.price.currentPrice.length).toBeGreaterThan(0)
      expect(page.price.chartTitle.length).toBeGreaterThan(0)
      expect(page.periods['1year'].length).toBeGreaterThan(0)
      expect(page.forex).not.toHaveProperty('periods')

      for (const id of assetIds) {
        const asset = page[id]
        expect(asset.title.length).toBeGreaterThan(0)
        expect(asset.loading.length).toBeGreaterThan(0)
        expect(asset.error.length).toBeGreaterThan(0)
        expect(asset).not.toHaveProperty('currentPrice')
        expect(asset).not.toHaveProperty('periods')
        expect(asset).not.toHaveProperty('chartTitle')
      }
    }
  )

  it('asks each series for its own endpoint', () => {
    const urls = priceSeries.map((series) => series.url('1month'))
    expect(urls).toEqual([
      '/api/sp500?period=1month',
      '/api/gold?period=1month',
      '/api/crypto?crypto=bitcoin&period=1month',
      '/api/crypto?crypto=ethereum&period=1month',
    ])
    expect(
      priceSeries.filter((series) => series.withDollar).map((s) => s.id)
    ).toEqual(['bitcoin', 'ethereum'])
  })
})
