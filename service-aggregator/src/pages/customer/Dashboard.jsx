import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                // Query bookings where customerId == user.uid
                // Note: Requires Firestore index for composite queries if sorting by date
                const q = query(
                    collection(db, "bookings"),
                    where("customerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBookings(data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    if (loading) {
        return <div className="text-center py-10">Loading bookings...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>

            {bookings.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    No bookings found. Book a service today!
                </Card>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-l-primary-500">
                            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-lg">{booking.serviceType} with {booking.providerName}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 text-sm mt-1 gap-2 sm:gap-4">
                                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {booking.date}</span>
                                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {booking.slot}</span>
                                    </div>
                                    <p className="text-gray-600 mt-2 text-sm max-w-xl">{booking.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide 
                    ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
