import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button,
  Hidden,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { formatCurrency } from '../../../utils/utils'
import { Entry, GroupsType } from '../../../utils/cpf/types'

interface HistoryTableProps {
  data: Entry[]
  groupByYear: boolean
}

const useStyles = makeStyles((theme) => ({
  buttonsWrapper: {
    textAlign: 'center',
  },
  groupButtonsWrapper: {
    textAlign: 'center',
  },
  groupButton: {
    margin: theme.spacing(0.5),
  },
  table: {
    margin: `${theme.spacing(1.5)}px 0`,
  },
}))

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
    // Group entries by year

    const entriesSortedByYear = sortEntryByYear(myArray)
    const history = Object.values(entriesSortedByYear)
    const groups = Object.keys(entriesSortedByYear)

    return { history, groups }
  } else {
    // Default Page Grouping

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
  const classes = useStyles()
  const { data = [], groupByYear = false } = props
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
      <div className={classes.buttonsWrapper}>
        <IconButton
          aria-label={`Prev Button`}
          onClick={seePrevHistory}
          disabled={page === 0}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          aria-label={`Forward Button`}
          onClick={seeNextHistory}
          disabled={page === history.length - 1}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
    )
  }

  const renderGroupButtons = () => {
    return groups.map((group, index) => {
      return (
        <Button
          key={group}
          size="small"
          onClick={() => setPage(index)}
          className={classes.groupButton}
          variant={page === index ? 'contained' : undefined}
        >
          {group}
        </Button>
      )
    })
  }

  return (
    <>
      {renderButtons()}

      {groups && (
        <Hidden xsDown>
          <div className={classes.groupButtonsWrapper}>
            {renderGroupButtons()}
          </div>
        </Hidden>
      )}

      <TableContainer component={Paper} className={classes.table}>
        <Table aria-label="CPF Forecast History">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Ordinary Account</TableCell>
              <TableCell align="right">Special Account</TableCell>
              {data[1].retirementAccount !== undefined && (
                <TableCell align="right">Retirement Account</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {history[page] &&
              history[page].map((row, index) => (
                <TableRow key={index + row.date}>
                  <TableCell component="th" scope="row">
                    {row.date}
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.ordinaryAccount)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.specialAccount)}
                  </TableCell>
                  {row.retirementAccount !== undefined && (
                    <TableCell align="right">
                      {formatCurrency(row.retirementAccount)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {groups && (
        <div className={classes.groupButtonsWrapper}>
          {renderGroupButtons()}
        </div>
      )}

      {renderButtons()}
    </>
  )
}

export default HistoryTable
