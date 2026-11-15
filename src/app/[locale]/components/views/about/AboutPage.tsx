import React from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/src/i18n/navigation'

const STACK = [
  { label: 'React.js', href: 'https://reactjs.org/' },
  { label: 'Next.js', href: 'https://nextjs.org/' },
  { label: 'Tailwind CSS', href: 'https://tailwindcss.com/' },
  { label: 'Javascript' },
  { label: 'Typescript', href: 'https://www.typescriptlang.org/' },
  { label: 'HTML' },
  { label: 'CSS' },
  { label: 'Jest', href: 'https://jestjs.io/' },
  {
    label: 'Material UI',
    href: 'https://material-ui.com/',
    previously: true,
  },
] as const

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const AboutPage = () => {
  const t = useTranslations('AboutPage')

  return (
    <div className="w-full space-y-8 py-2 text-left md:py-6">
      <section className="rounded-2xl bg-surface p-6 ring-1 ring-raised sm:p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {t('name')}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink md:text-lg">
          {t('tagline')}
        </p>
        <div className="mt-5">
          <SocialLink
            href="https://github.com/damienteo"
            label={t('github')}
            icon={<GitHubIcon />}
          />
        </div>
      </section>

      <section aria-labelledby="about-explore">
        <h2
          id="about-explore"
          className="text-xl font-semibold text-ink sm:text-2xl"
        >
          {t('exploreTitle')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PageCard
            href="/portfolio"
            title={t('cards.portfolio.title')}
            description={t('cards.portfolio.description')}
            view={t('view')}
          />
          <PageCard
            href="/daily-checks"
            title={t('cards.dailyChecks.title')}
            description={t('cards.dailyChecks.description')}
            view={t('view')}
          />
          <PageCard
            href="/cpf-forecast"
            title={t('cards.cpf.title')}
            description={t('cards.cpf.description')}
            view={t('view')}
          />
        </div>
      </section>

      <section
        aria-labelledby="about-stack"
        className="rounded-2xl bg-surface p-6 ring-1 ring-raised sm:p-8"
      >
        <h2
          id="about-stack"
          className="text-xl font-semibold text-ink sm:text-2xl"
        >
          {t('stackTitle')}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink md:text-lg">
          {t('stackBody')}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {STACK.map((item) => (
            <li key={item.label}>
              <Chip
                label={item.label}
                href={'href' in item ? item.href : undefined}
                note={'previously' in item ? t('previously') : undefined}
              />
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="about-learning"
        className="rounded-2xl bg-surface p-6 ring-1 ring-raised sm:p-8"
      >
        <h2
          id="about-learning"
          className="text-xl font-semibold text-ink sm:text-2xl"
        >
          {t('learningTitle')}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink md:text-lg">
          {t.rich('learningBody', {
            solidity: (chunks) => (
              <TextLink href="https://docs.soliditylang.org/">
                {chunks}
              </TextLink>
            ),
            repo: (chunks) => (
              <TextLink href="https://github.com/damienteo/learning-smart-contracts">
                {chunks}
              </TextLink>
            ),
          })}
        </p>
      </section>
    </div>
  )
}

function PageCard({
  href,
  title,
  description,
  view,
}: {
  href: '/portfolio' | '/daily-checks' | '/cpf-forecast'
  title: string
  description: string
  view: string
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-2xl bg-surface p-5 ring-1 ring-raised transition hover:bg-raised hover:ring-accent ${focusRing}`}
    >
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-base leading-relaxed text-ink">
        {description}
      </p>
      <span className="mt-4 text-sm font-medium text-accent-text group-hover:text-ink">
        {view}
        <span aria-hidden="true"> →</span>
      </span>
    </Link>
  )
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-base font-medium text-ink transition hover:bg-blue-500 ${focusRing}`}
    >
      {icon}
      {label}
    </a>
  )
}

function Chip({
  label,
  href,
  note,
}: {
  label: string
  href?: string
  note?: string
}) {
  const className = `inline-flex items-center gap-2 rounded-full bg-raised px-3 py-1.5 text-sm text-ink ring-1 ring-raised transition hover:ring-accent ${focusRing}`
  const content = (
    <>
      {label}
      {note ? <span className="text-xs text-muted">{note}</span> : null}
    </>
  )

  if (!href) {
    return <span className={className}>{content}</span>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  )
}

function TextLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-accent-text underline-offset-2 hover:underline ${focusRing}`}
    >
      {children}
    </a>
  )
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.38.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  )
}

export default AboutPage
