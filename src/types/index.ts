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
    role: 'user' | 'organizer' | 'admin';
}

export interface Event {
    id: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    location: string | null;
    format: 'online' | 'offline' | 'hybrid';
    organizerId: string;
    organizerName: string;
    selectionMethod: 'free' | 'moderation' | 'competition';
    maxParticipants: number | null;
    registeredCount: number;
    image: string | null;
    status: string;
    blocks?: EventBlock[];
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
    format: 'online' | 'offline' | 'hybrid';
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

export interface Registration {
    id: string;
    eventId: string;
    event: Event;
    status: string;
    registeredAt: string;
    userId: string;
}

export type BlockType = 'text' | 'image' | 'carousel' | 'poll';

export interface EventBlock {
    id: string;
    type: BlockType;
    content: {
        text?: string;
        url?: string;
        alt?: string;
        images?: Array<{ url: string; alt: string }>;
        question?: string;
        options?: Array<{ text: string; votes: number }>;
        total_votes?: number;
    };
    sort_order: number;
}

export interface CreateEventBlockDto {
    type: BlockType;
    content: Record<string, any>;
    sort_order: number;
}

export interface UpdateEventBlocksDto {
    blocks: CreateEventBlockDto[];
}

export interface EventWithBlocks extends Event {
    blocks?: EventBlock[];
}