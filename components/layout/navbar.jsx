import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Hidden,
  IconButton,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import { renderButton } from '../common/buttonLink'
import { navLinks } from '../constants'

const useStyles = makeStyles((theme) => ({
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

export default function NavBar(props) {
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
            {navLinks.map(({ url, text }) => renderButton(url, text))}
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  )
}
