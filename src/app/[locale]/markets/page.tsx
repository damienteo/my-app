import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageContainer from '../components/layout/PageContainer'
import { MacroLiquidityTracker } from '../components/views/markets'

export const metadata: Metadata = {
  title: 'Markets',
  description: 'Data that I occasionally check',
}

const Markets: React.FunctionComponent = () => {
  notFound()
  return (
    <PageContainer>
      <MacroLiquidityTracker />
    </PageContainer>
  )
}

export default Markets
