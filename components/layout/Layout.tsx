import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import { blue } from '@mui/material/colors/'
import { Container, Drawer } from '@mui/material'
import Head from 'next/head'
import { useRouter } from 'next/router'

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
  const {
    title = 'Damien Teo',
    description = "Welcome to Damien Teo's Site",
    children,
  } = props

  const classes = useStyles()
  const router = useRouter()

  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" key="title" content={`${title} - Damien Teo`} />
        <meta name="description" key="description" content={description} />
        <meta property="og:title" key="og:title" content={title} />
        <meta property="og:locale" key="og:locale" content="en_GB" />
        <meta
          property="og:url"
          key="og:url"
          content={`https://www.damienteo.com${router.asPath}`}
        />
        z
        <meta property="og:type" key="og:type" content="website" />
        <meta
          property="og:description"
          key="og:description"
          content={description}
        />
        {/* <link rel="canonical" href="https://www.damienteo.com" /> */}
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
