import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Grid, Tooltip } from '@material-ui/core/'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import Layout from '../layout/layout'
import Header from '../common/header'
import Paragraph from '../common/paragraph'
import ExternalLink from '../common/externalLink'
import CurrencyInput from '../common/currencyInput'
import InfoPopup from '../common/infoPopup'
import Section from '../common/section'
import { cyan, teal } from '@material-ui/core/colors/'
import { calculateFutureValues, roundTo2Dec } from '../../utils/cpfCalculator'
import InfoIcon from '@material-ui/icons/Info'

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

const CPFCalculatorPage = () => {
  const classes = useStyles()

  const [values, setValues] = useState({
    ordinaryAccount: 1,
    specialAccount: 1,
  })
  const [selectedDate, handleDateChange] = useState(new Date())

  const [errors, setErrors] = useState({})
  const [isCalculating, setCalculating] = useState(false)

  const [futureValues, setFutureValues] = useState({
    yearsTill55: undefined,
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
      console.log('futureValues', futureValues)
      setCalculating(true)
    }
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
          was interested in knowing what was the impact of:
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
          This page also does not save any data, and purely calculates values
          based on your input.
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
                55 years old. The withdrawal of your CPF retirement savings is
                optional. More info can be found can be found here{' '}
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
                minDate={new Date()}
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
              In {futureValues.yearsTill55} years, when you are 55 years old,
              you will have ${futureValues.ordinaryAccount.toLocaleString()} in
              your ordinary account, and $
              {futureValues.specialAccount.toLocaleString()} in your special
              account.
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
      </Layout>
    </MuiPickersUtilsProvider>
  )
}

export default CPFCalculatorPage
