import React from 'react'
import Link from 'next/link'

interface ButtonLinkProps {
  url: string
  text: string
  onClick?: () => void
}

export const ButtonLink: React.FunctionComponent<ButtonLinkProps> = ({
  url,
  text,
  onClick,
}) => {
  return (
    <Link href={url} as={url}>
      <button
        className="block my-2 text-white hover:bg-[#282c35] rounded-lg px-3 py-2"
        onClick={onClick}
      >
        {text}
      </button>
    </Link>
  )
}

type NextLinkProps = {
  className: string
  href: string
  hrefAs: string
  children: React.ReactNode
}

export const NextLink: React.FunctionComponent<NextLinkProps> = ({
  className,
  href,
  hrefAs,
  children,
}) => (
  <Link href={href} as={hrefAs} className={className}>
    {children}
  </Link>
)
