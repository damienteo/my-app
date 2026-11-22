import fs from 'fs'
import path from 'path'

import en from '../../messages/en.json'
import jp from '../../messages/jp.json'
import {
  archivedTestnetLinks,
  groupHasArchivedTestnet,
  groupPortfolioLinks,
  LINK_TYPES,
  portfolioProjects,
  type PortfolioLink,
  type PortfolioProjectId,
} from '../../src/app/[locale]/portfolio/portfolioProjects'

const CASE_SECTIONS = ['problem', 'approach', 'result'] as const

type Messages = typeof en
type PortfolioMessages = Messages['PortfolioPage']

const expectedIds: PortfolioProjectId[] = [
  'mashikoPottery',
  'paymentsAgreement',
  'thunderdome',
  'budgetPlanner',
  'fireman',
]

describe('portfolioProjects', () => {
  it('lists five projects, newest first', () => {
    expect(portfolioProjects.map((project) => project.id)).toEqual(expectedIds)
    const years = portfolioProjects.map((project) => project.year)
    expect(years).toEqual([2025, 2023, 2022, 2019, 2018])
    expect(years).toEqual([...years].sort((a, b) => b - a))
  })

  it('gives the first screenshot priority by putting Mashiko Pottery first', () => {
    expect(portfolioProjects[0].id).toBe('mashikoPottery')
    expect(portfolioProjects[0].image.src).toBe('/mashiko-pottery.png')
    expect(
      fs.existsSync(path.join(__dirname, '../../public/mashiko-pottery.png'))
    ).toBe(true)
  })

  it('keeps the original screenshot dimensions', () => {
    const byId = Object.fromEntries(
      portfolioProjects.map((project) => [project.id, project.image])
    )

    expect(byId.mashikoPottery).toMatchObject({ width: 1440, height: 900 })
    expect(byId.paymentsAgreement).toMatchObject({ width: 2850, height: 1536 })
    expect(byId.thunderdome).toMatchObject({ width: 2872, height: 1586 })
    expect(byId.budgetPlanner).toMatchObject({ width: 1277, height: 826 })
    expect(byId.fireman).toMatchObject({ width: 1976, height: 1032 })
  })

  it('marks only the Goerli and Mumbai explorer links as archived testnets', () => {
    const archived = archivedTestnetLinks()
    expect(archived.map((link) => link.url)).toEqual([
      'https://mumbai.polygonscan.com/address/0xd7906deE9239509EF4564839a25460Bb8F97D2e6#code',
      'https://mumbai.polygonscan.com/address/0x9536fd0322Ab322110C4D0621b46dC936Ee9fCaa#code',
      'https://mumbai.polygonscan.com/address/0x60BF7eba37b2A914EcEB8f228c302a1D02aDf6e2#code',
      'https://goerli.etherscan.io/address/0xfF0Cc93e85150e18BA66102469d6e3613dC8Ef9B#code',
      'https://goerli.etherscan.io/address/0x16377628d5c50aE40951D63134572AB32395677C#code',
    ])
    expect(
      archived.every(
        (link) => link.type === 'contracts' && link.archivedTestnet
      )
    ).toBe(true)
  })

  it('puts a hackathon winner badge only on Payments Agreement', () => {
    const withBadge = portfolioProjects.filter((project) => project.badge)
    expect(withBadge).toHaveLength(1)
    expect(withBadge[0].id).toBe('paymentsAgreement')
    expect(withBadge[0].badge?.url).toContain('hackathon2023')
  })
})

describe('groupPortfolioLinks', () => {
  it('groups in Live site, Code, Smart contracts, API order and drops empty groups', () => {
    const thunderdome = portfolioProjects.find(
      (project) => project.id === 'thunderdome'
    )
    expect(thunderdome).toBeDefined()
    const groups = groupPortfolioLinks(thunderdome?.links ?? [])
    expect(groups.map((group) => group.type)).toEqual(LINK_TYPES)

    const mashiko = portfolioProjects.find(
      (project) => project.id === 'mashikoPottery'
    )
    expect(
      groupPortfolioLinks(mashiko?.links ?? []).map((group) => group.type)
    ).toEqual(['live', 'code'])
  })
})

