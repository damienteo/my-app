import React from 'react'

import { generatePageMetadata } from '../../../lib/pageMetadata'
import DailyChecksClient from './DailyChecksClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return generatePageMetadata({ params, page: 'dailyChecks' })
}

const DailyChecks: React.FunctionComponent = () => {
  return <DailyChecksClient />
}

export default DailyChecks
