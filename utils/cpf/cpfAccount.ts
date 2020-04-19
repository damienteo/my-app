import moment from 'moment'
import {
  cpfAllocation,
  cpfValues,
  fullRetirementSum,
  retirementSumIncrease,
  ordinaryWageCeiling,
  withdrawalAge,
} from '../../constants'
import { getAge } from './cpfForecast'
import { normalRound } from '../utils'
import { Values, Entry, Accounts } from './types'

const {
  ordinaryIR,
  specialIR,
  retirementIR,
  bonusIR,
  bonusIRAfter55,
  bonusAmtCap,
  extraBonusAmtCap,
  ordinaryAmtCap,
} = cpfValues

const ordinaryInterestRate = ordinaryIR / 12
const specialInterestRate = specialIR / 12
const retirementInterestRate = retirementIR / 12

const bonusOrdinaryInterestRate = bonusIR / 12
const bonusSpecialInterestRate = (specialIR + bonusIR) / 12
const bonusRetirementInterestRate = (retirementIR + bonusIR) / 12

const extraBonusOrdinaryInterestRate = bonusIRAfter55 / 12
const extraBonusSpecialInterestRate = (specialIR + bonusIRAfter55) / 12
const extraBonusRetirementInterestRate = (retirementIR + bonusIRAfter55) / 12

export const getCPFAllocation = (age: number) => {
  if (age <= 35) return cpfAllocation['35AndBelow']

  if (age >= 36 && age <= 45) return cpfAllocation['36to45']

  if (age >= 46 && age <= 50) return cpfAllocation['46to50']

  if (age >= 51 && age <= 55) return cpfAllocation['51to55']

  if (age >= 56 && age <= 60) return cpfAllocation['56to60']

  if (age >= 61 && age <= 65) return cpfAllocation['61to65']

  return cpfAllocation['66andAbove']
}

export class CPFAccount {
  #ordinaryAccount: number
  #specialAccount: number
  #retirementAccount = 0
  #ordinaryAccountAtWithdrawalAge = 0
  #specialAccountAtWithdrawalAge = 0
  #monthlySalary: number

  #currentAge: number
  #currentDate = moment()
  #monthProgression = 0
  #reachedWithdrawalAge = false
  #history: Entry[]
  #historyAfterWithdrawalAge: Entry[]
  #monthsTillWithdrawal: number

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0
  #accruedRetirementInterest = 0

  constructor(values: Values, selectedDate: moment.Moment) {
    const { ordinaryAccount, specialAccount, monthlySalary } = values
    // roundTo2Dec function converts values into string
    this.#ordinaryAccount = parseFloat(ordinaryAccount)
    this.#specialAccount = parseFloat(specialAccount)
    this.#monthlySalary = parseFloat(monthlySalary)

    const currentAgeInMonths = getAge(selectedDate, 'months')
    const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths
    this.#monthsTillWithdrawal = monthsTillWithdrawal

    this.#currentAge = getAge(selectedDate, 'years')
    this.#history = []
    this.#historyAfterWithdrawalAge = []
  }

  updateTimePeriod() {
    // Track progression of time
    this.#monthProgression++
    this.#currentDate.add(1, 'M')

    // Update Age as years pass
    if (this.#monthProgression % 12 === 0) {
      this.#currentAge++
    }
  }

  updateHistory(category: string, rest = {} as Accounts) {
    this.#history.push({
      date: this.#currentDate.format('MMM YYYY'),
      category,
      ordinaryAccount: normalRound(this.#ordinaryAccount),
      specialAccount: normalRound(this.#specialAccount),
      ...rest,
    })
  }

