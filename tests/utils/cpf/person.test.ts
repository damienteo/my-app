import moment from 'moment'
import { Person } from '../../../utils/cpf/person'
import { getAge } from '../../../utils/cpf/cpfForecast'
import { withdrawalAge } from '../../../constants'

describe('Person', () => {
  const sixteenYearsAgo = moment().subtract(16, 'y')
  const withdrawalAgeBirthDate = moment().subtract(withdrawalAge, 'y')

  test('Initializes with Birthdate', () => {
    const newAccount = new Person(sixteenYearsAgo)

    expect(newAccount.birthDate.format('DD/MM/YYYY')).toBe(
      sixteenYearsAgo.format('DD/MM/YYYY')
    )
  })

  describe('#age', () => {
    test('Returns the age as sixteen years old', () => {
      const newAccount = new Person(sixteenYearsAgo)

      expect(newAccount.age).toBe(16)
    })

    test('Returns the age as withdrawal age', () => {
      const newAccount = new Person(withdrawalAgeBirthDate)

      expect(newAccount.age).toBe(withdrawalAge)
    })
  })

  describe('#updateTimePeriod', () => {
    const newAccount = new Person(sixteenYearsAgo)

    for (let i = 0; i < 120; i++) {
      newAccount.updateTimePeriod()
    }

    test('Returns the age as twenty six years old after 120 months (10 years)', () => {
      expect(newAccount.age).toBe(26)
    })

    test('Returns the current date as ten years in the future after 120 months (10 years)', () => {
      const nextDate = moment().add(10, 'y').format('DD/MM/YYYY')
      expect(newAccount.date.format('DD/MM/YYYY')).toBe(nextDate)
    })
  })

  describe('#monthsTillWithdrawal', () => {
    test('Returns the age as sixteen years old', () => {
      const newAccount = new Person(sixteenYearsAgo)

      const currentAgeInMonths = getAge(sixteenYearsAgo, 'months')
      const monthsTillWithdrawal = withdrawalAge * 12 - currentAgeInMonths

      expect(newAccount.monthsTillWithdrawal).toBe(monthsTillWithdrawal)
    })
  })

  describe('#reachedWithdrawalAge', () => {
    test('Elderly person', () => {
      const newAccount = new Person(withdrawalAgeBirthDate)

      // Requires setting of boolean, so that updateAccountsAtWithdrawalAge method can provide a distinct boundary between the time periods before and after withdrawal age
      newAccount.setReachedWithdrawalAge()
      expect(newAccount.reachedWithdrawalAge).toBe(true)
    })

    test('Young person', () => {
      const newAccount = new Person(sixteenYearsAgo)

      expect(newAccount.reachedWithdrawalAge).toBe(false)
    })
  })
})
