import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core/";
import { blue } from "@material-ui/core/colors/";

const useStyles = makeStyles((theme) => ({
  header: {
    margin: "20px 0 10px",
    color: blue[200],
  },
}));

const Header = ({ text }) => {
  const classes = useStyles();
  return (
    <Typography variant="h3" className={classes.header}>
      {text}
    </Typography>
  );
};

export default Header;
