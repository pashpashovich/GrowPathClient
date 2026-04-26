import React from 'react';
import { AppBar, Toolbar, IconButton, Box } from '@mui/material';
import { Logout } from '@mui/icons-material';
import Logo from './Logo';

export const DASHBOARD_APP_BAR_HEIGHT = 64;

const DashboardAppBar = ({ onLogout }) => {
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
