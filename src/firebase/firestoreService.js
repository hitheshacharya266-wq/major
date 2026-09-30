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
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { db, storage } from './config';

/** Helper: Timeout wrapper to prevent async hanging */
const withTimeout = (promise, ms = 15000, errorMessage = 'Operation timed out') => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
    ]);
};

/** Upload provider profile image to Firebase Storage and return persistent download URL */
export const uploadProviderProfileImage = async (uid, file) => {
    if (!file || !uid) return null;
    
    // 1. Validate File Type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
        throw new Error('Please select a valid image file (JPG, PNG, or WEBP).');
    }
    
    // 2. Validate File Size (Max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5 MB.');
    }

    try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `providerProfiles/${uid}/profile_${Date.now()}.${fileExt}`);
        
        // Execute upload with 15s timeout protection
        const snapshot = await withTimeout(
            uploadBytes(storageRef, file),
            15000,
            'Profile photo upload timed out. Please check your network connection.'
        );
        
        // Retrieve download URL with 10s timeout protection
        const downloadURL = await withTimeout(
            getDownloadURL(snapshot.ref),
            10000,
            'Failed to generate image download URL.'
        );
        
        return downloadURL;
    } catch (err) {
        console.error('Firebase Storage upload error:', err);
        let msg = err.message || 'Image upload failed.';
        if (err.code === 'storage/unauthorized') {
            msg = 'Storage permission denied. Please check your Firebase Storage security rules.';
        } else if (err.code === 'storage/canceled') {
            msg = 'Image upload was canceled.';
        } else if (err.code === 'storage/quota-exceeded') {
            msg = 'Firebase Storage quota exceeded.';
        }
        throw new Error(msg);
    }
};

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

/** Helper to extract seconds from any timestamp variant */
const getTimestampSeconds = (ts) => {
    if (!ts) return 0;
    if (typeof ts.seconds === 'number') return ts.seconds;
    if (typeof ts.toDate === 'function') {
        try { return Math.floor(ts.toDate().getTime() / 1000); } catch { return 0; }
    }
    if (ts instanceof Date) return Math.floor(ts.getTime() / 1000);
    if (typeof ts === 'number') return Math.floor(ts / 1000);
    return 0;
};

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

/** Get all bookings for a specific user (one-time fetch) */
export const getBookingsByUser = async (userId) => {
    const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => getTimestampSeconds(b.timestamp) - getTimestampSeconds(a.timestamp));
};

/** Get all bookings for a specific provider (one-time fetch) */
export const getBookingsByProvider = async (providerId) => {
    const q = query(
        collection(db, 'bookings'),
        where('providerId', '==', providerId)
    );
    const snap = await getDocs(q);
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => getTimestampSeconds(b.timestamp) - getTimestampSeconds(a.timestamp));
};

/** Subscribe to realtime bookings for a specific user */
export const subscribeToUserBookings = (userId, callback, onError) => {
    if (!userId) return () => {};
    const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const bookings = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => getTimestampSeconds(b.timestamp) - getTimestampSeconds(a.timestamp));
            callback(bookings);
        },
        (error) => {
            console.error('Error listening to user bookings:', error);
            if (onError) onError(error);
        }
    );
};

/** Subscribe to realtime bookings for a specific provider */
export const subscribeToProviderBookings = (providerId, callback, onError) => {
    if (!providerId) return () => {};
    const q = query(
        collection(db, 'bookings'),
        where('providerId', '==', providerId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const bookings = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => getTimestampSeconds(b.timestamp) - getTimestampSeconds(a.timestamp));
            callback(bookings);
        },
        (error) => {
            console.error('Error listening to provider bookings:', error);
            if (onError) onError(error);
        }
    );
};

/** Update booking status (pending → accepted → completed) */
export const updateBookingStatus = async (bookingId, status) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status });
};

/** Rate a completed booking */
export const rateBooking = async (bookingId, rating) => {
    await updateDoc(doc(db, 'bookings', bookingId), { rating });
};

// ─── Notifications ────────────────────────────────────────

/** Create a new notification document in Firestore */
export const createNotification = async (notificationData) => {
    try {
        const docRef = await addDoc(collection(db, 'notifications'), {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (err) {
        console.error('Failed to create notification document:', err);
        return null;
    }
};

/** Subscribe to realtime notifications for a user or provider */
export const subscribeToUserNotifications = (userId, callback, onError) => {
    if (!userId) return () => {};
    const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const notifications = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt));
            callback(notifications);
        },
        (error) => {
            console.error('Error listening to notifications:', error);
            if (onError) onError(error);
        }
    );
};

/** Mark a single notification document as read */
export const markNotificationAsRead = async (notificationId) => {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
        console.error('Failed to mark notification as read:', err);
    }
};

