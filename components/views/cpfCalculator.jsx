import React, { useState } from 'react'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Grid, Snackbar, IconButton } from '@material-ui/core/'
import CloseIcon from '@material-ui/icons/Close'
import { cyan, teal } from '@material-ui/core/colors/'

import Layout from '../layout/layout'
import {
  CurrencyInput,
  ExternalLink,
  Header,
  InfoPopup,
  Paragraph,
  Section,
} from '../common'

import { calculateFutureValues, roundTo2Dec } from '../../utils/cpfCalculator'
import { getYearsAndMonths } from '../../utils/utils'
import { cpfAccounts, withdrawalAge, payoutAge } from '../../constants'

const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    '& h3': {
      display: 'inline',
      marginRight: 10,
      marginBottom: 0,
    },
  },
  introduction: {
    margin: `${theme.spacing(2)}px 0`,
  },
  listWrapper: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
  paragraph: {
    margin: `0 0 ${theme.spacing(1.5)}px`,
    color: '#282c35',
  },
  inputWrapper: {
    padding: 10,
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  buttonWrapper: {
    textAlign: 'center',
    marginBottom: `${theme.spacing(1.5)}px`,
  },
  button: {
    backgroundColor: teal[200],
    '&:hover': {
      backgroundColor: cyan[200],
    },
  },
  bottomPlaceholder: {
    height: `${theme.spacing(5)}px`,
  },
}))

const minDate = moment().subtract(withdrawalAge, 'y')
const maxDate = moment().subtract(16, 'y')

