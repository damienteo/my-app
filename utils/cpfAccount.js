import { cpfValues, withdrawalAge, payoutAge } from '../constants'
import { getAgeInMonths } from './cpfCalculator'

const {
  baseRate,
  ordinaryIR,
  specialIR,
  bonusIR,
  bonusAmtCap,
  ordinaryAmtCap,
} = cpfValues

const ordinaryInterestRate = ordinaryIR / 12
const specialInterestRate = specialIR / 12

const bonusOrdinaryInterestRate = (ordinaryIR + bonusIR) / 12
const bonusSpecialInterestRate = (specialIR + bonusIR) / 12

const normalRound = (value) => {
  return Math.floor(value * 100) / 100
}

export class CPFAccount {
  #ordinaryAccount
  #specialAccount

  #monthsTillWithdrawal

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0

  constructor(values, selectedDate) {
    const { ordinaryAccount, specialAccount } = values
    // roundTo2Dec function converts values into string
    this.#ordinaryAccount = parseFloat(ordinaryAccount)
    this.#specialAccount = parseFloat(specialAccount)

    const currentAgeInMonths = getAgeInMonths(selectedDate)
    const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths
    this.#monthsTillWithdrawal = monthsTillWithdrawal
  }

  addMonthlyInterest() {
    // Take note of Bonus Ordinary Account Cap
    const eligibleOrdinaryAmount =
      this.#ordinaryAccount > ordinaryAmtCap
        ? ordinaryAmtCap
        : this.#ordinaryAccount

    // Settle Additional Interest for Ordinary Account
    if (eligibleOrdinaryAmount === ordinaryAmtCap) {
      // Take out amount in OA that is not eligible for bonus interest rate
      const nonBonusOrdinaryAmount = this.#ordinaryAccount - ordinaryAmtCap

      const bonusInterest = ordinaryAmtCap * bonusOrdinaryInterestRate
      const nonBonusInterest = nonBonusOrdinaryAmount * ordinaryInterestRate

      this.#accruedOrdinaryInterest =
        this.#accruedOrdinaryInterest + bonusInterest + nonBonusInterest
    } else {
      // If Ordinary Account is below the cap, entire Ordinary Account is eligible for bonus interest
      this.#accruedOrdinaryInterest =
        this.#accruedOrdinaryInterest +
        this.#ordinaryAccount * bonusOrdinaryInterestRate
    }

    // Take note of Special Account eligible for Bonus Rate, by taking out Ordinary Account from Bonus Account Cap
    const eligibleSpecialAmount = bonusAmtCap - eligibleOrdinaryAmount
    const nonBonusSpecialAmount = this.#specialAccount - eligibleSpecialAmount

    // Settle Additional Interest for Special Account
    const bonusSpecialInterest =
      eligibleSpecialAmount * bonusSpecialInterestRate
    const nonBonusSpecialInterest = nonBonusSpecialAmount * specialInterestRate

    // Add bonus SA interest
    this.#accruedSpecialInterest =
      this.#accruedSpecialInterest +
      bonusSpecialInterest +
      nonBonusSpecialInterest

    console.log(this.#accruedSpecialInterest)
  }

  addInterestToAccounts() {
    this.#ordinaryAccount =
      this.#ordinaryAccount + this.#accruedOrdinaryInterest
    this.#specialAccount = this.#specialAccount + this.#accruedSpecialInterest

    this.#accruedOrdinaryInterest = 0
    this.#accruedSpecialInterest = 0
  }

  addInterestOverTime(months) {
    let period = months

    while (period > 0) {
      // Calculate and Add Accrued Interest at the End of Every year
      if (period % 12 === 0) {
        this.addInterestToAccounts()
      }

      // Update Accrued Interest amount
      period -= 1
      this.addMonthlyInterest()

      // Add interest at the end of the period
      if (period === 0) {
        this.addInterestToAccounts()
      }
    }
  }

  get accountValues() {
    return {
      ordinaryAccount: normalRound(this.#ordinaryAccount),
      specialAccount: normalRound(this.#specialAccount),
      monthsTillWithdrawal: this.#monthsTillWithdrawal,
    }
  }

  get monthsTillWithdrawal() {
    return this.#monthsTillWithdrawal
  }
}
