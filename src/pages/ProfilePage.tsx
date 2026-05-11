import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage = () => {
	const { user } = useAuth();
	const [favorites, _] = useState<string[]>(['o1', 'o2']);

	if (!user) return null;

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<h1 className="text-2xl md:text-3xl font-bold">Личный кабинет</h1>

			<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
				<div className="grid grid-cols-1 md:grid-cols-3">
					<div className="p-6 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-100">
						<div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-600 mb-3">
							{user.name.charAt(0)}
						</div>
						<h2 className="text-xl font-semibold">{user.name}</h2>
						<p className="text-gray-500 text-sm">{user.email}</p>
						<span className="mt-2 px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-md font-medium uppercase tracking-wide">{user.role}</span>
					</div>

					<div className="p-6 md:col-span-2 space-y-5">
						<div>
							<h3 className="font-semibold text-lg mb-3">Избранные организаторы</h3>
							<div className="flex flex-wrap gap-2">
								{favorites.map((id) => (
									<span key={id} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm font-medium">
										Организатор #{id}
									</span>
								))}
								<button className="px-3 py-1.5 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition">
									+ Добавить
								</button>
							</div>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-3">История посещений</h3>
							<ul className="space-y-3">
								<li className="flex flex-col sm:flex-row sm:justify-between p-4 bg-white border border-gray-200 rounded-lg gap-1 hover:scale-[1.005] transition">
									<span className="font-medium">React Advanced Patterns</span>
									<span className="text-green-600 text-right sm:text-left font-medium">Сертификат готов ✓</span>
								</li>
								<li className="flex flex-col sm:flex-row sm:justify-between p-4 bg-white border border-gray-200 rounded-lg gap-1 hover:scale-[1.005] transition">
									<span className="font-medium">AI в продакшене</span>
									<span className="text-gray-400 text-right sm:text-left font-medium">Ожидает подтверждения</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};