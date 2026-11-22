import React from 'react'

import { generatePageMetadata } from '../../../lib/pageMetadata'
import AboutPage from '../components/views/about/AboutPage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return generatePageMetadata({ params, page: 'about' })
}

const About: React.FunctionComponent = () => {
  return <AboutPage />
}

export default About
