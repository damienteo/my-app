import React, { useState } from 'react'
import { formatCurrency } from '../../../../utils/utils'
import { Entry, GroupsType, SalaryRecord } from '../../../../utils/cpf/types'

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
      <div className="flex justify-center my-4">
        <button
          onClick={seePrevHistory}
          disabled={page === 0}
          className={`p-2 rounded-full ${
            page === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500'
          }`}
        >
          <span>&lt;</span>
        </button>
        <button
          onClick={seeNextHistory}
          disabled={page === history.length - 1}
          className={`p-2 rounded-full ml-4 ${
            page === history.length - 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500'
          }`}
        >
          <span>&gt;</span>
        </button>
      </div>
    )
  }

  const renderGroupButtons = () => {
    return (
      <div className="flex justify-center space-x-2 my-4">
        {groups.map((group, index) => (
          <button
            key={group}
            onClick={() => setPage(index)}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-400"
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
      <p className="text-center text-gray-700 my-4">
        In the year {year}, your salary is{' '}
        <span className="bg-gray-800 text-blue-100 px-2 py-1 rounded">
          {formatCurrency(amount)}
        </span>{' '}
        (age: {age}).
      </p>
    )
  }

  return (
    <>
      {renderButtons()}

      {groups.length > 0 && renderGroupButtons()}

      {Boolean(salaryData[page]) && renderSalaryInfo(salaryData[page])}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">Date</th>
              <th className="px-6 py-3 border-b">Category</th>
              <th className="px-6 py-3 border-b text-right">
                Ordinary Account
              </th>
              <th className="px-6 py-3 border-b text-right">Special Account</th>
              {data[1]?.retirementAccount !== undefined && (
                <th className="px-6 py-3 border-b text-right">
                  Retirement Account
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {history[page]?.map((row, index) => (
              <tr key={index + row.date}>
                <td className="px-6 py-4 border-b">{row.date}</td>
                <td className="px-6 py-4 border-b">{row.category}</td>
                <td className="px-6 py-4 border-b text-right">
                  {formatCurrency(row.ordinaryAccount)}
                </td>
                <td className="px-6 py-4 border-b text-right">
                  {formatCurrency(row.specialAccount)}
                </td>
                {row.retirementAccount !== undefined && (
                  <td className="px-6 py-4 border-b text-right">
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
