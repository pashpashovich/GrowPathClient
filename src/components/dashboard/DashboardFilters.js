import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { FilterAlt, Refresh, CalendarToday } from '@mui/icons-material';

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

const mentorLabel = (m) => {
  if (m.name) return m.name;
  const parts = [m.firstName, m.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
};

const DashboardFilters = ({ filters, programs, mentors, onApply, onReset, compact = false }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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

  const selectSx = compact
    ? { minWidth: 160, flex: '1 1 160px', maxWidth: '100%' }
    : { minWidth: 180, flex: '1 1 200px', maxWidth: '100%' };

  const dateFieldSx = { width: compact ? 148 : 160, flexShrink: 0 };

  if (compact) {
    return (
      <Paper variant="outlined" sx={{ mb: 1.5, p: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
          <FilterAlt color="primary" sx={{ fontSize: 18 }} />
          <Box sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
            Фильтры
          </Box>
        </Stack>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 1 }}>
          {PRESETS.map((p) => (
            <Chip
              key={p.days}
              label={p.label}
              variant="outlined"
              clickable
              onClick={() => handlePreset(p.days)}
              size="small"
              sx={{ height: 26 }}
            />
          ))}
        </Stack>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} alignItems="center">
          <TextField
            label="Дата от"
            type="date"
            value={formatDateForInput(localFilters.dateFrom)}
            onChange={handleChange('dateFrom')}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={dateFieldSx}
          />
          <TextField
            label="Дата до"
            type="date"
            value={formatDateForInput(localFilters.dateTo)}
            onChange={handleChange('dateTo')}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={dateFieldSx}
          />
          <FormControl size="small" sx={selectSx}>
            <InputLabel>Программа</InputLabel>
            <Select
              value={localFilters.programId || ''}
              label="Программа"
              onChange={handleChange('programId')}
            >
              <MenuItem value="">Все программы</MenuItem>
              {programs.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={selectSx}>
            <InputLabel>Ментор</InputLabel>
            <Select
              value={localFilters.mentorId || ''}
              label="Ментор"
              onChange={handleChange('mentorId')}
            >
              <MenuItem value="">Все менторы</MenuItem>
              {mentors.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {mentorLabel(m)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={selectSx}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={localFilters.status || ''}
              label="Статус"
              onChange={handleChange('status')}
            >
              <MenuItem value="">Все статусы</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            <Button variant="contained" size="small" onClick={handleApply}>
              Применить
            </Button>
            <Button variant="outlined" size="small" onClick={handleReset} startIcon={<Refresh sx={{ fontSize: 16 }} />}>
              Сброс
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <FilterAlt color="primary" fontSize="small" />
        <Box
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'text.secondary',
          }}
        >
          Параметры фильтрации
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
        {PRESETS.map((p) => (
          <Chip
            key={p.days}
            icon={<CalendarToday sx={{ fontSize: 16 }} />}
            label={p.label}
            variant="outlined"
            clickable
            onClick={() => handlePreset(p.days)}
            size="small"
          />
        ))}
      </Stack>

      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="flex-end">
        <TextField
          label="Дата от"
          type="date"
          value={formatDateForInput(localFilters.dateFrom)}
          onChange={handleChange('dateFrom')}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 170 }}
        />
        <TextField
          label="Дата до"
          type="date"
          value={formatDateForInput(localFilters.dateTo)}
          onChange={handleChange('dateTo')}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 170 }}
        />
        <FormControl size="small" sx={{ minWidth: 200, flex: '1 1 200px' }}>
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
        <FormControl size="small" sx={{ minWidth: 200, flex: '1 1 200px' }}>
          <InputLabel>Ментор</InputLabel>
          <Select
            value={localFilters.mentorId || ''}
            label="Ментор"
            onChange={handleChange('mentorId')}
          >
            <MenuItem value="">Все</MenuItem>
            {mentors.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {mentorLabel(m)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160, flex: '1 1 160px' }}>
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
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, pb: 0.25 }}>
          <Button variant="contained" size="small" onClick={handleApply}>
            Применить
          </Button>
          <Button variant="outlined" size="small" onClick={handleReset} startIcon={<Refresh />}>
            Сброс
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DashboardFilters;
