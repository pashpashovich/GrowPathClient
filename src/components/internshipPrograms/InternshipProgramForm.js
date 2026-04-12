import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
} from '@mui/material';
import {
  Add,
  Delete,
  ExpandMore,
  DragIndicator,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import {
  createInternshipProgramAsync,
  updateInternshipProgramAsync,
} from '../../store/slices/internshipProgramSlice';
import { buildInternshipProgramPayload } from '../../utils/internshipProgramApi';
import { hrAPI } from '../../services/api';

const InternshipProgramForm = ({ open, onClose, programToEdit = null }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    duration: 3,
    maxPlaces: 10,
    itDirection: '',
    competencyIds: [],
    requirements: [],
    goals: [],
    selectionStages: [
      {
        name: 'Подача заявки',
        description: 'Заполнение анкеты и загрузка резюме',
        isActive: true,
      },
      {
        name: 'Техническое тестирование',
        description: 'Онлайн тест по основным технологиям',
        isActive: true,
      },
      {
        name: 'Техническое интервью',
        description: 'Разбор решений и обсуждение опыта',
        isActive: true,
      },
      {
        name: 'Принятие решения',
        description: 'Финальное решение о зачислении',
        isActive: true,
      }
    ],
    status: 'draft',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [newStage, setNewStage] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState('');
  const [competencyOptions, setCompetencyOptions] = useState([]);
  const [competenciesLoading, setCompetenciesLoading] = useState(false);
  const [competenciesError, setCompetenciesError] = useState(null);

  React.useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setCompetenciesLoading(true);
    setCompetenciesError(null);
    hrAPI
      .getCompetencies()
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : [];
        if (!cancelled) setCompetencyOptions(list);
      })
      .catch(() => {
        if (!cancelled) {
          setCompetenciesError('Не удалось загрузить список компетенций');
          setCompetencyOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCompetenciesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  React.useEffect(() => {
    if (programToEdit) {
      setFormData({
        title: programToEdit.title || '',
        description: programToEdit.description || '',
        startDate: programToEdit.startDate || '',
        duration: programToEdit.duration || 3,
        maxPlaces: programToEdit.maxPlaces ?? 10,
        itDirection: programToEdit.itDirection || '',
        competencyIds: Array.isArray(programToEdit.competencyIds)
          ? programToEdit.competencyIds.map((n) => (typeof n === 'number' ? n : parseInt(n, 10))).filter((n) => Number.isInteger(n))
          : [],
        requirements: programToEdit.requirements || [],
        goals: programToEdit.goals || [],
        selectionStages: programToEdit.selectionStages || [],
        status: programToEdit.status || 'draft',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: '',
        duration: 3,
        maxPlaces: 10,
        itDirection: '',
        competencyIds: [],
        requirements: [],
        goals: [],
        selectionStages: [
          {
            name: 'Подача заявки',
            description: 'Заполнение анкеты и загрузка резюме',
            isActive: true,
          },
          {
            name: 'Техническое тестирование',
            description: 'Онлайн тест по основным технологиям',
            isActive: true,
          },
          {
            name: 'Техническое интервью',
            description: 'Разбор решений и обсуждение опыта',
            isActive: true,
          },
          {
            name: 'Принятие решения',
            description: 'Финальное решение о зачислении',
            isActive: true,
          }
        ],
        status: 'draft',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [programToEdit, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно для заполнения';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно для заполнения';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    }

    if (formData.maxPlaces == null || Number(formData.maxPlaces) < 1) {
      newErrors.maxPlaces = 'Укажите число мест не меньше 1';
    }

    if (!String(formData.itDirection || '').trim()) {
      newErrors.itDirection = 'Укажите направление (IT)';
    }

    if (formData.requirements.length === 0) {
      newErrors.requirements = 'Добавьте хотя бы одно требование';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = buildInternshipProgramPayload(formData);

      if (programToEdit) {
        const result = await dispatch(
          updateInternshipProgramAsync({ id: programToEdit.id, data: payload })
        );
        if (updateInternshipProgramAsync.fulfilled.match(result)) {
          onClose();
        } else {
          setSubmitError(result.payload || 'Не удалось сохранить программу');
        }
      } else {
        const result = await dispatch(createInternshipProgramAsync(payload));
        if (createInternshipProgramAsync.fulfilled.match(result)) {
          onClose();
        } else {
          setSubmitError(result.payload || 'Не удалось создать программу');
        }
      }
    } catch (error) {
      console.error('Ошибка при сохранении программы:', error);
      setSubmitError('Ошибка сети или сервера');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addGoal = () => {
    if (newGoal.title.trim() && newGoal.description.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, { ...newGoal, id: `goal-${Date.now()}` }],
      }));
      setNewGoal({ title: '', description: '' });
    }
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const addStage = () => {
    if (newStage.name.trim() && newStage.description.trim()) {
      setFormData(prev => ({
        ...prev,
        selectionStages: [...prev.selectionStages, { ...newStage, id: `stage-${Date.now()}` }],
      }));
      setNewStage({ name: '', description: '' });
    }
  };

  const removeStage = (index) => {
    setFormData(prev => ({
      ...prev,
      selectionStages: prev.selectionStages.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {programToEdit ? 'Редактировать программу стажировки' : 'Создать программу стажировки'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Заполните основную информацию о программе стажировки. Обязательные поля отмечены; данные отправляются на
            сервер.
          </Alert>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Основная информация</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label="Название программы"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Описание программы"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                margin="normal"
                required
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label="Дата начала"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  label="Длительность (месяцы)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 3)}
                  margin="normal"
                  inputProps={{ min: 1, max: 12 }}
                />

                <TextField
                  label="Количество мест"
                  type="number"
                  value={formData.maxPlaces}
                  onChange={(e) => handleInputChange('maxPlaces', parseInt(e.target.value, 10) || 10)}
                  error={!!errors.maxPlaces}
                  helperText={errors.maxPlaces}
                  margin="normal"
                  inputProps={{ min: 1 }}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Направление в IT (itDirection)"
                value={formData.itDirection}
                onChange={(e) => handleInputChange('itDirection', e.target.value)}
                error={!!errors.itDirection}
                helperText={errors.itDirection || 'Например: Frontend, Backend, QA'}
                margin="normal"
                required
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  label="Статус"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Черновик</MenuItem>
                  <MenuItem value="active">Активная</MenuItem>
                  <MenuItem value="completed">Завершена</MenuItem>
                  <MenuItem value="cancelled">Отменена</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Требования к кандидатам</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Добавить требование"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addRequirement}
                  disabled={!newRequirement.trim()}
                >
                  Добавить
                </Button>
              </Box>

              {formData.requirements.map((requirement, index) => (
                <Chip
                  key={index}
                  label={requirement}
                  onDelete={() => removeRequirement(index)}
                  sx={{ m: 0.5 }}
                />
              ))}

              {errors.requirements && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.requirements}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Цели стажировки</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Название цели"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
                <TextField
                  label="Описание"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addGoal}
                  disabled={!newGoal.title.trim() || !newGoal.description.trim()}
                >
                  Добавить
                </Button>
              </Box>

              <List>
                {formData.goals.map((goal, index) => (
                  <ListItem key={goal.id || index}>
                    <ListItemText
                      primary={goal.title}
                      secondary={goal.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeGoal(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Компетенции</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {competenciesError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {competenciesError}
                </Alert>
              )}
              <Autocomplete
                multiple
                options={competencyOptions}
                getOptionLabel={(option) => option.name || String(option.id)}
                isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
                value={competencyOptions.filter((c) =>
                  (formData.competencyIds || []).some((id) => Number(id) === Number(c.id))
                )}
                onChange={(_, newValue) =>
                  handleInputChange(
                    'competencyIds',
                    newValue.map((item) => item.id)
                  )
                }
                loading={competenciesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Выберите компетенции"
                    margin="normal"
                    helperText="Данные из /api/v1/competencies. Поле необязательное."
                  />
                )}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Этапы отбора</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Название этапа"
                  value={newStage.name}
                  onChange={(e) => setNewStage(prev => ({ ...prev, name: e.target.value }))}
                />
                <TextField
                  label="Описание"
                  value={newStage.description}
                  onChange={(e) => setNewStage(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addStage}
                  disabled={!newStage.name.trim() || !newStage.description.trim()}
                >
                  Добавить
                </Button>
              </Box>

              <List>
                {formData.selectionStages.map((stage, index) => (
                  <ListItem key={stage.id || index}>
                    <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
                    <ListItemText
                      primary={`${index + 1}. ${stage.name}`}
                      secondary={stage.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeStage(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : (programToEdit ? 'Сохранить изменения' : 'Создать программу')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InternshipProgramForm;

