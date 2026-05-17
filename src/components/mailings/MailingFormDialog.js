import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { mailingAPI, parseMailingList } from '../../services/notificationApi';
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadLookups = async () => {
      try {
        const [tRes, gRes] = await Promise.all([
          mailingAPI.getEmailTemplates({ page: 1, limit: 200 }),
          mailingAPI.getDistributionGroups({ page: 1, limit: 200 }),
        ]);
        setTemplates(parseMailingList(tRes.data).data);
        setGroups(parseMailingList(gRes.data).data);
      } catch {
        setTemplates([]);
        setGroups([]);
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
        emailTemplateId: editing.emailTemplateId || '',
        executeAt: toLocalInput(editing.executeAt),
        distributionGroupIds: editing.distributionGroupIds || [],
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
        <FormControl fullWidth required>
          <InputLabel>Шаблон</InputLabel>
          <Select
            label="Шаблон"
            value={form.emailTemplateId}
            onChange={(e) => setForm((f) => ({ ...f, emailTemplateId: e.target.value }))}
          >
            {templates.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Группы получателей</InputLabel>
          <Select
            multiple
            label="Группы получателей"
            value={form.distributionGroupIds}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                distributionGroupIds: typeof e.target.value === 'string' ? [] : e.target.value,
              }))
            }
            renderValue={(selected) =>
              groups
                .filter((g) => selected.includes(g.id))
                .map((g) => g.name)
                .join(', ')
            }
          >
            {groups.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MailingFormDialog;
