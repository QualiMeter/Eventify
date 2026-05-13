import type {
    LoginRequest,
    RegistrationRequest,
    UpdateProfileRequest,
    CreateEventDto,
    User,
    Event,
    EventImage,
    ProblemDetails,
    LoginResponse
} from '../types';

const API_BASE_URL = /*import.meta.env.VITE_API_URL ||*/ 'https://eventifybackend-events.up.railway.app';

class ApiError extends Error {
    public status: number;
    public data?: ProblemDetails;

    constructor(status: number, data?: ProblemDetails) {
        super(data?.detail || 'API Error');
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {};

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    headers['Content-Type'] = 'application/json';

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(response.status, errorData);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, { detail: 'Network error' });
    }
}

export const authApi = {
    login: (data: LoginRequest) =>
        fetchApi<LoginResponse>('/api/Auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    register: (data: RegistrationRequest) =>
        fetchApi<User>('/api/Auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMe: () =>
        fetchApi<User>('/api/Auth/me'),

    updateProfile: (data: UpdateProfileRequest) =>
        fetchApi<User>('/api/Auth/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

export const eventsApi = {
    getAll: (status: string = 'published', page: number = 1, size: number = 20) =>
        fetchApi<Array<Event>>(
            `/api/Events?status=${status}&page=${page}&size=${size}`
        ),

    getById: (id: string) =>
        fetchApi<Event>(`/api/Events/${id}`),

    create: (data: CreateEventDto) =>
        fetchApi<Event>('/api/Events', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

export const eventImagesApi = {
    upload: (eventId: string, file: File, isPrimary: boolean = false, altText?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrimary', String(isPrimary));
        if (altText) {
            formData.append('altText', altText);
        }

        const token = localStorage.getItem('token');
        return fetch(`${API_BASE_URL}/api/events/${eventId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        }).then(res => {
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
        });
    },

    getAll: (eventId: string) =>
        fetchApi<EventImage[]>(`/api/events/${eventId}/images`),

    delete: (eventId: string, mediaId: string) =>
        fetchApi(`/api/events/${eventId}/images/${mediaId}`, {
            method: 'DELETE',
        }),

    setPrimary: (eventId: string, mediaId: string) =>
        fetchApi(`/api/events/${eventId}/images/${mediaId}/primary`, {
            method: 'POST',
        }),
};

export { ApiError };