/** Mark all notifications as read for a recipient */
export const markAllNotificationsAsRead = async (userId, notificationList = []) => {
    try {
        const unreadDocs = notificationList.filter(n => !n.read && n.recipientId === userId);
        await Promise.all(unreadDocs.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (err) {
        console.error('Failed to mark all notifications as read:', err);
    }
};

/** Save/Update Provider Profile (System-derived rating & completed jobs remain protected) */
export const saveProviderProfile = async (uid, profileData) => {
    const normCat = String(profileData.category || 'electrician').trim().toLowerCase();
    const cleanSkills = Array.isArray(profileData.skills)
        ? profileData.skills
        : String(profileData.skills || '').split(',').map(s => s.trim()).filter(Boolean);

    const providerDoc = {
        uid,
        name: profileData.name || profileData.fullName || 'Service Provider',
        fullName: profileData.name || profileData.fullName || 'Service Provider',
        gender: profileData.gender || 'male',
        category: normCat,
        description: profileData.description || '',
        experienceYears: String(profileData.experienceYears || '3'),
        price: (profileData.price !== undefined && profileData.price !== null && profileData.price !== '') ? Number(profileData.price) : null,
        location: profileData.location || 'Mangaluru',
        skills: cleanSkills.length > 0 ? cleanSkills : ['General Repair'],
        phone: profileData.phone || '',
        photoURL: profileData.photoURL || profileData.image || '',
        image: profileData.photoURL || profileData.image || '',
        available: profileData.available !== false,
        verified: profileData.verified !== undefined ? profileData.verified : true,
        updatedAt: serverTimestamp()
    };

    // Update serviceProviders/{uid} document with merge: true
    await setDoc(doc(db, 'serviceProviders', uid), providerDoc, { merge: true });

    // Update users/{uid} profile document
    await updateDoc(doc(db, 'users', uid), {
        fullName: providerDoc.name,
        gender: providerDoc.gender,
        category: providerDoc.category,
        description: providerDoc.description,
        updatedAt: serverTimestamp()
    }).catch(() => {});

    return providerDoc;
};

/** Create a real Customer Review for a completed booking */
export const createReview = async ({ bookingId, providerId, customerId, customerName, rating, comment }) => {
    // 0. Strict validation: Verify booking exists, is completed, belongs to customer, and has not been reviewed
    if (bookingId) {
        const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
        if (bookingSnap.exists()) {
            const bData = bookingSnap.data();
            if (bData.reviewed) {
                throw new Error('This booking has already been reviewed.');
            }
            if (bData.status !== 'completed') {
                throw new Error('Only completed bookings can be reviewed.');
            }
            if (customerId && bData.userId && bData.userId !== customerId) {
                throw new Error('You can only review your own bookings.');
            }
        }
    }

    // 1. Add review to 'reviews' collection
    const reviewRef = await addDoc(collection(db, 'reviews'), {
        bookingId: bookingId || '',
        providerId: providerId || '',
        customerId: customerId || '',
        customerName: customerName || 'Verified Customer',
        rating: Number(rating) || 5,
        comment: comment || '',
        createdAt: serverTimestamp()
    });

    // 2. Mark booking as reviewed
    if (bookingId) {
        await updateDoc(doc(db, 'bookings', bookingId), {
            reviewed: true,
            rating: Number(rating) || 5,
            reviewComment: comment || ''
        }).catch(() => {});
    }

    // 3. Recalculate provider rating average from all reviews
    if (providerId) {
        const q = query(collection(db, 'reviews'), where('providerId', '==', providerId));
        const snap = await getDocs(q);
        const reviewDocs = snap.docs.map(d => d.data());
        
        if (reviewDocs.length > 0) {
            const totalScore = reviewDocs.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
            const avgRating = Math.round((totalScore / reviewDocs.length) * 10) / 10;
            
            await updateDoc(doc(db, 'serviceProviders', providerId), {
                rating: avgRating,
                ratingCount: reviewDocs.length
            }).catch(() => {});
        }
    }

    return reviewRef.id;
};

/** Fetch real reviews for a specific provider */
export const getProviderReviews = async (providerId) => {
    if (!providerId) return [];
    try {
        const q = query(
            collection(db, 'reviews'),
            where('providerId', '==', providerId)
        );
        const snap = await getDocs(q);
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt));
    } catch (err) {
        console.error('Error fetching provider reviews:', err);
        return [];
    }
};

/**
 * Calculate real completed jobs & average rating for a provider.
 * Keeps 'bookings' private by only querying it when explicitly requested by authenticated callers.
 * Reviews query remains public and isolated.
 */
export const getProviderStats = async (providerId, includeBookings = false) => {
    if (!providerId) return { completedJobsCount: 0, rating: null, ratingCount: 0 };

    let completedJobsCount = 0;
    let rating = null;
    let ratingCount = 0;

    // 1. Fetch completed bookings count ONLY if includeBookings is explicitly true.
    // Public visitors must NEVER query the protected 'bookings' collection.
    if (includeBookings) {
        try {
            const qBookings = query(
                collection(db, 'bookings'),
                where('providerId', '==', providerId),
                where('status', '==', 'completed')
            );
            const snapBookings = await getDocs(qBookings);
            completedJobsCount = snapBookings.docs.length;
        } catch (err) {
            // Bookings are protected by security rules; quietly handle without breaking provider stats
            console.warn('Bookings access restricted or unavailable for provider stats:', err?.message || err);
        }
    }

    // 2. Fetch rating and count from public reviews collection
    try {
        const qReviews = query(
            collection(db, 'reviews'),
            where('providerId', '==', providerId)
        );
        const snapReviews = await getDocs(qReviews);
        const reviews = snapReviews.docs.map(d => d.data());
        ratingCount = reviews.length;

        if (ratingCount > 0) {
            const totalScore = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
            rating = Math.round((totalScore / ratingCount) * 10) / 10;
        }
    } catch (err) {
        console.warn('Reviews access restricted or unavailable for provider stats:', err?.message || err);
    }

    return { completedJobsCount, rating, ratingCount };
};



