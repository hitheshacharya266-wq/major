import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    getAllProviders,
    getBookingsByUser
} from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import {
    Search, Calendar, Clock, CheckCircle2, ShieldCheck, Star,
    Wrench, ArrowRight, MapPin, User, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings');

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const [bData, pData] = await Promise.all([
                    getBookingsByUser(currentUser.uid),
                    getAllProviders()
                ]);
                setBookings(bData || []);
                setProviders(pData || []);
            } catch {
                toast.error('Error loading dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [currentUser]);

    const userName = userProfile?.fullName || userProfile?.name || currentUser?.displayName || 'Customer';

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                {/* HERO HEADER BANNER */}
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-10">
                    <div className="sh-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Customer Workspace</span>
                            <h1 className="text-3xl font-extrabold text-on-surface">Welcome, {userName} 👋</h1>
                            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Manage your active service requests, bookings, and nearby technicians.</p>
                        </div>

                        <Link
                            to="/search"
                            className="sh-btn-primary shrink-0"
                        >
                            <Search className="w-4 h-4 shrink-0" /> Book New Service
                        </Link>
                    </div>
                </section>

                <main className="sh-container py-10 flex-1 w-full space-y-8">
                    {/* STATS OVERVIEW CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
                        <div className="sh-card flex-row items-center gap-4 p-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                                📋
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-on-surface">{bookings.length}</p>
                                <p className="text-xs text-on-surface-variant font-semibold">Total Service Bookings</p>
                            </div>
                        </div>

                        <div className="sh-card flex-row items-center gap-4 p-6">
                            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-2xl shrink-0">
                                ⏳
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-on-surface">
                                    {bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
                                </p>
                                <p className="text-xs text-on-surface-variant font-semibold">Active / Pending Jobs</p>
                            </div>
                        </div>

                        <div className="sh-card flex-row items-center gap-4 p-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                                ✅
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-on-surface">
                                    {bookings.filter(b => b.status === 'completed').length}
                                </p>
                                <p className="text-xs text-on-surface-variant font-semibold">Completed Jobs</p>
                            </div>
                        </div>
                    </div>

                    {/* TABS HEADER */}
                    <div className="border-b border-outline-variant/30 flex gap-6 text-sm font-bold">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`pb-3 transition-colors ${activeTab === 'bookings' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            My Service Bookings ({bookings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('pros')}
                            className={`pb-3 transition-colors ${activeTab === 'pros' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            Recommended Nearby Pros
                        </button>
                    </div>

                    {/* BOOKINGS TAB */}
                    {activeTab === 'bookings' && (
                        <div>
                            {loading ? (
                                <LoadingSpinner text="Fetching your bookings..." />
                            ) : bookings.length === 0 ? (
                                <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/30 space-y-4">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl">
                                        📦
                                    </div>
                                    <h3 className="text-xl font-bold text-on-surface">No Service Bookings Yet</h3>
                                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto font-medium">
                                        Need help with plumbing, electrical work, or AC maintenance? Find certified pros near you.
                                    </p>
                                    <Link
                                        to="/search"
                                        className="sh-btn-primary inline-flex"
                                    >
                                        Browse Services Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(b => (
                                        <div key={b.id} className="sh-card !flex-col md:!flex-row justify-between gap-4 p-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-base text-on-surface">{b.providerName || 'Service Technician'}</span>
                                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${b.status === 'completed' ? 'bg-secondary-container/40 text-secondary' : b.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'}`}>
                                                        {b.status || 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant font-medium">Category: <span className="font-bold text-on-surface capitalize">{b.category || b.serviceType || 'General'}</span></p>
                                                <p className="text-xs text-on-surface-variant font-medium">Scheduled: <span className="font-bold text-on-surface">{b.date || 'Today'}, {b.slot || 'Regular Slot'}</span></p>
                                                {b.address && <p className="text-xs text-on-surface-variant truncate max-w-md">📍 {b.address}</p>}
                                                {b.notes && <p className="text-xs text-on-surface-variant bg-surface-container/40 p-2.5 rounded-xl italic">"{b.notes}"</p>}
                                            </div>

                                            <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                                                <span className="text-2xl font-extrabold text-primary">₹{b.price || 399}</span>
                                                <Link
                                                    to={`/provider/${b.providerId}`}
                                                    className="sh-btn-outline !h-9 !px-4 !text-xs"
                                                >
                                                    View Provider Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* RECOMMENDED PROS TAB */}
                    {activeTab === 'pros' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {providers.slice(0, 6).map(p => (
                                <div key={p.id} className="sh-card space-y-4 p-6 h-full">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center shrink-0">
                                                {p.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-on-surface">{p.name}</h4>
                                                <p className="text-xs text-primary font-semibold capitalize">{p.category}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-on-surface-variant line-clamp-2 font-medium">{p.description || 'Verified local service expert'}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-auto">
                                        <span className="text-base font-extrabold text-primary">₹{p.price || 399}/hr</span>
                                        <Link to={`/checkout/${p.id}`} className="sh-btn-primary !h-9 !px-4 !text-xs">
                                            Book Now
                                        </Link>
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

export default UserDashboard;
