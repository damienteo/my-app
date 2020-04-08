import moment from 'moment'

const cpfValues = {
  baseRate: 1,
  ordinaryIR: 0.025,
  specialIR: 0.04,
  bonusIR: 0.01,
  bonusAmtCap: 60000,
  ordinaryAmtCap: 20000,
}

export const roundTo2Dec = (value) => {
  let decimalPlace = value.indexOf('.')
  let isTooLong = value.length > decimalPlace + 3
  let invalidNum = isNaN(parseFloat(value))

  if ((decimalPlace >= 0 && isTooLong) || invalidNum) {
    value = value.slice(0, -1)
  }

  return value
}

const normalRound = (value) => {
  return Math.floor(value * 100) / 100
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

  const nextOrdinaryAccount = normalRound(
    ordinaryAccount * Math.pow(ordinaryInterestRate, duration)
  )
  const nextSpecialAccount = normalRound(
    specialAccount * Math.pow(specialInterestRate, duration)
  )

  console.log(nextSpecialAccount)
  return {
    ordinaryAccount: nextOrdinaryAccount,
    specialAccount: nextSpecialAccount,
    yearsTill55: duration,
  }
}
