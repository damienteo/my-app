import moment from 'moment'
import { cpfAllocation, withdrawalAge, payoutAge } from '../../../constants'
import { getCPFAllocation, CPFAccount } from '../../../utils/cpf/cpfAccount'

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

const date16YearsAgo = moment().subtract(16, 'y')
const yearsBeforeWithdrawal = withdrawalAge - 16
const monthsBeforeWithdrawal = yearsBeforeWithdrawal * 12
const yearsAfterWithdrawal = payoutAge - withdrawalAge
const monthsAfterWithdrawal = yearsAfterWithdrawal * 12

const zeroValues = {
  ordinaryAccount: '0',
  specialAccount: '0',
  monthlySalary: '0',
  salaryIncreaseRate: '0',
  selectedDate: date16YearsAgo,
  housingLoan: '0',
}

const normalValues = {
  ordinaryAccount: '1000',
  specialAccount: '1000',
  monthlySalary: '1000',
  salaryIncreaseRate: '1',
  selectedDate: date16YearsAgo,
  housingLoan: '1000',
}

let instance: CPFAccount

describe('CPFAccount should have methods to return values', () => {
  beforeEach(() => {
    instance = new CPFAccount(zeroValues)
  })

  it('should have get methods that return values', async () => {
    expect(instance).toBeInstanceOf(CPFAccount)

    const accountValues = instance.accountValues
    expect(accountValues).toBeDefined()
    expect(typeof accountValues).toBe('object')

    expect(accountValues.history).toBeDefined()
    expect(Array.isArray(accountValues.history)).toBe(true)

    expect(accountValues.historyAfterWithdrawalAge).toBeDefined()
    expect(Array.isArray(accountValues.historyAfterWithdrawalAge)).toBe(true)

    const monthsTillWithdrawal = instance.monthsTillWithdrawal
    expect(monthsTillWithdrawal).toBeDefined()
    expect(typeof monthsTillWithdrawal).toBe('number')
  })
})

describe('CPFAccount should not have interest accruement in history if there is no money in special or ordinary accounts, nor monthly salary', () => {
  beforeEach(() => {
    instance = new CPFAccount(zeroValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('Histories should not have entries with category: interest', async () => {
    const accountValues = instance.accountValues

    expect(accountValues.history).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          category: 'Interest',
        }),
      ])
    )

    expect(accountValues.historyAfterWithdrawalAge).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          category: 'Interest',
        }),
      ])
    )
  })
})

describe('CPFAccount should not have positive values in their final balance if there is no preceding amount or monthly salary', () => {
  beforeEach(() => {
    instance = new CPFAccount(zeroValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('The final values of both Histories should be zero', async () => {
    const accountValues = instance.accountValues

    const indexOfLastEntry = accountValues.history.length - 1
    expect(accountValues.history[indexOfLastEntry].ordinaryAccount).toEqual(0)
    expect(accountValues.history[indexOfLastEntry].specialAccount).toEqual(0)

    const indexOfLastEntryAfterWithdrawalAge =
      accountValues.historyAfterWithdrawalAge.length - 1
    expect(
      accountValues.historyAfterWithdrawalAge[
        indexOfLastEntryAfterWithdrawalAge
      ].ordinaryAccount
    ).toEqual(0)
    expect(
      accountValues.historyAfterWithdrawalAge[
        indexOfLastEntryAfterWithdrawalAge
      ].specialAccount
    ).toEqual(0)
    expect(
      accountValues.historyAfterWithdrawalAge[
        indexOfLastEntryAfterWithdrawalAge
      ].retirementAccount
    ).toEqual(0)
  })
})

// TODO: Update following test to check that entries in every object does not have Caegory: Contribution
describe('CPFAccount should not have contributions in history if monthly salary is 0', () => {
  const nextValues = {
    ...zeroValues,
    ordinaryAccount: '1000',
    specialAccount: '1000',
  }

  beforeAll(() => {
    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('Histories should not have entries with category: Contribution', async () => {
    const accountValues = instance.accountValues

    expect(accountValues.history).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          category: 'Contribution',
        }),
      ])
    )

    expect(accountValues.historyAfterWithdrawalAge).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({
          category: 'Contribution',
        }),
      ])
    )
  })
})

