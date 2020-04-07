import React, { useState } from 'react'
import Head from 'next/head'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'
import { Container, Drawer } from '@material-ui/core'
import NavBar from './navbar'
import { renderButton } from '../common/buttonLink'
import { navLinks } from '../constants'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[50],
    },
    secondary: {
      main: blue[800],
    },
  },
})

const useStyles = makeStyles((theme) => ({
  drawer: {
    padding: 20,
    '& a': {
      display: 'block',
      margin: '10px 0',
    },
  },
}))

const Layout = ({ children }) => {
  const classes = useStyles()
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Damien Teo</title>
      </Head>
      <NavBar setDrawerOpen={setDrawerOpen} />
      <Container maxWidth="lg">{children}</Container>
      <Drawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className={classes.drawer}>
          {navLinks.map(({ url, text }) => renderButton(url, text))}
        </div>
      </Drawer>
      <style jsx global>{`
        body {
          margin: 0;
          background: #282c35;
          color: #ffffff;
        }
      `}</style>
    </ThemeProvider>
  )
}

export default Layout
