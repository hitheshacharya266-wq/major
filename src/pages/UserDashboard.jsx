/**
 * User Dashboard — Urban Company Inspired
 *
 * Premium light theme with:
 * - Hero section with service heading
 * - "What are you looking for?" category grid
 * - Browse providers by category
 * - Booking history tab
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    getProvidersByCategory,
    getAllProviders,
    createBooking,
    getBookingsByUser
} from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import ServiceCard from '../components/ServiceCard';
import BookingModal from '../components/BookingModal';
import BookingCard from '../components/BookingCard';
import HeroSection from '../components/HeroSection';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import {
    Search, CalendarDays, LayoutGrid, TrendingUp, Clock,
    CheckCircle, Wrench, Zap, Hammer, Cog, Paintbrush,
    Droplets, Sparkles, ShieldCheck, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

/** Extended service categories with icons and colors for the grid */
const DISPLAY_CATEGORIES = [
    { id: 'plumber', label: 'Plumber', icon: Droplets, color: '#0284c7', bgColor: '#e0f2fe' },
    { id: 'electrician', label: 'Electrician', icon: Zap, color: '#d97706', bgColor: '#fef3c7' },
    { id: 'carpenter', label: 'Carpenter', icon: Hammer, color: '#7c3aed', bgColor: '#ede9fe' },
    { id: 'mechanic', label: 'Mechanic', icon: Cog, color: '#dc2626', bgColor: '#fee2e2' },
    { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: '#0d9488', bgColor: '#ccfbf1' },
    { id: 'painting', label: 'Painting & Makeover', icon: Paintbrush, color: '#c026d3', bgColor: '#fae8ff' },
    { id: 'all', label: 'All Services', icon: LayoutGrid, color: '#475569', bgColor: '#f1f5f9' },
];

