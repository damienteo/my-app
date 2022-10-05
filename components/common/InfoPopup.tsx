import React from 'react'
import { makeStyles } from '@mui/styles'
import {
  Theme,
  Typography,
  Dialog,
  IconButton,
  IconButtonProps,
} from '@mui/material'
import MuiDialogTitle, {
  DialogTitleProps as MUIDialogTitleProps,
} from '@mui/material/DialogTitle'
import MuiDialogContent from '@mui/material/DialogContent'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import { blue } from '@mui/material/colors/'

interface DialogButtonProps extends IconButtonProps {
  title: string
  iconColor?: 'inherit' | 'default' | 'primary' | 'secondary' | undefined
  handleClickOpen: () => void
}

interface DialogTitleProps extends MUIDialogTitleProps {
  onClose: () => void
  children: React.ReactNode
}

interface InfoPopupProps {
  title: string
  iconColor?: 'inherit' | 'default' | 'primary' | 'secondary' | undefined
  children: React.ReactNode
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  openButton: {
    padding: 0,
    marginTop: `-${theme.spacing(1)}px`,
  },
  content: {
    padding: theme.spacing(2),
  },
}))

const DialogButton = (props: DialogButtonProps) => {
  const { title, handleClickOpen, iconColor = 'primary' } = props
  const classes = useStyles()
  return (
    <IconButton
      aria-label={`${title} info`}
      color={iconColor}
      className={classes.openButton}
      onClick={handleClickOpen}
      sx={{ color: blue[900] }}
    >
      <InfoIcon />
    </IconButton>
  )
}

const DialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props
  const classes = useStyles()
  return (
    <MuiDialogTitle className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
}

const InfoPopup: React.FunctionComponent<InfoPopupProps> = (props) => {
  const { title, children } = props
  const classes = useStyles()
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
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {title}
        </DialogTitle>
        <MuiDialogContent dividers className={classes.content}>
          {children}
        </MuiDialogContent>
      </Dialog>
    </>
  )
}

export default InfoPopup
