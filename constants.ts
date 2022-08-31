export const navLinks = [
  { url: 'about', text: 'about' },
  { url: 'portfolio', text: 'portfolio' },
  { url: 'cpf-forecast', text: 'cpf forecast' },
]

export const cpfAccounts = [
  {
    label: 'Ordinary Account',
    field: 'ordinaryAccount',
  },
  {
    label: 'Special Account',
    field: 'specialAccount',
  },
]

export const cpfValues = {
  baseRate: 1,
  ordinaryIR: 0.025,
  specialIR: 0.04,
  retirementIR: 0.04,
  bonusIR: 0.01,
  bonusIRAfter55: 0.02,
  bonusAmtCap: 60000,
  extraBonusAmtCap: 30000,
  ordinaryAmtCap: 20000,
}

const { ordinaryIR, specialIR, retirementIR, bonusIR, bonusIRAfter55 } =
  cpfValues

const ordinaryInterestRate = ordinaryIR / 12
const specialInterestRate = specialIR / 12
const retirementInterestRate = retirementIR / 12

const bonusOrdinaryInterestRate = bonusIR / 12
const bonusSpecialInterestRate = (specialIR + bonusIR) / 12
const bonusRetirementInterestRate = (retirementIR + bonusIR) / 12

// extraBonusOrdinaryInterest is transferred to Special or Retirement Account instead of Ordinary Account
const extraBonusOrdinaryInterestRate = bonusIRAfter55 / 12
const extraBonusSpecialInterestRate = (specialIR + bonusIRAfter55) / 12
const extraBonusRetirementInterestRate = (retirementIR + bonusIRAfter55) / 12

export const cpfInterestRates = {
  ordinaryInterestRate,
  specialInterestRate,
  retirementInterestRate,
  bonusOrdinaryInterestRate,
  bonusSpecialInterestRate,
  bonusRetirementInterestRate,
  extraBonusOrdinaryInterestRate,
  extraBonusSpecialInterestRate,
  extraBonusRetirementInterestRate,
}

export const cpfAllocation = {
  '35AndBelow': {
    OA: 0.23,
    SA: 0.06,
  },
  '36to45': {
    OA: 0.21,
    SA: 0.07,
  },
  '46to50': {
    OA: 0.19,
    SA: 0.08,
  },
  '51to55': {
    OA: 0.15,
    SA: 0.115,
  },
  '56to60': {
    OA: 0.12,
    SA: 0.035,
  },
  '61to65': {
    OA: 0.035,
    SA: 0.025,
  },
  '66andAbove': {
    OA: 0.01,
    SA: 0.01,
  },
}

export const ordinaryWageCeiling = 6000
export const additionalWageCeiling = 102000

export const withdrawalAge = 55
export const payoutAge = 65

export const yearFRSTakenFrom = 2022
export const fullRetirementSum = 192000
export const retirementSumIncrease = 0.035

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
