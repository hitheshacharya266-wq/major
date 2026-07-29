import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getDashboardPath } from './utils/helpers';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuth from './components/RedirectIfAuth';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Core Pages
import LandingPage from './pages/LandingPage';
import SearchResults from './pages/SearchResults';
import ProviderProfile from './pages/ProviderProfile';
import BookingCheckout from './pages/BookingCheckout';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Additional App Pages
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import HelpSupport from './pages/HelpSupport';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-surface font-sans text-on-surface">
                    <Navbar />

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#ffffff',
                                color: '#0b1c30',
                                border: '1px solid #bcc9c8',
                                boxShadow: '0 12px 24px -10px rgba(0, 106, 105, 0.15)',
                                borderRadius: '16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                padding: '12px 16px',
                            },
                        }}
                    />

                    <AnimatePresence mode="wait">
                        <Routes>
                            {/* Public Pages */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/provider/:id" element={<ProviderProfile />} />
                            <Route path="/checkout/:providerId" element={<BookingCheckout />} />
                            <Route path="/help" element={<HelpSupport />} />

                            {/* Public Auth routes */}
                            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
                            <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

                            {/* User Protected Routes */}
                            <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
                            <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['user', 'provider', 'admin']}><UserDashboard /></ProtectedRoute>} />

                            {/* Provider Protected Routes */}
                            <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />

                            {/* Admin Protected Routes */}
                            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                            {/* Shared Authenticated Pages */}
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/settings" element={<Settings />} />

                            {/* Catch-all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
