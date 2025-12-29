import React from 'react'
import { Metadata } from 'next'
import DailyChecksClient from './DailyChecksClient'

export const metadata: Metadata = {
  title: 'Daily Checks',
  description: 'Weather and forex information for daily checks',
}

const DailyChecks: React.FunctionComponent = () => {
  return <DailyChecksClient />
}

export default DailyChecks

