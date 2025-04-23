import React from 'react'

const Header: React.FunctionComponent<{ text: string }> = ({ text }) => {
  return <h1 className="text-2xl font-bold mb-2">{text}</h1>
}

export default Header
