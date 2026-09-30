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
import ProviderSetup from './pages/ProviderSetup';
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
                <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface overflow-x-hidden w-full max-w-full">
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
                            {/* Public routes per Stitch contract */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/provider/:id" element={<ProviderProfile />} />
                            <Route path="/help" element={<HelpSupport />} />
                            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
                            <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

                            {/* Protected Routes — Redirect to /login if unauthenticated */}
                            <Route path="/checkout/:providerId" element={<ProtectedRoute><BookingCheckout /></ProtectedRoute>} />
                            <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
                            <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['user', 'provider', 'admin']}><UserDashboard /></ProtectedRoute>} />
                            <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
                            <Route path="/provider-setup" element={<ProtectedRoute allowedRoles={['provider']}><ProviderSetup /></ProtectedRoute>} />
                            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

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
