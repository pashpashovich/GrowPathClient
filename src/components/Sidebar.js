import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  CheckCircle,
  BarChart,
  Person,
  School,
  Settings,
  ChevronLeft,
  ChevronRight,
  Timeline,
  EmojiEvents,
  Groups,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

      const menuItems = [
        {
          text: 'Доска задач',
          icon: <Dashboard />,
          path: '/mentor',
          active: location.pathname === '/mentor' || location.pathname === '/',
        },
        {
          text: 'Дорожная карта',
          icon: <Timeline />,
          path: '/mentor/roadmap',
          active: location.pathname === '/mentor/roadmap',
        },
        {
          text: 'Проверка заданий',
          icon: <CheckCircle />,
          path: '/mentor/review',
          active: location.pathname === '/mentor/review',
        },
        {
          text: 'Статистика',
          icon: <BarChart />,
          path: '/mentor/stats',
          active: location.pathname === '/mentor/stats',
        },
      ];

  const hrBase = location.pathname.replace(/\/$/, '') || '/';

  const hrMenuItems = [
    {
      text: 'Программы стажировок',
      icon: <School />,
      path: '/hr',
      active: hrBase === '/hr',
    },
    {
      text: 'Аналитика и отчеты',
      icon: <BarChart />,
      path: '/hr/analytics',
      active: location.pathname.startsWith('/hr/analytics'),
    },
    {
      text: 'Рейтинг стажеров',
      icon: <EmojiEvents />,
      path: '/hr/rating',
      active: location.pathname.startsWith('/hr/rating'),
    },
    {
      text: 'Менторы',
      icon: <Groups />,
      path: '/hr/mentors',
      active: location.pathname.startsWith('/hr/mentors'),
    },
  ];

      const adminMenuItems = [
        {
          text: 'Пользователи',
          icon: <Person />,
          path: '/admin',
          active: location.pathname === '/admin',
        },
        {
          text: 'Настройки системы',
          icon: <Settings />,
          path: '/admin/settings',
          active: location.pathname === '/admin/settings',
        },
      ];

  const internMenuItems = [
    {
      text: 'Мои задания',
      icon: <Assignment />,
      path: '/intern',
      active: location.pathname === '/intern',
    },
    {
      text: 'Дорожная карта',
      icon: <Timeline />,
      path: '/intern/roadmap',
      active: location.pathname === '/intern/roadmap',
    },
    {
      text: 'Мой рейтинг',
      icon: <EmojiEvents />,
      path: '/intern/rating',
      active: location.pathname === '/intern/rating',
    },
    {
      text: 'Статистика',
      icon: <BarChart />,
      path: '/intern/stats',
      active: location.pathname === '/intern/stats',
    },
  ];

  const isMentor = currentUser?.role === 'mentor' || location.pathname.includes('/mentor');
  const isHR = currentUser?.role === 'hr' || location.pathname.includes('/hr');
  const isAdmin = currentUser?.role === 'admin' || location.pathname.includes('/admin');
  
  const items = isAdmin ? adminMenuItems : (isHR ? hrMenuItems : (isMentor ? menuItems : internMenuItems));

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const drawerWidth = isCollapsed ? 80 : 280;
  const isExpanded = isCollapsed && isHovered;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isExpanded ? 280 : drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        zIndex: 1,
        '& .MuiDrawer-paper': {
          width: isExpanded ? 280 : drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.default',
          color: 'text.primary',
          borderRight: 1,
          borderColor: 'divider',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          zIndex: 1,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Логотип и заголовок */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {(!isCollapsed || isExpanded) && (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              GrowPath
            </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isAdmin
                    ? 'Панель администратора'
                    : isHR
                      ? 'Панель HR'
                      : isMentor
                        ? 'Панель ментора'
                        : 'Панель стажера'}
                </Typography>
          </Box>
        )}
        <Tooltip title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'} placement="right">
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Информация о пользователе */}
      {(!isCollapsed || isExpanded) && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {currentUser?.name || 'Пользователь'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentUser?.email || 'user@example.com'}
              </Typography>
                  <Chip
                    label={
                      isAdmin ? 'Админ' : isHR ? 'HR' : isMentor ? 'Ментор' : 'Стажер'
                    }
                    size="small"
                    color="primary"
                    sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                  />
            </Box>
          </Box>
        </Box>
      )}

      {isCollapsed && !isExpanded && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'primary.main',
              fontSize: '1rem',
            }}
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </Avatar>
        </Box>
      )}

      <Divider />

      {/* Меню навигации */}
      <List sx={{ flexGrow: 1, pt: 1, pb: 2 }}>
        {items.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
            {isCollapsed && !isExpanded ? (
              <Tooltip title={item.text} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: item.active ? 'primary.main' : 'transparent',
                    '&:hover': {
                      backgroundColor: item.active ? 'primary.dark' : 'action.hover',
                    },
                    transition: 'all 0.2s ease-in-out',
                    justifyContent: 'center',
                    minHeight: 48,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.active ? 'white' : 'text.secondary',
                      minWidth: 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            ) : (
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: item.active ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: item.active ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.active ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: item.active ? 600 : 400,
                      color: item.active ? 'white' : 'text.primary',
                    },
                  }}
                />
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
