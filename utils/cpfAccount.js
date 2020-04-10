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

export class CPFAccount {
  #ordinaryAccount
  #specialAccount

  #monthsTillWithdrawal

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0

  constructor(values, selectedDate) {
    const { ordinaryAccount, specialAccount } = values
    this.#ordinaryAccount = ordinaryAccount
    this.#specialAccount = specialAccount

    const currentAgeInMonths = getAgeInMonths(selectedDate)
    const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths
    this.#monthsTillWithdrawal = monthsTillWithdrawal
  }

  addMonthlyInterest() {
    this.#accruedOrdinaryInterest =
      this.#accruedOrdinaryInterest +
      this.#ordinaryAccount * ordinaryInterestRate
    this.#accruedSpecialInterest += this.#specialAccount * specialInterestRate
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
      ordinaryAccount: this.#ordinaryAccount,
      specialAccount: this.#specialAccount,
      monthsTillWithdrawal: this.#monthsTillWithdrawal,
    }
  }

  get monthsTillWithdrawal() {
    return this.#monthsTillWithdrawal
  }
}
