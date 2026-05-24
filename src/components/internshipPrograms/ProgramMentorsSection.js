import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { hrAPI, userAPI } from '../../services/api';
import { unwrapList, getApiErrorMessage } from '../../utils/apiResponse';
import ActionSnackbar from '../mailings/ActionSnackbar';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const participantLabel = (p) => {
  if (p.name) return p.name;
  const parts = [p.firstName, p.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : `ID ${p.userId}`;
};

const ProgramMentorsSection = ({ programId, readOnly = false, compact = false }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadMentors = useCallback(async () => {
    if (!programId) {
      setMentors([]);
      return;
    }
    setLoading(true);
    try {
      const res = await hrAPI.getProgramMentors(programId);
      setMentors(unwrapList(res));
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось загрузить менторов программы'),
        severity: 'error',
      });
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const openAssignDialog = async () => {
    setDialogOpen(true);
    setSelectedUser(null);
    setCandidatesLoading(true);
    try {
      const res = await userAPI.getUsers({ role: 'mentor', limit: 100, page: 1, status: 'active' });
      const all = unwrapList(res);
      const assignedIds = new Set(mentors.map((m) => String(m.userId)));
      setCandidates(
        all.filter((u) => !assignedIds.has(String(u.id))).map((u) => ({
          id: u.id,
          label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
          email: u.email,
        }))
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось загрузить список менторов'),
        severity: 'error',
      });
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser?.id) return;
    setSubmitting(true);
    try {
      await hrAPI.assignProgramMentor(programId, { userId: Number(selectedUser.id) });
      setSnackbar({ open: true, message: 'Ментор назначен на программу', severity: 'success' });
      setDialogOpen(false);
      loadMentors();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось назначить ментора'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (userId) => {
    if (!window.confirm('Снять ментора с программы?')) return;
    try {
      await hrAPI.unassignProgramMentor(programId, userId);
      setSnackbar({ open: true, message: 'Ментор снят с программы', severity: 'success' });
      loadMentors();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось снять ментора'),
        severity: 'error',
      });
    }
  };

  if (!programId) {
    return (
      <Typography color="text.secondary" variant="body2">
        Выберите программу стажировки
      </Typography>
    );
  }

  return (
    <Box>
      {!compact && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Менторы программы
          </Typography>
          {!readOnly && (
            <Button variant="contained" size="small" startIcon={<Add />} onClick={openAssignDialog}>
              Добавить ментора
            </Button>
          )}
        </Box>
      )}

      {compact && !readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={openAssignDialog}>
            Добавить
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>ФИО</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Назначен</TableCell>
                {!readOnly && <TableCell align="right" sx={{ fontWeight: 600 }}>Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {mentors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 3 : 4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Менторы не назначены
                  </TableCell>
                </TableRow>
              ) : (
                mentors.map((m) => (
                  <TableRow key={m.userId} hover>
                    <TableCell>{participantLabel(m)}</TableCell>
                    <TableCell>{m.email || '—'}</TableCell>
                    <TableCell>{formatDate(m.assignedAt)}</TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        <Tooltip title="Снять с программы">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUnassign(m.userId)}
                            aria-label="Снять ментора"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Назначить ментора на программу</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              options={candidates}
              loading={candidatesLoading}
              value={selectedUser}
              onChange={(_, val) => setSelectedUser(val)}
              getOptionLabel={(opt) => (opt ? `${opt.label}${opt.email ? ` (${opt.email})` : ''}` : '')}
              isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Ментор" placeholder="Выберите пользователя" />
              )}
              noOptionsText={candidatesLoading ? 'Загрузка...' : 'Нет доступных менторов'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleAssign} disabled={!selectedUser || submitting}>
            {submitting ? 'Сохранение...' : 'Назначить'}
          </Button>
        </DialogActions>
      </Dialog>

      <ActionSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
};

export default ProgramMentorsSection;
