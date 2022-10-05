import React from 'react'
import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material/'
import { blue } from '@mui/material/colors/'

const useStyles = makeStyles(() => ({
  header: {
    margin: '20px 0 10px',
    color: blue[200],
  },
}))

const Header: React.FunctionComponent<{ text: string }> = ({ text }) => {
  const classes = useStyles()
  return (
    <Typography variant="h3" className={classes.header}>
      {text}
    </Typography>
  )
}

export default Header
