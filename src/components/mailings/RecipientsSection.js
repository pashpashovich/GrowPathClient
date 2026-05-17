import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { mailingAPI, parseMailingList } from '../../services/notificationApi';
import { RECIPIENT_TYPE_LABELS } from '../../utils/mailingLabels';

const emptyForm = { email: '', fullName: '', userId: '', type: 'external' };

const RecipientsSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (typeFilter) params.type = typeFilter;
      const res = await mailingAPI.getRecipients(params);
      const parsed = parseMailingList(res.data);
      setItems(parsed.data);
      setTotal(parsed.pagination.total ?? parsed.data.length);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить получателей');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const qName = nameSearch.trim().toLowerCase();
    const qEmail = emailSearch.trim().toLowerCase();
    return items.filter((item) => {
      if (qName && !(item.fullName || '').toLowerCase().includes(qName)) return false;
      if (qEmail && !(item.email || '').toLowerCase().includes(qEmail)) return false;
      return true;
    });
  }, [items, nameSearch, emailSearch]);

  const resetFilters = () => {
    setNameSearch('');
    setEmailSearch('');
    setTypeFilter('');
    setPage(0);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      email: row.email || '',
      fullName: row.fullName || '',
      userId: row.userId || '',
      type: row.type || 'external',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.email?.trim() || !form.fullName?.trim()) {
      setSnack({ open: true, message: 'Заполните email и ФИО', severity: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        type: editing ? undefined : form.type,
        userId: form.userId?.trim() || undefined,
      };
      if (editing) {
        await mailingAPI.updateRecipient(editing.id, {
          email: payload.email,
          fullName: payload.fullName,
          userId: payload.userId,
        });
      } else {
        await mailingAPI.createRecipient({
          email: payload.email,
          fullName: payload.fullName,
          type: form.type,
          userId: payload.userId,
        });
      }
      setDialogOpen(false);
      setSnack({ open: true, message: 'Сохранено', severity: 'success' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Ошибка сохранения',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Удалить выбранных получателей (${ids.length})?`)) return;
    try {
      await Promise.all(ids.map((id) => mailingAPI.deleteRecipient(id)));
      setSelected([]);
      setSnack({ open: true, message: 'Удалено', severity: 'success' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Ошибка удаления',
        severity: 'error',
      });
    }
  };

  const toggleAll = (checked) => {
    setSelected(checked ? filtered.map((r) => r.id) : []);
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" align="center">
            Получатели
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Список адресатов для рассылок
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
            label="ФИО"
            placeholder="Введите ФИО"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200, flex: 1 }}
          />
          <TextField
            size="small"
            label="Электронная почта"
            placeholder="Введите email"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Тип получателя</InputLabel>
            <Select
              label="Тип получателя"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="user">Зарегистрированный</MenuItem>
              <MenuItem value="external">Внешний</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={resetFilters}>
            Сбросить
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Добавить
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
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>ФИО</TableCell>
                    <TableCell>Электронная почта</TableCell>
                    <TableCell>Тип получателя</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Нет записей</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(row.id)}
                            onChange={() => toggleOne(row.id)}
                          />
                        </TableCell>
                        <TableCell>{row.fullName || '—'}</TableCell>
                        <TableCell>{row.email || '—'}</TableCell>
                        <TableCell>
                          {RECIPIENT_TYPE_LABELS[row.type] || row.type || '—'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(row)}>
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
              component="div"
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Редактировать получателя' : 'Новый получатель'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="ФИО"
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <TextField
            label="Email"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          {!editing && (
            <FormControl fullWidth>
              <InputLabel>Тип</InputLabel>
              <Select
                label="Тип"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <MenuItem value="user">Зарегистрированный</MenuItem>
                <MenuItem value="external">Внешний</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            label="ID пользователя (опционально)"
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        message={snack.message}
      />
    </Card>
  );
};

export default RecipientsSection;
