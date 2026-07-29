import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { HelpCircle, PhoneCall, Mail, ShieldCheck, ChevronDown, Wrench } from 'lucide-react';

const FAQS = [
    { q: 'How does ServiceHub ensure professional safety & background verification?', a: 'Every service partner undergoes identity check, criminal record verification, and a practical technical skill assessment before being authorized to accept bookings in Coastal Karnataka.' },
    { q: 'What is the 30-Day Service Guarantee?', a: 'If any issue persists or recurs within 30 days of service completion, we dispatch a senior technician to re-inspect and fix it 100% free of cost.' },
    { q: 'How are prices calculated?', a: 'We show upfront fixed visiting rates with transparent material costs. There are no surprise hidden charges after the job.' },
    { q: 'Can I cancel or reschedule my booking?', a: 'Yes, you can cancel or reschedule for free up to 30 minutes before the technician is dispatched.' }
];

const HelpSupport = () => {
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
                    <div className="text-center max-w-xl mx-auto space-y-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Support Center</span>
                        <h1 className="text-3xl font-extrabold text-on-surface">How can we help you today?</h1>
                        <p className="text-sm text-on-surface-variant">24/7 Customer assistance and instant answers to common questions.</p>
                    </div>

                    {/* Support Channels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center space-y-3 shadow-xs">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto font-bold">
                                <PhoneCall className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-base text-on-surface">Call Toll Free Helpline</h3>
                            <p className="text-xs text-on-surface-variant">Speak directly with our Karnataka regional support team.</p>
                            <p className="text-sm font-extrabold text-primary">1800-425-7890</p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center space-y-3 shadow-xs">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto font-bold">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-base text-on-surface">Email Desk</h3>
                            <p className="text-xs text-on-surface-variant">Average response time: under 15 minutes.</p>
                            <p className="text-sm font-extrabold text-secondary">support@servicehub.in</p>
                        </div>
                    </div>

                    {/* FAQs Accordion */}
                    <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 space-y-4">
                        <h3 className="text-xl font-extrabold text-on-surface mb-6">Frequently Asked Questions</h3>
                        {FAQS.map((faq, i) => (
                            <div key={i} className="border-b border-outline-variant/20 pb-4">
                                <button
                                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                    className="w-full text-left font-bold text-sm text-on-surface flex justify-between items-center py-2"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-4 h-4 text-primary transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openIdx === i && (
                                    <p className="text-xs text-on-surface-variant pt-2 leading-relaxed font-medium">
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default HelpSupport;
