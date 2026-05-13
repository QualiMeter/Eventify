import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import type { Event } from '../types';
import { CalendarDays, MapPin, Users, ArrowLeft, CheckCircle } from 'lucide-react';

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (id) {
            loadEvent();
        }
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const data = await eventsApi.getById(id!);
            setEvent(data);
        } catch (err) {
            setError('Не удалось загрузить информацию о мероприятии');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setRegistering(true);
        // TODO: Implement registration API call
        setTimeout(() => {
            setRegistering(false);
            alert('Регистрация на мероприятие успешно выполнена!');
        }, 1000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
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

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Мероприятие не найдено'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        На главную
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 truncate">Детали мероприятия</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {event.image && (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-56 object-cover"
                        />
                    )}

                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                event.format === 'online'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {event.format === 'online' ? 'Онлайн' : 'Офлайн'}
                            </span>
                        </div>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {event.description}
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <CalendarDays className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Дата и время</p>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {formatDate(event.startAt)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        До: {formatDate(event.endAt)}
                                    </p>
                                </div>
                            </div>

                            {event.location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Место проведения</p>
                                        <p className="text-sm text-gray-600">{event.location}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Users className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Участники</p>
                                    <p className="text-sm text-gray-600">
                                        {event.registeredCount} из {event.maxParticipants || '∞'} мест
                                    </p>
                                    {event.maxParticipants && (
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min((event.registeredCount / event.maxParticipants) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-900 mb-1">Организатор</p>
                                <p className="text-sm text-gray-600">{event.organizerName}</p>
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={registering || !!(event.maxParticipants && event.registeredCount >= event.maxParticipants)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {registering ? (
                                    <>Регистрация...</>
                                ) : event.maxParticipants && event.registeredCount >= event.maxParticipants ? (
                                    <>Мест нет</>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        Записаться на мероприятие
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
