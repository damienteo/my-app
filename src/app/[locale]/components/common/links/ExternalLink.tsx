import React from 'react'

import { focusRing } from '../classes'

type ExternalLinkProps = {
  url: string
  label: string
  className?: string
  icon?: React.ReactNode
  note?: string
}

const textLinkClass = `text-accent-text underline-offset-2 hover:text-ink hover:underline ${focusRing}`

const ExternalLink: React.FunctionComponent<ExternalLinkProps> = ({
  url,
  label,
  className,
  icon,
  note,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? textLinkClass}
    >
      {icon}
      {label}
      {note ? <span className="text-xs text-muted">{note}</span> : null}
    </a>
  )
}

export default ExternalLink
