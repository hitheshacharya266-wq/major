/**
 * BookingModal Component
 *
 * Modal dialog for confirming a service booking.
 * Dark theme with glassmorphism.
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import { motion } from 'framer-motion';

const BookingModal = ({ provider, onConfirm, onClose }) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const category = SERVICE_CATEGORIES.find(c => c.id === provider.category);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm({ notes });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="glass-strong rounded-2xl shadow-2xl w-full max-w-md"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">Book Service</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Provider info */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                        <p className="text-sm text-slate-400">Service Provider</p>
                        <p className="font-semibold text-white">{provider.name}</p>
                        <p className="text-sm text-emerald-400">
                            {category?.emoji} {category?.label || provider.category}
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Additional Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none resize-none text-sm transition-all"
                            placeholder="Describe the issue or service needed..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                        >
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BookingModal;
