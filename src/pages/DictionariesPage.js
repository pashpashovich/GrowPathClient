import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Search,
  FilterList,
  Download,
  Terminal,
  Business,
  Psychology,
  CheckCircle,
  Update,
  ListAlt,
} from '@mui/icons-material';
import { hrAPI, departmentAPI } from '../services/api';

const DICTIONARY_TYPES = {
  IT_DIRECTIONS: 'it-directions',
  DEPARTMENTS: 'departments',
  COMPETENCIES: 'competencies',
  REQUIREMENTS: 'requirements',
  SELECTION_STAGES: 'selection-stages',
  GOALS: 'goals',
};

const DICTIONARY_CONFIG = {
  [DICTIONARY_TYPES.IT_DIRECTIONS]: {
    title: 'IT-направления',
    description: 'Управление основными технологическими стеками для стажировок',
    icon: Terminal,
    color: '#3b82f6',
    fetchFn: () => hrAPI.getItDirections(),
    createFn: (data) => hrAPI.createItDirection(data),
    updateFn: (id, data) => hrAPI.updateItDirection(id, data),
    deleteFn: (id) => hrAPI.updateItDirection(id, { isActive: false }),
    fields: [
      { name: 'code', label: 'Код', required: true, maxLength: 50 },
      { name: 'displayName', label: 'Название', required: true, maxLength: 200 },
    ],
    getInitials: (item) => item.code?.substring(0, 2).toUpperCase() || 'IT',
    getName: (item) => item.displayName,
    getDescription: (item) => item.code,
  },
  [DICTIONARY_TYPES.DEPARTMENTS]: {
    title: 'Отделы',
    description: 'Управление организационной структурой компании',
    icon: Business,
    color: '#10b981',
    fetchFn: () => departmentAPI.getDepartments(),
    createFn: (data) => departmentAPI.createDepartment(data),
    updateFn: (id, data) => departmentAPI.updateDepartment(id, data),
    deleteFn: (id) => departmentAPI.deleteDepartment(id),
    fields: [
      { name: 'name', label: 'Название', required: true },
      { name: 'description', label: 'Описание', multiline: true },
    ],
    getInitials: (item) => item.name?.substring(0, 2).toUpperCase() || 'ОТ',
    getName: (item) => item.name,
    getDescription: (item) => item.description,
  },
  [DICTIONARY_TYPES.COMPETENCIES]: {
    title: 'Компетенции',
    description: 'Управление навыками и компетенциями для программ стажировок',
    icon: Psychology,
    color: '#8b5cf6',
    fetchFn: () => hrAPI.getCompetencies(),
    createFn: (data) => hrAPI.createCompetency(data),
    updateFn: (id, data) => hrAPI.updateCompetency(id, data),
    deleteFn: (id) => hrAPI.updateCompetency(id, { isActive: false }),
    fields: [
      { name: 'name', label: 'Название', required: true, maxLength: 255 },
    ],
    getInitials: (item) => item.name?.substring(0, 2).toUpperCase() || 'КМ',
    getName: (item) => item.name,
    getDescription: () => '',
    hideDescription: true,
  },
  [DICTIONARY_TYPES.REQUIREMENTS]: {
    title: 'Требования к кандидатам',
    description: 'Управление требованиями для программ стажировок',
    icon: CheckCircle,
    color: '#f59e0b',
    fetchFn: () => hrAPI.getProgramRequirementDefinitions(),
    createFn: (data) => hrAPI.createProgramRequirementDefinition(data),
    updateFn: (id, data) => hrAPI.updateProgramRequirementDefinition(id, data),
    deleteFn: (id) => hrAPI.updateProgramRequirementDefinition(id, { isActive: false }),
    fields: [
      { name: 'requirementText', label: 'Текст требования', required: true, multiline: true },
    ],
    getInitials: () => 'ТР',
    getName: (item) => item.requirementText,
    getDescription: () => '',
    hideDescription: true,
  },
  [DICTIONARY_TYPES.SELECTION_STAGES]: {
    title: 'Этапы отбора',
    description: 'Управление этапами отбора кандидатов',
    icon: Update,
    color: '#ec4899',
    fetchFn: () => hrAPI.getProgramSelectionStageDefinitions(),
    createFn: (data) => hrAPI.createProgramSelectionStageDefinition(data),
    updateFn: (id, data) => hrAPI.updateProgramSelectionStageDefinition(id, data),
    deleteFn: (id) => hrAPI.updateProgramSelectionStageDefinition(id, { isActive: false }),
    fields: [
      { name: 'name', label: 'Название', required: true, maxLength: 255 },
      { name: 'description', label: 'Описание', multiline: true },
      { name: 'isActive', label: 'Активен', type: 'checkbox' },
    ],
    getInitials: (item) => item.name?.substring(0, 2).toUpperCase() || 'ЭТ',
    getName: (item) => item.name,
    getDescription: (item) => item.description,
  },
  [DICTIONARY_TYPES.GOALS]: {
    title: 'Цели программ',
    description: 'Управление целями для программ стажировок',
    icon: ListAlt,
    color: '#06b6d4',
    fetchFn: () => hrAPI.getProgramGoalDefinitions(),
    createFn: (data) => hrAPI.createProgramGoalDefinition(data),
    updateFn: (id, data) => hrAPI.updateProgramGoalDefinition(id, data),
    deleteFn: (id) => hrAPI.updateProgramGoalDefinition(id, { isActive: false }),
    fields: [
      { name: 'title', label: 'Заголовок', required: true, maxLength: 500 },
      { name: 'description', label: 'Описание', multiline: true },
    ],
    getInitials: (item) => item.title?.substring(0, 2).toUpperCase() || 'ЦЛ',
    getName: (item) => item.title,
    getDescription: (item) => item.description,
  },
};

