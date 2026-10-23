import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { User, Mail, MapPin, Phone, ShieldCheck, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
    const { currentUser, userProfile, isAdmin } = useAuth();
    const [name, setName] = useState(userProfile?.fullName || userProfile?.name || currentUser?.displayName || '');
    const [phone, setPhone] = useState(userProfile?.phone || '+91 98765 43210');
    const [city, setCity] = useState(userProfile?.city || 'Mangaluru');

    const handleSave = (e) => {
        e.preventDefault();
        toast.success('Profile details saved successfully!');
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="max-w-3xl mx-auto px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                    <div className="border-b border-outline-variant/30 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold text-on-surface">Account Profile</h1>
                            <p className="text-xs text-on-surface-variant">Manage your personal information and contact details.</p>
                        </div>
                        {isAdmin && (
                            <Link
                                to="/admin-dashboard"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#004d4c] hover:bg-[#003837] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                                <Shield className="w-3.5 h-3.5" /> Open Admin Console
                            </Link>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="bg-[#e6f4f1] border border-[#004d4c]/20 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-[#004d4c] shrink-0" />
                                <div>
                                    <p className="font-bold text-[#004d4c]">Verified Platform Administrator</p>
                                    <p className="text-on-surface-variant text-[11px]">You are logged in with verified administrative authorization and system oversight access.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={currentUser?.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-surface-container/50 border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface-variant cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Primary Coverage City</label>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface outline-none"
                                >
                                    <option value="Mangaluru">Mangaluru</option>
                                    <option value="Udupi">Udupi</option>
                                    <option value="Hassan">Hassan</option>
                                </select>
                            </div>

                            <button type="submit" className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary/90">
                                Save Profile Changes
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default UserProfile;
