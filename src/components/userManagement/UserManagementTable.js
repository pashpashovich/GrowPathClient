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
} from '@mui/material';
import {
  MoreVert,
  Block,
  CheckCircle,
  Email,
  Edit,
  Delete,
  Search,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUsersAsync,
  blockUserAsync,
  unblockUserAsync,
  changeUserRoleAsync,
  inviteUserAsync,
  deleteUserAsync,
  setFilters,
  clearError,
} from '../../store/slices/userManagementSlice';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const UserManagementTable = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error, filters, pagination } = useSelector((state) => state.userManagement || {});
  const usersList = users || [];
  const currentUser = useSelector((state) => state.auth?.user);

  const [searchInput, setSearchInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [statusInput, setStatusInput] = useState('');

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;

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
    setRoleInput('');
    setStatusInput('');
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
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

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

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleBlockUser = () => {
    if (selectedUser) dispatch(blockUserAsync(selectedUser.id));
    handleMenuClose();
  };

  const handleUnblockUser = () => {
    if (selectedUser) dispatch(unblockUserAsync(selectedUser.id));
    handleMenuClose();
  };

  const handleChangeRole = () => {
    if (selectedUser) {
      setNewRole(selectedUser.role || '');
      setIsRoleDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSendInvitation = () => {
    if (selectedUser) setIsInviteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = () => {
    if (selectedUser && window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      dispatch(deleteUserAsync(selectedUser.id));
    }
    handleMenuClose();
  };

  const handleRoleUpdate = () => {
    if (selectedUser && newRole) {
      dispatch(changeUserRoleAsync({ id: selectedUser.id, role: newRole }));
    }
    setIsRoleDialogOpen(false);
    setNewRole('');
  };

  const handleInviteSend = () => {
    if (selectedUser) dispatch(inviteUserAsync(selectedUser.id));
    setIsInviteDialogOpen(false);
  };

  const filteredUsers = usersList.filter((user) => user.id !== currentUser?.sub && user.id !== currentUser?.id);

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Панель фильтров */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Введите ФИО"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: 'white', borderRadius: 1 }}>
              <InputLabel>Роль</InputLabel>
              <Select
                value={roleInput}
                label="Роль"
                onChange={(e) => setRoleInput(e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="mentor">Ментор</MenuItem>
                <MenuItem value="intern">Стажер</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: 'white', borderRadius: 1 }}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusInput}
                label="Статус"
                onChange={(e) => setStatusInput(e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="active">Активен</MenuItem>
                <MenuItem value="pending">Ожидает активации</MenuItem>
                <MenuItem value="blocked">Заблокирован</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              size="medium"
              onClick={handleApplyFilters}
              sx={{ borderRadius: 1 }}
            >
              Применить
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <Button
              variant="outlined"
              size="medium"
              onClick={handleResetFilters}
              sx={{ borderRadius: 1, borderColor: 'primary.main', color: 'primary.main' }}
            >
              Сбросить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && !usersList.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Последний вход</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {(user.name || user.email || '?').toString().split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <Typography variant="body2">
                      {user.name || user.email || '—'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(user.status)}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{formatDate(user.lastLogin)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, user)}
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
          sx={{ borderTop: 1, borderColor: 'divider' }}
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
        
        <MenuItem onClick={handleChangeRole}>
          <Edit sx={{ mr: 1 }} />
          Изменить роль
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

      {/* Диалог изменения роли */}
      <Dialog open={isRoleDialogOpen} onClose={() => setIsRoleDialogOpen(false)}>
        <DialogTitle>Изменить роль пользователя</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Новая роль</InputLabel>
            <Select
              value={newRole}
              label="Новая роль"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="mentor">Ментор</MenuItem>
              <MenuItem value="intern">Стажер</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRoleDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleRoleUpdate}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отправки приглашения */}
      <Dialog open={isInviteDialogOpen} onClose={() => setIsInviteDialogOpen(false)}>
        <DialogTitle>Отправить приглашение</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Отправить приглашение пользователю <strong>{selectedUser?.name}</strong> на email <strong>{selectedUser?.email}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Приглашение будет содержать уникальную ссылку для активации аккаунта, действительную в течение 24 часов.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInviteDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleInviteSend}>
            Отправить приглашение
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementTable;
