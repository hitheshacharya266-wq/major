import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Users, Calendar, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, bookings: 0, pendingProviders: 0 });
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Stats placeholders (In real app, use aggregation queries or counters)
            const usersSnap = await getDocs(collection(db, "users"));
            const bookingsSnap = await getDocs(collection(db, "bookings"));

            // Fetch pending providers
            const q = query(collection(db, "users"), where("role", "==", "provider"), where("isVerified", "==", false));
            const providersSnap = await getDocs(q);
            const providersData = providersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            setStats({
                users: usersSnap.size,
                bookings: bookingsSnap.size,
                pendingProviders: providersSnap.size
            });
            setProviders(providersData);

        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const verifyProvider = async (id, isVerified) => {
        try {
            await updateDoc(doc(db, "users", id), { isVerified });
            // Remove from local list if accepted, or keep if rejected? 
            // For now, refresh list
            fetchData();
        } catch (err) {
            console.error("Error updating provider:", err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats.users}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Bookings</p>
                            <h3 className="text-2xl font-bold">{stats.bookings}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Approvals</p>
                            <h3 className="text-2xl font-bold">{stats.pendingProviders}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Verifications */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Pending Provider Verifications</h2>
                {providers.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        No pending providers to verify.
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {providers.map(provider => (
                            <Card key={provider.id}>
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{provider.name}</h3>
                                        <p className="text-sm text-gray-500">{provider.email}</p>
                                        <p className="text-sm text-gray-600 mt-1">Skills: {provider.skills?.join(", ") || "Not specified"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => verifyProvider(provider.id, true)}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                        {/* Reject could delete or mark as rejected. For now just ignore */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
