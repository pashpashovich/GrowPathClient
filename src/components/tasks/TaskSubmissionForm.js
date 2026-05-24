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
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material';
import { Delete, AttachFile, Link as LinkIcon, Send } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { submitTaskAsync } from '../../store/slices/taskSlice';
import { uploadTaskArtifactFile } from '../../utils/taskArtifactUpload';
import { getApiErrorMessage } from '../../utils/apiResponse';

const TaskSubmissionForm = ({ task, onClose, onSubmitted }) => {
  const dispatch = useDispatch();

  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionLinks, setSubmissionLinks] = useState(['']);
  const [submissionComment, setSubmissionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setSubmissionFiles((prev) => [...prev, ...newFiles]);
    setError('');
  };

  const handleRemoveFile = (fileId) => {
    setSubmissionFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleLinkChange = (e, index) => {
    const newLinks = [...submissionLinks];
    newLinks[index] = e.target.value;
    setSubmissionLinks(newLinks);
  };

  const handleAddLink = () => {
    setSubmissionLinks((prev) => [...prev, '']);
  };

  const handleRemoveLink = (index) => {
    setSubmissionLinks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [''];
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const validateFiles = () => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
    ];

    for (const item of submissionFiles) {
      if (item.size > maxSize) {
        return `Файл «${item.name}» слишком большой. Максимум: 10 МБ`;
      }
      if (item.type && !allowedTypes.includes(item.type)) {
        return `Тип файла «${item.name}» не поддерживается`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateFiles();
    if (validationError) {
      setError(validationError);
      return;
    }

    const links = submissionLinks.map((l) => l.trim()).filter(Boolean);

    if (submissionFiles.length === 0 && links.length === 0 && !submissionComment.trim()) {
      setError('Добавьте файл, ссылку или комментарий к сдаче');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUploadProgress('');

    try {
      for (let i = 0; i < submissionFiles.length; i += 1) {
        const item = submissionFiles[i];
        setUploadProgress(
          submissionFiles.length > 1
            ? `Загрузка файла ${i + 1} из ${submissionFiles.length}…`
            : 'Загрузка файла…'
        );
        await uploadTaskArtifactFile(task.id, item.file);
      }

      setUploadProgress('Отправка на проверку…');

      const payload = {};
      if (links.length > 0) {
        payload.links = links;
      }
      if (submissionComment.trim()) {
        payload.comment = submissionComment.trim();
      }

      await dispatch(
        submitTaskAsync({
          id: task.id,
          data: payload,
        })
      ).unwrap();

      onSubmitted?.();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось сдать задание'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
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

      <Alert severity="info" sx={{ mb: 2 }}>
        Файлы загружаются отдельно (MinIO). В запросе сдачи передаются только ссылки и комментарий.
        После отправки статус станет «На проверке».
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isSubmitting && uploadProgress && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {uploadProgress}
          </Typography>
          <LinearProgress />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Файлы результата
        </Typography>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="submission-file-upload"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
          disabled={isSubmitting}
        />
        <label htmlFor="submission-file-upload">
          <Button
            component="span"
            startIcon={<AttachFile />}
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={isSubmitting}
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
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={isSubmitting}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={file.name}
                  secondary={`${formatFileSize(file.size)}${file.type ? ` • ${file.type}` : ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          До 10 МБ. Форматы: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ссылки (GitHub, GitLab и т.д.)
        </Typography>
        <List>
          {submissionLinks.map((link, index) => (
            <ListItem
              key={index}
              secondaryAction={
                submissionLinks.length > 1 && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveLink(index)}
                    disabled={isSubmitting}
                  >
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
                placeholder={`Ссылка ${index + 1}`}
                type="url"
                disabled={isSubmitting}
              />
            </ListItem>
          ))}
        </List>
        <Button
          startIcon={<LinkIcon />}
          onClick={handleAddLink}
          sx={{ mt: 1 }}
          disabled={isSubmitting}
        >
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
          placeholder="Что сделано, какие технологии, с какими трудностями столкнулись…"
          disabled={isSubmitting}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Задание перейдёт в статус «На проверке» (on_review)
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
            {isSubmitting ? 'Отправка…' : 'Отправить на проверку'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TaskSubmissionForm;
