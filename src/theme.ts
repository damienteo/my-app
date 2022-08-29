import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { blue } from '@mui/material/colors/'
import { Theme } from '@mui/material/styles'

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

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}
