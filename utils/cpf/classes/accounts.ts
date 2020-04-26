// import { SalaryRecord } from '../types'
// import { normalRound } from '../../utils'
// import { withdrawalAge } from '../../../constants'

export class Accounts {
  #ordinaryAccount: number
  #specialAccount: number
  #retirementAccount = 0
  #ordinaryAccountAtWithdrawalAge = 0
  #specialAccountAtWithdrawalAge = 0

  #accruedOrdinaryInterest = 0
  #accruedSpecialInterest = 0
  #accruedRetirementInterest = 0

  constructor(ordinaryAccount: number, specialAccount: number) {
    this.#ordinaryAccount = ordinaryAccount
    this.#specialAccount = specialAccount
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
