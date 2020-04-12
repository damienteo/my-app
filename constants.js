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
  bonusAmtCap: 60000,
  ordinaryAmtCap: 20000,
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

export const fullRetirementSum = 181000
export const retirementSumIncrease = 5000
