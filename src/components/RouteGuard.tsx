import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RouteGuardProps {
	children: ReactNode;
	allowedRoles?: UserRole[];
	fallbackPath?: string;
}

export const RouteGuard = ({ children, allowedRoles, fallbackPath = '/' }: RouteGuardProps) => {
	const { isAuthenticated, user } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles && user && !allowedRoles.includes(user.role)) {
		return <Navigate to={fallbackPath} replace />;
	}

	return <>{children}</>;
};