  updateHistoryAfterWithdrawalAge(category: string, rest = {} as Accounts) {
    this.#historyAfterWithdrawalAge.push({
      date: this.#currentDate.format('MMM YYYY'),
      category,
      ordinaryAccount: normalRound(this.#ordinaryAccount),
      specialAccount: normalRound(this.#specialAccount),
      retirementAccount: normalRound(this.#retirementAccount),
      ...rest,
    })
  }

  updateAccountsAtWithdrawalAge() {
    this.#ordinaryAccountAtWithdrawalAge = this.#ordinaryAccount
    this.#specialAccountAtWithdrawalAge = this.#specialAccount
    this.#reachedWithdrawalAge = true

    const dateOfWithdrawalAge = this.#history[this.#history.length - 1].date
    const yearOfWithdrawalAge = parseInt(dateOfWithdrawalAge.split(' ')[1])
    const currentYear = moment().year()
    const yearsFromPresent = yearOfWithdrawalAge - currentYear

    const nextCPFFullRetirementSum =
      fullRetirementSum + retirementSumIncrease * yearsFromPresent

    // Transfer from Special Account to Retirement Account first
    const isSpecialEnoughForRetirement =
      this.#specialAccount > nextCPFFullRetirementSum

    // Calculate amounts to be transferred from SA / OA to RA
    const specialToRetirementAmount = isSpecialEnoughForRetirement
      ? nextCPFFullRetirementSum
      : this.#specialAccount

    const retirementSumShortfall =
      nextCPFFullRetirementSum - specialToRetirementAmount
    const ordinaryToRetirementAmount =
      this.#ordinaryAccount > retirementSumShortfall
        ? retirementSumShortfall
        : this.#ordinaryAccount

    //  Remove SA and OA Amounts to be transferred
    this.#specialAccount = this.#specialAccount - specialToRetirementAmount
    this.#ordinaryAccount = this.#ordinaryAccount - ordinaryToRetirementAmount

    this.#retirementAccount =
      specialToRetirementAmount + ordinaryToRetirementAmount

    this.updateHistoryAfterWithdrawalAge('Transfer')
  }

  addMonthlySalary() {
    // If monthly salary exceeds wage ceiling, take only wage ceiling as eligible for CPF contribution
    const eligibleSalary =
      this.#monthlySalary > ordinaryWageCeiling
        ? ordinaryWageCeiling
        : this.#monthlySalary

    // Get CPF Allocation rates based on current age
    const currentCPFAllocation = getCPFAllocation(this.#currentAge)

    // Calculate CPF Allocation amounts and add accordingly
    const OAContribution = normalRound(eligibleSalary * currentCPFAllocation.OA)
    this.#ordinaryAccount = this.#ordinaryAccount + OAContribution

    const SAContribution = normalRound(eligibleSalary * currentCPFAllocation.SA)
    this.#specialAccount = this.#specialAccount + SAContribution

    // Update history  and accrued amounts only if there is an addition of interest to the balance
    if (OAContribution > 0 || SAContribution > 0) {
      if (!this.#reachedWithdrawalAge) {
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
  }

  addMonthlyInterest() {
    //TODO: Simplify below
    // Amount for Bonus Interest is taken from Retirement Account, then Ordinary Account, then the Special Account

    // If Withdrawal Age reached, calculate Retirement Account interest and Accrue:
    if (this.#reachedWithdrawalAge) {
      // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)

      // Take note of Retirement Account eligible for Extra Bonus Rate, by taking out extraEligibleRetirementAmount from this.#retirementAccount
      const extraEligibleRetirementAmount =
        this.#retirementAccount > extraBonusAmtCap
          ? extraBonusAmtCap
          : this.#retirementAccount

      //Calculate Extra-Bonus Interest for Retirement Account
      const extraBonusRetirementInterest = normalRound(
        extraEligibleRetirementAmount * extraBonusRetirementInterestRate
      )

      // Take note of Retirement Account eligible for normal Bonus Rate, by taking out eligibleRetirementAmount from this.#retirementAccount
      const nonExtraBonusCap = bonusAmtCap - extraBonusAmtCap
      const excessRetirementAmount =
        this.#retirementAccount - extraEligibleRetirementAmount

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
      this.#accruedRetirementInterest = normalRound(
        this.#accruedRetirementInterest +
          extraBonusRetirementInterest +
          bonusRetirementInterest +
          nonBonusRetirementInterest
      )
    }

    // Update Bonus Amount Cap to be applied to OA and SA if there is RA
    let nextBonusAmountCap = bonusAmtCap
    if (this.#retirementAccount > 0) {
      nextBonusAmountCap =
        this.#retirementAccount >= bonusAmtCap
          ? 0
          : bonusAmtCap - this.#retirementAccount
    }

    // Take note of Bonus Ordinary Account Cap from updated Bonus Cap
    const nextOrdinaryAmountCap =
      nextBonusAmountCap >= ordinaryAmtCap ? ordinaryAmtCap : nextBonusAmountCap

    const eligibleOrdinaryAmount =
      this.#ordinaryAccount >= nextOrdinaryAmountCap
        ? nextOrdinaryAmountCap
        : this.#ordinaryAccount

    // Take note of Different Bonus Ordinary Account Interests before or after 55

    // Settle Additional Interest for Ordinary Account
    // Bonus Interest from the Ordinary Account is passed into the Special Account (if below 55), or Retirement Account (if 55 and above)

    if (this.#reachedWithdrawalAge) {
      // extraBonusAmtCap is the cap for extra bonus
      // nextBonusAmtCap is the amount that can still be applied for bonus interest (need to take RA into account)
      const nextExtraBonusAmountCap =
        this.#retirementAccount > extraBonusAmtCap
          ? 0
          : extraBonusAmtCap - this.#retirementAccount

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
      this.#accruedRetirementInterest =
        this.#accruedRetirementInterest + extraBonusInterest + bonusInterest
    } else {
      // Not yet reached 55
      const bonusInterest = normalRound(
        eligibleOrdinaryAmount * bonusOrdinaryInterestRate
      )

      // Accrue SA interest from OA Bonus Interest
      this.#accruedSpecialInterest =
        this.#accruedSpecialInterest + bonusInterest
    }

    // Entire Ordinary Account is eligible for normal OA interest, as bonus interest is sent to other accounts
    this.#accruedOrdinaryInterest =
      this.#accruedOrdinaryInterest +
      normalRound(this.#ordinaryAccount * ordinaryInterestRate)

    // Take note of Special Account eligible for Bonus Rate, by taking out Ordinary Account from Bonus Account Cap
    // Cannot simply compare OA to nextBonusAmountCap, as bonus applied to OA has a lower cap
    // By here, nextBonusAmountCap may be 0 if retirement age is present
    const eligibleSpecialAmountCap =
      nextBonusAmountCap > eligibleOrdinaryAmount
        ? nextBonusAmountCap - eligibleOrdinaryAmount
        : 0

    // TODO: Refactor
    if (this.#reachedWithdrawalAge) {
      // Take note of Cap for Extra Bonus Interest
      const totalRAandOA = this.#ordinaryAccount + this.#retirementAccount
      const specialAccountExtraBonusAmountCap =
        totalRAandOA > extraBonusAmtCap ? 0 : extraBonusAmtCap - totalRAandOA

      // Take note of Amount in Special Account eligible for Extra Bonus Interest
      const extraBonusSpecialAmount =
        this.#specialAccount >= specialAccountExtraBonusAmountCap
          ? specialAccountExtraBonusAmountCap
          : this.#specialAccount

      // Take note of Special Amount after removing amount to calculate extra bonus. The lowest value here is 0
      const specialAmountWithoutExtraBonus =
        this.#specialAccount - extraBonusSpecialAmount

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
      this.#accruedSpecialInterest = normalRound(
        this.#accruedSpecialInterest +
          extraBonusInterest +
          bonusSpecialInterest +
          nonBonusSpecialInterest
      )
    } else {
      // Take note of Amount in Special Account eligible for Normal Bonus Interest
      const eligibleSpecialAmount =
        this.#specialAccount >= eligibleSpecialAmountCap
          ? eligibleSpecialAmountCap
          : this.#specialAccount

      // Take note of Amount in Special Account NOT eligible for Bonus Interest
      const nonBonusSpecialAmount = this.#specialAccount - eligibleSpecialAmount

      // Settle Interest for Special Account
      const bonusSpecialInterest = normalRound(
        eligibleSpecialAmount * bonusSpecialInterestRate
      )
      const nonBonusSpecialInterest = normalRound(
        nonBonusSpecialAmount * specialInterestRate
      )

      // Accrue SA interest
      this.#accruedSpecialInterest = normalRound(
        this.#accruedSpecialInterest +
          bonusSpecialInterest +
          nonBonusSpecialInterest
      )
    }
  }

  addInterestToAccounts() {
    this.#ordinaryAccount = normalRound(
      this.#ordinaryAccount + this.#accruedOrdinaryInterest
    )
    this.#specialAccount = normalRound(
      this.#specialAccount + this.#accruedSpecialInterest
    )
    if (this.#reachedWithdrawalAge) {
      this.#retirementAccount = normalRound(
        this.#retirementAccount + this.#accruedRetirementInterest
      )
    }

