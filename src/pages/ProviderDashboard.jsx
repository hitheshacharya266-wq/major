import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    subscribeToProviderBookings,
    updateBookingStatus,
    getProviderProfile,
    updateProviderAvailability,
    createNotification
} from '../firebase/firestoreService';
import { SERVICE_CATEGORIES, formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';
import PortfolioModal from '../components/PortfolioModal';
import ProfilePhotoModal from '../components/ProfilePhotoModal';
import {
    CheckCircle2, XCircle, Clock, MapPin, Wrench, ShieldCheck,
    ToggleLeft, ToggleRight, DollarSign, Award, Bell, User, Image as ImageIcon,
    Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderDashboard = () => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [provider, setProvider] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        getProviderProfile(currentUser.uid)
            .then(profile => {
                setProvider(profile || { name: 'Service Partner', available: true, category: 'plumber' });
            })
            .catch(err => console.error('Error fetching provider profile:', err));

        const unsubscribe = subscribeToProviderBookings(
            currentUser.uid,
            (bks) => {
                setBookings(bks || []);
                setLoading(false);
            },
            (err) => {
                console.error('Error subscribing to provider bookings:', err);
                toast.error('Failed to connect to realtime job updates');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            const booking = bookings.find(b => b.id === bookingId);
            await updateBookingStatus(bookingId, newStatus);
            toast.success(`Booking ${newStatus} successfully!`);

            if (booking?.userId) {
                try {
                    let title = 'Booking Update';
                    let message = `${provider?.name || 'Service Partner'} updated your booking status to ${newStatus}.`;
                    let type = 'booking_created';

                    if (newStatus === 'accepted') {
                        type = 'booking_accepted';
                        title = 'Booking Accepted 🎉';
                        message = `${provider?.name || 'Service Partner'} accepted your ${booking.category || 'service'} booking request.`;
                    } else if (newStatus === 'rejected') {
                        type = 'booking_rejected';
                        title = 'Booking Update ℹ️';
                        message = `${provider?.name || 'Service Partner'} was unable to accept your booking request.`;
                    } else if (newStatus === 'completed') {
                        type = 'booking_completed';
                        title = 'Service Completed ✅';
                        message = `${provider?.name || 'Service Partner'} marked your ${booking.category || 'service'} as completed.`;
                    }

                    await createNotification({
                        recipientId: booking.userId,
                        type,
                        title,
                        message,
                        bookingId,
                        providerId: currentUser.uid,
                        customerId: booking.userId
                    });
                } catch (nErr) {
                    console.error('Non-blocking customer notification error:', nErr);
                }
            }
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
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-6 sm:py-8">
                    <div className="max-w-container-max mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3.5">
                            <div
                                className="relative group shrink-0 cursor-pointer"
                                onClick={() => setPhotoModalOpen(true)}
                                title="Click to edit profile photo"
                            >
                                <ProviderAvatar
                                    name={provider?.name || 'Service Partner'}
                                    gender={provider?.gender}
                                    category={provider?.category}
                                    photoURL={provider?.photoURL || provider?.image}
                                    size="md"
                                    showCategoryBadge
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white shadow-xs">
                                    <Camera className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Partner Workstation</span>
                                    <span className="bg-secondary-container/40 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Verified Partner
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-on-surface">{provider?.name || 'Service Partner'}</h1>
                                <p className="text-xs sm:text-sm text-on-surface-variant">
                                    Category: <span className="font-bold text-on-surface capitalize">{catInfo?.label || provider?.category || 'General'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Availability Toggle & Edit Profile Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setPhotoModalOpen(true)}
                                className="h-12 px-4 bg-white border border-outline-variant/40 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs cursor-pointer"
                                title="Edit or upload profile photo"
                            >
                                <Camera className="w-4 h-4 text-primary" />
                                <span>{provider?.photoURL || provider?.image ? 'Edit Photo' : 'Add Photo'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPortfolioModalOpen(true)}
                                className="h-12 px-4 bg-white border border-outline-variant/40 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs cursor-pointer"
                            >
                                <ImageIcon className="w-4 h-4 text-primary" />
                                <span>Manage Portfolio</span>
                                {Array.isArray(provider?.portfolio) && provider.portfolio.length > 0 && (
                                    <span className="bg-[#e6f4f1] text-[#004d4c] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                        {provider.portfolio.length}
                                    </span>
                                )}
                            </button>
                            <Link
                                to="/provider-setup"
                                className="h-12 px-4 bg-white border border-outline-variant/40 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs"
                            >
                                <User className="w-4 h-4 text-primary" /> Edit Profile
                            </Link>
                            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-xs w-full sm:w-auto justify-between">
                                <div>
                                    <p className="text-xs font-bold text-on-surface">Duty Status</p>
                                    <p className="text-[11px] text-on-surface-variant font-medium">
                                        {provider?.available ? 'Accepting new doorstep requests' : 'Currently Offline'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggleAvailability}
                                    className="cursor-pointer"
                                >
                                    {provider?.available ? (
                                        <ToggleRight className="w-8 h-8 text-primary shrink-0" />
                                    ) : (
                                        <ToggleLeft className="w-8 h-8 text-outline shrink-0" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="max-w-container-max mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-1 w-full space-y-8">
                    {/* STATS OVERVIEW */}
                    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
                                🔔
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{bookings.filter(b => b.status === 'pending').length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Pending Job Requests</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                                ⚡
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{bookings.filter(b => b.status === 'accepted').length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Active Accepted Jobs</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl shrink-0">
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
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-outline-variant/30">
                        {['all', 'pending', 'accepted', 'completed'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilter(st)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${filter === st ? 'bg-primary text-white shadow-xs' : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                {st} ({st === 'all' ? bookings.length : bookings.filter(b => b.status === st).length})
                            </button>
                        ))}
                    </div>

                    {/* BOOKINGS LIST */}
                    {loading ? (
                        <LoadingSpinner text="Fetching doorstep service requests..." />
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-outline-variant/30 space-y-3">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                📬
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">No Job Requests Found</h3>
                            <p className="text-xs text-on-surface-variant">Incoming service requests from customers in your area will appear here live.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map(b => (
                                <div key={b.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row justify-between gap-4 w-full max-w-full min-w-0">
                                    <div className="space-y-2 w-full max-w-full min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">Customer: {b.userName || 'Local Customer'}</span>
                                            <span className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${b.status === 'completed' ? 'bg-secondary-container/40 text-secondary' : b.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant font-medium">Slot: <span className="font-bold text-on-surface">{b.date || 'Today'}, {b.slot || 'Standard'}</span></p>
                                        {b.address && <p className="text-xs text-on-surface-variant">📍 {b.address}</p>}
                                        {b.notes && <p className="text-xs text-on-surface-variant bg-surface-container/40 p-2.5 rounded-xl italic">"{b.notes}"</p>}
                                    </div>

                                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
                                        <span className="text-xl sm:text-2xl font-black text-primary">{formatCurrency(b.price)}</span>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {b.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(b.id, 'accepted')}
                                                        className="px-3.5 py-2 bg-primary text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                                                    >
                                                        Accept Job
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(b.id, 'rejected')}
                                                        className="px-3 py-2 bg-surface-container text-on-surface-variant font-bold text-xs rounded-xl hover:bg-surface-variant transition-colors cursor-pointer"
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

                {/* Portfolio Management Modal */}
                <PortfolioModal
                    isOpen={portfolioModalOpen}
                    onClose={() => setPortfolioModalOpen(false)}
                    providerId={currentUser?.uid}
                    portfolio={provider?.portfolio || []}
                    onPortfolioUpdated={(updatedPortfolio) => {
                        setProvider(prev => ({ ...prev, portfolio: updatedPortfolio }));
                    }}
                />

                {/* Profile Photo Modal */}
                <ProfilePhotoModal
                    isOpen={photoModalOpen}
                    onClose={() => setPhotoModalOpen(false)}
                    providerId={currentUser?.uid}
                    currentPhotoURL={provider?.photoURL || provider?.image || ''}
                    providerName={provider?.name || 'Service Partner'}
                    gender={provider?.gender}
                    category={provider?.category}
                    onPhotoUpdated={(newUrl) => {
                        setProvider(prev => ({
                            ...prev,
                            photoURL: newUrl,
                            image: newUrl
                        }));
                    }}
                />

                <Footer />
            </div>
        </PageTransition>
    );
};

export default ProviderDashboard;
