import React from 'react'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'

import { Header, Paragraph } from '../components/common'
import { MacroLiquidityTracker } from '../components/views/markets'

export const metadata: Metadata = {
  title: 'Markets',
  description: 'Data that I occasionally check',
}

const Markets: React.FunctionComponent = () => {
  notFound()
  const t = useTranslations('MarketsPage')
  return (
    <>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 mt-8">
        <MacroLiquidityTracker />
      </div>
    </>
  )
}

export default Markets
