import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import { mailingAPI } from '../../services/notificationApi';
import { WEEKDAY_LABELS } from '../../utils/mailingLabels';
import ActionSnackbar from './ActionSnackbar';

const emptyForm = {
  name: '',
  type: 'immediate',
  emailTemplateId: '',
  executeAt: '',
  distributionGroupIds: [],
  weekDay: 'monday',
  executeTime: '09:00',
};

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const MailingFormDialog = ({ open, onClose, editing, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!open) return;
    const loadLookups = async () => {
      setLookupsLoading(true);
      setLookupError(null);
      try {
        const [templatesResult, groupsResult] = await Promise.allSettled([
          mailingAPI.fetchAllEmailTemplates(),
          mailingAPI.fetchAllDistributionGroups(),
        ]);

        const templateItems =
          templatesResult.status === 'fulfilled' ? templatesResult.value : [];
        const groupItems = groupsResult.status === 'fulfilled' ? groupsResult.value : [];

        setTemplates(templateItems);
        setGroups(groupItems);

        const errors = [];
        if (templatesResult.status === 'rejected') {
          errors.push('шаблоны');
        }
        if (groupsResult.status === 'rejected') {
          errors.push('группы');
        }
        if (errors.length) {
          setLookupError(`Не удалось загрузить: ${errors.join(', ')}`);
        }
      } catch {
        setTemplates([]);
        setGroups([]);
        setLookupError('Не удалось загрузить шаблоны и группы');
      } finally {
        setLookupsLoading(false);
      }
    };
    loadLookups();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setSaveError(null);
      return;
    }
    if (editing) {
      setForm({
        name: editing.name || '',
        type: editing.type || 'immediate',
        emailTemplateId: editing.emailTemplateId ? String(editing.emailTemplateId) : '',
        executeAt: toLocalInput(editing.executeAt),
        distributionGroupIds: (editing.distributionGroupIds || []).map(String),
        weekDay: editing.schedule?.weekDay || 'monday',
        executeTime: editing.schedule?.executeTime || '09:00',
      });
    } else {
      setForm(emptyForm);
    }
    setSaveError(null);
  }, [open, editing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError(null);

    if (!form.name?.trim()) {
      setSaveError('Укажите название рассылки');
      return;
    }
    if (!form.emailTemplateId) {
      setSaveError('Выберите шаблон письма');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        emailTemplateId: form.emailTemplateId,
        distributionGroupIds: form.distributionGroupIds,
      };
      if (form.type === 'scheduled' && form.executeAt) {
        payload.executeAt = new Date(form.executeAt).toISOString();
      }
      if (form.type === 'recurring') {
        payload.schedule = {
          weekDay: form.weekDay,
          executeTime: form.executeTime,
        };
      }
      if (editing?.id) {
        await mailingAPI.updateMailing(editing.id, payload);
      } else {
        await mailingAPI.createMailing(payload);
      }
      setSnack({ open: true, message: 'Сохранено', severity: 'success' });
      onSaved?.();
      onClose();
    } catch (e) {
      const message = e.response?.data?.message || 'Не удалось сохранить рассылку';
      setSaveError(message);
      setSnack({ open: true, message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? 'Редактировать рассылку' : 'Новая рассылка'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {lookupError && (
              <Alert severity="warning" onClose={() => setLookupError(null)}>
                {lookupError}
              </Alert>
            )}
            {saveError && (
              <Alert severity="error" onClose={() => setSaveError(null)}>
                {saveError}
              </Alert>
            )}

            <TextField
              label="Название"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />

            <TextField
              select
              label="Тип"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <MenuItem value="immediate">Разовая</MenuItem>
              <MenuItem value="scheduled">По расписанию</MenuItem>
              <MenuItem value="recurring">Повторяющаяся</MenuItem>
            </TextField>

            {lookupsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                <TextField
                  select
                  label="Шаблон"
                  required
                  value={form.emailTemplateId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, emailTemplateId: String(e.target.value) }))
                  }
                  helperText={
                    templates.length === 0 ? 'Сначала создайте шаблон во вкладке «Шаблоны»' : ''
                  }
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled>
                    {templates.length ? 'Выберите шаблон' : 'Нет шаблонов'}
                  </MenuItem>
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>

                <FormControl fullWidth>
                  <InputLabel id="mailing-groups-label">Группы получателей</InputLabel>
                  <Select
                    labelId="mailing-groups-label"
                    multiple
                    value={form.distributionGroupIds}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => ({
                        ...f,
                        distributionGroupIds:
                          typeof value === 'string' ? value.split(',') : value.map(String),
                      }));
                    }}
                    input={<OutlinedInput label="Группы получателей" />}
                    renderValue={(selected) => {
                      const names = groups
                        .filter((g) => selected.includes(String(g.id)))
                        .map((g) => g.name);
                      return names.length ? names.join(', ') : 'Не выбрано';
                    }}
                  >
                    {groups.map((g) => (
                      <MenuItem key={g.id} value={String(g.id)}>
                        <Checkbox checked={form.distributionGroupIds.includes(String(g.id))} />
                        <ListItemText primary={g.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {form.type === 'scheduled' && (
              <TextField
                label="Дата и время отправки"
                type="datetime-local"
                value={form.executeAt}
                onChange={(e) => setForm((f) => ({ ...f, executeAt: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {form.type === 'recurring' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="День недели"
                  value={form.weekDay}
                  onChange={(e) => setForm((f) => ({ ...f, weekDay: e.target.value }))}
                  sx={{ flex: 1 }}
                >
                  {Object.entries(WEEKDAY_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Время"
                  type="time"
                  value={form.executeTime}
                  onChange={(e) => setForm((f) => ({ ...f, executeTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={saving || lookupsLoading}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ActionSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
};

export default MailingFormDialog;
