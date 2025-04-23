import React from 'react'
import Layout from './components/layout/Layout'
import { ExternalLink, Header, Paragraph } from './components/common'

const AboutPage = () => {
  return (
    // <Layout
    //   title="About Damien Teo"
    //   description="Damien Teo is a peasant who enjoys working with intelligent
    // machines. Previously, he was a police officer. Now, he work in the tech
    // industry."
    // >
    <>
      <Header text="About" />
      <Paragraph>
        Hi, I am a peasant who enjoys working with intelligent machines.
        Previously, I was a police officer. Now, I work in the tech industry.
      </Paragraph>
      <Paragraph>
        This site was created with a mixture of:{' '}
        <ExternalLink url="https://reactjs.org/" label="React.js" />
        , <ExternalLink url="https://nextjs.org/" label="Next.js" />, and{' '}
        <ExternalLink url="https://material-ui.com/" label="Material UI" />.
        Essentially, it`&apos;`s just Javascript (with{' '}
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
        <ExternalLink url="https://github.com/damienteo" label="Github" />.
      </Paragraph>
    </>
  )
}

export default AboutPage
