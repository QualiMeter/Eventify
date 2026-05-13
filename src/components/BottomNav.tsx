import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, PlusSquare } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
                <button
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                        isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Home size={24} />
                    <span className="text-xs">Главная</span>
                </button>

                <button
                    onClick={() => navigate('/events/new')}
                    className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition text-gray-600 hover:text-gray-900"
                >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
                        <PlusSquare size={24} className="text-white" />
                    </div>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                        isActive('/profile') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <User size={24} />
                    <span className="text-xs">Профиль</span>
                </button>
            </div>
        </nav>
    );
}
