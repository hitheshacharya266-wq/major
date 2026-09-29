import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProviderProfile, getProviderReviews, getProviderStats } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES, formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';
import {
    Star, ShieldCheck, MapPin, Clock, Award, PhoneCall, CheckCircle2,
    ArrowRight, Check, Wrench, AlertCircle, MessageSquare
} from 'lucide-react';

const ProviderProfile = () => {
    const { id } = useParams();
    const [provider, setProvider] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ completedJobsCount: 0, rating: null, ratingCount: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        let isMounted = true;

        const fetchProviderData = async () => {
            try {
                const [data, revs, st] = await Promise.all([
                    getProviderProfile(id),
                    getProviderReviews(id),
                    getProviderStats(id)
                ]);

                if (isMounted) {
                    if (data) {
                        setProvider({
                            ...data,
                            id: data.uid || data.id,
                            rating: st.rating ?? data.rating ?? null,
                            ratingCount: st.ratingCount ?? data.ratingCount ?? 0,
                            completedJobsCount: st.completedJobsCount || 0
                        });
                        setReviews(revs || []);
                        setStats(st || { completedJobsCount: 0, rating: null, ratingCount: 0 });
                    } else {
                        setProvider(null);
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading provider profile:', err);
                if (isMounted) {
                    setProvider(null);
                    setLoading(false);
                }
            }
        };
        fetchProviderData();
        return () => {
            isMounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <LoadingSpinner text="Loading verified provider profile..." />
            </div>
        );
    }

    if (!provider) {
        return (
            <PageTransition>
                <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface">
                    <main className="max-w-xl mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-on-surface">Provider Profile Not Found</h2>
                        <p className="text-sm text-on-surface-variant max-w-md">
                            The provider profile you are trying to view does not exist or has been removed.
                        </p>
                        <Link
                            to="/search"
                            className="px-6 py-3 bg-primary text-on-primary font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-primary/90 transition-all inline-flex items-center gap-2 mt-2"
                        >
                            Browse All Verified Providers
                        </Link>
                    </main>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    const catInfo = SERVICE_CATEGORIES.find(c => String(c.id).toLowerCase() === String(provider.category || '').toLowerCase());
    const displayRating = provider.rating && provider.ratingCount > 0 ? provider.rating : null;

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
                <main className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-8">
                    {/* Provider Cover Banner & Profile Card */}
                    <section className="bg-white rounded-2xl sm:rounded-[32px] border border-outline-variant/40 shadow-sm overflow-hidden relative">
                        {/* Cover Banner Header */}
                        <div className="h-40 sm:h-52 md:h-64 w-full bg-gradient-to-r from-primary/90 via-primary-container to-secondary-container relative">
                            <div className="absolute inset-0 bg-black/20" />
                        </div>

                        {/* Profile Info Row */}
                        <div className="p-5 sm:p-10 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20 md:-mt-24 relative z-10 w-full md:w-auto">
                                <ProviderAvatar name={provider.name} gender={provider.gender} category={provider.category} photoURL={provider.photoURL || provider.image} size="2xl" showCategoryBadge className="border-4 border-white shadow-xl" />
                                <div className="space-y-2 sm:space-y-3 w-full">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="bg-secondary-container/30 text-secondary text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 border border-secondary/20 shadow-xs">
                                            <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" /> Verified Pro
                                        </span>
                                        <span className="bg-primary/10 text-primary text-[11px] sm:text-xs font-bold px-3 py-0.5 sm:py-1 rounded-full capitalize">
                                            {catInfo?.emoji} {catInfo?.label || provider.category}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight">
                                        {provider.name}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-on-surface-variant">
                                        {displayRating ? (
                                            <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                                                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                                {displayRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                                                <Star className="w-4 h-4 text-outline" /> New Provider (No reviews yet)
                                            </span>
                                        )}
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-primary" /> {provider.location || 'Mangaluru'}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-primary" /> {provider.experienceYears || '3+'} Yrs Exp
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="text-primary font-bold">
                                            {provider.completedJobsCount || 0} {provider.completedJobsCount === 1 ? 'Job Completed' : 'Jobs Completed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Header Action Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                                <Link
                                    to={`/checkout/${provider.id}`}
                                    className="w-full md:w-auto h-11 sm:h-13 px-6 bg-primary text-on-primary font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Instant Book Service</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Trust Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-outline-variant/40 shadow-xs text-center space-y-2">
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-sm sm:text-base text-on-surface">Background Checked</h4>
                            <p className="text-xs text-on-surface-variant font-medium">3-step identity & skill verified technician</p>
                        </div>
                        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-outline-variant/40 shadow-xs text-center space-y-2">
                            <div className="w-11 h-11 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center mx-auto mb-1">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-sm sm:text-base text-on-surface">60-Min Fast Arrival</h4>
                            <p className="text-xs text-on-surface-variant font-medium">Guaranteed doorstep arrival for local bookings</p>
                        </div>
                        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-outline-variant/40 shadow-xs text-center space-y-2">
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-sm sm:text-base text-on-surface">30-Day Warranty</h4>
                            <p className="text-xs text-on-surface-variant font-medium">Free re-visit if any issue recurs within 30 days</p>
                        </div>
                    </div>

                    {/* Main Section: Details + Sticky Sidebar Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                        {/* LEFT MAIN DETAILS (8 Cols) */}
                        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                            {/* Tabs Navigation */}
                            <div className="border-b border-outline-variant/30 flex gap-6 text-sm sm:text-base font-bold overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 sm:pb-4 transition-colors cursor-pointer shrink-0 ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary font-black' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    Overview & About
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-3 sm:pb-4 transition-colors cursor-pointer shrink-0 ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary font-black' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    Customer Reviews ({reviews.length})
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'overview' && (
                                <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-outline-variant/40 shadow-xs space-y-6 sm:space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-lg sm:text-xl font-bold text-on-surface">About {provider.name}</h3>
                                        <p className="text-xs sm:text-base text-on-surface-variant leading-relaxed font-normal">
                                            {provider.description || 'Experienced local professional providing reliable home services.'}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-on-surface">Skills & Specializations</h3>
                                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                                            {(Array.isArray(provider.skills) ? provider.skills : (provider.skills || 'General Service').split(',')).map((s, i) => (
                                                <span key={i} className="bg-surface-container border border-outline-variant/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-on-surface flex items-center gap-2">
                                                    <Check className="w-4 h-4 text-primary" /> {s.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-4 sm:space-y-6">
                                    {reviews.length === 0 ? (
                                        <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-outline-variant/40 text-center space-y-3">
                                            <MessageSquare className="w-10 h-10 text-outline mx-auto" />
                                            <h4 className="font-bold text-base text-on-surface">No Reviews Yet</h4>
                                            <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">
                                                This provider has not received any customer reviews yet. Book a service and be the first to rate your experience!
                                            </p>
                                        </div>
                                    ) : (
                                        reviews.map(rev => (
                                            <div key={rev.id} className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-outline-variant/40 shadow-xs space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                                            {rev.customerName?.charAt(0)?.toUpperCase() || 'C'}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-xs sm:text-sm text-on-surface block">{rev.customerName}</span>
                                                            <span className="text-[11px] text-on-surface-variant font-medium">Verified Home Visit Customer</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs sm:text-sm">
                                                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                                        {rev.rating} / 5
                                                    </div>
                                                </div>
                                                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">{rev.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* STICKY BOOKING SIDEBAR (4 Cols) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-outline-variant/40 shadow-xl space-y-6">
                                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                                    <div>
                                        <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Visiting Charge</span>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-2xl sm:text-3xl font-black text-primary">{formatCurrency(provider.price)}</span>
                                            <span className="text-xs text-on-surface-variant font-bold">/ service</span>
                                        </div>
                                    </div>
                                    <span className="bg-secondary-container/40 text-secondary text-xs font-bold px-3 py-1 rounded-full border border-secondary/20">
                                        Available Today
                                    </span>
                                </div>

                                <div className="space-y-3 text-xs sm:text-sm text-on-surface-variant font-medium">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Instant booking with 60-min arrival guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>No cancellation fee before technician dispatch</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Pay after service completion via Cash / UPI</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/checkout/${provider.id}`}
                                    className="w-full h-12 sm:h-14 bg-primary text-on-primary font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Book Professional Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <button
                                    onClick={() => alert(`Direct Partner Support Helpline: +91 9876543210`)}
                                    className="w-full h-11 sm:h-12 bg-surface-container text-on-surface font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <PhoneCall className="w-4 h-4 text-primary" /> Call Partner Helpdesk
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default ProviderProfile;
