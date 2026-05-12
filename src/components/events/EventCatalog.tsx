import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventsApi } from '../../services/api';
import type { Event, PaginatedResponse } from '../../types';

interface EventCatalogProps {
    initialEvents?: Event[];
}

export const EventCatalog = ({ initialEvents }: EventCatalogProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [data, setData] = useState<PaginatedResponse<Event> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [formatFilter, setFormatFilter] = useState<Set<'online' | 'offline'>>(new Set());
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        formats: new Set<'online' | 'offline'>(),
        dateFrom: '',
        dateTo: '',
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await eventsApi.getAll({
                page: 1,
                limit: 100,
            });
            setData(response);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            if (initialEvents && initialEvents.length > 0) {
                setData({
                    items: initialEvents,
                    total: initialEvents.length,
                    page: 1,
                    limit: 100,
                    totalPages: 1,
                });
            } else {
                setError('Не удалось загрузить события. Попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = useMemo(() => {
        if (!data) return [];

        let filtered = [...data.items];

        if (appliedFilters.search) {
            const query = appliedFilters.search.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query) ||
                event.organizerName.toLowerCase().includes(query)
            );
        }

        if (appliedFilters.formats.size > 0) {
            filtered = filtered.filter(event => appliedFilters.formats.has(event.format));
        }

        if (appliedFilters.dateFrom) {
            const fromDate = new Date(appliedFilters.dateFrom);
            filtered = filtered.filter(event => new Date(event.startDate) >= fromDate);
        }

        if (appliedFilters.dateTo) {
            const toDate = new Date(appliedFilters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(event => new Date(event.startDate) <= toDate);
        }

        return filtered;
    }, [data, appliedFilters]);

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedFilters({
            search: searchQuery,
            formats: new Set(formatFilter),
            dateFrom,
            dateTo,
        });
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFormatFilter(new Set());
        setDateFrom('');
        setDateTo('');
        setAppliedFilters({
            search: '',
            formats: new Set(),
            dateFrom: '',
            dateTo: '',
        });
    };

    const toggleFormat = (format: 'online' | 'offline') => {
        const newFormats = new Set(formatFilter);
        if (newFormats.has(format)) {
            newFormats.delete(format);
        } else {
            newFormats.add(format);
        }
        setFormatFilter(newFormats);
    };

    const handleRegisterClick = (event: Event) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
        } else {
            console.log('Запись на мероприятие:', event);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Фильтры */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                <form onSubmit={handleApplyFilters} className="space-y-4">
                    {/* Поиск */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск событий..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Фильтр по формату */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleFormat('online')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                                        formatFilter.has('online')
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Онлайн
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleFormat('offline')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                                        formatFilter.has('offline')
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Офлайн
                                </button>
                            </div>
                        </div>

                        {/* Дата от */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Дата от</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Дата до */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Дата до</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Применить
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Сбросить
                        </button>
                    </div>
                </form>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Активные фильтры */}
            {(appliedFilters.search || appliedFilters.formats.size > 0 || appliedFilters.dateFrom || appliedFilters.dateTo) && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-600">Активные фильтры:</span>
                    {appliedFilters.search && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							Поиск: {appliedFilters.search}
						</span>
                    )}
                    {Array.from(appliedFilters.formats).map(format => (
                        <span key={format} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							{format === 'online' ? 'Онлайн' : 'Офлайн'}
						</span>
                    ))}
                    {appliedFilters.dateFrom && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							От: {new Date(appliedFilters.dateFrom).toLocaleDateString('ru-RU')}
						</span>
                    )}
                    {appliedFilters.dateTo && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							До: {new Date(appliedFilters.dateTo).toLocaleDateString('ru-RU')}
						</span>
                    )}
                </div>
            )}

            {/* Сетка событий */}
            {filteredEvents.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                            >
                                {/* Изображение */}
                                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = `
														<div class="w-full h-full flex items-center justify-center text-gray-300">
															<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
														</div>
													`;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Calendar size={48} />
                                        </div>
                                    )}
                                    <span
                                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                                            event.format === 'online'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-purple-100 text-purple-700 border border-purple-200'
                                        }`}
                                    >
										{event.format === 'online' ? 'Онлайн' : 'Офлайн'}
									</span>
                                </div>

                                {/* Контент */}
                                <div className="p-5 space-y-3">
                                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{event.title}</h3>

                                    <p className="text-sm text-gray-600 font-medium">{event.organizerName}</p>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-start gap-2">
                                            <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                                            <span>{formatDate(event.startDate)}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                                            <span className="line-clamp-1">{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 shrink-0 text-blue-600" />
                                            <span>
												{event.registeredCount}
                                                {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} уч.
											</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700 line-clamp-2 pt-2 border-t border-gray-100">
                                        {event.description}
                                    </p>

                                    {/* Кнопка действия */}
                                    <button
                                        onClick={() => handleRegisterClick(event)}
                                        className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                                    >
                                        {isAuthenticated ? 'Записаться' : 'Войти для записи'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Информация о результатах */}
                    <div className="text-center text-sm text-gray-600 pt-2">
                        Найдено {filteredEvents.length} из {data?.items.length || 0} событий
                    </div>
                </>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">События не найдены</h3>
                    <p className="text-gray-600">
                        Попробуйте изменить параметры поиска или фильтры
                    </p>
                </div>
            )}
        </div>
    );
};
