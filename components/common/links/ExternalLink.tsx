import React from 'react'
import { makeStyles } from '@mui/styles'
import { red } from '@mui/material/colors/'

type ExternalLinkProps = {
  url: string
  label: string
}

const useStyles = makeStyles(() => ({
  link: {
    color: red[300],
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
