import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('CPFForecastPage.userInput')
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
        nextErrors[field] = t('errors.negativeValue')
      } else {
        nextErrors[field] = undefined
      }
    })

    if (specialAccountOnly === true && parseFloat(values.housingLumpSum) > 0) {
      nextErrors.specialAccountOnly = t('errors.specialAccountOnly')
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
          {t('accountBalances.instruction')}{' '}
          <span className="inline-flex items-center">
            <InfoPopup title={t('accountBalances.infoPopup.title')}>
              <p className="text-gray-300">
                {t('accountBalances.infoPopup.text')}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/member/cpf-overview"
                  label="CPF"
                />
                .
              </p>
            </InfoPopup>
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cpfAccounts.map((account) => (
            <div key={account.field}>
              <CurrencyInput
                value={values[account.field]}
                label={
                  account.field === 'ordinaryAccount'
                    ? t('accountBalances.ordinaryAccount')
                    : t('accountBalances.specialAccount')
                }
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
          {t('dateOfBirth.instruction')}{' '}
          <span className="inline-flex items-center">
            <InfoPopup title={t('dateOfBirth.withdrawalInfo.title')}>
              <p className="text-gray-300">
                {t('dateOfBirth.withdrawalInfo.text', { age: withdrawalAge })}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/member/infohub/educational-resources/heres-what-cpf-members-are-doing-with-their-cash-withdrawals-after-age-55"
                  label={t('dateOfBirth.withdrawalInfo.here')}
                />
                .
              </p>
            </InfoPopup>
          </span>
        </p>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('dateOfBirth.label')}
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
          {t('salary.instruction')}{' '}
          <span className="inline-flex items-center">
            <InfoPopup title={t('salary.contributionInfo.title')}>
              <p className="text-gray-300">
                {t('salary.contributionInfo.when55')}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay"
                  label={t('salary.contributionInfo.when55')}
                />
                {t('salary.contributionInfo.employerContribution')}
              </p>
              <p className="text-gray-300">
                {t('salary.contributionInfo.owCeiling')}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/employer/employer-obligations/what-payments-attract-cpf-contributions#section-header-1659668379"
                  label={t('salary.contributionInfo.owCeiling')}
                />{' '}
                {t('salary.contributionInfo.owCeilingText')}
              </p>
            </InfoPopup>
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CurrencyInput
              value={values.monthlySalary}
              label={t('salary.monthlySalary')}
              field="monthlySalary"
              error={Boolean(errors.monthlySalary)}
              helperText={errors.monthlySalary}
              handleChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('salary.salaryIncrease')}
            </label>
            <input
              type="number"
              value={values.salaryIncreaseRate}
              onChange={handleChange('salaryIncreaseRate')}
              className="block w-full sm:text-sm rounded-md bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 py-2 px-3 placeholder-gray-500"
              placeholder={t('salary.salaryIncreasePlaceholder')}
            />
          </div>
        </div>
      </Section>

      <div className="mt-4 mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-full transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={handleSubmit}
        >
          {t('submit')}
        </button>
      </div>

      {snackbarOpen && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded shadow-lg z-50">
          <span>{t('success')}</span>
          <button
            className="ml-2 text-white hover:text-gray-200"
            onClick={handleSnackbarClose}
          >
            &times;
          </button>
        </div>
      )}
    </>
  )
}

export default UserInput
