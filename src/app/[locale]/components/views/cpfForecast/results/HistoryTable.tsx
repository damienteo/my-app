import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatCurrency } from '../../../../../../../utils/utils'
import {
  Entry,
  GroupsType,
  SalaryRecord,
} from '../../../../../../../utils/cpf/types'

interface HistoryTableProps {
  data: Entry[]
  groupByYear: boolean
  salaryData: SalaryRecord[]
}

const sortEntryByYear = (myArray: Entry[]) => {
  const entriesSortedByYear = myArray.reduce((groups, entry) => {
    const splitString = entry.date.split(' ')
    const year = splitString[1]

    if (!groups[year]) groups[year] = []

    groups[year].push(entry)

    return groups
  }, {} as GroupsType)

  return entriesSortedByYear
}

const chunkArray = (myArray: Entry[], groupByYear: boolean, chunkSize = 15) => {
  if (groupByYear) {
    const entriesSortedByYear = sortEntryByYear(myArray)
    const history = Object.values(entriesSortedByYear)
    const groups = Object.keys(entriesSortedByYear)

    return { history, groups }
  } else {
    const arrayLength = myArray.length
    const tempArray = []

    for (let index = 0; index < arrayLength; index += chunkSize) {
      const myChunk = myArray.slice(index, index + chunkSize)
      tempArray.push(myChunk)
    }

    return { history: tempArray, groups: undefined }
  }
}

const HistoryTable: React.FunctionComponent<HistoryTableProps> = (props) => {
  const t = useTranslations('CPFForecastPage.results.historyTable')
  const { data = [], groupByYear = false, salaryData = [] } = props
  const [page, setPage] = useState(0)

  const { history, groups = [] } = chunkArray(data, groupByYear)

  const seePrevHistory = () => {
    setPage(page - 1)
  }

  const seeNextHistory = () => {
    setPage(page + 1)
  }

  const renderButtons = () => {
    return (
      <div className="flex justify-center items-center gap-3 my-4">
        <button
          onClick={seePrevHistory}
          disabled={page === 0}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            page === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={seeNextHistory}
          disabled={page === history.length - 1}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            page === history.length - 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    )
  }

  const renderGroupButtons = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 my-4">
        {groups.map((group, index) => (
          <button
            key={group}
            onClick={() => setPage(index)}
            className={`px-4 py-2 text-white rounded-full transition-all font-medium ${
              page === index
                ? 'bg-blue-600 hover:bg-blue-500 shadow-lg'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {group}
          </button>
        ))}
      </div>
    )
  }

  const renderSalaryInfo = (salaryData: SalaryRecord) => {
    const { year, amount, age } = salaryData
    return (
      <p className="text-center text-gray-300 my-4">
        {t('salaryInfo', { year, amount: formatCurrency(amount), age })}
      </p>
    )
  }

  return (
    <>
      {renderButtons()}

      {groups.length > 0 && renderGroupButtons()}

      {Boolean(salaryData[page]) && renderSalaryInfo(salaryData[page])}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-700 text-gray-200">
                {t('date')}
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-gray-200">
                {t('category')}
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-gray-200 text-right">
                {t('ordinaryAccount')}
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-gray-200 text-right">
                {t('specialAccount')}
              </th>
              {data[1]?.retirementAccount !== undefined && (
                <th className="px-6 py-3 border-b border-gray-700 text-gray-200 text-right">
                  {t('retirementAccount')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {history[page]?.map((row, index) => (
              <tr key={index + row.date} className="hover:bg-gray-700">
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300">
                  {row.date}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300">
                  {row.category}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300 text-right">
                  {formatCurrency(row.ordinaryAccount)}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300 text-right">
                  {formatCurrency(row.specialAccount)}
                </td>
                {row.retirementAccount !== undefined && (
                  <td className="px-6 py-4 border-b border-gray-700 text-gray-300 text-right">
                    {formatCurrency(row.retirementAccount)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {groups.length > 0 && renderGroupButtons()}

      {renderButtons()}
    </>
  )
}

export default HistoryTable
