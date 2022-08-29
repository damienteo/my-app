import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { blue } from '@mui/material/colors/'

// import '@mui/x-date-pickers/themeAugmentation'

const theme = createTheme({
  palette: {
    primary: {
      main: blue[800],
    },
    secondary: {
      main: blue[50],
    },
  },
})

export default responsiveFontSizes(theme)
