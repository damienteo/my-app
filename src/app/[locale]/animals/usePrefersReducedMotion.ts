'use client'

import { useEffect, useState } from 'react'

/** `null` until mount, so the server HTML and the first client render match.
 *  The play button is drawn only after we know the preference is reduce.
 */
export function usePrefersReducedMotion(): boolean | null {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return reduceMotion
}
