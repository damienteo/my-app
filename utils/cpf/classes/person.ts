import dayjs, { Dayjs } from 'dayjs'
import { getAge } from '../cpfForecast'
import { withdrawalAge } from '../../../constants'

export type PersonValues = {
  selectedDate: Dayjs
  housingLumpSum: string
  housingLumpSumDate: Dayjs
  housingMonthlyPayment: string
  housingLoanTenure: string
  housingLoanDate: Dayjs
}

export class Person {
  #age: number
  #birthDate: Dayjs
  #date = dayjs()
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
    } = personValues

    this.#birthDate = dayjs(selectedDate)
    this.#age = getAge(selectedDate, 'years')

    const currentAgeInMonths = getAge(selectedDate, 'months')
    const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths
    this.#monthsTillWithdrawal = monthsTillWithdrawal

    this.#housingLumpSum = parseFloat(housingLumpSum)
    this.#housingLumpSumDate = dayjs(housingLumpSumDate).format('MMM YYYY')

    this.#housingMonthlyPayment = parseFloat(housingMonthlyPayment)
    this.#housingLoanTenureInMonths = parseInt(housingLoanTenure) * 12
    this.#housingLoanDate = dayjs(housingLoanDate)
  }

  updateTimePeriod() {
    // Track progression of time
    this.#date = this.#date.add(1, 'month')

    // Update Age if month of current date is same as month of birthdate
    if (this.birthDate.month() === this.#date.month()) {
      this.#age++
    }
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

  get age() {
    return this.#age
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
