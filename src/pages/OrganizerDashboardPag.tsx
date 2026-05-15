import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Plus, Users, Eye, Edit2, Trash2, LogOut } from 'lucide-react';
import { eventsApi } from '../services/api';
import type { Event } from '../types';
import BottomNav from '../components/BottomNav';

export default function OrganizerDashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'organizer') {
            navigate('/');
            return;
        }
        loadMyEvents();
    }, [user]);

    const loadMyEvents = async () => {
        try {
            setIsLoading(true);
            const allEvents = await eventsApi.getAll('published', 1, 100);
            const organizerEvents = allEvents.filter(e => e.organizerId === user?.id);
            setMyEvents(organizerEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = () => {
        navigate('/organizer/create-event');
    };

    const handleEditEvent = (eventId: string) => {
        alert(`Редактирование мероприятия ${eventId}`);
    };

    const handleDeleteEvent = (eventId: string) => {
        if (confirm('Вы уверены, что хотите удалить это мероприятие?')) {
            setMyEvents(prev => prev.filter(e => e.id !== eventId));
        }
    };

    const handleViewEvent = (eventId: string) => {
        navigate(`/events/${eventId}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'draft': return 'Черновик';
            case 'published': return 'Опубликовано';
            case 'completed': return 'Завершено';
            case 'cancelled': return 'Отменено';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'published': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ... existing code ...

    const totalParticipants = myEvents.reduce((sum, e) => sum + e.registeredCount, 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Кабинет организатора</h1>
                            <p className="text-indigo-100 text-sm mt-0.5">
                                {user?.name} {user?.surname}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-indigo-500 transition"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-4 py-6 max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Всего мероприятий</p>
                                <p className="text-xl font-bold text-gray-900">{myEvents.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Users size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Участников</p>
                                <p className="text-xl font-bold text-gray-900">{totalParticipants}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Мои мероприятия</h2>
                        <button
                            onClick={handleCreateEvent}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                        >
                            <Plus size={18} />
                            Создать
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="text-gray-500 mt-3 text-sm">Загрузка...</p>
                        </div>
                    ) : myEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Пока нет мероприятий</h3>
                            <p className="text-gray-500 text-sm mb-4">Создайте первое мероприятие!</p>
                            <button
                                onClick={handleCreateEvent}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                            >
                                Создать мероприятие
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                                    {event.title}
                                                </h3>
                                                <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                                    {getStatusText(event.status)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    <span>{formatDate(event.startAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    <span>{event.registeredCount}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleViewEvent(event.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                                        >
                                            <Eye size={16} />
                                            Просмотр
                                        </button>
                                        <button
                                            onClick={() => handleEditEvent(event.id)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}

