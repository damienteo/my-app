import dayjs, { Dayjs } from 'dayjs'
import { withdrawalAge } from '../../../constants'
import { cpfEffectiveAge, monthsUntilBirthdayMonth } from '../parameters'

export type PersonValues = {
  selectedDate: Dayjs
  housingLumpSum: string
  housingLumpSumDate: Dayjs
  housingMonthlyPayment: string
  housingLoanTenure: string
  housingLoanDate: Dayjs
  /** Date the projection starts. Defaults to today. */
  asOf?: Dayjs
}

export class Person {
  #birthDate: Dayjs
  #date: Dayjs
  #monthsTillWithdrawal: number
  #reachedWithdrawalAge = false

  #housingLumpSum: number
  #housingLumpSumDate: string

  #housingMonthlyPayment: number
  #housingLoanTenureInMonths: number
  #housingLoanDate: Dayjs

  constructor(personValues: PersonValues) {
    const {
      selectedDate,
      housingLumpSum,
      housingLumpSumDate,
      housingMonthlyPayment,
      housingLoanTenure,
      housingLoanDate,
      asOf,
    } = personValues

    this.#birthDate = dayjs(selectedDate)
    this.#date = asOf ? dayjs(asOf) : dayjs()
    // Frozen at the start so the results page can still say how long it was
    // until 55 after the projection has run forward.
    this.#monthsTillWithdrawal = monthsUntilBirthdayMonth(
      this.#birthDate,
      this.#date,
      withdrawalAge
    )

    this.#housingLumpSum = parseFloat(housingLumpSum)
    this.#housingLumpSumDate = dayjs(housingLumpSumDate).format('MMM YYYY')

    this.#housingMonthlyPayment = parseFloat(housingMonthlyPayment)
    this.#housingLoanTenureInMonths = parseInt(housingLoanTenure) * 12
    this.#housingLoanDate = dayjs(housingLoanDate)
  }

  updateTimePeriod() {
    this.#date = this.#date.add(1, 'month')
  }

  decrementLoanTenure() {
    this.#housingLoanTenureInMonths -= 1
  }

  setReachedWithdrawalAge() {
    this.#reachedWithdrawalAge = true
  }

  clearHousingLumpSum() {
    this.#housingLumpSum = 0
  }

  get birthDate() {
    return this.#birthDate
  }

  get date() {
    return this.#date
  }

  /** Completed years on the simulation date. Used for display. */
  get age() {
    return this.#date.diff(this.#birthDate, 'year')
  }

  /**
   * Age that selects the contribution band: completed years on the last day
   * of the previous month, so the band changes the month after the birthday.
   */
  get contributionAge() {
    return cpfEffectiveAge(this.#birthDate, this.#date)
  }

  get monthsTillWithdrawal() {
    return this.#monthsTillWithdrawal
  }

  get reachedWithdrawalAge() {
    return this.#reachedWithdrawalAge
  }

  get housingLumpSum() {
    return this.#housingLumpSum
  }

  get housingLumpSumDate() {
    return this.#housingLumpSumDate
  }

  get housingMonthlyPayment() {
    return this.#housingMonthlyPayment
  }

  get housingLoanTenureInMonths() {
    return this.#housingLoanTenureInMonths
  }

  set housingLoanTenureInMonths(value: number) {
    this.#housingLoanTenureInMonths = value
  }

  get housingLoanDate() {
    return this.#housingLoanDate
  }
}
