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
    Wrench, ArrowRight, MapPin, User, AlertCircle, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings'); // bookings | pros

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
                {/* DASHBOARD HERO HEADER */}
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-10 px-6 lg:px-8">
                    <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">User Workspace</span>
                            <h1 className="text-3xl font-extrabold text-on-surface">Welcome, {userName} 👋</h1>
                            <p className="text-sm text-on-surface-variant">Manage your service requests, bookings, and active local technicians.</p>
                        </div>

                        <Link
                            to="/search"
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm shadow-md shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
                        >
                            <Search className="w-4 h-4" /> Book New Service
                        </Link>
                    </div>
                </section>

                <main className="max-w-container-max mx-auto px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                    {/* STATS OVERVIEW CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                                📋
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{bookings.length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Total Service Bookings</p>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl">
                                ⏳
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">
                                    {bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
                                </p>
                                <p className="text-xs text-on-surface-variant font-medium">Active / Pending Jobs</p>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                                ✅
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">
                                    {bookings.filter(b => b.status === 'completed').length}
                                </p>
                                <p className="text-xs text-on-surface-variant font-medium">Completed Jobs</p>
                            </div>
                        </div>
                    </div>

                    {/* TAB HEADERS */}
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
                                    <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                                        Need help with plumbing, electrical work, or AC maintenance? Find certified pros near you.
                                    </p>
                                    <Link
                                        to="/search"
                                        className="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md"
                                    >
                                        Browse Services Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(b => (
                                        <div key={b.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs flex flex-col md:flex-row justify-between gap-4">
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
                                                {b.notes && <p className="text-xs text-on-surface-variant bg-surface-container/40 p-2 rounded-lg italic">"{b.notes}"</p>}
                                            </div>

                                            <div className="flex flex-col justify-between items-end gap-2 shrink-0">
                                                <span className="text-xl font-extrabold text-primary">₹{b.price || 399}</span>
                                                <Link
                                                    to={`/provider/${b.providerId}`}
                                                    className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-xs rounded-xl transition-colors"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {providers.slice(0, 6).map(p => (
                                <div key={p.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 space-y-4 shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center">
                                            {p.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">{p.name}</h4>
                                            <p className="text-xs text-primary font-semibold capitalize">{p.category}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-on-surface-variant line-clamp-2">{p.description || 'Verified local service expert'}</p>
                                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                                        <span className="text-sm font-bold text-primary">₹{p.price || 399}/hr</span>
                                        <Link to={`/checkout/${p.id}`} className="px-3.5 py-1.5 bg-primary text-white font-bold text-xs rounded-xl shadow-xs">
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
