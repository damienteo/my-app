import React from 'react'

import { focusRing } from '../classes'

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
      className={`text-accent-text underline-offset-2 hover:text-ink hover:underline ${focusRing}`}
    >
      {label}
    </a>
  )
}

export default ExternalLink
