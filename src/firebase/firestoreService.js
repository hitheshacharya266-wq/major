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
    onSnapshot,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import {
    ref,
    deleteObject
} from 'firebase/storage';
import { db, storage, auth } from './config';

import {
    uploadPortfolioImageToCloudinary,
    uploadProfilePhotoToCloudinary
} from '../services/cloudinaryService';

/** Upload provider profile image to Cloudinary and return persistent secure URL and metadata */
export const uploadProviderProfileImage = async (uid, file, onProgress) => {
    if (!file || !uid) throw new Error('File and Provider ID are required.');
    const result = await uploadProfilePhotoToCloudinary(file, uid, onProgress);
    return result;
};

/**
 * Update provider's profile photo in Firestore and companion user document.
 * Sets both `photoURL` and `image` to maintain complete consistency across all queries.
 * Passing an empty string or null removes the photo and restores the default character avatar.
 */
export const updateProviderProfilePhoto = async (uid, photoURL) => {
    if (!uid) throw new Error('Provider UID is required');
    const cleanUrl = photoURL ? String(photoURL).trim() : '';

    // 1. Update serviceProviders/{uid}
    const providerRef = doc(db, 'serviceProviders', uid);
    await setDoc(providerRef, {
        photoURL: cleanUrl,
        image: cleanUrl,
        updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Also update users/{uid} profile document for identity consistency
    await updateDoc(doc(db, 'users', uid), {
        photoURL: cleanUrl,
        updatedAt: serverTimestamp()
    }).catch(() => {});

    return cleanUrl;
};

/** Upload provider portfolio work image to Cloudinary and return persistent secure URL and metadata */
export const uploadProviderPortfolioImage = async (uid, file, onProgress) => {
    if (!file || !uid) throw new Error('File and Provider ID are required.');
    return await uploadPortfolioImageToCloudinary(file, uid, onProgress);
};

/**
 * Best-effort deletion for legacy Firebase Storage paths.
 * Note: Unsigned Cloudinary uploads cannot be deleted from the client without an API secret.
 * Removing the image item from Firestore removes it from the provider's active portfolio immediately.
 */
export const deleteStorageFile = async (storagePath) => {
    if (!storagePath || storagePath.startsWith('http') || !storagePath.includes('/')) return;
    try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
    } catch (err) {
        console.warn('Storage delete warning (safe to ignore if file already removed):', err);
    }
};

/** Update the portfolio array for a specific provider in Firestore */
export const updateProviderPortfolio = async (uid, portfolioItems) => {
    if (!uid) throw new Error('Provider UID is required');
    const providerRef = doc(db, 'serviceProviders', uid);
    await setDoc(providerRef, {
        portfolio: portfolioItems,
        updatedAt: serverTimestamp()
    }, { merge: true });
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

/**
 * Create a new notification document.
 * - Ordinary users dispatch strictly through the authenticated /api/admin backend.
 * - Direct Firestore creation is strictly restricted to verified administrators.
 * - Never retries automatically after server error to prevent duplicate notifications.
 * - Returns { success: boolean, notificationId?: string, id?: string, error?: string }.
 */
export const createNotification = async (notificationData) => {
    if (!auth?.currentUser) {
        return { success: false, error: 'User must be authenticated to send notifications.' };
    }

    try {
        const tokenResult = await auth.currentUser.getIdTokenResult();
        const isAdmin = Boolean(tokenResult?.claims?.admin === true);

        // 1. Ordinary users route strictly through trusted backend endpoint
        if (!isAdmin) {
            try {
                const token = tokenResult.token;
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action: 'send-notification',
                        payload: notificationData
                    })
                });

                const data = await res.json().catch(() => ({}));
                if (res.ok && data.success && data.notificationId) {
                    return { success: true, notificationId: data.notificationId, id: data.notificationId };
                }

                const errorMsg = data.error || `Server notification dispatch failed with HTTP ${res.status}`;
                console.warn('[createNotification] Backend dispatch rejected:', errorMsg);
                // DO NOT fall back to direct Firestore write for ordinary users
                return { success: false, error: errorMsg };
            } catch (networkErr) {
                console.error('[createNotification] Network error dispatching notification:', networkErr);
                // DO NOT retry or fall back to direct Firestore write
                return { success: false, error: networkErr.message || 'Network error dispatching notification.' };
            }
        }

        // 2. Verified Admins: can use backend or direct Firestore creation
        try {
            const token = tokenResult.token;
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'send-notification',
                    payload: notificationData
                })
            });

            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.success && data.notificationId) {
                    return { success: true, notificationId: data.notificationId, id: data.notificationId };
                }
            }
        } catch {
            // Backend unreachable; verified admin can fall back to direct authorized write
        }

        // Direct Firestore creation (strictly restricted to verified admins)
        const docRef = await addDoc(collection(db, 'notifications'), {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        });
        return { success: true, notificationId: docRef.id, id: docRef.id };
    } catch (err) {
        console.error('[createNotification] Failed to create notification document:', err);
        return { success: false, error: err.message || 'Notification creation failed.' };
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

/** Save/Update Provider Profile (System-derived rating, completed jobs & admin verification remain protected) */
export const saveProviderProfile = async (uid, profileData) => {
    const providerRef = doc(db, 'serviceProviders', uid);
    const existingSnap = await getDoc(providerRef);
    const isNew = !existingSnap.exists();
    const existingData = isNew ? {} : (existingSnap.data() || {});

    const normCat = String(profileData.category || existingData.category || 'electrician').trim().toLowerCase();
    const cleanSkills = Array.isArray(profileData.skills)
        ? profileData.skills
        : String(profileData.skills || existingData.skills || '').split(',').map(s => s.trim()).filter(Boolean);

    // Profile fields that provider is authorized to edit
    const editableProfileData = {
        uid,
        name: profileData.name || profileData.fullName || existingData.name || existingData.fullName || 'Service Provider',
        fullName: profileData.name || profileData.fullName || existingData.fullName || existingData.name || 'Service Provider',
        gender: profileData.gender || existingData.gender || 'male',
        category: normCat,
        description: profileData.description !== undefined ? profileData.description : (existingData.description || ''),
        experienceYears: String(profileData.experienceYears || existingData.experienceYears || '3'),
        price: (profileData.price !== undefined && profileData.price !== null && profileData.price !== '')
            ? Number(profileData.price)
            : (existingData.price !== undefined ? existingData.price : null),
        location: profileData.location || existingData.location || 'Mangaluru',
        skills: cleanSkills.length > 0 ? cleanSkills : ['General Repair'],
        phone: profileData.phone !== undefined ? profileData.phone : (existingData.phone || ''),
        photoURL: profileData.photoURL || profileData.image || existingData.photoURL || existingData.image || '',
        image: profileData.photoURL || profileData.image || existingData.image || existingData.photoURL || '',
        available: profileData.available !== undefined ? profileData.available !== false : (existingData.available !== false),
        ...(Array.isArray(profileData.portfolio) ? { portfolio: profileData.portfolio } : (Array.isArray(existingData.portfolio) ? { portfolio: existingData.portfolio } : {})),
        updatedAt: serverTimestamp()
    };

    if (isNew) {
        // Document creation: Initialize verification and account state strictly according to security rules
        const newDoc = {
            ...editableProfileData,
            verified: false,
            verificationStatus: 'pending',
            status: 'active',
            rating: null,
            ratingCount: 0,
            createdAt: serverTimestamp()
        };
        await setDoc(providerRef, newDoc);
    } else {
        // Document update: Never include verification or admin-protected fields in the update payload.
        // This ensures request.resource.data.diff(resource.data).affectedKeys() does NOT contain protected keys,
        // preventing permission-denied errors and preserving existing verification status intact.
        await setDoc(providerRef, editableProfileData, { merge: true });
    }

    // Update users/{uid} companion profile document with explicit error handling
    let userSynced = true;
    let userSyncError = null;

    try {
        await setDoc(doc(db, 'users', uid), {
            fullName: editableProfileData.name,
            gender: editableProfileData.gender,
            category: editableProfileData.category,
            description: editableProfileData.description,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (userErr) {
        userSynced = false;
        userSyncError = userErr.message || 'Failed to update companion user profile';
        console.warn(`[saveProviderProfile] Companion user profile sync failed for provider '${uid}':`, userErr);
    }

    // Return full representation with preserved verification state and accurate sync status
    return {
        ...existingData,
        ...editableProfileData,
        verified: isNew ? false : (existingData.verified ?? false),
        verificationStatus: isNew ? 'pending' : (existingData.verificationStatus || 'pending'),
        userSynced,
        ...(userSyncError ? { userSyncError } : {})
    };
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
    } catch {
        // Reviews access restricted or unavailable for provider stats
    }

    return { completedJobsCount, rating, ratingCount };
};

// ─── Administrative Audit Logs ────────────────────────────

/**
 * Create an immutable audit log entry in adminAuditLogs collection.
 */
export const createAuditLog = async ({
    adminUid,
    adminEmail,
    action,
    targetType,
    targetId,
    details = {},
    reason = ''
}) => {
    try {
        const logDoc = {
            adminUid: adminUid || 'unknown_admin',
            adminEmail: adminEmail || 'admin@servicehub.in',
            action,
            targetType,
            targetId: String(targetId || ''),
            details: details || {},
            reason: reason || '',
            timestamp: serverTimestamp()
        };
        const ref = await addDoc(collection(db, 'adminAuditLogs'), logDoc);
        return ref.id;
    } catch (err) {
        console.error('Failed to create admin audit log:', err);
        return null;
    }
};

/**
 * Fetch all administrative audit logs, sorted newest first.
 */
export const getAuditLogs = async (limitCount = 100) => {
    try {
        const snap = await getDocs(collection(db, 'adminAuditLogs'));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => getTimestampSeconds(b.timestamp) - getTimestampSeconds(a.timestamp))
            .slice(0, limitCount);
    } catch (err) {
        console.error('Error fetching admin audit logs:', err);
        return [];
    }
};

// ─── Provider Lifecycle & Moderation ───────────────────────

/**
 * Update provider account lifecycle status:
 * 'active' | 'suspended' | 'deactivated' | 'pending'
 */
export const updateProviderAccountStatus = async (providerId, newStatus, reason = '', adminInfo = {}) => {
    if (!providerId || !newStatus) throw new Error('Provider ID and status are required');

    const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
    };

    if (newStatus === 'suspended') {
        updateData.suspensionReason = reason || 'Violation of service terms';
        updateData.suspensionDate = serverTimestamp();
        updateData.available = false; // automatically set unavailable when suspended
    } else if (newStatus === 'active') {
        updateData.suspensionReason = null;
        updateData.suspensionDate = null;
        updateData.deactivatedReason = null;
        updateData.deactivatedDate = null;
        updateData.available = true;
    } else if (newStatus === 'deactivated') {
        updateData.deactivatedReason = reason || 'Account deactivated by administrator';
        updateData.deactivatedDate = serverTimestamp();
        updateData.available = false;
    }

    // 1. Atomic Firestore batch update for serviceProviders and companion users document
    const batch = writeBatch(db);
    batch.update(doc(db, 'serviceProviders', providerId), updateData);
    batch.update(doc(db, 'users', providerId), {
        providerStatus: newStatus,
        status: newStatus,
        updatedAt: serverTimestamp()
    });
    await batch.commit();

    // 2. Create Audit Log only after successful batch commit
    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: `PROVIDER_${newStatus.toUpperCase()}`,
        targetType: 'provider',
        targetId: providerId,
        details: { previousStatus: adminInfo.previousStatus, newStatus },
        reason
    });

    // 4. Send system notification to provider
    try {
        let title = 'Account Status Update 🛡️';
        let message = `Your provider account status has been changed to ${newStatus}.`;
        if (newStatus === 'suspended') {
            title = 'Account Suspended ⚠️';
            message = `Your service provider account has been suspended. Reason: ${reason || 'Terms violation'}. Please contact support for assistance.`;
        } else if (newStatus === 'active') {
            title = 'Account Reactivated! 🎉';
            message = 'Your service partner account is now fully active. You can receive new customer bookings.';
        }
        await createNotification({
            recipientId: providerId,
            type: 'account_status',
            title,
            message,
            providerId
        });
    } catch (notifErr) {
        console.warn('Could not dispatch status notification to provider:', notifErr);
    }
};

