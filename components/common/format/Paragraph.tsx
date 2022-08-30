import React from 'react'
import { makeStyles } from '@mui/styles'
import { Typography, Theme, TypographyProps } from '@mui/material'
import { red } from '@mui/material/colors/'

const useStyles = makeStyles((theme: Theme) => ({
  paragraph: {
    margin: `${theme.spacing(1.5)} 0`,
    color: red[50],
  },
}))

const Paragraph: React.FunctionComponent<TypographyProps> = (props) => {
  const classes = useStyles()
  return (
    <Typography variant="body1" className={classes.paragraph} {...props}>
      {props.children}
    </Typography>
  )
}

export default Paragraph
