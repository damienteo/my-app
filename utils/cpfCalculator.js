import moment from 'moment'

const cpfValues = {
  baseRate: 1,
  ordinaryIR: 0.025,
  specialIR: 0.04,
  bonusIR: 0.01,
  bonusAmtCap: 60000,
  ordinaryAmtCap: 20000,
}

const getDuration = (selectedDate) => {
  const current = moment()
  const endDate = moment(selectedDate)
  const duration = endDate.diff(current, 'years')
  return duration
}

export const calculateFutureValues = (values, selectedDate) => {
  const { ordinaryAccount, specialAccount } = values

  const {
    baseRate,
    ordinaryIR,
    specialIR,
    bonusIR,
    bonusAmtCap,
    ordinaryAmtCap,
  } = cpfValues

  const duration = getDuration(selectedDate)

  const ordinaryInterestRate = baseRate + ordinaryIR
  const specialInterestRate = baseRate + specialIR

  const nextOrdinaryAccount =
    ordinaryAccount * Math.pow(ordinaryInterestRate, duration)
  const nextSpecialAccount =
    specialAccount * Math.pow(specialInterestRate, duration)

  return {
    ordinaryAccount: nextOrdinaryAccount,
    specialAccount: nextSpecialAccount,
    yearsTill55: duration,
  }
}
