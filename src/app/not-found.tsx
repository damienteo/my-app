import React from 'react'
import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          background: '#0A0A0B',
          color: '#FAFAFA',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <title>Page not found</title>
        <main>
          <h1>Page not found</h1>
          <p>The page you requested could not be found.</p>
          <Link href="/en" style={{ color: '#7aa4ff' }}>
            Back to home
          </Link>
        </main>
      </body>
    </html>
  )
}
