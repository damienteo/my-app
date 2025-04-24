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
    <Link
      href={url}
      as={url}
      className="block my-6 md:my-2 mx-1 text-white hover:bg-black rounded-lg px-3 py-1 border border-white hover:border-0"
      onClick={onClick}
    >
      {text}
    </Link>
  )
}
