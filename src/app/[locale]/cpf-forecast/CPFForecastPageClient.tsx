'use client'

import React, { useState } from 'react'
import UserInput from '../components/views/cpfForecast/UserInput'
import Intro from '../components/views/cpfForecast/Intro'
import Results from '../components/views/cpfForecast/Results'
import RulesNote from '../components/views/cpfForecast/RulesNote'
import { FutureValues } from '@/utils/cpf/types'

const CPFForecastPageClient = () => {
  const [isCalculating, setCalculating] = useState<boolean>(false)

  const [futureValues, setFutureValues] = useState<FutureValues>({
    monthsTillWithdrawal: 0,
    ordinaryAccount: 0,
    specialAccount: 0,
    mediSaveAccount: 0,
    retirementAccount: 0,
    ordinaryAccountAtWithdrawalAge: 0,
    specialAccountAtWithdrawalAge: 0,
    mediSaveAccountAtWithdrawalAge: 0,
    history: [],
    historyAfterWithdrawalAge: [],
    monthlySalary: 0,
    salaryHistory: [],
    salaryHistoryAfterWithdrawalAge: [],
  })

  return (
    <div className="flex flex-col max-w-4xl px-4 sm:px-6 mx-auto py-8">
      <div className="mb-6">
        <Intro />
      </div>

      <RulesNote />

      <UserInput
        setCalculating={setCalculating}
        setFutureValues={setFutureValues}
      />

      {isCalculating && <Results futureValues={futureValues} />}
    </div>
  )
}

export default CPFForecastPageClient
