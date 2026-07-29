/**
 * App — Root component with React Router v6
 *
 * Routing structure:
 * - "/" → Smart redirect based on auth state & role
 * - "/login" → Login (redirects to dashboard if already authenticated)
 * - "/register" → Register (redirects to dashboard if already authenticated)
 * - "/user-dashboard" → User dashboard (user role only)
 * - "/provider-dashboard" → Provider dashboard (provider role only)
 * - "/admin-dashboard" → Admin dashboard (admin role only)
 * - "*" → Redirect to "/"
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getDashboardPath } from './utils/helpers';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuth from './components/RedirectIfAuth';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

/**
 * SmartRedirect — Root "/" handler
 * Redirects authenticated users to their role-based dashboard,
 * unauthenticated users to /login.
 */
const SmartRedirect = () => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) return <LoadingSpinner fullScreen text="Loading..." />;

    if (currentUser) {
        const dashboardPath = userProfile
            ? getDashboardPath(userProfile.role)
            : '/user-dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    return <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-premium-gradient">
                    <Navbar />

                    {/* Toast notifications */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#ffffff',
                                color: '#1e293b',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                borderRadius: '16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                fontFamily: 'Inter, sans-serif',
                                padding: '12px 16px',
                            },
                        }}
                    />

                    <AnimatePresence mode="wait">
                        <Routes>
                            {/* Smart root redirect */}
                            <Route path="/" element={<SmartRedirect />} />

                            {/* Public routes — redirect if already authenticated */}
                            <Route
                                path="/login"
                                element={
                                    <RedirectIfAuth>
                                        <Login />
                                    </RedirectIfAuth>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <RedirectIfAuth>
                                        <Register />
                                    </RedirectIfAuth>
                                }
                            />

                            {/* User dashboard */}
                            <Route
                                path="/user-dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['user']}>
                                        <UserDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Provider dashboard */}
                            <Route
                                path="/provider-dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['provider']}>
                                        <ProviderDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin dashboard */}
                            <Route
                                path="/admin-dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch-all → redirect to root */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
