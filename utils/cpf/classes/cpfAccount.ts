import { payoutAge, withdrawalAge } from '../../../constants'
import { Accounts, Person, Salary } from './'
import { normalRound, formatCurrency } from '../../utils'
import { AccountValues, Entry, AccountsType, ErrorValues } from '../types'
import {
  additionalWageCeiling,
  basicHealthcareSumForMember,
  contributionBand,
  monthsUntilBirthdayMonth,
  ordinaryWagesSubjectToCpf,
  retirementSumsForCohort,
  splitContribution,
} from '../parameters'

export class CPFAccount {
  #person: Person
  #salary: Salary
  #accounts: Accounts

  #history: Entry[] = []
  #historyAfterWithdrawalAge: Entry[] = []

  #errors: ErrorValues = {}
  #specialAccountOnly: boolean
  #retirementAccountOpened = false
  #cohortYear = 0
  #fullRetirementSum = 0

  constructor(values: AccountValues) {
    const {
      ordinaryAccount,
      specialAccount,
      mediSaveAccount = '0',
      monthlySalary,
      salaryIncreaseRate,
      monthsOfBonus,
      bonusMonth,
      selectedDate,
      housingLumpSum,
      housingLumpSumDate,
      housingMonthlyPayment,
      housingLoanTenure,
      housingLoanDate,
      specialAccountOnly,
      asOf,
    } = values

    this.#person = new Person({
      selectedDate,
      housingLumpSum,
      housingLumpSumDate,
      housingMonthlyPayment,
      housingLoanTenure,
      housingLoanDate,
      asOf,
    })
    this.#salary = new Salary(
      monthlySalary,
      salaryIncreaseRate,
      monthsOfBonus,
      bonusMonth
    )
    this.#accounts = new Accounts(
      parseFloat(ordinaryAccount),
      parseFloat(specialAccount),
      specialAccountOnly,
      parseFloat(mediSaveAccount)
    )

    this.#specialAccountOnly = specialAccountOnly

    this.#salary.checkInitialSalaryHistory(
      this.#person.age,
      this.#person.date.year()
    )
  }

  #basicHealthcareSum() {
    return basicHealthcareSumForMember(
      this.#person.date.year(),
      this.#person.birthDate.year() + 65
    )
  }

  updateHistory(category: string, rest = {} as AccountsType) {
    this.#history.push({
      date: this.#person.date.format('MMM YYYY'),
      category,
      ordinaryAccount: normalRound(this.#accounts.ordinaryAccount),
      specialAccount: normalRound(this.#accounts.specialAccount),
      mediSaveAccount: normalRound(this.#accounts.mediSaveAccount),
      ...rest,
    })
  }

  updateHistoryAfterWithdrawalAge(category: string, rest = {} as AccountsType) {
    this.#historyAfterWithdrawalAge.push({
      date: this.#person.date.format('MMM YYYY'),
      category,
      ordinaryAccount: normalRound(this.#accounts.ordinaryAccount),
      specialAccount: normalRound(this.#accounts.specialAccount),
      mediSaveAccount: normalRound(this.#accounts.mediSaveAccount),
      retirementAccount: normalRound(this.#accounts.retirementAccount),
      ...rest,
    })
  }

  updateAccountsAtWithdrawalAge() {
    if (this.#retirementAccountOpened) return

    const cohortYear = this.#person.birthDate.year() + withdrawalAge
    const { frs } = retirementSumsForCohort(cohortYear)
    this.#cohortYear = cohortYear
    this.#fullRetirementSum = frs
    this.#accounts.updateAccountsAtWithdrawalAge(frs)
    this.#person.setReachedWithdrawalAge()
    this.#retirementAccountOpened = true

    this.updateHistoryAfterWithdrawalAge('Transfer')
  }

  addContribution(eligibleAmount: number, label: string) {
    const band = contributionBand(
      this.#person.date,
      this.#person.contributionAge
    )
    if (band.savingsAccount === 'ra' && !this.#retirementAccountOpened) {
      this.updateAccountsAtWithdrawalAge()
    }
    const split = splitContribution(eligibleAmount, band)
    const credited = this.#accounts.creditContribution(split, {
      redirectOrdinaryToSpecial: this.#specialAccountOnly,
      basicHealthcareSum: this.#basicHealthcareSum(),
      retirementAccountOpen: this.#person.reachedWithdrawalAge,
    })

    const amounts: AccountsType = {
      ordinaryAccount: credited.ordinary,
      specialAccount: credited.special,
      mediSaveAccount: credited.mediSave,
    }
    if (this.#person.reachedWithdrawalAge) {
      this.updateHistoryAfterWithdrawalAge(label, {
        ...amounts,
        retirementAccount: credited.retirement,
      })
    } else {
      this.updateHistory(label, amounts)
    }
  }

  addMonthlySalaryContribution() {
    const eligibleSalary = ordinaryWagesSubjectToCpf(
      this.#salary.amount,
      this.#person.date
    )
    if (eligibleSalary <= 0) return
    this.addContribution(eligibleSalary, 'Contribution')
  }

  addYearlyBonusContribution() {
    // Additional wages are capped at the annual salary ceiling minus ordinary
    // wages for the year. The year is estimated as twelve months at the
    // current ordinary wage, which matches a salary that does not change
    // during the year.
    const monthlyOrdinaryWage = ordinaryWagesSubjectToCpf(
      this.#salary.amount,
      this.#person.date
    )
    const bonusAmount = this.#salary.amount * this.#salary.monthsOfBonus
    const eligibleBonus = Math.min(
      bonusAmount,
      additionalWageCeiling(monthlyOrdinaryWage)
    )
    if (eligibleBonus <= 0) return
    this.addContribution(eligibleBonus, 'Bonus')
  }

  addMonthlyInterest() {
    // Lowest balance for the month is the balance after this month's
    // withdrawals and before this month's contributions.
    this.#accounts.accrueMonthlyInterest(this.#person.reachedWithdrawalAge)
  }

  addInterestAtEndOfPeriod() {
    const interestAmounts: AccountsType = {
      ordinaryAccount: this.#accounts.accruedOrdinaryInterest,
      specialAccount: this.#accounts.accruedSpecialInterest,
      mediSaveAccount: this.#accounts.accruedMediSaveInterest,
    }

    if (this.#person.reachedWithdrawalAge) {
      this.updateHistoryAfterWithdrawalAge('Interest', {
        ...interestAmounts,
        retirementAccount: this.#accounts.accruedRetirementInterest,
      })
    } else {
      this.updateHistory('Interest', interestAmounts)
    }

    this.#accounts.addInterestToAccounts({
      basicHealthcareSum: this.#basicHealthcareSum(),
      retirementAccountOpen: this.#person.reachedWithdrawalAge,
    })

    if (this.#person.reachedWithdrawalAge) {
      this.updateHistoryAfterWithdrawalAge('Balance')
    } else {
      this.updateHistory('Balance')
    }
  }

  checkForHousingPayment() {
    if (
      this.#person.housingLumpSum > 0 &&
      this.#person.date.format('MMM YYYY') === this.#person.housingLumpSumDate
    ) {
      this.processHousingLumpSum()
    }

    if (
      this.#person.housingLoanTenureInMonths > 0 &&
      this.#person.date.isAfter(
        this.#person.housingLoanDate.subtract(1, 'month'),
        'day'
      )
    ) {
      this.processHousingLoan()
    }
  }

  processHousingLumpSum() {
    if (this.#person.housingLumpSum > this.#accounts.ordinaryAccount) {
      this.#errors.housingLumpSum = `There is only ${formatCurrency(
        this.#accounts.ordinaryAccount
      )} in your ordinary account on ${this.#person.date.format(
        'MMM YYYY'
      )}, and you need ${formatCurrency(
        this.#person.housingLumpSum
      )} for the housing lump sum payment `
      return
    }

    this.#accounts.ordinaryAccount -= this.#person.housingLumpSum

    if (!this.#person.reachedWithdrawalAge) {
      this.updateHistory('Housing Lump Sum', {
        ordinaryAccount: -this.#person.housingLumpSum,
        specialAccount: 0,
      })
      this.updateHistory('Balance')
    } else {
      this.updateHistoryAfterWithdrawalAge('Housing Lump Sum', {
        ordinaryAccount: -this.#person.housingLumpSum,
        specialAccount: 0,
        retirementAccount: 0,
      })
      this.updateHistoryAfterWithdrawalAge('Balance')
    }

    this.#person.clearHousingLumpSum()
  }

  processHousingLoan() {
    if (this.#person.housingMonthlyPayment > this.#accounts.ordinaryAccount) {
      this.#person.housingLoanTenureInMonths = 0
      this.#errors.housingMonthlyPayment = `There is only ${formatCurrency(
        this.#accounts.ordinaryAccount
      )} in your ordinary account on ${this.#person.date.format(
        'MMM YYYY'
      )}, and you need ${formatCurrency(
        this.#person.housingMonthlyPayment
      )} for the housing loan monthly payment `
      return
    }

    this.#accounts.ordinaryAccount -= this.#person.housingMonthlyPayment

    if (!this.#person.reachedWithdrawalAge) {
      this.updateHistory('Housing Loan', {
        ordinaryAccount: -this.#person.housingMonthlyPayment,
        specialAccount: 0,
      })
    } else {
      this.updateHistoryAfterWithdrawalAge('Housing Loan', {
        ordinaryAccount: -this.#person.housingMonthlyPayment,
        specialAccount: 0,
        retirementAccount: 0,
      })
    }

    this.#person.decrementLoanTenure()
  }

  /**
   * Each step moves one month forward, then applies that month.
   * Salary rises in January before that month's contribution.
   * Interest uses the balance after withdrawals and before contributions.
   * It is credited in December. Pass creditAtEnd so the last partial year
   * of a projection is credited even when it does not end in December.
   * The year someone turns 55 is not credited early: uncredited Special
   * Account interest moves to the Retirement Account when the SA closes.
   */
  addSalaryAndInterestOverTime(months: number, creditAtEnd = false) {
    this.checkForHousingPayment()

    let period = months
    while (period > 0) {
      period -= 1
      this.#person.updateTimePeriod()

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

      this.checkForHousingPayment()
      this.addMonthlyInterest()

      if (this.#salary.amount > 0) this.addMonthlySalaryContribution()

      const isBonusMonth = this.#person.date.month() === this.#salary.bonusMonth
      if (isBonusMonth && this.#salary.monthsOfBonus > 0) {
        this.addYearlyBonusContribution()
      }

      const isDecember = this.#person.date.month() === 11
      const isLastMonth = creditAtEnd && period === 0
      if (isDecember || isLastMonth) {
        this.addInterestAtEndOfPeriod()
      }
    }
  }

  monthsUntilWithdrawalMonth() {
    return monthsUntilBirthdayMonth(
      this.#person.birthDate,
      this.#person.date,
      withdrawalAge
    )
  }

  monthsUntilPayoutMonth() {
    return monthsUntilBirthdayMonth(
      this.#person.birthDate,
      this.#person.date,
      payoutAge
    )
  }

  get accountValues() {
    return {
      ordinaryAccount: this.#accounts.ordinaryAccount,
      specialAccount: this.#accounts.specialAccount,
      mediSaveAccount: this.#accounts.mediSaveAccount,
      retirementAccount: this.#accounts.retirementAccount,
      ordinaryAccountAtWithdrawalAge:
        this.#accounts.ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge:
        this.#accounts.specialAccountAtWithdrawalAge,
      mediSaveAccountAtWithdrawalAge:
        this.#accounts.mediSaveAccountAtWithdrawalAge,
      cohortYear: this.#cohortYear,
      fullRetirementSum: this.#fullRetirementSum,
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

  get reachedWithdrawalAge() {
    return this.#person.reachedWithdrawalAge
  }
}
