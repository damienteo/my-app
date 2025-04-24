import React from 'react'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Header, Paragraph } from '../components/common'

export const metadata: Metadata = {
  title: 'Animals',
  description: 'Spotted while traveling',
}

const animalGifs = [
  'adult-goats.gif',
  'akita.gif',
  'baby-goat.gif',
  'cat.gif',
  'chameleon.gif',
  'chickens.gif',
  'chicks.gif',
  'china-monkey.gif',
  'cows.gif',
  'deer.gif',
  'dog.gif',
  'dolphine.gif',
  'goats.gif',
  'horse.gif',
  'kid-goat.gif',
  'millipede.gif',
  'monkey.gif',
  'nara-deer.gif',
  'rabbits.gif',
  'sheep.gif',
  'small-monkey.gif',
  'squirrel.gif',
  'tortoise.gif',
  'whale.gif',
]

const Animals: React.FunctionComponent = () => {
  const t = useTranslations('AnimalsPage')
  return (
    <>
      <div className="flex flex-col items-center space-y-4 max-w-xl px-2 sm:px-4 mx-auto">
        <div>
          <Header text={t('header')} />
          <Paragraph className="sm:mb-4">{t('description')}</Paragraph>{' '}
        </div>
        {/* Animal GIFs */}
        {animalGifs.map((gif) => (
          <Image
            key={gif}
            src={`/animals/${gif}`}
            alt={gif.replace('.gif', '')}
            width={384} // Equivalent to w-96
            height={384} // Maintains aspect ratio
            className="rounded-lg"
            unoptimized
          />
        ))}
      </div>
    </>
  )
}

export default Animals
