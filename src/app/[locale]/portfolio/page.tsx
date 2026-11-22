import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { ExternalLink, Paragraph } from '../components/common'
import {
  blueButton,
  chip,
  focusRing,
  surfaceCard,
} from '../components/common/classes'
import PageContainer from '../components/layout/PageContainer'
import {
  groupPortfolioLinks,
  portfolioProjects,
  type PortfolioLinkType,
  type PortfolioProject,
} from './portfolioProjects'

const CASE_SECTIONS = ['problem', 'approach', 'result'] as const

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Here are some small side projects which Damien Teo has previously done.',
}

const PortfolioPage: React.FunctionComponent = () => {
  const t = useTranslations('PortfolioPage')

  return (
    <PageContainer title={t('header')}>
      <Paragraph className="sm:mb-6">
        {t('resume.start')}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />
        {t('resume.end')}
      </Paragraph>

      <ol
        className="relative ms-1 border-s border-raised ps-6 sm:ps-8"
        aria-label={t('timeline')}
      >
        {portfolioProjects.map((project, index) => (
          <PortfolioEntry
            key={project.id}
            project={project}
            priority={index === 0}
          />
        ))}
      </ol>
    </PageContainer>
  )
}

function PortfolioEntry({
  project,
  priority,
}: {
  project: PortfolioProject
  priority: boolean
}) {
  const t = useTranslations('PortfolioPage')
  const title = t(`projects.${project.id}.title`)
  const linkGroups = groupPortfolioLinks(project.links)

  return (
    <li className="relative pb-10 last:pb-0">
      <span
        className="absolute top-2 -start-[calc(0.375rem+1px)] h-3 w-3 rounded-full bg-accent ring-4 ring-canvas"
        aria-hidden="true"
      />
      <article className={`${surfaceCard} p-4 sm:p-6`}>
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6">
          <div>
            <Image
              src={project.image.src}
              alt={t(`projects.${project.id}.imageAlt`)}
              width={project.image.width}
              height={project.image.height}
              priority={priority}
              sizes={project.image.sizes}
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>
          <div>
            <header className="mb-4">
              <time
                dateTime={String(project.year)}
                className="text-sm font-medium text-accent-text"
              >
                {project.year}
              </time>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                  {title}
                </h2>
                {project.badge ? (
                  <ExternalLink
                    url={project.badge.url}
                    label={t(project.badge.labelKey)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${blueButton} ${focusRing}`}
                  />
                ) : null}
              </div>
            </header>

            <dl className="space-y-3">
              {CASE_SECTIONS.map((section) => (
                <div key={section}>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {t(`sections.${section}`)}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink md:text-base">
                    {t(`projects.${project.id}.${section}`)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 space-y-3">
              {linkGroups.map((group) => (
                <div key={group.type}>
                  <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {t(`linkTypes.${group.type}`)}
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {group.links.map((link) => (
                      <li key={link.url}>
                        <ExternalLink
                          url={link.url}
                          label={t(
                            `projects.${project.id}.links.${link.labelKey}`
                          )}
                          className={chip}
                          icon={<LinkTypeIcon type={group.type} />}
                          note={
                            link.archivedTestnet
                              ? t('archivedTestnet')
                              : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

function LinkTypeIcon({ type }: { type: PortfolioLinkType }) {
  const className = 'h-3.5 w-3.5 shrink-0'

  if (type === 'live') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`${className} fill-none stroke-current stroke-2`}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9z" />
      </svg>
    )
  }

  if (type === 'code') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`${className} fill-none stroke-current stroke-2`}
      >
        <path d="M9 8 5 12l4 4M15 8l4 4-4 4M13 6l-2 12" />
      </svg>
    )
  }

  if (type === 'api') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`${className} fill-none stroke-current stroke-2`}
      >
        <path d="M8 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3M16 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3M8 12h8" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} fill-none stroke-current stroke-2`}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  )
}

export default PortfolioPage
