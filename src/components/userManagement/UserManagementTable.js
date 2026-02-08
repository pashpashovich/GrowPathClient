import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert,
  Block,
  CheckCircle,
  Email,
  Edit,
  Delete,
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

const UserManagementTable = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error, filters } = useSelector((state) => state.userManagement || {});
  const usersList = users || [];
  const currentUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    dispatch(fetchUsersAsync({
      page: 1,
      limit: 100,
      ...(filters?.role && { role: filters.role }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
    }));
  }, [dispatch, filters?.role, filters?.status, filters?.search]);

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
