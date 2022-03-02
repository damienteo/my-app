import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ThemeProvider } from '@material-ui/styles'
import type { AppProps /*, AppContext */ } from 'next/app'
import theme from '../src/theme'
import Head from 'next/head'

import * as gtag from '../lib/gtag'

export default ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Damien Teo</title>
      </Head>
      <style jsx global>{`
        body {
          margin: 0;
          background: #282c35;
          color: #ffffff;
        }
      `}</style>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
