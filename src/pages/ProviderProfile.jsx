import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProviderProfile } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import {
    Star, ShieldCheck, MapPin, Clock, Award, PhoneCall, CheckCircle2,
    ArrowRight, Check
} from 'lucide-react';

const DEMO_REVIEWS = [
    { id: 1, name: 'Anish Rai', rating: 5, date: '2 days ago', text: 'Prompt arrival at Bejai! Fixed our complete circuit breaker issue in 45 minutes. Very professional and tidy worker.' },
    { id: 2, name: 'Pooja Hegde', rating: 5, date: '1 week ago', text: 'Clean installation of heavy AC wiring in our apartment. Highly recommended for any electrical work in Mangaluru!' },
    { id: 3, name: 'Kiran Shenoy', rating: 4.8, date: '2 weeks ago', text: 'Transparent pricing and polite behavior. Replaced inverter fuse quickly.' }
];

const DEFAULT_PROFILE = {
    name: 'Rahul Kumar',
    category: 'electrician',
    rating: 4.9,
    ratingCount: 128,
    price: 399,
    experience: '8+ Years',
    location: 'Bejai, Mangaluru',
    available: true,
    description: 'Certified master electrician specializing in residential and commercial electrical solutions. Expertise includes complete house rewiring, high-voltage AC points, DB box troubleshooting, and smart LED fixture setup.',
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
    services: [
        { title: 'Electrical Inspection & Diagnostic', price: 299, time: '30 mins' },
        { title: 'AC Heavy Power Point Installation', price: 499, time: '45 mins' },
        { title: 'Main Distribution Box (DB) Repair', price: 799, time: '60 mins' },
        { title: 'Complete Room Rewiring', price: 1499, time: '2-3 hrs' }
    ]
};

const ProviderProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted && loading) {
                setProvider({ id, ...DEFAULT_PROFILE });
                setLoading(false);
            }
        }, 1000);

        const fetchProvider = async () => {
            try {
                const data = await getProviderProfile(id);
                if (isMounted) {
                    if (data) {
                        setProvider(data);
                    } else {
                        setProvider({ id, ...DEFAULT_PROFILE });
                    }
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setProvider({ id, ...DEFAULT_PROFILE });
                    setLoading(false);
                }
            }
        };
        fetchProvider();
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <LoadingSpinner text="Loading provider profile..." />
            </div>
        );
    }

    const catInfo = SERVICE_CATEGORIES.find(c => c.id === provider?.category);

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="sh-container py-10 flex-1 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT MAIN CONTENT AREA */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Profile Header Card */}
                            <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-start gap-6 relative">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30 relative">
                                    {provider?.image ? (
                                        <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary text-white font-extrabold text-4xl flex items-center justify-center">
                                            {provider?.name?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="bg-secondary-container/40 text-secondary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-secondary/20">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Background Verified
                                        </span>
                                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">
                                            {catInfo?.label || provider?.category}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">{provider?.name}</h1>

                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-on-surface-variant">
                                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                                            <Star className="w-4 h-4 fill-amber-400" />
                                            {provider?.rating || 4.9} ({provider?.ratingCount || 128} reviews)
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-primary" /> {provider?.location || 'Mangaluru'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-primary" /> {provider?.experience || '6+ Years'} Experience
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 text-center space-y-1">
                                    <ShieldCheck className="w-5 h-5 text-primary mx-auto" />
                                    <p className="text-xs font-bold text-on-surface">Insured Pro</p>
                                    <p className="text-[10px] text-on-surface-variant">Up to ₹50,000 cover</p>
                                </div>
                                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 text-center space-y-1">
                                    <Clock className="w-5 h-5 text-secondary mx-auto" />
                                    <p className="text-xs font-bold text-on-surface">Fast Arrival</p>
                                    <p className="text-[10px] text-on-surface-variant">Within 60 minutes</p>
                                </div>
                                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 text-center space-y-1">
                                    <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                                    <p className="text-xs font-bold text-on-surface">30-Day Warranty</p>
                                    <p className="text-[10px] text-on-surface-variant">Free re-visit guarantee</p>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="border-b border-outline-variant/30 flex gap-6 text-sm font-bold">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 transition-colors ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    Overview & About
                                </button>
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={`pb-3 transition-colors ${activeTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    Services & Pricing
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-3 transition-colors ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                >
                                    Customer Reviews ({DEMO_REVIEWS.length})
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'overview' && (
                                <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-on-surface mb-2">About Professional</h3>
                                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
                                            {provider?.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-base text-on-surface mb-3">Skills & Specializations</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(provider?.skills || ['AC Power Wiring', 'Fuse Box Repair', 'MCB Diagnostic', 'Geyser Fitting', 'Commercial Maintenance']).map((s, i) => (
                                                <span key={i} className="bg-surface-container px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface flex items-center gap-1.5">
                                                    <Check className="w-3.5 h-3.5 text-primary" /> {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-4">
                                    <h3 className="font-bold text-lg text-on-surface mb-4">Available Rate Card</h3>
                                    {(provider?.services || DEFAULT_PROFILE.services).map((srv, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
                                            <div>
                                                <p className="font-bold text-sm text-on-surface">{srv.title}</p>
                                                <p className="text-xs text-on-surface-variant font-medium">Est. Time: {srv.time}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-extrabold text-primary">₹{srv.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-4">
                                    {DEMO_REVIEWS.map(rev => (
                                        <div key={rev.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                                        {rev.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm text-on-surface">{rev.name}</span>
                                                </div>
                                                <span className="text-xs text-on-surface-variant font-medium">{rev.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                {'★'.repeat(Math.floor(rev.rating))} {rev.rating} / 5
                                            </div>
                                            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{rev.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* STICKY BOOKING CARD */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-xl space-y-6">
                                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                                    <div>
                                        <span className="text-xs text-on-surface-variant font-medium">Visiting Charge</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-primary">₹{provider?.price || 399}</span>
                                            <span className="text-xs text-on-surface-variant">/ service</span>
                                        </div>
                                    </div>
                                    <span className="bg-secondary-container/40 text-secondary text-xs font-bold px-2.5 py-1 rounded-full">
                                        Available Today
                                    </span>
                                </div>

                                <div className="space-y-3 text-xs text-on-surface-variant font-medium">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Instant booking with 60-min arrival guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>No cancellation fee before technician dispatch</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Pay after service completion via Cash / UPI</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/checkout/${provider?.id || id}`}
                                    className="sh-btn-primary w-full flex justify-center !h-12 !text-base"
                                >
                                    Book Professional Now <ArrowRight className="w-5 h-5" />
                                </Link>

                                <button
                                    onClick={() => alert(`Direct Helpline: +91 9876543210`)}
                                    className="sh-btn-outline w-full flex justify-center !h-11 !text-xs"
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
