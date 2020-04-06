import React from "react";
import Head from "next/head";
import Container from "@material-ui/core/Container";
import NavBar from "./navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Damien Teo</title>
      </Head>
      <NavBar />
      <Container maxWidth="lg">{children}</Container>
      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default Layout;
