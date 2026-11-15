export interface StockFinancials {
  riskLevel?: 'A' | 'B' | 'C' // Risk level: A (Fortress), B (Steady), C (Speculative)
}

export interface Stock {
  symbol: string
  name: string
  exchange: string
  market: 'US' | 'JP' | 'CN'
  financials?: StockFinancials
  yahooSymbol?: string // Yahoo Finance symbol if different from display symbol
}

export interface StockCategory {
  id: string
  title: string
  stocks: Stock[]
}

// AI & Robotics stocks
export const aiRoboticsCategories: StockCategory[] = [
  {
    id: 'brains',
    title: 'The Brains: Processing & Edge AI',
    stocks: [
      {
        symbol: 'NVDA',
        name: 'NVIDIA',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      { symbol: 'ARM', name: 'Arm Holdings', exchange: 'NASDAQ', market: 'US' },
      { symbol: 'AMBA', name: 'Ambarella', exchange: 'NASDAQ', market: 'US' },
      {
        symbol: 'INTC',
        name: 'Intel',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'QCOM',
        name: 'Qualcomm',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
    ],
  },
  {
    id: 'senses',
    title: 'The Senses: Vision & LiDAR',
    stocks: [
      {
        symbol: 'OUST',
        name: 'Ouster',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
      {
        symbol: 'LAZR',
        name: 'Luminar',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
      { symbol: 'TER', name: 'Teradyne', exchange: 'NASDAQ', market: 'US' },
      {
        symbol: 'STM',
        name: 'STMicroelectronics',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'CGNX',
        name: 'Cognex',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'MBLY',
        name: 'Mobileye',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
    ],
  },
  {
    id: 'muscles',
    title: 'The Muscles: Motors & Precision Parts',
    stocks: [
      {
        symbol: '6324.T',
        name: 'Harmonic Drive Systems',
        exchange: 'TSE',
        market: 'JP',
        financials: {
          riskLevel: 'C',
        },
      },
      {
        symbol: '300433.SZ',
        name: 'Lens Technology',
        exchange: 'SZSE',
        market: 'CN',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'ROK',
        name: 'Rockwell Automation',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'ABB',
        name: 'ABB',
        exchange: 'NYSE',
        market: 'US',
        yahooSymbol: 'ABBN.SW', // ABB trades on Swiss exchange in Yahoo Finance
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: '6954.T',
        name: 'Fanuc',
        exchange: 'TSE',
        market: 'JP',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: '6506.T',
        name: 'Yaskawa Electric',
        exchange: 'TSE',
        market: 'JP',
        financials: {
          riskLevel: 'B',
        },
      },
    ],
  },
  {
    id: 'nervous',
    title: 'The Nervous System: Simulation & Software',
    stocks: [
      {
        symbol: 'U',
        name: 'Unity Software',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'PATH',
        name: 'UiPath',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
    ],
  },
]

// Magnificent 7 stocks
export const magnificent7Categories: StockCategory[] = [
  {
    id: 'magnificent7',
    title: 'The Magnificent 7',
    stocks: [
      {
        symbol: 'AAPL',
        name: 'Apple',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'AMZN',
        name: 'Amazon',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'META',
        name: 'Meta Platforms',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'TSLA',
        name: 'Tesla',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
    ],
  },
]

// Power Hungry: Energy & Nuclear stocks
export const powerHungryCategories: StockCategory[] = [
  {
    id: 'powerHungry',
    title: 'Power Hungry: Energy & Nuclear',
    stocks: [
      {
        symbol: 'CCJ',
        name: 'Cameco',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'CEG',
        name: 'Constellation Energy',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: '7011.T',
        name: 'Mitsubishi Heavy Industries',
        exchange: 'TSE',
        market: 'JP',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'SMR',
        name: 'NuScale Power',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
      {
        symbol: 'LEU',
        name: 'Centrus Energy',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
      {
        symbol: 'GE',
        name: 'General Electric',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'NRGV',
        name: 'Energy Vault',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'C',
        },
      },
    ],
  },
]

// Longevity: GLP-1s and Biotech stocks
export const longevityCategories: StockCategory[] = [
  {
    id: 'longevity',
    title: 'Longevity: GLP-1s and Biotech',
    stocks: [
      {
        symbol: 'LLY',
        name: 'Eli Lilly',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'NVO',
        name: 'Novo Nordisk',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'TMO',
        name: 'Thermo Fisher Scientific',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'BDX',
        name: 'Becton Dickinson',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'IQV',
        name: 'IQVIA',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'CTLT',
        name: 'Catalent',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'B',
        },
      },
      {
        symbol: 'AMGN',
        name: 'Amgen',
        exchange: 'NASDAQ',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
    ],
  },
]

// Hedge: Real Assets & Defense stocks
export const hedgeCategories: StockCategory[] = [
  {
    id: 'hedge',
    title: 'Hedge: Real Assets & Defense',
    stocks: [
      {
        symbol: 'LMT',
        name: 'Lockheed Martin',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'RTX',
        name: 'Raytheon Technologies',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'NOC',
        name: 'Northrop Grumman',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'GD',
        name: 'General Dynamics',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
      {
        symbol: 'NEM',
        name: 'Newmont Corporation',
        exchange: 'NYSE',
        market: 'US',
        financials: {
          riskLevel: 'A',
        },
      },
    ],
  },
]

// Combined for backward compatibility
export const stockCategories: StockCategory[] = [
  ...aiRoboticsCategories,
  ...magnificent7Categories,
  ...powerHungryCategories,
  ...longevityCategories,
  ...hedgeCategories,
]
