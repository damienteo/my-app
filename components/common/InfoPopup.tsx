import React from 'react'
import { withStyles, createStyles } from '@material-ui/core/styles'
import {
  Theme,
  Typography,
  Dialog,
  IconButton,
  IconButtonProps,
} from '@material-ui/core'
import MuiDialogTitle, {
  DialogTitleProps as MUIDialogTitleProps,
} from '@material-ui/core/DialogTitle'
import MuiDialogContent from '@material-ui/core/DialogContent'
import CloseIcon from '@material-ui/icons/Close'
import InfoIcon from '@material-ui/icons/Info'

interface DialogButtonProps extends IconButtonProps {
  title: string
  iconColor?: 'inherit' | 'default' | 'primary' | 'secondary' | undefined
  handleClickOpen: () => void
  classes: any
}

interface DialogTitleProps extends MUIDialogTitleProps {
  onClose: () => void
  classes: any
  children: React.ReactNode
}

interface InfoPopupProps {
  title: string
  iconColor?: 'inherit' | 'default' | 'primary' | 'secondary' | undefined
}

const styles = (theme: Theme) =>
  createStyles({
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
  })

const DialogButton = withStyles(styles)((props: DialogButtonProps) => {
  const { title, handleClickOpen, iconColor = 'primary', classes } = props
  return (
    <IconButton
      aria-label={`${title} info`}
      color={iconColor}
      className={classes.openButton}
      onClick={handleClickOpen}
    >
      <InfoIcon />
    </IconButton>
  )
})

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
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
})

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent)

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
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {title}
        </DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
      </Dialog>
    </>
  )
}

export default InfoPopup
