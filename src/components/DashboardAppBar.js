import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Avatar } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import Logo from './Logo';
import { profileAPI } from '../services/api';

export const DASHBOARD_APP_BAR_HEIGHT = 64;

const DashboardAppBar = ({ onLogout }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const avatarResponse = await profileAPI.getAvatar();
        const avatarBlob = new Blob([avatarResponse.data], {
          type: avatarResponse.headers['content-type'] || 'image/jpeg'
        });
        const avatarObjectUrl = URL.createObjectURL(avatarBlob);
        setAvatarUrl(avatarObjectUrl);
      } catch (err) {
        setAvatarUrl(null);
      }
    };

    loadAvatar();

    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: DASHBOARD_APP_BAR_HEIGHT,
          px: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main',
            minWidth: 0,
          }}
        >
          <Logo size="small" />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Avatar
          src={avatarUrl}
          sx={{
            width: 36,
            height: 36,
            fontSize: '0.9rem',
            backgroundColor: 'primary.main',
            cursor: 'pointer',
          }}
        >
          {!avatarUrl && (currentUser?.firstName?.charAt(0) || 'U')}
        </Avatar>
        <IconButton
          color="inherit"
          onClick={onLogout}
          aria-label="Выйти"
          sx={{ color: 'text.secondary' }}
        >
          <Logout />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardAppBar;
