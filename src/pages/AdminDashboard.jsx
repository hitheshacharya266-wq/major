import { useState, useEffect } from 'react';
import { getAllUsers, getAllProviders } from '../firebase/firestoreService';
import { SERVICE_CATEGORIES } from '../utils/helpers';
import { Users, Wrench, Shield, Search, CheckCircle2, ShieldCheck, Mail, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [u, p] = await Promise.all([getAllUsers(), getAllProviders()]);
                setUsers(u || []);
                setProviders(p || []);
            } catch {
                toast.error('Failed to load system admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <LoadingSpinner text="Initializing Admin Control Panel..." />
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProviders = providers.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
                {/* ADMIN HEADER */}
                <section className="bg-surface-container-low border-b border-outline-variant/30 py-10 px-6 lg:px-8">
                    <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> System Command Center
                            </span>
                            <h1 className="text-3xl font-extrabold text-on-surface">Platform Administration</h1>
                            <p className="text-sm text-on-surface-variant">Oversee user accounts, service partner verification, and regional platform activity.</p>
                        </div>

                        {/* Search Input */}
                        <div className="glass-card p-1.5 rounded-xl flex items-center gap-2 max-w-sm w-full border border-outline-variant/40">
                            <Search className="w-4 h-4 text-on-surface-variant ml-3 shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search user or provider..."
                                className="bg-transparent border-none outline-none text-sm text-on-surface w-full py-1.5"
                            />
                        </div>
                    </div>
                </section>

                <main className="max-w-container-max mx-auto px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                    {/* SYSTEM STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                                👥
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{users.length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Registered Platform Users</p>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl">
                                🛠️
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">{providers.length}</p>
                                <p className="text-xs text-on-surface-variant font-medium">Verified Service Partners</p>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
                                📍
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-on-surface">3</p>
                                <p className="text-xs text-on-surface-variant font-medium">Active Coverage Districts</p>
                            </div>
                        </div>
                    </div>

                    {/* TAB SELECTION */}
                    <div className="border-b border-outline-variant/30 flex gap-6 text-sm font-bold">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-3 transition-colors ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            Registered Users ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('providers')}
                            className={`pb-3 transition-colors ${activeTab === 'providers' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            Service Partners ({providers.length})
                        </button>
                    </div>

                    {/* USERS TABLE */}
                    {activeTab === 'users' && (
                        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-xs uppercase tracking-wider font-bold text-on-surface-variant border-b border-outline-variant/30">
                                        <th className="py-4 px-6">User / Name</th>
                                        <th className="py-4 px-6">Email Address</th>
                                        <th className="py-4 px-6">Role</th>
                                        <th className="py-4 px-6">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                                    {filteredUsers.map((u, i) => (
                                        <tr key={u.id || i} className="hover:bg-surface-container/30 transition-colors">
                                            <td className="py-4 px-6 font-bold text-on-surface">{u.fullName || u.name || 'User'}</td>
                                            <td className="py-4 px-6 text-on-surface-variant">{u.email}</td>
                                            <td className="py-4 px-6 font-bold uppercase text-primary">{u.role || 'user'}</td>
                                            <td className="py-4 px-6">
                                                <span className="bg-secondary-container/40 text-secondary font-bold px-2.5 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PROVIDERS TABLE */}
                    {activeTab === 'providers' && (
                        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-xs uppercase tracking-wider font-bold text-on-surface-variant border-b border-outline-variant/30">
                                        <th className="py-4 px-6">Partner Name</th>
                                        <th className="py-4 px-6">Category</th>
                                        <th className="py-4 px-6">Rating</th>
                                        <th className="py-4 px-6">Hourly Rate</th>
                                        <th className="py-4 px-6">Duty State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                                    {filteredProviders.map((p, i) => (
                                        <tr key={p.id || i} className="hover:bg-surface-container/30 transition-colors">
                                            <td className="py-4 px-6 font-bold text-on-surface">{p.name}</td>
                                            <td className="py-4 px-6 font-bold capitalize text-primary">{p.category}</td>
                                            <td className="py-4 px-6 text-amber-600 font-bold">★ {p.rating || 4.9}</td>
                                            <td className="py-4 px-6 font-bold text-on-surface">₹{p.price || 399}</td>
                                            <td className="py-4 px-6">
                                                <span className={`font-bold px-2.5 py-0.5 rounded-full ${p.available ? 'bg-secondary-container/40 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                                                    {p.available ? 'On Duty' : 'Offline'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default AdminDashboard;
