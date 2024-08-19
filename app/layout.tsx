import React, { useEffect } from 'react'
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
      <body>{children}</body>
    </html>
  )
}
