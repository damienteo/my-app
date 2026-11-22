import './globals.css'

import React from 'react'
import type { Viewport } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { routing } from '../../i18n/routing'

import NavBar from './components/layout/Navbar'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  // Used by charts, not body text. Skip the preload so pages without a
  // chart do not download it during first paint.
  preload: false,
  variable: '--font-geist-mono',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
})

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0A0B',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Noto Sans JP is a multi-megabyte family of unicode-range files.
  // Load its CSS only for the Japanese locale. English pages keep Geist
  // and Space Grotesk; the "日本語" label falls back to a system CJK font.
  const notoVariable =
    locale === 'jp'
      ? (await import('./fonts/noto-sans-jp')).notoSansJp.variable
      : ''

  // The URL locale is "jp", which is not a BCP 47 language tag. Hyphenation
  // and justification follow the html lang: English is "en", Japanese is "ja".
  const htmlLang = locale === 'jp' ? 'ja' : locale

  return (
    <html
      lang={htmlLang}
      className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${notoVariable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale}>
          {/* Navbar */}
          <NavBar />
          {/* Main Content */}
          <div className="mx-auto min-h-screen max-w-screen-lg px-4 pt-20 pb-8 sm:pt-24">
            {children}
          </div>
        </NextIntlClientProvider>

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TRACKING_ID || ''} />
        <SpeedInsights />
      </body>
    </html>
  )
}
