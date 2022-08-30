import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { red } from '@mui/material/colors/'
import { Theme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: red[800],
    },
    secondary: {
      main: red[50],
    },
  },
})

export default responsiveFontSizes(theme)

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}
