import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
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
  title: {
    flexGrow: 1,
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
          <Typography
            variant="h6"
            className={classes.title}
            style={{ flexGrow: 1 }}
          >
            Damien Teo's Site
          </Typography>
          <Hidden smDown>
            {navLinks.map(({ url, text }) => renderButton(url, text))}
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  );
}
