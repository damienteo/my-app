import { Salary } from '../../../utils/cpf/salary'

describe('Salary', () => {
  test('Initializes with Amount', () => {
    const newSalary = new Salary('3000', '1')

    expect(newSalary.amount).toBe(3000)
  })

  //   Shift tests that overlap with CPFAccount.test
})
