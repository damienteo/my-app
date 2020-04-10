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
  const birthday = moment(selectedDate)
  const duration = current.diff(birthday, 'years')
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

  const age = getDuration(selectedDate)
  const yearsTill55 = 55 - age

  //  TODO: Take into account that interest is paid on a monthly basis

  const ordinaryInterestRate = baseRate + ordinaryIR
  const specialInterestRate = baseRate + specialIR

  const nextOrdinaryAccount = normalRound(
    ordinaryAccount * Math.pow(ordinaryInterestRate, yearsTill55)
  )
  const nextSpecialAccount = normalRound(
    specialAccount * Math.pow(specialInterestRate, yearsTill55)
  )

  return {
    ordinaryAccount: nextOrdinaryAccount,
    specialAccount: nextSpecialAccount,
    yearsTill55,
  }
}