/**
 * Approve provider verification
 */
export const verifyProviderAccount = async (providerId, adminInfo = {}) => {
    if (!providerId) throw new Error('Provider ID is required');

    const updateData = {
        verified: true,
        verificationStatus: 'verified',
        rejectionReason: null,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'serviceProviders', providerId), updateData);

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: 'PROVIDER_VERIFIED',
        targetType: 'provider',
        targetId: providerId,
        details: { verificationStatus: 'verified' },
        reason: 'Verification criteria reviewed and approved by administrator'
    });

    try {
        await createNotification({
            recipientId: providerId,
            type: 'verification_approved',
            title: 'Partner Verification Approved! 🏅',
            message: 'Congratulations! Your profile has been verified by the ServiceHub administration. The verified badge is now visible to customers.',
            providerId
        });
    } catch {
        // Non-blocking
    }
};

/**
 * Reject provider verification with a mandatory reason
 */
export const rejectProviderVerification = async (providerId, rejectionReason, adminInfo = {}) => {
    if (!providerId) throw new Error('Provider ID is required');
    if (!rejectionReason || !rejectionReason.trim()) {
        throw new Error('A rejection reason must be provided');
    }

    const updateData = {
        verified: false,
        verificationStatus: 'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'serviceProviders', providerId), updateData);

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: 'PROVIDER_VERIFICATION_REJECTED',
        targetType: 'provider',
        targetId: providerId,
        details: { verificationStatus: 'rejected' },
        reason: rejectionReason.trim()
    });

    try {
        await createNotification({
            recipientId: providerId,
            type: 'verification_rejected',
            title: 'Verification Requires Changes 📝',
            message: `Your verification request was rejected. Reason: ${rejectionReason}. Please update your profile with proper details and re-submit.`,
            providerId
        });
    } catch {
        // Non-blocking
    }
};

