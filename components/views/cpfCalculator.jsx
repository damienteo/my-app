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
import InfoIcon from '@material-ui/icons/Info'
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
import { withdrawalAge, payoutAge } from '../../constants'

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
    '& ol': {
      margin: `${theme.spacing(1)}px 0`,
    },
  },
  paragraph: {
    margin: `0 0 ${theme.spacing(1.5)}px`,
    color: '#282c35',
  },
  inputWrapper: {
    padding: 10,
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
}))

const cpfAccounts = [
  {
    label: 'Ordinary Account',
    field: 'ordinaryAccount',
  },
  {
    label: 'Special Account',
    field: 'specialAccount',
  },
]

const minDate = moment().subtract(withdrawalAge, 'y')
const maxDate = moment().subtract(16, 'y')

const getYearsAndMonths = (value) => {
  const months = value % 12
  const years = (value - months) / 12

  if (years === 0 && months === 1) return `${months} month`

  if (years === 0) return `${months} months`

  if (months === 1) return `${years} years and ${months} month`

  return `${years} years and ${months} months`
}

const CPFCalculatorPage = () => {
  const classes = useStyles()

  const [values, setValues] = useState({
    ordinaryAccount: 1,
    specialAccount: 1,
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
      if (values[field] < 1) {
        nextErrors[field] = 'Please enter a value larger than 0'
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
          <Header text="CPF Calculator" />
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

        {/* Aim */}
        <Paragraph className={classes.introduction}>
          This page is a result of my personal research into how CPF works. I
          wanted to know:
        </Paragraph>
        <ol>
          <li>
            What happens if I{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-overview"
              label="transfer"
            />{' '}
            all my money from the Ordinary Account to the Special Account?
          </li>
          <li>
            What happens if I use my CPF OA Account for{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-overview"
              label="housing"
            />
            ?
          </li>
          <li>
            Will I be able to meet the{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-overview"
              label="Retirement Sum"
            />
            ?
          </li>
        </ol>
        <Paragraph className={classes.introduction}>
          This page also does not save any data, and purely calculates values
          based on your input.{' '}
          <span>
            (hint: Click on the <InfoIcon /> for more info)
          </span>
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
                Members can withdraw their CPF retirement savings any time from
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
        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={handleSubmit}
          >
            Calculate my CPF!
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
              respective accounts and compounded annually. CPF interest earned
              in 2019 will be credited to members’ CPF accounts by the end of 1
              January 2020.
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
              Take into account bonus interest
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              The FE will calculate for them how much is in their RA at the age
              of 65.
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              The FE will calculate for them how much they can withdraw at the
              age of 55.
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              The FE will calculate for them how much they can withdraw at the
              age of 65. (either with withdrawal or without withdrawal)
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              show impact on CPF life
            </Paragraph>
          </Section>
        )}

        <Paragraph>
          The user can press a button, whcih will show a new panel below. This
          new panel will show how much more they can get if they transfer all
          sums to SA.
        </Paragraph>
        <Paragraph>
          The user can account for usage of OA sums to a HDB flat at a certain
          future date.
        </Paragraph>
        <Paragraph>
          The user can add in the pledging of their HDB value.
        </Paragraph>
        <Paragraph>
          The user can check how much they will need to pay back to CPF when
          they sell the HDB flat.
        </Paragraph>
        <Paragraph>
          The user can download an excel sheet to store all data.
        </Paragraph>
        <Paragraph>
          The user can upload an excel sheet to read previous data.
        </Paragraph>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          message="Calculated!"
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
