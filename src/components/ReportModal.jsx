import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createReport } from '../firebase/firestoreService';
import { AlertCircle, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_CATEGORIES = [
    { id: 'quality', label: 'Service Quality Issue' },
    { id: 'behavior', label: 'Unprofessional Conduct' },
    { id: 'safety', label: 'Safety or Security Concern' },
    { id: 'pricing', label: 'Pricing or Billing Dispute' },
    { id: 'noshow', label: 'Provider No-Show / Delay' },
    { id: 'other', label: 'Other Issue' }
];

const ReportModal = ({
    isOpen,
    onClose,
    targetType = 'provider',
    targetId = '',
    targetName = '',
    bookingId = ''
}) => {
    const { currentUser, userProfile } = useAuth();
    const [category, setCategory] = useState('quality');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please sign in to submit a complaint.');
            return;
        }

        if (!description.trim() || description.trim().length < 10) {
            toast.error('Please provide a detailed description (minimum 10 characters).');
            return;
        }

        setSubmitting(true);
        try {
            await createReport({
                type: targetType,
                reporterId: currentUser.uid,
                reporterName: userProfile?.fullName || currentUser.displayName || 'Customer',
                reporterEmail: currentUser.email || '',
                targetId,
                targetName: targetName || 'Service Provider',
                bookingId,
                description: `[Category: ${category}] ${description.trim()}`
            });

            toast.success('Your report has been submitted to the admin moderation team.');
            setDescription('');
            onClose();
        } catch (err) {
            console.error('Failed to submit report:', err);
            let userMsg = 'Failed to submit report. Please try again.';
            if (err.code === 'permission-denied') {
                userMsg = 'Database permission denied. Please verify your login session or contact support.';
            } else if (err.message && !err.message.includes('API') && !err.message.includes('key') && !err.message.includes('secret')) {
                userMsg = err.message;
            }
            toast.error(userMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/40 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-on-surface">Report Issue or Complaint</h3>
                            <p className="text-xs text-on-surface-variant">
                                Submit a formal complaint regarding {targetName ? `"${targetName}"` : 'this service'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                            Complaint Reason
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-on-surface outline-none focus:border-primary transition-colors cursor-pointer"
                        >
                            {REPORT_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                            Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please describe what happened in detail so administrators can investigate and resolve your issue..."
                            className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs text-on-surface outline-none focus:border-primary transition-colors resize-none"
                            required
                        />
                        <p className="text-[11px] text-on-surface-variant mt-1">Minimum 10 characters.</p>
                    </div>

                    <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 text-[11px] text-on-surface-variant flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                            All reports are reviewed by ServiceHub administrators. False or abusive reporting may lead to account penalties.
                        </span>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        >
                            {submitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
