import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search, MapPin, ShieldCheck, Clock, Award, CheckCircle2,
    Wrench, ArrowRight, Star
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';

const LANDING_CATEGORIES = [
    { id: 'electrician', label: 'Electrician', icon: 'electrical_services', emoji: '⚡' },
    { id: 'plumber', label: 'Plumber', icon: 'plumbing', emoji: '🔧' },
    { id: 'ac', label: 'AC Repair', icon: 'ac_unit', emoji: '❄️' },
    { id: 'cleaning', label: 'Cleaning', icon: 'cleaning_services', emoji: '🧹' },
    { id: 'pest', label: 'Pest Control', icon: 'pest_control', emoji: '🛡️' },
    { id: 'carpenter', label: 'Carpentry', icon: 'construction', emoji: '🪚' }
];

const LandingPage = () => {
    const [city, setCity] = useState('Mangaluru');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e?.preventDefault();
        const queryParams = new URLSearchParams();
        if (city) queryParams.set('city', city);
        if (searchQuery.trim()) queryParams.set('q', searchQuery.trim());
        navigate(`/search?${queryParams.toString()}`);
    };

    const handleCategoryClick = (catId) => {
        navigate(`/search?category=${catId}&city=${encodeURIComponent(city)}`);
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                {/* HERO SECTION */}
                <section className="hero-gradient pt-12 pb-16 px-6 lg:px-8 border-b border-outline-variant/30">
                    <div className="max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-12">
                        {/* Hero Left Column */}
                        <div className="flex-1 space-y-6 text-left">
                            <div className="inline-flex items-center gap-2 bg-secondary-container/30 px-4 py-1.5 rounded-full border border-secondary/20 shadow-xs">
                                <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                                <span className="font-label-sm text-label-sm text-secondary">
                                    Verified Professionals in Coastal Karnataka
                                </span>
                            </div>

                            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
                                Find Trusted Local Services <br className="hidden md:block" /> in Your Neighborhood
                            </h1>

                            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
                                Expert help for your home maintenance in Mangaluru, Hassan, and Udupi. Book verified professionals in under 60 seconds.
                            </p>

                            {/* Search/Location Bar */}
                            <form onSubmit={handleSearch} className="glass-card p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-md max-w-3xl border border-outline-variant/40">
                                <div className="flex-1 flex items-center gap-2 px-4 py-2 border-r border-outline-variant/30 w-full">
                                    <MapPin className="w-5 h-5 text-on-surface-variant shrink-0" />
                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="bg-transparent border-none outline-none font-body-md text-body-md w-full cursor-pointer"
                                    >
                                        <option value="Mangaluru">Mangaluru</option>
                                        <option value="Udupi">Udupi</option>
                                        <option value="Hassan">Hassan</option>
                                    </select>
                                </div>

                                <div className="flex-[1.5] flex items-center gap-2 px-4 py-2 w-full">
                                    <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="PIN code or Service (e.g. Electrician)"
                                        className="bg-transparent border-none outline-none font-body-md text-body-md w-full"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-all active:scale-95 w-full md:w-auto shrink-0"
                                >
                                    Search Now
                                </button>
                            </form>

                            {/* Popular Search Pills */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="font-label-sm text-label-sm text-on-surface-variant">Popular:</span>
                                {['AC Repair', 'Plumbing', 'Cleaning', 'Electrician', 'Carpentry'].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setSearchQuery(tag);
                                            navigate(`/search?q=${encodeURIComponent(tag)}&city=${encodeURIComponent(city)}`);
                                        }}
                                        className="px-4 py-1 bg-surface-container rounded-full font-label-sm text-label-sm text-on-surface-variant cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hero Right Hero Technician Image & Floating Badge */}
                        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white">
                                <img
                                    className="w-full h-full object-cover"
                                    alt="Professional technician"
                                    src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=800"
                                />
                                {/* Floating Review Badge */}
                                <div className="absolute bottom-6 left-6 glass-card p-4 rounded-xl flex items-center gap-3 shadow-lg border border-white/60">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shrink-0">
                                        <img
                                            className="w-full h-full object-cover"
                                            alt="Customer"
                                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex text-amber-500">
                                            {'★'.repeat(5)}
                                        </div>
                                        <p className="font-label-sm text-label-sm text-on-surface font-bold">"Best service in Udupi!"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BROWSE CATEGORIES SECTION */}
                <section className="py-16 bg-surface">
                    <div className="max-w-container-max mx-auto px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <div className="space-y-1">
                                <h2 className="font-headline-lg text-headline-lg text-on-surface">Browse Categories</h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">Over 50+ professional services at your doorstep.</p>
                            </div>
                            <Link to="/search" className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-stretch">
                            {LANDING_CATEGORIES.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className="group cursor-pointer h-full"
                                >
                                    <div className="aspect-square bg-white rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-3 group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors text-2xl">
                                            {cat.emoji}
                                        </div>
                                        <span className="font-label-md text-label-md text-on-surface">{cat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* BENTO GRID TRUST SECTION */}
                <section className="py-16 bg-surface-container-low border-y border-outline-variant/30">
                    <div className="max-w-container-max mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
                            <h2 className="font-headline-lg text-headline-lg text-on-surface">Why ServiceHub is Your Neighborhood Choice</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant">We bring trust and professional quality to every home in Mangaluru, Hassan, and Udupi.</p>
                        </div>

                        <div className="grid md:grid-cols-12 gap-6 items-stretch">
                            {/* Bento Feature 1: Neighborhood Heroes */}
                            <div className="md:col-span-8 bg-white rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center border border-outline-variant/30 shadow-xs">
                                <div className="flex-1 space-y-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-on-surface">Neighborhood Heroes</h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                        Our technicians are locals who know your area. They're top-rated by your neighbors and awarded the 'Hero' badge for exceptional service and punctuality.
                                    </p>
                                    <ul className="space-y-2 font-body-sm text-body-sm text-on-surface">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Verified Local Experts
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Average 4.8/5 Star Rating
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full h-full min-h-[220px] rounded-xl overflow-hidden relative border border-outline-variant/20">
                                    <img
                                        className="w-full h-full object-cover"
                                        alt="Local technicians"
                                        src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600"
                                    />
                                </div>
                            </div>

                            {/* Bento Feature 2: 100% Verified Trust */}
                            <div className="md:col-span-4 bg-primary text-white rounded-2xl p-8 flex flex-col justify-between border border-primary/20 shadow-lg space-y-6">
                                <div className="space-y-3">
                                    <ShieldCheck className="w-12 h-12" />
                                    <h3 className="font-headline-md text-headline-md">100% Verified Trust</h3>
                                    <p className="font-body-sm text-body-sm opacity-90 leading-relaxed">
                                        Every professional goes through a rigorous 3-step background check and skill assessment. Your safety is our priority.
                                    </p>
                                </div>
                                <div className="pt-6 border-t border-white/20">
                                    <p className="font-label-md text-label-md">Join 10k+ Happy Homes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default LandingPage;
