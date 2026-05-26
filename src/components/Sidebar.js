import React, { useState, useEffect } from 'react';
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
  AccountCircle,
  MailOutline,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { profileAPI } from '../services/api';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
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

      const menuItems = [
        {
          text: 'Профиль',
          icon: <AccountCircle />,
          path: '/mentor',
          active: location.pathname === '/mentor' || location.pathname === '/mentor/profile',
        },
        {
          text: 'Доска задач',
          icon: <Dashboard />,
          path: '/mentor/tasks',
          active: location.pathname === '/mentor/tasks',
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
        {
          text: 'Рассылки',
          icon: <MailOutline />,
          path: '/mentor/mailings',
          active: location.pathname.startsWith('/mentor/mailings'),
        },
      ];

  const hrMenuItems = [
    {
      text: 'Профиль',
      icon: <AccountCircle />,
      path: '/hr',
      active: location.pathname === '/hr' || location.pathname === '/hr/profile',
    },
    {
      text: 'Программы стажировок',
      icon: <School />,
      path: '/hr/programs',
      active: location.pathname === '/hr/programs',
    },
    {
      text: 'Менторы',
      icon: <Groups />,
      path: '/hr/mentors',
      active: location.pathname.startsWith('/hr/mentors'),
    },
    {
      text: 'Стажёры',
      icon: <Person />,
      path: '/hr/interns',
      active: location.pathname.startsWith('/hr/interns'),
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
      text: 'Рассылки',
      icon: <MailOutline />,
      path: '/hr/mailings',
      active: location.pathname.startsWith('/hr/mailings'),
    },
  ];

      const adminMenuItems = [
        {
          text: 'Профиль',
          icon: <AccountCircle />,
          path: '/admin',
          active: location.pathname === '/admin' || location.pathname === '/admin/profile',
        },
        {
          text: 'Пользователи',
          icon: <Person />,
          path: '/admin/users',
          active: location.pathname === '/admin/users',
        },
        {
          text: 'Управление справочниками',
          icon: <Settings />,
          path: '/admin/settings',
          active: location.pathname === '/admin/settings',
        },
      ];

  const departmentHeadMenuItems = [
    {
      text: 'Профиль',
      icon: <AccountCircle />,
      path: '/department-head',
      active: location.pathname === '/department-head' || location.pathname === '/department-head/profile',
    },
    {
      text: 'Программы стажировок',
      icon: <School />,
      path: '/department-head/programs',
      active: location.pathname === '/department-head/programs',
    },
    {
      text: 'Менторы',
      icon: <Groups />,
      path: '/department-head/mentors',
      active: location.pathname.startsWith('/department-head/mentors'),
    },
    {
      text: 'Стажёры',
      icon: <Person />,
      path: '/department-head/interns',
      active: location.pathname.startsWith('/department-head/interns'),
    },
    {
      text: 'Аналитика и отчеты',
      icon: <BarChart />,
      path: '/department-head/analytics',
      active: location.pathname.startsWith('/department-head/analytics'),
    },
    {
      text: 'Рейтинг стажеров',
      icon: <EmojiEvents />,
      path: '/department-head/rating',
      active: location.pathname.startsWith('/department-head/rating'),
    },
    {
      text: 'Дашборд',
      icon: <Dashboard />,
      path: '/department-head/dashboard',
      active: location.pathname === '/department-head/dashboard',
    },
  ];

  const internMenuItems = [
    {
      text: 'Профиль',
      icon: <AccountCircle />,
      path: '/intern',
      active: location.pathname === '/intern' || location.pathname === '/intern/profile',
    },
    {
      text: 'Мои задания',
      icon: <Assignment />,
      path: '/intern/tasks',
      active: location.pathname === '/intern/tasks',
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
  const isDepartmentHead = currentUser?.role === 'department_head' || location.pathname.includes('/department-head');

  const items = isAdmin ? adminMenuItems : (isHR ? hrMenuItems : (isDepartmentHead ? departmentHeadMenuItems : (isMentor ? menuItems : internMenuItems)));

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
                      : isDepartmentHead
                        ? 'Панель руководителя отдела'
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
              src={avatarUrl}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              {!avatarUrl && (currentUser?.name?.charAt(0) || 'U')}
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
                      isAdmin ? 'Админ' : isHR ? 'HR' : isDepartmentHead ? 'Руководитель' : isMentor ? 'Ментор' : 'Стажер'
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
            src={avatarUrl}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'primary.main',
              fontSize: '1rem',
            }}
          >
            {!avatarUrl && (currentUser?.name?.charAt(0) || 'U')}
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
