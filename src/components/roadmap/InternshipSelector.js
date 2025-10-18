import React from 'react';
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
  Button,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  Schedule,
  CheckCircle,
  Pause,
  Note,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentInternship } from '../../store/slices/roadmapSlice';

const InternshipSelector = ({ onAddInternship, onEditInternship, canEdit = true }) => {
  const dispatch = useDispatch();
  const { internships, currentInternshipId } = useSelector((state) => state.roadmap);
  const currentUser = useSelector((state) => state.auth.user);
  
  // Для стажеров находим их стажировку
  const isIntern = currentUser?.role === 'intern';
  const internInternship = isIntern 
    ? internships.find(internship => 
        internship.internIds?.includes(currentUser?.id)
      )
    : null;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { 
          label: 'Активная', 
          color: 'success', 
          icon: <CheckCircle /> 
        };
      case 'completed':
        return { 
          label: 'Завершена', 
          color: 'default', 
          icon: <CheckCircle /> 
        };
      case 'paused':
        return { 
          label: 'Приостановлена', 
          color: 'warning', 
          icon: <Pause /> 
        };
      case 'draft':
        return { 
          label: 'Черновик', 
          color: 'info', 
          icon: <Note /> 
        };
      default:
        return { 
          label: status, 
          color: 'default', 
          icon: <Schedule /> 
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const handleInternshipChange = (event) => {
    dispatch(setCurrentInternship(event.target.value));
  };

  // Определяем текущую стажировку
  const currentInternship = isIntern 
    ? internInternship 
    : internships.find(i => i.id === currentInternshipId);

  // Автоматически устанавливаем стажировку для стажера
  React.useEffect(() => {
    if (isIntern && internInternship && currentInternshipId !== internInternship.id) {
      dispatch(setCurrentInternship(internInternship.id));
    }
  }, [isIntern, internInternship, currentInternshipId, dispatch]);

  // Если стажер не найден в стажировках
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
        {canEdit && !isIntern && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => onAddInternship()}
            size="small"
          >
            Создать стажировку
          </Button>
        )}
      </Box>

      {/* Селектор стажировок только для менторов */}
      {!isIntern && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Активная стажировка</InputLabel>
          <Select
            value={currentInternshipId || ''}
            label="Активная стажировка"
            onChange={handleInternshipChange}
          >
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

      {/* Информация о текущей стажировке */}
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
                  <Typography variant="caption" color="text.secondary">
                    <School sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    {currentInternship.internIds?.length || 0} стажеров
                  </Typography>
                </Box>
              </Box>
              {canEdit && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Редактировать стажировку">
                    <IconButton
                      size="small"
                      onClick={() => onEditInternship(currentInternship)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Список всех стажировок только для менторов */}
      {!isIntern && internships.length > 1 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Все стажировки:
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
    </Box>
  );
};

export default InternshipSelector;
