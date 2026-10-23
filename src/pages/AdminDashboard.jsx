import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    getAdminOverviewStats,
    getAllUsers,
    getAllProviders,
    getAllBookingsAdmin,
    getAllReports,
    getAllReviewsAdmin,
    getAuditLogs,
    getPlatformSettings,
    updateProviderAccountStatus,
    verifyProviderAccount,
    rejectProviderVerification,
    restrictCustomerAccount,
    flagBookingForReview,
    updateReportStatus,
    moderateReview,
    updatePlatformSettings
} from '../firebase/firestoreService';
import { SERVICE_CATEGORIES, formatCurrency, formatDate } from '../utils/helpers';
import { SAMPLE_ADMIN_DATA } from '../data/mockAdminData';
import ProviderAvatar from '../components/ProviderAvatar';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import PortfolioGalleryModal from '../components/PortfolioGalleryModal';
import {
    Shield, Users, Wrench, Search, CheckCircle2, ShieldCheck, Mail, MapPin,
    AlertTriangle, Calendar, RefreshCw, Clock, XCircle, Filter, Eye,
    Ban, Check, Star, Sliders, Info, ShieldAlert,
    Phone, ChevronRight, MessageSquare, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { currentUser, userProfile, adminClaim, isAdmin } = useAuth();
    const isPreviewMode = !isAdmin;

    // Active Sidebar Tab:
    // 'overview' | 'providers' | 'verifications' | 'customers' | 'bookings' | 'reports' | 'reviews' | 'audit' | 'settings'
    const [activeTab, setActiveTab] = useState('overview');

    // Data states
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reports, setReports] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [platformConfig, setPlatformConfig] = useState({
        supportedCities: ['Mangaluru', 'Hassan', 'Udupi'],
        announcement: '',
        maintenanceMode: false
    });

    // UI & Filter states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

    // Modals
    const [selectedProviderModal, setSelectedProviderModal] = useState(null);
    const [suspensionModal, setSuspensionModal] = useState(null); // { providerId, providerName }
    const [suspensionReason, setSuspensionReason] = useState('');
    const [rejectionModal, setRejectionModal] = useState(null); // { providerId, providerName }
    const [rejectionReason, setRejectionReason] = useState('');
    const [bookingDetailModal, setBookingDetailModal] = useState(null);
    const [flagModal, setFlagModal] = useState(null); // { bookingId }
    const [flagReason, setFlagReason] = useState('');
    const [reportResolveModal, setReportResolveModal] = useState(null); // { reportId, status }
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [reviewModerateModal, setReviewModerateModal] = useState(null); // { reviewId, providerId }
    const [moderationReason, setModerationReason] = useState('');
    const [customerRestrictModal, setCustomerRestrictModal] = useState(null); // { customerId, customerName, newStatus }
    const [restrictionReason, setRestrictionReason] = useState('');
    const [galleryPreview, setGalleryPreview] = useState(null); // { images, name }
    const [processingAction, setProcessingAction] = useState(false);

    // Initial Data Fetch
    const fetchAllData = useCallback(async () => {
        if (isPreviewMode) {
            setStats(SAMPLE_ADMIN_DATA.stats);
            setUsers(SAMPLE_ADMIN_DATA.users);
            setProviders(SAMPLE_ADMIN_DATA.providers);
            setBookings(SAMPLE_ADMIN_DATA.bookings);
            setReports(SAMPLE_ADMIN_DATA.reports);
            setReviews(SAMPLE_ADMIN_DATA.reviews);
            setAuditLogs(SAMPLE_ADMIN_DATA.auditLogs);
            setPlatformConfig(SAMPLE_ADMIN_DATA.platformConfig);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const [
                statsData,
                usersData,
                providersData,
                bookingsData,
                reportsData,
                reviewsData,
                logsData,
                settingsData
            ] = await Promise.all([
                getAdminOverviewStats().catch(() => null),
                getAllUsers().catch(() => []),
                getAllProviders().catch(() => []),
                getAllBookingsAdmin().catch(() => []),
                getAllReports().catch(() => []),
                getAllReviewsAdmin().catch(() => []),
                getAuditLogs(100).catch(() => []),
                getPlatformSettings().catch(() => ({ supportedCities: ['Mangaluru', 'Hassan', 'Udupi'] }))
            ]);

            setStats(statsData);
            setUsers(usersData || []);
            setProviders(providersData || []);
            setBookings(bookingsData || []);
            setReports(reportsData || []);
            setReviews(reviewsData || []);
            setAuditLogs(logsData || []);
            setPlatformConfig(settingsData || { supportedCities: ['Mangaluru', 'Hassan', 'Udupi'] });
        } catch (err) {
            console.error('Failed to load admin data:', err);
            toast.error('Failed to load some administrative data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isPreviewMode]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        if (isPreviewMode) {
            setTimeout(() => {
                fetchAllData();
                setRefreshing(false);
                toast.success('Preview sample data refreshed.');
            }, 300);
            return;
        }
        await fetchAllData();
        toast.success('Admin data synchronized with Firestore.');
    };

    const adminActor = useMemo(() => ({
        uid: currentUser?.uid || 'admin_console',
        email: currentUser?.email || 'admin@servicehub.in'
    }), [currentUser]);

    // ─── Provider Actions ──────────────────────────────────
    const handleVerifyProvider = async (providerId) => {
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Verifying providers requires verified administrator authorization (admin: true).', { icon: '🔒' });
            return;
        }
        setProcessingAction(true);
        try {
            await verifyProviderAccount(providerId, adminActor);
            toast.success('Provider verified successfully! 🏅');
            await fetchAllData();
            if (selectedProviderModal?.id === providerId) {
                setSelectedProviderModal(prev => ({ ...prev, verified: true, verificationStatus: 'verified' }));
            }
        } catch (err) {
            console.error('Error verifying provider:', err);
            toast.error(err.message || 'Verification failed.');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleConfirmRejectVerification = async (e) => {
        e.preventDefault();
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Rejecting verifications requires verified administrator authorization (admin: true).', { icon: '🔒' });
            setRejectionModal(null);
            return;
        }
        if (!rejectionReason.trim()) {
            toast.error('A rejection reason is mandatory.');
            return;
        }
        setProcessingAction(true);
        try {
            await rejectProviderVerification(rejectionModal.providerId, rejectionReason, adminActor);
            toast.success('Verification rejected with feedback sent to provider.');
            setRejectionModal(null);
            setRejectionReason('');
            await fetchAllData();
        } catch (err) {
            toast.error(err.message || 'Rejection failed.');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleConfirmSuspension = async (e) => {
        e.preventDefault();
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Account suspension requires verified administrator authorization (admin: true).', { icon: '🔒' });
            setSuspensionModal(null);
            return;
        }
        if (!suspensionReason.trim()) {
            toast.error('A mandatory suspension reason is required.');
            return;
        }
        setProcessingAction(true);
        try {
            await updateProviderAccountStatus(suspensionModal.providerId, 'suspended', suspensionReason, {
                ...adminActor,
                previousStatus: suspensionModal.currentStatus || 'active'
            });
            toast.success('Provider suspended. Profile is now hidden from customer discovery.');
            setSuspensionModal(null);
            setSuspensionReason('');
            await fetchAllData();
        } catch (err) {
            toast.error(err.message || 'Failed to suspend provider.');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleReactivateProvider = async (provider) => {
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Reactivating accounts requires verified administrator authorization (admin: true).', { icon: '🔒' });
            return;
        }
        if (!window.confirm("Reactivate this provider account?")) {
            return;
        }
        setProcessingAction(true);
        try {
            await updateProviderAccountStatus(provider.id, 'active', 'Reactivated by administrator', {
                ...adminActor,
                previousStatus: provider.status || 'suspended'
            });
            toast.success('Provider reactivated successfully! 🎉');
            await fetchAllData();
            if (selectedProviderModal?.id === provider.id) {
                setSelectedProviderModal(prev => prev ? ({ ...prev, status: 'active', available: true }) : null);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to reactivate provider.');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleDeactivateProvider = async (provider) => {
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Deactivating accounts requires verified administrator authorization (admin: true).', { icon: '🔒' });
            return;
        }
        if (!window.confirm(`Deactivate account for ${provider.name || 'this provider'}?`)) {
            return;
        }
        setProcessingAction(true);
        try {
            await updateProviderAccountStatus(provider.id, 'deactivated', 'Deactivated upon administrative review', {
                ...adminActor,
                previousStatus: provider.status || 'active'
            });
            toast.success('Provider account deactivated.');
            await fetchAllData();
            if (selectedProviderModal?.id === provider.id) {
                setSelectedProviderModal(prev => prev ? ({ ...prev, status: 'deactivated', available: false }) : null);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to deactivate.');
        } finally {
            setProcessingAction(false);
        }
    };

    // ─── Customer Actions ──────────────────────────────────
    const handleConfirmCustomerRestriction = async (e) => {
        e.preventDefault();
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Customer restriction requires verified administrator authorization (admin: true).', { icon: '🔒' });
            setCustomerRestrictModal(null);
            return;
        }
        setProcessingAction(true);
        try {
            const { customerId, newStatus } = customerRestrictModal;
            await restrictCustomerAccount(customerId, newStatus, restrictionReason, adminActor);
            toast.success(`Customer account marked as ${newStatus}.`);
            setCustomerRestrictModal(null);
            setRestrictionReason('');
            await fetchAllData();
        } catch (err) {
            toast.error(err.message || 'Action failed.');
        } finally {
            setProcessingAction(false);
        }
    };

    // ─── Booking Actions ───────────────────────────────────
    const handleConfirmFlagBooking = async (e) => {
        e.preventDefault();
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Flagging bookings requires verified administrator authorization (admin: true).', { icon: '🔒' });
            setFlagModal(null);
            return;
        }
        setProcessingAction(true);
        try {
            await flagBookingForReview(flagModal.bookingId, flagReason, adminActor);
            toast.success('Booking flagged for administrative investigation.');
            setFlagModal(null);
            setFlagReason('');
            await fetchAllData();
        } catch (err) {
            toast.error(err.message || 'Failed to flag booking.');
        } finally {
            setProcessingAction(false);
        }
    };

    // ─── Report Actions ────────────────────────────────────
    const handleConfirmResolveReport = async (e) => {
        e.preventDefault();
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Resolving reports requires verified administrator authorization (admin: true).', { icon: '🔒' });
            setReportResolveModal(null);
            return;
        }
        setProcessingAction(true);
        try {
            await updateReportStatus(
                reportResolveModal.reportId,
                reportResolveModal.status,
                resolutionNotes,
                adminActor
            );
            toast.success(`Report marked as ${reportResolveModal.status}.`);
            setReportResolveModal(null);
            setResolutionNotes('');
            await fetchAllData();
        } catch (err) {
            toast.error(err.message || 'Failed to update report.');
        } finally {
            setProcessingAction(false);
        }
    };

    // ─── Review Moderation ─────────────────────────────────
    const handleConfirmModerateReview = async (e) => {
        e.preventDefault();
        if (isPreviewMode) {
            toast.error('Action Locked in Preview Mode — Moderating reviews requires verified administrator authorization (admin: true).', { icon: '🔒' });
            setReviewModerateModal(null);
            return;
        }
        setProcessingAction(true);
        try {
            await moderateReview(
                reviewModerateModal.reviewId,
                reviewModerateModal.providerId,
                'remove',
                moderationReason,
                adminActor
            );
            toast.success('Review removed from public view and provider rating recalculated.');
            setReviewModerateModal(null);
            setModerationReason('');
            await fetchAllData();
        } catch (err) {
            toast.error(err.message || 'Failed to moderate review.');
        } finally {
            setProcessingAction(false);
        }
    };

    // ─── Filtered Data ─────────────────────────────────────
    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const matchSearch = !searchTerm ||
                (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.category?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.location?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchCat = categoryFilter === 'all' || p.category === categoryFilter;

            const providerStatus = p.status || (p.verified === false ? 'pending' : 'active');
            const matchStatus = statusFilter === 'all' || providerStatus === statusFilter;

            return matchSearch && matchCat && matchStatus;
        });
    }, [providers, searchTerm, categoryFilter, statusFilter]);

    const verificationQueue = useMemo(() => {
        return providers.filter(p => p.verified === false || p.verificationStatus === 'pending');
    }, [providers]);

    const filteredCustomers = useMemo(() => {
        const customersOnly = users.filter(u => u.role !== 'provider' && u.role !== 'admin');
        return customersOnly.filter(c =>
            !searchTerm ||
            (c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchSearch = !searchTerm ||
                (b.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.userName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.providerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.category?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
            return matchSearch && matchStatus;
        });
    }, [bookings, searchTerm, bookingStatusFilter]);

    const openReportsCount = useMemo(() => {
        return reports.filter(r => r.status === 'open' || r.status === 'under_review').length;
    }, [reports]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <LoadingSpinner text="Initializing Secure Admin Control Panel..." />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface">

                {/* ADMIN TOP BAR */}
                <header className="bg-white border-b border-outline-variant/30 py-4 px-4 sm:px-8 sticky top-16 z-30 shadow-2xs">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#004d4c] bg-[#e6f4f1] px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-[#004d4c]/15">
                                    <Shield className="w-3.5 h-3.5" /> ServiceHub Admin Control Panel
                                </span>
                                {isPreviewMode ? (
                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3 text-amber-700" /> Preview Mode (Read-Only)
                                    </span>
                                ) : adminClaim ? (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Custom Claim
                                    </span>
                                ) : (
                                    <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Info className="w-3 h-3 text-amber-700" /> Firestore Admin Role
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-on-surface">
                                Platform Operations Command Center
                            </h1>
                        </div>

                        {/* Search & Global Actions */}
                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <div className="bg-surface-container/60 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-outline-variant/30 flex-1 sm:w-64">
                                <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by name, email, ID..."
                                    className="bg-transparent border-none outline-none text-xs text-on-surface w-full"
                                />
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="h-9 px-3 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-outline-variant/30 shrink-0"
                                title={isPreviewMode ? 'Refresh sample data' : 'Refresh live Firestore data'}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                                <span className="hidden sm:inline">Sync</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* PREVIEW MODE NOTIFICATION BANNER */}
                {isPreviewMode && (
                    <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-b border-amber-200 px-4 sm:px-8 py-3.5 shadow-xs">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                                            Admin Dashboard Preview Mode
                                        </span>
                                        <span className="bg-amber-200/90 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300/70">
                                            Read-Only Demonstration
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                                        Displaying realistic sample platform metrics, providers, and bookings for interface review. Real administrative actions (verifications, suspensions, moderations) are locked until authenticated via Firebase Admin SDK (<code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded text-[11px] font-bold">admin: true</code>).
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 bg-[#004d4c] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#003837] transition-all shadow-xs"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Sign In as Administrator
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN ADMIN WORKSPACE (Sidebar + Content View) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1 w-full flex flex-col lg:flex-row gap-6">

                    {/* LEFT NAVIGATION SIDEBAR */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <nav className="bg-white rounded-3xl p-3 border border-outline-variant/30 shadow-2xs space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'overview'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Sliders className="w-4 h-4" /> System Overview
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('providers')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'providers'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Wrench className="w-4 h-4" /> Service Partners
                                </span>
                                <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-black">
                                    {providers.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('verifications')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'verifications'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <ShieldCheck className="w-4 h-4" /> Verification Queue
                                </span>
                                {verificationQueue.length > 0 && (
                                    <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                                        {verificationQueue.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'customers'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Users className="w-4 h-4" /> Customers
                                </span>
                                <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-black">
                                    {filteredCustomers.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'bookings'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Calendar className="w-4 h-4" /> Bookings Oversight
                                </span>
                                <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-black">
                                    {bookings.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'reports'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <AlertTriangle className="w-4 h-4" /> Complaints &amp; Reports
                                </span>
                                {openReportsCount > 0 && (
                                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">
                                        {openReportsCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'reviews'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Star className="w-4 h-4" /> Reviews Moderation
                                </span>
                                <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-black">
                                    {reviews.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'audit'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Shield className="w-4 h-4" /> Audit Trail Log
                                </span>
                                <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-black">
                                    {auditLogs.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    activeTab === 'settings'
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Sliders className="w-4 h-4" /> Platform Settings
                                </span>
                            </button>
                        </nav>

                        {/* Admin Session Card */}
                        {isPreviewMode ? (
                            <div className="bg-amber-50/80 rounded-3xl p-4 border border-amber-200/80 shadow-2xs mt-4 text-xs space-y-2">
                                <p className="font-extrabold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-amber-700" /> Preview Session
                                </p>
                                <p className="font-bold text-amber-950 truncate">
                                    {currentUser ? (userProfile?.fullName || currentUser.email) : 'Guest Visitor'}
                                </p>
                                <p className="text-amber-800 text-[11px] truncate">
                                    {currentUser ? 'Signed in (No Admin Claim)' : 'Unauthenticated Preview'}
                                </p>
                                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                                    <span className="text-amber-800 font-semibold">Live Actions:</span>
                                    <span className="font-black text-amber-950 bg-amber-200/70 px-2 py-0.5 rounded-md">Locked</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-4 border border-outline-variant/30 shadow-2xs mt-4 text-xs space-y-2">
                                <p className="font-extrabold text-on-surface text-[11px] uppercase tracking-wider text-on-surface-variant">Logged in Administrator</p>
                                <p className="font-bold text-on-surface truncate">{userProfile?.fullName || currentUser?.displayName || 'Admin'}</p>
                                <p className="text-on-surface-variant text-[11px] truncate">{currentUser?.email}</p>
                                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                                    <span className="text-on-surface-variant">Auth System:</span>
                                    <span className="font-bold text-emerald-700">Firebase Auth</span>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* RIGHT MAIN VIEW AREA */}
                    <main className="flex-1 min-w-0">

                        {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* STATS SUMMARY GRID */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-2xs">
                                        <p className="text-xs text-on-surface-variant font-bold">Total Service Partners</p>
                                        <p className="text-2xl sm:text-3xl font-black text-on-surface mt-1">{stats?.totalProviders ?? providers.length}</p>
                                        <p className="text-[11px] text-emerald-700 font-bold mt-1">
                                            {stats?.activeProviders ?? providers.filter(p => p.status === 'active' || !p.status).length} Active On-Duty
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-2xs">
                                        <p className="text-xs text-on-surface-variant font-bold">Pending Verifications</p>
                                        <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{verificationQueue.length}</p>
                                        <button onClick={() => setActiveTab('verifications')} className="text-[11px] text-[#004d4c] font-bold hover:underline mt-1 cursor-pointer">
                                            Review Queue →
                                        </button>
                                    </div>

                                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-2xs">
                                        <p className="text-xs text-on-surface-variant font-bold">Total Bookings</p>
                                        <p className="text-2xl sm:text-3xl font-black text-on-surface mt-1">{stats?.totalBookings ?? bookings.length}</p>
                                        <p className="text-[11px] text-primary font-bold mt-1">
                                            {stats?.completedBookings ?? bookings.filter(b => b.status === 'completed').length} Completed
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-2xs">
                                        <p className="text-xs text-on-surface-variant font-bold">Open Complaints</p>
                                        <p className="text-2xl sm:text-3xl font-black text-red-600 mt-1">{openReportsCount}</p>
                                        <button onClick={() => setActiveTab('reports')} className="text-[11px] text-red-700 font-bold hover:underline mt-1 cursor-pointer">
                                            Inspect Complaints →
                                        </button>
                                    </div>
                                </div>

                                {/* SECONDARY STATS ROW */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-on-surface-variant font-bold">Registered Customers</p>
                                            <p className="text-xl font-black text-on-surface">{filteredCustomers.length}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-primary/30" />
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-on-surface-variant font-bold">Suspended Accounts</p>
                                            <p className="text-xl font-black text-red-600">
                                                {providers.filter(p => p.status === 'suspended').length}
                                            </p>
                                        </div>
                                        <Ban className="w-8 h-8 text-red-300" />
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-on-surface-variant font-bold">Coverage Districts</p>
                                            <p className="text-xl font-black text-on-surface">
                                                {platformConfig?.supportedCities?.length || 3}
                                            </p>
                                        </div>
                                        <MapPin className="w-8 h-8 text-emerald-300" />
                                    </div>
                                </div>

                                {/* RECENT AUDIT ACTIVITY FEED */}
                                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-outline-variant/30 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-base text-on-surface flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-primary" /> Recent Administrative Activity
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab('audit')}
                                            className="text-xs font-bold text-[#004d4c] hover:underline cursor-pointer"
                                        >
                                            View Full Audit Log ({auditLogs.length}) →
                                        </button>
                                    </div>

                                    {auditLogs.length === 0 ? (
                                        <p className="text-xs text-on-surface-variant py-4 text-center font-medium">
                                            No administrative actions recorded yet. All future sensitive actions will be audited here.
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-outline-variant/20 text-xs">
                                            {auditLogs.slice(0, 5).map(log => (
                                                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-primary">
                                                                {log.action}
                                                            </span>
                                                            <span className="text-on-surface font-bold">Target: {log.targetType} #{log.targetId?.slice(0, 8)}</span>
                                                        </div>
                                                        <p className="text-on-surface-variant text-[11px]">{log.reason || 'No additional comment provided'}</p>
                                                    </div>
                                                    <span className="text-[11px] text-on-surface-variant/70 shrink-0">
                                                        {formatDate(log.timestamp)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 2: SERVICE PARTNERS MANAGEMENT ────────────────────── */}
                        {activeTab === 'providers' && (
                            <div className="space-y-4">
                                {/* Filters Row */}
                                <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-on-surface-variant flex items-center gap-1">
                                            <Filter className="w-3.5 h-3.5" /> Filters:
                                        </span>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="bg-surface-container/50 border border-outline-variant/40 rounded-xl px-2.5 py-1.5 font-bold text-on-surface outline-none"
                                        >
                                            <option value="all">All Categories ({providers.length})</option>
                                            {SERVICE_CATEGORIES.map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="bg-surface-container/50 border border-outline-variant/40 rounded-xl px-2.5 py-1.5 font-bold text-on-surface outline-none"
                                        >
                                            <option value="all">All Account Statuses</option>
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="deactivated">Deactivated</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                    <span className="font-bold text-on-surface-variant">
                                        Showing {filteredProviders.length} providers
                                    </span>
                                </div>

                                {/* Providers Table */}
                                <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant border-b border-outline-variant/30">
                                                    <th className="py-3.5 px-4 sm:px-6">Partner Name</th>
                                                    <th className="py-3.5 px-4">Category</th>
                                                    <th className="py-3.5 px-4">City / Area</th>
                                                    <th className="py-3.5 px-4">Verification</th>
                                                    <th className="py-3.5 px-4">Account Status</th>
                                                    <th className="py-3.5 px-4">Rating</th>
                                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                                {filteredProviders.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="py-8 text-center text-on-surface-variant font-bold">
                                                            No service providers match the current search or filters.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredProviders.map(p => {
                                                        const pStatus = p.status || (p.verified === false ? 'pending' : 'active');
                                                        const isInactive = pStatus === 'deactivated' || pStatus === 'suspended';
                                                        return (
                                                            <tr key={p.id} className="hover:bg-surface-container/20 transition-colors">
                                                                <td className="py-3.5 px-4 sm:px-6">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <ProviderAvatar name={p.name} gender={p.gender} category={p.category} photoURL={p.photoURL || p.image} size="sm" />
                                                                        <div>
                                                                            <p className="font-extrabold text-on-surface">{p.name || 'Provider'}</p>
                                                                            <p className="text-[11px] text-on-surface-variant truncate max-w-[140px]">{p.email || p.phone || 'No direct email'}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3.5 px-4 font-bold capitalize text-primary">{p.category}</td>
                                                                <td className="py-3.5 px-4 text-on-surface-variant">{p.location || 'Mangaluru'}</td>
                                                                <td className="py-3.5 px-4">
                                                                    {p.verified !== false && p.verificationStatus !== 'rejected' ? (
                                                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                                                                            <Check className="w-3 h-3" /> Verified
                                                                        </span>
                                                                    ) : p.verificationStatus === 'rejected' ? (
                                                                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold text-[10px] w-fit">
                                                                            Rejected
                                                                        </span>
                                                                    ) : (
                                                                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px] w-fit">
                                                                            Pending
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3.5 px-4">
                                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                                                        pStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                                                                        pStatus === 'deactivated' ? 'bg-gray-100 text-gray-700' :
                                                                        pStatus === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                                                        'bg-amber-100 text-amber-800'
                                                                    }`}>
                                                                        {pStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3.5 px-4 font-bold text-amber-600">
                                                                    {p.rating ? `★ ${p.rating}` : 'New'}
                                                                </td>
                                                                <td className="py-3.5 px-4 text-right">
                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                        <button
                                                                            onClick={() => setSelectedProviderModal(p)}
                                                                            className="p-1.5 rounded-lg hover:bg-surface-container text-[#004d4c] transition-colors cursor-pointer"
                                                                            title="View full provider profile & credentials"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                        </button>

                                                                        {isInactive ? (
                                                                            <button
                                                                                onClick={() => handleReactivateProvider(p)}
                                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer font-bold text-[10px] sm:text-[11px] flex items-center gap-1.5 border border-emerald-200/60 shadow-2xs"
                                                                                title="Reactivate this provider account"
                                                                            >
                                                                                <RefreshCw className="w-3.5 h-3.5" /> Reactivate
                                                                            </button>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => setSuspensionModal({ providerId: p.id, providerName: p.name, currentStatus: pStatus })}
                                                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                                                                                    title="Suspend provider"
                                                                                >
                                                                                    <Ban className="w-4 h-4" />
                                                                                </button>

                                                                                <button
                                                                                    onClick={() => handleDeactivateProvider(p)}
                                                                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                                                                                    title="Deactivate account"
                                                                                >
                                                                                    <XCircle className="w-4 h-4" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 3: VERIFICATION QUEUE ─────────────────────────────── */}
                        {activeTab === 'verifications' && (
                            <div className="space-y-4">
                                <div className="bg-[#e6f4f1] p-4 rounded-2xl border border-[#004d4c]/15 text-xs text-[#004d4c] space-y-1">
                                    <p className="font-extrabold text-sm">Provider Identity &amp; Onboarding Verification</p>
                                    <p className="text-[11px] text-on-surface-variant font-medium">
                                        Review new service partners before granting the platform verified trust badge. Rejection requires a mandatory reason sent to the provider.
                                    </p>
                                </div>

                                {verificationQueue.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-10 text-center border border-outline-variant/30 space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                                            ✓
                                        </div>
                                        <h3 className="font-bold text-base text-on-surface">Queue Cleared!</h3>
                                        <p className="text-xs text-on-surface-variant">All registered service providers have been verified or addressed.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {verificationQueue.map(p => (
                                            <div key={p.id} className="bg-white p-5 rounded-3xl border border-outline-variant/30 shadow-2xs space-y-4 text-xs">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <ProviderAvatar name={p.name} gender={p.gender} category={p.category} photoURL={p.photoURL || p.image} size="md" />
                                                        <div>
                                                            <h4 className="font-extrabold text-sm text-on-surface">{p.name}</h4>
                                                            <p className="text-primary font-bold capitalize">{p.category} • {p.location || 'Mangaluru'}</p>
                                                            <p className="text-on-surface-variant text-[11px]">{p.phone || p.email || 'No phone recorded'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                                        Awaiting Review
                                                    </span>
                                                </div>

                                                <div className="bg-surface-container/30 p-3 rounded-xl space-y-1 text-[11px]">
                                                    <p className="font-bold text-on-surface">Service Description:</p>
                                                    <p className="text-on-surface-variant line-clamp-3">{p.description || 'No detailed service description entered yet.'}</p>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span>Experience: <strong className="text-on-surface">{p.experienceYears || '3'} Years</strong></span>
                                                    <span>Base Price: <strong className="text-on-surface">{formatCurrency(p.price)}</strong></span>
                                                    <span>Portfolio Work: <strong className="text-on-surface">{Array.isArray(p.portfolio) ? p.portfolio.length : 0} items</strong></span>
                                                </div>

                                                {Array.isArray(p.portfolio) && p.portfolio.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setGalleryPreview({ images: p.portfolio, name: p.name })}
                                                        className="text-[11px] font-bold text-[#004d4c] hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Preview Uploaded Work Portfolio ({p.portfolio.length})
                                                    </button>
                                                )}

                                                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                                                    <button
                                                        onClick={() => handleVerifyProvider(p.id)}
                                                        disabled={processingAction}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Approve &amp; Verify
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectionModal({ providerId: p.id, providerName: p.name })}
                                                        disabled={processingAction}
                                                        className="flex-1 py-2 bg-surface-container hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition-colors border border-outline-variant/30 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" /> Reject with Reason
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── TAB 4: CUSTOMERS MANAGEMENT ────────────────────────────── */}
                        {activeTab === 'customers' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant border-b border-outline-variant/30">
                                                    <th className="py-3.5 px-4 sm:px-6">Customer Name</th>
                                                    <th className="py-3.5 px-4">Email Address</th>
                                                    <th className="py-3.5 px-4">Account Status</th>
                                                    <th className="py-3.5 px-4">Joined Date</th>
                                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                                {filteredCustomers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-8 text-center text-on-surface-variant font-bold">
                                                            No customers found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredCustomers.map(c => {
                                                        const isRestricted = c.status === 'restricted';
                                                        return (
                                                            <tr key={c.id} className="hover:bg-surface-container/20 transition-colors">
                                                                <td className="py-3.5 px-4 sm:px-6 font-bold text-on-surface">
                                                                    {c.fullName || c.name || 'Customer'}
                                                                </td>
                                                                <td className="py-3.5 px-4 text-on-surface-variant">{c.email}</td>
                                                                <td className="py-3.5 px-4">
                                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                                        isRestricted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                                                                    }`}>
                                                                        {isRestricted ? 'Restricted' : 'Active'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3.5 px-4 text-on-surface-variant">{formatDate(c.createdAt)}</td>
                                                                <td className="py-3.5 px-4 text-right">
                                                                    {isRestricted ? (
                                                                        <button
                                                                            onClick={() => setCustomerRestrictModal({ customerId: c.id, customerName: c.fullName || c.name, newStatus: 'active' })}
                                                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                                                                        >
                                                                            Reactivate
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setCustomerRestrictModal({ customerId: c.id, customerName: c.fullName || c.name, newStatus: 'restricted' })}
                                                                            className="px-2.5 py-1 bg-red-50 text-red-600 font-bold text-[10px] rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                                                                        >
                                                                            Restrict
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 5: BOOKINGS OVERSIGHT ──────────────────────────────── */}
                        {activeTab === 'bookings' && (
                            <div className="space-y-4">
                                {/* Booking Filter */}
                                <div className="bg-white p-3 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-on-surface-variant">Status:</span>
                                        <select
                                            value={bookingStatusFilter}
                                            onChange={(e) => setBookingStatusFilter(e.target.value)}
                                            className="bg-surface-container/50 border border-outline-variant/40 rounded-xl px-2.5 py-1 font-bold text-on-surface outline-none"
                                        >
                                            <option value="all">All ({bookings.length})</option>
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted / In-Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="rejected">Rejected / Cancelled</option>
                                        </select>
                                    </div>
                                    <span className="font-bold text-on-surface-variant">
                                        Showing {filteredBookings.length} bookings
                                    </span>
                                </div>

                                <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant border-b border-outline-variant/30">
                                                    <th className="py-3.5 px-4 sm:px-6">Booking ID</th>
                                                    <th className="py-3.5 px-4">Customer</th>
                                                    <th className="py-3.5 px-4">Provider</th>
                                                    <th className="py-3.5 px-4">Service</th>
                                                    <th className="py-3.5 px-4">Status</th>
                                                    <th className="py-3.5 px-4">Amount</th>
                                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                                {filteredBookings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="py-8 text-center text-on-surface-variant font-bold">
                                                            No bookings recorded matching current filters.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredBookings.map(b => (
                                                        <tr key={b.id} className="hover:bg-surface-container/20 transition-colors">
                                                            <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-primary">
                                                                #{b.id?.slice(0, 8)}
                                                                {b.flagged && (
                                                                    <span className="ml-1.5 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-sans font-bold">FLAGGED</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3.5 px-4 font-bold text-on-surface">{b.userName || 'Customer'}</td>
                                                            <td className="py-3.5 px-4 font-bold text-on-surface">{b.providerName || 'Provider'}</td>
                                                            <td className="py-3.5 px-4 capitalize">{b.category || 'General'}</td>
                                                            <td className="py-3.5 px-4">
                                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                                                    b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                                    b.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                                                    b.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                    'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {b.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3.5 px-4 font-bold">{formatCurrency(b.price)}</td>
                                                            <td className="py-3.5 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={() => setBookingDetailModal(b)}
                                                                        className="p-1 rounded-md hover:bg-surface-container text-[#004d4c] cursor-pointer"
                                                                        title="View full booking detail"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    {!b.flagged && (
                                                                        <button
                                                                            onClick={() => setFlagModal({ bookingId: b.id })}
                                                                            className="p-1 rounded-md hover:bg-red-50 text-red-600 cursor-pointer"
                                                                            title="Flag booking for investigation"
                                                                        >
                                                                            <AlertTriangle className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 6: COMPLAINTS & REPORTS ────────────────────────────── */}
                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs">
                                    <h3 className="font-extrabold text-sm text-on-surface">User Complaints &amp; Resolution Queue</h3>
                                    <span className="font-bold text-red-600">{openReportsCount} Pending Resolution</span>
                                </div>

                                {reports.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-10 text-center border border-outline-variant/30 space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                                            ✓
                                        </div>
                                        <h3 className="font-bold text-base text-on-surface">Zero Platform Complaints!</h3>
                                        <p className="text-xs text-on-surface-variant">There are currently no active complaint filings recorded in the database.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {reports.map(r => (
                                            <div key={r.id} className="bg-white p-5 rounded-3xl border border-outline-variant/30 shadow-2xs space-y-3 text-xs">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                                                    <div>
                                                        <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                                            {r.type} Dispute
                                                        </span>
                                                        <h4 className="font-bold text-sm text-on-surface mt-1">
                                                            Against: {r.targetName || `#${r.targetId?.slice(0, 8)}`}
                                                        </h4>
                                                        <p className="text-on-surface-variant text-[11px]">
                                                            Reported by {r.reporterName} ({r.reporterEmail}) on {formatDate(r.createdAt)}
                                                        </p>
                                                    </div>

                                                    <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider self-start sm:self-auto ${
                                                        r.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                                                        r.status === 'dismissed' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        Status: {r.status}
                                                    </span>
                                                </div>

                                                <div className="bg-surface-container/30 p-3 rounded-xl text-on-surface text-[12px] leading-relaxed">
                                                    {r.description}
                                                </div>

                                                {r.resolutionNotes && (
                                                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-900 text-[11px] border border-emerald-200">
                                                        <strong>Resolution Notes:</strong> {r.resolutionNotes}
                                                    </div>
                                                )}

                                                {r.status !== 'resolved' && r.status !== 'dismissed' && (
                                                    <div className="flex items-center justify-end gap-2 pt-1">
                                                        <button
                                                            onClick={() => setReportResolveModal({ reportId: r.id, status: 'resolved' })}
                                                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                                        >
                                                            Resolve Complaint
                                                        </button>
                                                        <button
                                                            onClick={() => setReportResolveModal({ reportId: r.id, status: 'dismissed' })}
                                                            className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── TAB 7: REVIEWS MODERATION ──────────────────────────────── */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs">
                                    <h3 className="font-extrabold text-sm text-on-surface">Customer Reviews Moderation</h3>
                                    <span className="font-bold text-on-surface-variant">Total: {reviews.length} reviews</span>
                                </div>

                                {reviews.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-10 text-center border border-outline-variant/30 text-on-surface-variant text-xs">
                                        No customer reviews currently logged.
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xs">
                                        <div className="divide-y divide-outline-variant/20 text-xs">
                                            {reviews.map(rev => (
                                                <div key={rev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-3 items-start">
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-amber-500 font-black">★ {rev.rating} / 5</span>
                                                            <span className="font-bold text-on-surface">{rev.customerName || 'Customer'}</span>
                                                            <span className="text-on-surface-variant text-[11px]">→ Provider ID: {rev.providerId?.slice(0, 8)}</span>
                                                            {rev.moderated && (
                                                                <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]">REMOVED BY ADMIN</span>
                                                            )}
                                                        </div>
                                                        <p className="text-on-surface text-[12px] leading-relaxed italic">&quot;{rev.comment}&quot;</p>
                                                        <p className="text-[10px] text-on-surface-variant/70">{formatDate(rev.createdAt)}</p>
                                                    </div>

                                                    {!rev.moderated && (
                                                        <button
                                                            onClick={() => setReviewModerateModal({ reviewId: rev.id, providerId: rev.providerId })}
                                                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0"
                                                        >
                                                            Remove Review
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── TAB 8: AUDIT TRAIL LOG ─────────────────────────────────── */}
                        {activeTab === 'audit' && (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs">
                                    <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" /> Immutable Administrative Audit Trail
                                    </h3>
                                    <span className="font-bold text-on-surface-variant">{auditLogs.length} Records</span>
                                </div>

                                <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant border-b border-outline-variant/30">
                                                    <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                                                    <th className="py-3.5 px-4">Action</th>
                                                    <th className="py-3.5 px-4">Target Type &amp; ID</th>
                                                    <th className="py-3.5 px-4">Administrator</th>
                                                    <th className="py-3.5 px-4">Reason / Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                                {auditLogs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-8 text-center text-on-surface-variant font-bold">
                                                            No audit log records yet.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    auditLogs.map(log => (
                                                        <tr key={log.id} className="hover:bg-surface-container/20 transition-colors">
                                                            <td className="py-3 px-4 sm:px-6 text-on-surface-variant font-mono text-[11px]">
                                                                {formatDate(log.timestamp)}
                                                            </td>
                                                            <td className="py-3 px-4 font-black uppercase text-primary text-[10px]">
                                                                {log.action}
                                                            </td>
                                                            <td className="py-3 px-4 font-bold text-on-surface">
                                                                {log.targetType} #{log.targetId?.slice(0, 8)}
                                                            </td>
                                                            <td className="py-3 px-4 text-on-surface-variant truncate max-w-[150px]">
                                                                {log.adminEmail || log.adminUid}
                                                            </td>
                                                            <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                                                                {log.reason || '—'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 9: PLATFORM SETTINGS ──────────────────────────────── */}
                        {activeTab === 'settings' && (
                            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-2xs space-y-6 text-xs max-w-2xl">
                                <div>
                                    <h3 className="font-black text-lg text-on-surface">Platform Operations Configuration</h3>
                                    <p className="text-on-surface-variant text-xs mt-0.5">Control regional coverage areas and customer announcement notices.</p>
                                </div>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (isPreviewMode) {
                                            toast.error('Action Locked in Preview Mode — Saving platform configuration requires verified administrator authorization (admin: true).', { icon: '🔒' });
                                            return;
                                        }
                                        setProcessingAction(true);
                                        try {
                                            await updatePlatformSettings(platformConfig, adminActor);
                                            toast.success('Platform configuration saved and audit logged!');
                                        } catch (err) {
                                            toast.error(err.message || 'Failed to save settings.');
                                        } finally {
                                            setProcessingAction(false);
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block font-bold text-on-surface uppercase tracking-wider mb-1">
                                            Supported Coverage Districts (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={Array.isArray(platformConfig.supportedCities) ? platformConfig.supportedCities.join(', ') : ''}
                                            onChange={(e) => setPlatformConfig(prev => ({
                                                ...prev,
                                                supportedCities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                            }))}
                                            className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-on-surface uppercase tracking-wider mb-1">
                                            Platform Wide Announcement Notice
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={platformConfig.announcement || ''}
                                            onChange={(e) => setPlatformConfig(prev => ({ ...prev, announcement: e.target.value }))}
                                            placeholder="Optional banner message displayed to all platform users..."
                                            className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={processingAction}
                                            className="px-6 py-2.5 bg-[#004d4c] hover:bg-[#003837] text-white rounded-xl font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                                        >
                                            {processingAction ? 'Saving...' : 'Save Configuration'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </main>
                </div>

                {/* ─── MODAL: SUSPEND PROVIDER WITH MANDATORY REASON ───────────── */}
                {suspensionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                                    <Ban className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-on-surface">Suspend Service Provider</h3>
                                    <p className="text-xs text-on-surface-variant">{suspensionModal.providerName}</p>
                                </div>
                            </div>
                            <form onSubmit={handleConfirmSuspension} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                                        Mandatory Suspension Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={suspensionReason}
                                        onChange={(e) => setSuspensionReason(e.target.value)}
                                        placeholder="Explain terms violation, customer complaints, or safety issues..."
                                        className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-red-500 resize-none"
                                        required
                                    />
                                    <p className="text-[11px] text-on-surface-variant mt-1">
                                        This reason will be visible to the provider on their dashboard and recorded in the audit trail.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setSuspensionModal(null); setSuspensionReason(''); }}
                                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingAction ? 'Suspending...' : 'Confirm Suspension'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: REJECT VERIFICATION WITH REASON ─────────────────── */}
                {rejectionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
                            <h3 className="font-black text-base text-on-surface">Reject Provider Verification</h3>
                            <p className="text-xs text-on-surface-variant">Provide feedback to <span className="font-bold">{rejectionModal.providerName}</span> on why verification was rejected.</p>
                            <form onSubmit={handleConfirmRejectVerification} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                                        Rejection Feedback / Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="e.g. Please provide a clear profile photo and valid service description..."
                                        className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setRejectionModal(null); setRejectionReason(''); }}
                                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingAction ? 'Rejecting...' : 'Reject Verification'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: RESTRICT CUSTOMER ACCOUNT ───────────────────────── */}
                {customerRestrictModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
                            <h3 className="font-black text-base text-on-surface">
                                {customerRestrictModal.newStatus === 'restricted' ? 'Restrict Customer Account' : 'Reactivate Customer Account'}
                            </h3>
                            <p className="text-xs text-on-surface-variant">
                                Customer: <span className="font-bold">{customerRestrictModal.customerName}</span>
                            </p>
                            <form onSubmit={handleConfirmCustomerRestriction} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                                        Administrative Reason
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={restrictionReason}
                                        onChange={(e) => setRestrictionReason(e.target.value)}
                                        placeholder="Reason for restriction or reactivation..."
                                        className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setCustomerRestrictModal(null); setRestrictionReason(''); }}
                                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-[#004d4c] text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingAction ? 'Saving...' : 'Confirm Action'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: FLAG BOOKING ────────────────────────────────────── */}
                {flagModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
                            <h3 className="font-black text-base text-on-surface">Flag Booking for Investigation</h3>
                            <form onSubmit={handleConfirmFlagBooking} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                                        Flag Reason / Investigation Note
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={flagReason}
                                        onChange={(e) => setFlagReason(e.target.value)}
                                        placeholder="e.g. Unusually high billing discrepancy reported..."
                                        className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setFlagModal(null); setFlagReason(''); }}
                                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingAction ? 'Flagging...' : 'Confirm Flag'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: RESOLVE / DISMISS REPORT ────────────────────────── */}
                {reportResolveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
                            <h3 className="font-black text-base text-on-surface">
                                {reportResolveModal.status === 'resolved' ? 'Resolve Complaint Ticket' : 'Dismiss Complaint Ticket'}
                            </h3>
                            <form onSubmit={handleConfirmResolveReport} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                                        Resolution Notes &amp; Findings <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder="Document actions taken or reasons for dismissal..."
                                        className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setReportResolveModal(null); setResolutionNotes(''); }}
                                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-[#004d4c] text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingAction ? 'Submitting...' : 'Save Resolution'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: MODERATE REVIEW ─────────────────────────────────── */}
                {reviewModerateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
                            <h3 className="font-black text-base text-on-surface">Moderate / Remove Review</h3>
                            <p className="text-xs text-on-surface-variant">Removing this review will hide it from customer view and recalculate the provider average rating.</p>
                            <form onSubmit={handleConfirmModerateReview} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                                        Moderation Justification <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={moderationReason}
                                        onChange={(e) => setModerationReason(e.target.value)}
                                        placeholder="State guideline violation (e.g. Hate speech, spam, irrelevant content)..."
                                        className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs outline-none focus:border-red-500 resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setReviewModerateModal(null); setModerationReason(''); }}
                                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAction}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingAction ? 'Removing...' : 'Confirm Removal'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: FULL PROVIDER PROFILE DETAILS ───────────────────── */}
                {selectedProviderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/40 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <ProviderAvatar name={selectedProviderModal.name} gender={selectedProviderModal.gender} category={selectedProviderModal.category} photoURL={selectedProviderModal.photoURL || selectedProviderModal.image} size="lg" />
                                    <div>
                                        <h3 className="font-black text-lg text-on-surface">{selectedProviderModal.name}</h3>
                                        <p className="font-bold text-primary capitalize">{selectedProviderModal.category} • {selectedProviderModal.location || 'Mangaluru'}</p>
                                        <p className="text-on-surface-variant text-[11px]">{selectedProviderModal.email || 'No email registered'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProviderModal(null)}
                                    className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container/30 p-3.5 rounded-2xl text-[11px]">
                                <div>
                                    <p className="text-on-surface-variant">Rate:</p>
                                    <p className="font-bold text-on-surface">{formatCurrency(selectedProviderModal.price)}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Experience:</p>
                                    <p className="font-bold text-on-surface">{selectedProviderModal.experienceYears || '3'} Years</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Rating:</p>
                                    <p className="font-bold text-amber-600">{selectedProviderModal.rating ? `★ ${selectedProviderModal.rating} (${selectedProviderModal.ratingCount || 0})` : 'New'}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Phone:</p>
                                    <p className="font-bold text-on-surface">{selectedProviderModal.phone || '—'}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Service Description</p>
                                <p className="text-on-surface leading-relaxed bg-surface-container/20 p-3 rounded-xl">
                                    {selectedProviderModal.description || 'No detailed description provided.'}
                                </p>
                            </div>

                            {Array.isArray(selectedProviderModal.skills) && selectedProviderModal.skills.length > 0 && (
                                <div className="space-y-1">
                                    <p className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Skills &amp; Capabilities</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedProviderModal.skills.map((s, idx) => (
                                            <span key={idx} className="bg-surface-container px-2.5 py-1 rounded-full font-bold text-[10px] text-on-surface">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(selectedProviderModal.portfolio) && selectedProviderModal.portfolio.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Portfolio Work Preview ({selectedProviderModal.portfolio.length})</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedProviderModal.portfolio.slice(0, 3).map((img, i) => (
                                            <img
                                                key={i}
                                                src={typeof img === 'string' ? img : img.url}
                                                alt="work"
                                                className="w-full h-24 object-cover rounded-xl border border-outline-variant/30"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
                                <button
                                    type="button"
                                    onClick={() => setSelectedProviderModal(null)}
                                    className="px-4 py-2 bg-surface-container rounded-xl font-bold text-xs text-on-surface hover:bg-surface-container-high cursor-pointer"
                                >
                                    Close
                                </button>
                                {(selectedProviderModal.status === 'deactivated' || selectedProviderModal.status === 'suspended') && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await handleReactivateProvider(selectedProviderModal);
                                        }}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Reactivate Account
                                    </button>
                                )}
                                {(!selectedProviderModal.verified || selectedProviderModal.verificationStatus === 'pending') && (
                                    <button
                                        type="button"
                                        onClick={() => handleVerifyProvider(selectedProviderModal.id)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                                    >
                                        Verify Provider
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: FULL BOOKING DETAILS ────────────────────────────── */}
                {bookingDetailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4 text-xs">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-black text-base text-on-surface">Booking #{bookingDetailModal.id?.slice(0, 8)}</h3>
                                    <p className="text-on-surface-variant text-[11px]">{formatDate(bookingDetailModal.timestamp)}</p>
                                </div>
                                <button
                                    onClick={() => setBookingDetailModal(null)}
                                    className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-surface-container/30 p-3.5 rounded-2xl">
                                <div>
                                    <p className="text-on-surface-variant text-[11px]">Customer:</p>
                                    <p className="font-bold text-on-surface">{bookingDetailModal.userName}</p>
                                    <p className="text-[10px] text-on-surface-variant">{bookingDetailModal.userEmail}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant text-[11px]">Provider:</p>
                                    <p className="font-bold text-on-surface">{bookingDetailModal.providerName}</p>
                                    <p className="text-[10px] text-primary capitalize">{bookingDetailModal.category}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="font-bold text-on-surface">Scheduled Appointment:</p>
                                <p className="text-on-surface-variant">{bookingDetailModal.date || 'Jul 30, 2026'}, {bookingDetailModal.slot}</p>
                                <p className="font-bold text-on-surface pt-1">Service Address:</p>
                                <p className="text-on-surface-variant">{bookingDetailModal.address || 'Standard local address'}</p>
                                {bookingDetailModal.notes && (
                                    <>
                                        <p className="font-bold text-on-surface pt-1">Special Instructions:</p>
                                        <p className="text-on-surface-variant italic">&quot;{bookingDetailModal.notes}&quot;</p>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
                                <div>
                                    <span className="text-on-surface-variant">Amount: </span>
                                    <strong className="text-base text-on-surface">{formatCurrency(bookingDetailModal.price)}</strong>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBookingDetailModal(null)}
                                    className="px-4 py-2 bg-surface-container rounded-xl font-bold text-xs text-on-surface cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── MODAL: PORTFOLIO GALLERY LIGHTBOX ──────────────────────── */}
                <PortfolioGalleryModal
                    isOpen={!!galleryPreview}
                    onClose={() => setGalleryPreview(null)}
                    images={galleryPreview?.images || []}
                    providerName={galleryPreview?.name || 'Provider Work'}
                />

                <Footer />
            </div>
        </PageTransition>
    );
};

export default AdminDashboard;
