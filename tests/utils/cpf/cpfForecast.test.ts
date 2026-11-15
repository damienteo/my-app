import dayjs from 'dayjs'
import {
  roundTo2Dec,
  getAge,
  getCPFAllocation,
  calculateFutureValues,
} from '../../../utils/cpf/cpfForecast'
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
  const sixteenYearsAgo = dayjs().subtract(16, 'y')
  const thirtyTwoYearsAgo = dayjs().subtract(32, 'y')

  test('Should return the correct values in years or months', () => {
    expect(getAge(sixteenYearsAgo, 'months')).toBe(16 * 12)
    expect(getAge(sixteenYearsAgo, 'years')).toBe(16)
    expect(getAge(thirtyTwoYearsAgo, 'months')).toBe(32 * 12)
    expect(getAge(thirtyTwoYearsAgo, 'years')).toBe(32)
  })
})

describe('getCPFAllocation uses the age band that applies the month after a birthday', () => {
  const in2026 = dayjs('2026-06-01')
  const in2027 = dayjs('2027-06-01')

  test('Effective age 34 is still 35 and below, and 35 is above 35 to 45', () => {
    expect(getCPFAllocation(34, in2026).id).toBe('35AndBelow')
    expect(getCPFAllocation(35, in2026).id).toBe('above35to45')
    expect(getCPFAllocation(44, in2026).id).toBe('above35to45')
    expect(getCPFAllocation(45, in2026).id).toBe('above45to50')
    expect(getCPFAllocation(54, in2026).id).toBe('above50to55')
    expect(getCPFAllocation(55, in2026).id).toBe('above55to60')
    expect(getCPFAllocation(60, in2026).id).toBe('above60to65')
    expect(getCPFAllocation(65, in2026).id).toBe('above65to70')
    expect(getCPFAllocation(70, in2026).id).toBe('above70')
  })

  test('Senior rates rise on 1 January 2027 and the increase is in the Retirement Account', () => {
    expect(getCPFAllocation(57, in2026).totalRate).toBe(0.34)
    expect(getCPFAllocation(57, in2027).totalRate).toBe(0.355)
    expect(getCPFAllocation(57, in2026).savingsAccount).toBe('ra')
    expect(getCPFAllocation(62, in2026).totalRate).toBe(0.25)
    expect(getCPFAllocation(62, in2027).totalRate).toBe(0.26)
  })
})

describe('calculateFutureValues should return the right values', () => {
  const date16YearsAgo = dayjs().subtract(16, 'y')

  const normalValues: AccountValues = {
    ordinaryAccount: '1000',
    specialAccount: '1000',
    monthlySalary: '1000',
    salaryIncreaseRate: '1',
    bonusMonth: '0',
    monthsOfBonus: '0',
    selectedDate: date16YearsAgo,
    housingLumpSum: '1000',
    housingLumpSumDate: dayjs(),
    housingMonthlyPayment: '0',
    housingLoanTenure: '0',
    housingLoanDate: dayjs(),
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
