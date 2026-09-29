import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    subscribeToUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../firebase/firestoreService';
import { formatDate } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { Bell, CheckCircle2, Clock, ShieldCheck, Wrench, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const getNotifMeta = (type) => {
    switch (type) {
        case 'booking_created':
            return { icon: Wrench, color: 'text-primary bg-primary/10' };
        case 'booking_accepted':
            return { icon: CheckCircle2, color: 'text-secondary bg-secondary/10' };
        case 'booking_rejected':
            return { icon: AlertCircle, color: 'text-red-600 bg-red-50' };
        case 'booking_completed':
            return { icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' };
        default:
            return { icon: Bell, color: 'text-primary bg-primary/10' };
    }
};

const Notifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);

        const unsubscribe = subscribeToUserNotifications(
            currentUser.uid,
            (notifs) => {
                setNotifications(notifs || []);
                setLoading(false);
            },
            (err) => {
                console.error('Error listening to notifications:', err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleMarkSingleRead = async (notif) => {
        if (!notif.read) {
            await markNotificationAsRead(notif.id);
        }
    };

    const handleMarkAllRead = async () => {
        if (currentUser) {
            await markAllNotificationsAsRead(currentUser.uid, notifications);
            toast.success('All notifications marked as read');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-on-surface">Notifications</h1>
                            <p className="text-xs text-on-surface-variant">Stay updated on your booking requests and service alerts.</p>
                        </div>
                        <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                            Mark All as Read
                        </button>
                    </div>

                    {loading ? (
                        <LoadingSpinner text="Fetching your notifications..." />
                    ) : notifications.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/30 space-y-3">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                🔔
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">No Notifications Yet</h3>
                            <p className="text-xs text-on-surface-variant">Realtime updates about your service bookings will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(n => {
                                const { icon: Icon, color } = getNotifMeta(n.type);
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleMarkSingleRead(n)}
                                        className={`p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${n.read ? 'bg-surface-container-lowest border-outline-variant/30 opacity-80' : 'bg-surface-container-low border-primary/40 shadow-xs'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-sm text-on-surface">{n.title}</h4>
                                                    {!n.read && (
                                                        <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-on-surface-variant font-medium">{formatDate(n.createdAt)}</span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant leading-relaxed">{n.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default Notifications;
