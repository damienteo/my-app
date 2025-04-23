import React from 'react'

type ExternalLinkProps = {
  url: string
  label: string
}

const ExternalLink: React.FunctionComponent<ExternalLinkProps> = ({
  url,
  label,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-600 hover:underline transition-colors duration-200"
    >
      {label}
    </a>
  )
}

export default ExternalLink
