import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, RefreshCw } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { eventsApi, registrationsApi } from '../services/api';
import type { Event } from '../types';

interface Registration {
    id: string;
    eventId: string;
    event: Event;
    status: string;
    appliedAt?: string;
    reviewedAt?: string;
    attendedAt?: string;
}

export default function MyRegistrationsPage() {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        try {
            setIsLoading(true);
            setError('');
            const data = await registrationsApi.getMyRegistrations();
            for (const reg of data) {
                const e = await eventsApi.getById(reg.eventId);
                reg.event = e;
            }
            setRegistrations(data);
        } catch (err: any) {
            console.error('Failed to load registrations:', err);
            setError(err.data?.detail || 'Ошибка загрузки записей');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRegistration = async (registrationId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm('Вы уверены, что хотите отменить запись?')) {
            return;
        }

        try {
            await registrationsApi.cancelRegistration(registrationId);
            setRegistrations(prev => prev.filter(r => r.id !== registrationId));
        } catch (err: any) {
            alert(err.data?.detail || 'Ошибка отмены записи');
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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Подтверждено';
            case 'pending': return 'На рассмотрении';
            case 'cancelled': return 'Отменено';
            default: return status;
        }
    };

    const getFormatText = (format: string) => {
        switch (format) {
            case 'online': return 'Онлайн';
            case 'offline': return 'Офлайн';
            case 'hybrid': return 'Гибрид';
            default: return format;
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFormatColor = (format: string) => {
        switch (format) {
            case 'online': return 'bg-green-100 text-green-800';
            case 'offline': return 'bg-blue-100 text-blue-800';
            case 'hybrid': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Мои записи</h1>
                    </div>
                    <button
                        onClick={loadRegistrations}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Загрузка записей...</p>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Пока нет записей</h3>
                        <p className="text-gray-500 mb-4">Запишитесь на первое мероприятие!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                        >
                            Найти событие
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {registrations.map((reg) => (
                            <div
                                key={reg.id}
                                onClick={() => navigate(`/events/${reg.eventId}`)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="flex">
                                    {/* {reg.event.image && (
                                            <img
                                                src={reg.event.image}
                                                alt={reg.event.title}
                                                className="w-24 h-24 object-cover flex-shrink-0"
                                            />
                                        )} */}
                                    <div className="flex-1 p-3 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                                                {reg.event.title}
                                            </h3>
                                            <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(reg.status)}`}>
                                                {getStatusText(reg.status)}
                                            </span>
                                            <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${getFormatColor(reg.event.format)}`}>
                                                {getFormatText(reg.event.format)}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                <span>{formatDate(reg.event.startAt)}</span>
                                            </div>

                                            {reg.event.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    <span className="truncate">{reg.event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            <button
                                                onClick={(e) => handleCancelRegistration(reg.id, e)}
                                                className="text-red-600 text-xs font-medium hover:text-red-700 transition"
                                            >
                                                Отменить запись
                                            </button>
                                        </div>
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
