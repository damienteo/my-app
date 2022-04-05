import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'
import { Container, Drawer } from '@material-ui/core'
import Head from 'next/head'

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

type LayoutProps = {
  title?: string
  description?: string
  children: any
}

const Layout: React.FunctionComponent<LayoutProps> = (props) => {
  const classes = useStyles()
  const {
    title = 'Damien Teo',
    description = "Welcome to Damien Teo's Site",
    children,
  } = props

  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Head>
        {/* <meta></meta> */}
        <title>{title}</title>
      </Head>
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
