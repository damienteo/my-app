'use client'

import React, { useState } from 'react'
import dayjs from 'dayjs'
import Layout from '../layout/Layout'
import { ExternalLink, InfoPopup, Paragraph } from '../common'
import UserInput from './cpfForecast/UserInput'
import Intro from './cpfForecast/Intro'
import Results from './cpfForecast/Results'
import { FutureValues } from '../../utils/cpf/types'

const CPFForecastPage = () => {
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
    // <Layout
    //   title="CPF Forecast"
    //   description="CPF Forecast helps users to calculate CPF OA and SA years down the road, based on their projected contributions"
    // >
    <>
      <Intro />

      <Paragraph className="my-2 mx-0">
        Interest Rates, etc, were last checked in April 2020. This page does not
        save any data, and calculates values based on your input. Medisave
        values are not included as this page mainly deals with usage of CPF for
        retirement and potentially housing.
      </Paragraph>

      <Paragraph className="my-2 mx-0">
        For calculation of Full Retirement Sums in the future, I am assuming a
        3.5% increase per year from the current year (2022, where the FRS is
        $192,000).
        <InfoPopup title="Retirement Amounts">
          <Paragraph className="m-0 mb-2 text-[#282c35]">
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

      <div className="h-5" />
    </>
  )
}

export default CPFForecastPage
