import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ThemeProvider } from '@material-ui/styles'
import { createTheme } from '@material-ui/core/styles'
import type { AppProps /*, AppContext */ } from 'next/app'
import { blue } from '@material-ui/core/colors/'

import * as gtag from '../lib/gtag'

const theme = createTheme({
  palette: {
    primary: {
      main: blue[800],
    },
    secondary: {
      main: blue[50],
    },
  },
})

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
