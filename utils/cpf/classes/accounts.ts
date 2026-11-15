import { normalRound } from '../../utils'
import {
  AccountBalances,
  ContributionSplit,
  monthlyInterest,
} from '../parameters'

export interface CreditOptions {
  redirectOrdinaryToSpecial: boolean
  basicHealthcareSum: number
  retirementAccountOpen: boolean
}

export interface InterestCreditOptions {
  basicHealthcareSum?: number
  retirementAccountOpen?: boolean
}

/**
 * Ordinary, Special, MediSave and Retirement balances.
 *
 * From 2025 the Special Account closes at 55. Savings go to the Retirement
 * Account up to the cohort Full Retirement Sum, and whatever is left in the
 * Special Account moves to the Ordinary Account. If the Retirement Account
 * is still short of the Full Retirement Sum, Ordinary Account savings make
 * up the difference.
 * https://www.cpf.gov.sg/member/retirement-income/milestones/reaching-age-55
 *
 * MediSave above the Basic Healthcare Sum flows to the Special Account
 * before 55, or to the Retirement Account from 55. Once the Full Retirement
 * Sum is set aside, that overflow goes to the Ordinary Account.
 * https://www.cpf.gov.sg/member/infohub/educational-resources/2-things-you-should-know-about-your-medisave-savings-once-it-reaches-the-basic-healthcare-sum
 */
export class Accounts {
  #ordinaryAccount: number
  #specialAccount: number
  #mediSaveAccount: number
  #retirementAccount = 0
  #cohortFullRetirementSum = 0
  #ordinaryAccountAtWithdrawalAge = 0
  #specialAccountAtWithdrawalAge = 0
  #mediSaveAccountAtWithdrawalAge = 0

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0
  #accruedMediSaveInterest = 0
  #accruedRetirementInterest = 0

  constructor(
    ordinaryAccount: number,
    specialAccount: number,
    specialAccountOnly: boolean,
    mediSaveAccount = 0
  ) {
    this.#mediSaveAccount = mediSaveAccount
    if (specialAccountOnly) {
      this.#ordinaryAccount = 0
      this.#specialAccount = specialAccount + ordinaryAccount
    } else {
      this.#ordinaryAccount = ordinaryAccount
      this.#specialAccount = specialAccount
    }
  }

