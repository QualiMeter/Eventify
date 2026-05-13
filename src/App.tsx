import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RouteGuard } from './components/RouteGuard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EventDetailsPage from './pages/EventDetailsPage';
import './App.css';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/"
                        element={
                            <RouteGuard requireAuth>
                                <HomePage />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/events/:id"
                        element={
                            <RouteGuard requireAuth>
                                <EventDetailsPage />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <RouteGuard requireAuth>
                                <ProfilePage />
                            </RouteGuard>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
