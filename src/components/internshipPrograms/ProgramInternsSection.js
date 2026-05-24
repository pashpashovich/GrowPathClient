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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { hrAPI, userAPI } from '../../services/api';
import { unwrapList, getApiErrorMessage } from '../../utils/apiResponse';
import ActionSnackbar from '../mailings/ActionSnackbar';
import ConfirmDialog from '../ui/ConfirmDialog';

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

const ProgramInternsSection = ({ programId, program, readOnly = false, compact = false }) => {
  const [interns, setInterns] = useState([]);
  const [programMentors, setProgramMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState(null);
  const [unassigning, setUnassigning] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const maxPlaces = program?.maxPlaces;
  const placesFull = maxPlaces != null && interns.length >= maxPlaces;

  const loadData = useCallback(async () => {
    if (!programId) {
      setInterns([]);
      setProgramMentors([]);
      return;
    }
    setLoading(true);
    try {
      const [internsRes, mentorsRes] = await Promise.all([
        hrAPI.getProgramInterns(programId),
        hrAPI.getProgramMentors(programId),
      ]);
      setInterns(unwrapList(internsRes));
      setProgramMentors(unwrapList(mentorsRes));
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось загрузить стажёров программы'),
        severity: 'error',
      });
      setInterns([]);
      setProgramMentors([]);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAssignDialog = async () => {
    if (placesFull) {
      setSnackbar({
        open: true,
        message: `Достигнут лимит мест (${maxPlaces})`,
        severity: 'warning',
      });
      return;
    }
    if (programMentors.length === 0) {
      setSnackbar({
        open: true,
        message: 'Сначала назначьте хотя бы одного ментора на программу',
        severity: 'warning',
      });
      return;
    }
    setDialogOpen(true);
    setSelectedUser(null);
    setSelectedMentorId(String(programMentors[0]?.userId || ''));
    setCandidatesLoading(true);
    try {
      const res = await userAPI.getUsers({ role: 'intern', limit: 100, page: 1, status: 'active' });
      const all = unwrapList(res);
      const assignedIds = new Set(interns.map((i) => String(i.userId)));
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
        message: getApiErrorMessage(error, 'Не удалось загрузить список стажёров'),
        severity: 'error',
      });
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser?.id || !selectedMentorId) return;
    setSubmitting(true);
    try {
      await hrAPI.assignProgramIntern(programId, {
        userId: Number(selectedUser.id),
        mentorId: Number(selectedMentorId),
      });
      setSnackbar({ open: true, message: 'Стажёр назначен на программу', severity: 'success' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось назначить стажёра'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignClick = (intern) => {
    setUnassignTarget({
      userId: intern.userId,
      name: participantLabel(intern),
    });
  };

  const handleUnassignConfirm = async () => {
    if (!unassignTarget) return;
    setUnassigning(true);
    try {
      await hrAPI.unassignProgramIntern(programId, unassignTarget.userId);
      setSnackbar({ open: true, message: 'Стажёр снят с программы', severity: 'success' });
      setUnassignTarget(null);
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось снять стажёра'),
        severity: 'error',
      });
    } finally {
      setUnassigning(false);
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
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Стажёры программы
            </Typography>
            {maxPlaces != null && (
              <Typography variant="caption" color="text.secondary">
                Занято мест: {interns.length} / {maxPlaces}
              </Typography>
            )}
          </Box>
          {!readOnly && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={openAssignDialog}
              disabled={placesFull}
            >
              Добавить стажёра
            </Button>
          )}
        </Box>
      )}

      {compact && !readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={openAssignDialog}
            disabled={placesFull}
          >
            Добавить
          </Button>
        </Box>
      )}

      {placesFull && !readOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Все места на программе заняты
        </Alert>
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
                <TableCell sx={{ fontWeight: 600 }}>Ментор</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Назначен</TableCell>
                {!readOnly && <TableCell align="right" sx={{ fontWeight: 600 }}>Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {interns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 4 : 5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Стажёры не назначены
                  </TableCell>
                </TableRow>
              ) : (
                interns.map((intern) => (
                  <TableRow key={intern.userId} hover>
                    <TableCell>{participantLabel(intern)}</TableCell>
                    <TableCell>{intern.email || '—'}</TableCell>
                    <TableCell>{intern.mentorName || '—'}</TableCell>
                    <TableCell>{formatDate(intern.assignedAt)}</TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        <Tooltip title="Снять с программы">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUnassignClick(intern)}
                            aria-label="Снять стажёра"
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
        <DialogTitle>Назначить стажёра на программу</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={candidates}
              loading={candidatesLoading}
              value={selectedUser}
              onChange={(_, val) => setSelectedUser(val)}
              getOptionLabel={(opt) => (opt ? `${opt.label}${opt.email ? ` (${opt.email})` : ''}` : '')}
              isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Стажёр" placeholder="Выберите пользователя" />
              )}
              noOptionsText={candidatesLoading ? 'Загрузка...' : 'Нет доступных стажёров'}
            />
            <FormControl fullWidth>
              <InputLabel>Ментор</InputLabel>
              <Select
                value={selectedMentorId}
                label="Ментор"
                onChange={(e) => setSelectedMentorId(e.target.value)}
              >
                {programMentors.map((m) => (
                  <MenuItem key={m.userId} value={String(m.userId)}>
                    {participantLabel(m)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedUser || !selectedMentorId || submitting}
          >
            {submitting ? 'Сохранение...' : 'Назначить'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Снять стажёра с программы"
        message={
          unassignTarget
            ? `Снять ${unassignTarget.name} с программы стажировки?`
            : ''
        }
        detail="Если у стажёра есть ИПР по этой программе, операция может быть недоступна."
        confirmLabel="Снять"
        confirmColor="error"
        confirming={unassigning}
        onClose={() => !unassigning && setUnassignTarget(null)}
        onConfirm={handleUnassignConfirm}
      />

      <ActionSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
};

export default ProgramInternsSection;