// ─── Customer Moderation ───────────────────────────────────

/**
 * Restrict or reactivate customer account
 */
export const restrictCustomerAccount = async (customerId, status, reason = '', adminInfo = {}) => {
    if (!customerId || !status) throw new Error('Customer ID and status are required');

    await updateDoc(doc(db, 'users', customerId), {
        status,
        restrictionReason: status === 'restricted' ? reason : null,
        updatedAt: serverTimestamp()
    });

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: `CUSTOMER_${status.toUpperCase()}`,
        targetType: 'customer',
        targetId: customerId,
        details: { status },
        reason
    });
};

// ─── Bookings Admin ────────────────────────────────────────

/**
 * Fetch all platform bookings for admin oversight
 */
export const getAllBookingsAdmin = async () => {
    try {
        const snap = await getDocs(collection(db, 'bookings'));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => getTimestampSeconds(b.timestamp) - getTimestampSeconds(a.timestamp));
    } catch (err) {
        console.error('Error fetching admin bookings:', err);
        return [];
    }
};

/**
 * Flag a booking for administrative investigation
 */
export const flagBookingForReview = async (bookingId, flagReason, adminInfo = {}) => {
    if (!bookingId) throw new Error('Booking ID is required');

    await updateDoc(doc(db, 'bookings', bookingId), {
        flagged: true,
        flagReason: flagReason || 'Flagged for moderation check',
        flaggedAt: serverTimestamp(),
        flaggedBy: adminInfo.uid || 'admin'
    });

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: 'BOOKING_FLAGGED',
        targetType: 'booking',
        targetId: bookingId,
        reason: flagReason || 'Flagged for review'
    });
};

