/**
 * Login Page — Light Premium Theme
 *
 * Clean, minimal login with soft shadows and teal accent.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../firebase/authService';
import { getUserProfile } from '../firebase/firestoreService';
import {
    getDashboardPath, getFirebaseErrorMessage,
    validateEmail, validatePassword
} from '../utils/helpers';
import { LogIn, Mail, Lock, Wrench, Eye, EyeOff } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

                <div className="w-full max-w-[480px] relative z-10 animate-slide-up">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 mb-6"
                        >
                            <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/20 rotate-3">
                                <Wrench className="w-7 h-7 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
                        <p className="text-gray-500 mt-2 font-medium">Continue your journey with ServiceHub</p>
                    </div>

                    {/* Card */}
                    <div className="glass-card p-10 shadow-2xl shadow-teal-900/5">
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                    <input
                                        type="email"
                                        id="login-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-medium"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-sm font-bold text-gray-700">Password</label>
                                    <button type="button" className="text-xs font-bold text-teal-600 hover:text-teal-700">Forgot?</button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="login-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                id="login-submit"
                                disabled={loading}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 active:scale-[0.98] mt-4 text-base"
                            >
                                {loading ? (
                                    <div className="spinner-ring w-6 h-6 border-2" />
                                ) : (
                                    <><LogIn className="w-5 h-5" /> Sign In</>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                            <p className="text-gray-500 font-medium">
                                New to ServiceHub?{' '}
                                <Link to="/register" className="text-teal-600 hover:text-teal-700 font-bold transition-colors underline underline-offset-4 decoration-2 decoration-teal-100 hover:decoration-teal-600">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
