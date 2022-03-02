import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ThemeProvider } from '@material-ui/styles'
import type { AppProps /*, AppContext */ } from 'next/app'
import theme from '../src/theme'

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
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
