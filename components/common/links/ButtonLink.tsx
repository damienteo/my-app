import React from 'react'
import Link from 'next/link'
import { makeStyles } from '@mui/styles'
import Button, { ButtonProps as MuiButtonProps } from '@mui/material/Button'

type NextLinkProps = {
  className: string
  href: string
  hrefAs: string
  children: React.ReactNode
}

interface ButtonLinkProps extends MuiButtonProps {
  url: string
  text: string
  component?: React.ReactNode
}

const useStyles = makeStyles(() => ({
  button: {
    '&:hover': {
      backgroundColor: '#282c35',
      color: '#FFFFFF',
    },
    '&& a': {
      margin: 0,
    },
  },
}))

export const NextLink: React.FunctionComponent<NextLinkProps> = ({
  className,
  href,
  hrefAs,
  children,
}) => (
  <Link href={href} as={hrefAs} prefetch>
    <a className={className}>{children}</a>
  </Link>
)

export const ButtonLink: React.FunctionComponent<ButtonLinkProps> = ({
  url,
  text,
}) => {
  const classes = useStyles()
  return (
    <Link href={url} as={url} prefetch>
      <Button href={url} color="inherit" className={classes.button}>
        {text}
      </Button>
    </Link>
  )
}
