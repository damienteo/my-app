import React from 'react'
import { Typography } from '@mui/material/'

const Header: React.FunctionComponent<{ text: string }> = ({ text }) => {
  return (
    <Typography variant="h3" className="mt-[20] mx-[0] mb-[10] text-[blue]">
      {text}
    </Typography>
  )
}

export default Header
