import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getAllProviders } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import {
    MapPin, Search, Star, ShieldCheck, Filter, ChevronDown, SlidersHorizontal,
    CheckCircle2, ArrowRight, Wrench, PhoneCall, Sparkles
} from 'lucide-react';

const DEMO_PROVIDERS = [
    {
        id: 'demo-1',
        name: 'Rahul Kumar',
        category: 'electrician',
        rating: 4.9,
        ratingCount: 128,
        price: 399,
        experience: '8+ Years',
        location: 'Bejai, Mangaluru',
        available: true,
        description: 'Certified master electrician specializing in home rewiring, AC power points, DB box repair, and smart home fittings.',
        image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
        skills: ['EV Charger Install', 'Short Circuit Repair', 'Inverter Wiring']
    },
    {
        id: 'demo-2',
        name: 'Suresh Shetty',
        category: 'plumber',
        rating: 4.8,
        ratingCount: 94,
        price: 349,
        experience: '6+ Years',
        location: 'Kadiyali, Udupi',
        available: true,
        description: 'Expert plumber for bathroom leak detection, overhead tank cleaning, pipe fitting, and high-pressure water pump repair.',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
        skills: ['Leak Detection', 'Tank Cleaning', 'Jaguar Fitting']
    },
    {
        id: 'demo-3',
        name: 'Ganesh Poojary',
        category: 'ac',
        rating: 4.95,
        ratingCount: 156,
        price: 499,
        experience: '10+ Years',
        location: 'Hampankatta, Mangaluru',
        available: true,
        description: 'Authorized AC repair technician. Deep jet foam servicing, gas leak refilling, inverter AC PCB repair with 30-day warranty.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        skills: ['Deep Foam Wash', 'R32 Gas Refill', 'PCB Repair']
    },
    {
        id: 'demo-4',
        name: 'Praveen Acharya',
        category: 'carpenter',
        rating: 4.7,
        ratingCount: 72,
        price: 450,
        experience: '7+ Years',
        location: 'Vidyanagar, Hassan',
        available: true,
        description: 'Custom furniture woodcraft, modular kitchen cabinet repair, door lock installation, and sofa upholstery polish.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
        skills: ['Modular Kitchen', 'Door Locks', 'Plywood Polish']
    },
    {
        id: 'demo-5',
        name: 'Radhika ServiceCare',
        category: 'cleaning',
        rating: 4.9,
        ratingCount: 210,
        price: 699,
        experience: '5+ Years',
        location: 'Manipal, Udupi',
        available: true,
        description: 'Deep house cleaning, sofa shampooing, bathroom sanitization, and move-in/move-out deep scrub with eco-friendly chemicals.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
        skills: ['Sofa Shampoo', 'Bathroom Sanitization', 'Kitchen Scrub']
    }
];

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

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

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted && loading) {
                setProviders(DEMO_PROVIDERS);
                setLoading(false);
            }
        }, 1500);

        const fetchProviders = async () => {
            try {
                const dbProviders = await getAllProviders();
                if (isMounted) {
                    if (dbProviders && dbProviders.length > 0) {
                        setProviders(dbProviders);
                    } else {
                        setProviders(DEMO_PROVIDERS);
                    }
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setProviders(DEMO_PROVIDERS);
                    setLoading(false);
                }
            }
        };

        fetchProviders();
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    // Filter providers
    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const matchesCategory = !selectedCategory || p.category === selectedCategory;
            const matchesQuery = !searchQuery ||
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRating = (p.rating || 4.5) >= minRating;
            const priceVal = p.price || 399;
            const matchesPrice = priceTier === 'all' ||
                (priceTier === 'low' && priceVal <= 350) ||
                (priceTier === 'mid' && priceVal > 350 && priceVal <= 500) ||
                (priceTier === 'high' && priceVal > 500);

            return matchesCategory && matchesQuery && matchesRating && matchesPrice;
        });
    }, [providers, selectedCategory, searchQuery, minRating, priceTier]);

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                {/* RESULTS HEADER */}
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-8 px-6 lg:px-8">
                    <div className="max-w-container-max mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
                                <MapPin className="w-3.5 h-3.5" /> {cityParam} Coverage Area
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-on-surface">
                                {filteredProviders.length} Verified Professionals Found
                            </h1>
                            <p className="text-sm text-on-surface-variant mt-1">
                                Top-rated background-checked technicians near {cityParam} and surrounding districts.
                            </p>
                        </div>

                        {/* Search Input Bar */}
                        <div className="glass-card p-1.5 rounded-xl flex items-center gap-2 max-w-md w-full border border-outline-variant/40">
                            <Search className="w-4 h-4 text-on-surface-variant ml-3 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Refine service or name..."
                                className="bg-transparent border-none outline-none text-sm text-on-surface w-full py-1.5"
                            />
                        </div>
                    </div>
                </section>

                <main className="max-w-container-max mx-auto px-6 lg:px-8 py-10 flex-1 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* FILTERS SIDEBAR */}
                        <aside className="lg:col-span-3 space-y-6">
                            {/* Map Preview Widget */}
                            <div className="rounded-2xl overflow-hidden border border-outline-variant/30 relative h-44 bg-surface-container shadow-xs">
                                <div className="w-full h-full bg-cover bg-center grayscale-[15%] brightness-95" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400')" }} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping absolute" />
                                    <MapPin className="w-8 h-8 text-primary fill-primary" />
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 glass-panel p-2.5 rounded-xl border border-white/20 flex justify-between items-center text-xs font-bold text-on-surface shadow-md">
                                    <span>{cityParam} Live Map</span>
                                    <span className="text-primary">View Full Map →</span>
                                </div>
                            </div>

                            {/* Filter Controls Card */}
                            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs space-y-6">
                                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                                    <h3 className="font-bold text-base flex items-center gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setSearchQuery('');
                                            setMinRating(0);
                                            setPriceTier('all');
                                        }}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        Reset All
                                    </button>
                                </div>

                                {/* Distance Radius */}
                                <div>
                                    <div className="flex justify-between items-center mb-2 text-xs font-bold">
                                        <span className="text-on-surface">Distance Radius</span>
                                        <span className="text-primary font-bold">Within {distanceRange} km</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="30"
                                        value={distanceRange}
                                        onChange={(e) => setDistanceRange(Number(e.target.value))}
                                        className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[11px] text-on-surface-variant font-medium mt-1">
                                        <span>1 km</span>
                                        <span>30 km</span>
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div>
                                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Service Category</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setSelectedCategory('')}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${!selectedCategory ? 'bg-primary text-white shadow-xs' : 'bg-surface-container/50 text-on-surface-variant hover:bg-surface-container'}`}
                                        >
                                            All Categories
                                        </button>
                                        {SERVICE_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${selectedCategory === cat.id ? 'bg-primary text-white shadow-xs' : 'bg-surface-container/50 text-on-surface-variant hover:bg-surface-container'}`}
                                            >
                                                <span>{cat.emoji} {cat.label}</span>
                                                <span className="opacity-75">({cat.count})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Budget Filter</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setPriceTier('low')}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${priceTier === 'low' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                        >
                                            ₹ Budget
                                        </button>
                                        <button
                                            onClick={() => setPriceTier('mid')}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${priceTier === 'mid' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                        >
                                            ₹₹ Standard
                                        </button>
                                        <button
                                            onClick={() => setPriceTier('high')}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${priceTier === 'high' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                        >
                                            ₹₹₹ Premium
                                        </button>
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div>
                                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Minimum Rating</h4>
                                    <div className="space-y-2 text-xs font-medium text-on-surface">
                                        {[4.5, 4.0, 3.5].map(stars => (
                                            <label key={stars} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="ratingFilter"
                                                    checked={minRating === stars}
                                                    onChange={() => setMinRating(stars)}
                                                    className="accent-primary"
                                                />
                                                <span className="group-hover:text-primary transition-colors flex items-center gap-1">
                                                    {stars} ★ & above
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* RESULTS PROVIDER CARDS LIST */}
                        <main className="lg:col-span-9 space-y-6">
                            {loading ? (
                                <LoadingSpinner text="Searching verified service providers..." />
                            ) : filteredProviders.length === 0 ? (
                                <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/30 space-y-4">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                                        🔍
                                    </div>
                                    <h3 className="text-xl font-bold text-on-surface">No Service Providers Found</h3>
                                    <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                                        We couldn't find any professionals matching your exact filter criteria. Try clearing filters or searching for another service.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setSearchQuery('');
                                            setMinRating(0);
                                            setPriceTier('all');
                                        }}
                                        className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                filteredProviders.map(provider => {
                                    const catInfo = SERVICE_CATEGORIES.find(c => c.id === provider.category);
                                    return (
                                        <div
                                            key={provider.id}
                                            className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all flex flex-col sm:flex-row gap-6 relative"
                                        >
                                            {/* Avatar / Image */}
                                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20 relative">
                                                {provider.image ? (
                                                    <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10 text-primary font-extrabold text-3xl flex items-center justify-center">
                                                        {provider.name?.charAt(0) || 'P'}
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-bold text-on-surface">{provider.name}</h3>
                                                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                                                                {catInfo?.label || provider.category}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 font-medium">
                                                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                                                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                                {provider.rating || 4.9} ({provider.ratingCount || 100}+ jobs)
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5 text-primary" /> {provider.location || 'Mangaluru'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Rate */}
                                                    <div className="text-right">
                                                        <p className="text-xl font-extrabold text-primary">₹{provider.price || 399}</p>
                                                        <p className="text-[11px] text-on-surface-variant font-medium">per service / hour</p>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                                                    {provider.description || 'Experienced certified local service professional providing doorstep repairs and maintenance with 30-day warranty.'}
                                                </p>

                                                {/* Skill Chips */}
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {(provider.skills || ['Quick Arrival', 'Fixed Price', 'Warranty']).map((skill, i) => (
                                                        <span key={i} className="bg-surface-container px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-on-surface-variant">
                                                            ✓ {skill}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* CTA Actions */}
                                                <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/20">
                                                    <Link
                                                        to={`/provider/${provider.id}`}
                                                        className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-xs rounded-xl transition-colors"
                                                    >
                                                        View Profile & Reviews
                                                    </Link>
                                                    <Link
                                                        to={`/checkout/${provider.id}`}
                                                        className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-1.5 ml-auto"
                                                    >
                                                        Instant Book <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </main>
                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default SearchResults;
