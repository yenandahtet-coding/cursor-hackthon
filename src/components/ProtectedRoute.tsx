import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@/types';
import { getUserRole } from '@/auth';

export default function ProtectedRoute({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const currentRole = getUserRole();
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }
  if (currentRole !== role) {
    return <Navigate to={currentRole === 'customer' ? '/customer' : '/rm'} replace />;
  }
  return <>{children}</>;
}