// ─── Complaints and Reports ────────────────────────────────

/**
 * Create a new complaint / report from a customer or provider
 */
export const createReport = async ({
    type = 'provider', // 'provider' | 'booking' | 'review' | 'general'
    reporterId,
    reporterName,
    reporterEmail,
    targetId,
    targetName = '',
    description,
    bookingId = ''
}) => {
    if (!reporterId || !description?.trim()) {
        throw new Error('Reporter ID and complaint description are required.');
    }

    const reportDoc = {
        type,
        reporterId,
        reporterName: reporterName || 'User',
        reporterEmail: reporterEmail || '',
        targetId: String(targetId || ''),
        targetName: String(targetName || ''),
        bookingId: String(bookingId || ''),
        description: description.trim(),
        status: 'open', // 'open' | 'under_review' | 'resolved' | 'dismissed'
        resolutionNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, 'reports'), reportDoc);
        return docRef.id;
    } catch (clientErr) {
        // If client write is blocked (e.g. missing deployed Firestore rule), fall back to authenticated server endpoint
        if ((clientErr.code === 'permission-denied' || clientErr.message?.includes('permission')) && auth?.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action: 'submit-report',
                        payload: {
                            type,
                            reporterId,
                            reporterName,
                            reporterEmail,
                            targetId,
                            targetName,
                            bookingId,
                            description: description.trim()
                        }
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.reportId) {
                        return data.reportId;
                    }
                }
            } catch (fallbackErr) {
                console.error('[createReport] Fallback submission error:', fallbackErr);
            }
        }
        throw clientErr;
    }
};

