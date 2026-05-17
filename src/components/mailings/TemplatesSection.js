import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
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
import { Add, AttachFile, Delete, Download, Edit, Search } from '@mui/icons-material';
import { mailingAPI, parseMailingList } from '../../services/notificationApi';

const emptyForm = { name: '', subject: '', body: '' };

const TemplatesSection = () => {
  const [items, setItems] = useState([]);
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
  const [attachments, setAttachments] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mailingAPI.getEmailTemplates({
        page: page + 1,
        limit: rowsPerPage,
      });
      const parsed = parseMailingList(res.data);
      setItems(parsed.data);
      setTotal(parsed.pagination.total ?? parsed.data.length);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить шаблоны');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setAttachments([]);
    setPendingFiles([]);
    setDialogOpen(true);
  };

  const openEdit = async (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      subject: row.subject || '',
      body: row.body || '',
    });
    setPendingFiles([]);
    try {
      const res = await mailingAPI.getEmailTemplateById(row.id);
      setAttachments(res.data?.attachments || []);
    } catch {
      setAttachments(row.attachments || []);
    }
    setDialogOpen(true);
  };

  const uploadPendingFiles = async () => {
    const uploaded = [];
    for (const file of pendingFiles) {
      const presign = await mailingAPI.presignTemplateAttachment({
        fileName: file.name,
      });
      const { objectKey, uploadUrl } = presign.data;
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });
      uploaded.push({ name: file.name, token: objectKey });
    }
    return uploaded;
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.subject?.trim()) {
      setSnack({ open: true, message: 'Заполните название и тему', severity: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const newAttachments = await uploadPendingFiles();
      const attachmentPayload = [
        ...attachments.map((a) => ({ name: a.name, token: a.token })),
        ...newAttachments,
      ];
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        body: form.body || '',
        attachments: attachmentPayload,
      };
      if (editing) {
        await mailingAPI.updateEmailTemplate(editing.id, payload);
      } else {
        await mailingAPI.createEmailTemplate(payload);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить шаблон?')) return;
    try {
      await mailingAPI.deleteEmailTemplate(id);
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

  const handleDownload = async (templateId, attachment) => {
    try {
      const res = await mailingAPI.downloadTemplateAttachment(templateId, attachment.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name || 'attachment';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setSnack({ open: true, message: 'Не удалось скачать файл', severity: 'error' });
    }
  };

  const removeExistingAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const onFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" align="center">
            Шаблоны писем
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Тема, текст и вложения для рассылок
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
                    <TableCell>Файлы</TableCell>
                    <TableCell>Тема письма</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        Нет шаблонов
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.attachments?.length ?? 0}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(row)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id)}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Редактировать шаблон' : 'Новый шаблон'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Название"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Тема письма"
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <TextField
            label="Текст письма"
            multiline
            minRows={6}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Вложения
            </Typography>
            <Button variant="outlined" component="label" startIcon={<AttachFile />} size="small">
              Добавить файл
              <input type="file" hidden multiple onChange={onFilePick} />
            </Button>
            {attachments.length > 0 && (
              <List dense>
                {attachments.map((a) => (
                  <ListItem key={a.id}>
                    <ListItemText primary={a.name} />
                    <ListItemSecondaryAction>
                      {editing && (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDownload(editing.id, a)}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeExistingAttachment(a.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
            {pendingFiles.map((f, i) => (
              <Chip
                key={`${f.name}-${i}`}
                label={f.name}
                size="small"
                onDelete={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                sx={{ mr: 0.5, mt: 0.5 }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            Сохранить
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

export default TemplatesSection;
