import React from 'react'

interface SectionProps {
  children: React.ReactNode
}

const Section: React.FunctionComponent<SectionProps> = ({ children }) => {
  return (
    <section className="bg-blue text-[#282c35] rounded-lg p-2 mb-[1.5]">
      {children}
    </section>
  )
}

export default Section
