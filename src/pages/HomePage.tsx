import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../types';
import { CalendarDays, MapPin, Users, Search, Bell, X } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import useEmblaCarousel from 'embla-carousel-react';
import { eventsApi } from '../services/api';

const categories = [
	{ id: 'all', name: 'Все', icon: '📅' },
	{ id: 'it', name: 'IT', icon: '💻' },
	{ id: 'business', name: 'Бизнес', icon: '💼' },
	{ id: 'design', name: 'Дизайн', icon: '🎨' },
	{ id: 'marketing', name: 'Маркетинг', icon: '📈' },
	{ id: 'science', name: 'Наука', icon: '🔬' },
];

export default function HomePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [events, setEvents] = useState<Event[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [isLoading, setIsLoading] = useState(true);
	const [showSearch, setShowSearch] = useState(false);

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

	useEffect(() => {
		if (user?.role === 'organizer') {
			navigate('/organizer/dashboard');
			return;
		}
		loadEvents();
	}, []);

	useEffect(() => {
		filterEvents();
	}, [events, searchQuery, selectedCategory]);

	const loadEvents = async () => {
		try {
			setIsLoading(true);
			const data = await eventsApi.getAll('published', 1, 50);
			setEvents(data);
		} catch (error) {
			console.error('Failed to load events:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const filterEvents = () => {
		let filtered = [...events];

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(event =>
				event.title.toLowerCase().includes(query) ||
				event.description?.toLowerCase().includes(query) ||
				event.location?.toLowerCase().includes(query)
			);
		}

		if (selectedCategory !== 'all') {
			const categoryKeywords: Record<string, string[]> = {
				it: ['react', 'typescript', 'javascript', 'python', 'ai', 'ml', 'web', 'programming'],
				business: ['бизнес', 'менеджмент', 'startup', 'предприниматель'],
				design: ['дизайн', 'ui', 'ux', 'figma', 'graphic'],
				marketing: ['маркетинг', 'seo', 'smm', 'контент'],
				science: ['наука', 'research', 'data', 'analysis'],
			};

			const keywords = categoryKeywords[selectedCategory] || [];
			filtered = filtered.filter(event =>
				keywords.some(keyword =>
					event.title.toLowerCase().includes(keyword) ||
					event.description?.toLowerCase().includes(keyword)
				)
			);
		}

		setFilteredEvents(filtered);
	};

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		setScrollSnaps(emblaApi.scrollSnapList());
		emblaApi.on('select', onSelect);
		emblaApi.on('reInit', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
			emblaApi.off('reInit', onSelect);
		};
	}, [emblaApi, onSelect]);

	const formatDate = async (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getDaysUntilEvent = (dateString: string) => {
		const eventDate = new Date(dateString);
		const today = new Date();
		const diffTime = eventDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Сегодня';
		if (diffDays === 1) return 'Завтра';
		if (diffDays <= 7) return `Через ${diffDays} дня`;
		return null;
	};

	const handleCategoryClick = (categoryId: string) => {
		setSelectedCategory(categoryId);
	};

	const handleSearchClick = () => {
		setShowSearch(true);
	};

	const handleCloseSearch = () => {
		setShowSearch(false);
		setSearchQuery('');
	};

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			<header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white sticky top-0 z-10 shadow-lg">
				<div className="px-4 py-4">
					{!showSearch ? (
						<div className="flex items-center justify-between mb-4">
							<div>
								<h1 className="text-2xl font-bold">Eventify</h1>
								<p className="text-blue-100 text-sm mt-0.5">Найди своё событие</p>
							</div>
							<div className="flex gap-2">
								<button
									onClick={handleSearchClick}
									className="relative p-2 rounded-full hover:bg-blue-500 transition"
								>
									<Search size={24} />
								</button>
								<button className="relative p-2 rounded-full hover:bg-blue-500 transition">
									<Bell size={24} />
									<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></span>
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<button
								onClick={handleCloseSearch}
								className="p-2 rounded-full hover:bg-blue-500 transition"
							>
								<X size={20} />
							</button>
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Поиск событий..."
									autoFocus
									className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md"
								/>
							</div>
						</div>
					)}

					{!showSearch && (
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Поиск событий..."
								onClick={handleSearchClick}
								readOnly
								className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md cursor-pointer"
							/>
						</div>
					)}
				</div>
			</header>

			<main className="space-y-4 px-4 py-4">
				<div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
					<h2 className="text-xl font-bold mb-2">👋 Привет!</h2>
					<p className="text-blue-50 text-sm leading-relaxed">
						Готов узнать о новых событиях? Не упусти интересные мероприятия!
					</p>
				</div>

				<div>
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-lg font-bold text-gray-900">Категории</h3>
					</div>
					<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
						{categories.map((category) => (
							<button
								key={category.id}
								onClick={() => handleCategoryClick(category.id)}
								className={`flex-shrink-0 rounded-xl px-4 py-3 shadow-sm border active:scale-95 transition-transform ${selectedCategory === category.id
									? 'bg-blue-600 border-blue-600 text-white'
									: 'bg-white border-gray-100 text-gray-700'
									}`}
							>
								<span className="text-2xl block mb-1">{category.icon}</span>
								<span className="text-xs font-medium">{category.name}</span>
							</button>
						))}
					</div>
				</div>

				{filteredEvents.length > 0 && filteredEvents.slice(0, 3).length > 0 && (
					<div>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-bold text-gray-900">Рекомендуем</h3>
						</div>
						<div className="overflow-hidden" ref={emblaRef}>
							<div className="flex -ml-4">
								{filteredEvents.slice(0, 3).map((event, i) => (
									<div key={i} className="flex min-w-0 pl-4">
										<div
											onClick={() => navigate(`/events/${event.id}`)}
											className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg cursor-pointer active:scale-95 transition-transform max-w-[350px]"
										>
											<div className="flex justify-between items-start gap-2">
												<div className="min-w-0 flex-1">
													<h4 className="font-bold text-lg truncate mb-2">{event.title}</h4>
													<div className="flex items-center gap-2 text-blue-50 text-sm">
														<CalendarDays size={16} className="shrink-0" />
														<span className="truncate">{formatDate(event.startAt)}</span>
													</div>
												</div>
												<div className="shrink-0 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
													<span className="text-xs font-medium whitespace-nowrap">⭐ Рекомендуем</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="flex justify-center gap-1.5 mt-3">
								{scrollSnaps.map((_, i) => (
									<div
										key={i}
										className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-300'}`}
									/>
								))}
							</div>
						</div>
					</div>
				)}

				<div>
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-lg font-bold text-gray-900">
							{searchQuery || selectedCategory !== 'all' ? 'Результаты' : 'Ближайшие события'}
						</h3>
						{(searchQuery || selectedCategory !== 'all') && (
							<button
								onClick={() => {
									setSearchQuery('');
									setSelectedCategory('all');
								}}
								className="text-blue-600 text-sm font-medium"
							>
								Сбросить фильтры
							</button>
						)}
					</div>

					{isLoading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
							<p className="text-gray-500 mt-4">Загрузка событий...</p>
						</div>
					) : filteredEvents.length === 0 ? (
						<div className="text-center py-12 bg-white rounded-xl">
							<CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
							<p className="text-gray-500 mb-4">Попробуйте изменить параметры поиска</p>
							<button
								onClick={() => {
									setSearchQuery('');
									setSelectedCategory('all');
								}}
								className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
							>
								Сбросить фильтры
							</button>
						</div>
					) : (
						<div className="space-y-3">
							{filteredEvents.map((event) => {
								const daysUntil = getDaysUntilEvent(event.startAt);
								return (
									<div
										key={event.id}
										onClick={() => navigate(`/events/${event.id}`)}
										className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-95 transition-transform cursor-pointer"
									>
										<div className="flex">
											{event.image && (
												<img
													src={event.image}
													alt={event.title}
													className="w-28 h-28 object-cover flex-shrink-0"
												/>
											)}
											<div className="flex-1 p-3 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-1">
													<h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
														{event.title}
													</h4>
													{daysUntil && (
														<span className="flex-shrink-0 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded-lg">
															{daysUntil}
														</span>
													)}
												</div>

												<div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1.5">
													<CalendarDays size={14} />
													<span className="truncate">{formatDate(event.startAt)}</span>
												</div>

												{event.location && (
													<div className="flex items-center gap-1.5 text-gray-500 text-xs">
														<MapPin size={14} />
														<span className="truncate">{event.location}</span>
													</div>
												)}

												<div className="flex items-center gap-2 mt-2">
													<span className={`px-2 py-0.5 rounded text-xs font-medium ${event.format === 'online'
														? 'bg-green-50 text-green-700'
														: 'bg-blue-50 text-blue-700'
														}`}>
														{event.format === 'online' ? 'Онлайн' : 'Офлайн'}
													</span>
													{event.maxParticipants && (
														<div className="flex items-center gap-1 text-gray-500 text-xs">
															<Users size={14} />
															<span>{event.registeredCount}/{event.maxParticipants}</span>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>

			<BottomNav />
		</div>
	);
}
