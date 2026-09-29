import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, resetPasswordEmail } from '../firebase/authService';
import { getUserProfile } from '../firebase/firestoreService';
import {
    getDashboardPath, getFirebaseErrorMessage,
    validateEmail, validatePassword
} from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!email || !email.trim()) {
            const msg = 'Please enter your email address first.';
            setError(msg);
            toast.error(msg);
            return;
        }

        const emailErr = validateEmail(email);
        if (emailErr) {
            setError(emailErr);
            toast.error(emailErr);
            return;
        }

        setResetLoading(true);
        try {
            await resetPasswordEmail(email.trim());
            const successMsg = 'Password reset email sent! Check your inbox.';
            toast.success(successMsg);
            setError('');
        } catch (err) {
            const message = getFirebaseErrorMessage(err?.code);
            setError(message);
            toast.error(message);
        } finally {
            setResetLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const emailErr = validateEmail(email);
        if (emailErr) return setError(emailErr);
        const passErr = validatePassword(password);
        if (passErr) return setError(passErr);

        setLoading(true);
        try {
            const user = await loginUser(email, password);
            const profile = await getUserProfile(user.uid);
            toast.success(`Welcome back, ${profile?.fullName || profile?.name || 'User'}!`);
            navigate(getDashboardPath(profile?.role));
        } catch (err) {
            const message = getFirebaseErrorMessage(err?.code);
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
                    <div className="w-full max-w-[540px] mx-auto my-auto">
                        {/* Auth Card */}
                        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[32px] border border-outline-variant/60 shadow-lg space-y-6 sm:space-y-8">
                            {/* Card Header */}
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-container/10 text-primary border border-primary/25 flex items-center justify-center mx-auto mb-3 shadow-xs">
                                    <span className="material-symbols-outlined text-[32px] sm:text-[36px]">handyman</span>
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-black text-on-surface tracking-tight">
                                    Welcome Back
                                </h1>
                                <p className="text-xs sm:text-sm font-medium text-on-surface-variant max-w-lg mx-auto">
                                    Sign in to access your bookings & service dashboard
                                </p>
                            </div>

                            {/* Error Alert Box */}
                            {error && (
                                <div className="p-4 bg-error-container/40 border border-error/30 rounded-xl text-error text-xs font-semibold flex items-center gap-2.5 shadow-xs">
                                    <span className="material-symbols-outlined text-error text-[20px] shrink-0">warning</span>
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider text-left">
                                        Email Address
                                    </label>
                                    <div className="flex items-center w-full h-12 sm:h-14 px-4 gap-3 bg-white border border-outline-variant/70 rounded-xl sm:rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                        <span className="material-symbols-outlined text-outline text-[22px] shrink-0">mail</span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="flex-1 h-full bg-transparent border-none outline-none text-base sm:text-lg font-semibold text-on-surface"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs sm:text-sm font-black text-on-surface uppercase tracking-widest text-left">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={resetLoading}
                                            className="text-xs sm:text-sm font-extrabold text-primary hover:underline cursor-pointer tracking-wider disabled:opacity-50"
                                        >
                                            {resetLoading ? 'Sending...' : 'Forgot?'}
                                        </button>
                                    </div>
                                    <div className="flex items-center w-full h-[60px] px-6 gap-4 bg-white border-2 border-outline-variant/70 rounded-2xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                        <span className="material-symbols-outlined text-outline text-[26px] shrink-0">lock</span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="flex-1 h-full bg-transparent border-none outline-none text-base sm:text-lg font-semibold text-on-surface"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <span className="material-symbols-outlined text-[26px]">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Submit CTA Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[60px] bg-primary text-on-primary font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 mt-10"
                                >
                                    {loading ? (
                                        <div className="spinner-ring w-6 h-6 border-3 border-white" />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[26px]">login</span>
                                            <span>Sign In</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Card Footer Link */}
                            <div className="pt-8 border-t border-outline-variant/30 text-center text-base sm:text-lg font-medium text-on-surface-variant">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary font-black hover:underline ml-2 inline-flex items-center gap-1">
                                    Create account →
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

export default Login;
