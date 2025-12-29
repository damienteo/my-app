import React from 'react'
import { Metadata } from 'next'

import CPFForecastPageClient from './CPFForecastPageClient'

export const metadata: Metadata = {
  title: 'CPF Forecast',
  description:
    'CPF Forecast helps users to calculate CPF OA and SA years down the road, based on their projected contributions',
}

const CPFForecast: React.FunctionComponent = () => {
  return <CPFForecastPageClient />
}

export default CPFForecast
