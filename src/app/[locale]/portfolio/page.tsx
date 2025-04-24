import React from 'react'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { ExternalLink, Header, Paragraph } from '../components/common'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Here are some small side projects which Damien Teo has previously done.',
}

const PortfolioPage: React.FunctionComponent = () => {
  const t = useTranslations('PortfolioPage')
  return (
    <>
      <div className="px-2 sm:px-4">
        <Header text={t('header')} />
        <Paragraph className="sm:mb-4">
          {t('resume.start')}
          <ExternalLink
            url="https://www.linkedin.com/in/damien-teo/"
            label="LinkedIn"
          />
          {t('resume.end')}
        </Paragraph>
      </div>

      {/* Payments Agreement Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 mb-8 text-justify">
        <div className="text-center">
          <img
            src="/payments-agreement.png"
            alt="Payments Agreement Site"
            className="w-[95%] object-cover mx-auto mt-2 rounded-sm"
          />
        </div>
        <div className="px-2 sm:pl-5">
          <Paragraph>
            {t('hackathon.start')}
            <ExternalLink
              url="https://www.linkedin.com/posts/gaogao_hackathon2023-hackathon-blockchain-activity-7078000311738511360-orum"
              label={t('hackathon.won')}
            />
            {t('hackathon.end')}
          </Paragraph>
          <Paragraph>
            {t('projectOverview.start')}
            <ExternalLink
              url="https://milestone-payments.vercel.app/"
              label={t('projectOverview.project')}
            />{' '}
            {t('projectOverview.end')}
          </Paragraph>
          <Paragraph>
            -{' '}
            <ExternalLink
              url="https://mumbai.polygonscan.com/address/0xd7906deE9239509EF4564839a25460Bb8F97D2e6#code"
              label={t('projectComponents.factory')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://mumbai.polygonscan.com/address/0x9536fd0322Ab322110C4D0621b46dC936Ee9fCaa#code"
              label={t('projectComponents.initializer')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://mumbai.polygonscan.com/address/0x60BF7eba37b2A914EcEB8f228c302a1D02aDf6e2#code"
              label={t('projectComponents.proxy')}
            />
            <br />
          </Paragraph>
        </div>
      </div>

      {/* ThunderDome Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-justify">
        <div className="text-center">
          <img
            src="/thunderdome.png"
            alt="ThunderDome Chart"
            className="w-[95%] object-cover mx-auto mt-2 rounded-sm"
          />
        </div>
        <div className="px-2 sm:pl-5">
          <Paragraph>
            {t('thunderdomeIntro.start')}
            <ExternalLink
              url="https://thunderdome-fe.vercel.app/"
              label={t('thunderdomeIntro.thunderdome')}
            />{' '}
            {t('thunderdomeIntro.end')}
          </Paragraph>
          <Paragraph>{t('thunderdomeDetails')}</Paragraph>
          <Paragraph>
            -{' '}
            <ExternalLink
              url="https://github.com/damienteo/thunderdome-fe"
              label={t('thunderdomeLinks.fe')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://thunderdome-be.onrender.com/api/v1/products/"
              label={t('thunderdomeLinks.be-link')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://github.com/damienteo/thunderdome-be"
              label={t('thunderdomeLinks.be')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://github.com/damienteo/thunderdome-contracts"
              label={t('thunderdomeLinks.sc')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://goerli.etherscan.io/address/0xfF0Cc93e85150e18BA66102469d6e3613dC8Ef9B#code"
              label={t('thunderdomeLinks.token')}
            />
            <br />-{' '}
            <ExternalLink
              url="https://goerli.etherscan.io/address/0x16377628d5c50aE40951D63134572AB32395677C#code"
              label={t('thunderdomeLinks.nft')}
            />
            <br />
          </Paragraph>
        </div>
      </div>

      {/* Budget Planner Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-justify">
        <div className="text-center">
          <img
            src="/budget-planner.png"
            alt="Budget Planner Chart"
            className="w-[95%] object-cover mx-auto mt-2 rounded-sm"
          />
        </div>
        <div className="px-2 sm:pl-5">
          <Paragraph>
            {t('budgetPlanner.start')}{' '}
            <ExternalLink
              url="https://budget-planner-frontend.vercel.app/"
              label={t('budgetPlanner.name')}
            />{' '}
            {t('budgetPlanner.end')}
          </Paragraph>
          <Paragraph>
            {t('budgetPlannerDetails')} (
            <ExternalLink
              url="https://github.com/damienteo/WDI-Capstone-Frontend-Budget-Planner"
              label={t('budgetPlanner.fe')}
            />
            {t('budgetPlanner.and')}
            <ExternalLink
              url="https://github.com/damienteo/WDI-Capstone-Backend-Budget-Planner"
              label={t('budgetPlanner.be')}
            />
            )
          </Paragraph>
        </div>
      </div>

      {/* Fireman Game Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-justify">
        <div className="text-center">
          <img
            src="/fireman-game.png"
            alt="Fireman Game Image"
            className="w-[95%] object-cover mx-auto mt-2 rounded-sm"
          />
        </div>
        <div className="px-2 sm:pl-5">
          <Paragraph>
            {t('firemanGame.start')} (
            <ExternalLink
              url="https://fireman.vercel.app/"
              label="The Fireman"
            />
            ){t('firemanGame.end')}
          </Paragraph>
          <Paragraph>
            {t('firemanDetails.start')}(
            <ExternalLink
              url="https://github.com/damienteo/WDI-Project-1-The-Fireman"
              label={t('firemanDetails.github')}
            />
            ){t('firemanDetails.end')}
          </Paragraph>
        </div>
      </div>
    </>
  )
}

export default PortfolioPage
