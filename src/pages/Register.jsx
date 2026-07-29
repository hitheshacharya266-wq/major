/**
 * Register Page — Light Premium Theme
 *
 * Clean registration with role selection and provider-specific fields.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser } from '../firebase/authService';
import {
    getDashboardPath, getFirebaseErrorMessage,
    validateEmail, validatePassword, validateName,
    SERVICE_CATEGORIES
} from '../utils/helpers';
import { UserPlus, Mail, Lock, User, Wrench, Eye, EyeOff, Briefcase, FileText, ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';
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
            <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-6 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-20 -translate-y-1/2 -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-20 translate-y-1/2 translate-x-1/2" />

                <div className="w-full max-w-[540px] relative z-10 py-12 animate-slide-up">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 mb-6"
                        >
                            <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/20 -rotate-3">
                                <Wrench className="w-7 h-7 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h1>
                        <p className="text-gray-500 mt-2 font-medium">Join the ServiceHub community today</p>
                    </div>

                    {/* Card */}
                    <div className="glass-card p-8 sm:p-10 shadow-2xl shadow-teal-900/5">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl px-4 py-3.5 mb-6 flex items-start gap-2.5"
                            >
                                <span className="text-lg">⚠️</span>
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-medium"
                                        placeholder="John Doe" />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-medium"
                                        placeholder="name@example.com" />
                                </div>
                            </div>

                            {/* Password Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-medium"
                                            placeholder="••••••••" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-medium"
                                            placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1 text-center">I want to</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, role: 'user' }))}
                                        className={`py-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${formData.role === 'user'
                                            ? 'bg-teal-50 border-teal-600 text-teal-700 shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                        <span className="text-2xl">🏠</span>
                                        Find Services
                                    </button>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, role: 'provider' }))}
                                        className={`py-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${formData.role === 'provider'
                                            ? 'bg-teal-50 border-teal-600 text-teal-700 shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                        <span className="text-2xl">🔧</span>
                                        Provide Services
                                    </button>
                                </div>
                            </div>

                            {/* Provider fields */}
                            <AnimatePresence>
                                {formData.role === 'provider' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-2 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Service Category</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                                <select name="category" value={formData.category} onChange={handleChange}
                                                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all appearance-none font-medium">
                                                    {SERVICE_CATEGORIES.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Description</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none font-medium"
                                                    placeholder="Tell us about your experience..." />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button type="submit" disabled={loading}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 active:scale-[0.98] mt-6 text-base">
                                {loading ? <div className="spinner-ring w-6 h-6 border-2" /> : <><UserPlus className="w-5 h-5" /> Create Account</>}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                            <p className="text-gray-500 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-bold transition-colors underline underline-offset-4 decoration-2 decoration-teal-100 hover:decoration-teal-600">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Register;
