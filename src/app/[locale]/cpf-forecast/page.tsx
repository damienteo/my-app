import React from 'react'

import { generatePageMetadata } from '../../../lib/pageMetadata'
import CPFForecastPageClient from './CPFForecastPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return generatePageMetadata({ params, page: 'cpfForecast' })
}

const CPFForecast: React.FunctionComponent = () => {
  return <CPFForecastPageClient />
}

export default CPFForecast
