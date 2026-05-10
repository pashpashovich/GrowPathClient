import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  FilterAlt,
  Refresh,
  CalendarToday,
} from '@mui/icons-material';

const PRESETS = [
  { label: '7 дней', days: 7 },
  { label: '30 дней', days: 30 },
  { label: '3 месяца', days: 90 },
  { label: 'Год', days: 365 },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Завершенные' },
  { value: 'on_hold', label: 'На паузе' },
];

const DashboardFilters = ({ filters, programs, mentors, onApply, onReset }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field) => (e) => {
    setLocalFilters((prev) => ({ ...prev, [field]: e.target.value || null }));
  };

  const handlePreset = (days) => {
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    const updated = {
      ...localFilters,
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
    };
    setLocalFilters(updated);
    onApply(updated);
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const reset = {
      dateFrom: null,
      dateTo: null,
      programId: null,
      mentorId: null,
      departmentId: null,
      status: null,
    };
    setLocalFilters(reset);
    onReset();
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return typeof dateStr === 'string' && dateStr.length <= 10 ? dateStr : dateStr.slice(0, 10);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <FilterAlt color="primary" />
          <Box sx={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
            Параметры фильтрации
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          {PRESETS.map((p) => (
            <Chip
              key={p.days}
              icon={<CalendarToday />}
              label={p.label}
              variant="outlined"
              clickable
              onClick={() => handlePreset(p.days)}
              size="small"
            />
          ))}
        </Stack>

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Дата от"
              type="date"
              value={formatDateForInput(localFilters.dateFrom)}
              onChange={handleChange('dateFrom')}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Дата до"
              type="date"
              value={formatDateForInput(localFilters.dateTo)}
              onChange={handleChange('dateTo')}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Программа</InputLabel>
              <Select
                value={localFilters.programId || ''}
                label="Программа"
                onChange={handleChange('programId')}
              >
                <MenuItem value="">Все</MenuItem>
                {programs.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Ментор</InputLabel>
              <Select
                value={localFilters.mentorId || ''}
                label="Ментор"
                onChange={handleChange('mentorId')}
              >
                <MenuItem value="">Все</MenuItem>
                {mentors.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={localFilters.status || ''}
                label="Статус"
                onChange={handleChange('status')}
              >
                <MenuItem value="">Все</MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" onClick={handleApply} fullWidth>
                Применить
              </Button>
              <Button variant="outlined" size="small" onClick={handleReset} startIcon={<Refresh />}>
                Сброс
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;
