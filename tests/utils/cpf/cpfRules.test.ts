import dayjs from 'dayjs'
import { CPFAccount } from '../../../utils/cpf/classes/cpfAccount'
import { AccountValues, Entry } from '../../../utils/cpf/types'
import {
  additionalWageCeiling,
  basicHealthcareSumForMember,
  basicHealthcareSumForYear,
  cpfEffectiveAge,
  monthlyInterest,
  ordinaryWageCeiling,
  retirementSumsForCohort,
  splitContribution,
  contributionBand,
} from '../../../utils/cpf/parameters'

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
  housingLumpSumDate: dayjs('2026-06-15'),
  housingMonthlyPayment: '0',
  housingLoanTenure: '0',
  housingLoanDate: dayjs('2026-06-15'),
  specialAccountOnly: false,
  asOf: dayjs('2026-06-15'),
  ...overrides,
})

const findRow = (rows: Entry[], category: string) => {
  const row = rows.find((entry) => entry.category === category)
  if (!row) throw new Error(`Missing ${category} row`)
  return row
}

describe('2026 CPF parameters', () => {
  test('Ordinary Wage ceiling follows the published steps, including $8,000 from January 2026', () => {
    // $6,800 applied from 1 January 2024, not from September 2025.
    expect(ordinaryWageCeiling(dayjs('2023-08-01'))).toBe(6000)
    expect(ordinaryWageCeiling(dayjs('2023-09-01'))).toBe(6300)
    expect(ordinaryWageCeiling(dayjs('2024-01-01'))).toBe(6800)
    expect(ordinaryWageCeiling(dayjs('2025-09-01'))).toBe(7400)
    expect(ordinaryWageCeiling(dayjs('2026-01-01'))).toBe(8000)
    expect(ordinaryWageCeiling(dayjs('2030-01-01'))).toBe(8000)
  })

  test('Annual ceiling stays $102,000, so the 2026 additional-wage room at the ceiling is $6,000', () => {
    expect(additionalWageCeiling(8000)).toBe(6000)
    expect(additionalWageCeiling(3000)).toBe(66000)
  })

  test('Retirement sums use published cohorts, then 3.5% rounded to $100', () => {
    expect(retirementSumsForCohort(2026)).toEqual({
      brs: 110200,
      frs: 220400,
      ers: 440800,
    })
    expect(retirementSumsForCohort(2027)).toEqual({
      brs: 114100,
      frs: 228200,
      ers: 456400,
    })
    // 114100 * 1.035 = 118093.5, nearest $100 is 118100. Not a published figure.
    expect(retirementSumsForCohort(2028)).toEqual({
      brs: 118100,
      frs: 236200,
      ers: 472400,
    })
  })

  test('Basic Healthcare Sum is published through 2026 and then grows by $3,500', () => {
    expect(basicHealthcareSumForYear(2025)).toBe(75500)
    expect(basicHealthcareSumForYear(2026)).toBe(79000)
    expect(basicHealthcareSumForYear(2027)).toBe(82500)
    expect(basicHealthcareSumForMember(2030, 2026)).toBe(79000)
    expect(basicHealthcareSumForMember(2030, 2065)).toBe(93000)
  })

  test('The contribution band changes the month after the birthday', () => {
    const birth = dayjs('1991-01-13')
    expect(cpfEffectiveAge(birth, dayjs('2026-01-20'))).toBe(34)
    expect(cpfEffectiveAge(birth, dayjs('2026-02-01'))).toBe(35)
    expect(contributionBand(dayjs('2026-01-20'), 34).id).toBe('35AndBelow')
    expect(contributionBand(dayjs('2026-02-01'), 35).id).toBe('above35to45')
  })
})

