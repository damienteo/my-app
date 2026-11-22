import React from 'react'
import { useTranslations } from 'next-intl'

import { ExternalLink, InfoPopup } from '../../common'
import { surfaceCard } from '../../common/classes'

const labelClass = 'text-[11px] font-medium uppercase tracking-wider text-muted'

const RulesNote: React.FunctionComponent = () => {
  const t = useTranslations('CPFForecastPage.rules')

  const cohorts = [
    {
      year: t('cohorts.y2025.year'),
      brs: t('cohorts.y2025.brs'),
      frs: t('cohorts.y2025.frs'),
      ers: t('cohorts.y2025.ers'),
    },
    {
      year: t('cohorts.y2026.year'),
      brs: t('cohorts.y2026.brs'),
      frs: t('cohorts.y2026.frs'),
      ers: t('cohorts.y2026.ers'),
    },
    {
      year: t('cohorts.y2027.year'),
      brs: t('cohorts.y2027.brs'),
      frs: t('cohorts.y2027.frs'),
      ers: t('cohorts.y2027.ers'),
    },
  ]

  return (
    <section
      className={`mb-6 p-4 text-left text-gray-300 sm:p-5 ${surfaceCard}`}
    >
      <p className="text-sm leading-relaxed text-justify text-ink">
        {t('intro')}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <h2 className={labelClass}>{t('mediSaveLabel')}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-justify">
            {t('mediSave')}
          </p>
        </div>
        <div>
          <h2 className={labelClass}>{t('laterLabel')}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-justify">
            {t('later')}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-1">
          <h2 className={labelClass}>{t('retirementLabel')}</h2>
          <InfoPopup title={t('sourceTitle')}>
            <p className="m-0 text-sm text-gray-300">
              {t('sourceInfo')}{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/member/faq/retirement-income/general-information-on-retirement/what-are-the-retirement-sums-applicable-to-me-"
                label={t('sourceTitle')}
              />
              .
            </p>
          </InfoPopup>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-justify">
          {t('retirementLead')}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[18rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-raised text-[11px] uppercase tracking-wider text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('year')}
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('brs')}
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  {t('frs')}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {t('ers')}
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums text-ink">
              {cohorts.map((cohort) => (
                <tr key={cohort.year} className="border-b border-raised/70">
                  <th
                    scope="row"
                    className="py-2 pr-3 text-left font-medium text-gray-300"
                  >
                    {cohort.year}
                  </th>
                  <td className="py-2 pr-3 whitespace-nowrap">{cohort.brs}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{cohort.frs}</td>
                  <td className="py-2 whitespace-nowrap">{cohort.ers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-justify text-muted">
          {t('relationship')}
        </p>
      </div>

      <div className="mt-5 border-t border-raised pt-4">
        <h2 className={labelClass}>{t('notModelledLabel')}</h2>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>{t('notModelledErs')}</li>
          <li>{t('notModelledBrs')}</li>
        </ul>
      </div>
    </section>
  )
}

export default RulesNote
