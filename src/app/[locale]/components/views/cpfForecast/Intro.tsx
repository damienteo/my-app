import React from 'react'
import { Header, InfoPopup, Paragraph } from '../../common'

// Styles were originally in useStyles, now converted to Tailwind CSS

const Intro: React.FunctionComponent = () => {
  return (
    <div>
      <div className="flex">
        <Header text="CPF Forecast" className="mb-2 mr-1" />{' '}
        <InfoPopup title="Disclaimer">
          <Paragraph className="mb-6 text-[#282c35]">
            This page is not meant to be for financial advice.
          </Paragraph>
          <Paragraph className="mb-6 text-[#282c35]">
            I am neither an employee of CPF, nor am I a representative of the
            government.
          </Paragraph>
          <Paragraph className="mb-6 text-[#282c35]">
            The calculations here are based on research I have done, and I have
            listed my sources as far as possible.
          </Paragraph>
          <Paragraph className="mb-6 text-[#282c35]">
            If there are any corrections or enhancements to be made, please let
            me know.
          </Paragraph>
          <Paragraph className="mb-6 text-[#282c35]">Thank you.</Paragraph>
        </InfoPopup>
      </div>
    </div>
  )
}

export default Intro
