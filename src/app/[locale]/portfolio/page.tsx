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
  groupHasArchivedTestnet,
  groupPortfolioLinks,
  portfolioProjects,
  type PortfolioLink,
  type PortfolioLinkGroup,
  type PortfolioLinkType,
  type PortfolioProject,
  type PortfolioProjectId,
} from './portfolioProjects'

const CASE_SECTIONS = ['problem', 'approach', 'result'] as const

const chipClass = `${chip} w-fit max-w-full shrink-0 whitespace-nowrap`

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

      <ol className="list-none space-y-8 p-0" aria-label={t('timeline')}>
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
    <li>
      <article className={`${surfaceCard} p-4 sm:p-6`}>
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6">
          <div className="md:sticky md:top-20">
            <Image
              src={project.image.src}
              alt={t(`projects.${project.id}.imageAlt`)}
              width={project.image.width}
              height={project.image.height}
              priority={priority}
              sizes={project.image.sizes}
              className="h-auto w-full rounded-lg object-cover"
            />
            <div className="mt-4 hidden md:block">
              <ProjectLinks projectId={project.id} groups={linkGroups} />
            </div>
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
          </div>
          <div className="md:hidden">
            <ProjectLinks projectId={project.id} groups={linkGroups} />
          </div>
        </div>
      </article>
    </li>
  )
}

function ProjectLinks({
  projectId,
  groups,
}: {
  projectId: PortfolioProjectId
  groups: PortfolioLinkGroup[]
}) {
  const t = useTranslations('PortfolioPage')

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const archived = groupHasArchivedTestnet(group)
        return (
          <div
            key={group.type}
            className="flex flex-wrap items-center gap-x-2 gap-y-1.5"
          >
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">
              {t(`linkTypes.${group.type}`)}
              {archived ? (
                <span className="ms-2 font-normal normal-case">
                  {t('archivedTestnet')}
                </span>
              ) : null}
            </h3>
            <ul className="flex min-w-0 flex-wrap gap-2">
              {group.links.map((link) => (
                <li key={link.url} className="w-fit max-w-full">
                  <ProjectChip
                    projectId={projectId}
                    groupType={group.type}
                    link={link}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function ProjectChip({
  projectId,
  groupType,
  link,
}: {
  projectId: PortfolioProjectId
  groupType: PortfolioLinkType
  link: PortfolioLink
}) {
  const t = useTranslations('PortfolioPage')
  const label = t(`projects.${projectId}.links.${link.labelKey}`)
  const description = linkDescription(t, projectId, link.labelKey, label)
  const accessibleName = link.archivedTestnet
    ? `${description} (${t('archivedTestnet')})`
    : description

  return (
    <ExternalLink
      url={link.url}
      label={label}
      className={chipClass}
      icon={<LinkTypeIcon type={groupType} />}
      title={accessibleName}
      ariaLabel={accessibleName}
    />
  )
}

function linkDescription(
  t: ReturnType<typeof useTranslations>,
  projectId: PortfolioProjectId,
  labelKey: string,
  fallback: string
): string {
  const key = `projects.${projectId}.linkDescriptions.${labelKey}`
  return t.has(key) ? t(key) : fallback
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
