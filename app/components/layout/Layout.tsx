'use client'

import React, { useState } from 'react'
import Head from 'next/head'
// import { useRouter } from 'next/router'

import NavBar from './Navbar'
import { ButtonLink } from '../common/links/ButtonLink'
import { navLinks } from '../../../constants'

type LayoutProps = {
  title?: string
  description?: string
  children: React.ReactNode
}

const Layout: React.FunctionComponent<LayoutProps> = (props) => {
  const {
    title = 'Damien Teo',
    description = "Welcome to Damien Teo's Site",
    children,
  } = props

  // const router = useRouter()

  const [isDrawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" key="title" content={`${title} - Damien Teo`} />
        <meta name="description" key="description" content={description} />
        <meta property="og:title" key="og:title" content={title} />
        <meta property="og:locale" key="og:locale" content="en_GB" />
        {/* <meta
          property="og:url"
          key="og:url"
          content={`https://www.damienteo.com${router.asPath}`}
        /> */}
        <meta property="og:type" key="og:type" content="website" />
        <meta
          property="og:description"
          key="og:description"
          content={description}
        />
        {/* <link rel="canonical" href="https://www.damienteo.com" /> */}
      </Head>
      <NavBar setDrawerOpen={() => setDrawerOpen(!isDrawerOpen)} />
      <div className="container mx-auto max-w-screen-lg">{children}</div>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-blue-50 p-4 rounded-lg shadow-lg">
            {navLinks.map(({ url, text }) => (
              <ButtonLink
                key={url}
                url={url}
                text={text}
                // className="block my-2"
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default Layout
