import React, { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import {
  CurrencyInput,
  ExternalLink,
  InfoPopup,
  Paragraph,
  Section,
} from '../../common'
import {
  calculateFutureValues,
  roundTo2Dec,
} from '../../../../../../utils/cpf/cpfForecast'
import {
  ErrorValues,
  Values,
  AccountValues,
  FutureValues,
} from '../../../../../../utils/cpf/types'
import {
  cpfAccounts,
  momentMonths,
  withdrawalAge,
} from '../../../../../../constants'
import * as gtag from '../../../../../../lib/gtag'

interface UserInputProps {
  setCalculating: (isCalculating: boolean) => void
  setFutureValues: (values: FutureValues) => void
}

const minDate = dayjs().subtract(withdrawalAge, 'y')
const maxDate = dayjs().subtract(16, 'y')

const UserInput: React.FunctionComponent<UserInputProps> = (props) => {
  const { setFutureValues, setCalculating } = props

  const [values, setValues] = useState<Values>({
    ordinaryAccount: '0',
    specialAccount: '0',
    monthlySalary: '0',
    monthsOfBonus: '0',
    bonusMonth: '0',
    salaryIncreaseRate: '0',
    housingLumpSum: '0',
    housingMonthlyPayment: '0',
    housingLoanTenure: '0',
  })
  const [selectedDate, handleDateChange] = useState<Dayjs | null>(maxDate)
  const [housingLumpSumDate, handleHousingLumpSumDateChange] = useState<Dayjs>(
    dayjs()
  )
  const [housingLoanDate, handleHousingLoanDateChange] = useState<Dayjs>(
    dayjs()
  )
  const [specialAccountOnly, setSpecialAccountOnly] = useState<boolean>(false)
  const [errors, setErrors] = useState<ErrorValues>({})
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

  const validateValues = () => {
    const nextErrors = {} as ErrorValues
    Object.keys(values).map((field: string) => {
      if (parseFloat(values[field]) < 0) {
        nextErrors[field] = 'Please enter a value which is 0 or larger'
      } else {
        nextErrors[field] = undefined
      }
    })

    if (specialAccountOnly === true && parseFloat(values.housingLumpSum) > 0) {
      nextErrors.specialAccountOnly =
        "You won't have money in your Ordinary Account to use for housing if you shift all your money to your special account."
    }
    setErrors({ ...nextErrors })

    return nextErrors
  }

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = roundTo2Dec(event.target.value)
      setValues({ ...values, [field]: nextValue })
      const nextErrors = { ...errors }
      nextErrors[field] = undefined
      setErrors({ ...nextErrors })
    }

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialAccountOnly(event.target.checked)
  }

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextValues = { ...values }
    nextValues.bonusMonth = event.target.value
    setValues(nextValues)
  }

  const handleSubmit = () => {
    const nextErrors = validateValues()

    gtag.event({
      action: 'submit_form',
      category: 'CPF-Forecast',
      label: 'submission',
    })

    const isCorrectInput = Object.values(nextErrors).every(
      (el) => el === undefined
    )

    // Replace empty strings with 0
    const nextValues = {} as Values
    Object.keys(values).map((key) => {
      return (nextValues[key] = values[key] === '' ? '0' : values[key])
    })

    const accountValues = {
      ...nextValues,
      selectedDate,
      housingLumpSumDate,
      housingLoanDate,
      specialAccountOnly,
    } as AccountValues

    if (isCorrectInput) {
      setCalculating(false)
      const nextFutureValues = calculateFutureValues(accountValues)
      setFutureValues(nextFutureValues)

      if (Object.values(nextFutureValues.errors).length > 0) {
        setErrors({ ...nextFutureValues.errors })
      } else {
        setFutureValues(nextFutureValues)
        setCalculating(true)
        setSnackbarOpen(true)
      }
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <>
      <Section>
        <p className="text-gray-300 mb-4">
          First, type in the current amounts in your CPF Ordinary and Special
          Accounts.{' '}
          <InfoPopup title="Info on CPF OA and SA">
            <p className="text-gray-300">
              Information on what CPF is about can be found here:{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/member/cpf-overview"
                label="CPF"
              />
              .
            </p>
          </InfoPopup>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cpfAccounts.map((account) => (
            <div key={account.field}>
              <CurrencyInput
                value={values[account.field]}
                label={account.label}
                field={account.field}
                error={Boolean(errors[account.field])}
                helperText={errors[account.field]}
                handleChange={handleChange}
              />
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <p className="text-gray-300 mb-4">
          Next, type in your date of birth. We will use this to calculate the
          date when you can start withdrawals.{' '}
          <InfoPopup title="Withdrawal of CPF Savings">
            <p className="text-gray-300">
              Members can withdraw their CPF retirement savings any time from{' '}
              {withdrawalAge} years old. The withdrawal of your CPF retirement
              savings is optional. More info can be found{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/member/infohub/educational-resources/heres-what-cpf-members-are-doing-with-their-cash-withdrawals-after-age-55"
                label="here"
              />
              .
            </p>
          </InfoPopup>
        </p>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={selectedDate?.format('YYYY-MM-DD')}
            onChange={(e) => handleDateChange(dayjs(e.target.value))}
            className="block w-full sm:text-sm rounded-md bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 py-2 px-3"
          />
        </div>
      </Section>
      <Section>
        <p className="text-gray-300 mb-4">
          Finally, you may add in your monthly salary (before taxes and CPF
          contribution), as well as expectations on how much it may increase per
          year. *Increase in monthly salary is calculated at the beginning of
          each year.{' '}
          <InfoPopup title="Info on Employer / Employee CPF Contribution">
            <p className="text-gray-300">
              When{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay"
                label="55 and below"
              />
              , the employer contributes 17% of the monthly salary, while the
              employee contributes 20%.
            </p>
            <p className="text-gray-300">
              Do also take note that the{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/employer/employer-obligations/what-payments-attract-cpf-contributions#section-header-1659668379"
                label="Ordinary Wage (OW) Ceiling"
              />{' '}
              sets the maximum amount of OWs on which CPF contributions are
              payable per month. The prevailing OW Ceiling is $6,000 per month.
            </p>
          </InfoPopup>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CurrencyInput
              value={values.monthlySalary}
              label="Monthly Salary (Optional)"
              field="monthlySalary"
              error={Boolean(errors.monthlySalary)}
              helperText={errors.monthlySalary}
              handleChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Projected Salary % Increase/Year (Optional)
            </label>
            <input
              type="number"
              value={values.salaryIncreaseRate}
              onChange={handleChange('salaryIncreaseRate')}
              className="block w-full sm:text-sm rounded-md bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 py-2 px-3 placeholder-gray-500"
              placeholder="Enter percentage"
            />
          </div>
        </div>
      </Section>

      <div className="mt-6 mb-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
          onClick={handleSubmit}
        >
          Forecast my CPF!
        </button>
      </div>

      {snackbarOpen && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded shadow-lg z-50">
          <span>Success!</span>
          <button className="ml-2 text-white hover:text-gray-200" onClick={handleSnackbarClose}>
            &times;
          </button>
        </div>
      )}
    </>
  )
}

export default UserInput
