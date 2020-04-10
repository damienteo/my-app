import React, { useState } from 'react'
import Head from 'next/head'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'
import { Container, Drawer } from '@material-ui/core'
import NavBar from './navbar'
import { renderButtonLink } from '../common/links/buttonLink'
import { navLinks } from '../../constants'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[800],
    },
    secondary: {
      main: blue[50],
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
  drawerWrapper: {
    backgroundColor: blue[50],
  },
}))

const Layout = ({ children }) => {
  const classes = useStyles()
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <NavBar setDrawerOpen={setDrawerOpen} />
      <Container maxWidth="lg">{children}</Container>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        classes={{ paper: classes.drawerWrapper }}
      >
        <div className={classes.drawer}>
          {navLinks.map(({ url, text }) => renderButtonLink(url, text))}
        </div>
      </Drawer>
    </ThemeProvider>
  )
}

export default Layout
