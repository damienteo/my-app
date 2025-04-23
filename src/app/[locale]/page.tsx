import React from 'react'
import { Metadata } from 'next'

import AboutPage from './components/views/about/AboutPage'

export const metadata: Metadata = {
  title: 'Damien Teo',
  description:
    'Damien Teo is a peasant who enjoys working with intelligent machines. Previously, he was a police officer. Now, he work in the tech industry.',
}

const Index = () => {
  return <AboutPage />
}

export default Index
