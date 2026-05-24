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
import { hrAPI, userAPI, departmentAPI } from '../../services/api';
import {
  unwrapList,
  getApiErrorMessage,
  buildDepartmentMap,
  resolveDepartmentName,
} from '../../utils/apiResponse';
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

const mapUserToCandidate = (u, departmentMap) => {
  const label = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  const departmentName = resolveDepartmentName(u, departmentMap);
  return {
    id: u.id,
    label,
    email: u.email,
    departmentName,
  };
};

const ProgramMentorsSection = ({ programId, readOnly = false, compact = false }) => {
  const [mentors, setMentors] = useState([]);
  const [departmentMap, setDepartmentMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState(null);
  const [unassigning, setUnassigning] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    departmentAPI
      .getDepartments()
      .then((res) => setDepartmentMap(buildDepartmentMap(unwrapList(res))))
      .catch(() => setDepartmentMap({}));
  }, []);

  const enrichParticipants = useCallback(
    async (participants) => {
      if (!participants.length) return [];

      let deptMap = departmentMap;
      if (!Object.keys(deptMap).length) {
        try {
          const res = await departmentAPI.getDepartments();
          deptMap = buildDepartmentMap(unwrapList(res));
          setDepartmentMap(deptMap);
        } catch {
          deptMap = {};
        }
      }

      let userById = {};
      try {
        const usersRes = await userAPI.getUsers({ role: 'mentor', limit: 100, page: 1 });
        unwrapList(usersRes).forEach((u) => {
          userById[String(u.id)] = u;
        });
      } catch {
        userById = {};
      }

      return participants.map((p) => {
        const user = userById[String(p.userId)];
        const merged = {
          departmentName: p.departmentName,
          departmentId: p.departmentId ?? user?.departmentId,
        };
        let departmentName = resolveDepartmentName(merged, deptMap);
        if (departmentName === '—' && user) {
          departmentName = resolveDepartmentName(user, deptMap);
        }
        return { ...p, departmentName };
      });
    },
    [departmentMap]
  );

  const loadMentors = useCallback(async () => {
    if (!programId) {
      setMentors([]);
      return;
    }
    setLoading(true);
    try {
      const res = await hrAPI.getProgramMentors(programId);
      const list = unwrapList(res);
      setMentors(await enrichParticipants(list));
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
  }, [programId, enrichParticipants]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const openAssignDialog = async () => {
    setDialogOpen(true);
    setSelectedUser(null);
    setCandidatesLoading(true);
    try {
      let deptMap = departmentMap;
      if (!Object.keys(deptMap).length) {
        const deptRes = await departmentAPI.getDepartments();
        deptMap = buildDepartmentMap(unwrapList(deptRes));
        setDepartmentMap(deptMap);
      }

      const res = await userAPI.getUsers({ role: 'mentor', limit: 100, page: 1, status: 'active' });
      const all = unwrapList(res);
      const assignedIds = new Set(mentors.map((m) => String(m.userId)));
      setCandidates(
        all
          .filter((u) => !assignedIds.has(String(u.id)))
          .map((u) => mapUserToCandidate(u, deptMap))
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

  const handleUnassignClick = (mentor) => {
    setUnassignTarget({
      userId: mentor.userId,
      name: participantLabel(mentor),
    });
  };

  const handleUnassignConfirm = async () => {
    if (!unassignTarget) return;
    setUnassigning(true);
    try {
      await hrAPI.unassignProgramMentor(programId, unassignTarget.userId);
      setSnackbar({ open: true, message: 'Ментор снят с программы', severity: 'success' });
      setUnassignTarget(null);
      loadMentors();
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Не удалось снять ментора'),
        severity: 'error',
      });
    } finally {
      setUnassigning(false);
    }
  };

  const colSpan = readOnly ? 4 : 5;

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
                <TableCell sx={{ fontWeight: 600 }}>Отдел</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Назначен</TableCell>
                {!readOnly && <TableCell align="right" sx={{ fontWeight: 600 }}>Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {mentors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Менторы не назначены
                  </TableCell>
                </TableRow>
              ) : (
                mentors.map((m) => (
                  <TableRow key={m.userId} hover>
                    <TableCell>{participantLabel(m)}</TableCell>
                    <TableCell>{m.email || '—'}</TableCell>
                    <TableCell>{m.departmentName || '—'}</TableCell>
                    <TableCell>{formatDate(m.assignedAt)}</TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        <Tooltip title="Снять с программы">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUnassignClick(m)}
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
              getOptionLabel={(opt) => {
                if (!opt) return '';
                const dept = opt.departmentName && opt.departmentName !== '—' ? ` · ${opt.departmentName}` : '';
                return `${opt.label}${dept}${opt.email ? ` (${opt.email})` : ''}`;
              }}
              isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Box sx={{ py: 0.25 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {option.email || '—'}
                        {option.departmentName && option.departmentName !== '—'
                          ? ` · ${option.departmentName}`
                          : ''}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
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

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Снять ментора с программы"
        message={
          unassignTarget
            ? `Снять ${unassignTarget.name} с программы стажировки?`
            : ''
        }
        detail="Если у ментора есть закреплённые стажёры, операция может быть недоступна."
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

export default ProgramMentorsSection;
