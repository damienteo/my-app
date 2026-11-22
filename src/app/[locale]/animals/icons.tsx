import React from 'react'

type IconProps = {
  className?: string
}

export const PlayIcon: React.FunctionComponent<IconProps> = ({
  className = 'ml-0.5 h-7 w-7',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="currentColor" d="M8 5.5v13l11-6.5-11-6.5z" />
  </svg>
)

export const PauseIcon: React.FunctionComponent<IconProps> = ({
  className = 'h-7 w-7',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
  </svg>
)

export const CloseIcon: React.FunctionComponent = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="currentColor"
      d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5z"
    />
  </svg>
)

export const ChevronLeftIcon: React.FunctionComponent = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
    <path
      fill="currentColor"
      d="M14.7 5.3 8 12l6.7 6.7 1.4-1.4L10.8 12l5.3-5.3-1.4-1.4z"
    />
  </svg>
)

export const ChevronRightIcon: React.FunctionComponent = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
    <path
      fill="currentColor"
      d="M9.3 5.3 8 6.7 13.2 12 8 17.3l1.3 1.4L16 12 9.3 5.3z"
    />
  </svg>
)