/**
 * Fetch all complaints and reports
 */
export const getAllReports = async () => {
    try {
        const snap = await getDocs(collection(db, 'reports'));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt));
    } catch (err) {
        console.error('Error fetching reports:', err);
        return [];
    }
};

/**
 * Update report status (e.g. resolve or dismiss)
 */
export const updateReportStatus = async (reportId, status, resolutionNotes = '', adminInfo = {}) => {
    if (!reportId || !status) throw new Error('Report ID and status are required');

    await updateDoc(doc(db, 'reports', reportId), {
        status,
        resolutionNotes: resolutionNotes || '',
        resolvedBy: adminInfo.uid || 'admin',
        updatedAt: serverTimestamp()
    });

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: `REPORT_${status.toUpperCase()}`,
        targetType: 'report',
        targetId: reportId,
        details: { status },
        reason: resolutionNotes || `Report marked as ${status}`
    });
};

// ─── Reviews Moderation ───────────────────────────────────

/**
 * Fetch all reviews across the platform for admin inspection
 */
export const getAllReviewsAdmin = async () => {
    try {
        const snap = await getDocs(collection(db, 'reviews'));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt));
    } catch (err) {
        console.error('Error fetching admin reviews:', err);
        return [];
    }
};

/**
 * Moderate or remove an inappropriate review
 */
export const moderateReview = async (reviewId, providerId, action, reason = '', adminInfo = {}) => {
    if (!reviewId) throw new Error('Review ID is required');

    if (action === 'remove') {
        // Mark as moderated/hidden rather than permanently destroying records
        await updateDoc(doc(db, 'reviews', reviewId), {
            moderated: true,
            moderationAction: 'removed',
            moderationReason: reason || 'Violated community guidelines',
            moderatedBy: adminInfo.uid || 'admin',
            moderatedAt: serverTimestamp()
        });

        // Recalculate provider rating excluding moderated reviews
        if (providerId) {
            const q = query(
                collection(db, 'reviews'),
                where('providerId', '==', providerId)
            );
            const snap = await getDocs(q);
            const validReviews = snap.docs
                .map(d => d.data())
                .filter(r => !r.moderated);

            if (validReviews.length > 0) {
                const totalScore = validReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
                const avgRating = Math.round((totalScore / validReviews.length) * 10) / 10;
                await updateDoc(doc(db, 'serviceProviders', providerId), {
                    rating: avgRating,
                    ratingCount: validReviews.length
                }).catch(() => {});
            } else {
                await updateDoc(doc(db, 'serviceProviders', providerId), {
                    rating: null,
                    ratingCount: 0
                }).catch(() => {});
            }
        }
    }

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: `REVIEW_${action.toUpperCase()}`,
        targetType: 'review',
        targetId: reviewId,
        details: { providerId, action },
        reason
    });
};

