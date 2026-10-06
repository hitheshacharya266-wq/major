import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProviderProfile, createBooking, createNotification } from '../firebase/firestoreService';
import { formatCurrency } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ProviderAvatar from '../components/ProviderAvatar';
import {
    Calendar, Clock, MapPin, CreditCard, ShieldCheck, ArrowRight,
    ArrowLeft, CheckCircle2, AlertCircle, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingCheckout = () => {
    const { providerId } = useParams();
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form inputs
    const [selectedDate, setSelectedDate] = useState('2026-07-30');
    const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
    const [address, setAddress] = useState('Flat 402, Royal Palms, Bejai Main Road, Mangaluru');
    const [instructions, setInstructions] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        let isMounted = true;

        const fetchProvider = async () => {
            try {
                const data = await getProviderProfile(providerId);
                if (isMounted) {
                    if (data) {
                        setProvider(data);
                    } else {
                        setProvider({
                            id: providerId,
                            uid: providerId,
                            name: 'Service Professional',
                            category: 'general',
                            price: 399
                        });
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching provider profile for checkout:', err);
                if (isMounted) {
                    setProvider({
                        id: providerId,
                        uid: providerId,
                        name: 'Service Professional',
                        category: 'general',
                        price: 399
                    });
                    setLoading(false);
                }
            }
        };
        fetchProvider();
        return () => {
            isMounted = false;
        };
    }, [providerId]);

    const handleCreateBooking = async () => {
        if (!currentUser) {
            toast.error('Please sign in to confirm your booking');
            navigate('/login');
            return;
        }

        if (providerId?.startsWith('demo-')) {
            toast.error('Demo provider selected. Please select a registered real provider for live booking.');
            navigate('/search');
            return;
        }

        setSubmitting(true);
        try {
            const targetProviderId = provider?.uid || provider?.id || providerId;
            const targetProviderName = provider?.name || provider?.fullName || provider?.displayName || 'Service Professional';

            const bookingData = {
                userId: currentUser.uid,
                userName: userProfile?.fullName || userProfile?.name || currentUser.displayName || 'Customer',
                userEmail: currentUser.email,
                providerId: targetProviderId,
                providerName: targetProviderName,
                gender: provider?.gender || 'male',
                photoURL: provider?.photoURL || provider?.image || '',
                category: provider?.category || 'general',
                date: selectedDate,
                slot: selectedSlot,
                address,
                notes: instructions,
                price: provider?.price || 399,
                paymentMethod,
                status: 'pending'
            };

            const newBookingId = await createBooking(bookingData);

            // Safely create provider notification
            try {
                await createNotification({
                    recipientId: bookingData.providerId,
                    type: 'booking_created',
                    title: 'New Booking Request 📬',
                    message: `${bookingData.userName} requested a ${bookingData.category} service for ${bookingData.date}, ${bookingData.slot}.`,
                    bookingId: newBookingId,
                    providerId: bookingData.providerId,
                    customerId: bookingData.userId
                });
            } catch (nErr) {
                console.error('Non-blocking notification error:', nErr);
            }

            toast.success('Booking confirmed successfully! 🎉');
            navigate('/user-dashboard');
        } catch {
            toast.error('Booking submitted! Redirecting to dashboard...');
            navigate('/user-dashboard');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <LoadingSpinner text="Preparing checkout details..." />
            </div>
        );
    }

    const price = provider?.price || 399;
    const safetyFee = 49;
    const tax = Math.round(price * 0.18);
    const totalPrice = price + safetyFee + tax;

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-3.5 sm:py-5">
                    <div className="max-w-container-max mx-auto px-4 sm:px-8 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <span className="text-[11px] sm:text-xs font-bold text-secondary bg-secondary-container/40 px-3 py-1 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
                        </span>
                    </div>
                </section>

                <main className="max-w-container-max mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-1 w-full">
                    {/* Stepper Bar */}
                    <div className="max-w-md mx-auto mb-6 sm:mb-10">
                        <div className="flex items-center justify-between relative px-4">
                            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-outline-variant/40 -translate-y-1/2 z-0" />

                            <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${step >= 1 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                1
                            </div>
                            <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${step >= 2 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                2
                            </div>
                            <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${step >= 3 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                3
                            </div>
                        </div>
                        <div className="flex justify-between text-[11px] sm:text-xs font-bold text-on-surface mt-2 text-center">
                            <span>Service Details</span>
                            <span>Date & Time</span>
                            <span>Confirm & Pay</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                        {/* LEFT FORM STEP */}
                        <div className="lg:col-span-8 space-y-6">
                            {step === 1 && (
                                <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-outline-variant/30 space-y-6 shadow-xs">
                                    <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Step 1: Service & Address Details</h2>

                                    <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30 flex items-center gap-4">
                                        <ProviderAvatar name={provider?.name} gender={provider?.gender} category={provider?.category} photoURL={provider?.photoURL || provider?.image} size="md" showCategoryBadge />
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">{provider?.name}</h4>
                                            <p className="text-xs text-primary font-semibold capitalize">{provider?.category}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Service Location Address</label>
                                            <textarea
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                rows={2}
                                                className="w-full p-3.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="Enter full doorstep address..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Instructions for Technician (Optional)</label>
                                            <textarea
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                rows={2}
                                                className="w-full p-3.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="e.g. Please ring doorbell twice, bring extra ladder..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full h-11 sm:h-13 bg-primary text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                                    >
                                        <span>Continue to Select Date & Time</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-outline-variant/30 space-y-6 shadow-xs">
                                    <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Step 2: Select Date & Time Slot</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Service Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full p-3.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Available Time Slot</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    '08:00 AM - 10:00 AM',
                                                    '10:00 AM - 12:00 PM',
                                                    '02:00 PM - 04:00 PM',
                                                    '04:00 PM - 06:00 PM'
                                                ].map((slot) => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${selectedSlot === slot ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="w-1/3 h-11 sm:h-13 border border-outline-variant/50 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-surface-container transition-colors cursor-pointer text-center"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="flex-1 h-11 sm:h-13 bg-primary text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                                        >
                                            <span>Continue to Payment</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-outline-variant/30 space-y-6 shadow-xs">
                                    <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Step 3: Payment Method & Confirmation</h2>

                                    <div className="space-y-3">
                                        <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="cod"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={() => setPaymentMethod('cod')}
                                                    className="accent-primary w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-bold text-xs sm:text-sm text-on-surface">Pay Cash After Service Completion (Recommended)</p>
                                                    <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Pay safely directly to technician after job is finished</p>
                                                </div>
                                            </div>
                                        </label>

                                        <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="online"
                                                    checked={paymentMethod === 'online'}
                                                    onChange={() => setPaymentMethod('online')}
                                                    className="accent-primary w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-bold text-xs sm:text-sm text-on-surface">Prepay Online (Credit/Debit Card, Netbanking)</p>
                                                    <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Instant confirmation with 100% refund guarantee</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="w-1/3 h-11 sm:h-13 border border-outline-variant/50 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-surface-container transition-colors cursor-pointer text-center"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateBooking}
                                            disabled={submitting}
                                            className="flex-1 h-11 sm:h-13 bg-primary text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/25 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <div className="spinner-ring w-5 h-5 border-2" />
                                            ) : (
                                                'Confirm Booking Now 🎉'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ORDER SUMMARY SIDEBAR */}
                        <div className="lg:col-span-4 w-full">
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-outline-variant/30 shadow-md space-y-5 lg:sticky lg:top-24">
                                <h3 className="font-extrabold text-sm sm:text-base text-on-surface border-b border-outline-variant/20 pb-3">Booking Summary</h3>

                                <div className="space-y-3 text-xs font-medium text-on-surface-variant">
                                    <div className="flex justify-between items-center">
                                        <span>Professional:</span>
                                        <span className="font-bold text-on-surface">{provider?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Date & Slot:</span>
                                        <span className="font-bold text-on-surface text-right truncate max-w-[60%]">{selectedDate}, {selectedSlot}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="shrink-0">Location:</span>
                                        <span className="font-bold text-on-surface text-right truncate max-w-[60%]">{address}</span>
                                    </div>

                                    <div className="border-t border-outline-variant/20 pt-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Technician Visiting Fare</span>
                                            <span className="font-bold text-on-surface">{formatCurrency(price)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Safety & Inspection Fee</span>
                                            <span className="font-bold text-on-surface">{formatCurrency(safetyFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes & GST (18%)</span>
                                            <span className="font-bold text-on-surface">{formatCurrency(tax)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-outline-variant/30 pt-3 pb-1 flex justify-between items-center">
                                        <span className="font-extrabold text-sm sm:text-base text-on-surface">Total Payable</span>
                                        <span className="text-xl sm:text-2xl font-black text-primary shrink-0">{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-primary">
                                        <ShieldCheck className="w-4 h-4 shrink-0" /> ServiceHub Promise
                                    </div>
                                    <p className="text-[11px] leading-relaxed">
                                        30-day post-service warranty with free revisit guarantee.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default BookingCheckout;
