import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    getBookingsByProvider,
    updateBookingStatus,
    getProviderProfile,
    updateProviderAvailability
} from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import {
    CheckCircle2, XCircle, Clock, MapPin, Wrench, ShieldCheck,
    ToggleLeft, ToggleRight, DollarSign, Award, Bell, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderDashboard = () => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [provider, setProvider] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const [profile, bks] = await Promise.all([
                    getProviderProfile(currentUser.uid),
                    getBookingsByProvider(currentUser.uid)
                ]);
                setProvider(profile || { name: 'Service Partner', available: true, category: 'plumber' });
                setBookings(bks || []);
            } catch {
                toast.error('Failed to load partner dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await updateBookingStatus(bookingId, newStatus);
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
            toast.success(`Booking ${newStatus} successfully!`);
        } catch {
            toast.error('Failed to update job status');
        }
    };

    const handleToggleAvailability = async () => {
        if (!provider || !currentUser) return;
        try {
            const newValue = !provider.available;
            await updateProviderAvailability(currentUser.uid, newValue);
            setProvider(prev => ({ ...prev, available: newValue }));
            toast.success(newValue ? 'You are now marked AVAILABLE' : 'You are marked OFF-DUTY');
        } catch {
            toast.error('Failed to toggle duty state');
        }
    };

    const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
    const catInfo = SERVICE_CATEGORIES.find(c => c.id === provider?.category);

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                {/* PARTNER HEADER */}
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-10 px-6 lg:px-8">
                    <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Partner Workstation</span>
                                <span className="bg-secondary-container/40 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified Partner
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-on-surface">{provider?.name || 'Service Partner'}</h1>
                            <p className="text-sm text-on-surface-variant">
                                Category: <span className="font-bold text-on-surface capitalize">{catInfo?.label || provider?.category || 'General'}</span>
                            </p>
                        </div>

                        {/* Availability Toggle Pill */}
                        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-xs">
                            <div>
                                <p className="text-xs font-bold text-on-surface">Duty Status</p>
                                <p className="text-[11px] text-on-surface-variant font-medium">
                                    {provider?.available ? 'Accepting new doorstep requests' : 'Currently Offline'}
                                </p>
                            </div>
                            <button
                                onClick={handleToggleAvailability}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${provider?.available ? 'bg-secondary text-white' : 'bg-outline-variant/40 text-on-surface-variant'}`}
                            >
                                {provider?.available ? 'ON DUTY ✓' : 'OFF DUTY'}
                            </button>
                        </div>
                    </div>
                </section>

                <main className="max-w-container-max mx-auto px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                    {/* STATS OVERVIEW */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
                                🔔
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{bookings.filter(b => b.status === 'pending').length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Pending Job Requests</p>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                                ⚡
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{bookings.filter(b => b.status === 'accepted').length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Active Accepted Jobs</p>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl">
                                💰
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">
                                    ₹{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 399), 0)}
                                </p>
                                <p className="text-xs text-on-surface-variant font-medium">Earned Payouts</p>
                            </div>
                        </div>
                    </div>

                    {/* FILTER TABS */}
                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex gap-4 text-xs font-bold">
                            {['all', 'pending', 'accepted', 'completed'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setFilter(st)}
                                    className={`px-3 py-1.5 rounded-xl capitalize transition-all ${filter === st ? 'bg-primary text-white shadow-xs' : 'bg-surface-container/50 text-on-surface-variant'}`}
                                >
                                    {st} ({st === 'all' ? bookings.length : bookings.filter(b => b.status === st).length})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BOOKINGS LIST */}
                    {loading ? (
                        <LoadingSpinner text="Fetching doorstep service requests..." />
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/30 space-y-3">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                📬
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">No Job Requests Found</h3>
                            <p className="text-xs text-on-surface-variant">Incoming service requests from customers in your area will appear here live.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map(b => (
                                <div key={b.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base text-on-surface">Customer: {b.userName || 'Local Customer'}</span>
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${b.status === 'completed' ? 'bg-secondary-container/40 text-secondary' : b.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant font-medium">Slot: <span className="font-bold text-on-surface">{b.date || 'Today'}, {b.slot || 'Standard'}</span></p>
                                        {b.address && <p className="text-xs text-on-surface-variant">📍 {b.address}</p>}
                                        {b.notes && <p className="text-xs text-on-surface-variant bg-surface-container/40 p-2 rounded-lg italic">"{b.notes}"</p>}
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                                        <span className="text-xl font-extrabold text-primary">₹{b.price || 399}</span>

                                        <div className="flex items-center gap-2">
                                            {b.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(b.id, 'accepted')}
                                                        className="px-3.5 py-1.5 bg-primary text-white font-bold text-xs rounded-xl shadow-xs"
                                                    >
                                                        Accept Job
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(b.id, 'rejected')}
                                                        className="px-3.5 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}

                                            {b.status === 'accepted' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(b.id, 'completed')}
                                                    className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow-xs"
                                                >
                                                    Mark Completed ✓
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default ProviderDashboard;
