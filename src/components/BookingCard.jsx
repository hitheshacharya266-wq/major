/**
 * BookingCard Component
 *
 * Displays a single booking with status badge and optional rating.
 * Uses glassmorphism theme.
 */
import { useState } from 'react';
import StarRating from './StarRating';
import { STATUS_STYLES, formatDate, SERVICE_CATEGORIES } from '../utils/helpers';
import { rateBooking, updateProviderRating } from '../firebase/firestoreService';
import toast from 'react-hot-toast';

const BookingCard = ({ booking, showProvider = true, showUser = false }) => {
    const [rated, setRated] = useState(!!booking.rating);
    const [ratingValue, setRatingValue] = useState(booking.rating || 0);

    const category = SERVICE_CATEGORIES.find(c => c.id === booking.serviceType);
    const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;

    const handleRate = async (value) => {
        try {
            await rateBooking(booking.id, value);
            await updateProviderRating(booking.providerId, value);
            setRatingValue(value);
            setRated(true);
            toast.success(`Rated ${value} stars`);
        } catch (err) {
            console.error('Failed to rate:', err);
            toast.error('Failed to submit rating');
        }
    };

    return (
        <div className="glass-card p-4 space-y-3 hover:bg-white/8 transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category?.emoji || '🛠️'}</span>
                        <span className="font-semibold text-white">
                            {category?.label || booking.serviceType}
                        </span>
                    </div>
                    {showProvider && (
                        <p className="text-sm text-slate-400">Provider: {booking.providerName || booking.providerId}</p>
                    )}
                    {showUser && (
                        <p className="text-sm text-slate-400">Customer: {booking.userName || booking.userId}</p>
                    )}
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle}`}>
                    {booking.status}
                </span>
            </div>

            {booking.notes && (
                <p className="text-sm text-slate-400 bg-white/5 rounded-lg p-2 border border-white/5">{booking.notes}</p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatDate(booking.timestamp)}</span>

                {/* Rating section for completed bookings */}
                {booking.status === 'completed' && (
                    <div>
                        {rated ? (
                            <StarRating rating={ratingValue} readOnly size="sm" />
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400 mr-1">Rate:</span>
                                <StarRating rating={0} onRate={handleRate} size="sm" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCard;
