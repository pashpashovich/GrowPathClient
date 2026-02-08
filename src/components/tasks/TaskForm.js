import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { Add, Delete, AttachFile, Link } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, updateTask, createTaskAsync, updateTaskAsync } from '../../store/slices/taskSlice';
import { fetchInternsAsync } from '../../store/slices/internSlice';

const TaskForm = ({ open, onClose, taskToEdit }) => {
  const dispatch = useDispatch();
  const { interns } = useSelector((state) => state.intern);
  const programs = useSelector((state) => state.internshipProgram.programs);
  const currentInternshipId = useSelector((state) => state.roadmap.currentInternshipId);

  useEffect(() => {
    if (open && interns.length === 0) {
      dispatch(fetchInternsAsync());
    }
  }, [open, dispatch, interns.length]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignees: [],
    checklist: [{ id: 1, text: '', completed: false }],
    attachments: [],
    links: [],
    dueDate: '',
    goalId: '',
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'medium',
        assignees: taskToEdit.assignedInterns || [],
        checklist: taskToEdit.checklist ? 
          taskToEdit.checklist.map((item, index) => ({
            id: index + 1,
            text: typeof item === 'string' ? item : item.text || '',
            completed: typeof item === 'object' ? item.completed || false : false
          })) : 
          [{ id: 1, text: '', completed: false }],
        attachments: taskToEdit.attachments || [],
        links: taskToEdit.links || [],
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
        goalId: taskToEdit.goalId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignees: [],
        checklist: [{ id: 1, text: '', completed: false }],
        attachments: [],
        links: [],
        dueDate: '',
        goalId: '',
      });
    }
    setErrors({});
  }, [taskToEdit]);

  const currentProgram = programs.find(program => 
    program.internships?.includes(currentInternshipId) ||
    program.id === currentInternshipId
  );
  const availableGoals = currentProgram?.goals || [];

  console.log('TaskForm Debug:', {
    currentInternshipId,
    programs: programs.length,
    currentProgram,
    availableGoals: availableGoals.length
  });


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChecklistChange = (index, text) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index] = { ...newChecklist[index], text };
    setFormData(prev => ({
      ...prev,
      checklist: newChecklist
    }));
  };

  const addChecklistItem = () => {
    const newId = Math.max(...formData.checklist.map(item => item.id)) + 1;
    setFormData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { id: newId, text: '', completed: false }]
    }));
  };

  const removeChecklistItem = (index) => {
    if (formData.checklist.length > 1) {
      const newChecklist = formData.checklist.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        checklist: newChecklist
      }));
    }
  };

  const addAttachment = () => {
    const newId = Math.max(...formData.attachments.map(item => item.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, { id: newId, name: '', file: null }]
    }));
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
  };

  const addLink = () => {
    const newId = Math.max(...formData.links.map(item => item.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { id: newId, title: '', url: '' }]
    }));
  };

  const removeLink = (index) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      links: newLinks
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }
    
    if (formData.assignees.length === 0) {
      newErrors.assignees = 'Выберите хотя бы одного стажера';
    }
    
    const emptyChecklistItems = formData.checklist.filter(item => !item.text.trim());
    if (emptyChecklistItems.length > 0) {
      newErrors.checklist = 'Все пункты чек-листа должны быть заполнены';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (taskToEdit) {
        const updatedTask = {
          ...taskToEdit,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assignedInterns: formData.assignees,
          checklist: formData.checklist.map(item => item.text),
          attachments: formData.attachments,
          links: formData.links,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : taskToEdit.dueDate,
        };
        
        dispatch(updateTask(updatedTask));
      } else {
        const newTask = {
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assignedInterns: formData.assignees,
          checklist: formData.checklist.map(item => item.text),
          attachments: formData.attachments,
          links: formData.links,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          status: 'pending',
          createdAt: new Date().toISOString(),
          createdBy: 'current-user-id',
        };
        
        dispatch(addTask(newTask));
      }
      
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignees: [],
        checklist: [{ id: 1, text: '', completed: false }],
        attachments: [],
        links: [],
        dueDate: '',
      });
      setErrors({});
      
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignees: [],
      checklist: [{ id: 1, text: '', completed: false }],
      attachments: [],
      links: [],
      dueDate: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          {taskToEdit ? 'Редактировать задание' : 'Создать задание'}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Заголовок */}
          <TextField
            label="Заголовок задания"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            required
            error={!!errors.title}
            helperText={errors.title}
          />
          
          {/* Описание */}
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
          
          {/* Приоритет и дата */}
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

          {/* Цель программы стажировки */}
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
          
          {/* Назначение стажерам */}
          <FormControl fullWidth error={!!errors.assignees}>
            <InputLabel>Назначить стажерам</InputLabel>
            <Select
              multiple
              value={formData.assignees}
              onChange={(e) => handleInputChange('assignees', e.target.value)}
              label="Назначить стажерам"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const intern = interns.find(i => i.id === value);
                    return (
                      <Chip 
                        key={value} 
                        label={intern?.name || value} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {interns.map((intern) => (
                <MenuItem key={intern.id} value={intern.id}>
                  <Box>
                    <Typography variant="body2">{intern.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {intern.department}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.assignees && (
              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                {errors.assignees}
              </Typography>
            )}
          </FormControl>
          
          <Divider />
          
          {/* Чек-лист */}
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
            <Button
              startIcon={<Add />}
              onClick={addChecklistItem}
              size="small"
              sx={{ mt: 1 }}
            >
              Добавить пункт
            </Button>
            {errors.checklist && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.checklist}
              </Alert>
            )}
          </Box>
          
          <Divider />
          
          {/* Файлы */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Прикрепленные файлы
            </Typography>
            {formData.attachments.map((attachment, index) => (
              <Box key={attachment.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  placeholder="Название файла"
                  value={attachment.name}
                  onChange={(e) => {
                    const newAttachments = [...formData.attachments];
                    newAttachments[index] = { ...newAttachments[index], name: e.target.value };
                    setFormData(prev => ({ ...prev, attachments: newAttachments }));
                  }}
                  fullWidth
                  size="small"
                />
                <IconButton 
                  onClick={() => removeAttachment(index)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AttachFile />}
              onClick={addAttachment}
              size="small"
              sx={{ mt: 1 }}
            >
              Добавить файл
            </Button>
          </Box>
          
          <Divider />
          
          {/* Ссылки */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Полезные ссылки
            </Typography>
            {formData.links.map((link, index) => (
              <Box key={link.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  placeholder="Название ссылки"
                  value={link.title}
                  onChange={(e) => {
                    const newLinks = [...formData.links];
                    newLinks[index] = { ...newLinks[index], title: e.target.value };
                    setFormData(prev => ({ ...prev, links: newLinks }));
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...formData.links];
                    newLinks[index] = { ...newLinks[index], url: e.target.value };
                    setFormData(prev => ({ ...prev, links: newLinks }));
                  }}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <IconButton 
                  onClick={() => removeLink(index)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<Link />}
              onClick={addLink}
              size="small"
              sx={{ mt: 1 }}
            >
              Добавить ссылку
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Создать задание
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
