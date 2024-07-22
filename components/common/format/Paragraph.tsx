import React from 'react'

const Paragraph: React.FunctionComponent = (props: any) => {
  return (
    <p className="my-[1.5] mx-0 text-blue" {...props}>
      {props.children}
    </p>
  )
}

export default Paragraph
