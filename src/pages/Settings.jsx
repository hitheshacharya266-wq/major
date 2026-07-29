import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { Bell, Lock, Shield, Moon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [smsNotifs, setSmsNotifs] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="max-w-3xl mx-auto px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                    <div className="border-b border-outline-variant/30 pb-4">
                        <h1 className="text-2xl font-extrabold text-on-surface">App Settings</h1>
                        <p className="text-xs text-on-surface-variant">Manage your preferences, security, and notifications.</p>
                    </div>

                    <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                                <Bell className="w-4 h-4 text-primary" /> Notifications
                            </h3>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container/30">
                                <div>
                                    <p className="text-sm font-bold text-on-surface">SMS Booking Updates</p>
                                    <p className="text-xs text-on-surface-variant">Receive technician arrival updates via SMS</p>
                                </div>
                                <input type="checkbox" checked={smsNotifs} onChange={() => setSmsNotifs(!smsNotifs)} className="accent-primary w-4 h-4 cursor-pointer" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container/30">
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Email Invoices & Offers</p>
                                    <p className="text-xs text-on-surface-variant">Get digital PDF receipts sent to your inbox</p>
                                </div>
                                <input type="checkbox" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} className="accent-primary w-4 h-4 cursor-pointer" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/20 space-y-4">
                            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" /> Privacy & Security
                            </h3>
                            <button onClick={() => toast.success('Password reset link sent to your email!')} className="px-4 py-2.5 bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-xs rounded-xl transition-colors">
                                Reset Account Password
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default Settings;
