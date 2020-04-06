import React from "react";
import Link from "next/link";
import Button from "@material-ui/core/Button";

export const ButtonLink = ({ className, href, hrefAs, children }) => (
  <Link href={href} as={hrefAs} prefetch>
    <a className={className}>{children}</a>
  </Link>
);

export const renderButton = (url, text) => (
  <Button component={ButtonLink} href={url} color="inherit">
    {text}
  </Button>
);
