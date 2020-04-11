import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core'

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
})

const chunkArray = (myArray, chunk_size) => {
  let index = 0
  const arrayLength = myArray.length
  const tempArray = []

  for (index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size)
    // Do something if you want with the group
    tempArray.push(myChunk)
  }

  return tempArray
}

const HistoryTable = (props) => {
  const { data } = props
  const history = chunkArray(data, 15)

  return (
    <TableContainer component={Paper}>
      <Table aria-label="CPF Forecast History">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="right">Ordinary Account</TableCell>
            <TableCell align="right">Special Account</TableCell>
            <TableCell>Category</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history[0].map((row, index) => (
            <TableRow key={index + row.date}>
              <TableCell component="th" scope="row">
                {row.date}
              </TableCell>
              <TableCell align="right">
                ${row.ordinaryAccount.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                ${row.specialAccount.toLocaleString()}
              </TableCell>
              <TableCell>{row.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default HistoryTable
