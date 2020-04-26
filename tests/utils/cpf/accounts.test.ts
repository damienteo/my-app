import { Accounts } from '../../../utils/cpf/classes/accounts'

describe('Accounts', () => {
  const newAccounts = new Accounts(3000, 3000)

  test('Initializes with required values', () => {
    expect(newAccounts.ordinaryAccount).toBe(3000)
    expect(newAccounts.specialAccount).toBe(3000)
    expect(newAccounts.retirementAccount).toBe(0)
    expect(newAccounts.ordinaryAccountAtWithdrawalAge).toBe(0)
    expect(newAccounts.specialAccountAtWithdrawalAge).toBe(0)
    expect(newAccounts.accruedOrdinaryInterest).toBe(0)
    expect(newAccounts.accruedRetirementInterest).toBe(0)
    expect(newAccounts.accruedSpecialInterest).toBe(0)
  })

  test('updates Accounts values', () => {
    newAccounts.ordinaryAccount = 5000
    newAccounts.specialAccount = 6000
    newAccounts.retirementAccount = 1000
    newAccounts.ordinaryAccountAtWithdrawalAge = 2000
    newAccounts.specialAccountAtWithdrawalAge = 3000
    newAccounts.accruedOrdinaryInterest = 4000
    newAccounts.accruedSpecialInterest = 5000
    newAccounts.accruedRetirementInterest = 6000

    expect(newAccounts.ordinaryAccount).toBe(5000)
    expect(newAccounts.specialAccount).toBe(6000)
    expect(newAccounts.retirementAccount).toBe(1000)
    expect(newAccounts.ordinaryAccountAtWithdrawalAge).toBe(2000)
    expect(newAccounts.specialAccountAtWithdrawalAge).toBe(3000)
    expect(newAccounts.accruedOrdinaryInterest).toBe(4000)
    expect(newAccounts.accruedSpecialInterest).toBe(5000)
    expect(newAccounts.accruedRetirementInterest).toBe(6000)
  })

  test('Adds to Account values', () => {
    newAccounts.ordinaryAccount += 2000
    newAccounts.specialAccount += 6000
    newAccounts.retirementAccount += 1000
    newAccounts.ordinaryAccountAtWithdrawalAge += 2000
    newAccounts.specialAccountAtWithdrawalAge += 3000
    newAccounts.accruedOrdinaryInterest += 4000
    newAccounts.accruedSpecialInterest += 5000
    newAccounts.accruedRetirementInterest += 6000

    expect(newAccounts.ordinaryAccount).toBe(5000 + 2000)
    expect(newAccounts.specialAccount).toBe(6000 + 6000)
    expect(newAccounts.retirementAccount).toBe(1000 * 2)
    expect(newAccounts.ordinaryAccountAtWithdrawalAge).toBe(2000 * 2)
    expect(newAccounts.specialAccountAtWithdrawalAge).toBe(3000 * 2)
    expect(newAccounts.accruedOrdinaryInterest).toBe(4000 * 2)
    expect(newAccounts.accruedSpecialInterest).toBe(5000 * 2)
    expect(newAccounts.accruedRetirementInterest).toBe(6000 * 2)
  })

  //   Shift tests that overlap with CPFAccount.test
})
