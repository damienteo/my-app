'use client'

import './globals.css'

import React, { useState } from 'react'
import localFont from 'next/font/local'

import NavBar from './components/layout/Navbar'
import { ButtonLink } from './components/common'

import { navLinks } from '@/constants'

const poppins = localFont({
  src: '../public/fonts/poppins.woff2',
  weight: 'normal',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <html lang="en">
      <body className={poppins.className}>
        {/* Navbar */}
        <NavBar setDrawerOpen={() => setDrawerOpen(!isDrawerOpen)} />

        {/* Main Content */}
        <div className=" mx-auto min-h-screen max-w-screen-lg pt-20 sm:pt-24 pb-8 px-4 md:px-0">
          {children}
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
                    text={text}
                    onClick={() => setDrawerOpen(false)}
                  />
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Global Site Tag (gtag.js) - Google Analytics */}
        {/* 
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        /> 
        */}
      </body>
    </html>
  )
}
