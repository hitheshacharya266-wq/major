import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search, MapPin, ShieldCheck, Clock, Award, CheckCircle2,
    Wrench, ArrowRight
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { SERVICE_CATEGORIES } from '../utils/helpers';

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
                <section className="hero-gradient pt-16 pb-20 border-b border-outline-variant/20">
                    <div className="sh-container flex flex-col items-center text-center space-y-8">
                        {/* Verified Pill Badge */}
                        <div className="inline-flex items-center gap-2 bg-secondary-container/30 px-4 py-1.5 rounded-full border border-secondary/20 shadow-xs">
                            <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                            <span className="text-xs font-bold text-secondary">
                                Verified Local Professionals in Coastal Karnataka
                            </span>
                        </div>

                        {/* Main Display Heading */}
                        <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight leading-[1.12] max-w-4xl">
                            Find Trusted Local Services <br className="hidden sm:inline" /> in Your Neighborhood
                        </h1>

                        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl font-medium leading-relaxed">
                            Expert home maintenance & repairs in Mangaluru, Udupi, and Hassan. Book verified, background-checked professionals in 60 seconds.
                        </p>

                        {/* Search Bar Form */}
                        <form onSubmit={handleSearch} className="glass-card p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xl max-w-3xl w-full border border-outline-variant/40">
                            <div className="flex items-center gap-2.5 px-4 py-3 sm:border-r border-outline-variant/30 w-full sm:w-1/3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm sm:text-base font-bold text-on-surface w-full cursor-pointer"
                                >
                                    <option value="Mangaluru">Mangaluru</option>
                                    <option value="Udupi">Udupi</option>
                                    <option value="Hassan">Hassan</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2.5 px-4 py-3 w-full sm:flex-1">
                                <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search service (e.g. Electrician, Plumbing)..."
                                    className="bg-transparent border-none outline-none text-sm text-on-surface placeholder-on-surface-variant/60 w-full font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                className="sh-btn-primary w-full sm:w-auto shrink-0 !h-12 !px-7"
                            >
                                <Search className="w-4 h-4 shrink-0" /> Search Now
                            </button>
                        </form>

                        {/* Popular Tags */}
                        <div className="flex flex-wrap gap-2 items-center justify-center pt-2">
                            <span className="text-xs font-bold text-on-surface-variant">Popular:</span>
                            {['Electrician', 'Plumbing', 'AC Servicing', 'Carpentry', 'Cleaning'].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSearchQuery(tag);
                                        navigate(`/search?q=${encodeURIComponent(tag)}&city=${encodeURIComponent(city)}`);
                                    }}
                                    className="px-3.5 py-1.5 bg-surface-container rounded-full text-xs font-semibold text-on-surface hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SERVICE CATEGORIES GRID */}
                <section className="py-16 lg:py-20 sh-container w-full">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Services</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">Explore Popular Categories</h2>
                        </div>
                        <Link to="/search" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline">
                            View all categories <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 lg:gap-6 items-stretch">
                        {SERVICE_CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="category-card group h-full flex flex-col items-center justify-between text-center"
                            >
                                <div className="icon-container" style={{ backgroundColor: `${cat.color}15` }}>
                                    <span className="text-3xl">{cat.emoji}</span>
                                </div>
                                <div className="pt-3">
                                    <h3 className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors">
                                        {cat.label}
                                    </h3>
                                    <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                                        {cat.count} Verified Pros
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* TRUST & SERVICE GUARANTEE */}
                <section className="py-16 lg:py-20 bg-surface-container-low border-y border-outline-variant/30">
                    <div className="sh-container">
                        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
                            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Why Choose ServiceHub</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">The Premium Service Guarantee</h2>
                            <p className="text-on-surface-variant text-xs sm:text-sm font-medium">
                                Built for complete peace of mind with strict quality standards across Mangaluru, Udupi & Hassan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
                            <div className="sh-card h-full space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-on-surface mb-1">100% Background Checked</h3>
                                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                                        Every technician is identity-verified, police-checked, and skill-tested before joining our network.
                                    </p>
                                </div>
                            </div>

                            <div className="sh-card h-full space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-on-surface mb-1">Upfront Fixed Pricing</h3>
                                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                                        No hidden fees or unexpected post-service charges. Know the exact cost before booking.
                                    </p>
                                </div>
                            </div>

                            <div className="sh-card h-full space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-on-surface mb-1">60-Min Doorstep Arrival</h3>
                                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                                        Local professionals dispatched near your neighborhood for urgent repairs and scheduled visits.
                                    </p>
                                </div>
                            </div>

                            <div className="sh-card h-full space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-on-surface mb-1">30-Day Service Warranty</h3>
                                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                                        If something goes wrong after the repair, we revisit and fix it completely free of charge.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* REGIONAL FOOTPRINT STATS BANNER */}
                <section className="py-16 sh-container w-full">
                    <div className="bg-primary text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-3 max-w-xl text-center lg:text-left z-10">
                            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Regional Footprint
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                                Empowering 10,000+ Households in Karnataka
                            </h2>
                            <p className="text-primary-fixed-dim text-xs sm:text-sm font-medium">
                                Quick, transparent, and high-quality service at your fingertips.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 sm:gap-8 z-10 w-full lg:w-auto text-center">
                            <div className="space-y-1">
                                <p className="text-2xl sm:text-4xl font-extrabold">140+</p>
                                <p className="text-[11px] text-primary-fixed-dim font-medium">Verified Pros</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl sm:text-4xl font-extrabold">4.9 ★</p>
                                <p className="text-[11px] text-primary-fixed-dim font-medium">Avg Rating</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl sm:text-4xl font-extrabold">3</p>
                                <p className="text-[11px] text-primary-fixed-dim font-medium">Major Cities</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PARTNER BANNER */}
                <section className="pb-16 sh-container w-full">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
                        <div className="space-y-2 max-w-2xl text-center md:text-left">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Join ServiceHub</span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface">Are you a Skilled Local Service Provider?</h3>
                            <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
                                Expand your customer base in Mangaluru, Udupi & Hassan. Get instant job alerts, weekly payouts, and free onboarding.
                            </p>
                        </div>
                        <Link
                            to="/register?role=provider"
                            className="sh-btn-secondary text-xs sm:text-sm shrink-0"
                        >
                            Register as Partner
                        </Link>
                    </div>
                </section>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default LandingPage;
