import React from 'react'
import { Metadata } from 'next'
import StocksWatchClient from './StocksWatchClient'

export const metadata: Metadata = {
  title: 'Stocks Watch',
  description: 'Robotics and AI stocks watchlist',
}

const StocksWatch: React.FunctionComponent = () => {
  return <StocksWatchClient />
}

export default StocksWatch

