import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProviderProfile, createBooking } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import {
    ArrowLeft, ShieldCheck, MapPin, Calendar, Clock, CheckCircle2,
    Lock, CreditCard, Wallet, IndianRupee, AlertCircle
} from 'lucide-react';

const BookingCheckout = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form Steps & State
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
    const [address, setAddress] = useState('Flat 402, Royal Palms, Bejai Main Road, Mangaluru');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        const fetchProvider = async () => {
            setLoading(true);
            try {
                const pData = await getProviderProfile(providerId);
                if (pData) {
                    setProvider(pData);
                } else {
                    setProvider({
                        id: providerId,
                        name: 'Rahul Kumar',
                        category: 'electrician',
                        price: 399,
                        rating: 4.9,
                        location: 'Bejai, Mangaluru'
                    });
                }
            } catch {
                setProvider({
                    id: providerId,
                    name: 'Rahul Kumar',
                    category: 'electrician',
                    price: 399,
                    rating: 4.9,
                    location: 'Bejai, Mangaluru'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProvider();
    }, [providerId]);

    const handleConfirmBooking = async (e) => {
        e?.preventDefault();

        if (!currentUser) {
            toast.error('Please sign in to complete your booking');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const bookingData = {
                userId: currentUser.uid,
                userName: userProfile?.fullName || userProfile?.name || currentUser.displayName || 'Customer',
                userEmail: currentUser.email,
                providerId: provider.id,
                providerName: provider.name,
                category: provider.category || 'general',
                price: provider.price || 399,
                address,
                notes,
                date: selectedDate,
                slot: selectedSlot,
                paymentMethod,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await createBooking(bookingData);
            toast.success('Booking confirmed successfully! 🎉');
            navigate('/user-dashboard');
        } catch (err) {
            toast.error('Failed to place booking: ' + err.message);
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

    const basePrice = provider?.price || 399;
    const safetyFee = 49;
    const taxes = Math.round(basePrice * 0.18);
    const totalPrice = basePrice + safetyFee + taxes;

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                {/* TRANSACTIONAL HEADER */}
                <header className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center px-6 lg:px-8">
                    <div className="max-w-container-max mx-auto w-full flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="flex items-center gap-2 text-sm font-bold text-secondary bg-secondary-container/40 px-3.5 py-1 rounded-full border border-secondary/20">
                            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 lg:px-8 py-10 flex-1 w-full">
                    {/* PROGRESS STEPPER */}
                    <div className="flex items-center justify-between mb-10 max-w-xl mx-auto">
                        <div className={`flex flex-col items-center gap-1.5 ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                1
                            </div>
                            <span className="text-xs font-bold">Service Details</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-outline-variant/40'}`} />
                        <div className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                2
                            </div>
                            <span className="text-xs font-bold">Date & Time</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-outline-variant/40'}`} />
                        <div className={`flex flex-col items-center gap-1.5 ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant'}`}>
                                3
                            </div>
                            <span className="text-xs font-bold">Confirm & Pay</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* MAIN STEP FORM CONTENT */}
                        <div className="lg:col-span-7 space-y-6">
                            {step === 1 && (
                                <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 space-y-6">
                                    <h2 className="text-xl font-extrabold text-on-surface">Step 1: Service & Address Details</h2>

                                    {/* Selected Provider Card */}
                                    <div className="p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-primary text-white font-bold text-xl flex items-center justify-center shrink-0">
                                            {provider?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-on-surface">{provider?.name}</p>
                                            <p className="text-xs text-primary font-semibold capitalize">{provider?.category}</p>
                                            <p className="text-xs text-on-surface-variant">{provider?.location}</p>
                                        </div>
                                    </div>

                                    {/* Address Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Service Location Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-primary" />
                                            <textarea
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                rows={2}
                                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Special Notes */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Instructions for Technician (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Specify exact issue (e.g., Main switch tripping when AC turns on)..."
                                            rows={3}
                                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm shadow-md hover:bg-primary/90"
                                    >
                                        Continue to Schedule →
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 space-y-6">
                                    <h2 className="text-xl font-extrabold text-on-surface">Step 2: Select Date & Time Slot</h2>

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Preferred Date</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Today', 'Tomorrow', 'Day After'].map(d => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => setSelectedDate(d)}
                                                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${selectedDate === d ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Slots */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Technician Arrival Slot</label>
                                        <div className="space-y-2">
                                            {[
                                                '09:00 AM - 11:00 AM (Morning)',
                                                '11:00 AM - 01:00 PM (Mid Day)',
                                                '02:00 PM - 04:00 PM (Afternoon)',
                                                '05:00 PM - 07:00 PM (Evening)'
                                            ].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setSelectedSlot(s)}
                                                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${selectedSlot === s ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary'}`}
                                                >
                                                    <span><Clock className="w-3.5 h-3.5 inline mr-2 text-primary" /> {s}</span>
                                                    {selectedSlot === s && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-1/3 py-3.5 bg-surface-container text-on-surface font-bold rounded-xl text-sm"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(3)}
                                            className="w-2/3 py-3.5 bg-primary text-white font-bold rounded-xl text-sm shadow-md"
                                        >
                                            Continue to Payment →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 space-y-6">
                                    <h2 className="text-xl font-extrabold text-on-surface">Step 3: Select Payment Method</h2>

                                    <div className="space-y-3">
                                        <label className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-outline-variant/30 bg-surface'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payMethod"
                                                    checked={paymentMethod === 'cash'}
                                                    onChange={() => setPaymentMethod('cash')}
                                                    className="accent-primary"
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface">Pay After Service (Cash / UPI on Site)</p>
                                                    <p className="text-xs text-on-surface-variant">Pay technician directly once job is completed & verified</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-full">Recommended</span>
                                        </label>

                                        <label className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/10' : 'border-outline-variant/30 bg-surface'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payMethod"
                                                    checked={paymentMethod === 'upi'}
                                                    onChange={() => setPaymentMethod('upi')}
                                                    className="accent-primary"
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface">Instant Online UPI / GPay / PhonePe</p>
                                                    <p className="text-xs text-on-surface-variant">Fast 1-click refund protection guarantee</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="w-1/3 py-3.5 bg-surface-container text-on-surface font-bold rounded-xl text-sm"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={handleConfirmBooking}
                                            className="w-2/3 py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-sm shadow-lg shadow-secondary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submitting ? 'Placing Booking...' : 'Confirm & Place Booking 🎉'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SUMMARY SIDEBAR */}
                        <div className="lg:col-span-5">
                            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-6 sticky top-24">
                                <h3 className="font-extrabold text-base text-on-surface border-b border-outline-variant/20 pb-3">
                                    Booking Summary
                                </h3>

                                <div className="space-y-2 text-xs font-semibold text-on-surface-variant">
                                    <div className="flex justify-between">
                                        <span>Professional:</span>
                                        <span className="text-on-surface font-bold">{provider?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date & Slot:</span>
                                        <span className="text-on-surface font-bold">{selectedDate}, {selectedSlot.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Location:</span>
                                        <span className="text-on-surface font-bold truncate max-w-[180px]">{address}</span>
                                    </div>
                                </div>

                                <div className="border-t border-outline-variant/20 pt-4 space-y-2.5 text-xs text-on-surface-variant font-medium">
                                    <div className="flex justify-between">
                                        <span>Technician Visiting Fare</span>
                                        <span className="font-bold text-on-surface">₹{basePrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Safety & Inspection Fee</span>
                                        <span className="font-bold text-on-surface">₹{safetyFee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes & GST (18%)</span>
                                        <span className="font-bold text-on-surface">₹{taxes}</span>
                                    </div>
                                    <div className="border-t border-outline-variant/20 pt-3 flex justify-between text-base font-extrabold text-on-surface">
                                        <span>Total Payable</span>
                                        <span className="text-primary text-xl">₹{totalPrice}</span>
                                    </div>
                                </div>

                                <div className="bg-surface-container p-3.5 rounded-2xl text-[11px] text-on-surface-variant space-y-1">
                                    <p className="font-bold text-on-surface flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> ServiceHub Promise
                                    </p>
                                    <p>30-day post-service warranty with free revisit guarantee.</p>
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
