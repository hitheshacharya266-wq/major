/**
 * Utility helpers shared across the app
 */

/** Service categories with display info */
export const SERVICE_CATEGORIES = [
    { id: 'electrician', label: 'Electrical Services', emoji: '⚡', icon: 'electrical_services' },
    { id: 'plumber', label: 'Plumbing', emoji: '🔧', icon: 'plumbing' },
    { id: 'cleaning', label: 'Home Cleaning', emoji: '🧹', icon: 'cleaning_services' },
    { id: 'ac_repair', label: 'AC Repair & Install', emoji: '❄️', icon: 'ac_unit' },
    { id: 'carpenter', label: 'Carpentry', emoji: '🪚', icon: 'construction' },
    { id: 'painter', label: 'Painting', emoji: '🎨', icon: 'format_paint' },
    { id: 'appliance_repair', label: 'Appliance Repair', emoji: '🔌', icon: 'home_repair_service' },
    { id: 'computer_repair', label: 'Computer & Laptop', emoji: '💻', icon: 'computer' },
    { id: 'mobile_repair', label: 'Mobile Repair', emoji: '📱', icon: 'smartphone' },
    { id: 'photography', label: 'Photography & Video', emoji: '📸', icon: 'photo_camera' },
    { id: 'salon_grooming', label: 'Salon & Grooming', emoji: '✂️', icon: 'content_cut' },
    { id: 'mechanic', label: 'Vehicle & Bike Repair', emoji: '🔩', icon: 'car_repair' },
    { id: 'gardening', label: 'Gardening & Lawns', emoji: '🌱', icon: 'yard' },
    { id: 'pest_control', label: 'Pest Control', emoji: '🦟', icon: 'pest_control' },
    { id: 'packers_movers', label: 'Packers & Movers', emoji: '📦', icon: 'local_shipping' },
    { id: 'interior_design', label: 'Interior Design', emoji: '🛋️', icon: 'deck' },
    { id: 'fitness_trainer', label: 'Fitness & Gym', emoji: '🏋️', icon: 'fitness_center' },
    { id: 'tutoring', label: 'Tutoring & Academics', emoji: '📚', icon: 'school' },
    { id: 'laundry', label: 'Laundry & Ironing', emoji: '🧺', icon: 'local_laundry_service' },
    { id: 'handyman', label: 'Handyman Services', emoji: '🛠️', icon: 'handyman' },
];

