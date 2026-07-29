import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, MapPin, PhoneCall, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-12 mt-20 text-on-surface">
            <div className="max-w-container-max mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-primary">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <span>Service<span className="text-secondary">Hub</span></span>
                        </Link>
                        <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed">
                            Connecting households with trusted, verified local service professionals across Coastal Karnataka — Mangaluru, Udupi, and Hassan.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-secondary bg-secondary-container/30 px-3 py-1.5 rounded-full w-fit border border-secondary/20">
                            <ShieldCheck className="w-4 h-4" /> 100% Verified & Insured Professionals
                        </div>
                    </div>

                    {/* Popular Services */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-on-surface">Popular Services</h4>
                        <ul className="space-y-2.5 text-sm text-on-surface-variant">
                            <li><Link to="/search?category=electrician" className="hover:text-primary transition-colors">Electrician</Link></li>
                            <li><Link to="/search?category=plumber" className="hover:text-primary transition-colors">Plumbing & Leak Repairs</Link></li>
                            <li><Link to="/search?category=carpenter" className="hover:text-primary transition-colors">Furniture & Carpentry</Link></li>
                            <li><Link to="/search?category=ac" className="hover:text-primary transition-colors">AC Servicing & Repair</Link></li>
                            <li><Link to="/search?category=cleaning" className="hover:text-primary transition-colors">Deep Home Cleaning</Link></li>
                        </ul>
                    </div>

                    {/* Coverage Cities */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-on-surface">Coverage Cities</h4>
                        <ul className="space-y-2.5 text-sm text-on-surface-variant">
                            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> Mangaluru (Bejai, Hampankatta)</li>
                            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> Udupi (Manipal, City Center)</li>
                            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> Hassan (Vidyanagar, BM Road)</li>
                            <li className="pt-2 text-xs text-primary font-semibold hover:underline cursor-pointer">View Coverage Map →</li>
                        </ul>
                    </div>

                    {/* Support & Links */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-on-surface">Help & Support</h4>
                        <ul className="space-y-2.5 text-sm text-on-surface-variant">
                            <li><Link to="/help" className="hover:text-primary transition-colors">Help Center / FAQs</Link></li>
                            <li><Link to="/register?role=provider" className="hover:text-primary transition-colors">Become a Service Partner</Link></li>
                            <li><Link to="/settings" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
                            <li className="flex items-center gap-2 pt-2 text-xs text-on-surface">
                                <PhoneCall className="w-3.5 h-3.5 text-primary" /> 1800-425-7890 (Toll Free)
                            </li>
                            <li className="flex items-center gap-2 text-xs text-on-surface">
                                <Mail className="w-3.5 h-3.5 text-primary" /> support@servicehub.in
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
                    <p>© {new Date().getFullYear()} ServiceHub India Technologies Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/help" className="hover:text-primary">Privacy Policy</Link>
                        <Link to="/help" className="hover:text-primary">Terms of Service</Link>
                        <Link to="/help" className="hover:text-primary">Security</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
