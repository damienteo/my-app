import { createTheme, responsiveFontSizes } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors/'

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
