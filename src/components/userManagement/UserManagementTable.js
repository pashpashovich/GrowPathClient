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
  setFilters,
  clearError,
} from '../../store/slices/userManagementSlice';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const UserManagementTable = ({ onAddUser }) => {
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
  const [inviteTargetUser, setInviteTargetUser] = useState(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [newRole, setNewRole] = useState('');

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
    if (selectedUser) {
      setInviteError('');
      setInviteTargetUser(selectedUser);
      setIsInviteDialogOpen(true);
    }
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

  const handleInviteSend = async () => {
    if (!inviteTargetUser) return;
    setIsInviteLoading(true);
    setInviteError('');
    const result = await dispatch(inviteUserAsync(inviteTargetUser.id));
    setIsInviteLoading(false);
    if (inviteUserAsync.fulfilled.match(result)) {
      setIsInviteDialogOpen(false);
      setInviteTargetUser(null);
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
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'flex-end' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: 0.5 }}>
            Управление пользователями
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
            Отслеживайте, фильтруйте и управляйте участниками организации из одного окна.
          </Typography>
        </Box>
        {typeof onAddUser === 'function' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={onAddUser}
            sx={{ fontWeight: 700, py: 1.25, px: 3, borderRadius: 2, flexShrink: 0 }}
          >
            Добавить пользователя
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Поиск по имени или email..."
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
        sx={{ mb: 2, maxWidth: { md: 420 } }}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
              РОЛЬ
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={roleInput}
                displayEmpty
                onChange={(e) => setRoleInput(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Все роли</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="mentor">Ментор</MenuItem>
                <MenuItem value="intern">Стажер</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
              СТАТУС АККАУНТА
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={statusInput}
                displayEmpty
                onChange={(e) => setStatusInput(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Все статусы</MenuItem>
                <MenuItem value="active">Активен</MenuItem>
                <MenuItem value="pending">Ожидает активации</MenuItem>
                <MenuItem value="blocked">Заблокирован</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                ВСЕГО ПОЛЬЗОВАТЕЛЕЙ
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.5rem', color: 'primary.main' }}>
                {total.toLocaleString('ru-RU')}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(178, 197, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <ShowChart />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
        <Button variant="outlined" onClick={handleResetFilters} sx={{ fontWeight: 600, borderRadius: 2 }}>
          Сбросить
        </Button>
        <Button variant="contained" color="primary" onClick={handleApplyFilters} sx={{ fontWeight: 700, borderRadius: 2 }}>
          Применить
        </Button>
      </Box>

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
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
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
    </Box>
  );
};

export default UserManagementTable;
