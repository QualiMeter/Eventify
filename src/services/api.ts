import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { LoginPayload, AuthResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
} as AxiosRequestConfig);

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('jwt_token');
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('jwt_token');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
	const { data } = await api.post<AuthResponse>('/auth/login', payload);
	return data;
};