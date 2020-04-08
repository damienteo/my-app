import React from 'react'
import Layout from '../layout/layout'
import Header from '../common/header'
import Paragraph from '../common/paragraph'
import ExternalLink from '../common/externalLink'

const CPFCalculatorPage = () => {
  return (
    <>
      <Layout>
        <Header text="CPF Calculator" />
        <Paragraph>
          This page will allow people to calculate CPF during 55 an 65, and
          checkhow much they can withdraw
        </Paragraph>
        <Paragraph>
          The user should be able to input current amounts in their CPF OA and
          SA
        </Paragraph>
        <Paragraph>
          The user should be able to input the date at which they turn 55 and 65
        </Paragraph>
        <Paragraph>
          The user should be able to input their current monthly contributions
          to OA and SA
        </Paragraph>
        <Paragraph>
          The FE will calculate for them how much is in their SA and OA at the
          age of 55.
        </Paragraph>
        <Paragraph>
          The FE will calculate for them how much is in their RA at the age of
          65.
        </Paragraph>
        <Paragraph>
          The FE will calculate for them how much they can withdraw at the age
          of 55.
        </Paragraph>
        <Paragraph>
          The FE will calculate for them how much they can withdraw at the age
          of 65.
        </Paragraph>
        <Paragraph>
          The user can press a button, whcih will show a new panel below. This
          new panel will show how much more they can get if they transfer all
          sums to SA.
        </Paragraph>
        <Paragraph>
          The user can account for usage of OA sums to a HDB flat at a certain
          future date.
        </Paragraph>
        <Paragraph>
          The user can add in the pledging of their HDB value.
        </Paragraph>
        <Paragraph>
          The user can check how much they will need to pay back to CPF when
          they sell the HDB flat.
        </Paragraph>
        <Paragraph>
          The user can download an excel sheet to store all data.
        </Paragraph>
        <Paragraph>
          The user can upload an excel sheet to read previous data.
        </Paragraph>

        <Paragraph>
          This site was created with a mixture of:{' '}
          <ExternalLink url="https://reactjs.org/" label="React.js" />
          , <ExternalLink url="https://nextjs.org/" label="Next.js" />, and{' '}
          <ExternalLink url="https://material-ui.com/" label="Material UI" />.
          Essentially, it's just Javascript, HTML, and CSS.
        </Paragraph>
      </Layout>
    </>
  )
}

export default CPFCalculatorPage