describe('contributions at the 2026 ceiling', () => {
  const band = contributionBand(dayjs('2026-07-01'), 30)

  test('A $10,000 salary is capped at the $8,000 Ordinary Wage ceiling', () => {
    // Total = round(8000 * 0.37) = 2960.
    // MA = round(2960 * 0.2162) = 639.95
    // SA = round(2960 * 0.1621) = 479.82
    // OA = 2960 - 639.95 - 479.82 = 1840.23
    expect(splitContribution(8000, band)).toEqual({
      ordinary: 1840.23,
      special: 479.82,
      retirement: 0,
      mediSave: 639.95,
      total: 2960,
    })

    const account = new CPFAccount(values({ monthlySalary: '10000' }))
    account.addSalaryAndInterestOverTime(1)
    const row = findRow(account.accountValues.history, 'Contribution')
    expect(row.ordinaryAccount).toBe(1840.23)
    expect(row.specialAccount).toBe(479.82)
    expect(row.mediSaveAccount).toBe(639.95)
  })

  test('A bonus above the additional-wage ceiling is capped at $6,000', () => {
    const account = new CPFAccount(
      values({
        monthlySalary: '10000',
        monthsOfBonus: '2',
        bonusMonth: '6',
      })
    )
    account.addSalaryAndInterestOverTime(1)

    const bonus = findRow(account.accountValues.history, 'Bonus')
    // Eligible bonus = min(20000, 102000 - 8000 * 12) = 6000.
    // Total = 2220. MA 479.96, SA 359.86, OA 1380.18.
    expect(bonus.ordinaryAccount).toBe(1380.18)
    expect(bonus.specialAccount).toBe(359.86)
    expect(bonus.mediSaveAccount).toBe(479.96)
  })
})

describe('allocation changes with age and with the 2027 senior-rate increase', () => {
  test('January of the 35th birthday stays on the younger rates; February does not', () => {
    const january = new CPFAccount(
      values({
        selectedDate: dayjs('1991-01-13'),
        asOf: dayjs('2025-12-13'),
        monthlySalary: '1000',
      })
    )
    january.addSalaryAndInterestOverTime(1)
    const januaryRow = findRow(january.accountValues.history, 'Contribution')
    expect(januaryRow.date).toBe('Jan 2026')
    expect(januaryRow.ordinaryAccount).toBe(230.03)
    expect(januaryRow.specialAccount).toBe(59.98)
    expect(januaryRow.mediSaveAccount).toBe(79.99)

    const february = new CPFAccount(
      values({
        selectedDate: dayjs('1991-01-13'),
        asOf: dayjs('2026-01-13'),
        monthlySalary: '1000',
      })
    )
    february.addSalaryAndInterestOverTime(1)
    const februaryRow = findRow(february.accountValues.history, 'Contribution')
    expect(februaryRow.date).toBe('Feb 2026')
    expect(februaryRow.ordinaryAccount).toBe(210.05)
    expect(februaryRow.specialAccount).toBe(69.97)
    expect(februaryRow.mediSaveAccount).toBe(89.98)
  })

  test('From 2027 a worker above 55 to 60 contributes at 35.5%, into the Retirement Account', () => {
    const account = new CPFAccount(
      values({
        selectedDate: dayjs('1970-03-15'),
        asOf: dayjs('2026-12-15'),
        monthlySalary: '8000',
      })
    )
    account.updateAccountsAtWithdrawalAge()
    account.addSalaryAndInterestOverTime(1)

    const row = findRow(
      account.accountValues.historyAfterWithdrawalAge,
      'Contribution'
    )
    expect(row.date).toBe('Jan 2027')
    // Total = round(8000 * 0.355) = 2840.
    // RA = round(2840 * 0.3661) = 1039.72
    // MA = round(2840 * 0.2957) = 839.79
    // OA = 2840 - 1039.72 - 839.79 = 960.49
    expect(row.ordinaryAccount).toBe(960.49)
    expect(row.retirementAccount).toBe(1039.72)
    expect(row.specialAccount).toBe(0)
    expect(row.mediSaveAccount).toBe(839.79)
  })
})

