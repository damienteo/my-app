import moment from 'moment'
import { withdrawalAge, payoutAge } from '../../../constants'
import { CPFAccount } from '../../../utils/cpf/classes/cpfAccount'
import { AccountValues, Entry } from '../../../utils/cpf/types'

const date16YearsAgo = moment().subtract(16, 'y')
const yearsBeforeWithdrawal = withdrawalAge - 16
const monthsBeforeWithdrawal = yearsBeforeWithdrawal * 12
const yearsAfterWithdrawal = payoutAge - withdrawalAge
const monthsAfterWithdrawal = yearsAfterWithdrawal * 12

const zeroValues: AccountValues = {
  ordinaryAccount: '0',
  specialAccount: '0',
  monthlySalary: '0',
  salaryIncreaseRate: '0',
  selectedDate: date16YearsAgo,
  bonusMonth: '0',
  monthsOfBonus: '0',
  housingLumpSum: '0',
  housingLumpSumDate: moment(),
  housingMonthlyPayment: '0',
  housingLoanTenure: '0',
  housingLoanDate: moment(),
  specialAccountOnly: false,
}

const normalValues: AccountValues = {
  ordinaryAccount: '1000',
  specialAccount: '1000',
  monthlySalary: '1000',
  salaryIncreaseRate: '1',
  selectedDate: date16YearsAgo,
  bonusMonth: '0',
  monthsOfBonus: '0',
  housingLumpSum: '1000',
  housingMonthlyPayment: '0',
  housingLoanTenure: '0',
  housingLoanDate: moment(),
  housingLumpSumDate: moment(),
  specialAccountOnly: false,
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

// TODO: Update following test to check that entries in every object does not have Category: Contribution
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

describe('CPFAccount should have entries in history which show deduction of housing loan', () => {
  const housingHistoryEntry = {
    category: 'Housing Lump Sum',
    date: moment().format('MMM YYYY'),
    ordinaryAccount: -1000,
    specialAccount: 0,
  }

  it('History will have Housing as first entry if User wants immediate application of Housing Loan', async () => {
    instance = new CPFAccount(normalValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const { history } = instance.accountValues

    expect(history[0]).toEqual(housingHistoryEntry)
  })

  it('History will have a Housing Entry with correct Date and Amount deducted', async () => {
    const dateIn2years = moment().add(2, 'y')
    const nextDateIn2years = dateIn2years.format('MMM YYYY')
    const nextValues = {
      ...normalValues,
      housingLumpSum: '2000',
      housingLumpSumDate: dateIn2years,
    }

    const nextHousingHistoryEntry = {
      ...housingHistoryEntry,
      date: nextDateIn2years,
      ordinaryAccount: -2000,
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const { history } = instance.accountValues

    const housingEntry = history.find(
      (entry: Entry) =>
        entry.date === nextDateIn2years && entry.category === 'Housing Lump Sum'
    )

    expect(housingEntry).toEqual(nextHousingHistoryEntry)
  })

  it('Housing Entry will be in HistoryAfterWithdrawalAge, not History, with correct Date and Amount deducted if the Housing Loan Date is after withdrawal age', async () => {
    const dateAfterWithdrawalAge = moment().add(withdrawalAge - 15, 'y')
    const nextDateAfterWithdrawalAge = dateAfterWithdrawalAge.format('MMM YYYY')
    const nextValues = {
      ...normalValues,
      housingLumpSum: '3000',
      monthlySalary: '4000',
      housingLumpSumDate: dateAfterWithdrawalAge,
    }

    const nextHousingHistoryEntry = {
      ...housingHistoryEntry,
      date: nextDateAfterWithdrawalAge,
      ordinaryAccount: -3000,
      retirementAccount: 0,
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const { history, historyAfterWithdrawalAge } = instance.accountValues

    const housingEntryInHistory = history.find(
      (entry: Entry) =>
        entry.date === nextDateAfterWithdrawalAge &&
        entry.category === 'Housing Lump Sum'
    )
    expect(housingEntryInHistory).toEqual(undefined)

    const housingEntryInHistoryAfterWithdrawalAge = historyAfterWithdrawalAge.find(
      (entry: Entry) =>
        entry.date === nextDateAfterWithdrawalAge &&
        entry.category === 'Housing Lump Sum'
    )

    expect(housingEntryInHistoryAfterWithdrawalAge).toEqual(
      nextHousingHistoryEntry
    )
  })

  it('If Ordinary Account is insufficient, Housing Entry will not be present in histories, and there will be an error.', async () => {
    const futureDate = moment().add(15, 'y')
    const nextFutureDate = futureDate.format('MMM YYYY')
    const nextValues = {
      ...normalValues,
      housingLumpSum: '3000000',
      housingLumpSumDate: futureDate,
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const {
      history,
      historyAfterWithdrawalAge,
      errors,
    } = instance.accountValues

    const housingEntryInHistory = history.find(
      (entry: Entry) =>
        entry.date === nextFutureDate && entry.category === 'Housing Lump Sum'
    )
    expect(housingEntryInHistory).toEqual(undefined)

    const housingEntryInHistoryAfterWithdrawalAge = historyAfterWithdrawalAge.find(
      (entry: Entry) =>
        entry.date === nextFutureDate && entry.category === 'Housing Lump Sum'
    )

    expect(housingEntryInHistoryAfterWithdrawalAge).toEqual(undefined)

    const { housingLumpSum = '' } = errors
    expect(housingLumpSum.length).toBeGreaterThan(90)
  })

  it('will update error object if Ordinary Account is insufficient for Housing Loan Payment', async () => {
    const currentDateString = moment().format('MMM YYYY')
    const nextValues = {
      ...normalValues,
      ordinaryAccount: '0',
      housingLumpSum: '0',
      housingMonthlyPayment: '2000',
      housingLoanTenure: '10',
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const {
      history,
      historyAfterWithdrawalAge,
      errors,
    } = instance.accountValues

    const housingEntryInHistory = history.find(
      (entry: Entry) =>
        entry.date === currentDateString && entry.category === 'Housing Loan'
    )
    expect(housingEntryInHistory).toEqual(undefined)

    const housingEntryInHistoryAfterWithdrawalAge = historyAfterWithdrawalAge.find(
      (entry: Entry) =>
        entry.date === currentDateString && entry.category === 'Housing Loan'
    )

    expect(housingEntryInHistoryAfterWithdrawalAge).toEqual(undefined)

    const { housingMonthlyPayment = '' } = errors

    // TODO: Update error message expected to match error message received, instead of comparing string length
    expect(housingMonthlyPayment.length).toBeGreaterThan(90)
  })

  it('If specialAccountOnly is selected, there should not be any funds in Ordinary Account.', async () => {
    const nextValues = {
      ...normalValues,
      specialAccountOnly: true,
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const { history, historyAfterWithdrawalAge } = instance.accountValues

    expect(history[0].ordinaryAccount).toEqual(0)

    expect(historyAfterWithdrawalAge[0].ordinaryAccount).toEqual(0)
  })

  // TODO: Write tests for housing loan

  it('should not have Bonus amounts in history if monthsOfBonus is 0', async () => {
    const nextValues = {
      ...normalValues,
      bonusMonth: '3',
      monthsOfBonus: '0',
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const { history, historyAfterWithdrawalAge } = instance.accountValues

    const historyBonusEntry = history.find((record: Entry) => {
      return record.category === 'Bonus'
    })
    expect(historyBonusEntry).toBeUndefined()

    const historyAfterWithdrawalAgeBonusEntry = historyAfterWithdrawalAge.find(
      (record: Entry) => {
        return record.category === 'Bonus'
      }
    )
    expect(historyAfterWithdrawalAgeBonusEntry).toBeUndefined()
  })

  it('should have Bonus amounts in history if monthsOfBonus is more than 0', async () => {
    const nextValues = {
      ...normalValues,
      bonusMonth: '3',
      monthsOfBonus: '2',
    }

    instance = new CPFAccount(nextValues)
    instance.addSalaryAndInterestOverTime(monthsBeforeWithdrawal)
    instance.updateAccountsAtWithdrawalAge()
    instance.addSalaryAndInterestOverTime(monthsAfterWithdrawal)

    const { history, historyAfterWithdrawalAge } = instance.accountValues

    const historyBonusEntry = history.find((record: Entry) => {
      return record.category === 'Bonus'
    })
    expect(historyBonusEntry).toBeDefined()

    const historyAfterWithdrawalAgeBonusEntry = historyAfterWithdrawalAge.find(
      (record: Entry) => {
        return record.category === 'Bonus'
      }
    )
    expect(historyAfterWithdrawalAgeBonusEntry).toBeDefined()
  })

  // TODO: Add test for calculation of contribution
})
