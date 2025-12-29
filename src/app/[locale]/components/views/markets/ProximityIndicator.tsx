import React from 'react'

// Calculate proximity to red line threshold (0-100%, where 100% = at threshold)
const calculateProximity = (
  current: number | null,
  threshold: number,
  isLowerBetter: boolean = false
): { proximity: number | null; isAboveThreshold: boolean } => {
  if (current === null) return { proximity: null, isAboveThreshold: false }

  if (isLowerBetter) {
    // For metrics where lower is better (e.g., Z-Score where -2.0 is threshold)
    // Calculate how close we are to the threshold from above
    // If threshold is -2.0 and current is -1.35, we're 67.5% of the way there
    const isAboveThreshold = current > threshold // Above threshold is safer (less negative)
    const range = 0 - threshold // e.g., 0 - (-2.0) = 2.0
    if (range === 0) return { proximity: null, isAboveThreshold }
    const distance = current - threshold // e.g., -1.35 - (-2.0) = 0.65
    const proximity = Math.max(0, Math.min(100, (1 - distance / range) * 100))
    return { proximity, isAboveThreshold }
  } else {
    // For metrics where higher is better (e.g., Bank Reserves, RRP)
    // If current is above threshold, we're safe (show as 0% proximity to danger)
    // If current is below threshold, show how close we are to the threshold
    const isAboveThreshold = current >= threshold
    if (isAboveThreshold) {
      return { proximity: 0, isAboveThreshold: true }
    }
    // Below threshold - calculate proximity to danger
    if (threshold === 0) return { proximity: null, isAboveThreshold: false }
    const proximity = Math.max(0, Math.min(100, (current / threshold) * 100))
    return { proximity, isAboveThreshold: false }
  }
}

// Get color based on proximity and whether we're above threshold
const getProximityColor = (
  proximity: number | null,
  isAboveThreshold: boolean
): string => {
  if (proximity === null) return 'bg-gray-600'
  if (isAboveThreshold) return 'bg-green-500' // Above threshold = safe
  if (proximity >= 100) return 'bg-red-500'
  if (proximity >= 80) return 'bg-yellow-500'
  if (proximity >= 60) return 'bg-yellow-400'
  return 'bg-green-500'
}

interface ProximityIndicatorProps {
  current: number | null
  threshold: number
  isLowerBetter?: boolean
  formatValue: (val: number | null) => string
  proximityLabel: string
  thresholdLabel: string
  safeAboveThresholdLabel: string
}

const ProximityIndicator: React.FC<ProximityIndicatorProps> = ({
  current,
  threshold,
  isLowerBetter = false,
  formatValue,
  proximityLabel,
  thresholdLabel,
  safeAboveThresholdLabel,
}) => {
  const { proximity, isAboveThreshold } = calculateProximity(
    current,
    threshold,
    isLowerBetter
  )

  if (proximity === null) return null

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400">
          {isAboveThreshold
            ? safeAboveThresholdLabel
            : `${proximityLabel}: ${proximity.toFixed(0)}%`}
        </span>
        <span className="text-gray-400">
          {thresholdLabel}: {formatValue(threshold)}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getProximityColor(
            proximity,
            isAboveThreshold
          )}`}
          style={{
            width: isAboveThreshold ? '100%' : `${Math.min(100, proximity)}%`,
          }}
        />
      </div>
    </div>
  )
}

export default ProximityIndicator

