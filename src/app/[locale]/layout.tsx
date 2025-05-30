import './globals.css'

import React from 'react'
import localFont from 'next/font/local'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { GoogleAnalytics } from '@next/third-parties/google'

import { routing } from '../../i18n/routing'

import NavBar from './components/layout/Navbar'

const poppins = localFont({
  src: '../../../public/fonts/poppins.woff2',
  weight: 'normal',
})

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
    <html lang={locale}>
      <body className={poppins.className}>
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
