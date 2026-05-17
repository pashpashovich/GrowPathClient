import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
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
import { Delete, Search } from '@mui/icons-material';
import { mailingAPI, parseMailingList } from '../../services/notificationApi';
import {
  formatDateTime,
  MAILING_TYPE_LABELS,
} from '../../utils/mailingLabels';

const HistorySection = () => {
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        status: 'sent',
      };
      if (typeFilter) params.type = typeFilter;
      const res = await mailingAPI.getMailings(params);
      const parsed = parseMailingList(res.data);
      setItems(parsed.data);
      setTotal(parsed.pagination.total ?? parsed.data.length);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить историю');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, typeFilter]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await mailingAPI.getEmailTemplates({ page: 1, limit: 500 });
        const map = {};
        parseMailingList(res.data).data.forEach((t) => {
          map[t.id] = t.name;
        });
        setTemplates(map);
      } catch {
        setTemplates({});
      }
    };
    loadTemplates();
  }, []);

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

  const handleDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Удалить записи (${selected.length})?`)) return;
    try {
      await Promise.all(selected.map((id) => mailingAPI.deleteMailing(id)));
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

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" align="center">
            История рассылок
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Отправленные рассылки
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

        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            disabled={selected.length === 0}
            onClick={handleDelete}
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
                    <TableCell>Дата и время отправки</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        История пуста
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(row.id)}
                            onChange={() => toggleSelect(row.id)}
                          />
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>
                          {templates[row.emailTemplateId] || row.emailTemplateId || '—'}
                        </TableCell>
                        <TableCell>{MAILING_TYPE_LABELS[row.type] || row.type}</TableCell>
                        <TableCell>{formatDateTime(row.executeAt || row.updatedAt)}</TableCell>
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

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: '' })}
        message={snack.message}
      />
    </Card>
  );
};

export default HistorySection;
