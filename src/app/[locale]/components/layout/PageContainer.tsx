import React from 'react'

import Header from '../common/format/Header'

type PageWidth = 'full' | 'prose'

type PageContainerProps = {
  /** Page heading. Omit it when the page builds its own h1. */
  title?: string
  children: React.ReactNode
  className?: string
  /**
   * `full` uses the width the layout already set.
   * `prose` is a narrower reading column for a page that is only text.
   */
  width?: PageWidth
}

const widthClass: Record<PageWidth, string> = {
  full: '',
  prose: 'mx-auto max-w-2xl',
}

/**
 * Vertical rhythm and the page heading.
 * The layout clears the fixed nav (`pt-14`, the same 56px as `h-14`).
 * This container is the gap under that bar: 32px on a phone, 40px from `md`.
 * Horizontal width and padding stay on the layout, next to the nav.
 */
const PageContainer: React.FunctionComponent<PageContainerProps> = ({
  title,
  children,
  className = '',
  width = 'full',
}) => {
  return (
    <div className={`w-full pt-8 md:pt-10 ${widthClass[width]} ${className}`}>
      {title ? <Header text={title} className="mb-6" /> : null}
      {children}
    </div>
  )
}

export default PageContainer
