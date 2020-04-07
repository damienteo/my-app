import React from "react";
import Layout from "../layout/layout";
import Header from "../common/header";
import Paragraph from "../common/paragraph";
import ExternalLink from "../common/externalLink";

const AboutPage = () => {
  return (
    <>
      <Layout>
        <main>
          <Header text="About" />
          <Paragraph>
            Hi, I am a hardworking peasant who likes working with intelligent
            machines.
          </Paragraph>
          <Paragraph>
            This project was created with a mixture of:{" "}
            <ExternalLink url="https://reactjs.org/" label="React.js" />
            , <ExternalLink url="https://nextjs.org/" label="Next.js" />, and{" "}
            <ExternalLink url="https://material-ui.com/" label="Material UI" />.
            Essentially, it's just Javascript, HTML, and CSS.
          </Paragraph>
          <Paragraph>
            As of the time of this writing, I am in Singapore and we are
            undergoing what is called a CCB (
            <ExternalLink
              url="https://www.straitstimes.com/singapore/a-new-normal"
              label="Covid-19 Circuit Breaker"
            />
            ) in Singapore, and the DPM has just announced the{" "}
            <ExternalLink
              url="https://www.singaporebudget.gov.sg/budget_2020/solidarity-budget"
              label="Solidarity Budget"
            />
            .
          </Paragraph>
          <Paragraph>
            I completed a coding boot camp a year ago, and am currently employed
            as a 'Junior Software Engineer'. I can be contacted on{" "}
            <ExternalLink
              url="https://www.linkedin.com/in/damien-teo/"
              label="LinkedIn"
            />{" "}
            and{" "}
            <ExternalLink url="https://github.com/damienteo" label="Github" />.
          </Paragraph>
        </main>
      </Layout>
    </>
  );
};

export default AboutPage;
