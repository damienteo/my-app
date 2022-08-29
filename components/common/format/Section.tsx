import React from 'react'
import { Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { blue } from '@mui/material/colors/'

interface SectionProps {
  children: React.ReactNode
}

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    backgroundColor: blue[50],
    color: '#282c35',
    borderRadius: 10,
    padding: 10,
    marginBottom: `${theme.spacing(1.5)}`,
  },
}))

const Section: React.FunctionComponent<SectionProps> = ({ children }) => {
  const classes = useStyles()
  return <section className={classes.section}>{children}</section>
}

export default Section
