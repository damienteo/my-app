'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { ButtonLink } from '../common/links'
import { navLinks } from '../../../../../constants'

const NavBar: React.FunctionComponent = () => {
  const t = useTranslations('NavLinks')
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  return (
    <>
      <div className="fixed top-0 top-0 z-50 w-full bg-blue-900 px-3">
        <nav className="flex items-center justify-between px-4 md:py-1 py-3">
          {/* Menu button for mobile view */}
          <button
            // Border color does not show correctly on Brave Browser on Mobile
            // Still works for Chrome and Safari
            className="text-white text-sm border border-white px-3 py-1 rounded md:hidden"
            aria-label="menu"
            onClick={() => setDrawerOpen(!isDrawerOpen)}
          >
            {t('menu')}
          </button>

          {/* Site title */}
          <div className="text-white text-lg"> {t('title')}</div>

          {/* Navigation links for desktop view */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map(({ url, text }) => (
              <ButtonLink key={url} url={url} text={t(text)} />
            ))}
          </div>
        </nav>
      </div>
      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black opacity-30"
            onClick={() => setDrawerOpen(false)} // Close drawer when clicking outside
          ></div>

          {/* Side Drawer */}
          {/* Drawer may not be sliding in due to how isDrawerOpen may be causing re-render */}
          <div
            className={`fixed top-0 left-0 h-full bg-blue-900 p-4 pr-6 shadow-lg transform transition-all duration-300 ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Navigation Links */}
            <nav className="space-y-2">
              {navLinks.map(({ url, text }) => (
                <ButtonLink
                  key={url}
                  url={url}
                  text={t(text)}
                  onClick={() => setDrawerOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default NavBar
