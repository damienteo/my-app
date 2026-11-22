export const LINK_TYPES = ['live', 'code', 'contracts', 'api'] as const

export type PortfolioLinkType = (typeof LINK_TYPES)[number]

export type PortfolioProjectId =
  | 'mashikoPottery'
  | 'paymentsAgreement'
  | 'thunderdome'
  | 'budgetPlanner'
  | 'fireman'

export type PortfolioLink = {
  type: PortfolioLinkType
  url: string
  labelKey: string
  archivedTestnet?: boolean
}

export type PortfolioProject = {
  id: PortfolioProjectId
  year: number
  image: {
    src: string
    width: number
    height: number
    sizes: string
  }
  badge?: {
    labelKey: 'hackathonWinner'
    url: string
  }
  links: readonly PortfolioLink[]
}

export type PortfolioLinkGroup = {
  type: PortfolioLinkType
  links: readonly PortfolioLink[]
}

/** Same sizes the original portfolio screenshots used. */
export const PORTFOLIO_IMAGE_SIZES = '(min-width: 640px) 480px, 92vw'

export const portfolioProjects: readonly PortfolioProject[] = [
  {
    id: 'mashikoPottery',
    year: 2025,
    image: {
      src: '/mashiko-pottery.png',
      width: 1440,
      height: 900,
      sizes: PORTFOLIO_IMAGE_SIZES,
    },
    links: [
      {
        type: 'live',
        url: 'https://mashiko-pottery.vercel.app',
        labelKey: 'live',
      },
      {
        type: 'code',
        url: 'https://github.com/damienteo/mashiko-pottery',
        labelKey: 'code',
      },
    ],
  },
  {
    id: 'paymentsAgreement',
    year: 2023,
    image: {
      src: '/payments-agreement.png',
      width: 2850,
      height: 1536,
      sizes: PORTFOLIO_IMAGE_SIZES,
    },
    badge: {
      labelKey: 'hackathonWinner',
      url: 'https://www.linkedin.com/posts/gaogao_hackathon2023-hackathon-blockchain-activity-7078000311738511360-orum',
    },
    links: [
      {
        type: 'live',
        url: 'https://milestone-payments.vercel.app/',
        labelKey: 'live',
      },
      {
        type: 'contracts',
        url: 'https://mumbai.polygonscan.com/address/0xd7906deE9239509EF4564839a25460Bb8F97D2e6#code',
        labelKey: 'factory',
        archivedTestnet: true,
      },
      {
        type: 'contracts',
        url: 'https://mumbai.polygonscan.com/address/0x9536fd0322Ab322110C4D0621b46dC936Ee9fCaa#code',
        labelKey: 'initializer',
        archivedTestnet: true,
      },
      {
        type: 'contracts',
        url: 'https://mumbai.polygonscan.com/address/0x60BF7eba37b2A914EcEB8f228c302a1D02aDf6e2#code',
        labelKey: 'proxy',
        archivedTestnet: true,
      },
    ],
  },
  {
    id: 'thunderdome',
    year: 2022,
    image: {
      src: '/thunderdome.png',
      width: 2872,
      height: 1586,
      sizes: PORTFOLIO_IMAGE_SIZES,
    },
    links: [
      {
        type: 'live',
        url: 'https://thunderdome-fe.vercel.app/',
        labelKey: 'live',
      },
      {
        type: 'code',
        url: 'https://github.com/damienteo/thunderdome-fe',
        labelKey: 'frontend',
      },
      {
        type: 'code',
        url: 'https://github.com/damienteo/thunderdome-be',
        labelKey: 'backend',
      },
      {
        type: 'api',
        url: 'https://thunderdome-be.onrender.com/api/v1/products/',
        labelKey: 'api',
      },
      {
        type: 'contracts',
        url: 'https://github.com/damienteo/thunderdome-contracts',
        labelKey: 'repo',
      },
      {
        type: 'contracts',
        url: 'https://goerli.etherscan.io/address/0xfF0Cc93e85150e18BA66102469d6e3613dC8Ef9B#code',
        labelKey: 'token',
        archivedTestnet: true,
      },
      {
        type: 'contracts',
        url: 'https://goerli.etherscan.io/address/0x16377628d5c50aE40951D63134572AB32395677C#code',
        labelKey: 'nft',
        archivedTestnet: true,
      },
    ],
  },
  {
    id: 'budgetPlanner',
    year: 2019,
    image: {
      src: '/budget-planner.png',
      width: 1277,
      height: 826,
      sizes: PORTFOLIO_IMAGE_SIZES,
    },
    links: [
      {
        type: 'live',
        url: 'https://budget-planner-frontend.vercel.app/',
        labelKey: 'live',
      },
      {
        type: 'code',
        url: 'https://github.com/damienteo/WDI-Capstone-Frontend-Budget-Planner',
        labelKey: 'frontend',
      },
      {
        type: 'code',
        url: 'https://github.com/damienteo/WDI-Capstone-Backend-Budget-Planner',
        labelKey: 'backend',
      },
    ],
  },
  {
    id: 'fireman',
    year: 2018,
    image: {
      src: '/fireman-game.png',
      width: 1976,
      height: 1032,
      sizes: PORTFOLIO_IMAGE_SIZES,
    },
    links: [
      {
        type: 'live',
        url: 'https://fireman.vercel.app/',
        labelKey: 'live',
      },
      {
        type: 'code',
        url: 'https://github.com/damienteo/WDI-Project-1-The-Fireman',
        labelKey: 'code',
      },
    ],
  },
]

export function groupPortfolioLinks(
  links: readonly PortfolioLink[]
): PortfolioLinkGroup[] {
  return LINK_TYPES.map((type) => ({
    type,
    links: links.filter((link) => link.type === type),
  })).filter((group) => group.links.length > 0)
}

export function archivedTestnetLinks(
  projects: readonly PortfolioProject[] = portfolioProjects
): readonly PortfolioLink[] {
  return projects.flatMap((project) =>
    project.links.filter((link) => link.archivedTestnet)
  )
}
