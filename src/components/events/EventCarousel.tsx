import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react';
import type { Event } from '../../types';

interface EventCarouselProps {
	events: Event[];
}

export const EventCarousel = ({ events }: EventCarouselProps) => {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		align: 'center',
		skipSnaps: false,
		dragFree: true,
		containScroll: 'trimSnaps',
	});

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
	const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap() % events.length);
	}, [emblaApi, events.length]);

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

	const handleRegisterClick = () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: location.pathname } });
		} else {
			console.log('Запись на мероприятие:', events[selectedIndex]);
		}
	};

	if (events.length === 0) return null;

	return (
		<div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
			<div className="relative">
				{/* Viewport карусели */}
				<div className="overflow-hidden py-8" ref={emblaRef}>
					{/* ✅ py-4 внутри трека даёт безопасную зону для scale и translateY */}
					<div className="flex py-4">
						{events.map((event, i) => {
							const isActive = i === selectedIndex;
							return (
								<div
									key={event.id}
									className="flex-[0_0_100%] sm:flex-[0_0_85%] lg:flex-[0_0_60%] min-w-0 px-2"
								>
									{/* ✅ Убран border-gray-200, оставлен только скруглённый фон */}
									<div
										className="bg-white rounded-xl h-full flex flex-col p-5 transition-all duration-500 ease-out"
										style={{
											transform: isActive ? 'scale(1.03) translateY(-4px)' : 'scale(0.95) translateY(0)',
											opacity: isActive ? 1 : 0.45,
										}}
									>
										<div className="h-40 bg-gray-50 rounded-lg relative overflow-hidden mb-3">
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

										<div className="flex flex-col flex-1">
											<h3 className="font-semibold text-lg mb-1 line-clamp-1">{event.title}</h3>
											<p className="text-gray-500 text-sm mb-2">{event.organizerName}</p>
											<div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
												<MapPin size={14} /> {event.location}
											</div>
											<p className="text-gray-700 text-sm line-clamp-2 mb-4 flex-1">{event.description}</p>

											<div className="flex justify-between items-center pt-3 border-t border-gray-100">
												<span className="text-xs text-gray-500">
													{event.registeredCount}/{event.maxParticipants || '∞'} уч.
												</span>
												<button
													onClick={handleRegisterClick}
													className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
												>
													{isAuthenticated ? 'Записаться' : 'Войти для записи'}
												</button>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Градиентные маски для плавного затухания */}
				<div className="absolute inset-y-0 left-0 w-5 sm:w-8 md:w-12 lg:w-20 bg-gradient-to-r from-gray-50 via-gray-50/60 to-transparent pointer-events-none z-10" />
				<div className="absolute inset-y-0 right-0 w-5 sm:w-8 md:w-12 lg:w-20 bg-gradient-to-l from-gray-50 via-gray-50/60 to-transparent pointer-events-none z-10" />
			</div>

			{/* Стрелки */}
			<button
				onClick={scrollPrev}
				className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 z-20 transition"
				aria-label="Предыдущий"
			>
				<ChevronLeft size={20} />
			</button>
			<button
				onClick={scrollNext}
				className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 z-20 transition"
				aria-label="Следующий"
			>
				<ChevronRight size={20} />
			</button>

			{/* Точки */}
			<div className="flex justify-center gap-3 mt-8">
				{scrollSnaps.map((_, i) => (
					<button
						key={i}
						onClick={() => scrollTo(i)}
						className={`h-2.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2.5 hover:bg-gray-400'}`}
					/>
				))}
			</div>
		</div>
	);
};