import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

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
      if (mode === 'login') await login({ email, password });
      else {
        console.log('Registration Payload:', { email, lastName, firstName, middleName, birthDate, phone });
        await login({ email, password });
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Ошибка авторизации. Проверьте данные.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Плавное изменение ширины контейнера
  const containerWidth = mode === 'login' ? '480px' : '896px';

  // ✅ Симметричная анимация: работает одинаково плавно в обе стороны
  const rightColumnClasses = `
    transition-[max-height,opacity,transform] duration-500 ease-in-out overflow-hidden
    ${mode === 'register'
      ? 'max-h-[600px] opacity-100 translate-y-0'
      : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'
    }
  `;

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl w-full p-5 md:p-8 space-y-6"
        style={{ maxWidth: containerWidth, transition: 'max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">{mode === 'login' ? 'Вход в Eventify' : 'Создание аккаунта'}</h2>
          <p className="text-gray-500 text-sm mt-1">{mode === 'login' ? 'Введите email и пароль' : 'Заполните данные профиля'}</p>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}

        {/* Сетка с плавной адаптацией колонок */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className={`space-y-4 transition-all duration-500 ease-in-out ${mode === 'register' ? 'lg:col-span-1' : 'lg:col-span-2'
            }`}>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Lock size={14} /> Учётные данные
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className={rightColumnClasses}>
            <div className="space-y-4 pt-4 border-t border-gray-100 lg:border-t-0 lg:border-l lg:pl-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <User size={14} /> Личные данные
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Фамилия</label>
                  <input type="text" required={mode === 'register'} value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="Иванов" />
                </div>

                {/* ✅ Вертикальный стек: поля теперь занимают всю ширину формы */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Имя</label>
                    <input type="text" required={mode === 'register'} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="Иван" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Отчество</label>
                    <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="(необязательно)" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Дата рождения</label>
                  <input type="date" required={mode === 'register'} min={dateLimits.min} max={dateLimits.max} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Телефон</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="+7 (999) 000-00-00" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {isSubmitting ? 'Обработка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <div className="flex items-center justify-center gap-4 text-sm">
            <button type="button" onClick={() => setMode('login')} className={`font-medium transition ${mode === 'login' ? 'text-blue-600 underline' : 'text-gray-500 hover:text-gray-700'}`}>Войти</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={() => setMode('register')} className={`font-medium transition ${mode === 'register' ? 'text-blue-600 underline' : 'text-gray-500 hover:text-gray-700'}`}>Регистрация</button>
          </div>
        </div>
      </form>
    </div>
  );
};