import moment from 'moment'
import { CPFAccount } from './cpfAccount'
import { withdrawalAge, payoutAge } from '../constants'

export interface Values {
  ordinaryAccount: string
  specialAccount: string
  monthlySalary: string
}

export const roundTo2Dec = (value: string) => {
  let nextValue = value === '0' ? '0' : value.replace(/^0+/, '')

  const decimalPlace = nextValue.indexOf('.')
  const isTooLong = nextValue.length > decimalPlace + 3
  const invalidNum = isNaN(parseFloat(nextValue))

  if ((decimalPlace >= 0 && isTooLong) || invalidNum) {
    nextValue = nextValue.slice(0, -1)
  }

  return nextValue
}

export const getAge = (
  selectedDate: moment.Moment,
  timePeriod: 'years' | 'months'
) => {
  const current = moment()
  const birthday = moment(selectedDate)
  const duration = current.diff(birthday, timePeriod)
  return duration
}

const getMonthsTillEOY = (date = moment()) => {
  const currentYear = moment().year()
  const startOfNextYear = moment(`01/01/${currentYear + 1}`, 'DD/MM/YYYY')
  const monthsTillInterest = startOfNextYear.diff(date, 'months')

  return monthsTillInterest
}

export const calculateFutureValues = (
  values: Values,
  selectedDate: moment.Moment
) => {
  const newAccount = new CPFAccount(values, selectedDate)

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

  return newAccount.accountValues
}
