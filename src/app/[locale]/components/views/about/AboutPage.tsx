import React from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/src/i18n/navigation'

// Drop a portrait in /public and set this to its path, for example
// '/about/damien.jpg'. Until then the initials mark the slot.
const AVATAR_SRC: string | null = null

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
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1761FF]'

const AboutPage = () => {
  const t = useTranslations('AboutPage')

  return (
    <div className="w-full space-y-8 py-2 text-left md:py-6">
      <section className="rounded-2xl bg-[#1F2937] p-6 ring-1 ring-white/10 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar
            label={t('avatarLabel')}
            initials={t('avatarInitials')}
            slot={t('photoSlot')}
          />
          <div className="min-w-0">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {t('name')}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-200 md:text-lg">
              {t('tagline')}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <SocialLink
                href="https://www.linkedin.com/in/damien-teo/"
                label={t('linkedin')}
                icon={<LinkedInIcon />}
                primary
              />
              <SocialLink
                href="https://github.com/damienteo"
                label={t('github')}
                icon={<GitHubIcon />}
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-explore">
        <h2
          id="about-explore"
          className="text-xl font-semibold text-white sm:text-2xl"
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
        className="rounded-2xl bg-[#1F2937] p-6 ring-1 ring-white/10 sm:p-8"
      >
        <h2
          id="about-stack"
          className="text-xl font-semibold text-white sm:text-2xl"
        >
          {t('stackTitle')}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-200 md:text-lg">
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
        className="rounded-2xl bg-[#1F2937] p-6 ring-1 ring-white/10 sm:p-8"
      >
        <h2
          id="about-learning"
          className="text-xl font-semibold text-white sm:text-2xl"
        >
          {t('learningTitle')}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-200 md:text-lg">
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

function Avatar({
  label,
  initials,
  slot,
}: {
  label: string
  initials: string
  slot: string
}) {
  if (AVATAR_SRC) {
    return (
      <img
        src={AVATAR_SRC}
        alt={label}
        className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-1 ring-white/10 sm:h-32 sm:w-32"
      />
    )
  }

  return (
    <figure className="shrink-0">
      <div
        role="img"
        aria-label={label}
        className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-[#364152] text-3xl font-semibold tracking-wide text-white sm:h-32 sm:w-32"
      >
        {initials}
      </div>
      <figcaption className="mt-2 max-w-32 text-center text-sm text-gray-300">
        {slot}
      </figcaption>
    </figure>
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
      className={`group flex h-full flex-col rounded-2xl bg-[#1F2937] p-5 ring-1 ring-white/10 transition hover:bg-[#243044] hover:ring-[#1761FF] ${focusRing}`}
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-base leading-relaxed text-gray-200">
        {description}
      </p>
      <span className="mt-4 text-sm font-medium text-[#8eb0ff] group-hover:text-white">
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
  primary = false,
}: {
  href: string
  label: string
  icon: React.ReactNode
  primary?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-medium transition ${focusRing} ${
        primary
          ? 'bg-[#1761FF] text-white hover:bg-[#3d7bff]'
          : 'bg-[#364152] text-white ring-1 ring-white/15 hover:ring-[#1761FF]'
      }`}
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
  const className = `inline-flex items-center gap-2 rounded-full bg-[#364152] px-3 py-1.5 text-sm text-gray-100 ring-1 ring-white/10 transition hover:ring-[#1761FF] ${focusRing}`
  const content = (
    <>
      {label}
      {note ? <span className="text-xs text-gray-300">{note}</span> : null}
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
      className={`text-[#8eb0ff] underline-offset-2 hover:underline ${focusRing}`}
    >
      {children}
    </a>
  )
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.05c.53-1 1.84-2.1 3.78-2.1 4.04 0 4.79 2.66 4.79 6.12V24h-4v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z" />
    </svg>
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
