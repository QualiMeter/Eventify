import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Bell, Edit2, Save, X, LogOut } from 'lucide-react';
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

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Не указана';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
    }

    const isOrganizer = user.role === 'organizer';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className={`bg-gradient-to-r shadow-lg sticky top-0 z-10 ${isOrganizer ? 'from-indigo-600 to-purple-700' : 'from-blue-500 to-indigo-600'
                } text-white`}>
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Профиль</h1>
                    {!isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full hover:bg-white/20 transition"
                            >
                                <LogOut size={20} />
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-full hover:bg-white/20 transition"
                            >
                                <Edit2 size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="p-2 rounded-full hover:bg-white/20 transition"
                            >
                                <X size={20} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="p-2 rounded-full hover:bg-white/20 transition"
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
                    <div className={`bg-gradient-to-r p-6 text-white ${isOrganizer ? 'from-indigo-600 to-purple-700' : 'from-blue-500 to-indigo-600'
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {user.surname} {user.name}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    {user.role === 'organizer' ? 'Организатор' :
                                        user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                </p>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    Telegram
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="tgUsername"
                                        value={formData.tgUsername}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="@username"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Bell size={18} className="text-gray-400" />
                                        <span>{user.tgUsername || 'Не указан'}</span>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="notifications"
                                            checked={formData.notifications}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Получать уведомления</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
