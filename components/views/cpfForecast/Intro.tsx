import React from 'react'
import { makeStyles } from '@mui/styles'
import { Header, InfoPopup, Paragraph } from '../../common'

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
  paragraph: {
    margin: theme.spacing(0, 0, 1.5),
    color: '#282c35',
  },
}))

const Intro: React.FunctionComponent = () => {
  const classes = useStyles()
  return (
    <div className={classes.headerWrapper}>
      <Header text="CPF Forecast" />
      <InfoPopup iconColor="secondary" title="Disclaimer">
        <Paragraph variant="subtitle2" className={classes.paragraph}>
          This page is not meant to be for financial advice.
        </Paragraph>
        <Paragraph variant="subtitle2" className={classes.paragraph}>
          I am neither an employee of CPF, nor am I a representative of the
          government.
        </Paragraph>
        <Paragraph variant="subtitle2" className={classes.paragraph}>
          The calculations here are based on research I have done, and I have
          listed my sources as far as possible.
        </Paragraph>{' '}
        <Paragraph variant="subtitle2" className={classes.paragraph}>
          If there are any corrections or enhancements to be made, please let me
          know.
        </Paragraph>
        <Paragraph variant="subtitle2" className={classes.paragraph}>
          Thank you.
        </Paragraph>
      </InfoPopup>
    </div>
  )
}

export default Intro
