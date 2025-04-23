import React, { ReactNode } from 'react'

interface ParagraphProps {
  children: ReactNode
  className?: string
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  // Combine the default styles with any additional className passed as a prop
  const paragraphClassName = `mb-2 ${className ?? ''}`

  return <p className={paragraphClassName}>{children}</p>
}

export default Paragraph
