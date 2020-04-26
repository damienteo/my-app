import moment from 'moment'
import {
  cpfValues,
  fullRetirementSum,
  retirementSumIncrease,
  ordinaryWageCeiling,
} from '../../../constants'
import { Accounts, Person, Salary } from './'
import { getCPFAllocation } from '../cpfForecast'
import { normalRound, formatCurrency } from '../../utils'
import { AccountValues, Entry, AccountsType, ErrorValues } from '../types'

const { bonusAmtCap, ordinaryAmtCap } = cpfValues

export class CPFAccount {
  #person: Person
  #salary: Salary
  #accounts: Accounts

  #history: Entry[] = []
  #historyAfterWithdrawalAge: Entry[] = []

  #errors: ErrorValues = {}
  #specialAccountOnly: boolean

  constructor(values: AccountValues) {
    const {
      ordinaryAccount,
      specialAccount,
      monthlySalary,
      salaryIncreaseRate,
      selectedDate,
      housingLoan,
      housingLoanDate,
      specialAccountOnly,
    } = values

    this.#person = new Person(selectedDate, housingLoan, housingLoanDate)
    this.#salary = new Salary(monthlySalary, salaryIncreaseRate)
    this.#accounts = new Accounts(
      parseFloat(ordinaryAccount),
      parseFloat(specialAccount),
      specialAccountOnly
    )

    this.#specialAccountOnly = specialAccountOnly

