import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { School, Person, Dashboard } from '@mui/icons-material';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          GrowPath
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<Dashboard />}
            sx={{
              backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Дизайн-система
          </Button>
          
          <Button
            color="inherit"
            component={Link}
            to="/mentor"
            startIcon={<Person />}
            sx={{
              backgroundColor: isActive('/mentor') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Ментор
          </Button>
          
          <Button
            color="inherit"
            component={Link}
            to="/intern"
            startIcon={<School />}
            sx={{
              backgroundColor: isActive('/intern') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Стажер
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
