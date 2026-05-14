import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, Calendar, Phone } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [surname, setSurname] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');

    const dateLimits = useMemo(() => {
        const now = new Date();
        const max = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        const min = new Date(now.getFullYear() - 150, now.getMonth(), now.getDate());
        return {
            min: min.toISOString().split('T')[0],
            max: max.toISOString().split('T')[0]
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await register({
                surname,
                name: firstName,
                patronym: middleName || null,
                birthDate: birthDate || null,
                email,
                password,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
            });
            navigate('/');
        } catch (err: any) {
            setError(err.data?.detail || 'Ошибка регистрации. Проверьте данные.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6">
            <div className="bg-white border border-gray-200 rounded-xl w-full max-w-5xl p-6 space-y-5">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Создание аккаунта</h2>
                    <p className="text-gray-500 text-sm mt-1">Заполните данные профиля</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Lock size={14} /> Учётные данные
                            </h3>
                            <div>
                                <label className="block text-xs font-medium mb-1">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Пароль</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-gray-100 lg:border-t-0 lg:border-l lg:pl-5">
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <User size={14} /> Личные данные
                            </h3>
                            <div>
                                <label className="block text-xs font-medium mb-1">Фамилия</label>
                                <input
                                    type="text"
                                    required
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                    placeholder="Иванов"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Имя</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                        placeholder="Иван"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Отчество</label>
                                    <input
                                        type="text"
                                        value={middleName}
                                        onChange={(e) => setMiddleName(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                        placeholder="(необяз.)"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Дата рождения</label>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            min={dateLimits.min}
                                            max={dateLimits.max}
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Телефон</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                            placeholder="+7..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                        >
                            {isSubmitting ? 'Обработка...' : 'Зарегистрироваться'}
                        </button>
                        <div className="text-center text-xs">
                            <p className="text-gray-600">
                                Уже есть аккаунт?{' '}
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Войти
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
