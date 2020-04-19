import { getYearsAndMonths } from '../../../utils/utils'

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
