import React from 'react'
import { ExternalLink, Header, Paragraph } from '../components/common'

// Tailwind CSS equivalents for the styles from useStyles:
// - image: Applied width and objectFit styles
// - imageWrapper: Applied text-align center style
// - sectionWrapper: Applied margin
// - textWrapper: Applied padding-left and responsive padding for larger screens

const PortfolioPage: React.FunctionComponent = () => {
  return (
    // <Layout
    //   title="Damien Teo's Portfolio"
    //   description="Here are some small side projects which Damien Teo has previously done."
    // >
    <>
      <Header text="Portfolio" />
      <Paragraph>
        For my resume, you may refer to my{' '}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />{' '}
        profile
      </Paragraph>

      {/* Payments Agreement Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
        <div className="text-center">
          <img
            src="/payments-agreement.png"
            alt="Payments Agreement Site"
            className="w-[95%] object-cover mx-auto"
          />
        </div>
        <div className="pl-0 sm:pl-5">
          <Paragraph>
            I recently participated in blockchain.hack(). I{' '}
            <ExternalLink
              url="https://www.linkedin.com/posts/gaogao_hackathon2023-hackathon-blockchain-activity-7078000311738511360-orum"
              label="won"
            />{' '}
            the main prize for the problem statement: "How can blockchain help
            B2B transactions for banking?".
          </Paragraph>
          <Paragraph>
            My{' '}
            <ExternalLink
              url="https://milestone-payments.vercel.app/"
              label="project"
            />{' '}
            deals with the usage of Merkle proofs to initially obscure payment
            details, yet enforce payment outcomes with transparent and immutable
            rules. Factory-clone contracts also cut down the cost of deploying
            each payment agreement by ~70%.
          </Paragraph>
          <Paragraph>
            -{' '}
            <ExternalLink
              url="https://mumbai.polygonscan.com/address/0xd7906deE9239509EF4564839a25460Bb8F97D2e6#code"
              label="Factory Contract for cloning agreements"
            />
            <br />-{' '}
            <ExternalLink
              url="https://mumbai.polygonscan.com/address/0x9536fd0322Ab322110C4D0621b46dC936Ee9fCaa#code"
              label="Initializer contract with agreement logic"
            />
            <br />-{' '}
            <ExternalLink
              url="https://mumbai.polygonscan.com/address/0x60BF7eba37b2A914EcEB8f228c302a1D02aDf6e2#code"
              label="Minimal proxy contract (clone) which uses logic from the Initializer contract"
            />
            <br />
          </Paragraph>
        </div>
      </div>

      {/* ThunderDome Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
        <div className="text-center">
          <img
            src="/thunderdome.png"
            alt="ThunderDome Chart"
            className="w-[95%] object-cover mx-auto"
          />
        </div>
        <div className="pl-0 sm:pl-5">
          <Paragraph>
            Current side project is{' '}
            <ExternalLink
              url="https://thunderdome-fe.vercel.app/"
              label="ThunderDome"
            />{' '}
            (as of Oct 2022).
          </Paragraph>
          <Paragraph>
            I am currently learning solidity, so I thought it would be a fun
            project to run on the Ethereum Goerli testnet. Users will be able to
            buy NFTs offered. Eventually, they should be able to sell bought
            NFTs on the local marketplace, deposit NFTs for loyalty points, and
            even a lucky draw.
          </Paragraph>
          <Paragraph>
            -{' '}
            <ExternalLink
              url="https://github.com/damienteo/thunderdome-fe"
              label="Frontend Repo"
            />
            <br />-{' '}
            <ExternalLink
              url="https://thunderdome-be.onrender.com/api/v1/products/"
              label="Backend Link"
            />
            <br />-{' '}
            <ExternalLink
              url="https://github.com/damienteo/thunderdome-be"
              label="Backend Repo"
            />
            <br />-{' '}
            <ExternalLink
              url="https://github.com/damienteo/thunderdome-contracts"
              label="Smart Contracts Repo"
            />
            <br />-{' '}
            <ExternalLink
              url="https://goerli.etherscan.io/address/0xfF0Cc93e85150e18BA66102469d6e3613dC8Ef9B#code"
              label="Token Sale Contract"
            />
            <br />-{' '}
            <ExternalLink
              url="https://goerli.etherscan.io/address/0x16377628d5c50aE40951D63134572AB32395677C#code"
              label="NFT Contract"
            />
            <br />
          </Paragraph>
        </div>
      </div>

      {/* Budget Planner Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
        <div className="text-center">
          <img
            src="/budget-planner.png"
            alt="Budget Planner Chart"
            className="w-[95%] object-cover mx-auto"
          />
        </div>
        <div className="pl-0 sm:pl-5">
          <Paragraph>
            One of my major side-projects is the{' '}
            <ExternalLink
              url="https://budget-planner-frontend.vercel.app/"
              label="Budget Planner"
            />{' '}
            (March 2019).
          </Paragraph>
          <Paragraph>
            This was my Capstone Project during my participation in General
            Assembly's Web Development Immersive, now known as the{' '}
            <ExternalLink
              url="https://generalassemb.ly/education/software-engineering-immersive/singapore"
              label="Software Engineering
              Immersive"
            />
            .
          </Paragraph>
        </div>
      </div>

      {/* Fireman Game Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
        <div className="text-center">
          <img
            src="/fireman-game.png"
            alt="Fireman Game Image"
            className="w-[95%] object-cover mx-auto"
          />
        </div>
        <div className="pl-0 sm:pl-5">
          <Paragraph>
            Created a game (
            <ExternalLink
              url="https://fireman.vercel.app/"
              label="The Fireman"
            />
            )
          </Paragraph>
          <Paragraph>
            This was made with vanilla HTML, JavaScript, and CSS (
            <ExternalLink
              url="https://github.com/damienteo/WDI-Project-1-The-Fireman"
              label="GitHub Repo"
            />
            ).
          </Paragraph>
        </div>
      </div>
    </>
  )
}

export default PortfolioPage
