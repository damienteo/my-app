import React, { useState } from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'
import { Container, Drawer } from '@material-ui/core'
import NavBar from './navbar'
import { ButtonLink } from '../common/links/buttonLink'
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

const useStyles = makeStyles(() => ({
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

const Layout: React.FunctionComponent = ({ children }) => {
  const classes = useStyles()
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <NavBar setDrawerOpen={() => setDrawerOpen(!isDrawerOpen)} />
      <Container maxWidth="lg">{children}</Container>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        classes={{ paper: classes.drawerWrapper }}
      >
        <div className={classes.drawer}>
          {navLinks.map(({ url, text }) => (
            <ButtonLink key={url} url={url} text={text} />
          ))}
        </div>
      </Drawer>
    </ThemeProvider>
  )
}

export default Layout
