import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getAllProviders } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import {
    MapPin, Search, Star, ShieldCheck, SlidersHorizontal,
    ArrowRight
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
        image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
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
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
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
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
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
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
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
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        skills: ['Sofa Shampoo', 'Bathroom Sanitization', 'Kitchen Scrub']
    }
];

const SearchResults = () => {
    const [searchParams] = useSearchParams();

    const categoryParam = searchParams.get('category') || '';
    const queryParam = searchParams.get('q') || '';
    const cityParam = searchParams.get('city') || 'Mangaluru';

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [searchQuery, setSearchQuery] = useState(queryParam);
    const [distanceRange, setDistanceRange] = useState(5);
    const [minRating, setMinRating] = useState(0);
    const [priceTier, setPriceTier] = useState('all');

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted && loading) {
                setProviders(DEMO_PROVIDERS);
                setLoading(false);
            }
        }, 1000);

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
                <main className="max-w-container-max mx-auto px-6 lg:px-8 py-8 flex-1 w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                            {filteredProviders.length} Professionals found in {cityParam}
                        </h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Top-rated certified experts near Bejai, Hampankatta and surrounding areas
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* FILTERS SIDEBAR (3 Cols) */}
                        <aside className="lg:col-span-3 flex flex-col gap-6">
                            {/* Map Preview */}
                            <div className="rounded-2xl overflow-hidden border border-outline-variant/30 relative h-48 bg-surface-container shadow-xs">
                                <div className="w-full h-full bg-cover bg-center grayscale-[20%] brightness-90 transition-transform duration-700 hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400')" }} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping absolute" />
                                    <MapPin className="w-8 h-8 text-primary fill-primary" />
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 glass-panel p-2.5 rounded-xl border border-white/20 flex justify-between items-center text-xs font-bold text-on-surface shadow-md">
                                    <span>View Map</span>
                                    <span className="text-primary font-bold">Open →</span>
                                </div>
                            </div>

                            {/* Filters Card */}
                            <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-xs flex flex-col gap-6">
                                <div>
                                    <h3 className="font-label-md text-label-md mb-3 flex justify-between items-center">
                                        <span>Distance</span>
                                        <span className="text-primary font-bold text-xs">Within {distanceRange}km</span>
                                    </h3>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={distanceRange}
                                        onChange={(e) => setDistanceRange(Number(e.target.value))}
                                        className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between mt-1 text-label-sm font-label-sm text-on-surface-variant">
                                        <span>1km</span>
                                        <span>20km</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-label-md text-label-md mb-3">Price Range</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPriceTier('low')}
                                            className={`flex-1 py-2 border rounded-lg text-label-sm font-label-sm transition-all ${priceTier === 'low' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}
                                        >
                                            ₹
                                        </button>
                                        <button
                                            onClick={() => setPriceTier('mid')}
                                            className={`flex-1 py-2 border rounded-lg text-label-sm font-label-sm transition-all ${priceTier === 'mid' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}
                                        >
                                            ₹₹
                                        </button>
                                        <button
                                            onClick={() => setPriceTier('high')}
                                            className={`flex-1 py-2 border rounded-lg text-label-sm font-label-sm transition-all ${priceTier === 'high' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}
                                        >
                                            ₹₹₹
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-label-md text-label-md mb-3">Minimum Rating</h3>
                                    <div className="flex flex-col gap-2">
                                        {[4.5, 4.0, 3.5].map(stars => (
                                            <label key={stars} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="ratingFilter"
                                                    checked={minRating === stars}
                                                    onChange={() => setMinRating(stars)}
                                                    className="accent-primary cursor-pointer"
                                                />
                                                <span className="text-body-sm group-hover:text-primary transition-colors font-medium">
                                                    {stars} & up
                                                </span>
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 ml-auto" />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* PROVIDER CARDS LIST (9 Cols) */}
                        <main className="lg:col-span-9 flex flex-col gap-6">
                            {loading ? (
                                <LoadingSpinner text="Searching verified service providers..." />
                            ) : filteredProviders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-outline-variant/30 space-y-4">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                                        🔍
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-on-surface">No Service Providers Found</h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                                        We couldn't find any professionals matching your exact filter criteria. Try resetting filters.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setSearchQuery('');
                                            setMinRating(0);
                                            setPriceTier('all');
                                        }}
                                        className="sh-btn-primary"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                filteredProviders.map(provider => {
                                    const catInfo = SERVICE_CATEGORIES.find(c => c.id === provider.category);
                                    return (
                                        <article
                                            key={provider.id}
                                            className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-6 relative overflow-hidden items-stretch"
                                        >
                                            {/* Photo */}
                                            <div className="relative shrink-0">
                                                <img
                                                    className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-inner bg-surface-container"
                                                    src={provider.image || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400'}
                                                    alt={provider.name}
                                                />
                                                <span className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-label-sm font-label-sm flex items-center gap-1 shadow-sm border border-white/50">
                                                    <ShieldCheck className="w-3 h-3 shrink-0" /> Verified
                                                </span>
                                            </div>

                                            {/* Content Details */}
                                            <div className="flex-1 flex flex-col justify-between space-y-3">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h2 className="font-headline-md text-headline-md text-on-surface">{provider.name}</h2>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-primary font-label-md capitalize">{catInfo?.label || provider.category}</span>
                                                                <span className="w-1 h-1 bg-outline-variant rounded-full" />
                                                                <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                                                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                                    {provider.rating || 4.9} ({provider.ratingCount || 100}+ jobs)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Price Tag */}
                                                        <div className="text-right">
                                                            <p className="font-headline-md text-headline-md text-primary">₹{provider.price || 399}</p>
                                                            <p className="font-label-sm text-label-sm text-on-surface-variant">per service</p>
                                                        </div>
                                                    </div>

                                                    <p className="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                                                        {provider.description}
                                                    </p>

                                                    {/* Skill Badges */}
                                                    <div className="flex flex-wrap gap-1.5 pt-3">
                                                        {(provider.skills || ['Quick Arrival', 'Fixed Price', '30-Day Warranty']).map((skill, i) => (
                                                            <span key={i} className="bg-surface-container px-3 py-1 rounded-full text-label-sm font-label-sm text-on-surface-variant">
                                                                ✓ {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20 mt-auto">
                                                    <Link
                                                        to={`/provider/${provider.id}`}
                                                        className="sh-btn-outline !h-9 !px-4 !text-xs"
                                                    >
                                                        View Profile & Reviews
                                                    </Link>
                                                    <Link
                                                        to={`/checkout/${provider.id}`}
                                                        className="sh-btn-primary !h-9 !px-5 !text-xs"
                                                    >
                                                        Instant Book <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
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
