import React from 'react'
import Link from 'next/link'

interface ButtonLinkProps {
  url: string
  text: string
  component?: React.ReactNode
}

export const ButtonLink: React.FunctionComponent<ButtonLinkProps> = ({
  url,
  text,
}) => {
  return (
    <Link href={url} as={url}>
      <button className="block my-2 text-gray-900 hover:text-blue-500 hover:bg-[#282c35] transition-colors duration-300">
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
