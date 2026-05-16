import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Users, ArrowLeft, Image as ImageIcon, X, Plus, GripVertical, Text, LayoutGrid, CircleHelp, Upload, Monitor, Layers } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { ApiError, eventsApi } from '../services/api';
import type { EventBlock, BlockType } from '../types';

// --- Модалка выбора типа блока ---
function BlockTypeModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (type: BlockType) => void }) {
    if (!isOpen) return null;

    const types: Array<{ type: BlockType; icon: React.ElementType; desc: string }> = [
        { type: 'text', icon: Text, desc: 'Простой текст' },
        { type: 'image', icon: ImageIcon, desc: 'Одно изображение' },
        { type: 'carousel', icon: LayoutGrid, desc: 'Галерея фото' },
        { type: 'poll', icon: CircleHelp, desc: 'Опрос с вариантами' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Добавить блок</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {types.map((t) => (
                        <button
                            key={t.type}
                            onClick={() => { onSelect(t.type); onClose(); }}
                            className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition bg-gray-50"
                        >
                            <t.icon size={28} className="text-indigo-600 mb-2" />
                            <span className="font-medium text-gray-900">{t.type === 'text' ? 'Текст' : t.type === 'image' ? 'Изображение' : t.type === 'carousel' ? 'Карусель' : 'Опрос'}</span>
                            <span className="text-xs text-gray-500 mt-1">{t.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Сортируемый блок контента ---
function SortableBlock({ id, block, onEdit, onDelete, isEditing, onUpdateContent }: {
    id: string; block: EventBlock; onEdit: (id: string) => void; onDelete: (id: string) => void; isEditing: boolean; onUpdateContent: (content: any) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 50 : 'auto'
    };
    const typeLabels: Record<BlockType, string> = { text: 'Текст', image: 'Изображение', carousel: 'Карусель', poll: 'Опрос' };

    const update = (field: string, value: any) => onUpdateContent({ ...block.content, [field]: value });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            if (index !== undefined) {
                const imgs = [...(block.content.images ?? [])];
                imgs[index].url = dataUrl;
                update('images', imgs);
            } else {
                update('url', dataUrl);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4 relative">
            <div {...attributes} {...listeners} style={{ touchAction: 'none' }} className="absolute left-3 top-3 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition">
                <GripVertical size={20} />
            </div>
            <button onClick={() => onDelete(id)} className="absolute right-3 top-3 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <X size={18} />
            </button>

            <div className="pl-8 pt-1">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold uppercase tracking-wide">{typeLabels[block.type]}</span>
                </div>

                {!isEditing ? (
                    <>
                        {block.type === 'text' && <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{block.content.text || '...'}</p>}
                        {block.type === 'image' && block.content.url && (
                            <img src={block.content.url} alt={block.content.alt} className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                        )}
                        {block.type === 'carousel' && (block.content.images?.length ?? 0) > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                                {(block.content.images ?? []).slice(0, 3).map((img: { url: string; alt: string }, i: number) => (
                                    <img key={i} src={img.url} alt={img.alt} className="snap-center w-32 h-32 flex-shrink-0 object-cover rounded-lg border border-gray-200" />
                                ))}
                                {(block.content.images?.length ?? 0) > 3 && (
                                    <div className="flex items-center justify-center w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg text-gray-500 text-sm">
                                        +{(block.content.images?.length ?? 0) - 3}
                                    </div>
                                )}
                            </div>
                        )}
                        {block.type === 'poll' && (
                            <div>
                                <p className="text-gray-900 font-medium">{block.content.question || 'Вопрос не задан'}</p>
                                {(block.content.options?.length ?? 0) > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {(block.content.options ?? []).map((opt: { text: string; votes: number }, i: number) => (
                                            <li key={i} className="text-sm text-gray-600 truncate">
                                                • {opt.text || `Вариант ${i + 1}`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        <button onClick={() => onEdit(id)} className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                            Редактировать
                        </button>
                    </>
                ) : (
                    <div className="space-y-4">
                        {block.type === 'text' && (
                            <textarea value={block.content.text || ''} onChange={(e) => update('text', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Введите текст блока..." />
                        )}
                        {block.type === 'image' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition bg-white">
                                        <Upload size={18} className="text-gray-500" />
                                        <span className="text-sm text-gray-700">Загрузить с устройства</span>
                                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                    </label>
                                    <span className="text-xs text-gray-400">или URL</span>
                                </div>
                                <input value={block.content.url || ''} onChange={(e) => update('url', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="URL изображения" />
                                <input value={block.content.alt || ''} onChange={(e) => update('alt', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Описание (alt)" />
                            </div>
                        )}
                        {block.type === 'carousel' && (
                            <div className="space-y-3">
                                {(block.content.images ?? []).map((img: { url: string; alt: string }, i: number) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <label className="flex-1 px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition bg-white">
                                                <Upload size={16} className="text-gray-500" />
                                                <span className="text-xs text-gray-600">Слайд {i + 1}</span>
                                                <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, i)} className="hidden" />
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <input value={img.url} onChange={(e) => { const arr = [...(block.content.images ?? [])]; arr[i].url = e.target.value; update('images', arr); }} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" placeholder="URL (авто)" />
                                            <input value={img.alt} onChange={(e) => { const arr = [...(block.content.images ?? [])]; arr[i].alt = e.target.value; update('images', arr); }} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" placeholder="Alt текст" />
                                            <button onClick={() => { const arr = [...(block.content.images ?? [])]; arr.splice(i, 1); update('images', arr); }} className="px-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => update('images', [...(block.content.images ?? []), { url: '', alt: '' }])} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">+ Добавить слайд</button>
                            </div>
                        )}
                        {block.type === 'poll' && (
                            <div className="space-y-3">
                                <input value={block.content.question || ''} onChange={(e) => update('question', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium" placeholder="Вопрос опроса" />
                                <p className="text-sm text-gray-600">Варианты ответа:</p>
                                {(block.content.options ?? []).map((opt: { text: string; votes: number }, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <input value={opt.text} onChange={(e) => { const arr = [...(block.content.options ?? [])]; arr[i].text = e.target.value; update('options', arr); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" placeholder={`Вариант ${i + 1}`} />
                                        <button onClick={() => { const arr = [...(block.content.options ?? [])]; arr.splice(i, 1); update('options', arr); }} className="px-3 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                                    </div>
                                ))}
                                <button onClick={() => update('options', [...(block.content.options ?? []), { text: '', votes: 0 }])} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">+ Добавить вариант</button>
                            </div>
                        )}
                        <button onClick={() => onEdit(id)} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                            Сохранить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'details' | 'content'>('details');
    const [formData, setFormData] = useState({
        title: '', description: '', location: '', format: 'offline', maxParticipants: '',
        startDate: '', startTime: '', endDate: '', endTime: '', selectionMethod: 'free', status: 'draft'
    });
    const [_, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [blocks, setBlocks] = useState<EventBlock[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const addBlock = (type: BlockType) => {
        const newBlock: EventBlock = {
            id: crypto.randomUUID(), type,
            content: type === 'text' ? { text: '' } : type === 'image' ? { url: '', alt: '' } : type === 'carousel' ? { images: [] } : { question: '', options: [] },
            sort_order: blocks.length
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlockContent = (id: string, content: any) => setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    const deleteBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));
    const toggleEdit = (id: string) => setEditingBlockId(editingBlockId === id ? null : id);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks(items => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)).map((b, i) => ({ ...b, sort_order: i })));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const start = new Date(`${formData.startDate}T${formData.startTime}Z`);
            const end = new Date(`${formData.endDate}T${formData.endTime}Z`);

            const eventData = {
                title: formData.title,
                description: formData.description || null,
                startAt: start.toISOString(),
                endAt: end.toISOString(),
                location: formData.location || null,
                format: formData.format as 'online' | 'offline' | 'hybrid',
                maxParticipants: formData.maxParticipants.trim().length > 0 ? parseInt(formData.maxParticipants) : null,
                selectionMethod: formData.selectionMethod as 'free' | 'moderation' | 'competition',
                status: 'published'
            };

            console.error('Post create event');
            const created = await eventsApi.create(eventData);
            console.error('Created event:', created);
            if (blocks.length > 0) {
                await eventsApi.updateBlocks(created.id, blocks.map(b => ({ type: b.type, content: b.content, sort_order: b.sort_order })));
                console.error('Updated blocks for event:', created.id);
            }

            alert('Мероприятие успешно создано!');
            navigate('/organizer/dashboard');
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.data?.detail || 'Ошибка при создании мероприятия');
            } else {
                setError('Ошибка при создании мероприятия');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Создание мероприятия</h1>
                </div>
                <div className="flex border-b max-w-2xl mx-auto px-4">
                    {(['details', 'content'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t === 'details' ? 'Описание мероприятия' : 'Описание содержимого'}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {tab === 'details' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Название мероприятия *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Введите название" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Расскажите о мероприятии" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Формат проведения *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'offline', label: 'Офлайн', icon: MapPin },
                                        { value: 'online', label: 'Онлайн', icon: Monitor },
                                        { value: 'hybrid', label: 'Гибрид', icon: Layers }
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, format: opt.value }))}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.format === opt.value
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <opt.icon size={20} className="mb-1" />
                                            <span className="text-sm font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.format === 'offline' || formData.format === 'hybrid' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Место проведения</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Город, адрес" />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата начала *</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Время начала *</label>
                                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата окончания *</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Время окончания *</label>
                                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Максимальное количество участников</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleInputChange} min="1" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Оставьте пустым для неограниченного" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Метод отбора участников</label>
                                <select name="selectionMethod" value={formData.selectionMethod} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <option value="free">Свободная запись</option>
                                    <option value="moderation">Модерация</option>
                                    <option value="competition">Конкурс</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Изображение мероприятия</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                            <button type="button" onClick={() => { setImage(null); setImagePreview(''); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">Нажмите чтобы выбрать изображение</p>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                                            <label htmlFor="image-upload" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition">Выбрать файл</label>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate('/organizer/dashboard')} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">Отмена</button>
                            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50">{isLoading ? 'Создание...' : 'Создать мероприятие'}</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <button onClick={() => setShowBlockModal(true)} className={`w-full mb-4 py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition font-medium ${blocks.length === 0 ? 'border-indigo-300 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-gray-50'}`}>
                            <Plus size={20} /> {blocks.length === 0 ? 'Добавить первый блок' : 'Добавить блок'}
                        </button>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
                                <div className="space-y-0 min-h-[200px] pb-4">
                                    {blocks.map(b => (
                                        <SortableBlock key={b.id} id={b.id} block={b} onEdit={toggleEdit} onDelete={deleteBlock} isEditing={editingBlockId === b.id} onUpdateContent={(c) => updateBlockContent(b.id, c)} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </>
                )}
            </main>

            <BlockTypeModal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} onSelect={addBlock} />
            <BottomNav />
        </div>
    );
}