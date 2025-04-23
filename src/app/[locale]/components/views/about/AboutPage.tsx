import React from 'react'
import { useTranslations } from 'next-intl'

import { ExternalLink, Header, Paragraph } from '../../common'

const AboutPage = () => {
  const t = useTranslations('AboutPage')
  return (
    <div className="max-w-3xl mx-auto px-4 md:py-8 text-justify">
      <Header text={t('header')} />
      <Paragraph>{t('starter')}</Paragraph>
      <Paragraph>
        {t('library.start')}{' '}
        <ExternalLink url="https://reactjs.org/" label="React.js" />
        , <ExternalLink url="https://nextjs.org/" label="Next.js" />,{' '}
        {t('library.mid')}{' '}
        <ExternalLink url="https://tailwindcss.com/" label="Tailwind CSS" /> (
        {t('library.previously')}{' '}
        <ExternalLink url="https://material-ui.com/" label="Material UI" />)
        {t('library.end')} {t('programmingLanguage.start')}
        <ExternalLink
          url="https://www.typescriptlang.org/"
          label="Typescript"
        />
        ), HTML, {t('programmingLanguage.connector')} CSS
        {t('programmingLanguage.end')} {t('testing.start')}
        <ExternalLink url="https://jestjs.io/" label="Jest" />
        {t('testing.end')}
      </Paragraph>
      <Paragraph>
        {t('learning.solidity.start')}
        <ExternalLink
          url="https://docs.soliditylang.org/"
          label="Solidity"
        />{' '}
        {t('learning.solidity.end')}({t('learning.github.start')}
        <ExternalLink
          url="https://github.com/damienteo/learning-smart-contracts"
          label={'GitHub ' + t('learning.github.repo')}
        />
        {t('learning.github.end')}){t('learning.japanese')}
      </Paragraph>
      <Paragraph>
        {t('contact.start')}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />{' '}
        {t('contact.connector')}
        <ExternalLink url="https://github.com/damienteo" label="Github" />
        {t('contact.end')}
      </Paragraph>
    </div>
  )
}

export default AboutPage
