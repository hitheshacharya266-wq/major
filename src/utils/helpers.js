/**
 * Utility helpers shared across the app
 */

/** Service categories with display info */
export const SERVICE_CATEGORIES = [
    { id: 'plumber', label: 'Plumber', emoji: '🔧' },
    { id: 'electrician', label: 'Electrician', emoji: '⚡' },
    { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
    { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
];

/** Booking status badge colors (Tailwind classes) */
export const STATUS_STYLES = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
};

/** Format a Firestore timestamp to a human-readable string */
export const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ─── New Utilities ────────────────────────────────────────

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {string} errorCode — e.g. "auth/email-already-in-use"
 * @returns {string} human-readable error message
 */
export const getFirebaseErrorMessage = (errorCode) => {
    const errorMap = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled. Contact support.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
        'auth/network-request-failed': 'Network error. Check your internet connection.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    };
    return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
};

/**
 * Returns the correct dashboard path for a given role.
 * @param {string} role — "user" | "provider" | "admin"
 * @returns {string} dashboard route path
 */
export const getDashboardPath = (role) => {
    switch (role) {
        case 'provider': return '/provider-dashboard';
        case 'admin': return '/admin-dashboard';
        default: return '/user-dashboard';
    }
};

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {string|null} error message or null if valid
 */
export const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    return null;
};

/**
 * Validates a password.
 * @param {string} password
 * @returns {string|null} error message or null if valid
 */
export const validatePassword = (password) => {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
};

/**
 * Validates a user's full name.
 * @param {string} name
 * @returns {string|null} error message or null if valid
 */
export const validateName = (name) => {
    if (!name.trim()) return 'Full name is required.';
    if (name.trim().length < 2) return 'Name must be at least 2 characters.';
    return null;
};
