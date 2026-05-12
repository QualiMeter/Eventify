import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { LoginPayload, AuthResponse, Event } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5155/api';

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
export interface EventFilters {
	search?: string;
	format?: 'online' | 'offline';
	page?: number;
	limit?: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const eventsApi = {
	getAll: async (filters?: EventFilters): Promise<PaginatedResponse<Event>> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append('search', filters.search);
		if (filters?.format) params.append('format', filters.format);
		if (filters?.page) params.append('page', filters.page.toString());
		if (filters?.limit) params.append('limit', filters.limit.toString());

		const queryString = params.toString();
		const url = `/events${queryString ? `?${queryString}` : ''}`;

		const { data } = await api.get<PaginatedResponse<Event>>(url);
		return data;
	},

	getById: async (id: string): Promise<Event> => {
		const { data } = await api.get<Event>(`/events/${id}`);
		return data;
	},
};
