import type { Event } from '../types';
import { EventCatalog } from '../components/events/EventCatalog';
import { Calendar, Users, Award, Zap } from 'lucide-react';

const mockEvents: Event[] = [
	{
		id: '1',
		title: 'React Advanced Patterns',
		description: 'Глубокое погружение в хуки, паттерны и оптимизацию рендеринга.',
		startDate: '2026-05-15',
		endDate: '2026-05-15',
		location: 'Москва, онлайн',
		format: 'online',
		organizerId: 'o1',
		organizerName: 'WebDev Community',
		selectionMethod: 'free',
		registeredCount: 45,
		image: '/img/95FXM.jpg'
	},
	{
		id: '2',
		title: 'AI в продакшене',
		description: 'Как деплоить LLM, строить RAG-пайплайны и мониторить качество.',
		startDate: '2026-05-18',
		endDate: '2026-05-18',
		location: 'СПб, офлайн',
		format: 'offline',
		organizerId: 'o2',
		organizerName: 'DataScience Hub',
		selectionMethod: 'moderation',
		registeredCount: 12,
		maxParticipants: 50,
		image: '/img/pTL3O.jpg'
	},
	{
		id: '3',
		title: 'TypeScript Deep Dive',
		description: 'Генерики, conditional types, mapped types и типизация сложных доменов.',
		startDate: '2026-05-20',
		endDate: '2026-05-20',
		location: 'Онлайн',
		format: 'online',
		organizerId: 'o1',
		organizerName: 'WebDev Community',
		selectionMethod: 'free',
		registeredCount: 89,
		image: '/img/onawK.jpg'
	},
	{
		id: '4',
		title: 'Event-Driven Architecture',
		description: 'Практика построения масштабируемых систем на основе событий.',
		startDate: '2026-05-25',
		endDate: '2026-05-25',
		location: 'Казань, офлайн',
		format: 'offline',
		organizerId: 'o3',
		organizerName: 'Backend Guild',
		selectionMethod: 'free',
		registeredCount: 67,
		maxParticipants: 100,
		image: '/img/keoqi.jpg'
	},
];

export const HomePage = () => {
	return (
		<>
			{/* Приветственный блок */}
			<div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
				<div className="bg-white rounded-xl p-6 md:p-8 space-y-6">
					<div className="text-center max-w-3xl mx-auto">
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
							Добро пожаловать в <span className="text-blue-600">Eventify</span>
						</h1>
						<p className="text-lg text-gray-600 mb-6">
							Платформа для поиска, организации и участия в профессиональных мероприятиях
						</p>
					</div>

					{/* Преимущества */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<FeatureCard
							icon={<Calendar className="w-6 h-6 text-blue-600" />}
							title="Актуальные события"
							description="Находите мероприятия по интересам, дате и формату проведения"
						/>
						<FeatureCard
							icon={<Users className="w-6 h-6 text-blue-600" />}
							title="Удобная запись"
							description="Записывайтесь в один клик, получайте уведомления и сертификаты"
						/>
						<FeatureCard
							icon={<Award className="w-6 h-6 text-blue-600" />}
							title="Для организаторов"
							description="Создавайте события, управляйте заявками и отслеживайте статистику"
						/>
						<FeatureCard
							icon={<Zap className="w-6 h-6 text-blue-600" />}
							title="Автоматизация"
							description="Уведомления, напоминания и интеграция с календарём"
						/>
					</div>
				</div>
			</div>

			{/* Каталог событий */}
			<div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">Каталог событий</h2>
				<EventCatalog initialEvents={mockEvents} />
			</div>
		</>
	);
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
	<div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
		<div className="shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
			{icon}
		</div>
		<div>
			<h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
			<p className="text-sm text-gray-600 leading-relaxed">{description}</p>
		</div>
	</div>
);