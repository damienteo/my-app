import React, { useEffect } from 'react'
import Script from 'next/script'
// import { usePathname } from 'next/navigation'
import * as gtag from '../lib/gtag'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const pathname = usePathname()

  // useEffect(() => {
  //   const handleRouteChange = (url: string) => {
  //     if (typeof window.gtag === 'function') {
  //       gtag.pageview(url)
  //     }
  //   }

  //   handleRouteChange(pathname) // Track the initial page load
  //   router.events.on('routeChangeComplete', handleRouteChange)

  //   return () => {
  //     router.events.off('routeChangeComplete', handleRouteChange)
  //   }
  // }, [pathname])

  return (
    <html lang="en">
      <body>
        {children} {/* Global Site Tag (gtag.js) - Google Analytics */}
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
      </body>
    </html>
  )
}
