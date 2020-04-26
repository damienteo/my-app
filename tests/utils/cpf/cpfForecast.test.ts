import moment from 'moment'
import {
  roundTo2Dec,
  getAge,
  getCPFAllocation,
  calculateFutureValues,
} from '../../../utils/cpf/cpfForecast'
import { cpfAllocation } from '../../../constants'
import { AccountValues } from '../../../utils/cpf/types'

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

describe('getCPFAllocation should return the right interest rates', () => {
  test('Should return CPF rates for age below 36 if value is 25', () => {
    expect(getCPFAllocation(25)).toBe(cpfAllocation['35AndBelow'])
  })
  test('Should return CPF rates for age equal to 36 if value is 36', () => {
    expect(getCPFAllocation(36)).toBe(cpfAllocation['36to45'])
  })
  test('Should return CPF rates for age equal to 46 if value is 46', () => {
    expect(getCPFAllocation(46)).toBe(cpfAllocation['46to50'])
  })
  test('Should return CPF rates for age equal to 51 if value is 51', () => {
    expect(getCPFAllocation(51)).toBe(cpfAllocation['51to55'])
  })
  test('Should return CPF rates for age equal to 56 if value is 56', () => {
    expect(getCPFAllocation(56)).toBe(cpfAllocation['56to60'])
  })
  test('Should return CPF rates for age equal to 61 if value is 61', () => {
    expect(getCPFAllocation(61)).toBe(cpfAllocation['61to65'])
  })
  test('Should return CPF rates for age equal to 66 if value is 66', () => {
    expect(getCPFAllocation(66)).toBe(cpfAllocation['66andAbove'])
  })
  test('Should return CPF rates for age equal to 70 if value is 70', () => {
    expect(getCPFAllocation(70)).toBe(cpfAllocation['66andAbove'])
  })
})

describe('calculateFutureValues should return the right values', () => {
  const date16YearsAgo = moment().subtract(16, 'y')

  const normalValues: AccountValues = {
    ordinaryAccount: '1000',
    specialAccount: '1000',
    monthlySalary: '1000',
    salaryIncreaseRate: '1',
    selectedDate: date16YearsAgo,
    housingLoan: '1000',
    housingLoanDate: moment(),
    specialAccountOnly: false,
  }

  const result = calculateFutureValues(normalValues)

  test('Should not have ComparisoValues if un-needed as there is no Special Account scenario', () => {
    expect(result.comparisonValues).not.toBeDefined()
  })

  const nextValues = { ...normalValues, specialAccountOnly: true }
  const nextResult = calculateFutureValues(nextValues)

  test('Should have ComparisoValues if un-needed as there is Special Account scenario', () => {
    expect(nextResult.comparisonValues).toBeDefined()
  })
})
