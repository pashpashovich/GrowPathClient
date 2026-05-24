import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hrAPI, internAPI, roadmapAPI } from '../../services/api';
import { createInternshipAsync, updateInternshipAsync } from '../../store/slices/roadmapSlice';
import {
  getRoadmapEntityStatusLabel,
  IPR_STATUSES,
  TEMPLATE_STATUSES,
} from '../../utils/roadmapEntityStatus';

const toArray = (body) => (Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []);

const formatDateInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const RoadmapEntityForm = ({ mode, entityToEdit, onClose }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const currentInternshipId = useSelector((state) => state.roadmap.currentInternshipId);
  const internships = useSelector((state) => state.roadmap.internships);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [interns, setInterns] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    programId: '',
    mentorId: '',
    templateId: '',
    internId: '',
    startDate: '',
    endDate: '',
  });

  const selectedTemplateId = useMemo(
    () => formData.templateId || entityToEdit?.templateId || currentInternshipId || '',
    [formData.templateId, entityToEdit?.templateId, currentInternshipId]
  );

  useEffect(() => {
    const loadCatalogs = async () => {
      if (mode !== 'ipr-create') return;
      try {
        const [programsRes, templatesRes, internsRes] = await Promise.all([
          hrAPI.getInternshipPrograms({ page: 1, limit: 100}),
          roadmapAPI.getRoadmapTemplates({}),
          internAPI.getInterns({ page: 1, limit: 100 }),
        ]);
        setPrograms(toArray(programsRes.data));
        setTemplates(toArray(templatesRes.data));
        setInterns(toArray(internsRes.data));
      } catch (e) {
        setError(e.response?.data?.message || 'Не удалось загрузить справочники для ИПР');
      }
    };
    loadCatalogs();
  }, [mode]);

  useEffect(() => {
    if (mode === 'template' && entityToEdit) {
      setFormData({
        title: entityToEdit.title || '',
        description: entityToEdit.description || '',
        status: entityToEdit.status || 'draft',
        programId: entityToEdit.programId || '',
        mentorId: entityToEdit.mentorId || '',
        templateId: '',
        internId: '',
        startDate: '',
        endDate: '',
      });
      return;
    }

    if (mode === 'ipr-edit' && entityToEdit) {
      setFormData({
        title: entityToEdit.title || '',
        description: entityToEdit.description || '',
        status: entityToEdit.status || 'draft',
        programId: entityToEdit.programId || '',
        mentorId: entityToEdit.mentorId || currentUser?.id || '',
        templateId: entityToEdit.templateId || '',
        internId: entityToEdit.internId || currentUser?.id || '',
        startDate: formatDateInput(entityToEdit.startDate),
        endDate: formatDateInput(entityToEdit.endDate),
      });
      return;
    }

    if (mode === 'ipr-create') {
      const selectedTemplate = internships.find((x) => x.id === String(selectedTemplateId));
      setFormData((prev) => ({
        ...prev,
        title: prev.title || 'ИПР',
        description: prev.description || '',
        status: 'draft',
        programId: selectedTemplate?.programId || prev.programId || '',
        mentorId: currentUser?.id || '',
        templateId: selectedTemplate?.id || prev.templateId || '',
        internId: prev.internId || '',
        startDate: prev.startDate || '',
        endDate: prev.endDate || '',
      }));
    }
  }, [mode, entityToEdit, currentUser?.id, internships, selectedTemplateId]);

  const handleChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (mode === 'template') {
        await dispatch(
          updateInternshipAsync({
            internshipId: entityToEdit.id,
            data: {
              title: formData.title,
              description: formData.description,
              status: formData.status,
              mentorId: formData.mentorId ? Number(formData.mentorId) : undefined,
            },
            useIpr: false,
          })
        ).unwrap();
      } else if (mode === 'ipr-edit') {
        await dispatch(
          updateInternshipAsync({
            internshipId: entityToEdit.id,
            data: {
              title: formData.title,
              description: formData.description,
              status: formData.status,
              mentorId: formData.mentorId ? Number(formData.mentorId) : undefined,
              startDate: formData.startDate || undefined,
              endDate: formData.endDate || undefined,
            },
            useIpr: true,
          })
        ).unwrap();
      } else {
        await dispatch(
          createInternshipAsync({
            useIpr: true,
            data: {
              title: formData.title,
              description: formData.description,
              startDate: formData.startDate,
              endDate: formData.endDate,
              programId: Number(formData.programId),
              templateId: Number(formData.templateId),
              internId: Number(formData.internId),
              mentorId: formData.mentorId ? Number(formData.mentorId) : undefined,
            },
          })
        ).unwrap();
      }
      onClose();
    } catch (e) {
      setError(e?.message || 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTemplateMode = mode === 'template';
  const isCreateIprMode = mode === 'ipr-create';
  const isIprEditMode = mode === 'ipr-edit';

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isTemplateMode ? 'Редактирование шаблона дорожной карты' : isCreateIprMode ? 'Создание ИПР' : 'Редактирование ИПР'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <TextField label="Название" value={formData.title} onChange={handleChange('title')} required />
        <TextField
          label="Описание"
          value={formData.description}
          onChange={handleChange('description')}
          multiline
          minRows={3}
        />

        {isCreateIprMode && (
          <>
            <FormControl fullWidth required>
              <InputLabel>Программа</InputLabel>
              <Select label="Программа" value={formData.programId} onChange={handleChange('programId')}>
                {programs.map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Шаблон дорожной карты</InputLabel>
              <Select label="Шаблон дорожной карты" value={formData.templateId} onChange={handleChange('templateId')}>
                {templates
                  .filter((template) => !formData.programId || Number(template.programId) === Number(formData.programId))
                  .map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Стажер</InputLabel>
              <Select label="Стажер" value={formData.internId} onChange={handleChange('internId')}>
                {interns.map((intern) => (
                  <MenuItem key={intern.id} value={intern.id}>
                    {intern.name || `ID ${intern.id}`} ({intern.email || 'без email'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Дата начала"
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Дата завершения"
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              InputLabelProps={{ shrink: true }}
              required
            />
          </>
        )}

        {isIprEditMode && (
          <>
            <TextField
              label="Дата начала"
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Дата завершения"
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}

        <FormControl fullWidth>
          <InputLabel>Статус</InputLabel>
          <Select label="Статус" value={formData.status} onChange={handleChange('status')}>
            {(isTemplateMode ? TEMPLATE_STATUSES : IPR_STATUSES).map((status) => (
              <MenuItem key={status} value={status}>
                {getRoadmapEntityStatusLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default RoadmapEntityForm;
