import React, { useState } from 'react'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import enSgLocale from 'dayjs/locale/en-sg'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { makeStyles } from '@mui/styles'

import Layout from '../layout/Layout'
import { ExternalLink, InfoPopup, Paragraph } from '../common'
import UserInput from './cpfForecast/UserInput'
import Intro from './cpfForecast/Intro'
import Results from './cpfForecast/Results'

import { FutureValues } from '../../utils/cpf/types'

const useStyles = makeStyles((theme) => ({
  introduction: {
    margin: theme.spacing(2, 0),
  },
  bottomPlaceholder: {
    height: theme.spacing(5),
  },
  paragraph: {
    margin: theme.spacing(0, 0, 1.5),
    color: '#282c35',
  },
}))

const CPFForecastPage = () => {
  const classes = useStyles()

  const [isCalculating, setCalculating] = useState<boolean>(false)

  const [futureValues, setFutureValues] = useState<FutureValues>({
    monthsTillWithdrawal: 0,
    ordinaryAccount: 0,
    specialAccount: 0,
    retirementAccount: 0,
    ordinaryAccountAtWithdrawalAge: 0,
    specialAccountAtWithdrawalAge: 0,
    history: [],
    historyAfterWithdrawalAge: [],
    monthlySalary: 0,
    salaryHistory: [],
    salaryHistoryAfterWithdrawalAge: [],
  })

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={enSgLocale}>
      <Layout
        title="CPF Forecast"
        description="CPF Forecast helps users to calculate CPF OA and SA years down the road, based on their projected contributions"
      >
        <Intro />

        <Paragraph variant="subtitle2" className={classes.introduction}>
          Interest Rates, etc, were last checked in April 2020. This page does
          not save any data, and calculates values based on your input. Medisave
          values are not included as this page mainly deals with usage of CPF
          for retirement and potentially housing.
        </Paragraph>

        <Paragraph variant="subtitle2" className={classes.introduction}>
          For calculation of Full Retirement Sums in the future, I am assuming a
          3.5% increase per year from the current year (2022, where the FRS is
          $192,000).
          <InfoPopup title="Retirement Amounts">
            <Paragraph className={classes.paragraph}>
              Information on CRS retirement amounts can be found here:{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/member/faq/retirement-income/general-information-on-retirement/what-are-the-retirement-sums-applicable-to-me-"
                label="Retirement Amounts"
              />
              .
            </Paragraph>
          </InfoPopup>{' '}
          The increase in FRS per year may change in the future according to
          government policy.
        </Paragraph>

        <UserInput
          setCalculating={setCalculating}
          setFutureValues={setFutureValues}
        />

        {isCalculating && <Results futureValues={futureValues} />}

        <div className={classes.bottomPlaceholder} />
      </Layout>
    </LocalizationProvider>
  )
}

export default CPFForecastPage