/** Category alias map for normalization (case-insensitive, handles plural/singular/aliases) */
const CATEGORY_ALIASES = {
    // 1. Electrician
    'electrician': 'electrician',
    'electricians': 'electrician',
    'electrical': 'electrician',
    'electrical services': 'electrician',
    'electricity': 'electrician',
    'wiring': 'electrician',
    'wireman': 'electrician',

    // 2. Plumber
    'plumber': 'plumber',
    'plumbers': 'plumber',
    'plumbing': 'plumber',
    'plumbing services': 'plumber',
    'sanitary': 'plumber',
    'pipe': 'plumber',
    'pipes': 'plumber',

    // 3. Home Cleaning
    'cleaning': 'cleaning',
    'cleaner': 'cleaning',
    'cleaners': 'cleaning',
    'home cleaning': 'cleaning',
    'deep cleaning': 'cleaning',
    'house cleaning': 'cleaning',
    'sanitization': 'cleaning',

    // 4. AC Repair
    'ac': 'ac_repair',
    'ac_repair': 'ac_repair',
    'ac-repair': 'ac_repair',
    'ac repair': 'ac_repair',
    'acrepair': 'ac_repair',
    'ac repair & install': 'ac_repair',
    'air conditioner': 'ac_repair',
    'air conditioning': 'ac_repair',
    'hvac': 'ac_repair',
    'air cooler': 'ac_repair',

    // 5. Carpenter
    'carpenter': 'carpenter',
    'carpenters': 'carpenter',
    'carpentry': 'carpenter',
    'woodwork': 'carpenter',
    'furniture': 'carpenter',

    // 6. Painter
    'painter': 'painter',
    'painters': 'painter',
    'painting': 'painter',
    'wall painting': 'painter',
    'whitewash': 'painter',

    // 7. Appliance Repair
    'appliance': 'appliance_repair',
    'appliances': 'appliance_repair',
    'appliance repair': 'appliance_repair',
    'appliance_repair': 'appliance_repair',
    'fridge': 'appliance_repair',
    'refrigerator': 'appliance_repair',
    'washing machine': 'appliance_repair',
    'microwave': 'appliance_repair',
    'water purifier': 'appliance_repair',
    'ro repair': 'appliance_repair',

    // 8. Computer & Laptop Repair
    'computer': 'computer_repair',
    'computer repair': 'computer_repair',
    'computer_repair': 'computer_repair',
    'laptop': 'computer_repair',
    'laptop repair': 'computer_repair',
    'pc': 'computer_repair',
    'pc repair': 'computer_repair',
    'computer & laptop': 'computer_repair',

    // 9. Mobile Phone Repair
    'mobile': 'mobile_repair',
    'mobile repair': 'mobile_repair',
    'mobile_repair': 'mobile_repair',
    'phone': 'mobile_repair',
    'phone repair': 'mobile_repair',
    'smartphone': 'mobile_repair',
    'tablet': 'mobile_repair',
    'screen repair': 'mobile_repair',

    // 10. Photography & Videography
    'photography': 'photography',
    'photographer': 'photography',
    'photographers': 'photography',
    'videography': 'photography',
    'videographer': 'photography',
    'photo': 'photography',
    'photos': 'photography',
    'photography & video': 'photography',

    // 11. Salon & Grooming
    'salon': 'salon_grooming',
    'salon & grooming': 'salon_grooming',
    'salon_grooming': 'salon_grooming',
    'grooming': 'salon_grooming',
    'haircut': 'salon_grooming',
    'makeup': 'salon_grooming',
    'beautician': 'salon_grooming',
    'barber': 'salon_grooming',
    'beauty parlor': 'salon_grooming',

    // 12. Mechanic / Vehicle & Bike
    'mechanic': 'mechanic',
    'mechanics': 'mechanic',
    'mechanical': 'mechanic',
    'auto': 'mechanic',
    'automobile': 'mechanic',
    'vehicle repair': 'mechanic',
    'bike': 'mechanic',
    'bike repair': 'mechanic',
    'motorcycle': 'mechanic',
    'car repair': 'mechanic',
    'garage': 'mechanic',
    'vehicle & bike repair': 'mechanic',

    // 13. Gardening & Landscaping
    'gardening': 'gardening',
    'gardener': 'gardening',
    'garden': 'gardening',
    'landscaping': 'gardening',
    'lawn': 'gardening',
    'gardening & lawns': 'gardening',
    'plants': 'gardening',

    // 14. Pest Control
    'pest': 'pest_control',
    'pest_control': 'pest_control',
    'pest-control': 'pest_control',
    'pest control': 'pest_control',
    'pestcontrol': 'pest_control',
    'termite': 'pest_control',
    'fumigation': 'pest_control',

    // 15. Packers & Movers
    'packers': 'packers_movers',
    'movers': 'packers_movers',
    'packers_movers': 'packers_movers',
    'packers & movers': 'packers_movers',
    'packers and movers': 'packers_movers',
    'moving': 'packers_movers',
    'shifting': 'packers_movers',
    'home shifting': 'packers_movers',
    'relocation': 'packers_movers',

    // 16. Interior Design
    'interior': 'interior_design',
    'interiors': 'interior_design',
    'interior design': 'interior_design',
    'interior_design': 'interior_design',
    'interior designer': 'interior_design',
    'home decor': 'interior_design',
    'renovation': 'interior_design',

    // 17. Fitness & Gym
    'fitness': 'fitness_trainer',
    'fitness trainer': 'fitness_trainer',
    'fitness_trainer': 'fitness_trainer',
    'fitness & gym': 'fitness_trainer',
    'gym': 'fitness_trainer',
    'personal trainer': 'fitness_trainer',
    'workout': 'fitness_trainer',
    'trainer': 'fitness_trainer',

    // 18. Tutoring & Academics
    'tutor': 'tutoring',
    'tutoring': 'tutoring',
    'tutors': 'tutoring',
    'tuition': 'tutoring',
    'teacher': 'tutoring',
    'tutoring & academics': 'tutoring',
    'maths tutor': 'tutoring',
    'academics': 'tutoring',

    // 19. Laundry & Ironing
    'laundry': 'laundry',
    'laundry & ironing': 'laundry',
    'ironing': 'laundry',
    'dry cleaning': 'laundry',
    'dry clean': 'laundry',
    'washing': 'laundry',
    'clothes cleaning': 'laundry',

    // 20. Handyman & Maintenance
    'handyman': 'handyman',
    'handymen': 'handyman',
    'handyman services': 'handyman',
    'home maintenance': 'handyman',
    'repair': 'handyman',
    'general maintenance': 'handyman',
    'maintenance': 'handyman',
};

/**
 * Normalizes any category string (ID, label, plural, alias, with spaces/dashes) to canonical ID.
 * @param {string} cat - Category string
 * @returns {string} canonical category ID
 */
export const normalizeCategory = (cat) => {
    if (!cat) return '';
    const cleaned = String(cat).trim().toLowerCase().replace(/[-_\s]+/g, ' ');
    if (CATEGORY_ALIASES[cleaned]) return CATEGORY_ALIASES[cleaned];
    const withUnderscore = cleaned.replace(/\s+/g, '_');
    if (CATEGORY_ALIASES[withUnderscore]) return CATEGORY_ALIASES[withUnderscore];
    const found = SERVICE_CATEGORIES.find(c =>
        c.id.toLowerCase() === cleaned ||
        c.label.toLowerCase() === cleaned ||
        c.id.toLowerCase() === withUnderscore
    );
    return found ? found.id : withUnderscore;
};

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

/** Format a numeric price to INR currency string (e.g. 399 -> ₹399, null -> "Price not set") */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '' || isNaN(amount)) {
        return 'Price not set';
    }
    const num = Number(amount);
    if (num <= 0) return 'Price not set';
    return `₹${num.toLocaleString('en-IN')}`;
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
