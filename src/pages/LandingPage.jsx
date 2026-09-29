import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';

const LANDING_CATEGORIES = [
    { id: 'electrician', label: 'Electrician', icon: 'electrical_services' },
    { id: 'plumber', label: 'Plumber', icon: 'plumbing' },
    { id: 'ac', label: 'AC Repair', icon: 'ac_unit' },
    { id: 'cleaning', label: 'Cleaning', icon: 'cleaning_services' },
    { id: 'pest', label: 'Pest Control', icon: 'pest_control' },
    { id: 'carpenter', label: 'Carpentry', icon: 'construction' }
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
            <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-sans text-on-surface">
                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="hero-gradient pt-6 sm:pt-12 pb-8 sm:pb-14 px-4 sm:px-6 md:px-8">
                        <div className="max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                            {/* Left Text & Search Box */}
                            <div className="flex-1 space-y-4 sm:space-y-6 text-left">
                                <div className="inline-flex items-center gap-2 bg-[#e6f4f1] text-[#004d4c] px-3.5 py-1.5 rounded-full border border-[#004d4c]/15 shadow-xs">
                                    <span className="material-symbols-outlined text-[16px] text-[#004d4c]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    <span className="text-[11px] sm:text-xs font-extrabold tracking-tight">Verified Professionals in Coastal Karnataka</span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface leading-[1.15] tracking-tight">
                                    Find Trusted Local Services in Your Neighborhood
                                </h1>

                                <p className="text-xs sm:text-base text-on-surface-variant font-medium max-w-xl leading-relaxed">
                                    Expert help for your home maintenance in Mangaluru, Hassan, and Udupi. Book verified professionals in under 60 seconds.
                                </p>
                                
                                {/* Search/Location Bar */}
                                <form onSubmit={handleSearch} className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-md border border-outline-variant/30 w-full max-w-2xl">
                                    <div className="w-full sm:w-44 shrink-0 flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-outline-variant/30">
                                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0">location_on</span>
                                        <select
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-bold w-full cursor-pointer outline-none text-on-surface"
                                        >
                                            <option value="Mangaluru">Mangaluru</option>
                                            <option value="Hassan">Hassan</option>
                                            <option value="Udupi">Udupi</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 flex items-center gap-2 px-3 py-2 w-full">
                                        <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">search</span>
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-medium w-full outline-none text-on-surface"
                                            placeholder="Try: Plumber, Electrician, AC Repair..."
                                            type="text"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-[#004d4c] text-white px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm hover:bg-[#004d4c]/90 transition-all active:scale-95 w-full sm:w-auto shrink-0 cursor-pointer shadow-md shadow-[#004d4c]/20 whitespace-nowrap"
                                    >
                                        Search Now
                                    </button>
                                </form>

                                {/* Popular Search Pills */}
                                <div className="flex flex-wrap gap-2 items-center text-xs">
                                    <span className="font-extrabold text-on-surface-variant/80">Popular:</span>
                                    {['AC Repair', 'Plumbing', 'Cleaning'].map((tag) => (
                                        <span
                                            key={tag}
                                            onClick={() => {
                                                setSearchQuery(tag);
                                                navigate(`/search?q=${encodeURIComponent(tag)}&city=${encodeURIComponent(city)}`);
                                            }}
                                            className="px-3 py-1 bg-white border border-outline-variant/30 rounded-full text-xs font-extrabold text-on-surface-variant cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-2xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right Hero Technician Image (Matching Reference Screenshot) */}
                            <div className="flex-1 relative w-full max-w-md lg:max-w-none">
                                <div className="aspect-[4/3] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30 relative bg-white">
                                    <img
                                        className="w-full h-full object-cover"
                                        alt="Indian Service Professional"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBImT5KkNEOk97K28c3bXzq7aXYiEFfyW4j0F5AoWbVOs-9WqKN_JiWFUeCOdeOCRy66YSLFooH5hx5kp61EHFB4i2qoiiKn9JQooDAg_YoLWK4D9IHdU65VGjVs9d4bZA24VSz6qm5O82RrZ3EFSU9Fy0wutTDLgUGB0ETIS18oSLW4Q47WoZXlT-mCf0oz-6lfZY0XC_z45WAkEvMC9Wk4W8J1_rY6t3077OQfq1Ca_podEqWEmMDrw"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Browse Categories Section (3 Cols on Mobile, 6 Cols on Desktop) */}
                    <section className="py-8 sm:py-12 bg-white border-y border-outline-variant/20">
                        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
                            <div className="flex justify-between items-end mb-6 sm:mb-8">
                                <div className="space-y-1 text-left">
                                    <h2 className="text-xl sm:text-3xl font-black text-on-surface tracking-tight">Browse Categories</h2>
                                    <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Over 50+ professional services at your doorstep.</p>
                                </div>
                                <Link className="text-primary font-extrabold text-xs sm:text-sm flex items-center gap-1 hover:underline" to="/search">
                                    View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
                                {LANDING_CATEGORIES.map((cat) => (
                                    <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="group cursor-pointer">
                                        <div className="bg-white rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-2 sm:gap-3 group-hover:border-primary group-hover:shadow-md transition-all duration-300 p-3 sm:p-4 text-center">
                                            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#e6f4f1] flex items-center justify-center text-[#004d4c] group-hover:bg-[#004d4c] group-hover:text-white transition-colors shrink-0">
                                                <span className="material-symbols-outlined text-[22px] sm:text-[26px]">{cat.icon}</span>
                                            </div>
                                            <span className="font-extrabold text-xs sm:text-sm text-on-surface">{cat.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Trust Features / Bento Grid (Exact Matching Reference Alignment) */}
                    <section className="py-10 sm:py-16 bg-[#f8f9ff]">
                        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
                            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">Why ServiceHub is Your Neighborhood Choice</h2>
                                <p className="text-xs sm:text-sm text-on-surface-variant font-medium">We bring trust and professional quality to every home in Mangaluru, Hassan, and Udupi.</p>
                            </div>

                            {/* Bento Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
                                
                                {/* Feature 1: Neighborhood Heroes (Col 4 on Desktop) */}
                                <div className="md:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/40 shadow-xs space-y-4 text-left">
                                    <div className="space-y-3">
                                        <div className="w-11 h-11 bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center rounded-xl">
                                            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                                        </div>
                                        <h3 className="font-black text-lg sm:text-xl text-on-surface">Neighborhood Heroes</h3>
                                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
                                            Our technicians are locals who know your area. They're top-rated by your neighbors and awarded the 'Hero' badge for exceptional service and punctuality.
                                        </p>
                                    </div>
                                    <ul className="space-y-2 pt-2 border-t border-outline-variant/20">
                                        <li className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-on-surface">
                                            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Verified Local Experts
                                        </li>
                                        <li className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-on-surface">
                                            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Average 4.8/5 Star Rating
                                        </li>
                                    </ul>
                                </div>

                                {/* Feature 2: Technicians Image (Col 4 on Desktop) */}
                                <div className="md:col-span-4 w-full h-56 sm:h-full min-h-[220px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-outline-variant/30 relative bg-white">
                                    <img
                                        className="w-full h-full object-cover"
                                        alt="Indian Service Technicians"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL5cl2unagQ56NkmqRYs4wpPm4HynO5ZhSa4hbvNx-upYL9FKK_gC-Dqu7hN-dB1foOxrDjiGCGm3y-KMyiOu2G2h1xFHTOo398llHk9WYvmBz36GIFIFI52aKmCw1eXxXjGev7FIFX1LPjrECLcl7Pzw0ecbmfOa0iCqgcDC9L1QbdpaOGSr--DTS4rggZWSUa1GcoyybqdHE33pnrAac02NHiMDOtORXFl_2FUUGqVwbSheEkSgm2g"
                                    />
                                </div>

                                {/* Feature 3: Verified Trust (Col 4 on Desktop - Dark Teal Fill) */}
                                <div className="md:col-span-4 bg-[#004d4c] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-primary/20 shadow-md min-h-[220px] text-left">
                                    <div className="space-y-3">
                                        <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-white">verified_user</span>
                                        <h3 className="font-black text-lg sm:text-xl text-white">100% Verified Trust</h3>
                                        <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">Every professional goes through a rigorous 3-step background check and skill assessment. Your safety is our priority.</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/20 mt-4">
                                        <p className="text-xs sm:text-sm font-extrabold text-white">Join 10k+ Happy Homes</p>
                                    </div>
                                </div>

                                {/* Feature 4: Quick Booking (Col 5 on Desktop) */}
                                <div className="md:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs flex flex-col justify-between space-y-4 text-left">
                                    <div className="space-y-3">
                                        <h3 className="font-black text-lg sm:text-xl text-on-surface">60-Sec Booking</h3>
                                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">No long phone calls. Select, book, and track your service in real-time through our modern platform.</p>
                                    </div>
                                    <div className="bg-surface-container rounded-xl p-3.5 space-y-2 mt-auto border border-outline-variant/20">
                                        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                                            <span>Booking Progress</span>
                                            <span className="text-primary font-black">85%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-outline-variant/20">
                                            <div className="h-full bg-primary w-[85%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 5: Community Reviews (Col 7 on Desktop - Light Mint Background) */}
                                <div className="md:col-span-7 bg-[#e6f4f1] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#004d4c]/15 text-left">
                                    <div className="max-w-md space-y-3">
                                        <h3 className="font-black text-lg sm:text-xl text-[#004d4c]">Community Reviews</h3>
                                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">See what your neighbors in Hassan and Udupi are saying about our services. Authentic feedback from real home visits.</p>
                                        <div className="flex -space-x-2.5 pt-2">
                                            <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                                                <img className="w-full h-full object-cover" alt="Avatar 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJtC444y8BmxoDOhvacrRcd-UM4J2_OfhULqXV098fCW_fOzfCzNuvxKQdB044QTrbEadychtviofbS2ZIm0P34_WjLlIwXoriUwwzVeM0HnlrMtLJA5YBiU3nvdOsUKxN0fbKSPHD7XCpv3_R5_wW03ypL6OJB--pirr06YPiI5-Ivmh0ot6AR2pGSB5_pCCbv1s9-kmOO_5LDFHBwYLAWj0Tm8OETA2Canv8egawU-3y_N8tOA0h7w" />
                                            </div>
                                            <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                                                <img className="w-full h-full object-cover" alt="Avatar 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaBiIR5FGqduAoDPPKTWPjBDvOtXvQi93S0Zqjqo1J29JMHh00sMNOXdwTC5sYmJGw8OETWZy3RNrVuCcUYm3hIBY04_OsQEvElMq5rMvVUyTtw4MSz_jzna6IbZZXc3X26hAaM_qJpNVaR7GIZQtDyTOkq8Q5B3i_mrgzBJNsv3kfFGoc1sVuxOEkzD6EFJQtdLisg-gK8BnydA33z9ZrFA5FipRKcBd3rdV6LnMfgtpYqf9DmdKJiA" />
                                            </div>
                                            <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                                                <img className="w-full h-full object-cover" alt="Avatar 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3RBGtocX8vV5ysXhxgcWdWGxpgEXC_kQ8uqvevmf8eH39CrtXqLB82a8WMbtzIWKjKtzH5q_F11LOY69pkXZnZddEx8VH0vpl-2u3rK4v1YmSn9WMtHXvJaykt29U924r1kM2gjZYdO1GAyHGPL8grMOfCt1QcleHUpHuSeSFMzFeWBdNJokLn1d8SvJCsLNjKD0o7Q4GNYy-H05y12wZ_Oe-VzEEDLQgtW8u1_XuNbK4ZZ4dOH--kw" />
                                            </div>
                                            <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center bg-[#004d4c] text-white text-xs font-black shrink-0 shadow-xs">
                                                +5k
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block w-20 h-20 relative shrink-0">
                                        <div className="bg-white rounded-full p-3 shadow-md flex items-center justify-center w-full h-full border border-[#004d4c]/15">
                                            <span className="material-symbols-outlined text-[#004d4c] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section - Solid Dark Teal Container with Bright Mint Button & Outline Button */}
                    <section className="py-10 sm:py-16 bg-white">
                        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
                            <div className="relative bg-[#004d4c] text-white rounded-2xl sm:rounded-3xl overflow-hidden p-8 sm:p-12 md:p-14 shadow-xl border border-primary/20">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                                    <div className="space-y-3 sm:space-y-4 max-w-2xl text-center md:text-left">
                                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                            Ready to fix your home issues?
                                        </h2>
                                        <p className="text-xs sm:text-base md:text-lg text-white/90 font-medium leading-relaxed">
                                            Experience the ServiceHub difference today. Join thousands of satisfied customers in coastal India.
                                        </p>
                                    </div>
                                    <div className="flex flex-row gap-3 sm:gap-4 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 justify-center">
                                        <button
                                            onClick={() => navigate('/search')}
                                            className="h-12 px-6 sm:px-8 bg-[#36d399] text-[#004d4c] hover:bg-[#2dd4bf] rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center whitespace-nowrap"
                                        >
                                            Book a Service
                                        </button>
                                        <button
                                            onClick={() => navigate('/register?role=provider')}
                                            className="h-12 px-6 sm:px-8 bg-transparent text-white border border-white/40 hover:bg-white/10 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center whitespace-nowrap"
                                        >
                                            Partner with Us
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default LandingPage;
