import React, { useState } from 'react'
import DateFnsUtils from '@date-io/date-fns'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'

import Layout from '../layout/Layout'
import { Paragraph } from '../common'
import { UserInput, Intro, Results } from './cpfForecast'

import { FutureValues } from '../../utils/cpf/types'

const useStyles = makeStyles((theme) => ({
  introduction: {
    margin: theme.spacing(2, 0),
  },
  bottomPlaceholder: {
    height: theme.spacing(5),
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
  })

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Layout>
        <Intro />

        <Paragraph variant="subtitle2" className={classes.introduction}>
          Interest Rates, etc, were last checked in April 2020. This page does
          not save any data, and calculates values based on your input.
        </Paragraph>

        <UserInput
          setCalculating={setCalculating}
          setFutureValues={setFutureValues}
        />

        {isCalculating && <Results futureValues={futureValues} />}

        <div className={classes.bottomPlaceholder} />
      </Layout>
    </MuiPickersUtilsProvider>
  )
}

export default CPFForecastPage