  updateAccountsAtWithdrawalAge(fullRetirementSum: number) {
    this.#cohortFullRetirementSum = fullRetirementSum
    this.#ordinaryAccountAtWithdrawalAge = this.#ordinaryAccount
    this.#specialAccountAtWithdrawalAge = this.#specialAccount
    this.#mediSaveAccountAtWithdrawalAge = this.#mediSaveAccount

    const specialToRetirement = Math.min(
      this.#specialAccount,
      fullRetirementSum
    )
    this.#specialAccount = normalRound(
      this.#specialAccount - specialToRetirement
    )
    this.#retirementAccount = normalRound(
      this.#retirementAccount + specialToRetirement
    )

    // The Special Account is closed. Any savings above the Full Retirement
    // Sum move to the Ordinary Account instead of staying in the SA.
    this.#ordinaryAccount = normalRound(
      this.#ordinaryAccount + this.#specialAccount
    )
    this.#specialAccount = 0

    // The Special Account is closed. Interest already earned on it this year
    // has not been credited yet, so it follows the savings into the RA.
    this.#accruedRetirementInterest = normalRound(
      this.#accruedRetirementInterest + this.#accruedSpecialInterest
    )
    this.#accruedSpecialInterest = 0

    const shortfall = fullRetirementSum - this.#retirementAccount
    if (shortfall > 0) {
      const ordinaryToRetirement = Math.min(this.#ordinaryAccount, shortfall)
      this.#ordinaryAccount = normalRound(
        this.#ordinaryAccount - ordinaryToRetirement
      )
      this.#retirementAccount = normalRound(
        this.#retirementAccount + ordinaryToRetirement
      )
    }
  }

  /**
   * Credit one month's contribution after MediSave and Retirement Account caps.
   * Returns the amount that landed in each account.
   */
  creditContribution(
    split: ContributionSplit,
    options: CreditOptions
  ): ContributionSplit {
    let ordinary = split.ordinary
    let special = split.special
    const retirement = split.retirement
    const mediSaveRoom = Math.max(
      0,
      options.basicHealthcareSum - this.#mediSaveAccount
    )
    const mediSaveCredited = Math.min(split.mediSave, mediSaveRoom)
    const mediSaveOverflow = normalRound(split.mediSave - mediSaveCredited)
    this.#mediSaveAccount = normalRound(
      this.#mediSaveAccount + mediSaveCredited
    )

    if (options.redirectOrdinaryToSpecial && !options.retirementAccountOpen) {
      special = normalRound(special + ordinary)
      ordinary = 0
    }

    if (!options.retirementAccountOpen) {
      special = normalRound(special + mediSaveOverflow)
      this.#ordinaryAccount = normalRound(this.#ordinaryAccount + ordinary)
      this.#specialAccount = normalRound(this.#specialAccount + special)
      return {
        ordinary,
        special,
        retirement: 0,
        mediSave: mediSaveCredited,
        total: split.total,
      }
    }

    const savings = normalRound(retirement + mediSaveOverflow)
    const retirementRoom = Math.max(
      0,
      this.#cohortFullRetirementSum - this.#retirementAccount
    )
    const retirementCredited = Math.min(savings, retirementRoom)
    const retirementOverflow = normalRound(savings - retirementCredited)
    this.#retirementAccount = normalRound(
      this.#retirementAccount + retirementCredited
    )
    ordinary = normalRound(ordinary + retirementOverflow)
    this.#ordinaryAccount = normalRound(this.#ordinaryAccount + ordinary)

    return {
      ordinary,
      special: 0,
      retirement: retirementCredited,
      mediSave: mediSaveCredited,
      total: split.total,
    }
  }

  accrueMonthlyInterest(aged55OrAbove: boolean) {
    const interest = monthlyInterest(this.balances, aged55OrAbove)
    this.#accruedOrdinaryInterest = normalRound(
      this.#accruedOrdinaryInterest + interest.ordinary
    )
    this.#accruedSpecialInterest = normalRound(
      this.#accruedSpecialInterest + interest.special
    )
    this.#accruedMediSaveInterest = normalRound(
      this.#accruedMediSaveInterest + interest.mediSave
    )
    this.#accruedRetirementInterest = normalRound(
      this.#accruedRetirementInterest + interest.retirement
    )
  }

  addInterestToAccounts(options: InterestCreditOptions = {}) {
    this.#ordinaryAccount = normalRound(
      this.#ordinaryAccount + this.#accruedOrdinaryInterest
    )
    this.#specialAccount = normalRound(
      this.#specialAccount + this.#accruedSpecialInterest
    )
    this.#retirementAccount = normalRound(
      this.#retirementAccount + this.#accruedRetirementInterest
    )
    this.#mediSaveAccount = normalRound(
      this.#mediSaveAccount + this.#accruedMediSaveInterest
    )

    const bhs = options.basicHealthcareSum
    if (bhs !== undefined && this.#mediSaveAccount > bhs) {
      const overflow = normalRound(this.#mediSaveAccount - bhs)
      this.#mediSaveAccount = bhs
      this.#redirectOverflow(overflow, Boolean(options.retirementAccountOpen))
    }

    this.#accruedOrdinaryInterest = 0
    this.#accruedSpecialInterest = 0
    this.#accruedMediSaveInterest = 0
    this.#accruedRetirementInterest = 0
  }

  #redirectOverflow(overflow: number, retirementAccountOpen: boolean) {
    if (!retirementAccountOpen) {
      this.#specialAccount = normalRound(this.#specialAccount + overflow)
      return
    }
    const room = Math.max(
      0,
      this.#cohortFullRetirementSum - this.#retirementAccount
    )
    const toRetirement = Math.min(overflow, room)
    this.#retirementAccount = normalRound(
      this.#retirementAccount + toRetirement
    )
    this.#ordinaryAccount = normalRound(
      this.#ordinaryAccount + (overflow - toRetirement)
    )
  }

  private get balances(): AccountBalances {
    return {
      ordinary: this.#ordinaryAccount,
      special: this.#specialAccount,
      mediSave: this.#mediSaveAccount,
      retirement: this.#retirementAccount,
    }
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

  set mediSaveAccount(value: number) {
    this.#mediSaveAccount = value
  }

  get mediSaveAccount() {
    return this.#mediSaveAccount
  }

  get mediSaveAccountAtWithdrawalAge() {
    return this.#mediSaveAccountAtWithdrawalAge
  }

  set accruedMediSaveInterest(value: number) {
    this.#accruedMediSaveInterest = value
  }

  get accruedMediSaveInterest() {
    return this.#accruedMediSaveInterest
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

  get cohortFullRetirementSum() {
    return this.#cohortFullRetirementSum
  }
}
