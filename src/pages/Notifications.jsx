import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { Bell, CheckCircle2, Clock, ShieldCheck, Wrench, MessageSquare, AlertCircle } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
    { id: 1, title: 'Technician Assigned', message: 'Rahul Kumar (Electrician) has accepted your booking request for Today at 10:00 AM.', time: '10 mins ago', read: false, icon: Wrench, color: 'text-primary bg-primary/10' },
    { id: 2, title: 'Service Guarantee Active', message: 'Your 30-day free post-service warranty is active for your recent plumbing job.', time: '1 day ago', read: true, icon: ShieldCheck, color: 'text-secondary bg-secondary/10' },
    { id: 3, title: 'Offer: 20% Off Deep Cleaning', message: 'Use code MANGALORE20 on your next home deep cleaning booking.', time: '3 days ago', read: true, icon: Bell, color: 'text-purple-600 bg-purple-50' }
];

const Notifications = () => {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="max-w-4xl mx-auto px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-on-surface">Notifications</h1>
                            <p className="text-xs text-on-surface-variant">Stay updated on your booking requests and service alerts.</p>
                        </div>
                        <button onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">
                            Mark All as Read
                        </button>
                    </div>

                    <div className="space-y-3">
                        {notifications.map(n => {
                            const Icon = n.icon;
                            return (
                                <div key={n.id} className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${n.read ? 'bg-surface-container-lowest border-outline-variant/30' : 'bg-surface-container-low border-primary/40 shadow-xs'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-on-surface">{n.title}</h4>
                                            <span className="text-[11px] text-on-surface-variant">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">{n.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default Notifications;
