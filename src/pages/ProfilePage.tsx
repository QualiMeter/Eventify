import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Clock, Bell, Edit2, Save, X, LogOut } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        surname: user?.surname || '',
        name: user?.name || '',
        patronym: user?.patronym || '',
        birthDate: user?.birthDate || '',
        email: user?.email || '',
        tgUsername: user?.tgUsername || '',
        notifications: user?.notifications || false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSave = async () => {
        setError('');
        setIsLoading(true);

        try {
            await updateProfile({
                ...formData,
                birthDate: formData.birthDate || null,
                password: null,
            });
            setIsEditing(false);
        } catch (err: any) {
            setError(err.data?.detail || 'Ошибка обновления профиля');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            surname: user?.surname || '',
            name: user?.name || '',
            patronym: user?.patronym || '',
            birthDate: user?.birthDate || '',
            email: user?.email || '',
            tgUsername: user?.tgUsername || '',
            notifications: user?.notifications || false,
        });
        setIsEditing(false);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Не указана';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                            <Edit2 size={20} />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                                <Save size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {user.surname} {user.name}
                                </h2>
                                <p className="text-blue-100 text-sm">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Фамилия
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <User size={18} className="text-gray-400" />
                                        <span>{user.surname}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Имя
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <User size={18} className="text-gray-400" />
                                        <span>{user.name}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Отчество
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="patronym"
                                        value={formData.patronym}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <User size={18} className="text-gray-400" />
                                        <span>{user.patronym || 'Не указано'}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Дата рождения
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Calendar size={18} className="text-gray-400" />
                                        <span>{formatDate(user.birthDate)}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Mail size={18} className="text-gray-400" />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telegram username
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="tgUsername"
                                        value={formData.tgUsername}
                                        onChange={handleChange}
                                        placeholder="@username"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <User size={18} className="text-gray-400" />
                                        <span>{user.tgUsername || 'Не указан'}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Часовой пояс
                                </label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Clock size={18} className="text-gray-400" />
                                    <span>{user.timezone || 'Не указан'}</span>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        name="notifications"
                                        id="notifications"
                                        checked={formData.notifications}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="notifications" className="flex items-center gap-2 text-gray-700">
                                        <Bell size={18} className="text-gray-400" />
                                        Включить уведомления
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                            >
                                <LogOut size={18} />
                                Выйти из аккаунта
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
