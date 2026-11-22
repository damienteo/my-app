'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import AnimalClip from './AnimalClip'
import {
  animalClips,
  animalPoster,
  animalSrc,
  type AnimalClipSource,
} from './clips'
import { clipControlLabel, wrapClipIndex } from './clipLogic'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  PauseIcon,
  PlayIcon,
} from './icons'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const roundButton = `flex h-11 w-11 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900/85 text-ink shadow-lg hover:border-zinc-400 hover:bg-zinc-800 ${focusRing}`

const closeButton = `flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white text-zinc-950 shadow-lg hover:bg-zinc-200 ${focusRing}`

// The open clip is React state, not `?clip=`. The dialog only exists on
// the client, and a query param would make the Back button close it
// instead of leaving the page.
const AnimalsGallery: React.FunctionComponent = () => {
  const t = useTranslations('AnimalsPage')
  const reduceMotion = usePrefersReducedMotion()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const tileButtons = useRef<Array<HTMLButtonElement | null>>([])
  const openIndexRef = useRef<number | null>(null)
  const scrollLockRef = useRef({ x: 0, y: 0 })
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const ignoreClickRef = useRef(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const openAt = (index: number) => {
    scrollLockRef.current = { x: window.scrollX, y: window.scrollY }
    openIndexRef.current = index
    setOpenIndex(index)
  }

  const step = (delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return null
      const next = wrapClipIndex(current, delta, animalClips.length)
      openIndexRef.current = next
      return next
    })
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || openIndex === null || dialog.open) return
    dialog.showModal()
  }, [openIndex])

  useEffect(() => {
    if (openIndex === null) return
    const html = document.documentElement
    const body = document.body
    const previousHtml = html.style.overflow
    const previousBody = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previousHtml
      body.style.overflow = previousBody
    }
  }, [openIndex])

  const onDialogClose = () => {
    const index = openIndexRef.current
    const saved = scrollLockRef.current
    openIndexRef.current = null
    setOpenIndex(null)
    if (index === null) return
    // Closing a dialog moves focus back to the tile. In a CSS column
    // layout that focus scrolls the page to the wrong place, so put the
    // scroll back where it was when the lightbox opened. If the tile the
    // visitor ended on is actually off screen, then scroll to it.
    const place = () => {
      const button = tileButtons.current[index]
      if (!button) return
      button.focus({ preventScroll: true })
      window.scrollTo(saved.x, saved.y)
      const rect = button.getBoundingClientRect()
      const onScreen = rect.bottom > 80 && rect.top < window.innerHeight - 24
      if (onScreen) return
      window.scrollTo(saved.x, Math.max(0, window.scrollY + rect.top - 96))
    }
    window.requestAnimationFrame(() => {
      place()
      window.requestAnimationFrame(place)
    })
  }

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }

  const onTouchStart = (event: React.TouchEvent<HTMLDialogElement>) => {
    const touch = event.changedTouches[0]
    if (!touch) return
    const target = event.target
    if (target instanceof Element && target.closest('button')) return
    swipeStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLDialogElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    const touch = event.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return
    // A swipe also synthesizes a click. Ignore that click so it does not
    // close the dialog, and clear the flag if no click follows.
    ignoreClickRef.current = true
    window.setTimeout(() => {
      ignoreClickRef.current = false
    }, 400)
    step(dx < 0 ? 1 : -1)
  }

  const closeIfBackdrop = (event: React.MouseEvent<HTMLElement>) => {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false
      return
    }
    const target = event.target
    if (!(target instanceof Element)) return
    // The dark area closes the dialog. Buttons and the video do not.
    if (target.closest('button, video')) return
    dialogRef.current?.close()
  }

  const openClip = openIndex === null ? null : animalClips[openIndex]
  const openLabel = openClip ? t(`names.${openClip.name}`) : ''
  const counter =
    openIndex === null
      ? ''
      : t('counter', { current: openIndex + 1, total: animalClips.length })

  return (
    <>
      <ul
        aria-label={t('gallery')}
        className="m-0 mt-4 list-none columns-2 gap-3 p-0 md:columns-3 lg:columns-4"
      >
        {animalClips.map((clip, index) => (
          // inline-block keeps the tops of the columns aligned. A plain
          // block's bottom margin can be split by the column break, which
          // pushes the next column down.
          <li
            key={clip.name}
            className="mb-3 inline-block w-full break-inside-avoid"
          >
            <AnimalClip
              name={clip.name}
              label={t(`names.${clip.name}`)}
              width={clip.width}
              height={clip.height}
              eager={index === 0}
              suspended={openIndex !== null}
              reduceMotion={reduceMotion}
              onOpen={() => openAt(index)}
              buttonRef={(node) => {
                tileButtons.current[index] = node
              }}
            />
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="animal-lightbox touch-pan-y"
        aria-labelledby="animal-lightbox-title"
        aria-describedby="animal-lightbox-hint"
        onClose={onDialogClose}
        onKeyDown={onDialogKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={closeIfBackdrop}
      >
        <p id="animal-lightbox-hint" className="sr-only">
          {t('hint')}
        </p>
        {openClip ? (
          <div className="flex h-full w-full flex-col px-4 pt-4 pb-4">
            <div
              aria-live="polite"
              className="z-20 mb-3 flex shrink-0 items-center justify-between gap-4"
            >
              <h2
                id="animal-lightbox-title"
                className="min-w-0 text-xl font-semibold leading-tight text-white"
              >
                {openLabel}
              </h2>
              <div className="flex shrink-0 items-center gap-3">
                <p className="font-mono text-sm tabular-nums text-zinc-300">
                  {counter}
                </p>
                <button
                  type="button"
                  className={closeButton}
                  aria-label={t('close')}
                  onClick={() => dialogRef.current?.close()}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
              <div className="relative max-h-full" style={frameStyle(openClip)}>
                <div className="absolute inset-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                  <LightboxVideo
                    key={openClip.name}
                    clip={openClip}
                    label={openLabel}
                    reduceMotion={reduceMotion}
                  />
                </div>
                <button
                  type="button"
                  className={`${roundButton} absolute top-1/2 left-2 z-10 -translate-y-1/2`}
                  aria-label={t('previous')}
                  onClick={() => step(-1)}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  className={`${roundButton} absolute top-1/2 right-2 z-10 -translate-y-1/2`}
                  aria-label={t('next')}
                  onClick={() => step(1)}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}

// 6.5rem is the title row plus the dialog's padding. The min() picks the
// smaller of the horizontal budget and the width that makes the clip
// exactly as tall as the vertical budget. Portrait clips are limited by
// height and landscape clips by width, so the frame stays under the title.
function frameStyle(clip: AnimalClipSource): React.CSSProperties {
  return {
    aspectRatio: `${clip.width} / ${clip.height}`,
    width: `min(calc(100vw - 3rem), calc((100dvh - 6.5rem) * ${clip.width} / ${clip.height}))`,
  }
}

const LightboxVideo: React.FunctionComponent<{
  clip: AnimalClipSource
  label: string
  reduceMotion: boolean | null
}> = ({ clip, label, reduceMotion }) => {
  const t = useTranslations('AnimalsPage')
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

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
    if (!el || reduceMotion !== false) return
    el.muted = true
    void el.play().catch(() => {})
  }, [reduceMotion])

  const togglePlayback = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) void el.play().catch(() => {})
    else el.pause()
  }

  const playMessages = {
    play: String(t.raw('play')),
    pause: String(t.raw('pause')),
  }

  return (
    <div className="absolute inset-0">
      <video
        ref={ref}
        src={animalSrc(clip.name)}
        poster={animalPoster(clip.name)}
        width={clip.width}
        height={clip.height}
        muted
        loop
        playsInline
        preload={reduceMotion === false ? 'auto' : 'none'}
        aria-label={label}
        className="h-full w-full object-contain"
        style={{ aspectRatio: `${clip.width} / ${clip.height}` }}
      />
      {reduceMotion ? (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={clipControlLabel(label, playing, playMessages)}
          className={`absolute top-1/2 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg ${focusRing}`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      ) : null}
    </div>
  )
}

export default AnimalsGallery
