import { cpfInterestRates, cpfValues } from '../../../constants'
import { normalRound } from '../../utils'

const { bonusAmtCap, extraBonusAmtCap } = cpfValues

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

export class Accounts {
  #ordinaryAccount: number
  #specialAccount: number
  #retirementAccount = 0
  #ordinaryAccountAtWithdrawalAge = 0
  #specialAccountAtWithdrawalAge = 0

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0
  #accruedRetirementInterest = 0

  constructor(
    ordinaryAccount: number,
    specialAccount: number,
    specialAccountOnly: boolean
  ) {
    if (specialAccountOnly) {
      // Transfer funds from Ordinary Account to Special Account
      this.#ordinaryAccount = 0
      this.#specialAccount = specialAccount + ordinaryAccount
    } else {
      this.#ordinaryAccount = ordinaryAccount
      this.#specialAccount = specialAccount
    }
  }

  updateAccountsAtWithdrawalAge(fullRetirementSum: number) {
    // Set snapshot of OA and SA amounts at Withdrawal Age
    this.#ordinaryAccountAtWithdrawalAge = this.#ordinaryAccount
    this.#specialAccountAtWithdrawalAge = this.#specialAccount

    // FRS takes money from Special Account (SA) before Ordinary Account (OA)
    const isSpecialEnoughForRetirement =
      this.#specialAccount > fullRetirementSum

    // Calculate amounts to be transferred from SA to RA
    const specialToRetirementAmount = isSpecialEnoughForRetirement
      ? fullRetirementSum
      : this.#specialAccount

    // Calculate amounts to be transferred from OA to RA
    const retirementSumShortfall = fullRetirementSum - specialToRetirementAmount
    const ordinaryToRetirementAmount =
      this.#ordinaryAccount > retirementSumShortfall
        ? retirementSumShortfall
        : this.#ordinaryAccount

    //  Remove SA and OA Amounts to be transferred to RA
    this.#specialAccount -= specialToRetirementAmount
    this.#ordinaryAccount -= ordinaryToRetirementAmount

    this.#retirementAccount =
      specialToRetirementAmount + ordinaryToRetirementAmount
  }

  accrueRAInterest() {
    // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)

    // Take note of Retirement Account eligible for Extra Bonus Rate, by taking out extraEligibleRetirementAmount from  this.#accounts.retirementAccount
    const extraEligibleRetirementAmount =
      this.#retirementAccount > extraBonusAmtCap
        ? extraBonusAmtCap
        : this.#retirementAccount

    //Calculate Extra-Bonus Interest for Retirement Account
    const extraBonusRetirementInterest = normalRound(
      extraEligibleRetirementAmount * extraBonusRetirementInterestRate
    )

    // Take note of Retirement Account eligible for normal Bonus Rate, by taking out eligibleRetirementAmount from  this.#retirementAccount
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
    this.#accruedRetirementInterest += normalRound(
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
    this.#accruedSpecialInterest = this.#accruedSpecialInterest + bonusInterest
  }

  accrueBonusOAInterestAfterWithdrawalAge(eligibleOrdinaryAmount: number) {
    // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)
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
    // Bonus Interest from the Ordinary Account iRetirement Account (if 55 and above)
    this.#accruedRetirementInterest += extraBonusInterest + bonusInterest
  }

  accrueSAInterest(eligibleSpecialAmountCap: number) {
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
    this.#accruedSpecialInterest += normalRound(
      bonusSpecialInterest + nonBonusSpecialInterest
    )
  }

  accrueSAInterestAfterWithdrawalAge(eligibleSpecialAmountCap: number) {
    // Bonus Interest is different for the first $30,000 of the bonus cap (if 55 and above)
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
    this.#accruedSpecialInterest += normalRound(
      extraBonusInterest + bonusSpecialInterest + nonBonusSpecialInterest
    )
  }

  accrueOAInterest() {
    this.#accruedOrdinaryInterest += normalRound(
      this.#ordinaryAccount * ordinaryInterestRate
    )
  }

  addInterestToAccounts() {
    const accruedInterestPresent =
      this.#accruedOrdinaryInterest > 0 ||
      this.#accruedSpecialInterest > 0 ||
      this.#accruedRetirementInterest > 0

    // Update history  and accrued amounts only if there is an addition of interest to the balance
    if (accruedInterestPresent) {
      // Add interest to accounts
      this.#ordinaryAccount += normalRound(this.#accruedOrdinaryInterest)
      this.#specialAccount += normalRound(this.#accruedSpecialInterest)
      this.#retirementAccount += normalRound(this.#accruedRetirementInterest)
    }

    // Reset accrued interest back to 0 for the new year
    this.#accruedOrdinaryInterest = 0
    this.#accruedSpecialInterest = 0
    this.#accruedRetirementInterest = 0
  }

  set ordinaryAccount(value: number) {
    this.#ordinaryAccount = value
  }

  get ordinaryAccount() {
    return this.#ordinaryAccount
  }

  set ordinaryAccountAtWithdrawalAge(value: number) {
    this.#ordinaryAccountAtWithdrawalAge = value
  }

  get ordinaryAccountAtWithdrawalAge() {
    return this.#ordinaryAccountAtWithdrawalAge
  }

  set accruedOrdinaryInterest(value: number) {
    this.#accruedOrdinaryInterest = value
  }

  get accruedOrdinaryInterest() {
    return this.#accruedOrdinaryInterest
  }

  set specialAccount(value: number) {
    this.#specialAccount = value
  }

  get specialAccount() {
    return this.#specialAccount
  }

  set specialAccountAtWithdrawalAge(value: number) {
    this.#specialAccountAtWithdrawalAge = value
  }

  get specialAccountAtWithdrawalAge() {
    return this.#specialAccountAtWithdrawalAge
  }

  set accruedSpecialInterest(value: number) {
    this.#accruedSpecialInterest = value
  }

  get accruedSpecialInterest() {
    return this.#accruedSpecialInterest
  }

  set retirementAccount(value: number) {
    this.#retirementAccount = value
  }

  get retirementAccount() {
    return this.#retirementAccount
  }

  set accruedRetirementInterest(value: number) {
    this.#accruedRetirementInterest = value
  }

  get accruedRetirementInterest() {
    return this.#accruedRetirementInterest
  }
}
