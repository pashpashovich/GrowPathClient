import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

const ProgramSelector = ({ programs, value, onChange, label = 'Программа стажировки', fullWidth = true, size = 'small' }) => (
  <FormControl fullWidth={fullWidth} size={size} sx={{ minWidth: 280 }}>
    <InputLabel>{label}</InputLabel>
    <Select value={value || ''} label={label} onChange={(e) => onChange(e.target.value || null)}>
      <MenuItem value="">
        <em>Выберите программу</em>
      </MenuItem>
      {programs.map((p) => (
        <MenuItem key={p.id} value={String(p.id)}>
          {p.title}
          {p.status === 'draft' ? ' (черновик)' : ''}
        </MenuItem>
      ))}
    </Select>
    {programs.length === 0 && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        Нет доступных программ
      </Typography>
    )}
  </FormControl>
);

export default ProgramSelector;
