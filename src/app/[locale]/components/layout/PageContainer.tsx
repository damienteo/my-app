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
 * Horizontal width and padding live on the locale layout, next to the nav,
 * so every page lines up with the same edges.
 */
const PageContainer: React.FunctionComponent<PageContainerProps> = ({
  title,
  children,
  className = '',
  width = 'full',
}) => {
  return (
    <div className={`w-full py-2 md:py-6 ${widthClass[width]} ${className}`}>
      {title ? <Header text={title} className="mb-6" /> : null}
      {children}
    </div>
  )
}

export default PageContainer
