import moment from 'moment'
import {
  cpfValues,
  cpfInterestRates,
  fullRetirementSum,
  retirementSumIncrease,
  ordinaryWageCeiling,
} from '../../../constants'
import { Accounts, Person, Salary } from './'
import { getCPFAllocation } from '../cpfForecast'
import { normalRound, formatCurrency } from '../../utils'
import { AccountValues, Entry, AccountsType, ErrorValues } from '../types'

const { bonusAmtCap, extraBonusAmtCap, ordinaryAmtCap } = cpfValues

const {
  ordinaryInterestRate,
  specialInterestRate,
  retirementInterestRate,
  bonusOrdinaryInterestRate,
  bonusSpecialInterestRate,
  bonusRetirementInterestRate,
  extraBonusOrdinaryInterestRate,
  extraBonusSpecialInterestRate,
  extraBonusRetirementInterestRate,
} = cpfInterestRates

export class CPFAccount {
  #person: Person
  #salary: Salary
  #accounts: Accounts

  #history: Entry[] = []
  #historyAfterWithdrawalAge: Entry[] = []

  #errors: ErrorValues = {}

  constructor(values: AccountValues) {
    const {
      ordinaryAccount,
      specialAccount,
      monthlySalary,
      salaryIncreaseRate,
      selectedDate,
      housingLoan,
      housingLoanDate,
    } = values

    this.#person = new Person(selectedDate, housingLoan, housingLoanDate)
    this.#salary = new Salary(monthlySalary, salaryIncreaseRate)
    this.#accounts = new Accounts(
      parseFloat(ordinaryAccount),
      parseFloat(specialAccount)
    )

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
    // Provides Snapshot of Values at Withdrawal Age
    this.#accounts.ordinaryAccountAtWithdrawalAge = this.#accounts.ordinaryAccount
    this.#accounts.specialAccountAtWithdrawalAge = this.#accounts.specialAccount
    this.#person.setReachedWithdrawalAge()

    // Extrapolate potential future Full Retirement Sum (FRS)
    const dateOfWithdrawalAge = this.#history[this.#history.length - 1].date
    const yearOfWithdrawalAge = parseInt(dateOfWithdrawalAge.split(' ')[1])
    const currentYear = moment().year()
    const yearsFromPresent = yearOfWithdrawalAge - currentYear

    const nextCPFFullRetirementSum =
      fullRetirementSum + retirementSumIncrease * yearsFromPresent

    // FRS takes money from Special Account (SA) before Ordinary Account (OA)
    const isSpecialEnoughForRetirement =
      this.#accounts.specialAccount > nextCPFFullRetirementSum

    // Calculate amounts to be transferred from SA to RA
    const specialToRetirementAmount = isSpecialEnoughForRetirement
      ? nextCPFFullRetirementSum
      : this.#accounts.specialAccount

    // Calculate amounts to be transferred from OA to RA
    const retirementSumShortfall =
      nextCPFFullRetirementSum - specialToRetirementAmount
    const ordinaryToRetirementAmount =
      this.#accounts.ordinaryAccount > retirementSumShortfall
        ? retirementSumShortfall
        : this.#accounts.ordinaryAccount

    //  Remove SA and OA Amounts to be transferred to RA
    this.#accounts.specialAccount -= specialToRetirementAmount
    this.#accounts.ordinaryAccount -= ordinaryToRetirementAmount

    this.#accounts.retirementAccount =
      specialToRetirementAmount + ordinaryToRetirementAmount

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
    const OAContribution = normalRound(eligibleSalary * currentCPFAllocation.OA)
    this.#accounts.ordinaryAccount += OAContribution

    const SAContribution = normalRound(eligibleSalary * currentCPFAllocation.SA)
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

