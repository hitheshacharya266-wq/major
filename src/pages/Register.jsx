import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase/authService';
import {
    getDashboardPath, getFirebaseErrorMessage,
    validateEmail, validatePassword, validateName,
    SERVICE_CATEGORIES
} from '../utils/helpers';
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
            if (formData.role === 'provider') {
                navigate('/provider-setup');
            } else {
                navigate('/user-dashboard');
            }
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
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
                {/* Main Auth Container */}
                <main className="flex-grow flex items-center justify-center py-8 sm:py-16 md:py-24 px-4 sm:px-8">
                    <div className="w-full max-w-[580px] mx-auto my-auto">
                        {/* Auth Card */}
                        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[32px] border border-outline-variant/60 shadow-lg space-y-6 sm:space-y-8">
                            {/* Card Header */}
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-container/10 text-primary border border-primary/25 flex items-center justify-center mx-auto mb-3 shadow-xs">
                                    <span className="material-symbols-outlined text-[32px] sm:text-[36px]">person_add</span>
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-black text-on-surface tracking-tight">
                                    Create Account
                                </h1>
                                <p className="text-xs sm:text-sm font-medium text-on-surface-variant max-w-lg mx-auto">
                                    Join ServiceHub to book top local professionals or offer services
                                </p>
                            </div>

                            {/* Error Alert Box */}
                            {error && (
                                <div className="p-4 bg-error-container/40 border border-error/30 rounded-xl text-error text-xs font-semibold flex items-center gap-2.5 shadow-xs">
                                    <span className="material-symbols-outlined text-error text-[20px] shrink-0">warning</span>
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}

                            {/* Role Selector Tabs */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider text-center">
                                    Select Account Purpose
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, role: 'user' }))}
                                        className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${formData.role === 'user'
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-white border-outline-variant/60 text-on-surface-variant hover:border-outline'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                        <span>Book Services</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, role: 'provider' }))}
                                        className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${formData.role === 'provider'
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-white border-outline-variant/60 text-on-surface-variant hover:border-outline'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">handyman</span>
                                        <span>Offer Services</span>
                                    </button>
                                </div>
                            </div>

                            {/* Register Form */}
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                {/* Full Name Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider text-left">
                                        Full Name
                                    </label>
                                    <div className="flex items-center w-full h-12 sm:h-14 px-4 gap-3 bg-white border border-outline-variant/70 rounded-xl sm:rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                        <span className="material-symbols-outlined text-outline text-[22px] shrink-0">badge</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 h-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-on-surface"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider text-left">
                                        Email Address
                                    </label>
                                    <div className="flex items-center w-full h-12 sm:h-14 px-4 gap-3 bg-white border border-outline-variant/70 rounded-xl sm:rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                        <span className="material-symbols-outlined text-outline text-[22px] shrink-0">mail</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 h-full bg-transparent border-none outline-none text-base sm:text-lg font-semibold text-on-surface"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Passwords Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2.5">
                                        <label className="block text-xs sm:text-sm font-black text-on-surface uppercase tracking-widest text-left">
                                            Password
                                        </label>
                                        <div className="flex items-center w-full h-[60px] px-5 gap-3 bg-white border-2 border-outline-variant/70 rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                            <span className="material-symbols-outlined text-outline text-[24px] shrink-0">lock</span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="flex-1 h-full bg-transparent border-none outline-none text-base font-semibold text-on-surface"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-outline hover:text-on-surface transition-colors cursor-pointer shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[22px]">
                                                    {showPassword ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="block text-xs sm:text-sm font-black text-on-surface uppercase tracking-widest text-left">
                                            Confirm Password
                                        </label>
                                        <div className="flex items-center w-full h-[60px] px-5 gap-3 bg-white border-2 border-outline-variant/70 rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                            <span className="material-symbols-outlined text-outline text-[24px] shrink-0">lock_reset</span>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                className="flex-1 h-full bg-transparent border-none outline-none text-base font-semibold text-on-surface"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Fields */}
                                {formData.role === 'provider' && (
                                    <div className="space-y-6 pt-4 border-t border-outline-variant/30">
                                        <div className="space-y-2.5">
                                            <label className="block text-xs sm:text-sm font-black text-on-surface uppercase tracking-widest text-left">
                                                Service Category
                                            </label>
                                            <div className="flex items-center w-full h-[60px] px-6 gap-4 bg-white border-2 border-outline-variant/70 rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                                <span className="material-symbols-outlined text-outline text-[26px] shrink-0">category</span>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="flex-1 h-full bg-transparent border-none outline-none text-base sm:text-lg font-semibold text-on-surface cursor-pointer"
                                                >
                                                    {SERVICE_CATEGORIES.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="block text-xs sm:text-sm font-black text-on-surface uppercase tracking-widest text-left">
                                                Service Bio & Experience
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full p-4 bg-white border-2 border-outline-variant/70 rounded-2xl text-base font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none text-on-surface"
                                                placeholder="Describe your professional experience and services..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Submit CTA Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[60px] bg-primary text-on-primary font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 mt-8"
                                >
                                    {loading ? (
                                        <div className="spinner-ring w-6 h-6 border-3 border-white" />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[26px]">person_add</span>
                                            <span>Create Account</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Card Footer Link */}
                            <div className="pt-8 border-t border-outline-variant/30 text-center text-base sm:text-lg font-medium text-on-surface-variant">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary font-black hover:underline ml-2 inline-flex items-center gap-1">
                                    Sign In →
                                </Link>
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
