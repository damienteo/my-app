import moment from 'moment'
import { roundTo2Dec, getAge } from '../../../utils/cpf/cpfForecast'

describe('roundTo2Dec should ensure that values do not go beyond three decimal places', () => {
  test('Should not go beyong three decimal places', () => {
    expect(roundTo2Dec('5')).toBe('5')
    expect(roundTo2Dec('5.5')).toBe('5.5')
    expect(roundTo2Dec('5.55')).toBe('5.55')
    expect(roundTo2Dec('5.555')).toBe('5.55')
    expect(roundTo2Dec('9')).toBe('9')
    expect(roundTo2Dec('9.9')).toBe('9.9')
    expect(roundTo2Dec('9.99')).toBe('9.99')
    expect(roundTo2Dec('9.999')).toBe('9.99')
  })
})

describe('roundTo2Dec should clear leading 0s', () => {
  test('Should not go beyong three decimal places', () => {
    expect(roundTo2Dec('05')).toBe('5')
    expect(roundTo2Dec('005')).toBe('5')
    expect(roundTo2Dec('0005')).toBe('5')
    expect(roundTo2Dec('05.5')).toBe('5.5')
    expect(roundTo2Dec('05.55')).toBe('5.55')
    expect(roundTo2Dec('05.555')).toBe('5.55')
    expect(roundTo2Dec('005.555')).toBe('5.55')
    expect(roundTo2Dec('0005.555')).toBe('5.55')
    expect(roundTo2Dec('00005.555')).toBe('5.55')
  })
})

describe('roundTo2Dec should not clear leading 0s if value starts with 0.xxx', () => {
  test('Should not go beyong three decimal places', () => {
    expect(roundTo2Dec('0')).toBe('0')
    expect(roundTo2Dec('0.0')).toBe('0.0')
    expect(roundTo2Dec('0.00')).toBe('0.00')
    expect(roundTo2Dec('0.000')).toBe('0.00')
    expect(roundTo2Dec('0')).toBe('0')
    expect(roundTo2Dec('0.1')).toBe('0.1')
    expect(roundTo2Dec('0.11')).toBe('0.11')
    expect(roundTo2Dec('0.111')).toBe('0.11')
  })
})

describe('getAge function should return the correct values based on calculated duration', () => {
  const sixteenYearsAgo = moment().subtract(16, 'y')
  const thirtyTwoYearsAgo = moment().subtract(32, 'y')

  test('Should return the correct values in years or months', () => {
    expect(getAge(sixteenYearsAgo, 'months')).toBe(16 * 12)
    expect(getAge(sixteenYearsAgo, 'years')).toBe(16)
    expect(getAge(thirtyTwoYearsAgo, 'months')).toBe(32 * 12)
    expect(getAge(thirtyTwoYearsAgo, 'years')).toBe(32)
  })
})
