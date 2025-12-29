'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

interface Stock {
  symbol: string
  name: string
  exchange: string
  market: string
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
  quoteTimestamp?: number
}

interface StockCardProps {
  stock: Stock
  data: StockData | undefined
}

const StockCard: React.FC<StockCardProps> = ({ stock, data }) => {
  const t = useTranslations('StocksWatchPage')
  const quote = data?.quote

  const formatPrice = (price: number | null): string => {
    if (price === null) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const formatPercent = (value: number | null): string => {
    if (value === null) return 'N/A'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const changeColor = quote && quote.dp >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white">{stock.name}</h3>
        <p className="text-sm text-gray-400">
          {stock.symbol} • {stock.exchange}
        </p>
      </div>

      {quote ? (
        <>
          <div className="mb-3">
            <p className="text-2xl font-bold text-white">
              {formatPrice(quote.c)}
            </p>
            <p className={`text-sm font-semibold ${changeColor}`}>
              {formatPrice(quote.d)} ({formatPercent(quote.dp)})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
            <div>
              <span className="text-gray-500">Day High:</span>{' '}
              {formatPrice(quote.h)}
            </div>
            <div>
              <span className="text-gray-500">Day Low:</span>{' '}
              {formatPrice(quote.l)}
            </div>
            <div>
              <span className="text-gray-500">Open:</span>{' '}
              {formatPrice(quote.o)}
            </div>
            <div>
              <span className="text-gray-500">Prev Close:</span>{' '}
              {formatPrice(quote.pc)}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-sm">{t('noData')}</p>
      )}
    </div>
  )
}

export default StockCard
