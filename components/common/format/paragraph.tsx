import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Theme, TypographyProps } from '@material-ui/core/'
import { blue } from '@material-ui/core/colors/'

const useStyles = makeStyles((theme: Theme) => ({
  paragraph: {
    margin: `${theme.spacing(1.5)}px 0`,
    color: blue[50],
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
