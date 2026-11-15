export { navLinks } from './src/config/navLinks'

export const cpfAccounts = [
  {
    label: 'Ordinary Account',
    field: 'ordinaryAccount',
  },
  {
    label: 'Special Account',
    field: 'specialAccount',
  },
  {
    label: 'MediSave Account',
    field: 'mediSaveAccount',
  },
]

/**
 * Savings above the Full Retirement Sum can be withdrawn from 55.
 * Withdrawal is optional. This forecast leaves the money in CPF.
 * https://www.cpf.gov.sg/member/retirement-income/milestones/reaching-age-55
 */
export const withdrawalAge = 55

/**
 * CPF LIFE payout eligibility age. Payouts can start any time from 65 to 70.
 * This forecast stops at 65 and does not estimate the payout.
 * https://www.cpf.gov.sg/member/retirement-income/monthly-payouts/cpf-life
 */
export const payoutAge = 65

export const momentMonths = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
]
