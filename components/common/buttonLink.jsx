import React from "react";
import Link from "next/link";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(() => ({
  button: {
    "&:hover": {
      backgroundColor: "#282c35",
      color: "#FFFFFF",
    },
  },
}));

export const ButtonLink = ({ className, href, hrefAs, children }) => (
  <Link href={href} as={hrefAs} prefetch>
    <a className={className}>{children}</a>
  </Link>
);

export const renderButton = (url, text) => {
  const classes = useStyles();
  return (
    <Button
      component={ButtonLink}
      href={url}
      color="inherit"
      className={classes.button}
    >
      {text}
    </Button>
  );
};
