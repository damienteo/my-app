import dayjs from 'dayjs'
import { CPFAccount } from '../../../utils/cpf/classes/cpfAccount'
import { AccountValues, Entry } from '../../../utils/cpf/types'

const values = (overrides: Partial<AccountValues> = {}): AccountValues => ({
  ordinaryAccount: '0',
  specialAccount: '0',
  mediSaveAccount: '0',
  monthlySalary: '0',
  salaryIncreaseRate: '0',
  monthsOfBonus: '0',
  bonusMonth: '0',
  selectedDate: dayjs('1996-06-15'),
  housingLumpSum: '0',
  housingLumpSumDate: dayjs('2026-08-15'),
  housingMonthlyPayment: '0',
  housingLoanTenure: '0',
  housingLoanDate: dayjs('2026-07-15'),
  specialAccountOnly: false,
  asOf: dayjs('2026-06-15'),
  ...overrides,
})

const rows = (entries: Entry[], category: string) =>
  entries.filter((entry) => entry.category === category)

describe('optional CPF inputs', () => {
  test('a bonus month adds a contribution capped by the additional wage ceiling', () => {
    const account = new CPFAccount(
      values({
        monthlySalary: '10000',
        monthsOfBonus: '2',
        bonusMonth: '6',
      })
    )
    account.addSalaryAndInterestOverTime(1)

    const bonus = rows(account.accountValues.history, 'Bonus')
    expect(bonus).toHaveLength(1)
    expect(bonus[0].date).toBe('Jul 2026')
    // Bonus is $20,000. Ordinary wages at the $8,000 ceiling use $96,000 of
    // the $102,000 annual ceiling, so $6,000 of the bonus attracts CPF.
    // 35-and-below split of $6,000: OA 1380.18, SA 359.86, MA 479.96.
    expect(bonus[0].ordinaryAccount).toBe(1380.18)
    expect(bonus[0].specialAccount).toBe(359.86)
    expect(bonus[0].mediSaveAccount).toBe(479.96)
  })

  test('a housing lump sum reduces the Ordinary Account in that month', () => {
    const account = new CPFAccount(
      values({
        ordinaryAccount: '10000',
        housingLumpSum: '2000',
        housingLumpSumDate: dayjs('2026-08-15'),
      })
    )
    account.addSalaryAndInterestOverTime(3)

    const lumpSum = rows(account.accountValues.history, 'Housing Lump Sum')
    expect(lumpSum).toHaveLength(1)
    expect(lumpSum[0].date).toBe('Aug 2026')
    expect(lumpSum[0].ordinaryAccount).toBe(-2000)

    const balance = account.accountValues.history.find(
      (entry) => entry.category === 'Balance' && entry.date === 'Aug 2026'
    )
    expect(balance?.ordinaryAccount).toBe(8000)
  })

  test('a housing loan deducts each month of the tenure and then stops', () => {
    const account = new CPFAccount(
      values({
        ordinaryAccount: '50000',
        housingMonthlyPayment: '100',
        housingLoanTenure: '1',
        housingLoanDate: dayjs('2026-07-15'),
      })
    )
    account.addSalaryAndInterestOverTime(14)

    const payments = rows(account.accountValues.history, 'Housing Loan')
    expect(payments).toHaveLength(12)
    expect(payments[0].date).toBe('Jul 2026')
    expect(payments[0].ordinaryAccount).toBe(-100)
    expect(payments[11].date).toBe('Jun 2027')
    expect(
      account.accountValues.history.some(
        (entry) =>
          entry.category === 'Housing Loan' && entry.date === 'Jul 2027'
      )
    ).toBe(false)
  })

  test('special-account-only moves Ordinary Account money and contributions into the Special Account', () => {
    const account = new CPFAccount(
      values({
        ordinaryAccount: '5000',
        specialAccount: '1000',
        monthlySalary: '1000',
        specialAccountOnly: true,
      })
    )
    account.addSalaryAndInterestOverTime(1)

    const contribution = rows(account.accountValues.history, 'Contribution')[0]
    expect(contribution.ordinaryAccount).toBe(0)
    expect(contribution.specialAccount).toBe(290.01)
    expect(account.accountValues.specialAccount).toBeGreaterThan(6000)
    expect(account.accountValues.ordinaryAccount).toBe(0)
  })

  test('an Ordinary Account that cannot cover a lump sum records an error', () => {
    const account = new CPFAccount(
      values({
        ordinaryAccount: '100',
        housingLumpSum: '5000',
        housingLumpSumDate: dayjs('2026-06-15'),
      })
    )
    account.addSalaryAndInterestOverTime(1)

    expect(account.accountValues.errors.housingLumpSum).toContain(
      'ordinary account'
    )
    expect(
      account.accountValues.history.some(
        (entry) => entry.category === 'Housing Lump Sum'
      )
    ).toBe(false)
    expect(account.accountValues.ordinaryAccount).toBe(100)
  })
})
