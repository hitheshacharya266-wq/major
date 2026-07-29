/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication and optional role checks.
 * - Redirects unauthenticated users to /login
 * - Redirects users with wrong role to their correct dashboard
 * - Shows a loading spinner while auth state resolves
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPath } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, userProfile, loading } = useAuth();

    // Show loading spinner while auth state resolves
    if (loading) {
        return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
    }

    // Not logged in → redirect to login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Role check — redirect to the correct dashboard if role doesn't match
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        return <Navigate to={getDashboardPath(userProfile.role)} replace />;
    }

    return children;
};

export default ProtectedRoute;
