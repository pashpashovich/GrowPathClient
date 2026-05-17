import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { Add, Delete, Edit, PlayArrow, Search } from '@mui/icons-material';
import { mailingAPI, parseMailingList } from '../../services/notificationApi';
import {
  MAILING_STATUS_LABELS,
  MAILING_TYPE_LABELS,
} from '../../utils/mailingLabels';
import MailingFormDialog from './MailingFormDialog';

const ACTIVE_STATUSES = ['draft', 'scheduled', 'cancelled'];

const MailingsListSection = () => {
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState({});
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadLookups = useCallback(async () => {
    try {
      const [tRes, gRes] = await Promise.all([
        mailingAPI.getEmailTemplates({ page: 1, limit: 500 }),
        mailingAPI.getDistributionGroups({ page: 1, limit: 500 }),
      ]);
      const tMap = {};
      parseMailingList(tRes.data).data.forEach((t) => {
        tMap[t.id] = t.name;
      });
      const gMap = {};
      parseMailingList(gRes.data).data.forEach((g) => {
        gMap[g.id] = g.name;
      });
      setTemplates(tMap);
      setGroups(gMap);
    } catch {
      setTemplates({});
      setGroups({});
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      if (typeFilter) params.type = typeFilter;
      const res = await mailingAPI.getMailings(params);
      const parsed = parseMailingList(res.data);
      const active = parsed.data.filter((m) => ACTIVE_STATUSES.includes(m.status));
      setItems(active);
      setTotal(parsed.pagination.total ?? active.length);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить рассылки');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, typeFilter]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => (m.name || '').toLowerCase().includes(q));
  }, [items, search]);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setPage(0);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((r) => r.id));
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Удалить выбранные рассылки (${ids.length})?`)) return;
    try {
      await Promise.all(ids.map((id) => mailingAPI.deleteMailing(id)));
      setSelected([]);
      setSnack({ open: true, message: 'Удалено' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Ошибка удаления',
      });
    }
  };

  const handleSend = async (id) => {
    try {
      await mailingAPI.sendMailing(id);
      setSnack({ open: true, message: 'Рассылка отправлена' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Не удалось отправить',
      });
    }
  };

  const groupNames = (ids) =>
    (ids || [])
      .map((id) => groups[id])
      .filter(Boolean)
      .join(', ') || '—';

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" align="center">
            Рассылки
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Активные и запланированные рассылки
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Введите название"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Тип</InputLabel>
            <Select
              label="Тип"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Все</MenuItem>
              {Object.entries(MAILING_TYPE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={resetFilters}>
            Сбросить
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Добавить
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            disabled={selected.length !== 1}
            onClick={() => {
              const row = items.find((m) => m.id === selected[0]);
              if (row) {
                setEditing(row);
                setDialogOpen(true);
              }
            }}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            disabled={selected.length === 0}
            onClick={() => handleDelete(selected)}
          >
            Удалить
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selected.length > 0 && selected.length < filtered.length
                        }
                        checked={filtered.length > 0 && selected.length === filtered.length}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Шаблон</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Группы</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        Нет рассылок
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
                      <TableRow key={row.id} hover selected={selected.includes(row.id)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(row.id)}
                            onChange={() => toggleSelect(row.id)}
                          />
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{templates[row.emailTemplateId] || row.emailTemplateId}</TableCell>
                        <TableCell>{MAILING_TYPE_LABELS[row.type] || row.type}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={MAILING_STATUS_LABELS[row.status] || row.status}
                          />
                        </TableCell>
                        <TableCell>{groupNames(row.distributionGroupIds)}</TableCell>
                        <TableCell align="right">
                          {row.status === 'draft' && (
                            <IconButton
                              size="small"
                              title="Отправить"
                              color="primary"
                              onClick={() => handleSend(row.id)}
                            >
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(row);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete([row.id])}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Строк на странице"
            />
          </>
        )}
      </CardContent>

      <MailingFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={() => {
          setSnack({ open: true, message: 'Сохранено' });
          load();
        }}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: '' })}
        message={snack.message}
      />
    </Card>
  );
};

export default MailingsListSection;
