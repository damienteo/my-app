import { allocationBandsForYear } from '../../../utils/cpf/parameters'

/**
 * Wage shares below are the published allocation of wages above $750.
 * CPF's PDFs publish those as ratios of the contribution. Multiplying by
 * the total contribution rate recovers the wage percentage. The ratios are
 * rounded to 4 decimal places, so the product is allowed to differ from the
 * published percentage by up to 0.0005.
 *
 * Under 55, MediSave is 8%, 9%, 10% and 10.5%. That matches the 1 January
 * 2026 allocation PDF (MediSave ratios 0.2162, 0.2432, 0.2702, 0.2837 of a
 * 37% contribution). No figure had to be changed.
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/jan2027cpfallocationrates.pdf
 */
const ratioTolerance = 0.0005

const expectClose = (actual: number, expected: number) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(ratioTolerance)
}

const bandIn = (year: number, id: string) => {
  const band = allocationBandsForYear(year).find((item) => item.id === id)
  if (!band) throw new Error(`No ${id} band in ${year}`)
  return band
}

describe('allocation band ratios, ages and account', () => {
  test.each([2026, 2027, 2030])(
    '%i: ratios sum to 1, ages increase, and savings go to SA before 55 and RA from 55',
    (year) => {
      const bands = allocationBandsForYear(year)
      expect(bands).toHaveLength(8)

      let previousAge = -1
      bands.forEach((band) => {
        expectClose(
          band.ordinaryRatio + band.savingsRatio + band.mediSaveRatio,
          1
        )
        expect(band.maxEffectiveAge).toBeGreaterThan(previousAge)
        previousAge = band.maxEffectiveAge
        expect(band.savingsAccount).toBe(
          band.maxEffectiveAge < 55 ? 'sa' : 'ra'
        )
      })
    }
  )
})

describe('under-55 wage percentages', () => {
  test.each([
    ['35 and below', '35AndBelow', 0.23, 0.06, 0.08],
    ['Above 35 to 45', 'above35to45', 0.21, 0.07, 0.09],
    ['Above 45 to 50', 'above45to50', 0.19, 0.08, 0.1],
    ['Above 50 to 55', 'above50to55', 0.15, 0.115, 0.105],
  ] as const)(
    '%s is OA %s, SA %s and MediSave %s of wages',
    (_label, id, ordinary, savings, mediSave) => {
      for (const year of [2026, 2027, 2030]) {
        const band = bandIn(year, id)
        expectClose(band.totalRate * band.ordinaryRatio, ordinary)
        expectClose(band.totalRate * band.savingsRatio, savings)
        expectClose(band.totalRate * band.mediSaveRatio, mediSave)
      }
    }
  )
})

describe('senior wage percentages', () => {
  test.each([
    [2026, 'Above 55 to 60', 'above55to60', 0.12, 0.115, 0.105],
    [2026, 'Above 60 to 65', 'above60to65', 0.035, 0.11, 0.105],
    [2026, 'Above 65 to 70', 'above65to70', 0.01, 0.05, 0.105],
    [2026, 'Above 70', 'above70', 0.01, 0.01, 0.105],
    [2027, 'Above 55 to 60', 'above55to60', 0.12, 0.13, 0.105],
    [2027, 'Above 60 to 65', 'above60to65', 0.035, 0.12, 0.105],
    [2027, 'Above 65 to 70', 'above65to70', 0.01, 0.05, 0.105],
    [2027, 'Above 70', 'above70', 0.01, 0.01, 0.105],
  ] as const)(
    '%i %s is OA %s, RA %s and MediSave %s of wages',
    (year, _label, id, ordinary, savings, mediSave) => {
      const band = bandIn(year, id)
      expect(band.savingsAccount).toBe('ra')
      expectClose(band.totalRate * band.ordinaryRatio, ordinary)
      expectClose(band.totalRate * band.savingsRatio, savings)
      expectClose(band.totalRate * band.mediSaveRatio, mediSave)
    }
  )

  test('2030 keeps the 2027 senior table, because later rates are not published', () => {
    const senior = (year: number) =>
      allocationBandsForYear(year).filter(
        (band) => band.savingsAccount === 'ra'
      )
    expect(senior(2030)).toEqual(senior(2027))
  })
})
