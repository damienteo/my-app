import {
  getYearsAndMonths,
  formatCurrency,
  normalRound,
} from '../../../utils/utils'

describe('getYearsAndMonths should return correct strings', () => {
  test('Should return 0 months if period is 0', () => {
    expect(getYearsAndMonths(0)).toBe('0 months')
  })

  test('Should return 1 month if period is 1', () => {
    expect(getYearsAndMonths(1)).toBe('1 month')
  })

  test('Should return 2 months if period is 1', () => {
    expect(getYearsAndMonths(2)).toBe('2 months')
  })

  test('Should return 1 year and 0 months if period is 12', () => {
    expect(getYearsAndMonths(12)).toBe('1 year and 0 months')
  })

  test('Should return 1 year and 1 month if period is 13', () => {
    expect(getYearsAndMonths(13)).toBe('1 year and 1 month')
  })

  test('Should return 1 year and 2 months if period is 14', () => {
    expect(getYearsAndMonths(14)).toBe('1 year and 2 months')
  })

  test('Should return 2 years and 0 months if period is 24', () => {
    expect(getYearsAndMonths(24)).toBe('2 years and 0 months')
  })

  test('Should return 2 years and 1 month if period is 25', () => {
    expect(getYearsAndMonths(25)).toBe('2 years and 1 month')
  })

  test('Should return 2 years and 2 months if period is 26', () => {
    expect(getYearsAndMonths(26)).toBe('2 years and 2 months')
  })
})

describe('formatCurrency should return strings with commas and two decimal places', () => {
  test('Should return $0.00 if value is 0', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
  test('Should return $0.01 if value is 0.01', () => {
    expect(formatCurrency(0.01)).toBe('$0.01')
  })
  test('Should round down and return $0.01 if value is 0.014', () => {
    expect(formatCurrency(0.014)).toBe('$0.01')
  })
  test('Should round up and return $0.02 if value is 0.015', () => {
    expect(formatCurrency(0.015)).toBe('$0.02')
  })
  test('Should round up and return $0.02 if value is 0.016', () => {
    expect(formatCurrency(0.016)).toBe('$0.02')
  })
  test('Should return $1.02 if value is 1.016', () => {
    expect(formatCurrency(1.016)).toBe('$1.02')
  })
  test('Should return $101.02 if value is 101.016', () => {
    expect(formatCurrency(101.016)).toBe('$101.02')
  })
  test('Should insert a comma in the thousands place and return $1,101.02 if value is 1101.016', () => {
    expect(formatCurrency(1101.016)).toBe('$1,101.02')
  })
  test('Should insert a comma in the thousands place and return $999,101.02 if value is 999101.016', () => {
    expect(formatCurrency(999101.016)).toBe('$999,101.02')
  })
  test('Should insert a comma in the millions and thousands place and return $1,999,101.02 if value is 1999101.016', () => {
    expect(formatCurrency(1999101.016)).toBe('$1,999,101.02')
  })
})

describe('normalRound should return number values with 2 decimal places', () => {
  test('Should return 0.00 if value is 0', () => {
    expect(normalRound(0.0)).toBe(0.0)
  })
  test('Should return 0.01 if value is 0.01', () => {
    expect(normalRound(0.01)).toBe(0.01)
  })
  test('Should round down and  return 0.00 if value is 0.004', () => {
    expect(normalRound(0.004)).toBe(0.0)
  })
  test('Should round up and return 0.01 if value is 0.005', () => {
    expect(normalRound(0.005)).toBe(0.01)
  })
  test('Should return 0.05 if value is 0.05', () => {
    expect(normalRound(0.05)).toBe(0.05)
  })
  test('Should round down and return 0.05 if value is 0.054', () => {
    expect(normalRound(0.054)).toBe(0.05)
  })
  test('Should round up and return 0.06 if value is 0.055', () => {
    expect(normalRound(0.055)).toBe(0.06)
  })
})
