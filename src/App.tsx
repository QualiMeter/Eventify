import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RouteGuard } from './components/RouteGuard';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { startSignalRConnection, stopSignalRConnection } from './services/signalr';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) startSignalRConnection();
    return () => {
      if (isMounted && !isAuthenticated) stopSignalRConnection();
      isMounted = false;
    };
  }, [isAuthenticated]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20 md:pt-24 px-3 md:px-6 lg:px-8 pb-12">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<RouteGuard fallbackPath="/login"><ProfilePage /></RouteGuard>} />
          <Route path="/organizer" element={<RouteGuard allowedRoles={['organizer', 'admin']} fallbackPath="/"><OrganizerDashboard /></RouteGuard>} />
          <Route path="/admin" element={<RouteGuard allowedRoles={['admin']} fallbackPath="/"><AdminDashboard /></RouteGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}