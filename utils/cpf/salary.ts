import { SalaryRecord } from './types'
import { normalRound } from '../utils'
import { withdrawalAge } from '../../constants'

export class Salary {
  #amount: number
  #increaseRate: number

  #history: SalaryRecord[] = []
  #historyAfterWithdrawalAge: SalaryRecord[] = []

  constructor(amount: string, increaseRate: string) {
    this.#amount = parseFloat(amount)
    this.#increaseRate = parseFloat(increaseRate)
  }

  updateSalaryHistory(age: number, year: number) {
    this.#history.push({
      amount: normalRound(this.#amount),
      age,
      year,
    })
  }

  updateSalaryHistoryAfterWithdrawalAge(age: number, year: number) {
    this.#historyAfterWithdrawalAge.push({
      amount: normalRound(this.#amount),
      age,
      year,
    })
  }

  addMonthlySalaryAtEndOfYear(
    age: number,
    year: number,
    reachedWithdrawalAge: boolean
  ) {
    this.#amount += normalRound(this.amount * (this.#increaseRate / 100))

    // Initiate salaryHistoryAfterWithdrawalAge with the first year's salary, which is still the salary just before the user has reached withdrawal age
    if (age === withdrawalAge - 1) {
      this.updateSalaryHistoryAfterWithdrawalAge(age, year)
    }

    if (reachedWithdrawalAge) {
      this.updateSalaryHistoryAfterWithdrawalAge(age, year)
    } else {
      this.updateSalaryHistory(age, year)
    }
  }

  get amount() {
    return this.#amount
  }

  get increaseRate() {
    return this.#increaseRate
  }

  get history() {
    return this.#history
  }

  get historyAfterWithdrawalAge() {
    return this.#historyAfterWithdrawalAge
  }
}
