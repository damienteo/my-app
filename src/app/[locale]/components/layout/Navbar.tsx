'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/navigation'
import { useLocale } from 'next-intl'

import { ButtonLink } from '../common/links'
import { navLinks } from '../../../../../constants'

// Reusable LocaleToggle Component
const LocaleToggle: React.FunctionComponent<{
  locale: string
  toggleLocale: () => void
}> = ({ locale, toggleLocale }) => {
  return (
    <div className="flex items-center space-x-1 text-sm text-white">
      <span>ENG</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={locale === 'jp'}
          onChange={toggleLocale}
        />
        <div className="w-10 h-5 rounded-full peer dark:bg-white peer-checked:bg-white"></div>
        <div className="absolute left-1 top-1 w-3 h-3 bg-blue-900 rounded-full transition-transform peer-checked:translate-x-5"></div>
      </label>
      <span>日本語</span>
    </div>
  )
}

const NavBar: React.FunctionComponent = () => {
  const t = useTranslations('NavLinks')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'jp' : 'en'
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <>
      <div className="fixed top-0 top-0 z-50 w-full bg-blue-900 px-1">
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
            {/* Locale Toggle Switch */}
            <div className="flex items-center ml-3">
              <LocaleToggle locale={locale} toggleLocale={toggleLocale} />
            </div>
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
            className={`fixed top-0 left-0 h-full bg-blue-900 px-5 shadow-lg transform transition-all duration-300 ${
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
              <div className="flex justify-center">
                <LocaleToggle locale={locale} toggleLocale={toggleLocale} />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default NavBar