describe('portfolio translations', () => {
  const locales: Array<['en' | 'jp', PortfolioMessages]> = [
    ['en', en.PortfolioPage],
    ['jp', jp.PortfolioPage],
  ]

  it.each(locales)(
    'names every project, section, and link in %s',
    (_locale, messages) => {
      expect(messages.sections.problem).toBeTruthy()
      expect(messages.sections.approach).toBeTruthy()
      expect(messages.sections.result).toBeTruthy()
      expect(messages.hackathonWinner).toBeTruthy()
      expect(messages.archivedTestnet).toBeTruthy()

      for (const type of LINK_TYPES) {
        expect(messages.linkTypes[type].trim()).toBeTruthy()
      }

      for (const project of portfolioProjects) {
        const copy = messages.projects[project.id]
        expect(copy.title.trim()).toBeTruthy()
        expect(copy.imageAlt.trim()).toBeTruthy()
        for (const section of CASE_SECTIONS) {
          expect(copy[section].trim()).toBeTruthy()
        }
        for (const link of project.links) {
          expect(
            copy.links[link.labelKey as keyof typeof copy.links]
          ).toBeTruthy()
        }
      }
    }
  )

  it('keeps English and Japanese keys aligned', () => {
    expect(Object.keys(en.PortfolioPage.projects)).toEqual(
      Object.keys(jp.PortfolioPage.projects)
    )
    expect(Object.keys(en.PortfolioPage.projects)).toEqual(expectedIds)

    for (const id of expectedIds) {
      expect(Object.keys(en.PortfolioPage.projects[id])).toEqual(
        Object.keys(jp.PortfolioPage.projects[id])
      )
      expect(Object.keys(en.PortfolioPage.projects[id].links)).toEqual(
        Object.keys(jp.PortfolioPage.projects[id].links)
      )
      const enDescriptions =
        'linkDescriptions' in en.PortfolioPage.projects[id]
          ? en.PortfolioPage.projects[id].linkDescriptions
          : undefined
      const jpDescriptions =
        'linkDescriptions' in jp.PortfolioPage.projects[id]
          ? jp.PortfolioPage.projects[id].linkDescriptions
          : undefined
      expect(enDescriptions && Object.keys(enDescriptions)).toEqual(
        jpDescriptions && Object.keys(jpDescriptions)
      )
    }
  })

  it('keeps contract chip labels short and stores the long names as descriptions', () => {
    expect(en.PortfolioPage.projects.paymentsAgreement.links).toMatchObject({
      factory: 'Factory',
      initializer: 'Initializer',
      proxy: 'Proxy (clone)',
    })
    expect(
      en.PortfolioPage.projects.paymentsAgreement.linkDescriptions
    ).toMatchObject({
      factory: 'Factory contract for cloning agreements',
      initializer: 'Initializer contract with agreement logic',
      proxy:
        'Minimal proxy contract (clone) which uses logic from the initializer contract',
    })
    expect(en.PortfolioPage.projects.thunderdome.links).toMatchObject({
      token: 'Token',
      nft: 'NFT',
    })
    expect(jp.PortfolioPage.projects.paymentsAgreement.links).toMatchObject({
      factory: 'ファクトリー',
      initializer: 'イニシャライザー',
      proxy: 'プロキシ（クローン）',
    })
    expect(jp.PortfolioPage.projects.thunderdome.links).toMatchObject({
      token: 'トークン',
      nft: 'NFT',
    })
  })

  it('does not describe Mashiko Pottery as a finished marketplace', () => {
    const forbidden = [
      'stripe',
      'paypal',
      'oauth',
      'express',
      'cypress',
      'wechat',
      'alipay',
    ]
    const mashikoCopy = [
      en.PortfolioPage.projects.mashikoPottery,
      jp.PortfolioPage.projects.mashikoPottery,
    ]

    for (const copy of mashikoCopy) {
      const blob =
        `${copy.problem} ${copy.approach} ${copy.result}`.toLowerCase()
      for (const word of forbidden) {
        expect(blob).not.toContain(word)
      }
    }

    expect(
      en.PortfolioPage.projects.mashikoPottery.result.toLowerCase()
    ).toContain('planned')
    expect(jp.PortfolioPage.projects.mashikoPottery.result).toContain('予定')
  })
})

describe('archived testnet link helpers', () => {
  it('returns an empty list when nothing is archived', () => {
    const links: PortfolioLink[] = [
      {
        type: 'live',
        url: 'https://example.com',
        labelKey: 'live',
      },
    ]
    expect(groupPortfolioLinks(links)).toEqual([{ type: 'live', links }])
    expect(archivedTestnetLinks([{ ...portfolioProjects[0], links }])).toEqual(
      []
    )
    expect(groupHasArchivedTestnet({ type: 'live', links })).toBe(false)
    expect(
      groupHasArchivedTestnet({
        type: 'contracts',
        links: [{ ...links[0], type: 'contracts', archivedTestnet: true }],
      })
    ).toBe(true)
  })
})
