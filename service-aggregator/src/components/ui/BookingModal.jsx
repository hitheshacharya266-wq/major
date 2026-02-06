import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function BookingModal({ provider, onClose, onSuccess }) {
    const { user } = useAuth();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please log in to book a service.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, "bookings"), {
                customerId: user.uid,
                customerName: user.name || user.email, // Fallback
                providerId: provider.id.toString(), // Mock IDs are numbers, real will be strings. Ensure consistency.
                providerName: provider.name,
                serviceType: provider.service,
                date: date,
                slot: time,
                description: description,
                status: 'requested',
                createdAt: serverTimestamp(),
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to book service. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Book {provider.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Date"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <Input
                            label="Time Slot"
                            type="time"
                            required
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            rows={3}
                            placeholder="Describe the issue (e.g., Leaking tap in kitchen)..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Confirm Booking
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
