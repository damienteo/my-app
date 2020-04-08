import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'

const useStyles = makeStyles((theme) => ({
  section: {
    backgroundColor: blue[50],
    color: '#282c35',
    borderRadius: 10,
    padding: 10,
    marginBottom: `${theme.spacing(1.5)}px`,
  },
}))

const Section = ({ children }) => {
  const classes = useStyles()
  return <section className={classes.section}>{children}</section>
}

export default Section
