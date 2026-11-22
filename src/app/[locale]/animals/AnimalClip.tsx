'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  accentCircleButton,
  focusRing,
  focusRingInset,
} from '../components/common/classes'
import { animalPoster, animalSrc } from './clips'
import { clipControlLabel, fillClipName } from './clipLogic'
import { PauseIcon, PlayIcon } from './icons'

// The observer only tells us that visibility changed. Whether the tile
// should play is decided from its box, so a dialog opening (which can
// make the observer report a stale "in view") cannot start off-screen clips.
const VIEW_MARGIN = 100

function isNearViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return (
    rect.bottom > -VIEW_MARGIN && rect.top < window.innerHeight + VIEW_MARGIN
  )
}

const playButtonClass = `absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 ${accentCircleButton} ${focusRing}`

type AnimalClipProps = {
  name: string
  label: string
  width: number
  height: number
  eager?: boolean
  suspended: boolean
  reduceMotion: boolean | null
  onOpen: () => void
  buttonRef: (node: HTMLButtonElement | null) => void
}

const AnimalClip: React.FunctionComponent<AnimalClipProps> = ({
  name,
  label,
  width,
  height,
  eager = false,
  suspended,
  reduceMotion,
  onOpen,
  buttonRef,
}) => {
  const t = useTranslations('AnimalsPage')
  const videoRef = useRef<HTMLVideoElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const suspendedRef = useRef(suspended)
  const reduceMotionRef = useRef(reduceMotion)
  // Set when the visitor presses play under reduced motion. Scrolling away
  // pauses the file, but this stays true so it can continue when it returns.
  const userWantsPlayRef = useRef(false)
  // The MP4 URL is assigned only when the clip is actually going to play.
  const attachedRef = useRef(false)
  const syncRef = useRef<() => void>(() => {})
  const [playing, setPlaying] = useState(false)

  const src = animalSrc(name)
  const poster = animalPoster(name)

  useEffect(() => {
    syncRef.current = () => {
      const el = videoRef.current
      if (!el) return
      if (reduceMotionRef.current === null) return

      if (suspendedRef.current) {
        if (!el.paused) el.pause()
        return
      }

      const box = boxRef.current
      const visible = box ? isNearViewport(box) : false
      const autoplay = reduceMotionRef.current === false
      const shouldPlay = visible && (autoplay || userWantsPlayRef.current)

      if (!shouldPlay) {
        if (!el.paused) el.pause()
        return
      }

      if (!attachedRef.current) {
        attachedRef.current = true
        // Same URL as the lazy <img>, so a tile already on screen reuses
        // that JPEG instead of downloading it twice. `src` is the moment
        // the browser is allowed to fetch the MP4.
        el.poster = poster
        el.preload = 'auto'
        el.muted = true
        el.src = src
      }

      if (el.paused) void el.play().catch(() => {})
    }
  }, [poster, src])

  useEffect(() => {
    const el = videoRef.current
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
    reduceMotionRef.current = reduceMotion
    syncRef.current()
  }, [reduceMotion])

  useEffect(() => {
    suspendedRef.current = suspended
    syncRef.current()
  }, [suspended])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return

    const observer = new IntersectionObserver(() => syncRef.current(), {
      // A short margin starts the clip just before it scrolls in, and
      // pauses it once that zone has been left, so off-screen tiles do
      // not keep decoding.
      rootMargin: '100px 0px',
      threshold: 0.01,
    })
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const togglePlayback = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      userWantsPlayRef.current = true
      syncRef.current()
      return
    }
    userWantsPlayRef.current = false
    el.pause()
  }

  const playMessages = {
    play: String(t.raw('play')),
    pause: String(t.raw('pause')),
  }

  return (
    <div
      ref={boxRef}
      className="animal-tile relative w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* Plain <img>, not next/image: the still's URL has to match the
          video poster exactly so the browser can reuse one JPEG. Native
          lazy loading is what keeps the off-screen stills out of the
          first paint. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <video
        ref={videoRef}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${
          playing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
      <button
        type="button"
        ref={buttonRef}
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={fillClipName(String(t.raw('openClip')), label)}
        className={`absolute inset-0 z-10 rounded-lg ${focusRingInset}`}
      />
      <span
        aria-hidden="true"
        className="animal-caption pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-zinc-950/80 via-zinc-950/35 to-transparent px-2.5 pt-8 pb-2 font-mono text-xs text-zinc-100"
      >
        <span className="block truncate">{label}</span>
      </span>
      {reduceMotion ? (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={clipControlLabel(label, playing, playMessages)}
          className={playButtonClass}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      ) : null}
    </div>
  )
}

export default AnimalClip
