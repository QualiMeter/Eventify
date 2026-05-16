import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, CheckCircle, AlertTriangle, Info, ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { notificationsApi } from '../services/api';
import type { Notification as AppNotification } from '../types';

export default function NotificationsPage() {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<AppNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [markingAll, setMarkingAll] = useState(false);

	useEffect(() => { loadNotifications(); }, []);

	const loadNotifications = async () => {
		try {
			setLoading(true);
			const data = await notificationsApi.getAll();
			setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
		} catch { setError('Не удалось загрузить уведомления'); }
		finally { setLoading(false); }
	};

	const markAsRead = async (id: string) => {
		try {
			await notificationsApi.markAsRead(id);
			setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
		} catch { /* ignore */ }
	};

	const markAllAsRead = async () => {
		try {
			setMarkingAll(true);
			await notificationsApi.markAllAsRead();
			setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
		} catch { /* ignore */ }
		finally { setMarkingAll(false); }
	};

	const getIcon = (type: AppNotification['type']) => {
		switch (type) {
			case 'event_reminder': return <Calendar size={20} className="text-blue-600" />;
			case 'application_status': return <CheckCircle size={20} className="text-green-600" />;
			case 'new_event_from_favorite': return <Bell size={20} className="text-purple-600" />;
			case 'system': return <Info size={20} className="text-gray-600" />;
			default: return <AlertTriangle size={20} className="text-orange-600" />;
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		if (hours < 1) return 'Только что';
		if (hours < 24) return `${hours} ч. назад`;
		if (days < 7) return `${days} дн. назад`;
		return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
	};

	const unreadCount = notifications.filter(n => !n.isRead).length;

	if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={32} className="animate-spin text-indigo-600" /></div>;

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="bg-white shadow-sm sticky top-0 z-10">
				<div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition"><ArrowLeft size={20} /></button>
						<h1 className="text-xl font-bold text-gray-900">Уведомления</h1>
					</div>
					{unreadCount > 0 && (
						<button onClick={markAllAsRead} disabled={markingAll} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50">
							{markingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
							Прочитать все
						</button>
					)}
				</div>
			</header>

			<main className="max-w-2xl mx-auto px-4 py-4">
				{error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
				{notifications.length === 0 ? (
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
						<Bell size={48} className="mx-auto text-gray-300 mb-3" />
						<p className="text-gray-500 font-medium">Уведомлений пока нет</p>
						<p className="text-sm text-gray-400 mt-1">Здесь будут появляться важные события</p>
					</div>
				) : (
					<div className="space-y-2">
						{notifications.map(note => (
							<div key={note.id} onClick={() => !note.isRead && markAsRead(note.id)} className={`bg-white rounded-xl border p-4 transition cursor-pointer relative ${note.isRead ? 'border-gray-200' : 'border-l-4 border-l-indigo-500 border-gray-200'}`}>
								{!note.isRead && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
								<div className="flex gap-3 pr-5">
									<div className={`p-2 rounded-lg h-fit ${note.isRead ? 'bg-gray-100' : 'bg-indigo-50'}`}>{getIcon(note.type)}</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm text-gray-900">{note.title}</p>
										<p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">{note.message}</p>
										<p className="text-xs text-gray-400 mt-2">{formatDate(note.createdAt)}</p>
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