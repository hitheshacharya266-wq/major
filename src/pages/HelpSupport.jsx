import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { PhoneCall, Mail, ChevronRight, Minus, CheckCircle2 } from 'lucide-react';

const FAQS = [
    {
        q: 'How does ServiceHub ensure professional safety & background verification?',
        points: [
            'Every service partner undergoes 3-step identity & police background verification.',
            'Technical skill assessments and trade certifications are mandatory before onboarding.',
            'Technicians follow strict safety protocols, carry digital ID badges, and wear uniforms.'
        ]
    },
    {
        q: 'What is the 30-Day Service Guarantee?',
        points: [
            '100% free re-inspection and fix if any issue recurs within 30 days of service.',
            'Free repair or replacement warranty on spare parts provided through ServiceHub.',
            'Priority re-dispatch of a senior master technician at zero extra cost.'
        ]
    },
    {
        q: 'How are prices calculated?',
        points: [
            'Upfront fixed visiting and service inspection rates shown before booking.',
            'Transparent material rate cards with zero hidden platform charges.',
            'Itemized digital GST invoice provided directly on your customer dashboard.'
        ]
    },
    {
        q: 'Can I cancel or reschedule my booking?',
        points: [
            'Free instant cancellation up to 30 minutes before appointment slot.',
            'Easy 1-click rescheduling to any preferred date/time on customer dashboard.',
            'Instant 100% refund processed back to original UPI/card payment method.'
        ]
    },
    {
        q: 'What payment methods are accepted?',
        points: [
            'Pay-after-service Cash directly to the verified service professional.',
            'Instant digital UPI payments via Google Pay, PhonePe, Paytm, and BHIM.',
            'Credit Cards, Debit Cards, and Net Banking supported via 256-bit SSL encryption.'
        ]
    },
    {
        q: 'How do I contact customer support?',
        points: [
            'Call Karnataka regional toll-free helpline at 1800-425-7890 (24/7 active).',
            'Email customer support desk at support@servicehub.in (under 15-minute response time).',
            'Live chat assistance available directly from your active booking tracking card.'
        ]
    },
    {
        q: 'Is ServiceHub available in my area?',
        points: [
            'Serving all PIN codes across Mangaluru city (Bejai, Kadri, Surathkal, etc.).',
            'Fully operational in Hassan town and surrounding commercial hubs.',
            'Complete coverage in Udupi, Manipal, and coastal Karnataka districts.'
        ]
    }
];

const HelpSupport = () => {
    const [openIdx, setOpenIdx] = useState(0);

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-sans text-[#0b1c30] items-center w-full">
                <main className="w-full max-w-[960px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex-1 space-y-8">
                    
                    {/* Centered Header */}
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <span className="text-[11px] font-black text-[#004d4c] uppercase tracking-widest bg-[#e6f4f1] px-3.5 py-1 rounded-full border border-[#004d4c]/15 inline-block">
                            SUPPORT CENTER
                        </span>
                        <h1 className="text-2xl sm:text-4xl font-black text-[#0b1c30] tracking-tight">How can we help you today?</h1>
                        <p className="text-xs sm:text-sm text-on-surface-variant font-medium">24/7 customer assistance and instant answers to common questions.</p>
                    </div>

                    {/* Support Contact Cards Grid (Equal Width, No Chevrons) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/30 text-left flex items-start gap-4 shadow-2xs hover:border-[#004d4c] transition-all cursor-pointer">
                            <div className="w-11 h-11 rounded-xl bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center font-bold shrink-0">
                                <PhoneCall className="w-5 h-5 text-[#004d4c]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-sm sm:text-base text-[#0b1c30]">Call Toll Free Helpline</h3>
                                <p className="text-xs text-on-surface-variant font-medium">Speak directly with our Karnataka regional support team.</p>
                                <p className="text-sm sm:text-base font-black text-[#004d4c] pt-0.5">1800-425-7890</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/30 text-left flex items-start gap-4 shadow-2xs hover:border-[#004d4c] transition-all cursor-pointer">
                            <div className="w-11 h-11 rounded-xl bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center font-bold shrink-0">
                                <Mail className="w-5 h-5 text-[#004d4c]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-sm sm:text-base text-[#0b1c30]">Email Desk</h3>
                                <p className="text-xs text-on-surface-variant font-medium">Average response time: under 15 minutes.</p>
                                <p className="text-sm sm:text-base font-black text-[#004d4c] pt-0.5">support@servicehub.in</p>
                            </div>
                        </div>
                    </div>

                    {/* Frequently Asked Questions Card (Proper Horizontal Padding & Zero Left Clipping) */}
                    <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-2xs overflow-hidden w-full text-left">
                        <div className="px-5 sm:px-7 py-5 sm:py-6 border-b border-outline-variant/20">
                            <h3 className="text-lg sm:text-xl font-black text-[#0b1c30]">Frequently Asked Questions</h3>
                        </div>

                        <div className="divide-y divide-outline-variant/20">
                            {FAQS.map((faq, i) => {
                                const isOpen = openIdx === i;
                                return (
                                    <div key={i} className="transition-colors">
                                        <button
                                            onClick={() => setOpenIdx(isOpen ? null : i)}
                                            className={`w-full text-left font-extrabold text-xs sm:text-sm md:text-base flex justify-between items-center px-5 sm:px-7 py-4 sm:py-5 cursor-pointer transition-all ${
                                                isOpen ? 'bg-[#e6f4f1] text-[#004d4c]' : 'text-[#0b1c30] hover:bg-surface-container/30'
                                            }`}
                                        >
                                            <span className="flex-1 min-w-0 pr-3 leading-snug">{faq.q}</span>
                                            {isOpen ? (
                                                <Minus className="w-5 h-5 text-[#004d4c] shrink-0 ml-3" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-on-surface-variant/50 shrink-0 ml-3" />
                                            )}
                                        </button>

                                        {isOpen && (
                                            <div className="px-5 sm:px-7 py-5 sm:py-6 bg-white space-y-3 border-t border-[#004d4c]/10">
                                                {faq.points.map((pt, pIdx) => (
                                                    <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
                                                        <CheckCircle2 className="w-4 h-4 text-[#004d4c] shrink-0 mt-0.5" />
                                                        <span>{pt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default HelpSupport;