describe('CPFAccount should have relevant entries in histories if there is at least a monthly salary and salary increase rate', () => {
  beforeAll(() => {
    instance = new CPFAccount(normalValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('Histories should have contributions and interest entries', async () => {
    const accountValues = instance.accountValues

    expect(accountValues.history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'Contribution',
        }),
        expect.objectContaining({
          category: 'Interest',
        }),
      ])
    )

    expect(accountValues.historyAfterWithdrawalAge).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'Contribution',
        }),
        expect.objectContaining({
          category: 'Interest',
        }),
      ])
    )
  })

  it('salaryHistory has entries', async () => {
    const { salaryHistory } = instance.accountValues

    expect(salaryHistory.length).toBeGreaterThan(0)
  })

  it('salaryHistory has entries', async () => {
    const { salaryHistory } = instance.accountValues

    expect(salaryHistory.length).toBeGreaterThan(0)
  })

  it('First entry in salaryHistory is for the current year', async () => {
    const { salaryHistory } = instance.accountValues
    const currentYear = moment().year()

    expect(salaryHistory[0].year).toBe(currentYear)
  })
  it('salaryHistoryAfterWithdrawalAge has entries', async () => {
    const { salaryHistoryAfterWithdrawalAge } = instance.accountValues

    expect(salaryHistoryAfterWithdrawalAge.length).toBeGreaterThan(0)
  })

  it('First entry in salaryHistoryAfterWithdrawalAge should be for when user is one year younger than the Withdrawal Age', async () => {
    const { salaryHistoryAfterWithdrawalAge } = instance.accountValues
    expect(salaryHistoryAfterWithdrawalAge[0].age).toBe(withdrawalAge - 1)
  })
})

describe('CPFAccount should not have contributions in history after withdrawal age if updateAccountsAtWithdrawalAge method not called', () => {
  beforeAll(() => {
    instance = new CPFAccount(normalValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('historyAfterWithdrawalAge should not have any entries', async () => {
    const accountValues = instance.accountValues
    expect(accountValues.historyAfterWithdrawalAge.length).toEqual(0)
  })
})

describe('CPFAccount should not have entries in salaryHistory or increase salary if salary increase rate is 0', () => {
  const values = {
    ...normalValues,
    salaryIncreaseRate: '0',
  }

  beforeAll(() => {
    instance = new CPFAccount(values)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('salaryHistory does not have entries', async () => {
    const { salaryHistory } = instance.accountValues

    expect(salaryHistory.length).toEqual(0)
  })

  it('salaryHistoryAfterWithdrawalAge does not have entries', async () => {
    const { salaryHistoryAfterWithdrawalAge } = instance.accountValues

    expect(salaryHistoryAfterWithdrawalAge.length).toEqual(0)
  })

  it('does not increase monthly salary', async () => {
    const { monthlySalary } = instance.accountValues

    expect(monthlySalary).toEqual(parseFloat(values.monthlySalary))
  })
})

describe('CPFAccount should have the correct final salary amount based on salaryRateIncrease', () => {
  const nextValues = {
    ...normalValues,
    salaryIncreaseRate: '2',
  }

  beforeAll(() => {
    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)
  })

  it('Salaries at withdrawal age and payout age are correct', async () => {
    const remainingMonths = instance.monthsTillWithdrawal % 12
    const numberOfIncreasesTillWithdrawalAge =
      (instance.monthsTillWithdrawal - remainingMonths) / 12
    const numberOfIncreasesAfterWithdrawalAge = payoutAge - withdrawalAge

    const salaryIncreasePercentageRate: number =
      parseFloat(nextValues.salaryIncreaseRate) / 100
    const compoundedPercentageRateTillWithdrawalAge =
      (1 + salaryIncreasePercentageRate) ** numberOfIncreasesTillWithdrawalAge
    const compoundedPercentageRateAfterWithdrawalAge =
      (1 + salaryIncreasePercentageRate) ** numberOfIncreasesAfterWithdrawalAge

    const salaryAtWithdrawalAge: number =
      parseFloat(nextValues.monthlySalary) *
      compoundedPercentageRateTillWithdrawalAge
    const salaryAtPayoutAge: number =
      salaryAtWithdrawalAge * compoundedPercentageRateAfterWithdrawalAge

    const {
      salaryHistory,
      salaryHistoryAfterWithdrawalAge,
    } = instance.accountValues

    const accountSalaryAtWithdrawalAge =
      salaryHistory[salaryHistory.length - 1].amount

    // CPF Account rounds MonthlySalary to 2 decimal places at every increase. As such, there will be a minor difference when simply calculating final monthly salary by straight compounding
    expect(accountSalaryAtWithdrawalAge.toFixed(0)).toEqual(
      salaryAtWithdrawalAge.toFixed(0)
    )

    const accountSalaryAtPayoutAge =
      salaryHistoryAfterWithdrawalAge[
        salaryHistoryAfterWithdrawalAge.length - 1
      ].amount
    expect(accountSalaryAtPayoutAge.toFixed(0)).toEqual(
      salaryAtPayoutAge.toFixed(0)
    )
  })
})
