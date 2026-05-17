import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
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
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import ActionSnackbar from './ActionSnackbar';

const emptyForm = { name: '', description: '' };

const GroupsSection = () => {
  const [items, setItems] = useState([]);
  const [allRecipients, setAllRecipients] = useState([]);
  const [groupRecipients, setGroupRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, label: '' });
  const [deleting, setDeleting] = useState(false);

  const groupId = editing?.id;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mailingAPI.getDistributionGroups({
        page: page + 1,
        limit: rowsPerPage,
      });
      const parsed = parseMailingList(res.data);
      setItems(parsed.data);
      setTotal(parsed.pagination.total ?? parsed.data.length);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить группы');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  const loadRecipientsCatalog = useCallback(async () => {
    try {
      const res = await mailingAPI.getRecipients({ page: 1, limit: 500 });
      setAllRecipients(parseMailingList(res.data).data);
    } catch {
      setAllRecipients([]);
    }
  }, []);

  const loadGroupMembers = useCallback(async (id) => {
    if (!id) {
      setGroupRecipients([]);
      return;
    }
    setMembersLoading(true);
    try {
      const res = await mailingAPI.getDistributionGroupRecipients(id);
      setGroupRecipients(parseMailingList(res.data).data);
    } catch {
      setGroupRecipients([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (g) =>
        (g.name || '').toLowerCase().includes(q) ||
        (g.description || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const memberIds = useMemo(
    () => new Set(groupRecipients.map((r) => String(r.id))),
    [groupRecipients]
  );

  const availableRecipients = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    return allRecipients.filter((r) => {
      if (memberIds.has(String(r.id))) return false;
      if (!q) return true;
      const name = (r.fullName || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [allRecipients, memberIds, recipientSearch]);

  const resetDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setGroupRecipients([]);
    setSelectedRecipient(null);
    setRecipientSearch('');
  };

  const openCreate = () => {
    resetDialog();
    setDialogOpen(true);
  };

  const openEdit = async (row) => {
    setEditing(row);
    setForm({ name: row.name || '', description: row.description || '' });
    setSelectedRecipient(null);
    setRecipientSearch('');
    setDialogOpen(true);
    await loadRecipientsCatalog();
    await loadGroupMembers(row.id);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetDialog();
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      setSnack({ open: true, message: 'Укажите название', severity: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
      };
      if (editing?.id) {
        await mailingAPI.updateDistributionGroup(editing.id, payload);
        setSnack({ open: true, message: 'Группа сохранена', severity: 'success' });
      } else {
        const res = await mailingAPI.createDistributionGroup(payload);
        const created = res.data;
        setEditing(created);
        setSnack({
          open: true,
          message: 'Группа создана. Теперь можно добавить участников.',
          severity: 'success',
        });
        await loadRecipientsCatalog();
        setGroupRecipients([]);
      }
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

  const handleAddMember = async () => {
    if (!groupId || !selectedRecipient?.id) return;
    setAddingMember(true);
    try {
      await mailingAPI.addRecipientToGroup(groupId, {
        recipientId: selectedRecipient.id,
      });
      setSelectedRecipient(null);
      setRecipientSearch('');
      await loadGroupMembers(groupId);
      setSnack({ open: true, message: 'Участник добавлен', severity: 'success' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Не удалось добавить',
        severity: 'error',
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (recipientId) => {
    if (!groupId) return;
    try {
      await mailingAPI.removeRecipientFromGroup(groupId, recipientId);
      await loadGroupMembers(groupId);
      setSnack({ open: true, message: 'Участник удалён', severity: 'success' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Ошибка',
        severity: 'error',
      });
    }
  };

  const openDeleteDialog = (id, label) => {
    setDeleteTarget({ id, label });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget.id) return;
    setDeleting(true);
    try {
      await mailingAPI.deleteDistributionGroup(deleteTarget.id);
      setSnack({ open: true, message: 'Группа удалена', severity: 'success' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Ошибка удаления',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget({ id: null, label: '' });
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" align="center">
            Группы получателей
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Группы для массовых рассылок
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
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Button variant="outlined" onClick={() => setSearch('')}>
            Сбросить
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Добавить
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
                    <TableCell>Название</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Участников</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        Нет групп
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.description || '—'}</TableCell>
                        <TableCell>{row.recipientCount ?? 0}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" title="Редактировать" onClick={() => openEdit(row)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            title="Удалить"
                            onClick={() => openDeleteDialog(row.id, row.name)}
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

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? 'Редактировать группу' : 'Новая группа'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Название"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Описание"
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <Divider />

          <Typography variant="subtitle2" fontWeight={600}>
            Участники группы
          </Typography>

          {!groupId ? (
            <Alert severity="info" variant="outlined">
              Сначала сохраните группу, затем добавьте получателей из списка.
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  value={selectedRecipient}
                  onChange={(_, recipient) => {
                    setSelectedRecipient(recipient);
                    if (recipient) {
                      setRecipientSearch(
                        recipient.email
                          ? `${recipient.fullName || '—'} · ${recipient.email}`
                          : recipient.fullName || ''
                      );
                    } else {
                      setRecipientSearch('');
                    }
                  }}
                  inputValue={recipientSearch}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'reset') {
                      setRecipientSearch(value);
                      return;
                    }
                    if (reason === 'clear') {
                      setRecipientSearch('');
                      setSelectedRecipient(null);
                      return;
                    }
                    if (reason === 'input') {
                      setRecipientSearch(value);
                      if (
                        selectedRecipient &&
                        value !==
                          (selectedRecipient.email
                            ? `${selectedRecipient.fullName || '—'} · ${selectedRecipient.email}`
                            : selectedRecipient.fullName || '')
                      ) {
                        setSelectedRecipient(null);
                      }
                    }
                  }}
                  options={availableRecipients}
                  loading={false}
                  getOptionLabel={(r) =>
                    r.email ? `${r.fullName || '—'} · ${r.email}` : r.fullName || ''
                  }
                  isOptionEqualToValue={(a, b) => String(a?.id) === String(b?.id)}
                  filterOptions={(options) => options}
                  noOptionsText="Нет получателей для добавления"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Добавить получателя"
                      placeholder="Поиск по ФИО или email"
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    const { children: _c, ...liProps } = optionProps;
                    return (
                      <Box
                        component="li"
                        key={key}
                        {...liProps}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                      >
                        <Typography variant="body2">{option.fullName || '—'}</Typography>
                        {option.email ? (
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        ) : null}
                      </Box>
                    );
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={!selectedRecipient || addingMember}
                  sx={{ mt: 0.25, minWidth: 110 }}
                >
                  {addingMember ? '…' : 'Добавить'}
                </Button>
              </Box>

              {membersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : groupRecipients.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  В группе пока никого нет
                </Typography>
              ) : (
                <List dense disablePadding sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                  {groupRecipients.map((r) => (
                    <ListItem
                      key={r.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label="Удалить из группы"
                          onClick={() => handleRemoveMember(r.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={r.fullName || '—'}
                        secondary={r.email || undefined}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{groupId ? 'Закрыть' : 'Отмена'}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : groupId ? 'Сохранить' : 'Создать группу'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        message={`Вы уверены, что хотите удалить группу «${deleteTarget.label}»?`}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirming={deleting}
      />

      <ActionSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Card>
  );
};

export default GroupsSection;
