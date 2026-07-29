/**
 * Firestore Service
 * 
 * CRUD operations for users, serviceProviders, and bookings collections.
 */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// ─── User Profiles ────────────────────────────────────────

/** Get a single user profile by UID */
export const getUserProfile = async (uid) => {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/** Get all users (admin use) */
export const getAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Service Providers ────────────────────────────────────

/** Get providers filtered by category */
export const getProvidersByCategory = async (category) => {
    const q = query(
        collection(db, 'serviceProviders'),
        where('category', '==', category)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Get all service providers */
export const getAllProviders = async () => {
    const snap = await getDocs(collection(db, 'serviceProviders'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Get a single provider by UID */
export const getProviderProfile = async (uid) => {
    const snap = await getDoc(doc(db, 'serviceProviders', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/** Toggle provider availability */
export const updateProviderAvailability = async (uid, available) => {
    await updateDoc(doc(db, 'serviceProviders', uid), { available });
};

/** Update provider rating (recalculated average) */
export const updateProviderRating = async (providerId, newRating) => {
    const providerRef = doc(db, 'serviceProviders', providerId);
    const snap = await getDoc(providerRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const totalRatings = data.ratingCount || 0;
    const currentAvg = data.rating || 0;

    // Calculate new average
    const newCount = totalRatings + 1;
    const newAvg = ((currentAvg * totalRatings) + newRating) / newCount;

    await updateDoc(providerRef, {
        rating: Math.round(newAvg * 10) / 10, // round to 1 decimal
        ratingCount: newCount
    });
};

// ─── Bookings ─────────────────────────────────────────────

/** Create a new booking */
export const createBooking = async (bookingData) => {
    const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'pending',
        rating: null,
        timestamp: serverTimestamp()
    });
    return docRef.id;
};

/** Get all bookings for a specific user */
export const getBookingsByUser = async (userId) => {
    const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Get all bookings for a specific provider */
export const getBookingsByProvider = async (providerId) => {
    const q = query(
        collection(db, 'bookings'),
        where('providerId', '==', providerId),
        orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Update booking status (pending → accepted → completed) */
export const updateBookingStatus = async (bookingId, status) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status });
};

/** Rate a completed booking */
export const rateBooking = async (bookingId, rating) => {
    await updateDoc(doc(db, 'bookings', bookingId), { rating });
};
