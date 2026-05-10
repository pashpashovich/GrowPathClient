import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasAccess = () => {
    if (allowedRoles && Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    if (requiredRole) {
      return user.role === requiredRole;
    }
    return true;
  };

  if (!hasAccess()) {
    if (user?.role === 'mentor') {
      return <Navigate to="/mentor" replace />;
    } else if (user?.role === 'intern') {
      return <Navigate to="/intern" replace />;
    } else if (user?.role === 'hr') {
      return <Navigate to="/hr" replace />;
    } else if (user?.role === 'department_head') {
      return <Navigate to="/department-head" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
