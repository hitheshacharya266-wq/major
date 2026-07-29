/**
 * Navbar Component — Urban Company Inspired
 *
 * Premium responsive navbar with:
 * - Clean white background with subtle shadow
 * - Logo, nav links, search bar, location, and profile dropdown
 * - Mobile hamburger menu
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/authService';
import { getDashboardPath } from '../utils/helpers';
import {
    Wrench, Menu, X, Search, MapPin, User, LogOut,
    LayoutDashboard, Shield, ChevronDown, Bell
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

    // Close dropdown on outside click
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

    const isActive = (path) => location.pathname === path;

    /** Navigation links based on role */
    const getNavLinks = () => {
        if (!currentUser) return [];
        const links = [];
        if (role === 'user') {
            links.push({ to: '/user-dashboard', label: 'Home', icon: LayoutDashboard });
        }
        if (role === 'provider') {
            links.push({ to: '/provider-dashboard', label: 'Dashboard', icon: Wrench });
        }
        if (role === 'admin') {
            links.push({ to: '/admin-dashboard', label: 'Admin', icon: Shield });
        }
        return links;
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
            <div className="main-container">
                <div className="flex items-center justify-between h-20 gap-4">
                    {/* Logo */}
                    <Link
                        to={currentUser ? getDashboardPath(role) : '/'}
                        className="flex items-center gap-2.5 font-bold text-xl tracking-tight group shrink-0"
                    >
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center group-hover:bg-teal-700 transition-all duration-300 shadow-md shadow-teal-600/20 group-hover:shadow-teal-600/30 group-hover:scale-105">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-900 hidden sm:block">
                            Service<span className="text-teal-600">Hub</span>
                        </span>
                    </Link>

                    {/* DESKTOP: NAV LINKS & SEARCH */}
                    <div className="hidden md:flex items-center flex-1 justify-center max-w-2xl gap-6">
                        {/* Search Bar - Center aligned */}
                        {currentUser && (
                            <div className="nav-search flex items-center gap-3 px-4 py-2.5 w-full max-w-md group">
                                <Search className="w-4 h-4 text-gray-400 shrink-0 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for services..."
                                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* DESKTOP: ACTIONS & PROFILE */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        {currentUser && (
                            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                <span className="max-w-[100px] truncate">Bangalore</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        )}

                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                                </button>

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 p-1 rounded-full border-2 border-transparent hover:border-teal-100 transition-all"
                                    >
                                        <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white">
                                            {initial}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                                            >
                                                {/* Profile info */}
                                                <div className="px-4 py-4 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-sm font-bold text-gray-900">{displayName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{currentUser.email}</p>
                                                    <div className="mt-2 inline-flex px-2 py-0.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                                                        {role}
                                                    </div>
                                                </div>

                                                {/* Links */}
                                                <div className="p-1">
                                                    {getNavLinks().map((link) => (
                                                        <Link
                                                            key={link.to}
                                                            to={link.to}
                                                            onClick={() => setProfileOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                                <link.icon className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            {link.label}
                                                        </Link>
                                                    ))}
                                                </div>

                                                {/* Logout */}
                                                <div className="p-1 border-t border-gray-50 mt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all font-semibold"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                                            <LogOut className="w-4 h-4" />
                                                        </div>
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 active:scale-95">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
                    >
                        <div className="main-container py-6 space-y-4">
                            {currentUser ? (
                                <>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 mb-4">
                                        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm">
                                            {initial}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{displayName}</p>
                                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {getNavLinks().map((link) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-4 p-3.5 text-base font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-2xl transition-all"
                                            >
                                                <link.icon className="w-5 h-5" /> {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-4 w-full p-3.5 text-base font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all mt-4"
                                    >
                                        <LogOut className="w-5 h-5" /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center py-3.5 rounded-2xl text-base font-bold text-gray-700 bg-gray-50">Login</Link>
                                    <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center py-3.5 rounded-2xl text-base font-bold text-white bg-teal-600 shadow-lg shadow-teal-600/20">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
