export interface User {
    id: string;
    email: string;
    surname: string;
    name: string;
    patronym?: string | null;
    birthDate?: string | null;
    timezone?: string | null;
    tgUsername?: string | null;
    notifications?: boolean | null;
    role: 'User' | 'Organizer' | 'Admin';
}

export interface Event {
    id: string;
    title: string;
    description?: string | null;
    startAt: string;
    endAt: string;
    location?: string | null;
    format: 'online' | 'offline';
    maxParticipants?: number | null;
    selectionMethod?: 'free' | 'moderation' | 'competition';
    organizerId: string;
    organizerName: string;
    status: 'draft' | 'published' | 'completed' | 'cancelled';
    registeredCount: number;
    image?: string;
    images?: EventImage[];
}

export interface EventImage {
    id: string;
    eventId: string;
    url: string;
    isPrimary: boolean;
    altText?: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
    deviceInfo?: string | null;
}

export interface RegistrationRequest {
    surname: string;
    name: string;
    patronym?: string | null;
    birthDate?: string | null;
    email: string;
    password: string;
    timezone?: string | null;
    deviceInfo?: string | null;
}

export interface UpdateProfileRequest {
    surname: string;
    name: string;
    patronym?: string | null;
    birthDate?: string | null;
    email: string;
    password?: string | null;
    notifications?: boolean | null;
    tgUsername?: string | null;
    timezone?: string | null;
}

export interface CreateEventDto {
    title: string;
    description?: string | null;
    startAt: string;
    endAt: string;
    location?: string | null;
    format: 'online' | 'offline';
    maxParticipants?: number | null;
    selectionMethod?: 'free' | 'moderation' | 'competition';
}

export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null;
    detail?: string | null;
    instance?: string | null;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    size: number;
}

export interface LoginResponse {
    token: string;
}