    // Update history  and accrued amounts only if there is an addition of interest to the balance
    if (
      this.#accruedOrdinaryInterest > 0 ||
      this.#accruedSpecialInterest > 0 ||
      this.#accruedRetirementInterest > 0
    ) {
      if (!this.#reachedWithdrawalAge) {
        this.updateHistory('Interest', {
          ordinaryAccount: this.#accruedOrdinaryInterest,
          specialAccount: this.#accruedSpecialInterest,
        })
      } else {
        this.updateHistoryAfterWithdrawalAge('Interest', {
          ordinaryAccount: this.#accruedOrdinaryInterest,
          specialAccount: this.#accruedSpecialInterest,
          retirementAccount: this.#accruedRetirementInterest,
        })

        this.#accruedRetirementInterest = 0
      }

      this.#accruedOrdinaryInterest = 0
      this.#accruedSpecialInterest = 0
    }
  }

  addSalaryAndInterestOverTime(months: number) {
    let period = months

    while (period > 0) {
      // Calculate and add Accrued Interest for the end of the previous year. Ignore for the previous full year as that has been accounted for.
      if (period % 12 === 0 && period !== months) {
        this.addInterestToAccounts()

        if (!this.#reachedWithdrawalAge) {
          this.updateHistory('Balance')
        } else {
          this.updateHistoryAfterWithdrawalAge('Balance')
        }
      }

      // Update period for the start of the month
      period -= 1
      this.updateTimePeriod()

      // Update Accrued Interest amount
      this.addMonthlyInterest()

      // Add salary at the end of the month, as interest is based on the lowest amount in the account at any time in the month
      this.addMonthlySalary()

      // Add interest at the end of the period
      if (period === 0) {
        this.addInterestToAccounts()

        if (!this.#reachedWithdrawalAge) {
          this.updateHistory('Balance')
        } else {
          this.updateHistoryAfterWithdrawalAge('Balance')
        }
      }
    }
  }

  get accountValues() {
    return {
      ordinaryAccount: this.#ordinaryAccount,
      specialAccount: this.#specialAccount,
      retirementAccount: this.#retirementAccount,
      ordinaryAccountAtWithdrawalAge: this.#ordinaryAccountAtWithdrawalAge,
      specialAccountAtWithdrawalAge: this.#specialAccountAtWithdrawalAge,
      monthsTillWithdrawal: this.#monthsTillWithdrawal,
      history: this.#history,
      historyAfterWithdrawalAge: this.#historyAfterWithdrawalAge,
      monthlySalary: this.#monthlySalary,
    }
  }

  get monthsTillWithdrawal() {
    return this.#monthsTillWithdrawal
  }
}
