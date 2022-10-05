import React from 'react'
import { makeStyles } from '@mui/styles'
import { blue } from '@mui/material/colors/'

type ExternalLinkProps = {
  url: string
  label: string
}

const useStyles = makeStyles(() => ({
  link: {
    color: blue[300],
  },
}))

const ExternalLink: React.FunctionComponent<ExternalLinkProps> = ({
  url,
  label,
}) => {
  const classes = useStyles()
  return (
    <a href={url} target="_blank" rel="noopener" className={classes.link}>
      {label}
    </a>
  )
}

export default ExternalLink
