'use client'

import React, { useEffect, useRef, useState } from 'react'

export function clipControlLabel(label: string, playing: boolean): string {
  return playing ? `Pause ${label}` : `Play ${label}`
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

type AnimalClipProps = {
  src: string
  poster: string
  width: number
  height: number
  label: string
  eager?: boolean
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7" aria-hidden="true">
    <path fill="currentColor" d="M8 5.5v13l11-6.5-11-6.5z" />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
    <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
  </svg>
)

const AnimalClip: React.FunctionComponent<AnimalClipProps> = ({
  src,
  poster,
  width,
  height,
  label,
  eager = false,
}) => {
  const ref = useRef<HTMLVideoElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // null until mount so the server HTML and the first client render match.
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null)
  const [playing, setPlaying] = useState(false)
  // The first clip's poster is in the HTML. The rest get the attribute as
  // they approach, so the browser does not download every still up front.
  // A lazy image covers those boxes until then.
  const [showPoster, setShowPoster] = useState(eager)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    // Wait until we know motion is allowed. Reduced-motion visitors use the button.
    if (!el || reduceMotion !== false) return

    const start = () => {
      el.preload = 'auto'
      void el.play().catch(() => {})
    }

    if (eager) {
      start()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        start()
        observer.disconnect()
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [eager, reduceMotion])

  useEffect(() => {
    if (eager || showPoster) return
    const box = boxRef.current
    if (!box) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShowPoster(true)
        observer.disconnect()
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(box)
    return () => observer.disconnect()
  }, [eager, showPoster])

  const togglePlayback = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      setShowPoster(true)
      el.preload = 'auto'
      void el.play().catch(() => {})
    } else {
      el.pause()
    }
  }

  return (
    <div ref={boxRef} className="relative w-96 max-w-full">
      <video
        ref={ref}
        src={src}
        poster={showPoster ? poster : undefined}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="block h-auto w-full rounded-lg"
        style={{ aspectRatio: `${width} / ${height}` }}
      />
      {!showPoster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          className="pointer-events-none absolute inset-0 h-full w-full rounded-lg object-cover"
        />
      ) : null}
      {reduceMotion ? (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={clipControlLabel(label, playing)}
          className={`absolute top-1/2 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg ${focusRing}`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      ) : null}
    </div>
  )
}

export default AnimalClip
