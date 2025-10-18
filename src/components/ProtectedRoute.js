import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуется определенная роль, проверяем её
  if (requiredRole && user?.role !== requiredRole) {
    // Перенаправляем на соответствующую страницу роли
    if (user?.role === 'mentor') {
      return <Navigate to="/mentor" replace />;
    } else if (user?.role === 'intern') {
      return <Navigate to="/intern" replace />;
    } else if (user?.role === 'hr') {
      return <Navigate to="/hr" replace />; // HR перенаправляется на свой дашборд
    } else if (user?.role === 'admin') {
      return <Navigate to="/mentor" replace />; // Админ использует менторский интерфейс
    } else {
      return <Navigate to="/mentor" replace />; // По умолчанию
    }
  }

  return children;
};

export default ProtectedRoute;
