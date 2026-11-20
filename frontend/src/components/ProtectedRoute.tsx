import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface Props {
  children: ReactNode;
  roles?: Role[];
}

// Защита маршрутов: требует авторизации и (опционально) одну из ролей
export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (roles && user && !roles.includes(user.role)) {
    // Нет доступа — возвращаем на «свой» домашний маршрут
    const home =
      user.role === 'MANAGER' ? '/admin' : user.role === 'VEHICLE_OWNER' ? '/owner' : '/';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
