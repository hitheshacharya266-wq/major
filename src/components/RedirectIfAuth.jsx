/**
 * RedirectIfAuth Component
 *
 * Wraps public-only routes (Login, Register).
 * If the user is already authenticated, redirects them to their
 * role-based dashboard instead of showing the auth page.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPath } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const RedirectIfAuth = ({ children }) => {
    const { currentUser, userProfile, loading } = useAuth();

    // Wait for auth state to resolve
    if (loading) {
        return <LoadingSpinner fullScreen text="Checking authentication..." />;
    }

    // Already logged in → send to dashboard
    // Redirect even if userProfile hasn't loaded (fallback to user-dashboard)
    if (currentUser) {
        const dashboardPath = userProfile
            ? getDashboardPath(userProfile.role)
            : '/user-dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    // Not logged in → show the auth page
    return children;
};

export default RedirectIfAuth;
