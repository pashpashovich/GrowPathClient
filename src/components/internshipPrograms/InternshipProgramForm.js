import React, { useState, useCallback } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { Add, ExpandMore } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import {
  createInternshipProgramAsync,
  updateInternshipProgramAsync,
} from '../../store/slices/internshipProgramSlice';
import {
  buildCreateInternshipProgramPayload,
  buildUpdateInternshipProgramPayload,
  extractDataArray,
  isInternshipProgramEditable,
  isInternshipProgramStatusEditable,
  getInternshipProgramEditLockReason,
  INTERNSHIP_PROGRAM_STATUSES,
  INTERNSHIP_PROGRAM_STATUS_LABELS,
  normalizeInternshipProgramStatus,
} from '../../utils/internshipProgramApi';
import { hrAPI } from '../../services/api';

const emptyForm = () => ({
  title: '',
  description: '',
  startDate: '',
  duration: 3,
  maxPlaces: 10,
  itDirectionId: null,
  competencyIds: [],
  requirementIds: [],
  goalIds: [],
  selectionStageIds: [],
  status: 'draft',
});

function createdEntityId(response) {
  const raw = response.data?.data ?? response.data;
  return raw?.id != null ? Number(raw.id) : null;
}

const InternshipProgramForm = ({ open, onClose, programToEdit = null }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(programToEdit);
  const updateLocked = isEdit && programToEdit && !isInternshipProgramEditable(programToEdit);
  const statusEditable = isEdit && programToEdit && isInternshipProgramStatusEditable(programToEdit);
  const statusOptions = isEdit
    ? INTERNSHIP_PROGRAM_STATUSES
    : INTERNSHIP_PROGRAM_STATUSES.filter((s) => s === 'draft' || s === 'active');
  const [formData, setFormData] = useState(emptyForm);
  const initialStatus = normalizeInternshipProgramStatus(programToEdit?.status);
  const statusChanged = isEdit && normalizeInternshipProgramStatus(formData.status) !== initialStatus;

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogsError, setCatalogsError] = useState(null);
  const [itDirections, setItDirections] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [goalDefinitions, setGoalDefinitions] = useState([]);
  const [stageDefinitions, setStageDefinitions] = useState([]);

  const [quickAdd, setQuickAdd] = useState(null);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickForm, setQuickForm] = useState({});

  const loadCatalogs = useCallback(async () => {
    setCatalogsLoading(true);
    setCatalogsError(null);
    try {
      const [d1, d2, d3, d4, d5] = await Promise.all([
        hrAPI.getItDirections(),
        hrAPI.getCompetencies(),
        hrAPI.getProgramRequirementDefinitions(),
        hrAPI.getProgramGoalDefinitions(),
        hrAPI.getProgramSelectionStageDefinitions(),
      ]);
      setItDirections(extractDataArray(d1.data));
      setCompetencies(extractDataArray(d2.data));
      setRequirements(extractDataArray(d3.data));
      setGoalDefinitions(extractDataArray(d4.data));
      setStageDefinitions(extractDataArray(d5.data));
    } catch {
      setCatalogsError('Не удалось загрузить справочники. Проверьте сеть и права доступа.');
    } finally {
      setCatalogsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    loadCatalogs();
    return undefined;
  }, [open, loadCatalogs]);

  React.useEffect(() => {
    if (!open) return;
    if (programToEdit) {
      setFormData({
        title: programToEdit.title || '',
        description: programToEdit.description || '',
        startDate: programToEdit.startDate || '',
        duration: programToEdit.duration ?? 3,
        maxPlaces: programToEdit.maxPlaces ?? 10,
        itDirectionId:
          programToEdit.itDirectionId != null ? Number(programToEdit.itDirectionId) : null,
        competencyIds: [...(programToEdit.competencyIds || [])],
        requirementIds: [...(programToEdit.requirementIds || [])],
        goalIds: [...(programToEdit.goalIds || [])],
        selectionStageIds: [...(programToEdit.selectionStageIds || [])],
        status: normalizeInternshipProgramStatus(programToEdit.status),
      });
    } else {
      setFormData(emptyForm());
    }
    setErrors({});
    setSubmitError('');
  }, [programToEdit, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Укажите название';
    if (!formData.description.trim()) newErrors.description = 'Укажите описание';
    if (!formData.startDate) newErrors.startDate = 'Укажите дату начала';
    const d = Number(formData.duration);
    if (!Number.isFinite(d) || d < 1 || d > 12) {
      newErrors.duration = 'От 1 до 12 месяцев';
    }
    if (formData.maxPlaces == null || Number(formData.maxPlaces) < 0) {
      newErrors.maxPlaces = 'Укажите неотрицательное число мест';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (updateLocked && !statusChanged) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = isEdit
        ? buildUpdateInternshipProgramPayload(formData)
        : buildCreateInternshipProgramPayload(formData);
      const result = isEdit
        ? await dispatch(
            updateInternshipProgramAsync({ id: programToEdit.id, data: payload })
          )
        : await dispatch(createInternshipProgramAsync(payload));
      const ok = isEdit
        ? updateInternshipProgramAsync.fulfilled.match(result)
        : createInternshipProgramAsync.fulfilled.match(result);
      if (ok) onClose();
      else setSubmitError(result.payload || 'Ошибка сохранения');
    } catch (e) {
      console.error(e);
      setSubmitError('Ошибка сети или сервера');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openQuickAdd = (type) => {
    if (updateLocked) return;
    setQuickForm(
      type === 'itDirection'
        ? { code: '', displayName: '' }
        : type === 'competency'
          ? { name: '' }
          : type === 'requirement'
            ? { requirementText: '' }
            : type === 'goal'
              ? { title: '', description: '' }
              : { name: '', description: '', isActive: true }
    );
    setQuickAdd(type);
  };

  const closeQuickAdd = () => {
    setQuickAdd(null);
    setQuickForm({});
  };

  const appendId = (field, newId) => {
    if (newId == null || !Number.isInteger(newId)) return;
    setFormData((prev) => {
      const arr = [...(prev[field] || [])];
      if (!arr.includes(newId)) arr.push(newId);
      return { ...prev, [field]: arr };
    });
  };

  const submitQuickAdd = async () => {
    if (quickAdd === 'itDirection' && (!quickForm.code?.trim() || !quickForm.displayName?.trim())) {
      setSubmitError('Укажите код и название IT-направления');
      return;
    }
    if (quickAdd === 'competency' && !quickForm.name?.trim()) {
      setSubmitError('Укажите название компетенции');
      return;
    }
    if (quickAdd === 'requirement' && !quickForm.requirementText?.trim()) {
      setSubmitError('Укажите текст требования');
      return;
    }
    if (quickAdd === 'goal' && !quickForm.title?.trim()) {
      setSubmitError('Укажите заголовок цели');
      return;
    }
    if (quickAdd === 'stage' && !quickForm.name?.trim()) {
      setSubmitError('Укажите название этапа');
      return;
    }

    setQuickSaving(true);
    try {
      let res;
      if (quickAdd === 'itDirection') {
        res = await hrAPI.createItDirection({
          code: quickForm.code.trim(),
          displayName: quickForm.displayName.trim(),
        });
        await loadCatalogs();
        const nid = createdEntityId(res);
        if (nid != null) handleInputChange('itDirectionId', nid);
      } else if (quickAdd === 'competency') {
        if (!quickForm.name?.trim()) return;
        res = await hrAPI.createCompetency({ name: quickForm.name.trim() });
        await loadCatalogs();
        const nid = createdEntityId(res);
        appendId('competencyIds', nid);
      } else if (quickAdd === 'requirement') {
        if (!quickForm.requirementText?.trim()) return;
        res = await hrAPI.createProgramRequirementDefinition({
          requirementText: quickForm.requirementText.trim(),
        });
        await loadCatalogs();
        const nid = createdEntityId(res);
        appendId('requirementIds', nid);
      } else if (quickAdd === 'goal') {
        if (!quickForm.title?.trim()) return;
        res = await hrAPI.createProgramGoalDefinition({
          title: quickForm.title.trim(),
          description: (quickForm.description || '').trim(),
        });
        await loadCatalogs();
        const nid = createdEntityId(res);
        appendId('goalIds', nid);
      } else if (quickAdd === 'stage') {
        if (!quickForm.name?.trim()) return;
        res = await hrAPI.createProgramSelectionStageDefinition({
          name: quickForm.name.trim(),
          description: (quickForm.description || '').trim(),
          isActive: quickForm.isActive !== false,
        });
        await loadCatalogs();
        const nid = createdEntityId(res);
        appendId('selectionStageIds', nid);
      }
      closeQuickAdd();
    } catch (e) {
      console.error(e);
      setSubmitError(
        e.response?.data?.message || e.response?.data?.error || 'Не удалось создать запись в справочнике'
      );
    } finally {
      setQuickSaving(false);
    }
  };

  const selectedItDir = itDirections.find((d) => Number(d.id) === Number(formData.itDirectionId)) || null;

  return (
    <Dialog open={open} onClose={() => !isSubmitting && onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Редактировать программу стажировки' : 'Создать программу стажировки'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {updateLocked && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {getInternshipProgramEditLockReason(programToEdit)}
            </Alert>
          )}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}
          {catalogsError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {catalogsError}
            </Alert>
          )}

          {catalogsLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={22} />
              <Typography variant="body2">Загрузка справочников…</Typography>
            </Box>
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
                disabled={updateLocked}
              />
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                margin="normal"
                required
                disabled={updateLocked}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                <TextField
                  label="Дата начала"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={updateLocked}
                />
                <TextField
                  label="Длительность (мес.)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value, 10) || 1)}
                  error={!!errors.duration}
                  helperText={errors.duration || '1–12'}
                  inputProps={{ min: 1, max: 12 }}
                  disabled={updateLocked}
                />
                <TextField
                  label="Мест"
                  type="number"
                  value={formData.maxPlaces}
                  onChange={(e) => handleInputChange('maxPlaces', parseInt(e.target.value, 10) || 0)}
                  error={!!errors.maxPlaces}
                  helperText={errors.maxPlaces}
                  inputProps={{ min: 0 }}
                  disabled={updateLocked}
                />
              </Box>

              <FormControl fullWidth margin="normal" disabled={!statusEditable && updateLocked}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  label="Статус"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {INTERNSHIP_PROGRAM_STATUS_LABELS[status] || status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">IT-направление</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Autocomplete
                  sx={{ flex: 1, minWidth: 260 }}
                  options={itDirections}
                  loading={catalogsLoading}
                  disabled={updateLocked}
                  getOptionLabel={(o) => (o.displayName && o.code ? `${o.displayName} (${o.code})` : o.code || o.displayName || '')}
                  isOptionEqualToValue={(a, b) => Number(a?.id) === Number(b?.id)}
                  value={selectedItDir}
                  onChange={(_, v) => handleInputChange('itDirectionId', v?.id ?? null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Направление" placeholder="Выберите из справочника" />
                  )}
                />
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  disabled={updateLocked}
                  onClick={() => openQuickAdd('itDirection')}
                >
                  Новое направление
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Требования (определения)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  startIcon={<Add />}
                  size="small"
                  disabled={updateLocked}
                  onClick={() => openQuickAdd('requirement')}
                >
                  Добавить в справочник
                </Button>
              </Box>
              <Autocomplete
                multiple
                options={requirements}
                loading={catalogsLoading}
                disabled={updateLocked}
                getOptionLabel={(o) => o.requirementText || String(o.id)}
                isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
                value={requirements.filter((r) =>
                  (formData.requirementIds || []).some((id) => Number(id) === Number(r.id))
                )}
                onChange={(_, v) => handleInputChange('requirementIds', v.map((x) => x.id))}
                renderInput={(params) => <TextField {...params} label="Требования к кандидатам" />}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Цели программы (определения)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  startIcon={<Add />}
                  size="small"
                  disabled={updateLocked}
                  onClick={() => openQuickAdd('goal')}
                >
                  Добавить в справочник
                </Button>
              </Box>
              <Autocomplete
                multiple
                options={goalDefinitions}
                loading={catalogsLoading}
                disabled={updateLocked}
                getOptionLabel={(o) => o.title || String(o.id)}
                isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
                value={goalDefinitions.filter((g) =>
                  (formData.goalIds || []).some((id) => Number(id) === Number(g.id))
                )}
                onChange={(_, v) => handleInputChange('goalIds', v.map((x) => x.id))}
                renderInput={(params) => <TextField {...params} label="Цели" />}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Компетенции</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  startIcon={<Add />}
                  size="small"
                  disabled={updateLocked}
                  onClick={() => openQuickAdd('competency')}
                >
                  Добавить в справочник
                </Button>
              </Box>
              <Autocomplete
                multiple
                options={competencies}
                loading={catalogsLoading}
                disabled={updateLocked}
                getOptionLabel={(o) => o.name || String(o.id)}
                isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
                value={competencies.filter((c) =>
                  (formData.competencyIds || []).some((id) => Number(id) === Number(c.id))
                )}
                onChange={(_, v) => handleInputChange('competencyIds', v.map((x) => x.id))}
                renderInput={(params) => <TextField {...params} label="Компетенции" />}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Этапы отбора (определения)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  startIcon={<Add />}
                  size="small"
                  disabled={updateLocked}
                  onClick={() => openQuickAdd('stage')}
                >
                  Добавить в справочник
                </Button>
              </Box>
              <Autocomplete
                multiple
                options={stageDefinitions}
                loading={catalogsLoading}
                disabled={updateLocked}
                getOptionLabel={(o) => o.name || String(o.id)}
                isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
                value={stageDefinitions.filter((s) =>
                  (formData.selectionStageIds || []).some((id) => Number(id) === Number(s.id))
                )}
                onChange={(_, v) => handleInputChange('selectionStageIds', v.map((x) => x.id))}
                renderInput={(params) => <TextField {...params} label="Этапы отбора" />}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || catalogsLoading || (updateLocked && !statusChanged)}
        >
          {isSubmitting ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>

      <Dialog open={Boolean(quickAdd)} onClose={closeQuickAdd} maxWidth="xs" fullWidth>
        <DialogTitle>
          {quickAdd === 'itDirection' && 'Новое IT-направление'}
          {quickAdd === 'competency' && 'Новая компетенция'}
          {quickAdd === 'requirement' && 'Новое требование'}
          {quickAdd === 'goal' && 'Новая цель программы'}
          {quickAdd === 'stage' && 'Новый этап отбора'}
        </DialogTitle>
        <DialogContent>
          {quickAdd === 'itDirection' && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Код (латиница)"
                value={quickForm.code || ''}
                onChange={(e) => setQuickForm((q) => ({ ...q, code: e.target.value }))}
                fullWidth
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                label="Отображаемое название"
                value={quickForm.displayName || ''}
                onChange={(e) => setQuickForm((q) => ({ ...q, displayName: e.target.value }))}
                fullWidth
                inputProps={{ maxLength: 200 }}
              />
            </Box>
          )}
          {quickAdd === 'competency' && (
            <TextField
              sx={{ mt: 1 }}
              label="Название"
              value={quickForm.name || ''}
              onChange={(e) => setQuickForm((q) => ({ ...q, name: e.target.value }))}
              fullWidth
              inputProps={{ maxLength: 255 }}
            />
          )}
          {quickAdd === 'requirement' && (
            <TextField
              sx={{ mt: 1 }}
              label="Текст требования"
              value={quickForm.requirementText || ''}
              onChange={(e) => setQuickForm((q) => ({ ...q, requirementText: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          )}
          {quickAdd === 'goal' && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Заголовок"
                value={quickForm.title || ''}
                onChange={(e) => setQuickForm((q) => ({ ...q, title: e.target.value }))}
                fullWidth
                inputProps={{ maxLength: 500 }}
              />
              <TextField
                label="Описание (необязательно)"
                value={quickForm.description || ''}
                onChange={(e) => setQuickForm((q) => ({ ...q, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          )}
          {quickAdd === 'stage' && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Название этапа"
                value={quickForm.name || ''}
                onChange={(e) => setQuickForm((q) => ({ ...q, name: e.target.value }))}
                fullWidth
                inputProps={{ maxLength: 255 }}
              />
              <TextField
                label="Описание"
                value={quickForm.description || ''}
                onChange={(e) => setQuickForm((q) => ({ ...q, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={quickForm.isActive !== false}
                    onChange={(e) => setQuickForm((q) => ({ ...q, isActive: e.target.checked }))}
                  />
                }
                label="Активен"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeQuickAdd}>Отмена</Button>
          <Button variant="contained" onClick={submitQuickAdd} disabled={quickSaving}>
            {quickSaving ? 'Создание…' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default InternshipProgramForm;
