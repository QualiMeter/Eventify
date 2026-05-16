import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi, registrationsApi, favoritesApi } from '../services/api';
import type { Event, EventBlock } from '../types';
import { CalendarDays, MapPin, Users, ArrowLeft, CheckCircle, AlertCircle, Edit3, Heart } from 'lucide-react';

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<(Event & { blocks?: EventBlock[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registering, setRegistering] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFav, setTogglingFav] = useState(false);

    // Замени на свой хук авторизации
    const currentUser = { id: 'current-user-id', role: 'user' };
    const canEdit = event && (currentUser.role === 'admin' || currentUser.id === event.organizerId);

    useEffect(() => {
        if (id) {
            loadEvent();
            checkRegistration();
            checkFavorite();
        }
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const data = await eventsApi.getById(id!) as Event & { blocks?: EventBlock[] };
            setEvent(data);
        } catch (err: any) {
            setError(err.data?.detail || 'Не удалось загрузить информацию');
        } finally { setLoading(false); }
    };

    const checkRegistration = async () => {
        try {
            const regs = await registrationsApi.getMyRegistrations();
            setAlreadyRegistered(regs.some(r => r.eventId === id));
        } catch { /* ignore */ }
    };

    const checkFavorite = async () => {
        try {
            const fav = await favoritesApi.check(id!);
            setIsFavorite(fav);
        } catch { /* ignore */ }
    };

    const handleRegister = async () => {
        if (!id) return;
        try {
            setRegistering(true);
            await registrationsApi.registerForEvent(id);
            alert('Заявка успешно отправлена!');
            setAlreadyRegistered(true);
            if (event) setEvent({ ...event, registeredCount: event.registeredCount + 1 });
        } catch (err: any) {
            alert(err.data?.detail || 'Ошибка при записи');
        } finally { setRegistering(false); }
    };

    const toggleFavorite = async () => {
        if (!id || togglingFav) return;
        try {
            setTogglingFav(true);
            const res = await favoritesApi.toggle(id);
            setIsFavorite(res.isFavorite);
        } catch { /* ignore */ } finally { setTogglingFav(false); }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (error || !event) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><div className="text-center"><AlertCircle size={48} className="mx-auto text-red-500 mb-4" /><p className="text-red-600 mb-4">{error || 'Мероприятие не найдено'}</p><button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">На главную</button></div></div>;

    const isFull = event.maxParticipants && event.registeredCount >= event.maxParticipants;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition"><ArrowLeft size={20} /></button>
                        <h1 className="text-xl font-bold text-gray-900 truncate">Детали мероприятия</h1>
                    </div>
                    <button onClick={toggleFavorite} disabled={togglingFav} className={`p-2 rounded-lg transition ${isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'} disabled:opacity-50`}>
                        <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {event.image && <img src={event.image} alt={event.title} className="w-full h-56 object-cover" />}
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${event.format === 'online' ? 'bg-green-100 text-green-800' : event.format === 'hybrid' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                {event.format === 'online' ? 'Онлайн' : event.format === 'hybrid' ? 'Гибрид' : 'Офлайн'}
                            </span>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3"><CalendarDays className="text-blue-600 mt-1" size={20} /><div><p className="text-sm font-medium text-gray-900">Дата и время</p><p className="text-sm text-gray-600 capitalize">{formatDate(event.startAt)}</p><p className="text-xs text-gray-500 mt-1">До: {formatDate(event.endAt)}</p></div></div>
                            {event.location && <div className="flex items-start gap-3"><MapPin className="text-blue-600 mt-1" size={20} /><div><p className="text-sm font-medium text-gray-900">Место проведения</p><p className="text-sm text-gray-600">{event.location}</p></div></div>}
                            <div className="flex items-start gap-3"><Users className="text-blue-600 mt-1" size={20} /><div><p className="text-sm font-medium text-gray-900">Участники</p><p className="text-sm text-gray-600">{event.registeredCount} из {event.maxParticipants || '∞'} мест</p>{event.maxParticipants && <div className="mt-2 w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.min((event.registeredCount / event.maxParticipants) * 100, 100)}%` }} /></div>}</div></div>
                        </div>

                        {event.blocks && event.blocks.length > 0 && (
                            <div className="pt-6 border-t border-gray-200 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">О программе</h3>
                                <div className="space-y-6">
                                    {event.blocks.map(block => (
                                        <div key={block.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {block.type === 'text' && block.content.text && <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{block.content.text}</p>}
                                            {block.type === 'image' && block.content.url && <img src={block.content.url} alt={block.content.alt} className="w-full rounded-lg object-cover max-h-80" />}
                                            {block.type === 'carousel' && (block.content.images?.length ?? 0) > 0 && (
                                                <div className="flex gap-3 overflow-x-auto snap-x pb-2">
                                                    {(block.content.images ?? []).map((img: any, i: number) => <img key={i} src={img.url} alt={img.alt || ''} className="snap-center w-64 flex-shrink-0 h-48 object-cover rounded-lg" />)}
                                                </div>
                                            )}
                                            {block.type === 'poll' && block.content.question && (
                                                <div>
                                                    <p className="font-medium text-gray-900 mb-3">{block.content.question}</p>
                                                    <div className="space-y-3">
                                                        {(block.content.options ?? []).map((opt: any, i: number) => {
                                                            const total = block.content.total_votes || 0;
                                                            const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                                                            return (<div key={i}><div className="flex justify-between text-sm mb-1"><span>{opt.text}</span><span>{pct}%</span></div><div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"><div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} /></div></div>);
                                                        })}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-3">Всего голосов: {block.content.total_votes || 0}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-900 mb-1">Организатор</p>
                            <p className="text-sm text-gray-600 mb-4">{event.organizerName}</p>
                            {alreadyRegistered ? (
                                <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium"><CheckCircle size={20} /> Вы записаны</div>
                            ) : (
                                <button onClick={handleRegister} disabled={registering || !!isFull} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {registering ? 'Обработка...' : isFull ? 'Мест нет' : 'Записаться'}
                                </button>
                            )}
                            {alreadyRegistered && <p className="text-sm text-center text-green-600 mt-3">Отменить запись можно в разделе "Мои записи".</p>}
                        </div>
                    </div>
                </div>
                {canEdit && (
                    <button onClick={() => navigate(`/organizer/events/${event.id}/edit`)} className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"><Edit3 size={18} /> Редактировать мероприятие</button>
                )}
            </main>
        </div>
    );
}