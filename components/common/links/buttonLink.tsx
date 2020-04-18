import React from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import Button, { ButtonProps as MuiButtonProps } from '@material-ui/core/Button'

type NextLinkProps = {
  className: string
  href: string
  hrefAs: string
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
        <a>{text}</a>
      </Button>
    </Link>
  )
}
