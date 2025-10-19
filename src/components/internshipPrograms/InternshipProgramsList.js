import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  School,
  CalendarToday,
  People,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { deleteProgram, setCurrentProgram } from '../../store/slices/internshipProgramSlice';

const InternshipProgramsList = ({ onEdit, onView }) => {
  const dispatch = useDispatch();
  const programs = useSelector((state) => state.internshipProgram.programs);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Активная';
      case 'draft': return 'Черновик';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'draft': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleMenuOpen = (event, program) => {
    setAnchorEl(event.currentTarget);
    setSelectedProgram(program);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProgram(null);
  };

  const handleView = () => {
    if (selectedProgram) {
      dispatch(setCurrentProgram(selectedProgram));
      onView(selectedProgram);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedProgram) {
      onEdit(selectedProgram);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedProgram) {
      setIsDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedProgram) {
      dispatch(deleteProgram(selectedProgram.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedProgram(null);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {programs.map((program) => (
          <Grid item xs={12} md={6} lg={4} key={program.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
                    {program.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, program)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {program.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(program.status)}
                    label={getStatusLabel(program.status)}
                    color={getStatusColor(program.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Начало: {formatDate(program.startDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <School sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Длительность: {program.duration} мес.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Мест: {program.maxPlaces}
                    </Typography>
                  </Box>
                </Box>

                {program.requirements.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Требования:
                    </Typography>
                    {program.requirements.slice(0, 3).map((requirement, index) => (
                      <Chip
                        key={index}
                        label={requirement}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                      />
                    ))}
                    {program.requirements.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{program.requirements.length - 3} еще
                      </Typography>
                    )}
                  </Box>
                )}

                {program.goals.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Целей: {program.goals.length}
                    </Typography>
                  </Box>
                )}

                {program.selectionStages.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Этапов отбора: {program.selectionStages.length}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} />
          Просмотр
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Редактировать
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Удалить программу стажировки</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить программу "{selectedProgram?.title}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InternshipProgramsList;