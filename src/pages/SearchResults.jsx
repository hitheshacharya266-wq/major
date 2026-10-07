import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAllProviders, getProviderStats } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES, formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';
import { Search, Star, ShieldCheck, ArrowRight, Filter, SlidersHorizontal } from 'lucide-react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();

    const categoryParam = searchParams.get('category') || '';
    const queryParam = searchParams.get('q') || '';
    const cityParam = searchParams.get('city') || 'Mangaluru';

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [searchQuery, setSearchQuery] = useState(queryParam);
    const [distanceRange, setDistanceRange] = useState(10);
    const [minRating, setMinRating] = useState(0);
    const [priceTier, setPriceTier] = useState('all');
    const [availability, setAvailability] = useState('now');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchProviders = async () => {
            try {
                const dbProviders = await getAllProviders();
                
                // Enhance each provider with real rating from reviews without touching protected bookings
                const enhanced = await Promise.all(
                    dbProviders.map(async (p) => {
                        const providerId = p.uid || p.id;
                        let stats = { rating: null, ratingCount: 0, completedJobsCount: 0 };
                        try {
                            // Public stats query only checks reviews, NEVER protected bookings
                            stats = await getProviderStats(providerId, false);
                        } catch (statsErr) {
                            console.warn(`Could not load stats for provider ${providerId}:`, statsErr);
                        }
                        return {
                            ...p,
                            id: providerId,
                            rating: stats.rating ?? p.rating ?? null,
                            ratingCount: (stats.ratingCount > 0 ? stats.ratingCount : null) ?? p.ratingCount ?? 0,
                            completedJobsCount: p.completedJobsCount ?? p.completedJobs ?? stats.completedJobsCount ?? 0
                        };
                    })
                );

                if (isMounted) {
                    setProviders(enhanced);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading providers from Firestore:', err);
                if (isMounted) {
                    setProviders([]);
                    setLoading(false);
                }
            }
        };

        fetchProviders();
        return () => {
            isMounted = false;
        };
    }, []);

    // Filter providers with robust case-insensitive category & query matching
    const filteredProviders = useMemo(() => {
        const normSelectedCat = String(selectedCategory || '').trim().toLowerCase();
        const normSearchQuery = String(searchQuery || '').trim().toLowerCase();

        return providers.filter(p => {
            const pCat = String(p.category || '').trim().toLowerCase();
            const matchesCategory = !normSelectedCat || pCat === normSelectedCat;

            const matchesQuery = !normSearchQuery ||
                String(p.name || '').toLowerCase().includes(normSearchQuery) ||
                pCat.includes(normSearchQuery) ||
                String(p.description || '').toLowerCase().includes(normSearchQuery);

            const pRating = typeof p.rating === 'number' ? p.rating : 4.8;
            const matchesRating = pRating >= minRating;

            const priceVal = (typeof p.price === 'number' && p.price > 0) ? p.price : 399;
            const matchesPrice = priceTier === 'all' ||
                (priceTier === 'low' && priceVal <= 350) ||
                (priceTier === 'mid' && priceVal > 350 && priceVal <= 500) ||
                (priceTier === 'high' && priceVal > 500);

            const matchesAvailable = p.available !== false;

            return matchesCategory && matchesQuery && matchesRating && matchesPrice && matchesAvailable;
        });
    }, [providers, selectedCategory, searchQuery, minRating, priceTier]);

    const resetFilters = () => {
        setSelectedCategory('');
        setSearchQuery('');
        setMinRating(0);
        setPriceTier('all');
        setDistanceRange(10);
        setAvailability('now');
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-sans text-on-surface overflow-x-hidden w-full max-w-full">
                <main className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 flex-1 w-full min-w-0 space-y-5 sm:space-y-6">
                    
                    {/* Header Banner & Prominent Search Box */}
                    <div className="space-y-4 w-full max-w-full min-w-0">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 w-full max-w-full min-w-0">
                            <div className="space-y-1 text-left w-full lg:w-auto min-w-0">
                                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-on-surface tracking-tight leading-tight break-words">
                                    Top Verified Technicians in {cityParam}
                                </h1>
                                <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                                    Showing {filteredProviders.length} background-verified local experts available today
                                </p>
                            </div>

                            {/* Search Input Box (Fits 100% Mobile Viewport) */}
                            <div className="flex items-center w-full max-w-full lg:w-[380px] h-11 sm:h-12 px-3.5 gap-2.5 bg-white border border-outline-variant/40 rounded-2xl focus-within:border-[#004d4c] focus-within:ring-2 focus-within:ring-[#004d4c]/10 transition-all shadow-2xs shrink-0">
                                <Search className="w-4 h-4 text-on-surface-variant/60 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search plumber, electrician, AC, mechanic..."
                                    className="w-full min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-on-surface"
                                />
                            </div>
                        </div>

                        {/* Category Filter Chips Bar (Self-Contained Horizontal Scroll with min-w-0 Fix) */}
                        <div className="flex items-center justify-between gap-2 pt-1 w-full max-w-full min-w-0">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none flex-1 min-w-0 max-w-full">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer flex items-center justify-center ${!selectedCategory
                                        ? 'bg-[#004d4c] text-white shadow-xs'
                                        : 'bg-white border border-outline-variant/40 text-on-surface-variant hover:border-[#004d4c]'}`}
                                >
                                    All Services
                                </button>
                                {SERVICE_CATEGORIES.map(cat => {
                                    const isSelected = String(selectedCategory || '').trim().toLowerCase() === String(cat.id || '').trim().toLowerCase();
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
                                            className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                                                ? 'bg-[#004d4c] text-white shadow-xs'
                                                : 'bg-white border border-outline-variant/40 text-on-surface-variant hover:border-[#004d4c]'}`}
                                        >
                                            <span className="text-xs sm:text-sm">{cat.emoji}</span>
                                            <span>{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile Filter Toggle Button on Right */}
                            <button
                                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                className="lg:hidden h-9 px-3 rounded-xl bg-white border border-outline-variant/40 text-[#004d4c] font-extrabold text-xs flex items-center gap-1 shrink-0 shadow-2xs"
                                title="Toggle Filters"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-[#004d4c]" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Layout Grid: 4-Col Sidebar + 8-Col Provider Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start w-full max-w-full min-w-0">
                        
                        {/* FILTERS SIDEBAR (Desktop Sticky & Mobile Expandable) */}
                        <aside className={`lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 w-full max-w-full min-w-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-outline-variant/40 shadow-2xs flex flex-col gap-4 text-left w-full">
                                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                                    <h3 className="font-black text-base text-on-surface flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-[#004d4c]" /> Filters
                                    </h3>
                                    <button
                                        onClick={resetFilters}
                                        className="text-xs font-extrabold text-[#004d4c] hover:underline cursor-pointer"
                                    >
                                        Reset All
                                    </button>
                                </div>

                                {/* Distance Filter Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-black text-on-surface uppercase tracking-wider">Distance</span>
                                        <span className="text-[#004d4c] font-black text-xs">Within {distanceRange}km</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="25"
                                        value={distanceRange}
                                        onChange={(e) => setDistanceRange(Number(e.target.value))}
                                        className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#004d4c]"
                                    />
                                    <div className="flex justify-between mt-1 text-[11px] font-bold text-on-surface-variant">
                                        <span>1km</span>
                                        <span>25km</span>
                                    </div>
                                </div>

                                {/* Price Range Filter Buttons */}
                                <div>
                                    <span className="block text-xs font-black text-on-surface uppercase tracking-wider mb-2">Price Range</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPriceTier(priceTier === 'low' ? 'all' : 'low')}
                                            className={`flex-1 py-2 border rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${priceTier === 'low' ? 'border-[#004d4c] bg-[#e6f4f1] text-[#004d4c]' : 'border-outline-variant/40 text-on-surface-variant hover:border-[#004d4c]'}`}
                                        >
                                            ₹ Budget
                                        </button>
                                        <button
                                            onClick={() => setPriceTier(priceTier === 'mid' ? 'all' : 'mid')}
                                            className={`flex-1 py-2 border rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${priceTier === 'mid' ? 'border-[#004d4c] bg-[#e6f4f1] text-[#004d4c]' : 'border-outline-variant/40 text-on-surface-variant hover:border-[#004d4c]'}`}
                                        >
                                            ₹₹ Standard
                                        </button>
                                        <button
                                            onClick={() => setPriceTier(priceTier === 'high' ? 'all' : 'high')}
                                            className={`flex-1 py-2 border rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${priceTier === 'high' ? 'border-[#004d4c] bg-[#e6f4f1] text-[#004d4c]' : 'border-outline-variant/40 text-on-surface-variant hover:border-[#004d4c]'}`}
                                        >
                                            ₹₹₹ Premium
                                        </button>
                                    </div>
                                </div>

                                {/* Minimum Rating Radios */}
                                <div>
                                    <span className="block text-xs font-black text-on-surface uppercase tracking-wider mb-2">Minimum Rating</span>
                                    <div className="flex flex-col gap-2">
                                        {[4.5, 4.0, 3.5, 3.0].map(stars => (
                                            <label key={stars} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="ratingFilter"
                                                    checked={minRating === stars}
                                                    onChange={() => setMinRating(stars)}
                                                    className="accent-[#004d4c] cursor-pointer w-3.5 h-3.5"
                                                />
                                                <span className="text-xs font-bold group-hover:text-[#004d4c] transition-colors">
                                                    {stars} ★ & above
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability Radios */}
                                <div>
                                    <span className="block text-xs font-black text-on-surface uppercase tracking-wider mb-2">Availability</span>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="availabilityFilter"
                                                checked={availability === 'now'}
                                                onChange={() => setAvailability('now')}
                                                className="accent-[#004d4c] cursor-pointer w-3.5 h-3.5"
                                            />
                                            <span className="text-xs font-bold">Available Now</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="availabilityFilter"
                                                checked={availability === 'today'}
                                                onChange={() => setAvailability('today')}
                                                className="accent-[#004d4c] cursor-pointer w-3.5 h-3.5"
                                            />
                                            <span className="text-xs font-bold">Available Today</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="w-full py-2.5 bg-[#004d4c] text-white font-black text-xs rounded-xl hover:bg-[#004d4c]/90 transition-all cursor-pointer shadow-xs"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </aside>

                        {/* PROVIDER CARDS LIST */}
                        <main className="lg:col-span-8 flex flex-col gap-4 sm:gap-5 w-full max-w-full min-w-0">
                            {loading ? (
                                <LoadingSpinner text="Finding verified technicians near you..." />
                            ) : filteredProviders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-outline-variant/40 shadow-2xs space-y-4 w-full">
                                    <div className="w-14 h-14 bg-[#e6f4f1] text-[#004d4c] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                                        🔍
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-on-surface">No Service Providers Found</h3>
                                    <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed font-medium">
                                        No professionals match your current filter selections. Try resetting your search query or price range.
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="h-10 px-6 bg-[#004d4c] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#004d4c]/90 transition-all cursor-pointer inline-flex items-center gap-2 mt-2"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                filteredProviders.map(provider => {
                                    const catInfo = SERVICE_CATEGORIES.find(c => c.id === provider.category);
                                    
                                    // Fallback price logic matching reference screenshot
                                    const priceVal = (typeof provider.price === 'number' && provider.price > 0)
                                        ? provider.price
                                        : (provider.category === 'electrician' ? 450 : provider.category === 'carpenter' ? 600 : provider.category === 'mechanic' ? 330 : 399);

                                    return (
                                        <article
                                            key={provider.id}
                                            className="bg-white rounded-2xl p-4 sm:p-6 border border-outline-variant/40 shadow-2xs hover:shadow-md transition-all duration-300 group flex flex-col sm:flex-row gap-3.5 sm:gap-6 items-start text-left relative overflow-hidden w-full max-w-full min-w-0"
                                        >
                                            {/* Top Section on Mobile / Left Column on Desktop: Avatar + Info Header */}
                                            <div className="flex flex-row sm:flex-col items-start gap-3 sm:gap-4 shrink-0 sm:mx-0 relative w-full sm:w-auto">
                                                <div className="shrink-0 relative">
                                                    <ProviderAvatar name={provider.name} gender={provider.gender} category={provider.category} photoURL={provider.photoURL || provider.image} size="lg" showCategoryBadge />
                                                    <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0 shadow-xs" title="Available Online" />
                                                </div>

                                                {/* Mobile Header Info (Avatar Right Side on Mobile) */}
                                                <div className="flex-1 min-w-0 sm:hidden space-y-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <h2 className="font-black text-base text-on-surface tracking-tight truncate">{provider.name}</h2>
                                                        {provider.verified !== false && (
                                                            <span className="bg-[#e6f4f1] text-[#004d4c] px-2 py-0.5 rounded-full text-[9px] font-extrabold inline-flex items-center gap-0.5 border border-[#004d4c]/20 shrink-0">
                                                                <ShieldCheck className="w-3 h-3 text-[#004d4c] shrink-0" /> Verified
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                                        <span className="text-[#004d4c] font-extrabold capitalize">{catInfo?.emoji} {catInfo?.label || provider.category}</span>
                                                        <span className="w-1 h-1 bg-outline-variant/60 rounded-full" />
                                                        <span className="flex items-center gap-1 font-bold text-amber-600">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                                                            {provider.rating ? provider.rating : 'New'} <span className="text-on-surface-variant font-medium">({provider.ratingCount || 0})</span>
                                                        </span>
                                                    </div>

                                                    <p className="text-[11px] text-on-surface-variant font-medium">
                                                        {provider.completedJobsCount || 0} {provider.completedJobsCount === 1 ? 'job completed' : 'jobs completed'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Main Content & Details */}
                                            <div className="flex-1 flex flex-col justify-between space-y-3 w-full max-w-full min-w-0">
                                                <div className="space-y-2 w-full max-w-full min-w-0">
                                                    
                                                    {/* Desktop Header Row: Name + Verified Badge (Left) & Price Tag (Right) */}
                                                    <div className="hidden sm:flex flex-row justify-between items-start gap-2 w-full">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h2 className="font-black text-xl text-on-surface tracking-tight truncate">{provider.name}</h2>
                                                                {provider.verified !== false && (
                                                                    <span className="bg-[#e6f4f1] text-[#004d4c] px-2 py-0.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1 border border-[#004d4c]/20 shrink-0">
                                                                        <ShieldCheck className="w-3.5 h-3.5 text-[#004d4c] shrink-0" /> Verified
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                                                                <span className="text-[#004d4c] font-extrabold capitalize">{catInfo?.emoji} {catInfo?.label || provider.category}</span>
                                                                <span className="w-1 h-1 bg-outline-variant/60 rounded-full" />
                                                                <span className="flex items-center gap-1 font-bold text-amber-600">
                                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                                                                    {provider.rating ? provider.rating : 'New'} <span className="text-on-surface-variant font-medium">({provider.ratingCount || 0})</span>
                                                                </span>
                                                                <span className="w-1 h-1 bg-outline-variant/60 rounded-full" />
                                                                <span className="text-on-surface-variant font-medium">
                                                                    {provider.completedJobsCount || 0} {provider.completedJobsCount === 1 ? 'job' : 'jobs'} completed
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Price Tag on Desktop */}
                                                        <div className="text-right shrink-0">
                                                            <p className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight">{formatCurrency(priceVal)}</p>
                                                            <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block text-right">PER SERVICE</p>
                                                        </div>
                                                    </div>

                                                    {/* Description Line */}
                                                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-2">
                                                        {provider.description || 'Certified master electrician for home rewiring and AC points.'}
                                                    </p>

                                                    {/* Skill Badges */}
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                        {(provider.skills || ['Quick Arrival', 'Fixed Price', '30-Day Warranty']).map((skill, i) => (
                                                            <span key={i} className="bg-surface-container/60 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold text-on-surface-variant border border-outline-variant/20">
                                                                ✓ {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Mobile Row for Price + Action Buttons */}
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-outline-variant/20 mt-auto w-full max-w-full min-w-0">
                                                    
                                                    {/* Price Tag Row on Mobile */}
                                                    <div className="sm:hidden flex items-center justify-between w-full pb-1">
                                                        <span className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">Service Fee</span>
                                                        <div className="text-right">
                                                            <span className="text-lg font-black text-on-surface">{formatCurrency(priceVal)}</span>
                                                            <span className="text-[9px] font-bold text-on-surface-variant ml-1">PER SERVICE</span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons: View Profile & Instant Book */}
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 w-full">
                                                        <Link
                                                            to={`/provider/${provider.id}`}
                                                            className="w-full sm:w-auto h-9 px-3.5 bg-surface-container text-on-surface font-extrabold text-xs rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center text-center border border-outline-variant/30"
                                                        >
                                                            View Profile & Reviews
                                                        </Link>
                                                        <Link
                                                            to={`/checkout/${provider.id}`}
                                                            className="w-full sm:w-auto h-9 sm:h-10 px-5 bg-[#004d4c] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-[#004d4c]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer shrink-0"
                                                        >
                                                            <span>Instant Book</span>
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}

                            {/* Centered Load More Button */}
                            <div className="text-center pt-3 pb-2 w-full">
                                <button className="px-8 py-2.5 bg-white border border-outline-variant/40 rounded-xl text-xs sm:text-sm font-extrabold text-[#004d4c] hover:bg-surface-container transition-colors cursor-pointer shadow-2xs">
                                    Load More
                                </button>
                            </div>
                        </main>
                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default SearchResults;
