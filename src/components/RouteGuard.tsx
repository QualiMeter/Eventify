import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface RouteGuardProps {
    children: ReactNode;
    requireAuth?: boolean;
    allowedRoles?: string[];
    redirectTo?: string;
}

export const RouteGuard = ({
                               children,
                               requireAuth = false,
                               allowedRoles,
                               redirectTo
                           }: RouteGuardProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
    }

    if (requireAuth && !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to={redirectTo || "/"} replace />;
    }

    return <>{children}</>;
};
