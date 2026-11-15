import './globals.css'

import React from 'react'
import type { Viewport } from 'next'
import {
  Geist,
  Geist_Mono,
  Noto_Sans_JP,
  Space_Grotesk,
} from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { GoogleAnalytics } from '@next/third-parties/google'

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
  variable: '--font-geist-mono',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
})

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto',
  preload: false,
})

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0A0B',
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

  return (
    <html
      lang={locale}
      className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${notoSansJp.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale}>
          {/* Navbar */}
          <NavBar />
          {/* Main Content */}
          <div className=" mx-auto min-h-screen max-w-screen-lg pt-20 sm:pt-24 pb-8 px-4 md:px-0">
            {children}
          </div>
        </NextIntlClientProvider>

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TRACKING_ID || ''} />
      </body>
    </html>
  )
}
