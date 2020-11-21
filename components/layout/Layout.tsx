import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'
import { Container, Drawer } from '@material-ui/core'
import NavBar from './Navbar'
import { ButtonLink } from '../common/links/ButtonLink'
import { navLinks } from '../../constants'

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

type Props = {
  children: JSX.Element
}

const Layout: React.FunctionComponent<Props> = ({ children }) => {
  const classes = useStyles()
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
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
    </>
  )
}

export default Layout
