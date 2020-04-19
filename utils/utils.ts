export const getYearsAndMonths = (value: number) => {
  const months = value % 12
  const years = (value - months) / 12

  const yearString = years === 1 ? 'year' : 'years'
  const monthString = months === 1 ? 'month' : 'months'

  if (years > 0) return `${years} ${yearString} and ${months} ${monthString}`
  return `${months} ${monthString}`
}

const currencyOptions = { style: 'currency', currency: 'USD' }
const currencyFormat = new Intl.NumberFormat('en-US', currencyOptions)

export const formatCurrency = (value: number) => {
  return currencyFormat.format(value)
}
