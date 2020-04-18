export const getYearsAndMonths = (value: number) => {
  const months = value % 12
  const years = (value - months) / 12

  if (years === 0 && months === 1) return `${months} month`

  if (years === 0) return `${months} months`

  if (months === 1) return `${years} years and ${months} month`

  return `${years} years and ${months} months`
}

const currencyOptions = { style: 'currency', currency: 'USD' }
const currencyFormat = new Intl.NumberFormat('en-US', currencyOptions)

export const formatCurrency = (value: number) => {
  return currencyFormat.format(value)
}
