import { useState, useMemo, type KeyboardEvent } from 'react';
import { Search, X, MapPin, CalendarDays } from 'lucide-react';
import type { Event } from '../../types';

interface EventCatalogProps {
    initialEvents: Event[];
}

export const EventCatalog = ({ initialEvents }: EventCatalogProps) => {
    const [searchInput, setSearchInput] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [formatFilter, setFormatFilter] = useState<'all' | 'online' | 'offline'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleSearch = () => setActiveSearchQuery(searchInput.trim());
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };
    const handleClearInput = () => { setSearchInput(''); setActiveSearchQuery(''); };
    const handleReset = () => {
        setSearchInput(''); setActiveSearchQuery(''); setFormatFilter('all'); setDateFrom(''); setDateTo('');
    };

    const filteredEvents = useMemo(() => {
        const query = activeSearchQuery.toLowerCase();
        return initialEvents.filter((event) => {
            const matchesSearch = !query || event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query) || event.organizerName.toLowerCase().includes(query) || event.location.toLowerCase().includes(query);
            const matchesFormat = formatFilter === 'all' || event.format === formatFilter;
            const eventDate = event.startDate.split('T')[0];
            return matchesSearch && matchesFormat && (!dateFrom || eventDate >= dateFrom) && (!dateTo || eventDate <= dateTo);
        });
    }, [initialEvents, activeSearchQuery, formatFilter, dateFrom, dateTo]);

    const hasActiveFilters = activeSearchQuery !== '' || formatFilter !== 'all' || dateFrom !== '' || dateTo !== '';

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 space-y-4">
                {/* Строка 1: Поиск + Кнопка */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Поиск по названию, описанию или организатору..."
                            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        />
                        {searchInput && (
                            <button onClick={handleClearInput} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1" aria-label="Очистить поиск">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button onClick={handleSearch} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                        Найти
                    </button>
                </div>

                {/* Строка 2: Формат + Даты + Сброс */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">

                        {/* ✅ Статичный переключатель: линия строго под активной кнопкой без анимации */}
                        <div className="flex items-center h-10 gap-4">
                            {(['all', 'online', 'offline'] as const).map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormatFilter(fmt)}
                                    className={`relative h-10 px-2 flex items-center text-sm font-medium transition-colors ${formatFilter === fmt ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <span>{fmt === 'all' ? 'Все' : fmt === 'online' ? 'Онлайн' : 'Офлайн'}</span>
                                    {formatFilter === fmt && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Даты */}
                        <div className="flex items-center gap-2">
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            <span className="text-gray-400">—</span>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition">
                            <X size={14} /> Сбросить
                        </button>
                    )}
                </div>
            </div>

            {/* Результаты */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500 font-medium">Мероприятия не найдены</p>
                        {hasActiveFilters && <button onClick={handleReset} className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm">Сбросить фильтры</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

const EventCard = ({ event }: { event: Event }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-40 bg-gray-50 relative overflow-hidden">
            {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <CalendarDays size={40} />
                </div>
            )}
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-gray-200">
                {event.format === 'online' ? 'Онлайн' : 'Офлайн'}
            </span>
        </div>
        <div className="p-4 flex flex-col">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{event.title}</h3>
            <p className="text-gray-500 text-sm mb-2">{event.organizerName}</p>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <MapPin size={14} /> {event.location}
            </div>
            <p className="text-gray-700 text-sm line-clamp-2 mb-4 flex-1">{event.description}</p>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{event.registeredCount}/{event.maxParticipants || '∞'} уч.</span>
                <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">Записаться</button>
            </div>
        </div>
    </div>
);