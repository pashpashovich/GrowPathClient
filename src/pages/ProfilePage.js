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
  Snackbar,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  CalendarToday,
  Save,
  PhotoCamera,
  Delete,
  Phone,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserAsync } from '../store/slices/authSlice';
import { profileAPI } from '../services/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const error = useSelector((state) => state.auth.error);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymicName: '',
    phoneNumber: '',
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
        phoneNumber: response.data.phoneNumber || '',
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

    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [dispatch, currentUser]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
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
      setSuccessMessage('Аватар успешно обновлен');
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

      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
      setAvatarUrl(null);

      await loadProfile();
      setSuccessMessage('Аватар успешно удален');
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

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Фильтруем пустые поля
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      if (formData.patronymicName) {
        dataToSend.patronymicName = formData.patronymicName;
      }

      if (formData.phoneNumber) {
        dataToSend.phoneNumber = formData.phoneNumber;
      }

      await profileAPI.updateProfile(dataToSend);
      await loadProfile();
      setSuccessMessage('Профиль успешно обновлен');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setAvatarError('Не удалось обновить профиль');
    } finally {
      setIsSaving(false);
    }
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Профиль пользователя
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={isSaving}
          size="large"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </Box>

      {avatarError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAvatarError(null)}>
          {avatarError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: 150,
                    height: 150,
                    fontSize: '4rem',
                    backgroundColor: 'primary.main',
                    border: '4px solid',
                    borderColor: 'background.paper',
                    boxShadow: 3,
                  }}
                >
                  {!avatarUrl && (displayProfile.firstName?.charAt(0) || 'U')}
                </Avatar>

                {isUploadingAvatar && (
                  <CircularProgress
                    size={150}
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
                    bottom: 5,
                    right: 5,
                    display: 'flex',
                    gap: 1,
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
                        boxShadow: 2,
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
                          boxShadow: 2,
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

              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {displayProfile.email}
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                <Chip
                  label={getRoleLabel(displayProfile.role)}
                  color={getRoleColor(displayProfile.role)}
                  size="medium"
                />
                <Chip
                  label={getStatusLabel(displayProfile.status)}
                  color={getStatusColor(displayProfile.status)}
                  size="medium"
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2} alignItems="flex-start">
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <CalendarToday sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Дата регистрации
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(displayProfile.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {displayProfile.lastLogin && (
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <CalendarToday sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Последний вход
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(displayProfile.lastLogin)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Badge sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ID пользователя
                    </Typography>
                    <Typography variant="body2">
                      {displayProfile.id}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Личные данные
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Фамилия"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Имя"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Отчество"
                    value={formData.patronymicName}
                    onChange={handleChange('patronymicName')}
                    fullWidth
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Номер телефона"
                    value={formData.phoneNumber}
                    onChange={handleChange('phoneNumber')}
                    fullWidth
                    placeholder="+375 (29) 999-99-99"
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    value={displayProfile.email}
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              {displayProfile.invitedBy && (
                <>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    Дополнительная информация
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Приглашен пользователем
                        </Typography>
                        <Typography variant="body1">
                          ID: {displayProfile.invitedBy}
                        </Typography>
                      </Box>
                    </Grid>
                    {displayProfile.invitationSentAt && (
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Приглашение отправлено
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(displayProfile.invitationSentAt)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default ProfilePage;
