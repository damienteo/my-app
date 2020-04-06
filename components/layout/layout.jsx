import React from "react";
import Head from "next/head";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { teal, blue } from "@material-ui/core/colors/";
import Container from "@material-ui/core/Container";
import NavBar from "./navbar";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
    secondary: {
      main: blue[800],
    },
  },
});

const Layout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Damien Teo</title>
      </Head>
      <NavBar />
      <Container maxWidth="lg">{children}</Container>
      <style jsx global>{`
        body {
          margin: 0;
          background: #000000;
          color: #ffffff;
        }
      `}</style>
    </ThemeProvider>
  );
};

export default Layout;
