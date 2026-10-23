/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication and optional role checks.
 * - Redirects unauthenticated users to /login
 * - Redirects users with wrong role to their correct dashboard
 * - Shows a loading spinner while auth state resolves
 */
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPath } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, userProfile, isAdmin, loading } = useAuth();

    // Show loading spinner while auth state resolves
    if (loading) {
        return <LoadingSpinner fullScreen text="Validating authorization..." />;
    }

    // Not logged in → redirect to login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Explicit Admin Route Check
    if (allowedRoles && allowedRoles.includes('admin')) {
        if (!isAdmin) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-surface px-4">
                    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-outline-variant/40 shadow-xl text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs border border-red-100">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-on-surface">Access Denied</h2>
                        <p className="text-sm text-on-surface-variant">
                            This protected administrative section requires verified administrator authorization or custom claims.
                        </p>
                        <div className="pt-2">
                            <Link
                                to={getDashboardPath(userProfile?.role)}
                                className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                            >
                                <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
        return children;
    }

    // Role check for non-admin routes — redirect to the correct dashboard if role doesn't match
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        return <Navigate to={getDashboardPath(userProfile.role)} replace />;
    }

    return children;
};

export default ProtectedRoute;
