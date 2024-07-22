import React from 'react'

const Header: React.FunctionComponent<{ text: string }> = ({ text }) => {
  return <p className="mt-[20] mx-[0] mb-[10] text-[blue]">{text}</p>
}

export default Header
