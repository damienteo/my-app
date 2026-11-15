'use client'

import React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type PricePoint = {
  date: string
  value: number
}

type PriceLineChartProps = {
  data: PricePoint[]
  formatDate: (date: string) => string
  formatValue: (value: number) => string
  domain: [number, number]
  stroke?: string
}

const PriceLineChart: React.FunctionComponent<PriceLineChartProps> = ({
  data,
  formatDate,
  formatValue,
  domain,
  stroke = 'var(--color-accent)',
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-raised)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="var(--color-muted)"
          style={{ fontSize: '12px' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke="var(--color-muted)"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => formatValue(value)}
          domain={domain}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number' ? formatValue(value) : 'N/A'
          }
          labelFormatter={(label) =>
            formatDate(typeof label === 'string' ? label : '')
          }
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-raised)',
            borderRadius: '4px',
            color: 'var(--color-ink)',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default PriceLineChart
