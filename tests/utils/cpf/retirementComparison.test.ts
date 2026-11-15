import dayjs from 'dayjs'
import { CPFAccount } from '../../../utils/cpf/classes/cpfAccount'
import { AccountValues } from '../../../utils/cpf/types'
import {
  isProjectedRetirementCohort,
  retirementSumsForCohort,
} from '../../../utils/cpf/parameters'

const atFiftyFive = (
  overrides: Partial<AccountValues> = {}
): AccountValues => ({
  ordinaryAccount: '0',
  specialAccount: '0',
  mediSaveAccount: '0',
  monthlySalary: '0',
  salaryIncreaseRate: '0',
  monthsOfBonus: '0',
  bonusMonth: '0',
  selectedDate: dayjs('1971-03-15'),
  housingLumpSum: '0',
  housingLumpSumDate: dayjs('2026-03-15'),
  housingMonthlyPayment: '0',
  housingLoanTenure: '0',
  housingLoanDate: dayjs('2026-03-15'),
  specialAccountOnly: false,
  asOf: dayjs('2026-03-15'),
  ...overrides,
})

describe('Full Retirement Sum comparison', () => {
  test('a 2026 cohort uses the published FRS and is not marked projected', () => {
    expect(isProjectedRetirementCohort(2026)).toBe(false)
    expect(retirementSumsForCohort(2026).frs).toBe(220400)

    const account = new CPFAccount(atFiftyFive())
    account.updateAccountsAtWithdrawalAge()

    expect(account.accountValues.cohortYear).toBe(2026)
    expect(account.accountValues.fullRetirementSum).toBe(220400)
    expect(isProjectedRetirementCohort(account.accountValues.cohortYear)).toBe(
      false
    )
  })

  test('a later cohort uses the projected FRS', () => {
    expect(isProjectedRetirementCohort(2028)).toBe(true)
    // 114100 * 1.035 = 118093.5, nearest $100 is 118100. FRS is twice that.
    expect(retirementSumsForCohort(2028)).toEqual({
      brs: 118100,
      frs: 236200,
      ers: 472400,
    })

    const account = new CPFAccount(
      atFiftyFive({
        selectedDate: dayjs('1973-03-15'),
        asOf: dayjs('2028-03-15'),
      })
    )
    account.updateAccountsAtWithdrawalAge()

    expect(account.accountValues.cohortYear).toBe(2028)
    expect(account.accountValues.fullRetirementSum).toBe(236200)
    expect(isProjectedRetirementCohort(account.accountValues.cohortYear)).toBe(
      true
    )
  })

  test('shortfall and excess use Special plus Ordinary Account, and the RA receives only up to the FRS', () => {
    const short = new CPFAccount(
      atFiftyFive({ ordinaryAccount: '50000', specialAccount: '30000' })
    )
    short.updateAccountsAtWithdrawalAge()
    const shortAvailable = 80000
    const frs = 220400
    expect(short.accountValues.fullRetirementSum).toBe(frs)
    expect(
      short.accountValues.ordinaryAccountAtWithdrawalAge +
        short.accountValues.specialAccountAtWithdrawalAge
    ).toBe(shortAvailable)
    expect(frs - shortAvailable).toBe(140400)
    expect(short.accountValues.retirementAccount).toBe(shortAvailable)

    const extra = new CPFAccount(
      atFiftyFive({ ordinaryAccount: '200000', specialAccount: '100000' })
    )
    extra.updateAccountsAtWithdrawalAge()
    const extraAvailable = 300000
    expect(extraAvailable - frs).toBe(79600)
    expect(extra.accountValues.retirementAccount).toBe(frs)
    expect(extra.accountValues.specialAccount).toBe(0)
    expect(extra.accountValues.ordinaryAccount).toBe(79600)
  })
})
