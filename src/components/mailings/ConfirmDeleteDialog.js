import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

const ConfirmDeleteDialog = ({
  open,
  title = 'Подтверждение удаления',
  message,
  onClose,
  onConfirm,
  confirming = false,
}) => (
  <Dialog open={open} onClose={confirming ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body1">{message}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Это действие нельзя будет отменить.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={confirming}>
        Отмена
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={confirming}
        startIcon={confirming ? <CircularProgress size={18} color="inherit" /> : null}
      >
        Удалить
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteDialog;
