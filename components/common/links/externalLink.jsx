import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors/";

const useStyles = makeStyles((theme) => ({
  link: {
    color: blue[300],
  },
}));

const ExternalLink = ({ url, label }) => {
  const classes = useStyles();
  return (
    <a href={url} target="_blank" rel="noopener" className={classes.link}>
      {label}
    </a>
  );
};

export default ExternalLink;
