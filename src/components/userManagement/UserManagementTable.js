import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
  TablePagination,
  InputAdornment,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  MoreVert,
  Block,
  CheckCircle,
  Email,
  Edit,
  Delete,
  Search,
  PersonAdd,
  ShowChart,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUsersAsync,
  blockUserAsync,
  unblockUserAsync,
  changeUserRoleAsync,
  inviteUserAsync,
  deleteUserAsync,
  updateUserAsync,
  setFilters,
  clearError,
} from '../../store/slices/userManagementSlice';
import { departmentAPI, userAPI } from '../../services/api';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const UserManagementTable = ({ onAddUser }) => {
  const dispatch = useDispatch();
  const { users, isLoading, error, filters, pagination } = useSelector((state) => state.userManagement || {});
  const usersList = users || [];
  const currentUser = useSelector((state) => state.auth?.user);

  const [searchInput, setSearchInput] = useState('');
  const [roleInput, setRoleInput] = useState('all');
  const [statusInput, setStatusInput] = useState('all');

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const total = pagination?.total ?? 0;

  const loadUsers = useCallback(() => {
    dispatch(fetchUsersAsync({
      page,
      limit,
      ...(filters?.search && { search: filters.search }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.status && { status: filters.status }),
    }));
  }, [dispatch, page, limit, filters?.search, filters?.role, filters?.status]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    dispatch(setFilters({
      search: value.trim(),
      page: 1,
    }));
  };

  const handleRoleFilterChange = (e) => {
    const value = e.target.value;
    setRoleInput(value);
    dispatch(setFilters({
      role: value === 'all' ? '' : value,
      page: 1,
    }));
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusInput(value);
    dispatch(setFilters({
      status: value === 'all' ? '' : value,
      page: 1,
    }));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters({
      search: searchInput.trim(),
      role: roleInput || '',
      status: statusInput || '',
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setRoleInput('all');
    setStatusInput('all');
    dispatch(setFilters({
      search: '',
      role: '',
      status: '',
      page: 1,
    }));
  };

  const handlePageChange = (_, newPage) => {
    dispatch(setFilters({ page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    dispatch(setFilters({ limit: newLimit, page: 1 }));
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteTargetUser, setInviteTargetUser] = useState(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'blocked': return 'Заблокирован';
      case 'pending': return 'Ожидает активации';
      default: return status;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'mentor': return 'Ментор';
      case 'intern': return 'Стажер';
      case 'hr': return 'HR';
      case 'admin': return 'Администратор';
      default: return role;
    }
  };

  const getDisplayName = (user) => {
    if (!user) return '';
    if (user.name?.trim()) return user.name.trim();
    const parts = [user.lastName, user.firstName, user.patronymicName].filter(Boolean);
    return parts.length ? parts.join(' ').trim() : '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Никогда';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusChipSx = (status) => {
    switch (status) {
      case 'active':
        return { bgcolor: '#82f9be', color: '#005235', fontWeight: 700 };
      case 'blocked':
        return { bgcolor: '#ffdad6', color: '#93000a', fontWeight: 700 };
      case 'pending':
        return { bgcolor: '#ffddb3', color: '#624000', fontWeight: 700 };
      default:
        return { fontWeight: 700 };
    }
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleBlockUser = () => {
    if (selectedUser) {
      dispatch(blockUserAsync(selectedUser.id)).then(() => {
        setSuccessMessage('Пользователь заблокирован');
      });
    }
    handleMenuClose();
  };

  const handleUnblockUser = () => {
    if (selectedUser) {
      dispatch(unblockUserAsync(selectedUser.id)).then(() => {
        setSuccessMessage('Пользователь разблокирован');
      });
    }
    handleMenuClose();
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setEditingUser(selectedUser);
      setNewRole(selectedUser.role || '');
      setNewDepartmentId(selectedUser.departmentId || '');
      setIsEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSendInvitation = () => {
    if (selectedUser) {
      setInviteError('');
      setInviteTargetUser(selectedUser);
      setIsInviteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUserToDelete(selectedUser);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUserAsync(userToDelete.id));
      setSuccessMessage('Пользователь удален');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleUserUpdate = async () => {
    if (!editingUser) return;

    try {
      const updateData = {};

      if (newRole) {
        updateData.role = newRole;
      }

      if (newDepartmentId) {
        updateData.departmentId = parseInt(newDepartmentId, 10);
      }

      if (Object.keys(updateData).length > 0) {
        await dispatch(updateUserAsync({ id: editingUser.id, data: updateData }));
        setSuccessMessage('Данные пользователя обновлены');
        await loadUsers();
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }

    setIsEditDialogOpen(false);
    setEditingUser(null);
    setNewRole('');
    setNewDepartmentId('');
  };

  const handleInviteSend = async () => {
    if (!inviteTargetUser) return;
    setIsInviteLoading(true);
    setInviteError('');
    const result = await dispatch(inviteUserAsync(inviteTargetUser.id));
    setIsInviteLoading(false);
    if (inviteUserAsync.fulfilled.match(result)) {
      setIsInviteDialogOpen(false);
      setInviteTargetUser(null);
      setSuccessMessage('Приглашение отправлено');
    } else {
      setInviteError(result.payload || 'Не удалось отправить приглашение');
    }
  };

  const handleInviteDialogClose = () => {
    if (!isInviteLoading) {
      setIsInviteDialogOpen(false);
      setInviteTargetUser(null);
      setInviteError('');
    }
  };

  const filteredUsers = usersList.filter((user) => user.id !== currentUser?.sub && user.id !== currentUser?.id);

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Управление пользователями
        </Typography>
        {typeof onAddUser === 'function' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={onAddUser}
            size="large"
          >
            Добавить пользователя
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        size="medium"
        placeholder="Поиск по имени или email..."
        value={searchInput}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={roleInput}
              label="Роль"
              onChange={handleRoleFilterChange}
            >
              <MenuItem value="all">Все роли</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="mentor">Ментор</MenuItem>
              <MenuItem value="intern">Стажер</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusInput}
              label="Статус"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="active">Активен</MenuItem>
              <MenuItem value="pending">Ожидает активации</MenuItem>
              <MenuItem value="blocked">Заблокирован</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: '56px' }}
          >
            Сбросить фильтры
          </Button>
        </Grid>
      </Grid>

      {isLoading && !usersList.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100', '& th': { typography: 'caption', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' } }}>
              <TableCell sx={{ py: 2, px: 3 }}>Пользователь</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Email</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Роль</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Статус</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Дата создания</TableCell>
              <TableCell sx={{ py: 2, px: 3 }}>Последний вход</TableCell>
              <TableCell align="right" sx={{ py: 2, px: 3 }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ py: 2, px: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40 }} src={user.avatarUrl}>
                      {(getDisplayName(user) || user.email || '?').toString().split(/\s+/).map((n) => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {getDisplayName(user) || user.email || '—'}
                      </Typography>
                      {(user.position || user.jobTitle) && (
                        <Typography variant="caption" color="text.secondary">
                          {user.position || user.jobTitle}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, px: 3 }}>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </TableCell>
                <TableCell sx={{ py: 2, px: 3 }}>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      bgcolor: 'grey.200',
                      color: 'text.primary',
                      borderRadius: 999,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2, px: 3 }}>
                  <Chip
                    label={getStatusLabel(user.status)}
                    size="small"
                    sx={{ borderRadius: 999, fontSize: '0.7rem', ...statusChipSx(user.status) }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2, px: 3 }}>
                  <Typography variant="body2" color="text.secondary">{formatDateShort(user.createdAt)}</Typography>
                </TableCell>
                <TableCell sx={{ py: 2, px: 3 }}>
                  <Typography variant="body2" color="text.secondary">{formatDate(user.lastLogin)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 2, px: 3 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, user)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`}
          sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}
        />
      </TableContainer>
      )}

      {/* Меню действий */}
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
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={handleBlockUser}>
            <Block sx={{ mr: 1 }} />
            Заблокировать
          </MenuItem>
        ) : selectedUser?.status === 'blocked' ? (
          <MenuItem onClick={handleUnblockUser}>
            <CheckCircle sx={{ mr: 1 }} />
            Разблокировать
          </MenuItem>
        ) : null}
        
        <MenuItem onClick={handleEditUser}>
          <Edit sx={{ mr: 1 }} />
          Редактировать
        </MenuItem>
        
        {selectedUser?.status === 'pending' && (
          <MenuItem onClick={handleSendInvitation}>
            <Email sx={{ mr: 1 }} />
            Отправить приглашение
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      {/* Диалог редактирования пользователя */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select
                value={newRole}
                label="Роль"
                onChange={(e) => setNewRole(e.target.value)}
              >
                <MenuItem value="mentor">Ментор</MenuItem>
                <MenuItem value="intern">Стажер</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Департамент</InputLabel>
              <Select
                value={newDepartmentId}
                label="Департамент"
                onChange={(e) => setNewDepartmentId(e.target.value)}
                disabled={loadingDepartments}
              >
                {loadingDepartments ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Загрузка...
                  </MenuItem>
                ) : departments.length === 0 ? (
                  <MenuItem disabled>Нет доступных департаментов</MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleUserUpdate}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Вы уверены, что хотите удалить пользователя "{userToDelete ? getDisplayName(userToDelete) : ''}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Отмена</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отправки приглашения */}
      <Dialog open={isInviteDialogOpen} onClose={handleInviteDialogClose}>
        <DialogTitle>Отправить приглашение</DialogTitle>
        <DialogContent>
          {inviteError && (
            <Alert severity="error" onClose={() => setInviteError('')} sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            Отправить приглашение пользователю <strong>{getDisplayName(inviteTargetUser) || inviteTargetUser?.email}</strong> на email <strong>{inviteTargetUser?.email}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Приглашение будет содержать уникальную ссылку для активации аккаунта, действительную в течение 24 часов.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInviteDialogClose} disabled={isInviteLoading}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleInviteSend} disabled={isInviteLoading}>
            {isInviteLoading ? <CircularProgress size={24} /> : 'Отправить приглашение'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementTable;
