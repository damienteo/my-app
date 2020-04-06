import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Hidden,
  IconButton,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { renderButton } from "../common/buttonLink";

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
  title: {
    display: "inline",
    padding: "5px 15px",
    borderRadius: 5,
    color: "#ffffff",
    background: "#000000",
  },
}));

const navLinks = [
  { url: "about", text: "about" },
  { url: "blog", text: "blog" },
  { url: "portfolio", text: "portfolio" },
  { url: "resume", text: "resume" },
  { url: "others", text: "others" },
];

export default function NavBar() {
  const classes = useStyles();

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
  );
}
