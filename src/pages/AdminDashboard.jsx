/**
 * Admin Dashboard
 *
 * Displays all users and service providers in tabbed tables.
 * Features:
 * - Dark gradient theme with glassmorphism
 * - Page transition animation
 */
import { useState, useEffect } from 'react';
import { getAllUsers, getAllProviders } from '../firebase/firestoreService';
import { formatDate, SERVICE_CATEGORIES } from '../utils/helpers';
import { Users, Wrench, Shield } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [u, p] = await Promise.all([getAllUsers(), getAllProviders()]);
                setUsers(u);
                setProviders(p);
            } catch (err) {
                console.error('Admin fetch failed:', err);
                toast.error('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading admin panel..." />;
    }

    return (
        <PageTransition>
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
                {/* Background orbs */}
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                        </div>
                        <p className="text-slate-400 ml-11">Manage users and service providers</p>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="glass-card p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{users.length}</p>
                                <p className="text-sm text-slate-400">Total Users</p>
                            </div>
                        </div>
                        <div className="glass-card p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{providers.length}</p>
                                <p className="text-sm text-slate-400">Service Providers</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'users'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'glass text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Users className="w-4 h-4" /> All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('providers')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'providers'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'glass text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Wrench className="w-4 h-4" /> Service Providers
                        </button>
                    </div>

                    {/* Users table */}
                    {activeTab === 'users' && (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Name</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Email</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Role</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-5 py-3.5 font-medium text-white">{user.fullName || user.name}</td>
                                                <td className="px-5 py-3.5 text-slate-400">{user.email}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${user.role === 'admin'
                                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                            : user.role === 'provider'
                                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-500">{formatDate(user.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Providers table */}
                    {activeTab === 'providers' && (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Name</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Category</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Rating</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Status</th>
                                            <th className="text-left px-5 py-4 font-semibold text-slate-300">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {providers.map((p) => {
                                            const cat = SERVICE_CATEGORIES.find(c => c.id === p.category);
                                            return (
                                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-5 py-3.5 font-medium text-white">{p.name}</td>
                                                    <td className="px-5 py-3.5 text-slate-300">
                                                        {cat?.emoji} {cat?.label || p.category}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-slate-300">
                                                        ⭐ {p.rating?.toFixed(1) || '0.0'} ({p.ratingCount || 0})
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.available
                                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                                                            }`}>
                                                            {p.available ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-slate-500">{formatDate(p.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default AdminDashboard;
