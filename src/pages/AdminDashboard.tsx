import { useState } from 'react';

type Tab = 'users' | 'events' | 'logs';

export const AdminDashboard = () => {
	const [activeTab, setActiveTab] = useState<Tab>('users');
	const tabs: { id: Tab; label: string }[] = [
		{ id: 'users', label: 'Пользователи' },
		{ id: 'events', label: 'Модерация событий' },
		{ id: 'logs', label: 'Логи системы' },
	];

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<h1 className="text-2xl md:text-3xl font-bold">Панель администратора</h1>
				<span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-md text-sm font-medium self-start sm:self-auto">System Admin</span>
			</div>

			<div className="border-b border-gray-200 overflow-x-auto">
				<nav className="flex gap-6 min-w-max pb-px">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`pb-3 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			<div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 min-h-[300px]">
				{activeTab === 'users' && (
					<>
						<h2 className="text-lg font-semibold mb-3">Управление ролями</h2>
						<p className="text-gray-600 mb-4">Назначайте роли, просматривайте активность и управляйте доступом.</p>
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
							GET /api/admin/users<br />PATCH /api/admin/users/:id/role<br />POST /api/admin/users/:id/ban
						</div>
					</>
				)}
				{activeTab === 'events' && (
					<>
						<h2 className="text-lg font-semibold mb-3">Очередь модерации</h2>
						<p className="text-gray-600">События новых организаторов проходят предварительную проверку перед публикацией.</p>
					</>
				)}
				{activeTab === 'logs' && (
					<>
						<h2 className="text-lg font-semibold mb-3">Аудит безопасности</h2>
						<p className="text-gray-600">Журнал входов, изменений прав и системных ошибок.</p>
					</>
				)}
			</div>
		</div>
	);
};