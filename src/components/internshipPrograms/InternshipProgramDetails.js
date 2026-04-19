import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  CalendarToday,
  School,
  People,
  CheckCircle,
  Schedule,
  Cancel,
  Assignment,
  EmojiEvents,
  Timeline,
} from '@mui/icons-material';

const InternshipProgramDetails = ({ open, onClose, program }) => {
  if (!program) return null;

  const requirements = program.requirements || [];
  const goals = program.goals || [];
  const selectionStages = program.selectionStages || [];
  const competencies = program.competencies || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Активная';
      case 'draft': return 'Черновик';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      case 'archived': return 'В архиве';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'draft': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'archived': return <Schedule />;
      default: return <Schedule />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h2">
            {program.title}
          </Typography>
          <Chip
            icon={getStatusIcon(program.status)}
            label={getStatusLabel(program.status)}
            color={getStatusColor(program.status)}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Описание программы
            </Typography>
            <Typography variant="body1">
              {program.description}
            </Typography>
            {(program.itDirectionRef?.displayName || program.itDirection) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Направление:{' '}
                {program.itDirectionRef?.displayName || program.itDirection}
                {program.itDirectionRef?.code ? ` (${program.itDirectionRef.code})` : ''}
              </Typography>
            )}
          </Paper>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarToday sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {formatDate(program.startDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Дата начала
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {program.duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Месяцев
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {program.maxPlaces}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Мест
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {requirements.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Требований
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Требования к кандидатам
            </Typography>
            <List>
              {requirements.map((requirement, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={requirement} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {goals.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Цели стажировки
              </Typography>
              <List>
                {goals.map((goal, index) => (
                  <ListItem key={typeof goal === 'object' && goal?.id ? goal.id : index}>
                    <ListItemIcon>
                      <EmojiEvents color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={typeof goal === 'string' ? goal : goal.title}
                      secondary={typeof goal === 'string' ? undefined : goal.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {competencies.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Компетенции
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {competencies.map((competency, index) => (
                  <Chip
                    key={index}
                    label={competency}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          )}

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Этапы отбора
            </Typography>
            <List>
              {selectionStages.map((stage, index) => (
                <React.Fragment key={typeof stage === 'object' && stage?.id ? stage.id : index}>
                  <ListItem>
                    <ListItemIcon>
                      <Timeline color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        typeof stage === 'string'
                          ? `${index + 1}. ${stage}`
                          : `${index + 1}. ${stage.name}`
                      }
                      secondary={typeof stage === 'string' ? undefined : stage.description}
                    />
                    {typeof stage === 'object' && (
                      <Chip
                        label={stage.isActive ? 'Активен' : 'Неактивен'}
                        color={stage.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    )}
                  </ListItem>
                  {index < selectionStages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Информация о программе
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Создана: {formatDate(program.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Обновлена: {formatDate(program.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InternshipProgramDetails;

