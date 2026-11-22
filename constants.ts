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
