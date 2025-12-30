'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Section } from '../../common'
import StockCard from './StockCard'
import { Stock } from '../../../../../constants'

interface StockCategory {
  id: string
  title: string
  stocks: Stock[]
}

interface StockQuote {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
  t: number
}

interface StockData {
  symbol: string
  quote: StockQuote | null
  historical: Array<{ date: string; price: number }> | null
  quoteTimestamp?: number
  historicalTimestamp?: number
}

interface StockCategorySectionProps {
  category: StockCategory
  stockData: Record<string, StockData>
}

const StockCategorySection: React.FC<StockCategorySectionProps> = ({
  category,
  stockData,
}) => {
  return (
    <Section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">{category.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            data={stockData[stock.symbol]}
          />
        ))}
      </div>
    </Section>
  )
}

export default StockCategorySection

