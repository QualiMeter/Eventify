import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StatusBar } from '@capacitor/status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { RouteGuard } from './components/RouteGuard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPag';
import CreateEventPage from './pages/CreateEventPage';
import './App.css';

await StatusBar.setOverlaysWebView({ overlay: false });

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
                        path="/organizer/dashboard"
                        element={
                            <RouteGuard
                                requireAuth
                                allowedRoles={['organizer']}
                            >
                                <OrganizerDashboardPage />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/organizer/create-event"
                        element={
                            <RouteGuard
                                requireAuth
                                allowedRoles={['organizer']}
                            >
                                <CreateEventPage />
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
                        path="/my-registrations"
                        element={
                            <RouteGuard
                                requireAuth
                            >
                                <MyRegistrationsPage />
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
