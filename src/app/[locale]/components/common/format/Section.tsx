import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
}

const Section: React.FunctionComponent<SectionProps> = ({
  children,
  className = '',
}) => {
  return (
    <section
      className={`bg-gray-800 text-gray-300 rounded-lg p-6 mb-6 border border-gray-700 ${className}`}
    >
      {children}
    </section>
  )
}

export default Section
