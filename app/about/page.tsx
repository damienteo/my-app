import React from 'react'
import { Metadata } from 'next'
import AboutPage from '../components/views/about/AboutPage'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Damien Teo is a peasant who enjoys working with intelligent machines. Previously, he was a police officer. Now, he work in the tech industry.',
}

const About: React.FunctionComponent = () => {
  return <AboutPage />
}

export default About
