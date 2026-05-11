import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, ShieldCheck, Calendar, Menu, X } from 'lucide-react';

const RoleBadge = ({ role }: { role: UserRole }) => {
	const styles: Record<UserRole, string> = {
		listener: 'bg-gray-50 text-gray-700',
		organizer: 'bg-blue-50 text-blue-700',
		admin: 'bg-purple-50 text-purple-700',
	};
	return <span className={`px-2 py-0.5 rounded-md text-xs font-medium border border-gray-200 ${styles[role]}`}>{role}</span>;
};

export const Header = () => {
	const { user, logout, isAuthenticated } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const NavLinks = () => (
		<>
			<Link to="/" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition">События</Link>
			{isAuthenticated && user && (
				<>
					<Link to="/profile" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition">Профиль</Link>
					{(user.role === 'organizer' || user.role === 'admin') && (
						<Link to="/organizer" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5"><ShieldCheck size={14} /> Панель</Link>
					)}
					{user.role === 'admin' && (
						<Link to="/admin" className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition">Админ</Link>
					)}
				</>
			)}
		</>
	);

	return (
		<header className="fixed top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 z-50 mx-auto max-w-5xl">
			<div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 md:px-5 md:py-3">
				<Link to="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Calendar className="text-gray-700" size={20} />
					<span className="hidden sm:inline">Eventify</span>
				</Link>

				<nav className="hidden md:flex items-center gap-1">
					<NavLinks />
					{isAuthenticated && user && (
						<div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-2">
							<RoleBadge role={user.role} />
							<button onClick={logout} className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition" aria-label="Выйти">
								<LogOut size={16} /> Выйти
							</button>
						</div>
					)}
					{!isAuthenticated && (
						<Link to="/login" className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">Войти</Link>
					)}
				</nav>

				<div className="flex items-center gap-3 md:hidden">
					{isAuthenticated && user && <RoleBadge role={user.role} />}
					<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 rounded-lg hover:bg-gray-50 transition">
						{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
					</button>
				</div>

				{mobileMenuOpen && (
					<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl p-4 md:hidden flex flex-col gap-2">
						<NavLinks />
						{isAuthenticated && user && (
							<button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition">
								<LogOut size={16} /> Выйти
							</button>
						)}
						{!isAuthenticated && (
							<Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg text-center hover:bg-blue-700 transition">Войти</Link>
						)}
					</div>
				)}
			</div>
		</header>
	);
};