const CPFCalculatorPage = () => {
  const classes = useStyles()

  const [values, setValues] = useState({
    ordinaryAccount: 0,
    specialAccount: 0,
    monthlySalary: 0,
  })
  const [selectedDate, handleDateChange] = useState(maxDate)

  const [errors, setErrors] = useState({})

  const [isCalculating, setCalculating] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)

  const [futureValues, setFutureValues] = useState({
    monthsTillWithdrawal: undefined,
    ordinaryAccount: undefined,
    specialAccount: undefined,
  })

  const validateValues = () => {
    const nextErrors = {}

    Object.keys(values).map((field) => {
      if (values[field] < 0) {
        nextErrors[field] = 'Please enter a value which is 0 or larger'
      } else {
        nextErrors[field] = undefined
      }
    })

    setErrors({ ...nextErrors })

    return nextErrors
  }

  const handleChange = (prop) => (event) => {
    const nextValue = roundTo2Dec(event.target.value)
    setValues({ ...values, [prop]: nextValue })
  }

  const handleSubmit = () => {
    const nextErrors = validateValues()

    const isCorrectInput = Object.values(nextErrors).every(
      (el) => el === undefined
    )

    if (isCorrectInput) {
      const nextFutureValues = calculateFutureValues(values, selectedDate)
      setFutureValues(nextFutureValues)
      setCalculating(true)
      setSnackbarOpen(true)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarOpen(false)
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Layout>
        {/* Header with Disclaimer */}
        <div className={classes.headerWrapper}>
          <Header text="CPF Forecaster" />
          <InfoPopup iconColor="secondary" title="Disclaimer">
            <Paragraph variant="subtitle2" className={classes.paragraph}>
              This page is not meant to be for financial advice.
            </Paragraph>
            <Paragraph variant="subtitle2" className={classes.paragraph}>
              I am neither an employee of CPF, nor am I a representative of the
              government.
            </Paragraph>
            <Paragraph variant="subtitle2" className={classes.paragraph}>
              The calculations here are based on research I have done, and I
              have listed my sources as far as possible.
            </Paragraph>{' '}
            <Paragraph variant="subtitle2" className={classes.paragraph}>
              If there are any corrections or enhancements to be made, please
              let me know.
            </Paragraph>
            <Paragraph variant="subtitle2" className={classes.paragraph}>
              Thank you.
            </Paragraph>
          </InfoPopup>
        </div>

        <Paragraph variant="subtitle2" className={classes.introduction}>
          Interest Rates, etc, were last checked in April 2020. This page does
          not save any data, and calculates values based on your input.
        </Paragraph>

        {/* User Input */}
        <Section>
          <Paragraph className={classes.paragraph}>
            First, type in the current amounts in your CPF Ordinary and Special
            Accounts.{' '}
            <InfoPopup title="Info on CPF OA and SA">
              <Paragraph className={classes.paragraph}>
                Information on what CPF is about can be found here:{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-overview"
                  label="CPF"
                />
                .
              </Paragraph>
            </InfoPopup>
          </Paragraph>
          <Grid container>
            {cpfAccounts.map((account) => (
              <Grid
                item
                sm={6}
                className={classes.inputWrapper}
                key={account.field}
              >
                <CurrencyInput
                  value={values[account.field]}
                  label={account.label}
                  field={account.field}
                  error={errors && errors[account.field]}
                  helperText={errors && errors[account.field]}
                  handleChange={handleChange}
                />
              </Grid>
            ))}
          </Grid>
        </Section>
        <Section>
          <Paragraph className={classes.paragraph}>
            Next, type in your date of birth. We will use this to calculate the
            date when you can start withdrawing it.{' '}
            <InfoPopup title="Withdrawal of CPF Savings">
              <Paragraph className={classes.paragraph}>
                Members can withdraw their CPF retirement savings any time from{' '}
                {withdrawalAge} years old. The withdrawal of your CPF retirement
                savings is optional. More info can be found can be found here{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/Members/FAQ/schemes/retirement/withdrawals-of-cpf-savings-from-55"
                  label="here"
                />
                .
              </Paragraph>
            </InfoPopup>
          </Paragraph>
          <Grid container>
            <Grid item sm={6} className={classes.inputWrapper}>
              <KeyboardDatePicker
                value={selectedDate}
                label="Date of Birth"
                onChange={(date) => handleDateChange(date)}
                format="dd/MM/yyyy"
                minDate={minDate}
                maxDate={maxDate}
                minDateMessage={`This date means that you are already ${withdrawalAge} years old`}
                maxDateMessage="You need to be 16 years old and above to contribute to CPF"
              />
            </Grid>
          </Grid>
        </Section>
        <Section>
          <Paragraph className={classes.paragraph}>
            Finally, you may add in your month salary (before taxes and CPF
            contribution).{' '}
            <InfoPopup title="Info on Employer / Employee CPF Contribution">
              <Paragraph className={classes.paragraph}>
                When{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/Employers/EmployerGuides/employer-guides/paying-cpf-contributions/cpf-contribution-and-allocation-rates"
                  label="55 and below"
                />
                , the employer contributes 17% of the monthly salary, while the
                employee contributes 20%.
              </Paragraph>
              <Paragraph className={classes.paragraph}>
                Show table with SA and OA percentage contributions over time
              </Paragraph>
            </InfoPopup>
          </Paragraph>
          <Grid container>
            <Grid item sm={6} className={classes.inputWrapper}>
              <CurrencyInput
                value={values.monthlySalary}
                label="Monthly Salary"
                field="monthlySalary"
                error={errors && errors.monthlySalary}
                helperText={errors && errors.monthlySalary}
                handleChange={handleChange}
              />
            </Grid>
          </Grid>
        </Section>
        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={handleSubmit}
          >
            Forecast my CPF!
          </Button>
        </div>

        {/* Calculation*/}
        {isCalculating && (
          <Section>
            <Paragraph className={classes.paragraph}>
              In {getYearsAndMonths(futureValues.monthsTillWithdrawal)}, when
              you are {withdrawalAge} years old, you will have $
              {futureValues.ordinaryAccount.toLocaleString()} in your ordinary
              account, and ${futureValues.specialAccount.toLocaleString()} in
              your special account.
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              CPF interest is computed monthly. It is then credited to your
              respective accounts and compounded annually.
              <InfoPopup title="How interest is paid">
                <Paragraph className={classes.paragraph}>
                  <ExternalLink
                    url="https://www.cpf.gov.sg/members/FAQ/schemes/other-matters/others/FAQDetails?category=other+matters&group=Others&ajfaqid=2192131&folderid=13726"
                    label="How"
                  />{' '}
                  is my CPF interest computed and credited into my accounts?
                </Paragraph>
              </InfoPopup>
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              Central Provident Fund (CPF) members currently earn interest rates
              of up to 3.5% per annum on their Ordinary Account (OA) monies, and
              up to 5% per annum on their Special and MediSave Account (SMA)
              monies. Retirement Account (RA) monies currently earn up to 5% per
              annum. The above interest rates include an extra 1% interest paid
              on the first $60,000 of a member's combined balances (with up to
              $20,000 from the OA).
              <InfoPopup title="Info on bonus Interest">
                <Paragraph className={classes.paragraph}>
                  <ExternalLink
                    url="https://www.cpf.gov.sg/members/FAQ/schemes/other-matters/others/FAQDetails?category=Other+Matters&group=Others&ajfaqid=2192024&folderid=13726"
                    label="What"
                  />{' '}
                  is my bonus interest?
                </Paragraph>
              </InfoPopup>
            </Paragraph>

            {/* <Paragraph className={classes.paragraph}>
              TODO: The FE will calculate for them how much is in their RA at
              the age of 65.
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              Possible: The FE will calculate for them how much they can
              withdraw at the age of 55.
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              Possible: The FE will calculate for them how much they can
              withdraw at the age of 65. (either with withdrawal or without
              withdrawal at 55)
            </Paragraph> */}
          </Section>
        )}

        {/* <Paragraph>
          The user can press a button, whcih will show a new panel below. This
          new panel will show how much more they can get if they transfer all
          sums to SA.
        </Paragraph>
        <Paragraph>
          The user can see a breakdown of values month-on-month
        </Paragraph>
        <Paragraph>
          The user can add in the pledging of their HDB value.
        </Paragraph>
        <Paragraph>
          The user can account for usage of OA sums to a HDB flat at a certain
          future date.
        </Paragraph>
        <Paragraph>
          The user can check how much they will need to pay back to CPF when
          they sell the HDB flat.
        </Paragraph> */}

        <div className={classes.bottomPlaceholder} />

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={snackbarOpen}
          autoHideDuration={1000}
          onClose={handleSnackbarClose}
          message="Success!"
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSnackbarClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Layout>
    </MuiPickersUtilsProvider>
  )
}

export default CPFCalculatorPage
