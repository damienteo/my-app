import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core/";
import { blue } from "@material-ui/core/colors/";

const useStyles = makeStyles((theme) => ({
  paragraph: {
    margin: "10px 0",
    color: blue[50],
  },
}));

const Paragraph = ({ children }) => {
  const classes = useStyles();
  return (
    <Typography variant="body1" className={classes.paragraph}>
      {children}
    </Typography>
  );
};

export default Paragraph;
