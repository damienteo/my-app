import React from 'react'
import Link from 'next/link'

type NextLinkProps = {
  className: string
  href: string
  hrefAs: string
  children: React.ReactNode
}

interface ButtonLinkProps {
  url: string
  text: string
  component?: React.ReactNode
}

export const NextLink: React.FunctionComponent<NextLinkProps> = ({
  className,
  href,
  hrefAs,
  children,
}) => (
  <Link href={href} as={hrefAs}>
    <a className={className}>{children}</a>
  </Link>
)

export const ButtonLink: React.FunctionComponent<ButtonLinkProps> = ({
  url,
  text,
}) => {
  return (
    <Link href={url} as={url}>
      <button
        // href={url}
        color="inherit"
        className="hover:bg-[#282c35] hover:text-[#FFFFFF]"
      >
        {text}
      </button>
    </Link>
  )
}
