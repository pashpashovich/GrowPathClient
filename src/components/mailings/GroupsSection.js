import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
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
import { Add, Delete, Edit, GroupAdd, Search } from '@mui/icons-material';
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
  const [membersOpen, setMembersOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [addRecipientId, setAddRecipientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, label: '' });
  const [deleting, setDeleting] = useState(false);

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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || '', description: row.description || '' });
    setDialogOpen(true);
  };

  const openMembers = async (group) => {
    setActiveGroup(group);
    setMembersOpen(true);
    await loadRecipientsCatalog();
    try {
      const res = await mailingAPI.getDistributionGroupRecipients(group.id);
      setGroupRecipients(parseMailingList(res.data).data);
    } catch {
      setGroupRecipients([]);
    }
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
      if (editing) {
        await mailingAPI.updateDistributionGroup(editing.id, payload);
      } else {
        await mailingAPI.createDistributionGroup(payload);
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

  const handleAddMember = async () => {
    if (!activeGroup || !addRecipientId) return;
    try {
      await mailingAPI.addRecipientToGroup(activeGroup.id, {
        recipientId: addRecipientId,
      });
      setAddRecipientId('');
      const res = await mailingAPI.getDistributionGroupRecipients(activeGroup.id);
      setGroupRecipients(parseMailingList(res.data).data);
      setSnack({ open: true, message: 'Участник добавлен', severity: 'success' });
      load();
    } catch (e) {
      setSnack({
        open: true,
        message: e.response?.data?.message || 'Не удалось добавить',
        severity: 'error',
      });
    }
  };

  const handleRemoveMember = async (recipientId) => {
    if (!activeGroup) return;
    try {
      await mailingAPI.removeRecipientFromGroup(activeGroup.id, recipientId);
      const res = await mailingAPI.getDistributionGroupRecipients(activeGroup.id);
      setGroupRecipients(parseMailingList(res.data).data);
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
                          <IconButton
                            size="small"
                            title="Участники"
                            onClick={() => openMembers(row)}
                          >
                            <GroupAdd fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => openEdit(row)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Редактировать группу' : 'Новая группа'}</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Участники: {activeGroup?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Добавить получателя</InputLabel>
              <Select
                label="Добавить получателя"
                value={addRecipientId}
                onChange={(e) => setAddRecipientId(e.target.value)}
              >
                <MenuItem value="">Выберите…</MenuItem>
                {allRecipients.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.fullName} ({r.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddMember} disabled={!addRecipientId}>
              Добавить
            </Button>
          </Box>
          <List dense>
            {groupRecipients.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                В группе пока никого нет
              </Typography>
            ) : (
              groupRecipients.map((r) => (
                <ListItem
                  key={r.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveMember(r.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={r.fullName} secondary={r.email} />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersOpen(false)}>Закрыть</Button>
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
