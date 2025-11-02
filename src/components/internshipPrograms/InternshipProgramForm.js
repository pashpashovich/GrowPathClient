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
} from '@mui/material';
import {
  Add,
  Delete,
  ExpandMore,
  DragIndicator,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addProgram, updateProgram } from '../../store/slices/internshipProgramSlice';

const InternshipProgramForm = ({ open, onClose, programToEdit = null }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    duration: 3,
    maxPlaces: 10,
    requirements: [],
    goals: [],
    competencies: [],
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
  const [newCompetency, setNewCompetency] = useState('');
  const [newStage, setNewStage] = useState({ name: '', description: '' });

  React.useEffect(() => {
    if (programToEdit) {
      setFormData({
        title: programToEdit.title || '',
        description: programToEdit.description || '',
        startDate: programToEdit.startDate || '',
        duration: programToEdit.duration || 3,
        maxPlaces: programToEdit.maxPlaces || 10,
        requirements: programToEdit.requirements || [],
        goals: programToEdit.goals || [],
        competencies: programToEdit.competencies || [],
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
        requirements: [],
        goals: [],
        competencies: [],
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

    if (!formData.maxPlaces || formData.maxPlaces < 1) {
      newErrors.maxPlaces = 'Количество мест должно быть больше 0';
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

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (programToEdit) {
        dispatch(updateProgram({
          id: programToEdit.id,
          ...formData,
        }));
      } else {
        dispatch(addProgram({
          ...formData,
          createdBy: 'current-hr-id',
        }));
      }

      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении программы:', error);
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

  const addCompetency = () => {
    if (newCompetency.trim()) {
      setFormData(prev => ({
        ...prev,
        competencies: [...prev.competencies, newCompetency.trim()],
      }));
      setNewCompetency('');
    }
  };

  const removeCompetency = (index) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.filter((_, i) => i !== index),
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
            Заполните основную информацию о программе стажировки. Все поля обязательны для заполнения.
          </Alert>

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
                  onChange={(e) => handleInputChange('maxPlaces', parseInt(e.target.value) || 10)}
                  error={!!errors.maxPlaces}
                  helperText={errors.maxPlaces}
                  margin="normal"
                  inputProps={{ min: 1 }}
                  required
                />
              </Box>

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
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Добавить компетенцию"
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCompetency()}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addCompetency}
                  disabled={!newCompetency.trim()}
                >
                  Добавить
                </Button>
              </Box>

              {formData.competencies.map((competency, index) => (
                <Chip
                  key={index}
                  label={competency}
                  onDelete={() => removeCompetency(index)}
                  sx={{ m: 0.5 }}
                />
              ))}
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

