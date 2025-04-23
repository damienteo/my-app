import React from 'react'
import { useTranslations } from 'next-intl'

import { ExternalLink, Header, Paragraph } from '../../common'

const AboutPage = () => {
  const t = useTranslations('HomePage')
  return (
    // <Layout
    //   title="About Damien Teo"
    //   description="Damien Teo is a peasant who enjoys working with intelligent
    // machines. Previously, he was a police officer. Now, he work in the tech
    // industry."
    // >
    <div className="max-w-3xl mx-auto px-4 md:py-8 text-justify">
      <Header text="About" />
      <Paragraph>{t('title')}</Paragraph>
      <Paragraph>
        Hi, I am a peasant who enjoys working with intelligent machines.
        Previously, I was a police officer. Now, I work in the tech industry.
      </Paragraph>
      <Paragraph>
        This site was created with a mixture of:{' '}
        <ExternalLink url="https://reactjs.org/" label="React.js" />
        , <ExternalLink url="https://nextjs.org/" label="Next.js" />, and{' '}
        <ExternalLink url="https://material-ui.com/" label="Material UI" />.
        Essentially, it's just Javascript (with{' '}
        <ExternalLink
          url="https://www.typescriptlang.org/"
          label="Typescript"
        />
        ), HTML, and CSS. Testing is done with{' '}
        <ExternalLink url="https://jestjs.io/" label="Jest" />.
      </Paragraph>
      <Paragraph>
        Currently also learning{' '}
        <ExternalLink url="https://docs.soliditylang.org/" label="Solidity" />{' '}
        (documenting my progress in this{' '}
        <ExternalLink
          url="https://github.com/damienteo/learning-smart-contracts"
          label="Github Repo"
        />
        ).
      </Paragraph>
      <Paragraph>
        I can be contacted on{' '}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />{' '}
        and <ExternalLink url="https://github.com/damienteo" label="Github" />.
      </Paragraph>
    </div>
  )
}

export default AboutPage
