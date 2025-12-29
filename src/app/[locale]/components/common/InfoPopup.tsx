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
  const { title, handleClickOpen, iconColor = 'text-gray-300' } = props
  return (
    <button
      aria-label={`${title} info`}
      className={`p-0 ${iconColor} mx-1 inline-block align-middle h-6 w-6 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer flex items-center justify-center text-xs font-semibold transition-colors`}
      onClick={handleClickOpen}
    >
      i
    </button>
  )
}

const DialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props
  return (
    <div className="relative m-0 p-4 text-gray-200 border-b border-gray-700" {...other}>
      <h3 className="text-lg font-semibold text-gray-200">{children}</h3>
      {onClose ? (
        <button
          aria-label="close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors"
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle onClose={handleClose}>{title}</DialogTitle>
            <div className="p-6 text-gray-300">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default InfoPopup
