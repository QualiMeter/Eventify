import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginPayload, AuthResponse } from '../types';
import { loginApi } from '../services/api';

interface AuthContextType {
	user: User | null;
	token: string | null;
	loading: boolean;
	login: (payload: LoginPayload) => Promise<void>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem('jwt_token');
		const storedUser = localStorage.getItem('user');
		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}
		setLoading(false);
	}, []);

	const login = useCallback(async (payload: LoginPayload) => {
		const response: AuthResponse = await loginApi(payload);
		localStorage.setItem('jwt_token', response.token);
		localStorage.setItem('user', JSON.stringify(response.user));
		setToken(response.token);
		setUser(response.user);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem('jwt_token');
		localStorage.removeItem('user');
		setToken(null);
		setUser(null);
		window.location.href = '/login';
	}, []);

	return (
		<AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within AuthProvider');
	return context;
};