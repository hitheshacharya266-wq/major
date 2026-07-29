import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../firebase/authService';
import { getUserProfile } from '../firebase/firestoreService';
import {
    getDashboardPath, getFirebaseErrorMessage,
    validateEmail, validatePassword
} from '../utils/helpers';
import { LogIn, Mail, Lock, Wrench, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
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
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                <main className="flex-1 flex items-center justify-center p-6 my-10">
                    <div className="w-full max-w-md space-y-6">
                        {/* Logo & Heading */}
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                                <Wrench className="w-7 h-7" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-on-surface">Welcome back</h1>
                            <p className="text-sm font-medium text-on-surface-variant">Sign in to manage your bookings & account</p>
                        </div>

                        {/* Glass Auth Card */}
                        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-xl space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <span>⚠️</span> <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Password</label>
                                        <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot?</button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant/40 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 active:scale-95 text-base disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="spinner-ring w-5 h-5 border-2" />
                                    ) : (
                                        <><LogIn className="w-5 h-5" /> Sign In</>
                                    )}
                                </button>
                            </form>

                            <div className="border-t border-outline-variant/20 pt-6 text-center text-xs font-medium text-on-surface-variant">
                                New to ServiceHub?{' '}
                                <Link to="/register" className="text-primary font-bold hover:underline">
                                    Create an account →
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
