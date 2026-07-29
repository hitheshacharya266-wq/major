import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/authService';
import { getDashboardPath } from '../utils/helpers';
import {
    Wrench, Menu, X, Search, MapPin, User, LogOut,
    LayoutDashboard, Shield, ChevronDown, Bell, HelpCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [city, setCity] = useState('Mangaluru');
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logoutUser();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to logout');
        }
        setMobileOpen(false);
        setProfileOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const role = userProfile?.role;
    const displayName = userProfile?.fullName || userProfile?.name || currentUser?.displayName || 'User';
    const initial = displayName?.charAt(0)?.toUpperCase() || 'U';

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`);
        }
    };

    return (
        <header className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all">
            <nav className="max-w-container-max mx-auto px-6 lg:px-8 h-16 flex justify-between items-center">
                {/* Logo & Navigation Links */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-on-surface">Service<span className="text-primary">Hub</span></span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
                        <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
                            Home
                        </Link>
                        <Link to="/search" className={`transition-colors ${location.pathname === '/search' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
                            Services
                        </Link>
                        <Link to="/help" className={`transition-colors ${location.pathname === '/help' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
                            Help
                        </Link>
                        {currentUser && (
                            <Link to={getDashboardPath(role)} className={`transition-colors ${location.pathname.includes('dashboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>

                {/* Location Picker & Profile / Auth CTAs */}
                <div className="flex items-center gap-4">
                    {/* Location selector pill */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-surface-container px-3.5 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-transparent border-none outline-none font-semibold text-on-surface cursor-pointer text-xs pr-1"
                        >
                            <option value="Mangaluru">Mangaluru</option>
                            <option value="Udupi">Udupi</option>
                            <option value="Hassan">Hassan</option>
                        </select>
                    </div>

                    {currentUser ? (
                        <div className="flex items-center gap-3">
                            <Link to="/notifications" className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-surface" />
                            </Link>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
                                >
                                    <div className="w-9 h-9 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center shadow-md shadow-primary/20">
                                        {initial}
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-60 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/50">
                                                <p className="text-sm font-bold text-on-surface">{displayName}</p>
                                                <p className="text-xs text-on-surface-variant truncate">{currentUser.email}</p>
                                                <span className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-secondary-container/40 text-secondary text-[10px] font-bold uppercase tracking-wider">
                                                    {role || 'User'}
                                                </span>
                                            </div>

                                            <div className="p-1 space-y-0.5 text-sm font-medium">
                                                <Link to={getDashboardPath(role)} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                                                    <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                                                </Link>
                                                <Link to="/my-bookings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                                                    <Wrench className="w-4 h-4 text-primary" /> My Bookings
                                                </Link>
                                                <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                                                    <User className="w-4 h-4 text-primary" /> Account Profile
                                                </Link>
                                            </div>

                                            <div className="p-1 border-t border-outline-variant/20 mt-1">
                                                <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                                                    <LogOut className="w-4 h-4" /> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-semibold text-on-surface-variant hover:text-primary px-3 py-2 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="text-sm font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95">
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-outline-variant/30 bg-surface-container-lowest"
                    >
                        <div className="px-6 py-4 space-y-3 font-semibold text-sm">
                            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-on-surface hover:text-primary">Home</Link>
                            <Link to="/search" onClick={() => setMobileOpen(false)} className="block py-2 text-on-surface hover:text-primary">Services</Link>
                            <Link to="/help" onClick={() => setMobileOpen(false)} className="block py-2 text-on-surface hover:text-primary">Help & Support</Link>

                            {currentUser ? (
                                <>
                                    <Link to={getDashboardPath(role)} onClick={() => setMobileOpen(false)} className="block py-2 text-primary">Dashboard</Link>
                                    <button onClick={handleLogout} className="w-full text-left py-2 text-red-600 font-bold">Sign Out</button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-center font-bold bg-surface-container rounded-xl text-on-surface">Sign In</Link>
                                    <Link to="/register" onClick={() => setMobileOpen(false)} className="py-2.5 text-center font-bold bg-primary text-white rounded-xl">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
