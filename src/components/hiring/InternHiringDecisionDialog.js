import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Close, PictureAsPdf, Gavel } from '@mui/icons-material';
import { internAPI } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiResponse';
import { getAxiosBlobErrorMessage, saveAxiosBlobResponse } from '../../utils/downloadBlob';
import {
  HIRING_DECISIONS,
  hiringDecisionLabel,
  INTERN_STATUS_LABELS,
  normalizeHiringDecision,
} from '../../utils/hiringDecision';
import ConfirmDialog from '../ui/ConfirmDialog';

const InternHiringDecisionDialog = ({
  open,
  onClose,
  internId,
  programId,
  internName = '',
  programTitle = '',
  onRecorded,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [decision, setDecision] = useState('');
  const [comment, setComment] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadDecision = useCallback(async () => {
    if (!internId || !programId) return;
    setLoading(true);
    setError('');
    try {
      const res = await internAPI.getInternHiringDecision(internId, programId);
      const view = normalizeHiringDecision(res.data);
      setData(view);
      if (view?.recorded && view.decision) {
        setDecision(view.decision);
        setComment(view.comment || '');
      } else if (view?.systemRecommendation) {
        setDecision(view.systemRecommendation);
      } else {
        setDecision('');
      }
      if (!view?.recorded) {
        setComment(view?.comment || '');
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось загрузить данные для решения'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [internId, programId]);

  useEffect(() => {
    if (open) {
      loadDecision();
    } else {
      setData(null);
      setDecision('');
      setComment('');
      setError('');
      setConfirmOpen(false);
    }
  }, [open, loadDecision]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await internAPI.downloadInternshipResultReport(internId);
      await saveAxiosBlobResponse(response, `intern-result-${internId}.pdf`);
    } catch (e) {
      setError(await getAxiosBlobErrorMessage(e, 'Не удалось сформировать PDF'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!decision) return;
    setSaving(true);
    setError('');
    try {
      const res = await internAPI.recordInternHiringDecision(internId, {
        programId: Number(programId),
        decision,
        comment: comment.trim() || undefined,
      });
      const view = normalizeHiringDecision(res.data);
      setData(view);
      setConfirmOpen(false);
      onRecorded?.(view);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось сохранить решение'));
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const recorded = Boolean(data?.recorded);
  const title = internName
    ? `Решение о найме: ${internName}`
    : 'Решение о найме';

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              {programTitle && (
                <Typography variant="body2" color="text.secondary">
                  {programTitle}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose} size="small" aria-label="Закрыть" sx={{ mt: -0.5 }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={`Статус: ${INTERN_STATUS_LABELS[data.internStatus] || data.internStatus || '—'}`}
                  color={data.internStatus === 'additional_assessment' ? 'warning' : 'default'}
                />
                {recorded && (
                  <Chip size="small" color="success" label="Решение утверждено" />
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={pdfLoading ? <CircularProgress size={16} /> : <PictureAsPdf />}
                  disabled={pdfLoading}
                  onClick={handleDownloadPdf}
                >
                  Итоговый отчёт (PDF)
                </Button>
              </Box>

              {data.systemRecommendation && (
                <Alert severity="info">
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Рекомендация системы: {hiringDecisionLabel(data.systemRecommendation)}
                  </Typography>
                  {data.systemRecommendationReason && (
                    <Typography variant="body2">{data.systemRecommendationReason}</Typography>
                  )}
                </Alert>
              )}

              {recorded && (
                <Alert severity="success">
                  Утверждено: {hiringDecisionLabel(data.decision)}
                  {data.decidedByName ? ` (${data.decidedByName})` : ''}
                  {data.decidedAt
                    ? ` · ${new Date(data.decidedAt).toLocaleDateString('ru-RU')}`
                    : ''}
                </Alert>
              )}

              <FormControl component="fieldset" disabled={recorded}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {recorded ? 'Зафиксированное решение' : 'Выберите решение'}
                </Typography>
                <RadioGroup value={decision} onChange={(e) => setDecision(e.target.value)}>
                  {HIRING_DECISIONS.map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={hiringDecisionLabel(value)}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <TextField
                label="Обоснование (необязательно)"
                multiline
                minRows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={recorded}
                placeholder="Комментарий к решению…"
              />

              {!recorded && (
                <Typography variant="caption" color="text.secondary">
                  После утверждения статус стажёра обновится, участникам будут отправлены уведомления по
                  email.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Закрыть</Button>
          {!loading && data && !recorded && (
            <Button
              variant="contained"
              startIcon={<Gavel />}
              disabled={!decision || saving}
              onClick={() => setConfirmOpen(true)}
            >
              Утвердить решение
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Утвердить решение о найме"
        message="Подтвердите выбранное решение. Его нельзя будет изменить через этот интерфейс."
        detail={
          decision
            ? `${internName || 'Стажёр'} · ${hiringDecisionLabel(decision)}`
            : ''
        }
        confirmLabel="Утвердить"
        confirming={saving}
        onClose={() => !saving && setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </>
  );
};

export default InternHiringDecisionDialog;
