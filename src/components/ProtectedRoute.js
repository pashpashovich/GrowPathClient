import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'mentor') {
      return <Navigate to="/mentor" replace />;
    } else if (user?.role === 'intern') {
      return <Navigate to="/intern" replace />;
    } else if (user?.role === 'hr') {
      return <Navigate to="/hr" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/mentor" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
