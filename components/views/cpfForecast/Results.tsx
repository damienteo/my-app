import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core/'
import { cyan, teal } from '@material-ui/core/colors/'

import { Section } from '../../common'
import { HistoryTable, WithdrawalAgeInfo, PayoutAgeInfo } from './results'

import { FutureValues } from '../../../utils/cpf/types'

interface ResultsProps {
  futureValues: FutureValues
}

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    textAlign: 'center',
    margin: theme.spacing(1.5, 0),
  },
  button: {
    backgroundColor: teal[200],
    '&:hover': {
      backgroundColor: cyan[200],
    },
  },
}))

const Results: React.FunctionComponent<ResultsProps> = (props) => {
  const { futureValues } = props
  const classes = useStyles()

  const [historyOpen, setHistoryOpen] = useState<boolean>(false)
  const [
    historyAfterWithdrawalAgeOpen,
    setHistoryAfterWithdrawalAgeOpen,
  ] = useState<boolean>(false)

  return (
    <>
      {/* OA and SA during Withdrawal Age (55)*/}
      <Section>
        <WithdrawalAgeInfo futureValues={futureValues} />

        {/* History Table for Transactions up to 55 years old */}
        {futureValues.history.length > 0 && (
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              {historyOpen ? 'Hide' : 'Show'} Calculations Till 55!
            </Button>
          </div>
        )}
        {historyOpen && (
          <>
            <HistoryTable
              data={futureValues.history}
              groupByYear={futureValues.monthlySalary > 0}
            />
            <div className={classes.buttonWrapper}>
              <Button
                variant="contained"
                className={classes.button}
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                {historyOpen ? 'Hide' : 'Show'} Calculations Till 55!
              </Button>
            </div>
          </>
        )}
      </Section>

      {/* OA and SA during Retirement Age (65)*/}
      <Section>
        <PayoutAgeInfo futureValues={futureValues} />

        {/* History Table for Transactions from 55 to 65 years old */}
        {futureValues.historyAfterWithdrawalAge.length > 0 && (
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={() =>
                setHistoryAfterWithdrawalAgeOpen(!historyAfterWithdrawalAgeOpen)
              }
            >
              {historyAfterWithdrawalAgeOpen ? 'Hide' : 'Show'} Calculations
              After 55!
            </Button>
          </div>
        )}
        {historyAfterWithdrawalAgeOpen && (
          <>
            <HistoryTable
              data={futureValues.historyAfterWithdrawalAge}
              groupByYear={futureValues.monthlySalary > 0}
            />
            <div className={classes.buttonWrapper}>
              <Button
                variant="contained"
                className={classes.button}
                onClick={() =>
                  setHistoryAfterWithdrawalAgeOpen(
                    !historyAfterWithdrawalAgeOpen
                  )
                }
              >
                {historyAfterWithdrawalAgeOpen ? 'Hide' : 'Show'} Calculations
                After 55!
              </Button>
            </div>
          </>
        )}
      </Section>
    </>
  )
}

export default Results
