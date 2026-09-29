import React from 'react';

/**
 * Category Icon / Emoji Map
 */
const CATEGORY_BADGES = {
    electrician: { icon: '⚡', label: 'Electrician' },
    plumber: { icon: '🚰', label: 'Plumber' },
    carpenter: { icon: '🪵', label: 'Carpenter' },
    mechanic: { icon: '🔧', label: 'Mechanic' },
    cleaning: { icon: '🧹', label: 'Cleaning' },
    ac_repair: { icon: '❄️', label: 'AC Repair' },
    painter: { icon: '🎨', label: 'Painter' },
    appliance: { icon: '🔌', label: 'Appliance Repair' }
};

/**
 * Male Professional Character SVG
 */
const MaleAvatarSVG = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background gradient circle */}
        <circle cx="60" cy="60" r="56" fill="url(#male-avatar-grad)" stroke="#004d4c" strokeWidth="2" strokeOpacity="0.15" />
        <defs>
            <linearGradient id="male-avatar-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E6F4F1" />
                <stop offset="1" stopColor="#CBE8E2" />
            </linearGradient>
        </defs>

        {/* Neck */}
        <rect x="52" y="66" width="16" height="18" rx="4" fill="#F3D3BD" />

        {/* Shirt / Apron (ServiceHub Primary Teal) */}
        <path d="M28 108C28 88.67 41.43 78 60 78C78.57 78 92 88.67 92 108V114H28V108Z" fill="#004d4c" />
        <path d="M52 78L60 92L68 78H52Z" fill="#FFFFFF" fillOpacity="0.9" />
        <path d="M60 92V108" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />

        {/* Face */}
        <ellipse cx="60" cy="54" rx="22" ry="24" fill="#F6DBC4" />

        {/* Ears */}
        <circle cx="37" cy="55" r="4.5" fill="#F3D3BD" />
        <circle cx="83" cy="55" r="4.5" fill="#F3D3BD" />

        {/* Eyes */}
        <circle cx="51" cy="51" r="2.5" fill="#2D3748" />
        <circle cx="69" cy="51" r="2.5" fill="#2D3748" />
        <circle cx="52" cy="50" r="0.8" fill="#FFFFFF" />
        <circle cx="70" cy="50" r="0.8" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M47 45C49 43.5 54 44 55 45.5" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />
        <path d="M73 45C71 43.5 66 44 65 45.5" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />

        {/* Friendly Smile */}
        <path d="M52 61C55 65 65 65 68 61" stroke="#C57B57" strokeWidth="2.5" strokeLinecap="round" />

        {/* Male Hair Style */}
        <path d="M38 48C36 34 46 26 60 26C74 26 84 34 82 48C78 40 70 34 60 34C50 34 42 40 38 48Z" fill="#2D3748" />
        <path d="M38 48C40 40 48 35 60 35C70 35 78 39 82 48C84 42 80 30 60 30C42 30 37 40 38 48Z" fill="#1A202C" />
    </svg>
);

/**
 * Female Professional Character SVG
 */
const FemaleAvatarSVG = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background gradient circle */}
        <circle cx="60" cy="60" r="56" fill="url(#female-avatar-grad)" stroke="#004d4c" strokeWidth="2" strokeOpacity="0.15" />
        <defs>
            <linearGradient id="female-avatar-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F0FDF4" />
                <stop offset="1" stopColor="#D1FAE5" />
            </linearGradient>
        </defs>

        {/* Female Hair Back / Ponytail */}
        <path d="M32 52C30 70 36 86 44 92H76C84 86 90 70 88 52C88 32 75 24 60 24C45 24 32 32 32 52Z" fill="#332A24" />

        {/* Neck */}
        <rect x="53" y="66" width="14" height="18" rx="4" fill="#F6DBC4" />

        {/* Shirt / Apron (ServiceHub Primary Teal) */}
        <path d="M30 108C30 88.67 42.43 78 60 78C77.57 78 90 88.67 90 108V114H30V108Z" fill="#004d4c" />
        <path d="M53 78L60 90L67 78H53Z" fill="#FFFFFF" fillOpacity="0.9" />

        {/* Face */}
        <ellipse cx="60" cy="54" rx="20" ry="23" fill="#FDE2D1" />

        {/* Ears */}
        <circle cx="39" cy="55" r="4" fill="#F6DBC4" />
        <circle cx="81" cy="55" r="4" fill="#F6DBC4" />

        {/* Eyes */}
        <circle cx="51" cy="51" r="2.5" fill="#2D3748" />
        <circle cx="69" cy="51" r="2.5" fill="#2D3748" />
        <circle cx="52" cy="50" r="0.8" fill="#FFFFFF" />
        <circle cx="70" cy="50" r="0.8" fill="#FFFFFF" />

        {/* Eyelashes */}
        <path d="M47 48L49 46" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M73 48L71 46" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />

        {/* Eyebrows */}
        <path d="M47 45C49 44 53 44.5 55 45.5" stroke="#4A3B32" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M73 45C71 44 67 44.5 65 45.5" stroke="#4A3B32" strokeWidth="1.8" strokeLinecap="round" />

        {/* Friendly Smile */}
        <path d="M53 61C56 65 64 65 67 61" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />

        {/* Female Front Hair (Neat Bob/Bangs) */}
        <path d="M38 46C36 34 46 25 60 25C74 25 84 34 82 46C76 38 68 33 60 33C52 33 44 38 38 46Z" fill="#4A3B32" />
        <path d="M38 46C40 38 48 34 60 34C72 34 80 38 82 46C83 40 78 28 60 28C42 28 37 40 38 46Z" fill="#332A24" />
    </svg>
);

