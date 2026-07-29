/**
 * Provider Dashboard
 *
 * Service providers can view incoming requests, accept/reject bookings,
 * update job status, and toggle their availability.
 * Features:
 * - Dark gradient theme with glassmorphism cards
 * - Toast notifications for status updates
 * - Page transition animation
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    getBookingsByProvider,
    updateBookingStatus,
    getProviderProfile,
    updateProviderAvailability
} from '../firebase/firestoreService';
import { STATUS_STYLES, formatDate, SERVICE_CATEGORIES } from '../utils/helpers';
import { Check, X, Clock, CheckCircle, ToggleLeft, ToggleRight, Inbox } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

const ProviderDashboard = () => {
    const { currentUser } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [provider, setProvider] = useState(null);
    const [filter, setFilter] = useState('all'); // all | pending | accepted | completed
    const [loading, setLoading] = useState(true);

    // Fetch provider profile and bookings
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const [profile, bks] = await Promise.all([
                    getProviderProfile(currentUser.uid),
                    getBookingsByProvider(currentUser.uid)
                ]);
                setProvider(profile);
                setBookings(bks);
            } catch (err) {
                console.error('Failed to load provider data:', err);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    // Handle status update
    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await updateBookingStatus(bookingId, newStatus);
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
            );
            const messages = {
                accepted: 'Booking accepted ✓',
                rejected: 'Booking rejected',
                completed: 'Job marked as completed ✓'
            };
            toast.success(messages[newStatus] || 'Status updated');
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Failed to update booking status');
        }
    };

    // Toggle availability
    const handleToggleAvailability = async () => {
        if (!provider) return;
        try {
            const newValue = !provider.available;
            await updateProviderAvailability(currentUser.uid, newValue);
            setProvider(prev => ({ ...prev, available: newValue }));
            toast.success(newValue ? 'You are now available' : 'You are now unavailable');
        } catch (err) {
            console.error('Failed to toggle availability:', err);
            toast.error('Failed to update availability');
        }
    };

    // Filter bookings
    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const category = SERVICE_CATEGORIES.find(c => c.id === provider?.category);

    // Stats
    const stats = {
        pending: bookings.filter(b => b.status === 'pending').length,
        accepted: bookings.filter(b => b.status === 'accepted').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading provider dashboard..." />;
    }

    return (
        <PageTransition>
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
                {/* Background orbs */}
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {category?.emoji} {provider?.name || 'Provider'}
                            </h1>
                            <p className="text-slate-400 mt-1">
                                {category?.label} • Rating: {provider?.rating?.toFixed(1) || '0.0'} ⭐ ({provider?.ratingCount || 0} reviews)
                            </p>
                        </div>

                        {/* Availability toggle */}
                        <button
                            onClick={handleToggleAvailability}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${provider?.available
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                                    : 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                                }`}
                        >
                            {provider?.available ? (
                                <><ToggleRight className="w-5 h-5" /> Available</>
                            ) : (
                                <><ToggleLeft className="w-5 h-5" /> Unavailable</>
                            )}
                        </button>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                                    <p className="text-sm text-slate-400">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.accepted}</p>
                                    <p className="text-sm text-slate-400">In Progress</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.completed}</p>
                                    <p className="text-sm text-slate-400">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['all', 'pending', 'accepted', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f
                                        ? 'bg-white text-slate-900 shadow-lg'
                                        : 'glass text-slate-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {f === 'all' ? 'All Requests' : f}
                                {f !== 'all' && ` (${stats[f] || 0})`}
                            </button>
                        ))}
                    </div>

                    {/* Bookings list */}
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="glass-card inline-block p-8">
                                <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                                <p className="text-lg text-slate-300">No {filter === 'all' ? '' : filter} requests.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="glass-card p-5 hover:bg-white/8 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[booking.status]}`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {formatDate(booking.timestamp)}
                                                </span>
                                            </div>
                                            <p className="font-semibold text-white">
                                                Customer: {booking.userName || booking.userId}
                                            </p>
                                            {booking.notes && (
                                                <p className="text-sm text-slate-400">"{booking.notes}"</p>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                                                        className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                                    >
                                                        <Check className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                                        className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-red-500/20 active:scale-95"
                                                    >
                                                        <X className="w-4 h-4" /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'accepted' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Mark Completed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default ProviderDashboard;
