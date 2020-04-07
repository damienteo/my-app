import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core/";
import { blue } from "@material-ui/core/colors/";
import Layout from "../layout/layout";
import Header from "../common/header";
import Paragraph from "../common/paragraph";
import ExternalLink from "../common/externalLink";

const useStyles = makeStyles((theme) => ({
  link: {
    color: blue[200],
  },
}));

const portfolioLinks = [
  {
    label: "Budget Planner",
    description:
      "Developed a budget-and-expense tracking solution with JavaScript and HTML, using React for the front-end, PostgreSQL and Express for the back-end, and Node.js as the server environment/n",
    url: "https://my-budget-planner.herokuapp.com",
    image: "/budget-planner.png",
  },
];

const PortfolioPage = () => {
  const classes = useStyles();

  return (
    <>
      <Layout>
        <main>
          <Header text="Portfolio" />
          <Paragraph>
            For my resume, you may refer to my{" "}
            <ExternalLink
              url="https://www.linkedin.com/in/damien-teo/"
              label="LinkedIn"
            />{" "}
            profile
          </Paragraph>
          <img src="/budget-planner.png" alt="my image" />
        </main>
      </Layout>
    </>
  );
};

export default PortfolioPage;
