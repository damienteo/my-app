import dayjs, { Dayjs } from 'dayjs'
import { CPFAccount } from './classes'
import { AccountValues, ComparisonValues } from './types'
import { contributionBand } from './parameters'

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

export const getAge = (
  selectedDate: Dayjs,
  timePeriod: 'years' | 'months',
  asOf: Dayjs = dayjs()
) => {
  return asOf.diff(dayjs(selectedDate), timePeriod)
}

/**
 * `effectiveAge` is completed years on the last day of the previous month.
 * The band therefore changes in the month after the birthday, not during it.
 */
export const getCPFAllocation = (
  effectiveAge: number,
  onDate: Dayjs = dayjs()
) => {
  return contributionBand(onDate, effectiveAge)
}

const projectAccount = (values: AccountValues) => {
  const account = new CPFAccount(values)
  const monthsBeforeWithdrawal = account.monthsUntilWithdrawalMonth()
  if (monthsBeforeWithdrawal > 0) {
    account.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
  }
  account.updateAccountsAtWithdrawalAge()
  const monthsUntilPayout = account.monthsUntilPayoutMonth()
  if (monthsUntilPayout > 0) {
    account.addSalaryAndInterestOverTime(monthsUntilPayout, true)
  }
  return account
}

export const calculateFutureValues = (values: AccountValues) => {
  const account = projectAccount(values)

  let comparisonValues: ComparisonValues = undefined
  if (values.specialAccountOnly) {
    const comparison = projectAccount({ ...values, specialAccountOnly: false })
    const {
      ordinaryAccount,
      specialAccount,
      retirementAccount,
      ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge,
    } = comparison.accountValues
    comparisonValues = {
      ordinaryAccount,
      specialAccount,
      retirementAccount,
      ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge,
    }
  }

  return { ...account.accountValues, comparisonValues }
}
