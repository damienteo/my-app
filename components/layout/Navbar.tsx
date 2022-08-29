import React, { MouseEvent } from 'react'
import { makeStyles } from '@mui/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Hidden,
  IconButton,
  Theme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { ButtonLink } from '../common/links'
import { navLinks } from '../../constants'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  titleWrapper: {
    flexGrow: 1,
  },
}))

const NavBar: React.FunctionComponent<{
  setDrawerOpen: (event: MouseEvent) => void
}> = (props) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Hidden mdUp>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={props.setDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <div className={classes.titleWrapper} style={{ flexGrow: 1 }}>
            <Typography variant="h6">Damien Teo's Site</Typography>
          </div>
          <Hidden smDown>
            {navLinks.map(({ url, text }) => (
              <ButtonLink key={url} url={url} text={text} />
            ))}
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default NavBar
