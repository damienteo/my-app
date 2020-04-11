import {
  cpfAllocation,
  cpfValues,
  additionalWageCeiling,
  ordinaryWageCeiling,
  withdrawalAge,
  payoutAge,
} from '../constants'
import { getAge } from './cpfCalculator'

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

const getAdditionalWageCeiling = (ordinaryWage) => {
  return additionalWageCeiling - ordinaryWage * 12
}

const getCPFAllocation = (age) => {
  if (age <= 35) return cpfAllocation['35AndBelow']

  if (age >= 36 && age <= 45) return cpfAllocation['36to45']

  if (age >= 46 && age <= 50) return cpfAllocation['46to50']

  if (age >= 51 && age <= 55) return cpfAllocation['51to55']

  if (age >= 56 && age <= 60) return cpfAllocation['56to60']

  if (age >= 61 && age <= 65) return cpfAllocation['61to65']

  if (age >= 66) return cpfAllocation['66andAbove']
}

export class CPFAccount {
  #ordinaryAccount
  #specialAccount
  #monthlySalary

  #currentAge
  #monthProgression
  #monthsTillWithdrawal

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0

  constructor(values, selectedDate) {
    const { ordinaryAccount, specialAccount, monthlySalary } = values
    // roundTo2Dec function converts values into string
    this.#ordinaryAccount = parseFloat(ordinaryAccount)
    this.#specialAccount = parseFloat(specialAccount)
    this.#monthlySalary = parseFloat(monthlySalary)

    const currentAgeInMonths = getAge(selectedDate, 'months')
    const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths
    this.#monthsTillWithdrawal = monthsTillWithdrawal

    this.#currentAge = getAge(selectedDate, 'years')
    this.#monthProgression = 0
  }

  addMonthlySalary() {
    // Track progression of time
    this.#monthProgression++

    // Update Age as years pass
    if (this.#monthProgression % 12 === 0) {
      this.#currentAge++
    }

    // If monthly salary exceeds wage ceiling, take only wage ceiling as eligible for CPF contribution
    const eligibleSalary =
      this.#monthlySalary > ordinaryWageCeiling
        ? ordinaryWageCeiling
        : this.#monthlySalary

    // Get CPF Allocation rates based on current age
    const currentCPFAllocation = getCPFAllocation(this.#currentAge)

    // Calculate CPF Allocation amounts and add accordingly
    const OAContribution = eligibleSalary * currentCPFAllocation.OA
    this.#ordinaryAccount = this.#ordinaryAccount + OAContribution

    const SAContribution = eligibleSalary * currentCPFAllocation.SA
    this.#specialAccount = this.#specialAccount + SAContribution
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

      // Accrue OA interest
      this.#accruedOrdinaryInterest =
        this.#accruedOrdinaryInterest + bonusInterest + nonBonusInterest
    } else {
      // If Ordinary Account is below the cap, entire Ordinary Account is eligible for bonus interest
      this.#accruedOrdinaryInterest =
        this.#accruedOrdinaryInterest +
        this.#ordinaryAccount * bonusOrdinaryInterestRate
    }

    // Take note of Special Account eligible for Bonus Rate, by taking out Ordinary Account from Bonus Account Cap
    const eligibleSpecialAmountCap = bonusAmtCap - eligibleOrdinaryAmount

    // Take note of Amount in Special Account eligible for Bonus Interest
    const eligibleSpecialAmount =
      this.#specialAccount > eligibleSpecialAmountCap
        ? eligibleSpecialAmountCap
        : this.#specialAccount

    // Take note of Amount in Special Account NOT eligible for Bonus Interest
    const nonBonusSpecialAmount = this.#specialAccount - eligibleSpecialAmount

    // Settle Additional Interest for Special Account
    const bonusSpecialInterest =
      eligibleSpecialAmount * bonusSpecialInterestRate
    const nonBonusSpecialInterest = nonBonusSpecialAmount * specialInterestRate

    // Accrue SA interest
    this.#accruedSpecialInterest =
      this.#accruedSpecialInterest +
      bonusSpecialInterest +
      nonBonusSpecialInterest
  }

  addInterestToAccounts() {
    this.#ordinaryAccount =
      this.#ordinaryAccount + this.#accruedOrdinaryInterest
    this.#specialAccount = this.#specialAccount + this.#accruedSpecialInterest

    this.#accruedOrdinaryInterest = 0
    this.#accruedSpecialInterest = 0
  }

  addSalaryAndInterestOverTime(months) {
    let period = months

    while (period > 0) {
      // Calculate and add Accrued Interest for the end of the previous year
      if (period % 12 === 0) {
        this.addInterestToAccounts()
      }

      // Update period for the start of the month
      period -= 1

      // Update Accrued Interest amount
      this.addMonthlyInterest()

      // Add salary at the end of the month, as interest is based on the lowest amount in the account at any time in the month
      this.addMonthlySalary()

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
