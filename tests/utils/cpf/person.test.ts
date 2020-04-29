import moment from 'moment'
import { Person } from '../../../utils/cpf/classes/person'
import { getAge } from '../../../utils/cpf/cpfForecast'
import { withdrawalAge } from '../../../constants'

const sixteenYearsAgo = moment().subtract(16, 'y')
const withdrawalAgeBirthDate = moment().subtract(withdrawalAge, 'y')

const values = {
  selectedDate: sixteenYearsAgo,
  housingLumpSum: '3000',
  housingLumpSumDate: moment(),
  housingMonthlyPayment: '0',
  housingLoanTenure: '0',
  housingLoanDate: moment(),
}

const withdrawalValues = {
  ...values,
  selectedDate: withdrawalAgeBirthDate,
}

const housingLoanValues = {
  ...values,
  housingMonthlyPayment: '200',
  housingLoanTenure: '10.1',
  housingLoanDate: moment().add(1, 'y'),
}

describe('Person', () => {
  test('Initializes with Birthdate', () => {
    const newAccount = new Person(values)

    expect(newAccount.birthDate.format('DD/MM/YYYY')).toBe(
      sixteenYearsAgo.format('DD/MM/YYYY')
    )
  })

  describe('#age', () => {
    test('Returns the age as sixteen years old', () => {
      const newAccount = new Person(values)

      expect(newAccount.age).toBe(16)
    })

    test('Returns the age as withdrawal age', () => {
      const newAccount = new Person(withdrawalValues)

      expect(newAccount.age).toBe(withdrawalAge)
    })
  })

  describe('#updateTimePeriod', () => {
    const newAccount = new Person(values)

    for (let i = 0; i < 120; i++) {
      newAccount.updateTimePeriod()
    }

    test('Returns the age as twenty six years old after 120 months (10 years)', () => {
      expect(newAccount.age).toBe(26)
    })

    test('Returns the current date as ten years in the future after 120 months (10 years)', () => {
      // Adding one month to moment object (29/01/2021) ends up with moment object (28/01/2021)
      const nextDate = moment()
        .add(10, 'y')
        .subtract(1, 'd')
        .format('DD/MM/YYYY')
      expect(newAccount.date.format('DD/MM/YYYY')).toBe(nextDate)
    })
  })

  describe('#monthsTillWithdrawal', () => {
    test('Returns the age as sixteen years old', () => {
      const newAccount = new Person(values)

      const currentAgeInMonths = getAge(sixteenYearsAgo, 'months')
      const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths

      expect(newAccount.monthsTillWithdrawal).toBe(monthsTillWithdrawal)
    })
  })

  describe('#reachedWithdrawalAge', () => {
    test('Elderly person', () => {
      const newAccount = new Person(withdrawalValues)

      // Requires setting of boolean, so that updateAccountsAtWithdrawalAge method can provide a distinct boundary between the time periods before and after withdrawal age
      newAccount.setReachedWithdrawalAge()
      expect(newAccount.reachedWithdrawalAge).toBe(true)
    })

    test('Young person', () => {
      const newAccount = new Person(values)

      expect(newAccount.reachedWithdrawalAge).toBe(false)
    })
  })

  describe('#housingLoan', () => {
    const newAccount = new Person(housingLoanValues)

    test('Should give correct tenure in months', () => {
      expect(newAccount.housingLoanTenureInMonths).toBe(
        parseInt(housingLoanValues.housingLoanTenure) * 12
      )
    })

    test('Should decrement tenure when method is called', () => {
      const months = 10

      for (let i = 0; i < months; i++) {
        newAccount.decrementLoanTenure()
      }
      expect(newAccount.housingLoanTenureInMonths).toBe(
        parseInt(housingLoanValues.housingLoanTenure) * 12 - months
      )
    })

    test('Should return loan amount', () => {
      expect(newAccount.housingMonthlyPayment).toBe(
        parseInt(housingLoanValues.housingMonthlyPayment)
      )
    })

    test('Should return lump sum amount', () => {
      expect(newAccount.housingLumpSum).toBe(
        parseInt(housingLoanValues.housingLumpSum)
      )
    })

    test('Should set housing loan tenure', () => {
      newAccount.housingLoanTenureInMonths = 5
      expect(newAccount.housingLoanTenureInMonths).toBe(5)
    })

    test('Should clear lump sum amount', () => {
      newAccount.clearHousingLumpSum()
      expect(newAccount.housingLumpSum).toBe(0)
    })
  })
})
