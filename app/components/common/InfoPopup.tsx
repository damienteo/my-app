import React from 'react'

interface DialogButtonProps {
  title: string
  iconColor?: string
  handleClickOpen: () => void
}

interface DialogTitleProps {
  onClose: () => void
  children: React.ReactNode
}

interface InfoPopupProps {
  title: string
  iconColor?: string
  children: React.ReactNode
}

const DialogButton = (props: DialogButtonProps) => {
  const { title, handleClickOpen, iconColor = 'text-blue-900' } = props
  return (
    <button
      aria-label={`${title} info`}
      className={`p-0 mt-[-3px] ${iconColor}`}
      onClick={handleClickOpen}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M12 19c-4.418 0-8-1.79-8-4s3.582-4 8-4 8 1.79 8 4-3.582 4-8 4z"
        />
      </svg>
    </button>
  )
}

const DialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props
  return (
    <div className="relative m-0 p-2" {...other}>
      {children}
      {onClose ? (
        <button
          aria-label="close"
          className="absolute right-4 top-4 text-gray-500"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

const InfoPopup: React.FunctionComponent<InfoPopupProps> = (props) => {
  const { title, children } = props
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <DialogButton handleClickOpen={handleClickOpen} {...props} />
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3">
            <DialogTitle onClose={handleClose}>{title}</DialogTitle>
            <div className="p-4">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default InfoPopup
