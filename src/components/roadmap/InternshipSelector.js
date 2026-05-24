import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Edit,
  Delete,
  School,
  Schedule,
  CheckCircle,
  Pause,
  Note,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { deleteInternshipAsync, setCurrentInternship } from '../../store/slices/roadmapSlice';
import ConfirmDialog from '../ui/ConfirmDialog';
import { getApiErrorMessage } from '../../utils/apiResponse';
import { getRoadmapEntityStatusLabel } from '../../utils/roadmapEntityStatus';
import { canDeleteRoadmapEntity } from '../../utils/roadmapPermissions';
import { getNormalizedRole } from '../../utils/resolveAppRole';

const InternshipSelector = ({
  onEditInternship,
  onCreateIpr,
  canEdit = true,
  entityViewMode = 'templates',
  onChangeEntityViewMode,
  useIpr = false,
}) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { internships, currentInternshipId } = useSelector((state) => state.roadmap);
  const currentUser = useSelector((state) => state.auth.user);
  const authRole = useSelector((state) => state.auth.role);
  const userRole = currentUser?.role ?? authRole;
  const appRole = getNormalizedRole(currentUser) ?? userRole;

  const isIntern = appRole === 'intern';
  const isMentor = appRole === 'mentor';
  const canDeleteEntity = (entity) =>
    canDeleteRoadmapEntity(entity, currentUser, appRole, {
      trustListOwnership: isMentor,
    });
  const showEntityActions = !isIntern && canEdit;
  const internInternship = isIntern
    ? internships.find((internship) => internship.status === 'active') || internships[0] || null
    : null;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return {
          label: getRoadmapEntityStatusLabel(status),
          color: 'success',
          icon: <CheckCircle />,
        };
      case 'completed':
        return {
          label: getRoadmapEntityStatusLabel(status),
          color: 'default',
          icon: <CheckCircle />,
        };
      case 'paused':
        return {
          label: getRoadmapEntityStatusLabel(status),
          color: 'warning',
          icon: <Pause />,
        };
      case 'draft':
        return {
          label: getRoadmapEntityStatusLabel(status),
          color: 'info',
          icon: <Note />,
        };
      case 'archived':
        return {
          label: getRoadmapEntityStatusLabel(status),
          color: 'default',
          icon: <Schedule />,
        };
      default:
        return {
          label: getRoadmapEntityStatusLabel(status),
          color: 'default',
          icon: <Schedule />,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const handleInternshipChange = (event) => {
    const value = event.target.value;
    dispatch(setCurrentInternship(value || null));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const isIprEntity = useIpr || Boolean(deleteTarget.internId);
      await dispatch(
        deleteInternshipAsync({
          internshipId: deleteTarget.id,
          useIpr: isIprEntity,
        })
      ).unwrap();
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(getApiErrorMessage(e, 'Не удалось удалить'));
    } finally {
      setDeleting(false);
    }
  };

  const currentInternship = isIntern 
    ? internInternship 
    : internships.find(i => i.id === currentInternshipId);

  React.useEffect(() => {
    if (isIntern && internInternship && currentInternshipId !== internInternship.id) {
      dispatch(setCurrentInternship(internInternship.id));
    }
  }, [isIntern, internInternship, currentInternshipId, dispatch]);

  if (isIntern && !internInternship) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            Вы не назначены ни на одну стажировку. Обратитесь к ментору.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {isIntern ? 'Моя стажировка' : 'Выбор стажировки'}
        </Typography>
        {isMentor && (
          <ToggleButtonGroup
            value={entityViewMode}
            exclusive
            size="small"
            onChange={(_, value) => value && onChangeEntityViewMode?.(value)}
          >
            <ToggleButton value="templates">Шаблоны</ToggleButton>
            <ToggleButton value="iprs">ИПР</ToggleButton>
          </ToggleButtonGroup>
        )}
        {!isIntern && canEdit && (
          <Button variant="outlined" size="small" onClick={onCreateIpr}>
            Создать ИПР
          </Button>
        )}
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError('')}>
          {deleteError}
        </Alert>
      )}

      {!isIntern && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{entityViewMode === 'iprs' ? 'Активный ИПР' : 'Активный шаблон'}</InputLabel>
          <Select
            value={currentInternshipId || ''}
            label={entityViewMode === 'iprs' ? 'Активный ИПР' : 'Активный шаблон'}
            onChange={handleInternshipChange}
          >
            <MenuItem value="">
              <em>Выберите...</em>
            </MenuItem>
            {internships.map((internship) => {
              const statusInfo = getStatusInfo(internship.status);
              return (
                <MenuItem key={internship.id} value={internship.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <School sx={{ color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">{internship.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      icon={statusInfo.icon}
                      size="small"
                    />
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}

      {currentInternship && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{currentInternship.title}</Typography>
                  <Chip
                    label={getStatusInfo(currentInternship.status).label}
                    color={getStatusInfo(currentInternship.status).color}
                    icon={getStatusInfo(currentInternship.status).icon}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {currentInternship.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    <Schedule sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    {formatDate(currentInternship.startDate)} - {formatDate(currentInternship.endDate)}
                  </Typography>
                  {!isIntern && (
                    <Typography variant="caption" color="text.secondary">
                      <School sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {currentInternship.internIds?.length || 0} стажеров
                    </Typography>
                  )}
                </Box>
              </Box>
              {showEntityActions && (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Tooltip title={useIpr || currentInternship.internId ? 'Редактировать ИПР' : 'Редактировать шаблон'}>
                    <IconButton
                      size="small"
                      onClick={() => onEditInternship(currentInternship)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  {(canDeleteEntity(currentInternship) || isMentor) && (
                    <Tooltip title={useIpr || currentInternship.internId ? 'Удалить ИПР' : 'Удалить шаблон'}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(currentInternship)}
                        aria-label={useIpr || currentInternship.internId ? 'Удалить ИПР' : 'Удалить шаблон'}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {!isIntern && internships.length > 1 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {entityViewMode === 'iprs' ? 'Все ИПР:' : 'Все шаблоны:'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {internships.map((internship) => {
              const statusInfo = getStatusInfo(internship.status);
              const isActive = internship.id === currentInternshipId;
              return (
                <Chip
                  key={internship.id}
                  label={internship.title}
                  color={isActive ? 'primary' : statusInfo.color}
                  variant={isActive ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => dispatch(setCurrentInternship(internship.id))}
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget && (useIpr || deleteTarget.internId)
            ? 'Удаление ИПР'
            : 'Удаление шаблона'
        }
        message={
          deleteTarget
            ? `Удалить «${deleteTarget.title}»?`
            : ''
        }
        detail="Действие нельзя отменить. Все этапы будут удалены вместе с записью."
        confirmLabel="Удалить"
        confirmColor="error"
        confirming={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default InternshipSelector;
