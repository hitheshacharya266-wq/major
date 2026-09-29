import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/authService';
import { subscribeToUserNotifications } from '../firebase/firestoreService';
import { getDashboardPath } from '../utils/helpers';
import {
    Wrench, Menu, X, User, LogOut,
    LayoutDashboard, ChevronDown, Bell, Settings
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
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    useEffect(() => {
        if (!currentUser) {
            setUnreadCount(0);
            return;
        }
        const unsubscribe = subscribeToUserNotifications(
            currentUser.uid,
            (notifs) => {
                const count = (notifs || []).filter(n => !n.read).length;
                setUnreadCount(count);
            }
        );
        return () => unsubscribe();
    }, [currentUser]);

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

    return (
        <header className="sticky top-0 w-full z-50 bg-white/90 dark:bg-surface-container/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
            <nav className="max-w-container-max mx-auto px-4 sm:px-8 h-16 sm:h-18 flex justify-between items-center">
                {/* Brand Logo & Navigation Links */}
                <div className="flex items-center gap-6 lg:gap-10">
                    <Link to="/" className="font-extrabold text-xl sm:text-2xl text-primary tracking-tight flex items-center gap-2">
                        <span>ServiceHub</span>
                    </Link>

                    {/* Show Application Navigation Links only when NOT on minimal Auth screens */}
                    {!isAuthPage && (
                        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-bold">
                            <Link
                                to="/"
                                className={`transition-colors cursor-pointer py-1 ${location.pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/search"
                                className={`transition-colors cursor-pointer py-1 ${location.pathname === '/search' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                            >
                                Services
                            </Link>
                            <Link
                                to="/help"
                                className={`transition-colors cursor-pointer py-1 ${location.pathname === '/help' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                            >
                                Help
                            </Link>
                            {currentUser && (
                                <Link
                                    to={getDashboardPath(role)}
                                    className={`transition-colors cursor-pointer py-1 ${location.pathname.includes('dashboard') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Action Items */}
                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    {/* Location Badge / Selector */}
                    {!isAuthPage && (
                        <div className="hidden md:flex items-center gap-1.5 bg-surface-container/70 px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-surface-container transition-colors shrink-0">
                            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-bold text-on-surface-variant cursor-pointer"
                            >
                                <option value="Mangaluru">Mangaluru</option>
                                <option value="Hassan">Hassan</option>
                                <option value="Udupi">Udupi</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {currentUser ? (
                            <>
                                <Link
                                    to="/notifications"
                                    className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors relative"
                                    title="Notifications"
                                >
                                    <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-secondary text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center px-1">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center cursor-pointer"
                                        title="User Profile Menu"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-black text-sm flex items-center justify-center shadow-xs">
                                            {initial}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-64 bg-white border border-outline-variant/40 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/50">
                                                    <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                                                    <p className="text-xs text-on-surface-variant truncate">{currentUser.email}</p>
                                                    <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-md bg-secondary-container/40 text-secondary text-[10px] font-extrabold uppercase tracking-wider">
                                                        {role || 'User'}
                                                    </span>
                                                </div>

                                                <div className="p-1.5 space-y-0.5 text-xs font-semibold">
                                                    <Link to={getDashboardPath(role)} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                                                        <LayoutDashboard className="w-4 h-4 text-primary shrink-0" /> Dashboard
                                                    </Link>
                                                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                                                        <User className="w-4 h-4 text-primary shrink-0" /> Account Profile
                                                    </Link>
                                                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                                                        <Settings className="w-4 h-4 text-primary shrink-0" /> Settings
                                                    </Link>
                                                </div>

                                                <div className="p-1 border-t border-outline-variant/20 mt-1">
                                                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                                        <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                <Link to="/login" className="text-xs sm:text-sm font-bold text-on-surface-variant hover:text-primary transition-colors px-2 py-1.5 shrink-0">
                                    Sign In
                                </Link>
                                <Link to="/register" className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0">
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile Drawer Toggle Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Toggle navigation menu"
                        >
                            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">{mobileOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden border-t border-outline-variant/30 bg-white"
                    >
                        <div className="px-6 py-4 space-y-2 font-bold text-sm">
                            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2.5 text-on-surface hover:text-primary border-b border-outline-variant/10">Home</Link>
                            <Link to="/search" onClick={() => setMobileOpen(false)} className="block py-2.5 text-on-surface hover:text-primary border-b border-outline-variant/10">Services</Link>
                            <Link to="/help" onClick={() => setMobileOpen(false)} className="block py-2.5 text-on-surface hover:text-primary border-b border-outline-variant/10">Help Center</Link>

                            {currentUser ? (
                                <>
                                    <Link to={getDashboardPath(role)} onClick={() => setMobileOpen(false)} className="block py-2.5 text-primary font-extrabold border-b border-outline-variant/10">Dashboard</Link>
                                    <button onClick={handleLogout} className="w-full text-left py-2.5 text-red-600 font-extrabold cursor-pointer">Sign Out</button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-3 pb-1">
                                    <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-center font-extrabold bg-surface-container rounded-xl text-on-surface">Sign In</Link>
                                    <Link to="/register" onClick={() => setMobileOpen(false)} className="py-2.5 text-center font-extrabold bg-primary text-white rounded-xl">Register</Link>
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
