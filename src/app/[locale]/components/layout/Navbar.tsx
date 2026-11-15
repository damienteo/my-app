'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/navigation'
import { useLocale } from 'next-intl'

import { navLinks } from '@/src/config/navLinks'

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const LocaleToggle: React.FunctionComponent<{
  locale: string
  toggleLocale: () => void
}> = ({ locale, toggleLocale }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => {
          if (locale !== 'en') toggleLocale()
        }}
        aria-pressed={locale === 'en'}
        className={`rounded-sm px-0.5 ${focusRing} ${
          locale === 'en'
            ? 'text-accent underline decoration-2 underline-offset-4'
            : 'text-muted hover:text-ink'
        }`}
      >
        ENG
      </button>
      <button
        type="button"
        onClick={() => {
          if (locale !== 'jp') toggleLocale()
        }}
        aria-pressed={locale === 'jp'}
        className={`rounded-sm px-0.5 ${focusRing} ${
          locale === 'jp'
            ? 'text-accent underline decoration-2 underline-offset-4'
            : 'text-muted hover:text-ink'
        }`}
      >
        日本語
      </button>
    </div>
  )
}

const NavBar: React.FunctionComponent = () => {
  const t = useTranslations('NavLinks')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isMenuOpen, setMenuOpen] = useState(false)

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'jp' : 'en'
    router.replace(pathname, { locale: newLocale })
  }

  const isActive = (url: string) => {
    if (url === 'about') {
      return pathname === '/' || pathname === '/about'
    }
    return pathname === `/${url}`
  }

  const links = navLinks.map(({ url, text }) => {
    const active = isActive(url)
    return (
      <Link
        key={url}
        href={url}
        as={url}
        aria-current={active ? 'page' : undefined}
        onClick={() => setMenuOpen(false)}
        className={`rounded-sm py-1 text-sm ${focusRing} ${
          active
            ? 'text-accent underline decoration-2 underline-offset-4'
            : 'text-muted hover:text-ink'
        }`}
      >
        {t(text)}
      </Link>
    )
  })

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-raised bg-canvas/85 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-screen-lg items-center gap-3 px-4">
        <div className="font-display min-w-0 flex-1 truncate text-base text-ink">
          {t('title')}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          {links}
          <LocaleToggle locale={locale} toggleLocale={toggleLocale} />
        </div>

        <button
          type="button"
          className={`rounded-sm text-sm text-ink md:hidden ${focusRing}`}
          aria-label={t('menu')}
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {t('menu')}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-raised bg-canvas px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">{links}</div>
          <div className="mt-4 border-t border-raised pt-3">
            <LocaleToggle locale={locale} toggleLocale={toggleLocale} />
          </div>
        </div>
      )}
    </header>
  )
}

export default NavBar
