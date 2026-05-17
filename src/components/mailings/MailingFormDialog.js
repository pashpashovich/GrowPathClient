import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { mailingAPI } from '../../services/notificationApi';
import { WEEKDAY_LABELS } from '../../utils/mailingLabels';

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
    if (!open) return;
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
  }, [open, editing]);

  const handleSave = async () => {
    if (!form.name?.trim() || !form.emailTemplateId) return;
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
      if (editing) {
        await mailingAPI.updateMailing(editing.id, payload);
      } else {
        await mailingAPI.createMailing(payload);
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Редактировать рассылку' : 'Новая рассылка'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {lookupError && (
          <Alert severity="warning" onClose={() => setLookupError(null)}>
            {lookupError}
          </Alert>
        )}

        <TextField
          label="Название"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <FormControl fullWidth>
          <InputLabel>Тип</InputLabel>
          <Select
            label="Тип"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <MenuItem value="immediate">Разовая</MenuItem>
            <MenuItem value="scheduled">По расписанию</MenuItem>
            <MenuItem value="recurring">Повторяющаяся</MenuItem>
          </Select>
        </FormControl>

        {lookupsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <FormControl fullWidth required>
              <InputLabel id="mailing-template-label" shrink>
                Шаблон
              </InputLabel>
              <Select
                labelId="mailing-template-label"
                label="Шаблон"
                value={form.emailTemplateId}
                onChange={(e) => setForm((f) => ({ ...f, emailTemplateId: e.target.value }))}
                displayEmpty
                renderValue={(value) => {
                  if (!value) {
                    return (
                      <Typography variant="body2" color="text.secondary" component="span">
                        {templates.length ? 'Выберите шаблон' : 'Нет доступных шаблонов'}
                      </Typography>
                    );
                  }
                  const template = templates.find((t) => String(t.id) === value);
                  return template?.name || value;
                }}
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="mailing-groups-label" shrink>
                Группы получателей
              </InputLabel>
              <Select
                labelId="mailing-groups-label"
                multiple
                label="Группы получателей"
                value={form.distributionGroupIds}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    distributionGroupIds:
                      typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : e.target.value.map(String),
                  }))
                }
                displayEmpty
                renderValue={(selected) => {
                  const names = groups
                    .filter((g) => selected.includes(String(g.id)))
                    .map((g) => g.name);
                  if (!names.length) {
                    return (
                      <Typography variant="body2" color="text.secondary" component="span">
                        {groups.length ? 'Выберите группы' : 'Нет доступных групп'}
                      </Typography>
                    );
                  }
                  return names.join(', ');
                }}
              >
                {groups.map((g) => (
                  <MenuItem key={g.id} value={String(g.id)}>
                    {g.name}
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
            <FormControl fullWidth>
              <InputLabel>День недели</InputLabel>
              <Select
                label="День недели"
                value={form.weekDay}
                onChange={(e) => setForm((f) => ({ ...f, weekDay: e.target.value }))}
              >
                {Object.entries(WEEKDAY_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Время"
              type="time"
              value={form.executeTime}
              onChange={(e) => setForm((f) => ({ ...f, executeTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || lookupsLoading || !form.emailTemplateId}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MailingFormDialog;
