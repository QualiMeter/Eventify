import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import type { Event } from '../types';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function HomePage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await eventsApi.getAll('published', 1, 50);
            setEvents(response.items);
        } catch (err) {
            setError('Не удалось загрузить события');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Мероприятия</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Нет доступных мероприятий</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => navigate(`/events/${event.id}`)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden active:scale-95 transition-transform"
                            >
                                {event.image && (
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}

                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                            {event.title}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            event.format === 'online'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {event.format === 'online' ? 'Онлайн' : 'Офлайн'}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {event.description}
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={16} />
                                            <span>{formatDate(event.startAt)}</span>
                                        </div>

                                        {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        )}

                                        {event.maxParticipants && (
                                            <div className="flex items-center gap-2">
                                                <Users size={16} />
                                                <span>
                                                    {event.registeredCount}/{event.maxParticipants} участников
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
