import moment from 'moment'
import { getAge } from '../cpfForecast'
import { withdrawalAge } from '../../../constants'

export class Person {
  #age: number
  #birthDate: moment.Moment
  #date = moment()
  #monthsTillWithdrawal: number
  #reachedWithdrawalAge = false

  #housingLumpSum: number
  #housingLumpSumDate: string

  constructor(
    selectedDate: moment.Moment,
    housingLumpSum: string,
    housingLumpSumDate: moment.Moment
  ) {
    this.#birthDate = moment(selectedDate)
    this.#age = getAge(selectedDate, 'years')

    const currentAgeInMonths = getAge(selectedDate, 'months')
    const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths
    this.#monthsTillWithdrawal = monthsTillWithdrawal

    this.#housingLumpSum = parseFloat(housingLumpSum)
    this.#housingLumpSumDate = moment(housingLumpSumDate).format('MMM YYYY')
  }

  updateTimePeriod() {
    // Track progression of time
    this.#date.add(1, 'M')

    // Update Age if month of current date is same as month of birthdate
    if (this.birthDate.month() === this.#date.month()) {
      this.#age++
    }
  }

  setReachedWithdrawalAge() {
    this.#reachedWithdrawalAge = true
  }

  clearHousingLoan() {
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
}
