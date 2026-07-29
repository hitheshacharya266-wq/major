import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, MapPin, PhoneCall, Mail, ChevronRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-12 mt-20 text-on-surface">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-outline-variant/20">
                    {/* Brand Column (Spans 2 cols on lg) */}
                    <div className="lg:col-span-2 space-y-5">
                        <Link to="/" className="inline-flex items-center gap-3 font-bold text-2xl tracking-tight text-primary">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <span className="font-extrabold text-on-surface">Service<span className="text-secondary">Hub</span></span>
                        </Link>
                        <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">
                            Connecting households with trusted, background-verified local service professionals across Coastal Karnataka — Mangaluru, Udupi, and Hassan.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary bg-secondary-container/30 px-3.5 py-1.5 rounded-full border border-secondary/20">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-secondary" />
                            <span>100% Verified & Insured Doorstep Experts</span>
                        </div>
                    </div>

                    {/* Popular Services */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-on-surface">Popular Services</h4>
                        <ul className="space-y-2.5 text-xs font-medium text-on-surface-variant">
                            <li>
                                <Link to="/search?category=electrician" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Electrician Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/search?category=plumber" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Plumbing & Leak Repair
                                </Link>
                            </li>
                            <li>
                                <Link to="/search?category=carpenter" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Furniture & Carpentry
                                </Link>
                            </li>
                            <li>
                                <Link to="/search?category=ac" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> AC Repair & Jet Wash
                                </Link>
                            </li>
                            <li>
                                <Link to="/search?category=cleaning" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Deep Home Cleaning
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Coverage Cities */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-on-surface">Coverage Area</h4>
                        <ul className="space-y-2.5 text-xs font-medium text-on-surface-variant">
                            <li className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Mangaluru (Bejai, Hampankatta)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Udupi (Manipal, City Center)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Hassan (Vidyanagar, BM Road)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Contact */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-on-surface">Help & Support</h4>
                        <ul className="space-y-2.5 text-xs font-medium text-on-surface-variant">
                            <li>
                                <Link to="/help" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Help Center & FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="/register?role=provider" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                                    <ChevronRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Become a Service Partner
                                </Link>
                            </li>
                            <li className="flex items-center gap-2 text-on-surface pt-1">
                                <PhoneCall className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="font-bold">1800-425-7890 (Toll Free)</span>
                            </li>
                            <li className="flex items-center gap-2 text-on-surface">
                                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="font-bold">support@servicehub.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright & Legal Links */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-on-surface-variant">
                    <p>© {new Date().getFullYear()} ServiceHub Technologies Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/help" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/help" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link to="/help" className="hover:text-primary transition-colors">Trust & Safety</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
