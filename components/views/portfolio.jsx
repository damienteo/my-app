import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Paper, Grid } from '@material-ui/core/'
import { blue } from '@material-ui/core/colors/'
import Layout from '../layout/layout'
import Header from '../common/header'
import Paragraph from '../common/paragraph'
import ExternalLink from '../common/externalLink'

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

const PortfolioPage = () => {
  const classes = useStyles()

  return (
    <>
      <Layout>
        <Header text="Portfolio" />
        <Paragraph>
          For my resume, you may refer to my{' '}
          <ExternalLink
            url="https://www.linkedin.com/in/damien-teo/"
            label="LinkedIn"
          />{' '}
          profile
        </Paragraph>
        <Grid container className={classes.sectionWrapper}>
          <Grid item sm={6} className={classes.imageWrapper}>
            <Paper>
              <img
                src="/budget-planner.png"
                alt="my image"
                className={classes.image}
              />
            </Paper>
          </Grid>
          <Grid item sm={6} className={classes.textWrapper}>
            <Paragraph>
              One of my major side-projects is the{' '}
              <ExternalLink
                url="https://my-budget-planner.herokuapp.com/"
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
      </Layout>
    </>
  )
}

export default PortfolioPage
