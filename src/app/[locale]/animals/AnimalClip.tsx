'use client'

import React, { useEffect, useRef } from 'react'

type AnimalClipProps = {
  src: string
  width: number
  height: number
  label: string
  eager?: boolean
}

const AnimalClip: React.FunctionComponent<AnimalClipProps> = ({
  src,
  width,
  height,
  label,
  eager = false,
}) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const start = () => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (reduceMotion) return
      void el.play().catch(() => {})
    }

    if (eager) {
      start()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        el.preload = 'auto'
        start()
        observer.disconnect()
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [eager])

  return (
    <video
      ref={ref}
      src={src}
      width={width}
      height={height}
      muted
      loop
      playsInline
      autoPlay={eager}
      preload={eager ? 'auto' : 'none'}
      aria-label={label}
      className="h-auto w-96 max-w-full rounded-lg"
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  )
}

export default AnimalClip
