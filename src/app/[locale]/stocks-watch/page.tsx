import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import StocksWatchClient from './StocksWatchClient'

export const metadata: Metadata = {
  title: 'Stocks Watch',
  description: 'Robotics and AI stocks watchlist',
}

const StocksWatch: React.FunctionComponent = () => {
  notFound()
  return <StocksWatchClient />
}

export default StocksWatch

