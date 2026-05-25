import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAssessmentAsync,
  updateAssessmentAsync,
  clearAssessmentError,
} from '../../store/slices/assessmentSlice';

const RATING_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

function RatingSelect({ label, value, onChange, required = false }) {
  return (
    <FormControl fullWidth margin="normal" required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value === '' ? '' : String(value)}
        label={label}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
        }}
      >
        {!required && <MenuItem value="">Не указано</MenuItem>}
        {RATING_OPTIONS.map((n) => (
          <MenuItem key={n} value={String(n)}>
            {n}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const IprStageAssessmentDialog = ({
  open,
  onClose,
  stage,
  context,
  existingAssessment,
}) => {
  const dispatch = useDispatch();
  const { saveLoading, saveError } = useSelector((state) => state.assessment);
  const isEdit = Boolean(existingAssessment?.id);

  const [overallRating, setOverallRating] = useState('');
  const [qualityRating, setQualityRating] = useState('');
  const [speedRating, setSpeedRating] = useState('');
  const [communicationRating, setCommunicationRating] = useState('');
  const [comment, setComment] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) return;
    dispatch(clearAssessmentError());
    setLocalError('');
    if (existingAssessment) {
      setOverallRating(existingAssessment.overallRating ?? '');
      setQualityRating(existingAssessment.qualityRating ?? '');
      setSpeedRating(existingAssessment.speedRating ?? '');
      setCommunicationRating(existingAssessment.communicationRating ?? '');
      setComment(existingAssessment.comment || '');
    } else {
      setOverallRating('');
      setQualityRating('');
      setSpeedRating('');
      setCommunicationRating('');
      setComment('');
    }
  }, [open, existingAssessment, dispatch]);

  const handleSubmit = async () => {
    if (overallRating === '' || overallRating == null) {
      setLocalError('Укажите общую оценку (обязательное поле).');
      return;
    }
    if (!context?.internId || !context?.internshipId || !stage?.id) {
      setLocalError('Не хватает данных стажёра, программы или этапа.');
      return;
    }

    setLocalError('');
    const ratingsPayload = {
      overallRating: Number(overallRating),
      ...(qualityRating !== '' && { qualityRating: Number(qualityRating) }),
      ...(speedRating !== '' && { speedRating: Number(speedRating) }),
      ...(communicationRating !== '' && { communicationRating: Number(communicationRating) }),
      comment: comment.trim() || undefined,
    };

    const refreshParams = {
      iprId: context.iprId,
      internId: context.internId,
      internshipId: context.internshipId,
    };

    try {
      if (isEdit) {
        await dispatch(
          updateAssessmentAsync({
            id: existingAssessment.id,
            data: ratingsPayload,
            refreshParams,
          })
        ).unwrap();
      } else {
        await dispatch(
          createAssessmentAsync({
            internId: context.internId,
            internshipId: context.internshipId,
            iprStageId: Number(stage.id),
            iprId: context.iprId,
            ...ratingsPayload,
          })
        ).unwrap();
      }
      onClose(true);
    } catch (e) {
      setLocalError(typeof e === 'string' ? e : 'Не удалось сохранить ассессмент');
    }
  };

  return (
    <Dialog open={open} onClose={() => !saveLoading && onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Редактировать ассессмент' : 'Провести ассессмент'}
        {stage?.title ? `: ${stage.title}` : ''}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Оценка ментора по этапу ИПР (шкала 1–5). Отдельно от оценок задач при ревью.
        </Typography>

        {(localError || saveError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || saveError}
          </Alert>
        )}

        <RatingSelect
          label="Общая оценка"
          value={overallRating}
          onChange={setOverallRating}
          required
        />
        <RatingSelect label="Качество" value={qualityRating} onChange={setQualityRating} />
        <RatingSelect label="Скорость" value={speedRating} onChange={setSpeedRating} />
        <RatingSelect
          label="Коммуникация"
          value={communicationRating}
          onChange={setCommunicationRating}
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
          placeholder="Итоги этапа, рекомендации..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={saveLoading}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saveLoading}>
          {saveLoading ? <CircularProgress size={22} color="inherit" /> : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IprStageAssessmentDialog;