// ─── Platform Settings ─────────────────────────────────────

/**
 * Fetch platform settings from Firestore
 */
export const getPlatformSettings = async () => {
    try {
        const snap = await getDoc(doc(db, 'platformSettings', 'general'));
        if (snap.exists()) {
            return snap.data();
        }
        return {
            supportedCities: ['Mangaluru', 'Hassan', 'Udupi'],
            announcement: '',
            maintenanceMode: false
        };
    } catch (err) {
        console.error('Error fetching platform settings:', err);
        return {
            supportedCities: ['Mangaluru', 'Hassan', 'Udupi'],
            announcement: '',
            maintenanceMode: false
        };
    }
};

/**
 * Update platform settings
 */
export const updatePlatformSettings = async (settingsData, adminInfo = {}) => {
    await setDoc(doc(db, 'platformSettings', 'general'), {
        ...settingsData,
        updatedAt: serverTimestamp(),
        updatedBy: adminInfo.uid || 'admin'
    }, { merge: true });

    await createAuditLog({
        adminUid: adminInfo.uid,
        adminEmail: adminInfo.email,
        action: 'PLATFORM_SETTINGS_UPDATED',
        targetType: 'system',
        targetId: 'general',
        details: settingsData,
        reason: 'Updated platform configuration'
    });
};

// ─── Live Aggregate Stats ─────────────────────────────────

/**
 * Aggregate real platform stats for the Admin Overview tab
 */
export const getAdminOverviewStats = async () => {
    try {
        const [usersSnap, providersSnap, bookingsSnap, reportsSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'serviceProviders')),
            getDocs(collection(db, 'bookings')),
            getDocs(collection(db, 'reports')).catch(() => ({ docs: [] }))
        ]);

        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const providers = providersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const reports = reportsSnap.docs ? reportsSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];

        // Provider breakdown
        const totalProviders = providers.length;
        const activeProviders = providers.filter(p => (p.status === 'active' || !p.status) && p.available !== false).length;
        const pendingVerifications = providers.filter(p => p.verified === false || p.verificationStatus === 'pending').length;
        const suspendedProviders = providers.filter(p => p.status === 'suspended').length;
        const deactivatedProviders = providers.filter(p => p.status === 'deactivated').length;

        // Customer breakdown
        const customers = users.filter(u => u.role !== 'provider' && u.role !== 'admin');
        const totalCustomers = customers.length;
        const restrictedCustomers = customers.filter(c => c.status === 'restricted').length;

        // Bookings breakdown
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const acceptedBookings = bookings.filter(b => b.status === 'accepted').length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length;

        // Reports breakdown
        const openReports = reports.filter(r => r.status === 'open' || r.status === 'under_review').length;
        const resolvedReports = reports.filter(r => r.status === 'resolved').length;

        return {
            totalProviders,
            activeProviders,
            pendingVerifications,
            suspendedProviders,
            deactivatedProviders,
            totalCustomers,
            restrictedCustomers,
            totalBookings,
            pendingBookings,
            acceptedBookings,
            completedBookings,
            cancelledBookings,
            openReports,
            resolvedReports
        };
    } catch (err) {
        console.error('Error aggregating admin stats:', err);
        throw err;
    }
};



