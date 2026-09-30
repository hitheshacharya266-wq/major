import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingsByUser, createReview, getProviderStats } from '../firebase/firestoreService';
import { formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';
import { Link } from 'react-router-dom';
import { Search, MapPin, CreditCard, HelpCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Review modal state
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        const fetchBookings = async () => {
            try {
                const userBookings = await getBookingsByUser(currentUser.uid);
                if (isMounted) {
                    setBookings(userBookings);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching user bookings:', err);
                if (isMounted) setLoading(false);
            }
        };

        fetchBookings();
        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    const handleOpenReviewModal = (booking) => {
        setReviewBooking(booking);
        setReviewRating(5);
        setReviewComment('');
    };

    const handleCloseReviewModal = () => {
        setReviewBooking(null);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewBooking) return;

        setSubmittingReview(true);
        try {
            await createReview({
                bookingId: reviewBooking.id,
                providerId: reviewBooking.providerId,
                customerId: currentUser.uid,
                customerName: userProfile?.fullName || userProfile?.name || currentUser.displayName || 'Customer',
                rating: Number(reviewRating),
                comment: reviewComment.trim(),
            });

            await getProviderStats(reviewBooking.providerId);

            setBookings(prev => prev.map(b => b.id === reviewBooking.id ? { ...b, reviewed: true, rating: reviewRating } : b));
            toast.success('Thank you for your review! ⭐');
            handleCloseReviewModal();
        } catch (err) {
            console.error('Failed to submit review:', err);
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const userName = userProfile?.fullName || userProfile?.name || currentUser?.displayName || 'Customer';

    const filteredBookings = bookings.filter(b => {
        if (filterStatus === 'all') return true;
        return b.status === filterStatus;
    });

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-sans text-on-surface items-center w-full">
                
                {/* HERO HEADER BANNER (Centered) */}
                <section className="bg-white border-b border-outline-variant/30 py-6 sm:py-8 w-full">
                    <div 
                        className="px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
                    >
                        <div className="text-left space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#004d4c] bg-[#e6f4f1] px-2.5 py-0.5 rounded-md inline-block">CUSTOMER PORTAL</span>
                            <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">Welcome back, {userName}!</h1>
                            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Here's what's happening with your services</p>
                        </div>

                        <Link
                            to="/search"
                            className="h-11 px-5 bg-[#004d4c] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:bg-[#004d4c]/90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                            <Search className="w-4 h-4 shrink-0" /> Book New Service
                        </Link>
                    </div>
                </section>

                <main 
                    className="px-4 sm:px-6 md:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-8"
                    style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
                >
                    
                    {/* STATS OVERVIEW CARDS (3 Columns across Desktop & Mobile) */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 items-stretch w-full">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-outline-variant/30 shadow-2xs flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                                📋
                            </div>
                            <div>
                                <p className="text-xl sm:text-3xl font-black text-on-surface">{bookings.length}</p>
                                <p className="text-[11px] sm:text-xs text-on-surface-variant font-bold">Total Bookings</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-outline-variant/30 shadow-2xs flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                                ⏳
                            </div>
                            <div>
                                <p className="text-xl sm:text-3xl font-black text-on-surface">
                                    {bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
                                </p>
                                <p className="text-[11px] sm:text-xs text-on-surface-variant font-bold">Active / Pending</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-outline-variant/30 shadow-2xs flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                                ✅
                            </div>
                            <div>
                                <p className="text-xl sm:text-3xl font-black text-on-surface">
                                    {bookings.filter(b => b.status === 'completed').length}
                                </p>
                                <p className="text-[11px] sm:text-xs text-on-surface-variant font-bold">Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* TABS HEADER */}
                    <div className="border-b border-outline-variant/30 flex gap-4 sm:gap-6 text-xs sm:text-sm font-extrabold overflow-x-auto scrollbar-none pt-2 w-full">
                        <span className="text-[#004d4c] border-b-2 border-[#004d4c] pb-2 cursor-pointer shrink-0">
                            My Bookings
                        </span>
                        {['all', 'pending', 'accepted', 'completed', 'rejected'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`pb-2 capitalize transition-colors cursor-pointer shrink-0 ${filterStatus === st ? 'text-[#004d4c] font-black underline' : 'text-on-surface-variant hover:text-[#004d4c]'}`}
                            >
                                {st} ({st === 'all' ? bookings.length : bookings.filter(b => b.status === st).length})
                            </button>
                        ))}
                    </div>

                    {/* MAIN DASHBOARD CONTENT (2 Columns Grid on Desktop: Booking List + Quick Actions Container) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
                        
                        {/* LEFT COLUMN: BOOKINGS LIST (7 Cols on Desktop) */}
                        <div className="lg:col-span-7 flex flex-col gap-4 w-full">
                            {loading ? (
                                <LoadingSpinner text="Fetching your service bookings..." />
                            ) : filteredBookings.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-outline-variant/30 space-y-4">
                                    <div className="w-14 h-14 bg-[#e6f4f1] text-[#004d4c] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                                        📦
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-on-surface">No Bookings Found</h3>
                                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto font-medium">
                                        Need help with plumbing, electrical work, or AC maintenance? Find certified pros near you.
                                    </p>
                                    <Link
                                        to="/search"
                                        className="h-11 px-6 bg-[#004d4c] text-white font-extrabold text-xs sm:text-sm rounded-xl inline-flex items-center justify-center shadow-md"
                                    >
                                        Browse Services Now
                                    </Link>
                                </div>
                            ) : (
                                filteredBookings.map(b => {
                                    const priceVal = (typeof b.price === 'number' && b.price > 0) ? b.price : 399;
                                    return (
                                        <div key={b.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-outline-variant/30 shadow-2xs flex flex-col sm:flex-row justify-between gap-4 items-start text-left w-full">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <ProviderAvatar name={b.providerName || 'Service Technician'} gender={b.gender} category={b.category || b.serviceType} photoURL={b.photoURL || b.image} size="md" showCategoryBadge />
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-black text-sm sm:text-base text-on-surface truncate">{b.providerName || 'Service Technician'}</span>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : b.status === 'accepted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : b.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                            {b.status || 'PENDING'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-on-surface-variant font-medium">Category: <span className="font-bold text-on-surface capitalize">{b.category || b.serviceType || 'General'}</span></p>
                                                    <p className="text-xs text-on-surface-variant font-medium">Scheduled: <span className="font-bold text-on-surface">{b.date || 'Jul 30, 2026'}, {b.slot || '10:00 AM - 12:00 PM'}</span></p>
                                                    {b.address && <p className="text-xs text-on-surface-variant truncate max-w-md">📍 {b.address}</p>}
                                                </div>
                                            </div>

                                            {/* Right Price & Details Link (Matching Target Spec) */}
                                            <div className="flex flex-col sm:items-end gap-1 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
                                                <span className="text-xl sm:text-2xl font-black text-on-surface text-right">{formatCurrency(priceVal)}</span>
                                                <div className="flex items-center gap-2">
                                                    {b.status === 'completed' && !b.reviewed && (
                                                        <button
                                                            onClick={() => handleOpenReviewModal(b)}
                                                            className="h-8 px-3 text-xs font-extrabold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center border border-amber-200"
                                                        >
                                                            Rate Pro
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/provider/${b.providerId}`}
                                                        className="text-xs font-extrabold text-[#004d4c] hover:underline transition-colors flex items-center justify-center py-0.5"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* RIGHT COLUMN: QUICK ACTIONS CONTAINER (5 Cols on Desktop - Soft Mint Card) */}
                        <div className="lg:col-span-5 w-full">
                            <div className="bg-[#e6f4f1] rounded-3xl p-6 border border-[#004d4c]/15 shadow-2xs space-y-4 text-left">
                                <h3 className="font-black text-base sm:text-lg text-[#004d4c]">Quick Actions</h3>
                                <div className="space-y-3">
                                    <div className="bg-white p-3.5 rounded-2xl border border-outline-variant/20 flex items-center gap-3 shadow-2xs hover:border-[#004d4c] transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center font-bold shrink-0">
                                            <Navigation className="w-5 h-5 text-[#004d4c]" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-black text-on-surface">Track Booking</p>
                                            <p className="text-[11px] text-on-surface-variant font-medium">Real-time updates</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-2xl border border-outline-variant/20 flex items-center gap-3 shadow-2xs hover:border-[#004d4c] transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center font-bold shrink-0">
                                            <MapPin className="w-5 h-5 text-[#004d4c]" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-black text-on-surface">My Addresses</p>
                                            <p className="text-[11px] text-on-surface-variant font-medium">Manage locations</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-2xl border border-outline-variant/20 flex items-center gap-3 shadow-2xs hover:border-[#004d4c] transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center font-bold shrink-0">
                                            <CreditCard className="w-5 h-5 text-[#004d4c]" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-black text-on-surface">Payment Methods</p>
                                            <p className="text-[11px] text-on-surface-variant font-medium">Saved cards & UPI</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#004d4c] text-white p-3.5 rounded-2xl border border-[#004d4c] flex items-center gap-3 shadow-xs transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shrink-0">
                                            <HelpCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-black text-white">Help & Support</p>
                                            <p className="text-[11px] text-white/80 font-medium">Get assistance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default UserDashboard;
