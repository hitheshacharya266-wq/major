import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase/authService';
import {
    getDashboardPath, getFirebaseErrorMessage,
    validateEmail, validatePassword, validateName,
    SERVICE_CATEGORIES
} from '../utils/helpers';
import { UserPlus, Mail, Lock, User, Wrench, Eye, EyeOff, Briefcase, FileText, ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'user', category: 'plumber', description: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const nameErr = validateName(formData.name);
        if (nameErr) return setError(nameErr);
        const emailErr = validateEmail(formData.email);
        if (emailErr) return setError(emailErr);
        const passErr = validatePassword(formData.password);
        if (passErr) return setError(passErr);
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
        if (formData.role === 'provider' && !formData.description.trim()) return setError('Please describe your services.');

        setLoading(true);
        try {
            const providerData = formData.role === 'provider'
                ? { category: formData.category, description: formData.description } : {};
            await registerUser(formData.email, formData.password, formData.name, formData.role, providerData);
            toast.success('Account created successfully! 🎉');
            navigate(getDashboardPath(formData.role));
        } catch (err) {
            const message = getFirebaseErrorMessage(err.code);
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="flex-1 flex items-center justify-center p-6 my-10">
                    <div className="w-full max-w-lg space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                                <Wrench className="w-7 h-7" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-on-surface">Create an Account</h1>
                            <p className="text-sm font-medium text-on-surface-variant">Join ServiceHub community in Coastal Karnataka</p>
                        </div>

                        {/* Card */}
                        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-xl space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <span>⚠️</span> <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="John Doe" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="name@example.com" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                                                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Confirm</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2 text-center">Account Purpose</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, role: 'user' }))}
                                            className={`py-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${formData.role === 'user'
                                                ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                                : 'bg-surface border-outline-variant/30 text-on-surface-variant'}`}>
                                            <span className="text-xl">🏠</span>
                                            Book Services
                                        </button>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, role: 'provider' }))}
                                            className={`py-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${formData.role === 'provider'
                                                ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                                : 'bg-surface border-outline-variant/30 text-on-surface-variant'}`}>
                                            <span className="text-xl">🔧</span>
                                            Provide Services
                                        </button>
                                    </div>
                                </div>

                                {formData.role === 'provider' && (
                                    <div className="space-y-4 pt-2 border-t border-outline-variant/20">
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Service Category</label>
                                            <select name="category" value={formData.category} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface outline-none">
                                                {SERVICE_CATEGORIES.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Service Bio & Experience</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                                                className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium outline-none resize-none"
                                                placeholder="Tell us about your experience..." />
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 active:scale-95 text-base disabled:opacity-50 mt-4">
                                    {loading ? <div className="spinner-ring w-5 h-5 border-2" /> : <><UserPlus className="w-5 h-5" /> Create Account</>}
                                </button>
                            </form>

                            <div className="border-t border-outline-variant/20 pt-6 text-center text-xs font-medium text-on-surface-variant">
                                Already registered?{' '}
                                <Link to="/login" className="text-primary font-bold hover:underline">Sign In →</Link>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default Register;