  accrueRAInterest() {
    // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)

    // Take note of Retirement Account eligible for Extra Bonus Rate, by taking out extraEligibleRetirementAmount from  this.#accounts.retirementAccount
    const extraEligibleRetirementAmount =
      this.#accounts.retirementAccount > extraBonusAmtCap
        ? extraBonusAmtCap
        : this.#accounts.retirementAccount

    //Calculate Extra-Bonus Interest for Retirement Account
    const extraBonusRetirementInterest = normalRound(
      extraEligibleRetirementAmount * extraBonusRetirementInterestRate
    )

    // Take note of Retirement Account eligible for normal Bonus Rate, by taking out eligibleRetirementAmount from  this.#accounts.retirementAccount
    const nonExtraBonusCap = bonusAmtCap - extraBonusAmtCap
    const excessRetirementAmount =
      this.#accounts.retirementAccount - extraEligibleRetirementAmount

    // Take note of Retirement Account eligible for only the normal Bonus Rate,

    const eligibleRetirementAmount =
      excessRetirementAmount >= nonExtraBonusCap
        ? nonExtraBonusCap
        : excessRetirementAmount

    //Calculate Normal Bonus Interest for Retirement Account
    const bonusRetirementInterest = normalRound(
      eligibleRetirementAmount * bonusRetirementInterestRate
    )

    // Take note of Amount in Special Account NOT eligible for Bonus Interest
    const nonBonusRetirementAmount =
      excessRetirementAmount - eligibleRetirementAmount

    //Calculate Normal Interest for Retirement Account
    const nonBonusRetirementInterest = normalRound(
      nonBonusRetirementAmount * retirementInterestRate
    )

    // Accrue RA interest
    this.#accounts.accruedRetirementInterest += normalRound(
      extraBonusRetirementInterest +
        bonusRetirementInterest +
        nonBonusRetirementInterest
    )
  }

  accrueBonusOAInterest(eligibleOrdinaryAmount: number) {
    // Not yet reached 55
    const bonusInterest = normalRound(
      eligibleOrdinaryAmount * bonusOrdinaryInterestRate
    )

    // Accrue SA interest from OA Bonus Interest
    this.#accounts.accruedSpecialInterest =
      this.#accounts.accruedSpecialInterest + bonusInterest
  }

  accrueBonusOAInterestAfterWithdrawalAge(eligibleOrdinaryAmount: number) {
    // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)
    // extraBonusAmtCap is the cap for extra bonus
    // nextBonusAmtCap is the amount that can still be applied for bonus interest (need to take RA into account)
    const nextExtraBonusAmountCap =
      this.#accounts.retirementAccount > extraBonusAmtCap
        ? 0
        : extraBonusAmtCap - this.#accounts.retirementAccount

    // Check if nextOrdinaryAmountCap falls within the Extra Bonus Amount
    // Calculate OA eligible for extra bonus interest
    const extraBonusOrdinaryAmount =
      eligibleOrdinaryAmount > nextExtraBonusAmountCap
        ? nextExtraBonusAmountCap
        : 0

    // Calculate extra bonus interest
    const extraBonusInterest = normalRound(
      extraBonusOrdinaryAmount * extraBonusOrdinaryInterestRate
    )

    //Calculate OA eligible for normal bonus interest
    const bonusOrdinaryAmount =
      eligibleOrdinaryAmount - extraBonusOrdinaryAmount

    // Calculate normal bonus interest
    const bonusInterest = normalRound(
      bonusOrdinaryAmount * bonusOrdinaryInterestRate
    )

    // Accrue RA interest from OA Bonus interest
    // Bonus Interest from the Ordinary Account iRetirement Account (if 55 and above)
    this.#accounts.accruedRetirementInterest +=
      extraBonusInterest + bonusInterest
  }

  accrueSAInterest(eligibleSpecialAmountCap: number) {
    // Take note of Amount in Special Account eligible for Normal Bonus Interest
    const eligibleSpecialAmount =
      this.#accounts.specialAccount >= eligibleSpecialAmountCap
        ? eligibleSpecialAmountCap
        : this.#accounts.specialAccount

    // Take note of Amount in Special Account NOT eligible for Bonus Interest
    const nonBonusSpecialAmount =
      this.#accounts.specialAccount - eligibleSpecialAmount

    // Settle Interest for Special Account
    const bonusSpecialInterest = normalRound(
      eligibleSpecialAmount * bonusSpecialInterestRate
    )
    const nonBonusSpecialInterest = normalRound(
      nonBonusSpecialAmount * specialInterestRate
    )

    // Accrue SA interest
    this.#accounts.accruedSpecialInterest += normalRound(
      bonusSpecialInterest + nonBonusSpecialInterest
    )
  }

  accrueSAInterestAfterWithdrawalAge(eligibleSpecialAmountCap: number) {
    // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)
    // Take note of Cap for Extra Bonus Interest
    const totalRAandOA =
      this.#accounts.ordinaryAccount + this.#accounts.retirementAccount
    const specialAccountExtraBonusAmountCap =
      totalRAandOA > extraBonusAmtCap ? 0 : extraBonusAmtCap - totalRAandOA

    // Take note of Amount in Special Account eligible for Extra Bonus Interest
    const extraBonusSpecialAmount =
      this.#accounts.specialAccount >= specialAccountExtraBonusAmountCap
        ? specialAccountExtraBonusAmountCap
        : this.#accounts.specialAccount

    // Take note of Special Amount after removing amount to calculate extra bonus. The lowest value here is 0
    const specialAmountWithoutExtraBonus =
      this.#accounts.specialAccount - extraBonusSpecialAmount

    // Take note of Amount in Special Account eligible for Normal Bonus Interest
    const nextEligibleSpecialAmountCap =
      eligibleSpecialAmountCap - specialAccountExtraBonusAmountCap

    // Both specialAmountWithoutExtraBonus and nextEligibleSpecialAmountCap may be 0 if bonus cap was cleared by OA and RA
    // If the special amount, after removing the extra bonus is more than or equal to the amount cap for calculating normal bonus interest, the eligible amount is the amount cap.
    const eligibleSpecialAmount =
      specialAmountWithoutExtraBonus >= nextEligibleSpecialAmountCap
        ? nextEligibleSpecialAmountCap
        : specialAmountWithoutExtraBonus

    // Take note of Amount in Special Account NOT eligible for Bonus Interest
    const nonBonusSpecialAmount =
      specialAmountWithoutExtraBonus - eligibleSpecialAmount

    // Settle Interest for Special Account
    const extraBonusInterest = normalRound(
      extraBonusSpecialAmount * extraBonusSpecialInterestRate
    )
    const bonusSpecialInterest = normalRound(
      eligibleSpecialAmount * bonusSpecialInterestRate
    )
    const nonBonusSpecialInterest = normalRound(
      nonBonusSpecialAmount * specialInterestRate
    )

    // Accrue SA interest
    this.#accounts.accruedSpecialInterest += normalRound(
      extraBonusInterest + bonusSpecialInterest + nonBonusSpecialInterest
    )
  }

  addMonthlyInterest() {
    // Amount for Bonus Interest is taken from Retirement Account, then Ordinary Account, then the Special Account
    // Bonus Interest from the Ordinary Account is passed into the Special Account (if below 55), or Retirement Account (if 55 and above)

    // If Withdrawal Age reached, calculate Retirement Account interest and Accrue:
    if (this.#person.reachedWithdrawalAge) {
      this.accrueRAInterest()
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
      this.accrueBonusOAInterestAfterWithdrawalAge(eligibleOrdinaryAmount)
      this.accrueSAInterestAfterWithdrawalAge(eligibleSpecialAmountCap)
    } else {
      this.accrueBonusOAInterest(eligibleOrdinaryAmount)
      this.accrueSAInterest(eligibleSpecialAmountCap)
    }

    // Entire Ordinary Account is eligible for normal OA interest, as bonus interest is sent to other accounts
    // As Ordinary Account is the only account with this procedure, we can have the accruement for Ordinary Interest to be a separate line without if/else here
    this.#accounts.accruedOrdinaryInterest += normalRound(
      this.#accounts.ordinaryAccount * ordinaryInterestRate
    )
  }

  addInterestToAccounts() {
    const accruedInterestPresent =
      this.#accounts.accruedOrdinaryInterest > 0 ||
      this.#accounts.accruedSpecialInterest > 0 ||
      this.#accounts.accruedRetirementInterest > 0

    // Update history  and accrued amounts only if there is an addition of interest to the balance
    if (accruedInterestPresent) {
      // Add interest to accounts
      this.#accounts.ordinaryAccount += normalRound(
        this.#accounts.accruedOrdinaryInterest
      )
      this.#accounts.specialAccount += normalRound(
        this.#accounts.accruedSpecialInterest
      )

      if (this.#person.reachedWithdrawalAge) {
        // Account for RA matters if after withdrawal age
        this.#accounts.retirementAccount += normalRound(
          this.#accounts.accruedRetirementInterest
        )

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

      // Revert accrued interest back to 0 for the new year
      this.#accounts.accruedOrdinaryInterest = 0
      this.#accounts.accruedSpecialInterest = 0
      this.#accounts.accruedRetirementInterest = 0
    }
  }

  addInterestAtEndOfPeriod() {
    this.addInterestToAccounts()

    if (!this.#person.reachedWithdrawalAge) {
      this.updateHistory('Balance')
    } else {
      this.updateHistoryAfterWithdrawalAge('Balance')
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
      history: this.#history,
      historyAfterWithdrawalAge: this.#historyAfterWithdrawalAge,
      monthlySalary: this.#salary.amount,
      salaryHistory: this.#salary.history,
      salaryHistoryAfterWithdrawalAge: this.#salary.historyAfterWithdrawalAge,
      errors: this.#errors,
    }
  }

  get monthsTillWithdrawal() {
    return this.#person.monthsTillWithdrawal
  }
}
