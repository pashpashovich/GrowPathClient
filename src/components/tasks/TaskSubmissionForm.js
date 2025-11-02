import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import { Add, Delete, AttachFile, Link as LinkIcon, Send } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { submitTask } from '../../store/slices/taskSlice';

const TaskSubmissionForm = ({ task, onClose }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user); 

  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionLinks, setSubmissionLinks] = useState(['']);
  const [submissionComment, setSubmissionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setSubmissionFiles([...submissionFiles, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setSubmissionFiles(submissionFiles.filter(file => file.id !== fileId));
  };

  const handleLinkChange = (e, index) => {
    const newLinks = [...submissionLinks];
    newLinks[index] = e.target.value;
    setSubmissionLinks(newLinks);
  };

  const handleAddLink = () => {
    setSubmissionLinks([...submissionLinks, '']);
  };

  const handleRemoveLink = (index) => {
    const newLinks = submissionLinks.filter((_, i) => i !== index);
    setSubmissionLinks(newLinks);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFiles = () => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'application/x-zip-compressed'
    ];

    for (const file of submissionFiles) {
      if (file.size > maxSize) {
        return `Файл "${file.name}" слишком большой. Максимальный размер: 10MB`;
      }
      if (!allowedTypes.includes(file.type)) {
        return `Тип файла "${file.name}" не поддерживается`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateFiles();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (submissionFiles.length === 0 && submissionLinks.filter(link => link.trim()).length === 0) {
      alert('Добавьте хотя бы один файл или ссылку');
      return;
    }

    setIsSubmitting(true);

    try {
      const processedFiles = submissionFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url
      }));

      const processedLinks = submissionLinks.filter(link => link.trim());

      dispatch(submitTask({
        taskId: task.id,
        internId: currentUser?.id || 'intern-1',
        files: processedFiles,
        links: processedLinks,
        comment: submissionComment
      }));

      onClose();
    } catch (error) {
      console.error('Ошибка при отправке задачи:', error);
      alert('Произошла ошибка при отправке задачи');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Сдача задания: {task.title}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {task.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Прикрепить файлы
        </Typography>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="submission-file-upload"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
        />
        <label htmlFor="submission-file-upload">
          <Button 
            component="span" 
            startIcon={<AttachFile />} 
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Выбрать файлы
          </Button>
        </label>
        
        {submissionFiles.length > 0 && (
          <List>
            {submissionFiles.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(file.id)}>
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText 
                  primary={file.name}
                  secondary={`${formatFileSize(file.size)} • ${file.type}`}
                />
              </ListItem>
            ))}
          </List>
        )}
        
        <Alert severity="info" sx={{ mt: 1 }}>
          Максимальный размер файла: 10MB. Поддерживаемые форматы: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP
        </Alert>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ссылки на репозитории и ресурсы
        </Typography>
        <List>
          {submissionLinks.map((link, index) => (
            <ListItem
              key={index}
              secondaryAction={
                submissionLinks.length > 1 && (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveLink(index)}>
                    <Delete />
                  </IconButton>
                )
              }
            >
              <TextField
                fullWidth
                variant="outlined"
                value={link}
                onChange={(e) => handleLinkChange(e, index)}
                placeholder={`Ссылка ${index + 1} (GitHub, GitLab, etc.)`}
                type="url"
              />
            </ListItem>
          ))}
        </List>
        <Button startIcon={<LinkIcon />} onClick={handleAddLink} sx={{ mt: 1 }}>
          Добавить ссылку
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Комментарий к сдаче"
          fullWidth
          multiline
          rows={3}
          value={submissionComment}
          onChange={(e) => setSubmissionComment(e.target.value)}
          placeholder="Опишите, что было сделано, какие технологии использованы, с какими трудностями столкнулись..."
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          После отправки задание перейдет в статус "На ревью" и ментор получит уведомление
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить на ревью'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TaskSubmissionForm;
