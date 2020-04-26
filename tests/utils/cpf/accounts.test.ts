import { Accounts } from '../../../utils/cpf/classes/accounts'

describe('Accounts', () => {
  const newAccounts = new Accounts(3000, 3000, false)

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

  test('Updates Account Values at Withdrawal Age', () => {
    newAccounts.ordinaryAccount = 10000
    newAccounts.specialAccount = 10000
    newAccounts.retirementAccount = 0
    newAccounts.ordinaryAccountAtWithdrawalAge = 0
    newAccounts.specialAccountAtWithdrawalAge = 0

    newAccounts.updateAccountsAtWithdrawalAge(15000)

    // Money is shifted from OA and SA to RA. SA is transfered first
    expect(newAccounts.ordinaryAccount).toBe(5000)
    expect(newAccounts.specialAccount).toBe(0)
    expect(newAccounts.retirementAccount).toBe(15000)
    // Snapshot is taken to keep a record of what the values were before the transfer
    expect(newAccounts.ordinaryAccountAtWithdrawalAge).toBe(10000)
    expect(newAccounts.specialAccountAtWithdrawalAge).toBe(10000)
  })

  test('Adds Accrued Interest to Respective Accounts', () => {
    newAccounts.ordinaryAccount = 3000
    newAccounts.specialAccount = 4000
    newAccounts.retirementAccount = 5000
    newAccounts.accruedOrdinaryInterest = 1000
    newAccounts.accruedSpecialInterest = 2000
    newAccounts.accruedRetirementInterest = 3000

    newAccounts.addInterestToAccounts()

    expect(newAccounts.ordinaryAccount).toBe(3000 + 1000)
    expect(newAccounts.specialAccount).toBe(4000 + 2000)
    expect(newAccounts.retirementAccount).toBe(5000 + 3000)
    // Accrued Interests should be reset after added to Accounts
    expect(newAccounts.accruedOrdinaryInterest).toBe(0)
    expect(newAccounts.accruedSpecialInterest).toBe(0)
    expect(newAccounts.accruedRetirementInterest).toBe(0)
  })

  const specialAccountOnly = new Accounts(3000, 3000, true)

  test('If specialAccountOnly is set to true, Accounts class instance has 0 in ordinary Account, as Ordinary Account Money is transfered to Special Account', () => {
    expect(specialAccountOnly.ordinaryAccount).toBe(0)
    expect(specialAccountOnly.specialAccount).toBe(3000 + 3000)
  })

  //   TODO: Write more tests for accrue interest for the various accounts
})
