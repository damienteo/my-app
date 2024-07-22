import React, { MouseEvent } from 'react'
import { AppBar, Toolbar, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { blue } from '@mui/material/colors/'

import { ButtonLink } from '../common/links'
import { navLinks } from '../../constants'

const NavBar: React.FunctionComponent<{
  setDrawerOpen: (event: MouseEvent) => void
}> = (props) => {
  return (
    <div className="grow">
      <AppBar position="static" sx={{ backgroundColor: blue[900] }}>
        <Toolbar>
          <IconButton
            edge="start"
            className="mr-1"
            color="inherit"
            aria-label="menu"
            onClick={props.setDrawerOpen}
            sx={{ display: { md: 'none', xs: 'inline' } }}
          >
            <MenuIcon />
          </IconButton>
          <div className="grow" style={{ flexGrow: 1 }}>
            <p>Damien Teo's Site</p>
          </div>
          {/* <Box sx={{ display: { sm: 'inline', xs: 'none' } }}> */}
          <div>
            {navLinks.map(({ url, text }) => (
              <ButtonLink key={url} url={url} text={text} />
            ))}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default NavBar