/**
 * ProviderAvatar Component
 * 
 * Renders an illustrated Male or Female character avatar based on explicit gender selection,
 * or falls back to initials avatar if gender is missing or not set.
 * Includes optional subtle category badge overlay.
 * 
 * @param {string} name - Full Name / Business Name
 * @param {string} gender - Explicit gender ("male" | "female")
 * @param {string} category - Service Category ID (e.g. "electrician")
 * @param {string} photoURL - Persistent HTTPS image URL (optional)
 * @param {string} size - Avatar size preset: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
 * @param {boolean} showCategoryBadge - Whether to overlay small category badge
 * @param {string} className - Optional container styling
 */
const ProviderAvatar = ({
    name = 'Provider',
    gender,
    category,
    photoURL,
    size = 'md',
    showCategoryBadge = false,
    className = ''
}) => {
    const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'P';
    const normGender = String(gender || '').trim().toLowerCase();
    const hasPhoto = photoURL && typeof photoURL === 'string' && (photoURL.startsWith('http://') || photoURL.startsWith('https://'));
    const categoryInfo = CATEGORY_BADGES[category] || null;

    const sizeClasses = {
        xs: 'w-8 h-8 rounded-lg text-xs font-black',
        sm: 'w-10 h-10 rounded-xl text-sm font-black',
        md: 'w-12 h-12 rounded-2xl text-base font-black',
        lg: 'w-16 h-16 rounded-2xl text-xl font-black',
        xl: 'w-28 h-28 sm:w-36 sm:h-36 rounded-3xl text-3xl sm:text-4xl font-black',
        '2xl': 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl text-4xl sm:text-5xl font-black'
    };

    const containerSizeClass = sizeClasses[size] || sizeClasses.md;

    // Render logic:
    // 1. If persistent HTTP photoURL exists, render real photo.
    // 2. If gender === 'male', render MaleAvatarSVG.
    // 3. If gender === 'female', render FemaleAvatarSVG.
    // 4. Fallback: Render clean initials avatar.

    const renderContent = () => {
        if (hasPhoto) {
            return (
                <img
                    src={photoURL}
                    alt={name}
                    className="w-full h-full object-cover rounded-[inherit]"
                />
            );
        }

        if (normGender === 'male') {
            return <MaleAvatarSVG />;
        }

        if (normGender === 'female') {
            return <FemaleAvatarSVG />;
        }

        return (
            <div className="w-full h-full bg-primary text-on-primary font-black flex items-center justify-center rounded-[inherit] tracking-tight select-none">
                {initial}
            </div>
        );
    };

    return (
        <div
            className={`relative shrink-0 flex items-center justify-center p-0.5 bg-white border border-outline-variant/30 shadow-sm ${containerSizeClass} ${className}`}
            title={`${name} (${gender || 'Provider'})`}
        >
            {renderContent()}

            {/* Optional Category Badge Overlay */}
            {showCategoryBadge && categoryInfo && (
                <span
                    className="absolute -bottom-1 -right-1 bg-white text-on-surface text-[11px] sm:text-xs font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md border border-outline-variant/40"
                    title={categoryInfo.label}
                >
                    {categoryInfo.icon}
                </span>
            )}
        </div>
    );
};

export default ProviderAvatar;
