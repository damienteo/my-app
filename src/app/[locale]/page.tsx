import React from 'react'

import { generatePageMetadata } from '../../lib/pageMetadata'
import AboutPage from './components/views/about/AboutPage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return generatePageMetadata({ params, page: 'home' })
}

const Index = () => {
  return <AboutPage />
}

export default Index
