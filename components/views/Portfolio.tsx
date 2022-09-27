import React from 'react'
import { makeStyles } from '@mui/styles'
import { Grid } from '@mui/material/'
import Layout from '../layout/Layout'
import { ExternalLink, Header, Paragraph } from '../common'

const useStyles = makeStyles((theme) => ({
  image: {
    width: '95%',
    objectFit: 'cover',
  },
  imageWrapper: {
    textAlign: 'center',
  },
  sectionWrapper: {
    margin: '30px 0',
  },
  textWrapper: {
    paddingLeft: 0,
    [theme.breakpoints.up('xs')]: {
      paddingLeft: 20,
    },
  },
}))

const PortfolioPage: React.FunctionComponent = () => {
  const classes = useStyles()

  return (
    <Layout
      title="Damien Teo's Portfolio"
      description="Here are some small side projects which Damien Teo has previously done."
    >
      <Header text="Portfolio" />
      <Paragraph>
        For my resume, you may refer to my{' '}
        <ExternalLink
          url="https://www.linkedin.com/in/damien-teo/"
          label="LinkedIn"
        />{' '}
        profile
      </Paragraph>

      {/* Budget Planner Section */}
      <Grid container className={classes.sectionWrapper}>
        <Grid item sm={6} className={classes.imageWrapper}>
          <img
            src="/budget-planner.png"
            alt="Budget Planner Chart"
            className={classes.image}
          />
        </Grid>
        <Grid item sm={6} className={classes.textWrapper}>
          <Paragraph>
            One of my major side-projects is the{' '}
            <ExternalLink
              url="https://budget-planner-frontend.vercel.app/"
              label="Budget Planner"
            />{' '}
            (March 2019).
          </Paragraph>
          <Paragraph>
            This was my Capstone Project during my participation in General
            Assembly's Web Development Immersive, now known as the{' '}
            <ExternalLink
              url="https://generalassemb.ly/education/software-engineering-immersive/singapore"
              label="Software Engineering
              Immersive"
            />
            .
          </Paragraph>
        </Grid>
      </Grid>

      {/* Fireman Game Section */}
      <Grid container className={classes.sectionWrapper}>
        <Grid item sm={6} className={classes.imageWrapper}>
          <img
            src="/fireman-game.png"
            alt="Fireman Game Image"
            className={classes.image}
          />
        </Grid>
        <Grid item sm={6} className={classes.textWrapper}>
          <Paragraph>
            Created a game (
            <ExternalLink
              url="https://fireman.vercel.app/"
              label="The Fireman"
            />
            )
          </Paragraph>
          <Paragraph>
            This was made with vanilla HTML, JavaScript, and CSS (
            <ExternalLink
              url="https://github.com/damienteo/WDI-Project-1-The-Fireman"
              label="GitHub Repo"
            />
            ).
          </Paragraph>
        </Grid>
      </Grid>
    </Layout>
  )
}

export default PortfolioPage
