import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { generatePageMetadata } from '../../../lib/pageMetadata'
import { ExternalLink, Paragraph } from '../components/common'
import PageContainer from '../components/layout/PageContainer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return generatePageMetadata({ params, page: 'portfolio' })
}

const PortfolioPage: React.FunctionComponent = () => {
  const t = useTranslations('PortfolioPage')
  return (
    <PageContainer title={t('header')}>
      <Paragraph className="sm:mb-4">
        {t('resume.start')}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />
        {t('resume.end')}
      </Paragraph>

      {/* Payments Agreement Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 mb-8 text-justify">
        <div className="text-center">
          <Image
            src="/payments-agreement.png"
            alt="Payments Agreement Site"
            width={2850}
            height={1536}
            priority
            sizes="(min-width: 640px) 480px, 92vw"
            className="mx-auto mt-2 h-auto w-[95%] rounded-sm object-cover"
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
          <Image
            src="/thunderdome.png"
            alt="ThunderDome Chart"
            width={2872}
            height={1586}
            sizes="(min-width: 640px) 480px, 92vw"
            className="mx-auto mt-2 h-auto w-[95%] rounded-sm object-cover"
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
          <Image
            src="/budget-planner.png"
            alt="Budget Planner Chart"
            width={1277}
            height={826}
            sizes="(min-width: 640px) 480px, 92vw"
            className="mx-auto mt-2 h-auto w-[95%] rounded-sm object-cover"
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
          <Image
            src="/fireman-game.png"
            alt="Fireman Game Image"
            width={1976}
            height={1032}
            sizes="(min-width: 640px) 480px, 92vw"
            className="mx-auto mt-2 h-auto w-[95%] rounded-sm object-cover"
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
    </PageContainer>
  )
}

export default PortfolioPage
