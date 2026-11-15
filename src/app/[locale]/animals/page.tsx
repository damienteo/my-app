import React from 'react'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'

import { Header, Paragraph } from '../components/common'
import AnimalClip from './AnimalClip'

export const metadata: Metadata = {
  title: 'Animals',
  description: 'Spotted while traveling',
}

// Intrinsic sizes of the H.264 clips. The page displays them at 384px
// (`w-96`); width and height keep the real aspect ratio so the box does
// not jump from a square placeholder when the video loads.
const animalClips = [
  { name: 'adult-goats', width: 570, height: 320 },
  { name: 'akita', width: 266, height: 472 },
  { name: 'baby-goat', width: 216, height: 384 },
  { name: 'cat', width: 410, height: 230 },
  { name: 'chameleon', width: 554, height: 312 },
  { name: 'chickens', width: 206, height: 366 },
  { name: 'chicks', width: 250, height: 444 },
  { name: 'china-monkey', width: 252, height: 448 },
  { name: 'cows', width: 226, height: 402 },
  { name: 'deer', width: 332, height: 590 },
  { name: 'dog', width: 594, height: 334 },
  { name: 'dolphine', width: 242, height: 430 },
  { name: 'goats', width: 260, height: 146 },
  { name: 'horse', width: 416, height: 234 },
  { name: 'kid-goat', width: 252, height: 448 },
  { name: 'millipede', width: 342, height: 608 },
  { name: 'monkey', width: 316, height: 562 },
  { name: 'nara-deer', width: 146, height: 260 },
  { name: 'rabbits', width: 322, height: 572 },
  { name: 'sheep', width: 330, height: 586 },
  { name: 'small-monkey', width: 200, height: 356 },
  { name: 'squirrel', width: 374, height: 210 },
  { name: 'tortoise', width: 168, height: 298 },
  { name: 'whale', width: 218, height: 388 },
]

const Animals: React.FunctionComponent = () => {
  const t = useTranslations('AnimalsPage')
  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col items-center space-y-4 px-2 sm:px-4">
        <div>
          <Header text={t('header')} />
          <Paragraph className="sm:mb-4">{t('description')}</Paragraph>{' '}
        </div>
        {animalClips.map((clip, index) => (
          <AnimalClip
            key={clip.name}
            src={`/animals/${clip.name}.mp4`}
            poster={`/animals/${clip.name}.jpg`}
            width={clip.width}
            height={clip.height}
            label={clip.name}
            eager={index === 0}
          />
        ))}
      </div>
    </>
  )
}

export default Animals
