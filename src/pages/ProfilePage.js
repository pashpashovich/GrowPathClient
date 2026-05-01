import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  CalendarToday,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Delete,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserAsync } from '../store/slices/authSlice';
import { profileAPI } from '../services/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const error = useSelector((state) => state.auth.error);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymicName: '',
    email: '',
  });

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await profileAPI.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        patronymicName: response.data.patronymicName || '',
        email: response.data.email || '',
      });

      if (response.data.avatarUrl) {
        try {
          const avatarResponse = await profileAPI.getAvatar();
          const avatarBlob = new Blob([avatarResponse.data], { type: avatarResponse.headers['content-type'] || 'image/jpeg' });
          const avatarObjectUrl = URL.createObjectURL(avatarBlob);
          setAvatarUrl(avatarObjectUrl);
        } catch (err) {
          console.error('Failed to load avatar:', err);
        }
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
    if (!currentUser) {
      dispatch(getCurrentUserAsync());
    }

    // Cleanup avatar URL on unmount
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [dispatch, currentUser]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Валидация
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      setAvatarError('Размер файла не должен превышать 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Поддерживаются только форматы: JPEG, PNG, GIF, WebP');
      return;
    }

    setAvatarError(null);
    setIsUploadingAvatar(true);

    try {
      const presignResponse = await profileAPI.presignAvatarUpload();
      const { uploadUrl } = presignResponse.data;

      try {
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
      } catch (uploadError) {
        console.log('MinIO upload response (may be false error):', uploadError);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      await loadProfile();
    } catch (err) {
      console.error('Failed to get presigned URL:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setIsUploadingAvatar(true);
      setAvatarError(null);
      await profileAPI.deleteAvatar();

      // Revoke old avatar URL
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
      setAvatarUrl(null);

      await loadProfile();
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      setAvatarError('Не удалось удалить аватар');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'hr':
        return 'HR-специалист';
      case 'mentor':
        return 'Ментор';
      case 'intern':
        return 'Стажер';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'hr':
        return 'primary';
      case 'mentor':
        return 'success';
      case 'intern':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'blocked':
        return 'Заблокирован';
      case 'pending':
        return 'Ожидает подтверждения';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'blocked':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        patronymicName: currentUser.patronymicName || '',
        email: currentUser.email || '',
      });
    }
  };

  const handleSave = () => {
    // TODO: Implement update user profile API call
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (isLoading && !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const displayProfile = profile || currentUser;

  if (!displayProfile) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Не удалось загрузить данные профиля
      </Alert>
    );
  }

  const fullName = [displayProfile.lastName, displayProfile.firstName, displayProfile.patronymicName]
    .filter(Boolean)
    .join(' ');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" component="h1">
          Профиль
        </Typography>
        {!isEditing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Редактировать
          </Button>
        )}
      </Box>

      {avatarError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAvatarError(null)}>
          {avatarError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    backgroundColor: 'primary.main',
                  }}
                >
                  {!avatarUrl && (displayProfile.firstName?.charAt(0) || 'U')}
                </Avatar>

                {isUploadingAvatar && (
                  <CircularProgress
                    size={120}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                )}

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  <Tooltip title="Загрузить фото">
                    <IconButton
                      component="label"
                      size="small"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'primary.dark' },
                      }}
                      disabled={isUploadingAvatar}
                    >
                      <PhotoCamera fontSize="small" />
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                      />
                    </IconButton>
                  </Tooltip>

                  {avatarUrl && (
                    <Tooltip title="Удалить фото">
                      <IconButton
                        size="small"
                        onClick={handleAvatarDelete}
                        sx={{
                          backgroundColor: 'error.main',
                          color: 'white',
                          '&:hover': { backgroundColor: 'error.dark' },
                        }}
                        disabled={isUploadingAvatar}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Typography variant="h5" gutterBottom fontWeight="bold">
                {fullName || 'Пользователь'}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {displayProfile.email}
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                <Chip
                  label={getRoleLabel(displayProfile.role)}
                  color={getRoleColor(displayProfile.role)}
                  size="small"
                />
                <Chip
                  label={getStatusLabel(displayProfile.status)}
                  color={getStatusColor(displayProfile.status)}
                  size="small"
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Дата регистрации
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(displayProfile.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {displayProfile.lastLogin && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Последний вход
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(displayProfile.lastLogin)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Личные данные
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {isEditing ? (
                <Stack spacing={3}>
                  <TextField
                    label="Фамилия"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Имя"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Отчество"
                    value={formData.patronymicName}
                    onChange={handleChange('patronymicName')}
                    fullWidth
                  />

                  <TextField
                    label="Email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    fullWidth
                    required
                    type="email"
                    disabled
                    helperText="Email нельзя изменить"
                  />

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Сохранить
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Фамилия
                        </Typography>
                        <Typography variant="body1">
                          {displayProfile.lastName || 'Не указано'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Имя
                        </Typography>
                        <Typography variant="body1">
                          {displayProfile.firstName || 'Не указано'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Отчество
                        </Typography>
                        <Typography variant="body1">
                          {displayProfile.patronymicName || 'Не указано'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {displayProfile.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID пользователя
                        </Typography>
                        <Typography variant="body1">
                          {displayProfile.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {displayProfile.invitedBy && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Приглашен пользователем
                          </Typography>
                          <Typography variant="body1">
                            ID: {displayProfile.invitedBy}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {displayProfile.invitationSentAt && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Приглашение отправлено
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(displayProfile.invitationSentAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
