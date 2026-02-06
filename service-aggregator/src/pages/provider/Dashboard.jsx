import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle } from 'lucide-react';

export default function ProviderDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            // DEMO: Fetch ALL requested bookings for demonstration purposes
            // In production: where("providerId", "==", user.uid)
            const q = query(
                collection(db, "bookings"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchRequests();
    }, [user]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await updateDoc(doc(db, "bookings", bookingId), {
                status: newStatus
            });
            // Refresh local state
            setRequests(prev => prev.map(req =>
                req.id === bookingId ? { ...req, status: newStatus } : req
            ));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="text-center py-10">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Welcome, {user?.name || 'Professional'}
                </div>
            </div>

            <div className="grid gap-6">
                <h2 className="text-xl font-semibold">Incoming Service Requests</h2>
                {requests.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        No active requests found.
                    </Card>
                ) : (
                    requests.map((req) => (
                        <Card key={req.id} className="border-l-4 border-l-secondary-500 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{req.serviceType} Report</span>
                                            <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold 
                        ${req.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                    req.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                                        req.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600 gap-4 text-sm">
                                            <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {req.customerName}</span>
                                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {req.date}</span>
                                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {req.slot}</span>
                                        </div>
                                        <p className="text-gray-700 bg-gray-50 p-2 rounded text-sm italic">
                                            "{req.description}"
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                                        {req.status === 'requested' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleStatusUpdate(req.id, 'accepted')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {req.status === 'accepted' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(req.id, 'completed')}
                                            >
                                                Mark Completed
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
