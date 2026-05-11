import { useState } from 'react';
import type { Application, Notification, OrganizerStats } from '../types';
import { useSignalR } from '../hooks/useSignalR';

const mockStats: OrganizerStats = { totalEvents: 12, totalAttendees: 340, newListenersPercentage: 65, returningListenersPercentage: 35, avgAttendanceRate: 82 };
const mockApplications: Application[] = [
	{ id: '1', eventId: 'e1', eventTitle: 'React Advanced Patterns', userId: 'u1', status: 'pending', submittedAt: '2026-05-10T10:00:00Z' },
	{ id: '2', eventId: 'e2', eventTitle: 'AI в продакшене', userId: 'u2', status: 'approved', submittedAt: '2026-05-11T14:30:00Z' },
];

export const OrganizerDashboard = () => {
	const [stats, setStats] = useState<OrganizerStats>(mockStats);
	const [applications, setApplications] = useState<Application[]>(mockApplications);
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useSignalR({
		ReceiveNotification: (n: unknown) => setNotifications((prev) => [n as Notification, ...prev]),
		ApplicationStatusUpdated: (updated: unknown) => {
			const app = updated as Application;
			setApplications((prev) => prev.map((a) => (a.id === app.id ? app : a)));
		},
		StatsRefreshed: (s: unknown) => setStats(s as OrganizerStats),
	});

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			<h1 className="text-2xl md:text-3xl font-bold">Панель организатора</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{['Всего слушателей', 'Новые слушатели', 'Повторные', 'Посещаемость'].map((label, i) => (
					<div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:scale-[1.01] transition">
						<p className="text-gray-500 text-sm">{label}</p>
						<p className={`text-2xl font-bold mt-1 ${i === 1 ? 'text-green-600' : 'text-gray-900'}`}>
							{[stats.totalAttendees, `${stats.newListenersPercentage}%`, `${stats.returningListenersPercentage}%`, `${stats.avgAttendanceRate}%`][i]}
						</p>
					</div>
				))}
			</div>

			<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
				<div className="p-5 border-b border-gray-100">
					<h2 className="text-lg md:text-xl font-semibold">Заявки участников</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-sm min-w-[600px]">
						<thead className="bg-gray-50 text-gray-600">
							<tr>
								<th className="p-3 text-left font-medium">Мероприятие</th>
								<th className="p-3 text-left font-medium">Дата подачи</th>
								<th className="p-3 text-left font-medium">Статус</th>
								<th className="p-3 text-left font-medium">Действия</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{applications.map((app) => (
								<tr key={app.id} className="hover:bg-gray-50 transition">
									<td className="p-3 font-medium">{app.eventTitle}</td>
									<td className="p-3 text-gray-500">{new Date(app.submittedAt).toLocaleDateString()}</td>
									<td className="p-3">
										<span className={`px-2 py-1 rounded-md text-xs font-medium border border-gray-200 ${app.status === 'approved' ? 'bg-green-50 text-green-700' : app.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
											}`}>
											{app.status === 'approved' ? 'Принято' : app.status === 'rejected' ? 'Отклонено' : 'На рассмотрении'}
										</span>
									</td>
									<td className="p-3">
										{app.status === 'pending' && (
											<div className="flex gap-2">
												<button className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition">Принять</button>
												<button className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition">Отклонить</button>
											</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{notifications.length > 0 && (
				<div className="bg-white border border-amber-200 rounded-xl p-5">
					<h3 className="font-semibold text-amber-800 mb-2">🔔 Новые уведомления</h3>
					<ul className="space-y-2 text-sm text-amber-700">
						{notifications.slice(0, 3).map((n) => (
							<li key={n.id} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />{n.message}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};