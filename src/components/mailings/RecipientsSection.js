import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
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
import { userAPI } from '../../services/api';
import { RECIPIENT_TYPE_LABELS } from '../../utils/mailingLabels';
import { getUserDisplayName, getUserOptionLabel } from '../../utils/userDisplayName';

const emptyForm = { email: '', fullName: '', type: 'external' };
const USER_PAGE_SIZE = 20;

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

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(false);
  const [excludedUserIds, setExcludedUserIds] = useState(() => new Set());
  const userSearchDebounceRef = useRef(null);

  const isRegisteredForm = form.type === 'user' || editing?.type === 'user';

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

  const resetUserPicker = () => {
    setSelectedUser(null);
    setUserOptions([]);
    setUserSearchInput('');
    setUserPage(1);
    setUserHasMore(false);
  };

  const loadExcludedUserIds = useCallback(async (keepUserId) => {
    try {
      const res = await mailingAPI.getRecipients({ type: 'user', page: 1, limit: 500 });
      const ids = parseMailingList(res.data).data
        .map((r) => r.userId)
        .filter(Boolean)
        .map(String);
      const next = new Set(ids);
      if (keepUserId) next.delete(String(keepUserId));
      setExcludedUserIds(next);
    } catch {
      setExcludedUserIds(new Set());
    }
  }, []);

  const fetchUsers = useCallback(
    async (search, pageNum, append) => {
      setUsersLoading(true);
      try {
        const res = await userAPI.getUsers({
          page: pageNum,
          limit: USER_PAGE_SIZE,
          ...(search?.trim() ? { search: search.trim() } : {}),
        });
        const data = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
        const pagination = res.data?.pagination;
        const filtered = data.filter((u) => !excludedUserIds.has(String(u.id)));

        if (append) {
          setUserOptions((prev) => {
            const known = new Set(prev.map((u) => String(u.id)));
            return [...prev, ...filtered.filter((u) => !known.has(String(u.id)))];
          });
        } else {
          setUserOptions(filtered);
        }

        const totalPages = pagination?.totalPages ?? 1;
        setUserHasMore(pageNum < totalPages);
      } catch {
        if (!append) setUserOptions([]);
        setUserHasMore(false);
      } finally {
        setUsersLoading(false);
      }
    },
    [excludedUserIds]
  );

  useEffect(() => {
    if (!dialogOpen || !isRegisteredForm) return undefined;

    if (userSearchDebounceRef.current) {
      clearTimeout(userSearchDebounceRef.current);
    }

    userSearchDebounceRef.current = setTimeout(() => {
      setUserPage(1);
      fetchUsers(userSearchInput, 1, false);
    }, 300);

    return () => {
      if (userSearchDebounceRef.current) {
        clearTimeout(userSearchDebounceRef.current);
      }
    };
  }, [dialogOpen, isRegisteredForm, userSearchInput, fetchUsers, excludedUserIds]);

  const resetFilters = () => {
    setNameSearch('');
    setEmailSearch('');
    setTypeFilter('');
    setPage(0);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    resetUserPicker();
    setDialogOpen(true);
  };

  const openEdit = async (row) => {
    setEditing(row);
    resetUserPicker();
    setForm({
      email: row.email || '',
      fullName: row.fullName || '',
      type: row.type || 'external',
    });
    setDialogOpen(true);

    if (row.type === 'user' && row.userId) {
      await loadExcludedUserIds(row.userId);
      try {
        const res = await userAPI.getUserById(row.userId);
        const user = res.data?.data ?? res.data;
        if (user) {
          setSelectedUser(user);
          setUserOptions([user]);
        }
      } catch {
        setSelectedUser({
          id: row.userId,
          email: row.email,
          name: row.fullName,
        });
      }
    }
  };

  useEffect(() => {
    if (!dialogOpen) return;
    if (isRegisteredForm) {
      loadExcludedUserIds(editing?.userId);
    }
  }, [dialogOpen, isRegisteredForm, editing?.userId, loadExcludedUserIds]);

  const handleTypeChange = (type) => {
    setForm((f) => ({ ...f, type }));
    resetUserPicker();
    if (type === 'user') {
      setUserPage(1);
      fetchUsers('', 1, false);
    }
  };

  const handleSave = async () => {
    if (isRegisteredForm) {
      if (!selectedUser?.id) {
        setSnack({ open: true, message: 'Выберите пользователя', severity: 'warning' });
        return;
      }
    } else if (!form.email?.trim() || !form.fullName?.trim()) {
      setSnack({ open: true, message: 'Заполните email и ФИО', severity: 'warning' });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        if (editing.type === 'user') {
          await mailingAPI.updateRecipient(editing.id, {
            userId: String(selectedUser.id),
          });
        } else {
          await mailingAPI.updateRecipient(editing.id, {
            email: form.email.trim(),
            fullName: form.fullName.trim(),
          });
        }
      } else if (form.type === 'user') {
        await mailingAPI.createRecipient({
          type: 'user',
          userId: String(selectedUser.id),
        });
      } else {
        await mailingAPI.createRecipient({
          type: 'external',
          email: form.email.trim(),
          fullName: form.fullName.trim(),
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

  const handleUserListScroll = (event) => {
    const node = event.currentTarget;
    if (
      node.scrollTop + node.clientHeight >= node.scrollHeight - 8 &&
      userHasMore &&
      !usersLoading
    ) {
      const nextPage = userPage + 1;
      setUserPage(nextPage);
      fetchUsers(userSearchInput, nextPage, true);
    }
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editing ? 'Редактировать получателя' : 'Новый получатель'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {!editing && (
            <FormControl fullWidth>
              <InputLabel>Тип</InputLabel>
              <Select label="Тип" value={form.type} onChange={(e) => handleTypeChange(e.target.value)}>
                <MenuItem value="user">Зарегистрированный</MenuItem>
                <MenuItem value="external">Внешний</MenuItem>
              </Select>
            </FormControl>
          )}

          {isRegisteredForm ? (
            <Autocomplete
              value={selectedUser}
              onChange={(_, user) => setSelectedUser(user)}
              inputValue={userSearchInput}
              onInputChange={(_, value, reason) => {
                if (reason === 'input' || reason === 'clear') {
                  setUserSearchInput(value);
                }
              }}
              options={userOptions}
              loading={usersLoading}
              getOptionLabel={(option) => getUserOptionLabel(option)}
              isOptionEqualToValue={(a, b) => String(a?.id) === String(b?.id)}
              filterOptions={(options) => options}
              noOptionsText={
                usersLoading ? 'Загрузка…' : 'Нет доступных пользователей'
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Пользователь"
                  placeholder="Поиск по ФИО"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                const { children: _ignored, ...liProps } = optionProps;
                const name = getUserDisplayName(option);
                const email = option.email?.trim();
                return (
                  <Box
                    component="li"
                    key={key}
                    {...liProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 0.25,
                      py: 1.25,
                      px: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} lineHeight={1.4}>
                      {name}
                    </Typography>
                    {email && name.toLowerCase() !== email.toLowerCase() ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: 'none', lineHeight: 1.3, wordBreak: 'break-all' }}
                      >
                        {email}
                      </Typography>
                    ) : null}
                  </Box>
                );
              }}
              slotProps={{
                listbox: {
                  onScroll: handleUserListScroll,
                  sx: { maxHeight: 280 },
                },
              }}
            />
          ) : (
            <>
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
            </>
          )}

          {editing && editing.type === 'user' && (
            <Typography variant="caption" color="text.secondary">
              Email и ФИО подтягиваются из профиля пользователя на сервере.
            </Typography>
          )}
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
