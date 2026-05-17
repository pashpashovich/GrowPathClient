import React, { useState, useMemo } from 'react';
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
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Pagination,
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
  Search,
  FilterList,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteInternshipProgramAsync,
  setCurrentProgram,
} from '../../store/slices/internshipProgramSlice';

const ITEMS_PER_PAGE = 9;

const InternshipProgramsList = ({ onEdit, onView }) => {
  const dispatch = useDispatch();
  const programs = useSelector((state) => state.internshipProgram.programs);
  const isLoading = useSelector((state) => state.internshipProgram.isLoading);
  const error = useSelector((state) => state.internshipProgram.error);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    itDirection: '',
  });

  const uniqueItDirections = useMemo(() => {
    const directions = new Set();
    programs.forEach((program) => {
      const direction = program.itDirectionRef?.displayName || program.itDirection;
      if (direction) directions.add(direction);
    });
    return Array.from(directions).sort();
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = program.title?.toLowerCase().includes(searchLower);
        const matchesDescription = program.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription) return false;
      }

      if (filters.status && program.status !== filters.status) {
        return false;
      }

      if (filters.itDirection) {
        const direction = program.itDirectionRef?.displayName || program.itDirection;
        if (direction !== filters.itDirection) return false;
      }

      return true;
    });
  }, [programs, filters]);

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);
  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrograms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrograms, currentPage]);

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
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); 
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', itDirection: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = filters.search || filters.status || filters.itDirection;

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
      setProgramToDelete(selectedProgram);
      setIsDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (programToDelete) {
      await dispatch(deleteInternshipProgramAsync(programToDelete.id));
    }
    setIsDeleteDialogOpen(false);
    setProgramToDelete(null);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            placeholder="Поиск по названию или описанию..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            size="small"
            sx={{ minWidth: 280, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.status}
              label="Статус"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="active">Активная</MenuItem>
              <MenuItem value="draft">Черновик</MenuItem>
              <MenuItem value="completed">Завершена</MenuItem>
              <MenuItem value="cancelled">Отменена</MenuItem>
              <MenuItem value="archived">В архиве</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>IT-направление</InputLabel>
            <Select
              value={filters.itDirection}
              label="IT-направление"
              onChange={(e) => handleFilterChange('itDirection', e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              {uniqueItDirections.map((direction) => (
                <MenuItem key={direction} value={direction}>
                  {direction}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              startIcon={<FilterList />}
            >
              Сбросить
            </Button>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Найдено программ: {filteredPrograms.length} из {programs.length}
        </Typography>
      </Box>

      {!isLoading && filteredPrograms.length === 0 && programs.length > 0 && (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          По заданным фильтрам программы не найдены.
        </Typography>
      )}

      {!isLoading && programs.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Программ пока нет. Создайте первую программу стажировки.
        </Typography>
      )}

      <Grid container spacing={3}>
        {paginatedPrograms.map((program) => (
          <Grid key={program.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      flexGrow: 1,
                      mr: 1,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {program.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, program)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {program.description}
                </Typography>

                {(program.itDirectionRef?.displayName || program.itDirection) && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Направление: {program.itDirectionRef?.displayName || program.itDirection}
                  </Typography>
                )}

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

                <Box sx={{ mt: 'auto' }}>
                  {((program.requirementRefs || program.requirements || [])).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Требования:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(program.requirementRefs || program.requirements || []).slice(0, 3).map((req, index) => (
                          <Chip
                            key={index}
                            label={req.requirementText || req}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {(program.requirementRefs || program.requirements || []).length > 3 && (
                          <Chip
                            label={`+${(program.requirementRefs || program.requirements || []).length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {(program.goals || []).length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Целей: {(program.goals || []).length}
                      </Typography>
                    )}

                    {(program.selectionStages || []).length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Этапов отбора: {(program.selectionStages || []).length}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPrograms.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

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

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProgramToDelete(null);
        }}
      >
        <DialogTitle>Удалить программу стажировки</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить программу "{programToDelete?.title}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setProgramToDelete(null);
            }}
          >
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

