import React from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    backgroundColor: blue[50],
    color: '#282c35',
    borderRadius: 10,
    padding: 10,
    marginBottom: `${theme.spacing(1.5)}px`,
  },
}))

const Section: React.FunctionComponent = ({ children }) => {
  const classes = useStyles()
  return <section className={classes.section}>{children}</section>
}

export default Section
