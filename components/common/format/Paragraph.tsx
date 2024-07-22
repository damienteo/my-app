import React from 'react'
import { Typography, TypographyProps } from '@mui/material'

const Paragraph: React.FunctionComponent<TypographyProps> = (props) => {
  return (
    <Typography variant="body1" className="my-[1.5] mx-0 text-blue" {...props}>
      {props.children}
    </Typography>
  )
}

export default Paragraph