    // Add in entry for current year in Salary History
    this.#salary.checkInitialSalaryHistory(
      this.#person.age,
      this.#person.date.year()
    )
  }

  updateHistory(category: string, rest = {} as AccountsType) {
    this.#history.push({
      date: this.#person.date.format('MMM YYYY'),
      category,
      ordinaryAccount: normalRound(this.#accounts.ordinaryAccount),
      specialAccount: normalRound(this.#accounts.specialAccount),
      ...rest,
    })
  }

  updateHistoryAfterWithdrawalAge(category: string, rest = {} as AccountsType) {
    this.#historyAfterWithdrawalAge.push({
      date: this.#person.date.format('MMM YYYY'),
      category,
      ordinaryAccount: normalRound(this.#accounts.ordinaryAccount),
      specialAccount: normalRound(this.#accounts.specialAccount),
      retirementAccount: normalRound(this.#accounts.retirementAccount),
      ...rest,
    })
  }

  updateAccountsAtWithdrawalAge() {
    // Extrapolate potential future Full Retirement Sum (FRS)
    const dateOfWithdrawalAge = this.#history[this.#history.length - 1].date
    const yearOfWithdrawalAge = parseInt(dateOfWithdrawalAge.split(' ')[1])
    const currentYear = moment().year()
    const yearsFromPresent = yearOfWithdrawalAge - currentYear

    const nextCPFFullRetirementSum =
      fullRetirementSum + retirementSumIncrease * yearsFromPresent

    // Provides Snapshot of Values at Withdrawal Age
    this.#accounts.updateAccountsAtWithdrawalAge(nextCPFFullRetirementSum)
    this.#person.setReachedWithdrawalAge()

    this.updateHistoryAfterWithdrawalAge('Transfer')
  }

  addMonthlySalary() {
    // If monthly salary exceeds wage ceiling, take only wage ceiling as eligible for CPF contribution
    const eligibleSalary =
      this.#salary.amount > ordinaryWageCeiling
        ? ordinaryWageCeiling
        : this.#salary.amount

    // Get CPF Allocation rates based on current age
    const currentCPFAllocation = getCPFAllocation(this.#person.age)

    // Calculate CPF Allocation amounts and add accordingly
    // If SpecialAccountOnly option is selected, added contribution for OA to Special Account instead
    const OAContribution = this.#specialAccountOnly
      ? 0
      : normalRound(eligibleSalary * currentCPFAllocation.OA)
    this.#accounts.ordinaryAccount += OAContribution

    // If SpecialAccountOnly option is selected, added contribution for OA to Special Account instead
    const SAContribution = this.#specialAccountOnly
      ? normalRound(
          eligibleSalary * currentCPFAllocation.OA +
            eligibleSalary * currentCPFAllocation.SA
        )
      : normalRound(eligibleSalary * currentCPFAllocation.SA)
    this.#accounts.specialAccount += SAContribution

    // Update History Array
    if (!this.#person.reachedWithdrawalAge) {
      this.updateHistory('Contribution', {
        ordinaryAccount: OAContribution,
        specialAccount: SAContribution,
      })
    } else {
      this.updateHistoryAfterWithdrawalAge('Contribution', {
        ordinaryAccount: OAContribution,
        specialAccount: SAContribution,
        retirementAccount: 0,
      })
    }
  }

  addMonthlyInterest() {
    // Amount for Bonus Interest is taken from Retirement Account, then Ordinary Account, then the Special Account
    // Bonus Interest from the Ordinary Account is passed into the Special Account (if below 55), or Retirement Account (if 55 and above)

    // If Withdrawal Age reached, calculate Retirement Account interest and Accrue:
    if (this.#person.reachedWithdrawalAge) {
      this.#accounts.accrueRAInterest()
    }

    // Update Bonus Amount Cap to be applied to OA and SA if there is RA
    let nextBonusAmountCap = bonusAmtCap
    if (this.#accounts.retirementAccount > 0) {
      nextBonusAmountCap =
        this.#accounts.retirementAccount >= bonusAmtCap
          ? 0
          : bonusAmtCap - this.#accounts.retirementAccount
    }

    // Take note of Bonus Ordinary Account Cap from updated Bonus Cap
    const nextOrdinaryAmountCap =
      nextBonusAmountCap >= ordinaryAmtCap ? ordinaryAmtCap : nextBonusAmountCap

    const eligibleOrdinaryAmount =
      this.#accounts.ordinaryAccount >= nextOrdinaryAmountCap
        ? nextOrdinaryAmountCap
        : this.#accounts.ordinaryAccount

    // Take note of Special Account eligible for Bonus Rate, by taking out Ordinary Account from Bonus Account Cap
    // Cannot simply compare OA to nextBonusAmountCap, as bonus applied to OA has a lower cap
    // By here, nextBonusAmountCap may be 0 if retirement age is present
    const eligibleSpecialAmountCap =
      nextBonusAmountCap > eligibleOrdinaryAmount
        ? nextBonusAmountCap - eligibleOrdinaryAmount
        : 0

    if (this.#person.reachedWithdrawalAge) {
      // Take note of Different Bonus Ordinary Account Interests before or after 55
      this.#accounts.accrueBonusOAInterestAfterWithdrawalAge(
        eligibleOrdinaryAmount
      )
      this.#accounts.accrueSAInterestAfterWithdrawalAge(
        eligibleSpecialAmountCap
      )
    } else {
      this.#accounts.accrueBonusOAInterest(eligibleOrdinaryAmount)
      this.#accounts.accrueSAInterest(eligibleSpecialAmountCap)
    }

    // Entire Ordinary Account is eligible for normal OA interest, as bonus interest is sent to other accounts
    // As Ordinary Account is the only account with this procedure, we can have the accruement for Ordinary Interest to be a separate line without if/else here
    this.#accounts.accrueOAInterest()
  }

  addInterestAtEndOfPeriod() {
    if (this.#person.reachedWithdrawalAge) {
      this.updateHistoryAfterWithdrawalAge('Interest', {
        ordinaryAccount: this.#accounts.accruedOrdinaryInterest,
        specialAccount: this.#accounts.accruedSpecialInterest,
        retirementAccount: this.#accounts.accruedRetirementInterest,
      })
    } else {
      this.updateHistory('Interest', {
        ordinaryAccount: this.#accounts.accruedOrdinaryInterest,
        specialAccount: this.#accounts.accruedSpecialInterest,
      })
    }

    this.#accounts.addInterestToAccounts()

    if (this.#person.reachedWithdrawalAge) {
      this.updateHistoryAfterWithdrawalAge('Balance')
    } else {
      this.updateHistory('Balance')
    }
  }

  processHousingLoan() {
    // If Ordinary Account is not enough, indicate error and return early
    if (this.#person.housingLoan > this.#accounts.ordinaryAccount) {
      return (this.#errors.housingLoan = `There is only ${formatCurrency(
        this.#accounts.ordinaryAccount
      )} in your ordinary account on ${this.#person.date.format(
        'MMM YYYY'
      )}, and you need ${formatCurrency(
        this.#person.housingLoan
      )} for the housing loan `)
    }

    // Clear housing loan amount from ordinary account
    this.#accounts.ordinaryAccount -= this.#person.housingLoan

    if (!this.#person.reachedWithdrawalAge) {
      this.updateHistory('Housing', {
        ordinaryAccount: -this.#person.housingLoan,
        specialAccount: 0,
      })
      this.updateHistory('Balance')
    } else {
      this.updateHistoryAfterWithdrawalAge('Housing', {
        ordinaryAccount: -this.#person.housingLoan,
        specialAccount: 0,
        retirementAccount: 0,
      })
      this.updateHistoryAfterWithdrawalAge('Balance')
    }

    // Clear amount in housing loan as it is no longer needed
    this.#person.clearHousingLoan()
  }

  addSalaryAndInterestOverTime(months: number) {
    let period = months

    while (period > 0) {
      // Calculate and add Accrued Interest for the end of the year. Ignore for the previous full year as that has been accounted for.
      const isEndOfYear = this.#person.date.month() === 11
      if (isEndOfYear && period !== months) {
        this.addInterestAtEndOfPeriod()
      }

      // Check for usage of housing loan
      if (
        this.#person.housingLoan > 0 &&
        this.#person.date.format('MMM YYYY') === this.#person.housingLoanDate
      ) {
        this.processHousingLoan()
      }

      // Update period for the start of the month
      period -= 1
      this.#person.updateTimePeriod()

      // Update Salary at the beginning of the year
      const isStartOfYear = this.#person.date.month() === 0
      const shouldUpdateMonthlySalary =
        this.#salary.amount > 0 && this.#salary.increaseRate > 0
      if (isStartOfYear && shouldUpdateMonthlySalary) {
        this.#salary.addMonthlySalaryAtEndOfYear(
          this.#person.age,
          this.#person.date.year(),
          this.#person.reachedWithdrawalAge
        )
      }

      // Update Accrued Interest amount
      this.addMonthlyInterest()

      // Add salary at the end of the month, as interest is based on the lowest amount in the account at any time in the month
      if (this.#salary.amount > 0) this.addMonthlySalary()

      // Add interest at the end of the period
      if (period === 0) {
        this.addInterestAtEndOfPeriod()
      }
    }
  }

  get accountValues() {
    return {
      ordinaryAccount: this.#accounts.ordinaryAccount,
      specialAccount: this.#accounts.specialAccount,
      retirementAccount: this.#accounts.retirementAccount,
      ordinaryAccountAtWithdrawalAge: this.#accounts
        .ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge: this.#accounts
        .specialAccountAtWithdrawalAge,
      monthsTillWithdrawal: this.#person.monthsTillWithdrawal,
      monthlySalary: this.#salary.amount,
      salaryHistory: this.#salary.history,
      salaryHistoryAfterWithdrawalAge: this.#salary.historyAfterWithdrawalAge,
      history: this.#history,
      historyAfterWithdrawalAge: this.#historyAfterWithdrawalAge,
      errors: this.#errors,
    }
  }

  get monthsTillWithdrawal() {
    return this.#person.monthsTillWithdrawal
  }
}
