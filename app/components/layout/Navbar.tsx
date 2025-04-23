import React, { MouseEvent } from 'react'
import { ButtonLink } from '../common/links'
import { navLinks } from '../../../constants'

const NavBar: React.FunctionComponent<{
  setDrawerOpen: (event: MouseEvent) => void
}> = (props) => {
  return (
    <div className="w-full bg-blue-900 px-3">
      <nav className="flex items-center justify-between px-4 md:py-1 py-3">
        {/* Menu button for mobile view */}
        <button
          className="text-white text-sm border border-white px-3 py-1 rounded md:hidden"
          aria-label="menu"
          onClick={props.setDrawerOpen}
        >
          Menu
        </button>

        {/* Site title */}
        <div className="text-white text-lg">Damien Teo's Site</div>

        {/* Navigation links for desktop view */}
        <div className="hidden md:flex space-x-1">
          {navLinks.map(({ url, text }) => (
            <ButtonLink key={url} url={url} text={text} />
          ))}
        </div>
      </nav>
    </div>
  )
}

export default NavBar