const UserDashboard = () => {
    const { currentUser, userProfile } = useAuth();

    const [providers, setProviders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // null = show home
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingProvider, setBookingProvider] = useState(null);
    const [activeTab, setActiveTab] = useState('home'); // home | browse | bookings
    const [loading, setLoading] = useState(false);

    // Fetch providers when category is selected
    useEffect(() => {
        if (selectedCategory === null) return;
        const fetchProviders = async () => {
            setLoading(true);
            try {
                const data = selectedCategory === 'all'
                    ? await getAllProviders()
                    : await getProvidersByCategory(selectedCategory);
                setProviders(data);
            } catch (err) {
                console.error('Failed to fetch providers:', err);
                toast.error('Failed to load service providers');
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, [selectedCategory]);

    // Fetch user bookings
    useEffect(() => {
        const fetchBookings = async () => {
            if (!currentUser) return;
            try {
                const data = await getBookingsByUser(currentUser.uid);
                setBookings(data);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
            }
        };
        fetchBookings();
    }, [currentUser]);

    // Handle booking confirmation
    const handleBookService = async ({ notes }) => {
        if (!bookingProvider || !currentUser) return;
        try {
            await createBooking({
                userId: currentUser.uid,
                userName: userProfile?.fullName || userProfile?.name || currentUser.email,
                providerId: bookingProvider.uid,
                providerName: bookingProvider.name,
                serviceType: bookingProvider.category,
                notes: notes || ''
            });
            toast.success(`Booking confirmed with ${bookingProvider.name}!`);
            const updated = await getBookingsByUser(currentUser.uid);
            setBookings(updated);
            setBookingProvider(null);
            setActiveTab('bookings');
        } catch (err) {
            console.error('Booking failed:', err);
            toast.error('Failed to create booking');
        }
    };

    // Handle category click
    const handleCategoryClick = (catId) => {
        setSelectedCategory(catId);
        setActiveTab('browse');
    };

    // Go back to home
    const handleBackToHome = () => {
        setSelectedCategory(null);
        setActiveTab('home');
    };

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    return (
        <PageTransition>
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
                {/* ── HOME VIEW ── */}
                {activeTab === 'home' && (
                    <>
                        {/* Hero Section */}
                        <HeroSection>
                            <div className="glass-card p-8 sm:p-10 shadow-xl border border-white/50 max-w-4xl mx-auto">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                                    What are you looking for?
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {DISPLAY_CATEGORIES.map((cat, i) => (
                                        <ServiceCategoryCard
                                            key={cat.id}
                                            icon={cat.icon}
                                            label={cat.label}
                                            color={cat.color}
                                            bgColor={cat.bgColor}
                                            delay={i * 0.05}
                                            onClick={() => handleCategoryClick(cat.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </HeroSection>

                        {/* Stats Bar */}
                        <div className="bg-white border-y border-gray-100 shadow-sm">
                            <div className="main-container py-6">
                                <div className="flex flex-wrap gap-6 items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                                            <p className="text-xs text-gray-500">Bookings</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{stats.pending}</p>
                                            <p className="text-xs text-gray-500">Pending</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{stats.completed}</p>
                                            <p className="text-xs text-gray-500">Completed</p>
                                        </div>
                                    </div>
                                    {bookings.length > 0 && (
                                        <>
                                            <div className="ml-auto" />
                                            <button
                                                onClick={() => setActiveTab('bookings')}
                                                className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
                                            >
                                                View All Bookings →
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Why Choose Us */}
                        <div className="main-container py-20">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                    Why choose ServiceHub?
                                </h2>
                                <p className="text-gray-500 max-w-2xl mx-auto">Discover the benefits of professional, on-time, and guaranteed services at your doorstep.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div className="premium-card p-6 text-center">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Verified Pros</h3>
                                    <p className="text-sm text-gray-500">Background-checked and trained professionals</p>
                                </div>
                                <div className="premium-card p-6 text-center">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">On-Time Service</h3>
                                    <p className="text-sm text-gray-500">Punctual service at your preferred schedule</p>
                                </div>
                                <div className="premium-card p-6 text-center">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Quality Guaranteed</h3>
                                    <p className="text-sm text-gray-500">Satisfaction guaranteed on every service</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── BROWSE VIEW ── */}
                {activeTab === 'browse' && (
                    <div className="main-container py-12">
                        {/* Back + Title */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={handleBackToHome}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {selectedCategory === 'all' ? 'All Service Providers' :
                                        SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Service Providers'}
                                </h1>
                                <p className="text-sm text-gray-500">{filteredProviders.length} providers available</p>
                            </div>
                        </div>

                        {/* Search + Category Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search providers..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        selectedCategory === 'all'
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                    }`}
                                >All</button>
                                {SERVICE_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                            selectedCategory === cat.id
                                                ? 'bg-teal-600 text-white shadow-md'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                        }`}
                                    >{cat.emoji} {cat.label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Provider grid */}
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner size="lg" text="Loading providers..." />
                            </div>
                        ) : filteredProviders.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="premium-card inline-block p-8">
                                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-lg font-medium text-gray-700">No providers found</p>
                                    <p className="text-sm text-gray-400 mt-1">Try a different category or search term</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredProviders.map((provider) => (
                                    <ServiceCard
                                        key={provider.id}
                                        provider={provider}
                                        onBook={setBookingProvider}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── BOOKINGS VIEW ── */}
                {activeTab === 'bookings' && (
                    <div className="main-container py-12">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={handleBackToHome}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="premium-card inline-block p-8">
                                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-lg font-medium text-gray-700">No bookings yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Book a service to get started!</p>
                                    <button
                                        onClick={handleBackToHome}
                                        className="mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
                                    >
                                        Browse Services
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} showProvider />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Booking modal */}
                {bookingProvider && (
                    <BookingModal
                        provider={bookingProvider}
                        onConfirm={handleBookService}
                        onClose={() => setBookingProvider(null)}
                    />
                )}
            </div>
        </PageTransition>
    );
};

export default UserDashboard;