describe('monthly interest, including extra interest', () => {
  test('Below 55, extra interest on the first $60,000 goes to SA when it is earned on OA', () => {
    // OA 35000 counts only 20000. SA 30000. MA fills the last 10000.
    const interest = monthlyInterest(
      { ordinary: 35000, special: 30000, mediSave: 15000, retirement: 0 },
      false
    )
    // OA base 35000 * 0.025 / 12 = 72.92
    // SA base 100, plus OA extra 16.67, plus SA extra 25 = 141.67
    // MA base 50, plus extra on 10000 = 8.33, total 58.33
    expect(interest).toEqual({
      ordinary: 72.92,
      special: 141.67,
      mediSave: 58.33,
      retirement: 0,
    })
  })

  test('From 55, the first $30,000 earns 2% extra and OA extra interest is credited to the RA', () => {
    const interest = monthlyInterest(
      { ordinary: 15000, special: 0, mediSave: 0, retirement: 10000 },
      true
    )
    // The old code paid this OA balance only 1% extra ($12.50) because the
    // amount was inside the $30,000 tier. It is 2% extra: 15000 * 0.02 / 12 = 25.
    expect(interest.ordinary).toBe(31.25)
    expect(interest.retirement).toBe(75)
    expect(interest.special).toBe(0)
  })
})

describe('Retirement Account formation and MediSave overflow', () => {
  test('Special Account savings above the 2026 Full Retirement Sum move to the Ordinary Account', () => {
    const account = new CPFAccount(
      values({
        selectedDate: dayjs('1971-03-15'),
        asOf: dayjs('2026-03-15'),
        ordinaryAccount: '50000',
        specialAccount: '300000',
      })
    )
    account.updateAccountsAtWithdrawalAge()
    const transfer = findRow(
      account.accountValues.historyAfterWithdrawalAge,
      'Transfer'
    )
    expect(transfer.retirementAccount).toBe(220400)
    expect(transfer.specialAccount).toBe(0)
    expect(transfer.ordinaryAccount).toBe(129600)
  })

  test('Once the Retirement Account is at the Full Retirement Sum, later RA contributions go to the OA', () => {
    const account = new CPFAccount(
      values({
        selectedDate: dayjs('1971-03-15'),
        asOf: dayjs('2026-03-15'),
        ordinaryAccount: '20000',
        specialAccount: '300000',
        monthlySalary: '8000',
      })
    )
    account.updateAccountsAtWithdrawalAge()
    account.addSalaryAndInterestOverTime(1)
    const row = findRow(
      account.accountValues.historyAfterWithdrawalAge,
      'Contribution'
    )
    // April 2026, above 55 to 60, wage $8,000.
    // Total 2720. RA share 919.90 is redirected to OA because the FRS is met.
    // OA share 960.16 + 919.90 = 1880.06. MA 839.94.
    expect(row.date).toBe('Apr 2026')
    expect(row.retirementAccount).toBe(0)
    expect(row.ordinaryAccount).toBe(1880.06)
    expect(row.mediSaveAccount).toBe(839.94)
    expect(row.specialAccount).toBe(0)
  })

  test('MediSave contributions above the 2026 Basic Healthcare Sum flow to the Special Account', () => {
    const account = new CPFAccount(
      values({
        monthlySalary: '8000',
        mediSaveAccount: '79000',
      })
    )
    account.addSalaryAndInterestOverTime(1)
    const row = findRow(account.accountValues.history, 'Contribution')
    expect(row.mediSaveAccount).toBe(0)
    expect(row.specialAccount).toBe(1119.77)
    expect(row.ordinaryAccount).toBe(1840.23)
    expect(account.accountValues.mediSaveAccount).toBe(79000)
  })

  test('Salary rises in January, before that month is contributed', () => {
    const account = new CPFAccount(
      values({
        monthlySalary: '1000',
        salaryIncreaseRate: '10',
        asOf: dayjs('2026-11-15'),
      })
    )
    account.addSalaryAndInterestOverTime(3)

    const rows = account.accountValues.history.filter(
      (entry) => entry.category === 'Contribution'
    )
    const december = rows.find((entry) => entry.date === 'Dec 2026')
    const january = rows.find((entry) => entry.date === 'Jan 2027')
    expect(december?.ordinaryAccount).toBe(230.03)
    // January salary is 1100. Total = round(407) = 407.
    // MA 87.99, SA 65.97, OA 253.04.
    expect(january?.ordinaryAccount).toBe(253.04)
    expect(january?.specialAccount).toBe(65.97)
    expect(account.accountValues.monthlySalary).toBe(1100)
  })
})
