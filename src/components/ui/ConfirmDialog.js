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

const ConfirmDialog = ({
  open,
  title = 'Подтверждение',
  message,
  detail,
  onClose,
  onConfirm,
  confirming = false,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  confirmColor = 'primary',
}) => (
  <Dialog open={open} onClose={confirming ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body1">{message}</Typography>
      {detail && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {detail}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={confirming}>
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color={confirmColor}
        disabled={confirming}
        startIcon={confirming ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
