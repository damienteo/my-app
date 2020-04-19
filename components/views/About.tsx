import React from 'react'
import Layout from '../layout/Layout'
import { ExternalLink, Header, Paragraph } from '../common'

const AboutPage = () => {
  return (
    <Layout>
      <Header text="About" />
      <Paragraph>
        Hi, I am a hardworking peasant who enjoys working with intelligent
        machines. Previously, I was a police officer.
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
        As of the time of this writing, we are undergoing what is called a CCB (
        <ExternalLink
          url="https://www.straitstimes.com/singapore/a-new-normal"
          label="Covid-19 Circuit Breaker"
        />
        ) in Singapore, and the DPM has just announced the{' '}
        <ExternalLink
          url="https://www.singaporebudget.gov.sg/budget_2020/solidarity-budget"
          label="Solidarity Budget"
        />
        .
      </Paragraph>
      <Paragraph>
        I completed a coding boot camp a year ago, and am currently employed as
        a{' '}
        <ExternalLink
          url="https://en.wikipedia.org/wiki/Nerd"
          label="Junior Software Engineer"
        />
        . I can be contacted on{' '}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />{' '}
        and <ExternalLink url="https://github.com/damienteo" label="Github" />.
      </Paragraph>
    </Layout>
  )
}

export default AboutPage