const DictionariesPage = () => {
  const [selectedType, setSelectedType] = useState(DICTIONARY_TYPES.IT_DIRECTIONS);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const config = DICTIONARY_CONFIG[selectedType];

  useEffect(() => {
    loadItems();
  }, [selectedType]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = items.filter((item) => {
        const name = config.getName(item)?.toLowerCase() || '';
        const description = config.getDescription(item)?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || description.includes(query);
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items, config]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await config.fetchFn();
      const data = response.data?.data || response.data || [];
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    if (item) {
      const data = {};
      config.fields.forEach((field) => {
        data[field.name] = item[field.name] || '';
      });
      setFormData(data);
    } else {
      const data = {};
      config.fields.forEach((field) => {
        data[field.name] = field.type === 'checkbox' ? true : '';
      });
      setFormData(data);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingItem) {
        await config.updateFn(editingItem.id, formData);
      } else {
        await config.createFn(formData);
      }
      await loadItems();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('Не удалось сохранить запись');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      await config.deleteFn(itemToDelete.id);
      await loadItems();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Не удалось удалить запись');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const activeCount = items.filter((item) => item.isActive !== false).length;
  const totalCount = items.length;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Управление справочниками
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Добавить запись
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '0 0 280px' }}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Категории
                </Typography>
              </Box>
              <Box>
                {Object.entries(DICTIONARY_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isSelected = selectedType === key;
                  const count = key === selectedType ? totalCount : 0;
                  return (
                    <Button
                      key={key}
                      fullWidth
                      onClick={() => setSelectedType(key)}
                      sx={{
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        borderLeft: 4,
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        bgcolor: isSelected ? 'primary.50' : 'transparent',
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        fontWeight: isSelected ? 600 : 400,
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: isSelected ? 'primary.50' : 'grey.50',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon fontSize="small" />
                        <Typography variant="body2">{cfg.title}</Typography>
                      </Box>
                      {count > 0 && (
                        <Chip
                          label={count}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            bgcolor: isSelected ? 'primary.100' : 'grey.200',
                            color: isSelected ? 'primary.main' : 'text.secondary',
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1' }}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" align="center">
                  {config.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {config.description}
                </Typography>
              </Box>

              <TextField
                fullWidth
                placeholder="Поиск по справочникам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : filteredItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.100', color: 'grey.400', mx: 'auto', mb: 2 }}>
                    <ListAlt sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Справочник пока пуст
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Похоже, в этой категории еще нет записей. Создайте первую запись, чтобы начать работу.
                  </Typography>
                  <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                    Создать запись
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Название</TableCell>
                        {!config.hideDescription && (
                          <TableCell>
                            {selectedType === DICTIONARY_TYPES.IT_DIRECTIONS ? 'Код' : 'Описание'}
                          </TableCell>
                        )}
                        {selectedType === DICTIONARY_TYPES.SELECTION_STAGES && (
                          <TableCell align="center">Статус</TableCell>
                        )}
                        <TableCell align="right">Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: `${config.color}20`,
                                  color: config.color,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                {config.getInitials(item)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {config.getName(item)}
                              </Typography>
                            </Box>
                          </TableCell>
                          {!config.hideDescription && (
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                {config.getDescription(item) || '—'}
                              </Typography>
                            </TableCell>
                          )}
                          {selectedType === DICTIONARY_TYPES.SELECTION_STAGES && (
                            <TableCell align="center">
                              <Chip
                                label={item.isActive === false ? 'Архив' : 'Активно'}
                                size="small"
                                color={item.isActive === false ? 'default' : 'success'}
                                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                              />
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleOpenDialog(item)} color="primary">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(item)} color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Редактировать запись' : 'Добавить запись'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {config.fields.map((field) => (
              field.type === 'checkbox' ? (
                <Box key={field.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  />
                  <Typography variant="body2">{field.label}</Typography>
                </Box>
              ) : (
                <TextField
                  key={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  multiline={field.multiline}
                  rows={field.multiline ? 3 : 1}
                  inputProps={{ maxLength: field.maxLength }}
                  fullWidth
                />
              )
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Вы уверены, что хотите удалить запись "{itemToDelete ? config.getName(itemToDelete) : ''}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Отмена</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DictionariesPage;
