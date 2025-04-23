import React from 'react'

interface HeaderProps {
  text: string
  className?: string
}

const Header: React.FunctionComponent<HeaderProps> = ({
  text,
  className = 'mb-2',
}) => {
  return <h1 className={`text-2xl font-bold ${className ?? ''}`}>{text}</h1>
}

export default Header
