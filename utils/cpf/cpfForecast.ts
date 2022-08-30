import dayjs, { Dayjs } from 'dayjs'
import { CPFAccount } from './classes'
import { cpfAllocation, withdrawalAge, payoutAge } from '../../constants'
import { AccountValues, ComparisonValues } from './types'

export const roundTo2Dec = (value: string) => {
  const isLeadingWithZero = value[0] === '0' && value[1] === '.'

  const isExcludedCondition = value === '0' || isLeadingWithZero

  let nextValue = isExcludedCondition ? value : value.replace(/^0+/, '')

  const decimalPlace = nextValue.indexOf('.')
  const isTooLong = nextValue.length > decimalPlace + 3
  const invalidNum = isNaN(parseFloat(nextValue))

  if ((decimalPlace >= 0 && isTooLong) || invalidNum) {
    nextValue = nextValue.slice(0, -1)
  }

  return nextValue
}

export const getAge = (selectedDate: Dayjs, timePeriod: 'years' | 'months') => {
  const current = dayjs()
  const birthday = dayjs(selectedDate)
  const duration = current.diff(birthday, timePeriod)
  return duration
}

export const getMonthsTillEOY = (date = dayjs()) => {
  const endOfYear = dayjs().endOf('year')
  const monthsTillInterest = endOfYear.diff(date, 'months')

  return monthsTillInterest
}

export const getCPFAllocation = (age: number) => {
  if (age <= 35) return cpfAllocation['35AndBelow']

  if (age >= 36 && age <= 45) return cpfAllocation['36to45']

  if (age >= 46 && age <= 50) return cpfAllocation['46to50']

  if (age >= 51 && age <= 55) return cpfAllocation['51to55']

  if (age >= 56 && age <= 60) return cpfAllocation['56to60']

  if (age >= 61 && age <= 65) return cpfAllocation['61to65']

  return cpfAllocation['66andAbove']
}

export const calculateFutureValues = (values: AccountValues) => {
  const newAccount = new CPFAccount(values)

  // CPF interest is computed monthly. It is then credited to your respective accounts and compounded annually. CPF interest earned in 2019 will be credited to members’ CPF accounts by the end of 1 January 2020(https://www.cpf.gov.sg/members/FAQ/schemes/other-matters/others/FAQDetails?category=other+matters&group=Others&ajfaqid=2192131&folderid=13726).

  // Add simple interest based on months, and add interest to sum annually every 1st Jan

  // Calculate salary contributions and interest until the end of the year
  // FIXME: Should not get months till EOY if subject is already 55 years old
  const monthsTillEOY = getMonthsTillEOY()
  newAccount.addSalaryAndInterestOverTime(monthsTillEOY)

  // Calculate number of years left in which salary contributions and interest is added to account at end of the year
  const monthsOfInterestAfterThisYear =
    newAccount.monthsTillWithdrawal - monthsTillEOY
  const remainingMonths = monthsOfInterestAfterThisYear % 12
  const monthsOfFullYears = monthsOfInterestAfterThisYear - remainingMonths
  // Calculate salary contributions and interests for the remaining full years
  newAccount.addSalaryAndInterestOverTime(monthsOfFullYears)

  // Calculate salary contributions and interest for the remaining months until 55
  newAccount.addSalaryAndInterestOverTime(remainingMonths)

  newAccount.updateAccountsAtWithdrawalAge()

  // Calculate number of months from withdrawal age (currently 55) till payoutAge (currently 65), which is when CPF LIFE starts
  // Update balance till EOY of withdrawal year
  const { selectedDate } = values
  const monthsTillEndOfWithdrawalYear = getMonthsTillEOY(selectedDate) % 12
  newAccount.addSalaryAndInterestOverTime(monthsTillEndOfWithdrawalYear)

  // Update balance for remaining full years
  const periodTillPayout = (payoutAge - withdrawalAge) * 12
  const monthsAfterWithdrawalYear =
    periodTillPayout - monthsTillEndOfWithdrawalYear
  const remainingMonthsOfWithDrawalPeriod = monthsAfterWithdrawalYear % 12
  const monthsOfFullYearsAfterWithdrawalYear =
    monthsAfterWithdrawalYear - remainingMonthsOfWithDrawalPeriod

  newAccount.addSalaryAndInterestOverTime(monthsOfFullYearsAfterWithdrawalYear)

  // Update balance for remaining months
  newAccount.addSalaryAndInterestOverTime(remainingMonthsOfWithDrawalPeriod)

  let comparisonValues: ComparisonValues = undefined
  if (values.specialAccountOnly) {
    const nextValues = { ...values, specialAccountOnly: false }
    const nextAccount = new CPFAccount(nextValues)
    nextAccount.addSalaryAndInterestOverTime(monthsTillEOY)
    nextAccount.addSalaryAndInterestOverTime(monthsOfFullYears)
    nextAccount.addSalaryAndInterestOverTime(remainingMonths)
    nextAccount.updateAccountsAtWithdrawalAge()
    nextAccount.addSalaryAndInterestOverTime(monthsTillEndOfWithdrawalYear)
    nextAccount.addSalaryAndInterestOverTime(
      monthsOfFullYearsAfterWithdrawalYear
    )
    nextAccount.addSalaryAndInterestOverTime(remainingMonthsOfWithDrawalPeriod)
    const {
      ordinaryAccount,
      specialAccount,
      retirementAccount,
      ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge,
    } = nextAccount.accountValues
    comparisonValues = {
      ordinaryAccount,
      specialAccount,
      retirementAccount,
      ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge,
    }
  }

  const prevValues = newAccount.accountValues
  const nextValues = { ...prevValues, comparisonValues }

  return nextValues
}
