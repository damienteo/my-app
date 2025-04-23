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
      className="block my-2 text-white hover:bg-[#282c35] rounded-lg px-3 py-2"
      onClick={onClick}
    >
      {text}
    </Link>
  )
}
