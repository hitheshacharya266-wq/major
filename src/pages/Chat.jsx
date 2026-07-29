import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import { Send, PhoneCall, ShieldCheck, MapPin, Wrench, CheckCircle2 } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Rahul Kumar', text: 'Hello! I am on my way to your address in Bejai, Mangaluru.', time: '10:05 AM', isMe: false },
        { id: 2, sender: 'You', text: 'Great! Please call me when you reach near the main landmark.', time: '10:07 AM', isMe: true },
        { id: 3, sender: 'Rahul Kumar', text: 'Sure thing. I have all the spare MCB switches ready for your DB box.', time: '10:08 AM', isMe: false }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'You', text: input.trim(), time: 'Just now', isMe: true }]);
        setInput('');
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8 flex-1 w-full">
                    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-xl overflow-hidden flex flex-col h-[650px]">
                        {/* CHAT HEADER */}
                        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                                    R
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-on-surface">Rahul Kumar (Master Electrician)</h3>
                                    <span className="text-[11px] text-secondary font-semibold flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Verified Partner • Active Booking #BK-9402
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => alert('Calling Partner Helpline...')} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
                                <PhoneCall className="w-4 h-4" />
                            </button>
                        </div>

                        {/* MESSAGES BODY */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-surface/50">
                            {messages.map(m => (
                                <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-xs sm:max-w-md p-4 rounded-2xl text-xs font-medium ${m.isMe ? 'bg-primary text-white rounded-br-none shadow-xs' : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-bl-none shadow-xs'}`}>
                                        <p>{m.text}</p>
                                        <span className={`block text-[10px] mt-1 text-right ${m.isMe ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}>{m.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* INPUT FOOTER */}
                        <form onSubmit={handleSend} className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message for your technician..."
                                className="flex-1 px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button type="submit" className="p-3 bg-primary text-white rounded-xl shadow-md hover:bg-primary/90">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
};

export default Chat;
