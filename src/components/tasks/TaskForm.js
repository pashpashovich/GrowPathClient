import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Add, Delete, AttachFile } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createTaskAsync, fetchTaskByIdAsync, updateTaskAsync } from '../../store/slices/taskSlice';
import {
  mapTaskToFormFields,
  matchProgramParticipant,
  participantSelectValue,
  findIprForParticipant,
} from '../../utils/mapTaskToForm';
import { fetchInternshipProgramsAsync } from '../../store/slices/internshipProgramSlice';
import { getCurrentUserAsync } from '../../store/slices/authSlice';
import { hrAPI, iprAPI } from '../../services/api';
import { getApiErrorMessage, unwrapList } from '../../utils/apiResponse';
import {
  buildCreateTaskPayload,
  buildTaskFormExtras,
  validateTaskAssignments,
} from '../../utils/buildCreateTaskPayload';
import { normalizeInternshipProgram } from '../../utils/internshipProgramApi';
import { getNormalizedRole } from '../../utils/resolveAppRole';
import { getAuthUserId } from '../../utils/authUser';
import { uploadTaskArtifactFile } from '../../utils/taskArtifactUpload';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const resolveCreatedTaskIds = (created) => {
  if (!created) return [];
  if (Array.isArray(created)) return created.map((t) => t.id).filter(Boolean);
  if (Array.isArray(created?.data)) return created.data.map((t) => t.id).filter(Boolean);
  if (created.id != null) return [created.id];
  return [];
};

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
    goalLabel: '',
    checklist: [{ id: 1, text: '', completed: false }],
    attachments: [],
  });
  const [internshipId, setInternshipId] = useState('');
  const [assignmentRows, setAssignmentRows] = useState([newAssignmentRow()]);
  const [programInterns, setProgramInterns] = useState([]);
  const [programIprs, setProgramIprs] = useState([]);
  const [stagesByIprId, setStagesByIprId] = useState({});
  const [programDetails, setProgramDetails] = useState(null);
  const [programDataLoading, setProgramDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [fileUploadNote, setFileUploadNote] = useState('');

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
      setProgramDetails(null);
      setStagesByIprId({});
      return;
    }
    setProgramDataLoading(true);
    try {
      const iprParams = { programId: Number(programId) };
      if (scopeToMentor && Number.isFinite(mentorUserId)) {
        iprParams.mentorId = mentorUserId;
      }
      const [internsRes, iprsRes, programRes] = await Promise.all([
        hrAPI.getProgramInterns(programId),
        iprAPI.getIprs(iprParams),
        hrAPI.getInternshipProgramById(programId),
      ]);
      const programRaw = programRes.data?.data ?? programRes.data;
      setProgramDetails(normalizeInternshipProgram(programRaw));
      let interns = unwrapList(internsRes);
      if (scopeToMentor) {
        interns = interns.filter((p) => Number(p.mentorId) === Number(mentorUserId));
      }
      const iprs = unwrapList(iprsRes);
      setProgramInterns(interns);
      setProgramIprs(iprs);
      setStagesByIprId({});
      return { interns, iprs };
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Не удалось загрузить данные программы'));
      setProgramInterns([]);
      setProgramIprs([]);
      setProgramDetails(null);
      return { interns: [], iprs: [] };
    } finally {
      setProgramDataLoading(false);
    }
  }, [scopeToMentor, mentorUserId]);

  const applyTaskToForm = useCallback(
    async (task) => {
      const mapped = mapTaskToFormFields(task);
      setFormData({
        title: mapped.title,
        description: mapped.description,
        priority: mapped.priority,
        dueDate: mapped.dueDate,
        goalId: mapped.goalId,
        goalLabel: mapped.goalLabel || '',
        checklist: mapped.checklist,
        attachments: mapped.attachments,
      });

      if (!mapped.internshipId) {
        setInternshipId('');
        setAssignmentRows([newAssignmentRow()]);
        return;
      }

      setInternshipId(mapped.internshipId);
      const { interns, iprs } = await loadProgramData(mapped.internshipId);

      if (mapped.assigneeId) {
        const participant = matchProgramParticipant(interns, mapped.assigneeId);
        const selectInternId = participant
          ? participantSelectValue(participant)
          : String(mapped.assigneeId);
        const ipr = findIprForParticipant(iprs, mapped.assigneeId, interns);
        if (ipr) {
          const response = await iprAPI.getIprStages(ipr.id);
          const stages = unwrapList(response);
          setStagesByIprId({ [String(ipr.id)]: stages });
        }
        setAssignmentRows([
          {
            key: `edit-${selectInternId}`,
            internId: selectInternId,
            stageId: mapped.stageId ? String(mapped.stageId) : '',
          },
        ]);
      } else {
        setAssignmentRows([newAssignmentRow()]);
      }
    },
    [loadProgramData]
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const initForm = async () => {
      setErrors({});
      setSubmitError('');
      setPendingFiles([]);
      setFileUploadNote('');

      if (editingTask?.id) {
        setLoadingTask(true);
        try {
          const full = await dispatch(fetchTaskByIdAsync(editingTask.id)).unwrap();
          if (!cancelled) await applyTaskToForm(full);
        } catch {
          if (!cancelled) await applyTaskToForm(editingTask);
        } finally {
          if (!cancelled) setLoadingTask(false);
        }
        return;
      }

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        goalId: '',
        goalLabel: '',
        checklist: [{ id: 1, text: '', completed: false }],
        attachments: [],
      });
      const defaultProgram = taskFilters.internshipId || programs[0]?.id || '';
      setInternshipId(defaultProgram ? String(defaultProgram) : '');
      setAssignmentRows([newAssignmentRow()]);
    };

    initForm();

    return () => {
      cancelled = true;
    };
  }, [open, editingTask?.id, dispatch, applyTaskToForm, taskFilters.internshipId, programs]);

  useEffect(() => {
    if (!open || editingTask?.id) return;
    if (internshipId) {
      loadProgramData(internshipId);
    }
  }, [open, editingTask?.id, internshipId, loadProgramData]);

  const findIprForIntern = (internId) =>
    findIprForParticipant(programIprs, internId, programInterns);

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
    setFormData((prev) => ({ ...prev, goalId: '', goalLabel: '' }));
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemovePendingFile = (fileId) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const uploadPendingFilesToTasks = async (taskIds) => {
    if (!pendingFiles.length || !taskIds.length) return;
    for (const taskId of taskIds) {
      for (let i = 0; i < pendingFiles.length; i += 1) {
        setFileUploadNote(
          taskIds.length > 1
            ? `Задача ${taskId}: файл ${i + 1} из ${pendingFiles.length}…`
            : `Загрузка файла ${i + 1} из ${pendingFiles.length}…`
        );
        await uploadTaskArtifactFile(taskId, pendingFiles[i].file);
      }
    }
    setPendingFiles([]);
    setFileUploadNote('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Заголовок обязателен';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (!internshipId) newErrors.internshipId = 'Выберите программу стажировки';
    if (editingTask) {
      const row = assignmentRows[0];
      if (row?.internId && !row?.stageId) {
        newErrors.assignments = 'Укажите этап ИПР для стажёра';
      }
    } else {
      Object.assign(newErrors, validateTaskAssignments(assignmentRows));
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingTask) {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        const row = assignmentRows[0];
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          internshipId: Number(internshipId),
        };
        if (formData.dueDate) {
          payload.dueDate = formData.dueDate.includes('T')
            ? formData.dueDate
            : `${formData.dueDate}T18:00:00`;
        }
        if (row?.internId) {
          payload.internId = Number(row.internId);
        }
        if (row?.stageId) {
          payload.iprStageId = Number(row.stageId);
        }
        Object.assign(payload, buildTaskFormExtras(formData));
        await dispatch(updateTaskAsync({ id: editingTask.id, data: payload })).unwrap();
        await uploadPendingFilesToTasks([editingTask.id]);
        onCreated?.();
        onClose();
      } catch (e) {
        setSubmitError(getApiErrorMessage(e, 'Не удалось сохранить задание'));
      } finally {
        setIsSubmitting(false);
      }
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
        goalId: formData.goalId,
        checklist: formData.checklist,
      });
      const created = await dispatch(createTaskAsync(payload)).unwrap();
      const taskIds = resolveCreatedTaskIds(created);
      if (taskIds.length) {
        await uploadPendingFilesToTasks(taskIds);
      } else if (pendingFiles.length) {
        setSubmitError('Задание создано, но не удалось определить id для загрузки файлов');
        onCreated?.();
        return;
      }
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

  const goalOptions = useMemo(() => {
    const listProgram =
      programDetails ||
      programs.find((p) => String(p.id) === String(internshipId));
    const fromProgram = Array.isArray(listProgram?.goals) ? listProgram.goals : [];
    const options = fromProgram
      .filter((g) => g.id != null)
      .map((g) => ({
        id: String(g.id),
        title: g.title || `Цель ${g.id}`,
      }));
    if (
      formData.goalId &&
      !options.some((g) => g.id === String(formData.goalId))
    ) {
      options.unshift({
        id: String(formData.goalId),
        title: formData.goalLabel || `Цель #${formData.goalId}`,
      });
    }
    return options;
  }, [programDetails, programs, internshipId, formData.goalId, formData.goalLabel]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          {editingTask ? 'Редактировать задание' : 'Создать задание'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {loadingTask && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2">Загрузка задания…</Typography>
            </Box>
          )}
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            label="Заголовок задания"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            required
            disabled={loadingTask}
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

          {!loadingTask && (
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

          {internshipId && (
            <FormControl fullWidth disabled={programDataLoading}>
              <InputLabel>Цель программы стажировки</InputLabel>
              <Select
                value={formData.goalId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const picked = goalOptions.find((g) => g.id === String(nextId));
                  setFormData((prev) => ({
                    ...prev,
                    goalId: nextId,
                    goalLabel: picked?.title || '',
                  }));
                }}
                label="Цель программы стажировки"
              >
                <MenuItem value="">
                  <em>Не выбрана</em>
                </MenuItem>
                {goalOptions.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!loadingTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {editingTask ? 'Стажёр и этап ИПР' : 'Назначения (стажёр + этап ИПР)'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {editingTask
                  ? 'Привязка задания к стажёру и этапу индивидуального плана.'
                  : 'Для каждого стажёра создаётся отдельная задача на выбранный этап.'}
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
                      {(!editingTask || assignmentRows.length > 1) && (
                        <IconButton
                          size="small"
                          onClick={() => removeAssignmentRow(row.key)}
                          aria-label="Удалить назначение"
                          sx={{ mt: 0.5 }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  );
                })
              )}
              {!editingTask && (
                <Button
                  startIcon={<Add />}
                  size="small"
                  onClick={addAssignmentRow}
                  disabled={!internshipId || programDataLoading}
                >
                  Добавить стажёра
                </Button>
              )}
              {errors.assignments && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {errors.assignments}
                </Typography>
              )}
            </Box>
          )}

          {!loadingTask && (
          <>
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
              Прикреплённые файлы
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Материалы к заданию (ТЗ, шаблоны). Загружаются на сервер после сохранения карточки.
            </Typography>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="task-form-file-upload"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
              disabled={isSubmitting || loadingTask}
            />
            <label htmlFor="task-form-file-upload">
              <Button
                component="span"
                startIcon={<AttachFile />}
                size="small"
                variant="outlined"
                sx={{ mb: 1 }}
                disabled={isSubmitting || loadingTask}
              >
                Добавить файл
              </Button>
            </label>
            {fileUploadNote && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                {fileUploadNote}
              </Typography>
            )}
            {formData.attachments?.length > 0 && (
              <List dense sx={{ mb: 1 }}>
                {formData.attachments.map((file, index) => (
                  <ListItem key={file.id ?? `saved-${index}`} sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={file.name || file.fileName || 'Файл'}
                      secondary={
                        file.url ? (
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            Открыть
                          </a>
                        ) : (
                          formatFileSize(file.size)
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {pendingFiles.length > 0 && (
              <List dense>
                {pendingFiles.map((file) => (
                  <ListItem
                    key={file.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="Удалить"
                        onClick={() => handleRemovePendingFile(file.id)}
                        disabled={isSubmitting}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`Будет загружен при сохранении • ${formatFileSize(file.size)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting || loadingTask}>
          {isSubmitting ? 'Сохранение…' : editingTask ? 'Сохранить' : 'Создать задание'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
