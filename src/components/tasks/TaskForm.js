import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Delete, AttachFile, Link } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, createTaskAsync } from '../../store/slices/taskSlice';
import { fetchInternshipProgramsAsync } from '../../store/slices/internshipProgramSlice';
import { getCurrentUserAsync } from '../../store/slices/authSlice';
import { hrAPI, iprAPI } from '../../services/api';
import { getApiErrorMessage, unwrapList } from '../../utils/apiResponse';
import { buildCreateTaskPayload, validateTaskAssignments } from '../../utils/buildCreateTaskPayload';
import { getNormalizedRole } from '../../utils/resolveAppRole';
import { getAuthUserId } from '../../utils/authUser';

const MENTOR_SCOPED_ROLES = new Set(['mentor', 'department_head']);

const participantLabel = (p) => {
  if (p.name) return p.name;
  const parts = [p.firstName, p.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : `ID ${p.userId ?? p.id}`;
};

const newAssignmentRow = () => ({
  key: `${Date.now()}-${Math.random()}`,
  internId: '',
  stageId: '',
});

const TaskForm = ({ open, onClose, taskToEdit, task, onCreated }) => {
  const editingTask = taskToEdit ?? task;
  const dispatch = useDispatch();
  const programs = useSelector((state) => state.internshipProgram.programs);
  const taskFilters = useSelector((state) => state.task.filters);
  const currentUser = useSelector((state) => state.auth.user);
  const authRole = useSelector((state) => state.auth.role);
  const appRole = getNormalizedRole(currentUser) ?? authRole;
  const mentorUserId = getAuthUserId(currentUser);
  const scopeToMentor = MENTOR_SCOPED_ROLES.has(appRole) && Number.isFinite(mentorUserId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    goalId: '',
    checklist: [{ id: 1, text: '', completed: false }],
    attachments: [],
    links: [],
  });
  const [internshipId, setInternshipId] = useState('');
  const [assignmentRows, setAssignmentRows] = useState([newAssignmentRow()]);
  const [programInterns, setProgramInterns] = useState([]);
  const [programIprs, setProgramIprs] = useState([]);
  const [stagesByIprId, setStagesByIprId] = useState({});
  const [programDataLoading, setProgramDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (programs.length === 0) {
      dispatch(fetchInternshipProgramsAsync({ page: 1, limit: 100 }));
    }
    if (MENTOR_SCOPED_ROLES.has(appRole) && !Number.isFinite(mentorUserId)) {
      dispatch(getCurrentUserAsync());
    }
  }, [open, dispatch, programs.length, appRole, mentorUserId]);

  const loadProgramData = useCallback(async (programId) => {
    if (!programId) {
      setProgramInterns([]);
      setProgramIprs([]);
      setStagesByIprId({});
      return;
    }
    setProgramDataLoading(true);
    try {
      const iprParams = { programId: Number(programId) };
      if (scopeToMentor && Number.isFinite(mentorUserId)) {
        iprParams.mentorId = mentorUserId;
      }
      const [internsRes, iprsRes] = await Promise.all([
        hrAPI.getProgramInterns(programId),
        iprAPI.getIprs(iprParams),
      ]);
      let interns = unwrapList(internsRes);
      if (scopeToMentor) {
        interns = interns.filter((p) => Number(p.mentorId) === Number(mentorUserId));
      }
      setProgramInterns(interns);
      setProgramIprs(unwrapList(iprsRes));
      setStagesByIprId({});
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Не удалось загрузить данные программы'));
      setProgramInterns([]);
      setProgramIprs([]);
    } finally {
      setProgramDataLoading(false);
    }
  }, [scopeToMentor, mentorUserId]);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split('T')[0]
          : '',
        goalId: editingTask.goalId || '',
        checklist: editingTask.checklist
          ? editingTask.checklist.map((item, index) => ({
              id: index + 1,
              text: typeof item === 'string' ? item : item.text || '',
              completed: typeof item === 'object' ? item.completed || false : false,
            }))
          : [{ id: 1, text: '', completed: false }],
        attachments: editingTask.attachments || [],
        links: editingTask.links || [],
      });
      setInternshipId(editingTask.internshipId ? String(editingTask.internshipId) : '');
      setAssignmentRows([newAssignmentRow()]);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        goalId: '',
        checklist: [{ id: 1, text: '', completed: false }],
        attachments: [],
        links: [],
      });
      const defaultProgram =
        taskFilters.internshipId ||
        programs[0]?.id ||
        '';
      setInternshipId(defaultProgram ? String(defaultProgram) : '');
      setAssignmentRows([newAssignmentRow()]);
    }
    setErrors({});
    setSubmitError('');
  }, [editingTask, open, taskFilters.internshipId, programs]);

  useEffect(() => {
    if (!open || editingTask) return;
    if (internshipId) {
      loadProgramData(internshipId);
    }
  }, [open, editingTask, internshipId, loadProgramData]);

  const findIprForIntern = (internId) =>
    programIprs.find((ipr) => Number(ipr.internId) === Number(internId));

  const loadStagesForIntern = async (internId) => {
    const ipr = findIprForIntern(internId);
    if (!ipr) return [];
    const iprKey = String(ipr.id);
    if (stagesByIprId[iprKey]) return stagesByIprId[iprKey];
    try {
      const response = await iprAPI.getIprStages(ipr.id);
      const stages = unwrapList(response);
      setStagesByIprId((prev) => ({ ...prev, [iprKey]: stages }));
      return stages;
    } catch {
      return [];
    }
  };

  const handleProgramChange = (programId) => {
    setInternshipId(programId);
    setAssignmentRows([newAssignmentRow()]);
    loadProgramData(programId);
    if (errors.internshipId) {
      setErrors((prev) => ({ ...prev, internshipId: '' }));
    }
  };

  const handleAssignmentChange = async (key, field, value) => {
    setAssignmentRows((rows) =>
      rows.map((row) => {
        if (row.key !== key) return row;
        if (field === 'internId') {
          return { ...row, internId: value, stageId: '' };
        }
        return { ...row, [field]: value };
      })
    );
    if (field === 'internId' && value) {
      await loadStagesForIntern(value);
    }
    if (errors.assignments) {
      setErrors((prev) => ({ ...prev, assignments: '' }));
    }
  };

  const addAssignmentRow = () => {
    setAssignmentRows((rows) => [...rows, newAssignmentRow()]);
  };

  const removeAssignmentRow = (key) => {
    setAssignmentRows((rows) => {
      const next = rows.filter((r) => r.key !== key);
      return next.length ? next : [newAssignmentRow()];
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleChecklistChange = (index, text) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index] = { ...newChecklist[index], text };
    setFormData((prev) => ({ ...prev, checklist: newChecklist }));
  };

  const addChecklistItem = () => {
    const newId = Math.max(...formData.checklist.map((item) => item.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { id: newId, text: '', completed: false }],
    }));
  };

  const removeChecklistItem = (index) => {
    if (formData.checklist.length > 1) {
      setFormData((prev) => ({
        ...prev,
        checklist: prev.checklist.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Заголовок обязателен';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (!editingTask && !internshipId) newErrors.internshipId = 'Выберите программу стажировки';
    if (!editingTask) {
      Object.assign(newErrors, validateTaskAssignments(assignmentRows));
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingTask) {
      dispatch(
        updateTask({
          ...editingTask,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : editingTask.dueDate,
        })
      );
      onClose();
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const filledRows = assignmentRows.filter((r) => r.internId && r.stageId);
      const payload = buildCreateTaskPayload({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        internshipId,
        dueDate: formData.dueDate,
        assignments: filledRows,
      });
      await dispatch(createTaskAsync(payload)).unwrap();
      onCreated?.();
      onClose();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Не удалось создать задание'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStagesForRow = (internId) => {
    const ipr = findIprForIntern(internId);
    if (!ipr) return [];
    return stagesByIprId[String(ipr.id)] || [];
  };

  const currentProgram = programs.find((p) => String(p.id) === String(internshipId));
  const availableGoals = currentProgram?.goals || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          {editingTask ? 'Редактировать задание' : 'Создать задание'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            label="Заголовок задания"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            required
            error={!!errors.title}
            helperText={errors.title}
          />

          <TextField
            label="Подробное описание"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            error={!!errors.description}
            helperText={errors.description}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Приоритет"
              >
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Срок выполнения"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          {!editingTask && (
            <FormControl fullWidth required error={!!errors.internshipId}>
              <InputLabel>Программа стажировки</InputLabel>
              <Select
                value={internshipId}
                label="Программа стажировки"
                onChange={(e) => handleProgramChange(e.target.value)}
              >
                {programs.map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.internshipId && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.internshipId}
                </Typography>
              )}
            </FormControl>
          )}

          {availableGoals.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Цель программы стажировки</InputLabel>
              <Select
                value={formData.goalId}
                onChange={(e) => handleInputChange('goalId', e.target.value)}
                label="Цель программы стажировки"
              >
                <MenuItem value="">
                  <em>Не выбрана</em>
                </MenuItem>
                {availableGoals.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!editingTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Назначения (стажёр + этап ИПР)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Для каждого стажёра создаётся отдельная задача на выбранный этап.
              </Typography>
              {programDataLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                  <CircularProgress size={22} />
                  <Typography variant="body2">Загрузка стажёров и ИПР…</Typography>
                </Box>
              ) : (
                assignmentRows.map((row, index) => {
                  const stages = row.internId ? getStagesForRow(row.internId) : [];
                  const ipr = row.internId ? findIprForIntern(row.internId) : null;
                  return (
                    <Box
                      key={row.key}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mb: 1.5,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                      }}
                    >
                      <FormControl sx={{ flex: 1, minWidth: 180 }} size="small">
                        <InputLabel>Стажёр {index + 1}</InputLabel>
                        <Select
                          value={row.internId}
                          label={`Стажёр ${index + 1}`}
                          onChange={(e) =>
                            handleAssignmentChange(row.key, 'internId', e.target.value)
                          }
                          disabled={!internshipId}
                        >
                          <MenuItem value="">
                            <em>Выберите…</em>
                          </MenuItem>
                          {programInterns.map((intern) => {
                            const userId = intern.userId ?? intern.id;
                            return (
                              <MenuItem key={userId} value={userId}>
                                {participantLabel(intern)}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <FormControl sx={{ flex: 1, minWidth: 180 }} size="small">
                        <InputLabel>Этап ИПР</InputLabel>
                        <Select
                          value={row.stageId}
                          label="Этап ИПР"
                          onChange={(e) =>
                            handleAssignmentChange(row.key, 'stageId', e.target.value)
                          }
                          disabled={!row.internId || !ipr}
                          onOpen={() => row.internId && loadStagesForIntern(row.internId)}
                        >
                          <MenuItem value="">
                            <em>Выберите…</em>
                          </MenuItem>
                          {!ipr && row.internId ? (
                            <MenuItem disabled>Нет ИПР у стажёра в программе</MenuItem>
                          ) : null}
                          {stages.map((stage) => (
                            <MenuItem key={stage.id} value={stage.id}>
                              {stage.title || stage.name || `Этап ${stage.id}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        size="small"
                        onClick={() => removeAssignmentRow(row.key)}
                        aria-label="Удалить назначение"
                        sx={{ mt: 0.5 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  );
                })
              )}
              <Button
                startIcon={<Add />}
                size="small"
                onClick={addAssignmentRow}
                disabled={!internshipId || programDataLoading}
              >
                Добавить стажёра
              </Button>
              {errors.assignments && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {errors.assignments}
                </Typography>
              )}
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Чек-лист приемки
            </Typography>
            {formData.checklist.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  placeholder={`Пункт ${index + 1}`}
                  value={item.text}
                  onChange={(e) => handleChecklistChange(index, e.target.value)}
                  fullWidth
                  size="small"
                />
                <IconButton
                  onClick={() => removeChecklistItem(index)}
                  disabled={formData.checklist.length === 1}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Add />} onClick={addChecklistItem} size="small" sx={{ mt: 1 }}>
              Добавить пункт
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Прикрепленные файлы
            </Typography>
            <Button startIcon={<AttachFile />} size="small" disabled>
              Добавить файл (скоро)
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Полезные ссылки
            </Typography>
            <Button startIcon={<Link />} size="small" disabled>
              Добавить ссылку (скоро)
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Создание…' : editingTask ? 'Сохранить' : 'Создать задание'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
