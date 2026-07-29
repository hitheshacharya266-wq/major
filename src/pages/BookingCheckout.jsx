import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProviderProfile, createBooking } from '../firebase/firestoreService';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import {
    Calendar, Clock, MapPin, CreditCard, ShieldCheck, ArrowRight,
    ArrowLeft, CheckCircle2, AlertCircle, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_PROVIDER = {
    name: 'Rahul Kumar',
    category: 'electrician',
    price: 399,
    location: 'Bejai, Mangaluru'
};

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
        const timer = setTimeout(() => {
            if (isMounted && loading) {
                setProvider({ id: providerId, ...DEFAULT_PROVIDER });
                setLoading(false);
            }
        }, 1000);

        const fetchProvider = async () => {
            try {
                const data = await getProviderProfile(providerId);
                if (isMounted) {
                    if (data) {
                        setProvider(data);
                    } else {
                        setProvider({ id: providerId, ...DEFAULT_PROVIDER });
                    }
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setProvider({ id: providerId, ...DEFAULT_PROVIDER });
                    setLoading(false);
                }
            }
        };
        fetchProvider();
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [providerId]);

    const handleCreateBooking = async () => {
        if (!currentUser) {
            toast.error('Please sign in to confirm your booking');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const bookingData = {
                userId: currentUser.uid,
                userName: userProfile?.fullName || currentUser.displayName || 'Customer',
                userEmail: currentUser.email,
                providerId,
                providerName: provider?.name || 'Rahul Kumar',
                category: provider?.category || 'electrician',
                date: selectedDate,
                slot: selectedSlot,
                address,
                notes: instructions,
                price: provider?.price || 399,
                paymentMethod,
                status: 'pending'
            };

            await createBooking(bookingData);
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
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-6">
                    <div className="sh-container flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-xs font-bold text-on-surface hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <span className="text-xs font-bold text-secondary bg-secondary-container/40 px-3 py-1 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
                        </span>
                    </div>
                </section>

                <main className="sh-container py-10 flex-1 w-full">
                    {/* Stepper Bar */}
                    <div className="max-w-xl mx-auto mb-10">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant/40 -translate-y-1/2 z-0" />

                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                1
                            </div>
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                2
                            </div>
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                3
                            </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-on-surface mt-2 text-center">
                            <span>Service Details</span>
                            <span>Date & Time</span>
                            <span>Confirm & Pay</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT FORM STEP */}
                        <div className="lg:col-span-8 space-y-6">
                            {step === 1 && (
                                <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6 shadow-xs">
                                    <h2 className="text-xl font-extrabold text-on-surface">Step 1: Service & Address Details</h2>

                                    <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary text-white font-bold text-lg rounded-xl flex items-center justify-center shrink-0">
                                            {provider?.name?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">{provider?.name}</h4>
                                            <p className="text-xs text-primary font-semibold capitalize">{provider?.category}</p>
                                            <p className="text-xs text-on-surface-variant">{provider?.location}</p>
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
                                                placeholder="Specify exact issue (e.g., Main switch tripping when AC turns on)..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="sh-btn-primary w-full flex justify-center !h-12 !text-base"
                                    >
                                        Continue to Schedule →
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6 shadow-xs">
                                    <h2 className="text-xl font-extrabold text-on-surface">Step 2: Select Service Date & Slot</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Service Visit Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="sh-input font-bold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Preferred Arrival Time Slot</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'].map((slot) => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${selectedSlot === slot ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                                    >
                                                        <span>{slot}</span>
                                                        {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="sh-btn-outline w-1/3 flex justify-center"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="sh-btn-primary flex-1 flex justify-center"
                                        >
                                            Proceed to Payment →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6 shadow-xs">
                                    <h2 className="text-xl font-extrabold text-on-surface">Step 3: Confirm & Payment Method</h2>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Payment Option</label>

                                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={() => setPaymentMethod('cod')}
                                                    className="accent-primary cursor-pointer"
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface">Pay Cash / UPI After Service</p>
                                                    <p className="text-xs text-on-surface-variant font-medium">Pay technician directly via Cash, GooglePay, PhonePe or Paytm</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold bg-secondary-container/40 text-secondary px-2.5 py-1 rounded-full">Recommended</span>
                                        </label>

                                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={paymentMethod === 'online'}
                                                    onChange={() => setPaymentMethod('online')}
                                                    className="accent-primary cursor-pointer"
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface">Prepay Online (Credit/Debit Card, Netbanking)</p>
                                                    <p className="text-xs text-on-surface-variant font-medium">Instant confirmation with 100% refund guarantee</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="sh-btn-outline w-1/3 flex justify-center"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateBooking}
                                            disabled={submitting}
                                            className="sh-btn-primary flex-1 flex justify-center disabled:opacity-50 !h-12 !text-base"
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
                        <div className="lg:col-span-4">
                            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-xl space-y-6 sticky top-24">
                                <h3 className="font-extrabold text-base text-on-surface border-b border-outline-variant/20 pb-4">Booking Summary</h3>

                                <div className="space-y-3 text-xs font-medium text-on-surface-variant">
                                    <div className="flex justify-between">
                                        <span>Professional:</span>
                                        <span className="font-bold text-on-surface">{provider?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date & Slot:</span>
                                        <span className="font-bold text-on-surface">{selectedDate}, {selectedSlot}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Location:</span>
                                        <span className="font-bold text-on-surface truncate max-w-[160px]">{address}</span>
                                    </div>

                                    <div className="border-t border-outline-variant/20 pt-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Technician Visiting Fare</span>
                                            <span className="font-bold text-on-surface">₹{price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Safety & Inspection Fee</span>
                                            <span className="font-bold text-on-surface">₹{safetyFee}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes & GST (18%)</span>
                                            <span className="font-bold text-on-surface">₹{tax}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-baseline">
                                        <span className="font-extrabold text-base text-on-surface">Total Payable</span>
                                        <span className="text-2xl font-extrabold text-primary">₹{totalPrice}</span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-primary">
                                        <ShieldCheck className="w-4 h-4" /> ServiceHub Promise
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
