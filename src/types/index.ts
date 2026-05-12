export type UserRole = 'admin' | 'listener' | 'organizer';

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface Event {
	id: string;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	location: string;
	format: 'online' | 'offline';
	organizerId: string;
	organizerName: string;
	selectionMethod: 'free' | 'moderation' | 'invite';
	maxParticipants?: number;
	registeredCount: number;
	image?: string;
}

export interface Application {
	id: string;
	eventId: string;
	eventTitle: string;
	userId: string;
	status: 'pending' | 'approved' | 'rejected';
	submittedAt: string;
}

export interface Notification {
	id: string;
	type: 'event_reminder' | 'application_update' | 'new_organizer_event';
	message: string;
	read: boolean;
	createdAt: string;
}

export interface OrganizerStats {
	totalEvents: number;
	totalAttendees: number;
	newListenersPercentage: number;
	returningListenersPercentage: number;
	avgAttendanceRate: number;
}
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
