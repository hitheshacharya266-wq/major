/**
 * Serverless Admin Backend Endpoint for ServiceHub
 *
 * Runs on Vercel Serverless Functions (/api/admin) and Vite dev middleware.
 * Verifies caller's Firebase Authentication ID token using the Firebase Admin SDK.
 *
 * Supported Actions:
 * - check-admin: Validates if caller has a verified { admin: true } custom claim
 * - set-provider-status: Updates status (active, suspended, deactivated) with reason & audit log
 * - set-provider-verification: Approves/rejects provider verification with audit log
 * - restrict-customer: Restricts/reactivates customer account with audit log
 * - submit-report: Submits a complaint/report for the authenticated user's own UID
 */

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Allowed CORS origins for frontend web application
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
];

if (process.env.FRONTEND_URL) {
    const customFrontend = process.env.FRONTEND_URL.trim();
    if (customFrontend && !ALLOWED_ORIGINS.includes(customFrontend)) {
        ALLOWED_ORIGINS.push(customFrontend);
    }
}
if (process.env.VERCEL_URL) {
    const vercelOrigin = `https://${process.env.VERCEL_URL.trim()}`;
    if (!ALLOWED_ORIGINS.includes(vercelOrigin)) {
        ALLOWED_ORIGINS.push(vercelOrigin);
    }
}
if (process.env.ADDITIONAL_ALLOWED_ORIGINS) {
    process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',').forEach(o => {
        const trimmed = o.trim();
        if (trimmed && !ALLOWED_ORIGINS.includes(trimmed)) {
            ALLOWED_ORIGINS.push(trimmed);
        }
    });
}

/**
 * Initialize Firebase Admin SDK safely using environment variables or service account file.
 */
function getAdminInstances() {
    if (getApps().length > 0) {
        const app = getApp();
        return { auth: getAuth(app), db: getFirestore(app) };
    }

    let credential = null;

    // 1. Production: Vercel environment variable with service account JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = cert(parsed);
        } catch (err) {
            console.error('[Admin Endpoint] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
        }
    }
    // 2. Standard Google application credentials file path
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        try {
            const raw = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
            credential = cert(JSON.parse(raw));
        } catch (err) {
            console.error('[Admin Endpoint] Failed to read GOOGLE_APPLICATION_CREDENTIALS:', err.message);
        }
    }
    // 3. Local development file (safely excluded via .gitignore)
    else {
        const localSaPath = path.resolve(process.cwd(), 'service-account.json');
        if (fs.existsSync(localSaPath)) {
            try {
                const raw = fs.readFileSync(localSaPath, 'utf8');
                credential = cert(JSON.parse(raw));
            } catch (err) {
                console.error('[Admin Endpoint] Failed to read local service-account.json:', err.message);
            }
        }
    }

    const app = credential ? initializeApp({ credential }) : initializeApp();
    return { auth: getAuth(app), db: getFirestore(app) };
}

export default async function handler(req, res) {
    // 1. Strict CORS Handling: Only allow explicitly approved origins
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // 2. Authorization Header Validation
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (!idToken) {
        return res.status(401).json({ error: 'Bearer token is empty.' });
    }

    let adminAuth;
    let adminDb;
    try {
        const instances = getAdminInstances();
        adminAuth = instances.auth;
        adminDb = instances.db;
    } catch (initErr) {
        console.error('[Admin Endpoint] Firebase Admin initialization failed:', initErr);
        return res.status(500).json({ error: 'Backend administration services are currently unavailable.' });
    }

    // 3. Server-side Cryptographic Token Verification
    let decodedToken;
    try {
        decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch (tokenErr) {
        console.error('[Admin Endpoint] Token verification failed:', tokenErr.message);
        if (tokenErr.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Authentication token has expired. Please refresh your session.' });
        }
        if (tokenErr.code === 'auth/id-token-revoked') {
            return res.status(401).json({ error: 'Authentication token has been revoked.' });
        }
        return res.status(401).json({ error: 'Invalid or unauthorized authentication token.' });
    }

    const callerUid = decodedToken.uid;
    const callerEmail = decodedToken.email || '';
    const hasAdminClaim = Boolean(decodedToken.admin === true);

    const { action, payload } = req.body || {};

    try {
        // Action: check-admin (returns verified claim status for the caller)
        if (action === 'check-admin') {
            return res.status(200).json({
                success: true,
                uid: callerUid,
                email: callerEmail,
                isAdmin: hasAdminClaim,
                message: hasAdminClaim
                    ? 'Verified Firebase Admin Claim present.'
                    : 'User token does not contain { admin: true } claim.'
            });
        }

        // Action: submit-report (allowed for any authenticated user for their own UID, or by admins)
        if (action === 'submit-report') {
            const {
                type = 'general',
                reporterId,
                reporterName,
                reporterEmail,
                targetId = '',
                targetName = '',
                bookingId = '',
                description
            } = payload || {};

            if (callerUid !== reporterId && !hasAdminClaim) {
                return res.status(403).json({ error: 'Forbidden: You can only submit reports for your own account.' });
            }

            if (!description || description.trim().length < 10) {
                return res.status(400).json({ error: 'Description must be at least 10 characters long.' });
            }

            const docRef = await adminDb.collection('reports').add({
                type,
                reporterId: callerUid,
                reporterName: reporterName || 'User',
                reporterEmail: reporterEmail || callerEmail,
                targetId: String(targetId || ''),
                targetName: String(targetName || ''),
                bookingId: String(bookingId || ''),
                description: description.trim(),
                status: 'open',
                resolutionNotes: '',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });

            return res.status(200).json({
                success: true,
                reportId: docRef.id,
                message: 'Report submitted successfully.'
            });
        }

        // Action: send-notification (server-verified notification creation)
        if (action === 'send-notification') {
            const {
                recipientId,
                title,
                message,
                type = 'general',
                bookingId = '',
                providerId = '',
                customerId = ''
            } = payload || {};

            if (!recipientId || typeof recipientId !== 'string') {
                return res.status(400).json({ error: 'recipientId is required and must be a valid string.' });
            }
            if (!title || !message) {
                return res.status(400).json({ error: 'title and message are required.' });
            }

            // Authorization check:
            // 1. Administrators can dispatch notifications to any account.
            // 2. Normal authenticated users CANNOT send arbitrary notifications.
            //    They can ONLY notify the counterparty of a legitimate existing booking they participate in.
            let authorized = false;

            if (hasAdminClaim) {
                authorized = true;
            } else if (bookingId) {
                try {
                    const bookingSnap = await adminDb.collection('bookings').doc(String(bookingId)).get();
                    if (bookingSnap.exists) {
                        const bData = bookingSnap.data();
                        const isCustomer = bData.userId === callerUid;
                        const isProvider = bData.providerId === callerUid;

                        if (isCustomer && recipientId === bData.providerId) {
                            authorized = true;
                        } else if (isProvider && recipientId === bData.userId) {
                            authorized = true;
                        }
                    }
                } catch (bErr) {
                    console.error('[Admin Endpoint] Error checking booking for notification:', bErr.message);
                }
            }

            if (!authorized) {
                return res.status(403).json({
                    error: 'Forbidden: You cannot send arbitrary notifications to other users. Notifications must be part of an authorized booking or administrative action.'
                });
            }

            const notifDoc = {
                recipientId: String(recipientId),
                title: String(title),
                message: String(message),
                type: String(type),
                read: false,
                createdAt: FieldValue.serverTimestamp()
            };

            if (bookingId) notifDoc.bookingId = String(bookingId);
            if (providerId) notifDoc.providerId = String(providerId);
            if (customerId) notifDoc.customerId = String(customerId);

            const docRef = await adminDb.collection('notifications').add(notifDoc);

            return res.status(200).json({
                success: true,
                notificationId: docRef.id,
                message: 'Notification dispatched successfully via trusted server mechanism.'
            });
        }

        // 4. Strict Admin Authorization Check for all remaining administrative actions
        if (!hasAdminClaim) {
            return res.status(403).json({
                error: 'Forbidden: Verified administrator custom claim (admin: true) required for this operation.'
            });
        }

        // Administrative Actions (Privileged)
        switch (action) {
            case 'set-provider-status': {
                const { providerId, status, reason = '' } = payload || {};
                if (!providerId || !status) {
                    return res.status(400).json({ error: 'providerId and status are required.' });
                }
                if (!['active', 'suspended', 'deactivated'].includes(status)) {
                    return res.status(400).json({ error: `Invalid status: ${status}. Must be active, suspended, or deactivated.` });
                }
                if (status === 'suspended' && !reason.trim()) {
                    return res.status(400).json({ error: 'A mandatory reason is required to suspend a provider.' });
                }

                const updateData = {
                    status,
                    updatedAt: FieldValue.serverTimestamp()
                };

                if (status === 'suspended') {
                    updateData.suspensionReason = reason.trim();
                    updateData.suspensionDate = FieldValue.serverTimestamp();
                    updateData.available = false;
                } else if (status === 'deactivated') {
                    updateData.deactivatedReason = reason.trim() || 'Account deactivated by administrator';
                    updateData.deactivatedDate = FieldValue.serverTimestamp();
                    updateData.available = false;
                } else if (status === 'active') {
                    updateData.suspensionReason = null;
                    updateData.suspensionDate = null;
                    updateData.deactivatedReason = null;
                    updateData.deactivatedDate = null;
                    updateData.available = true;
                }

                // 1. Atomic Firestore batch for serviceProviders and companion users document
                const providerRef = adminDb.collection('serviceProviders').doc(providerId);
                const userRef = adminDb.collection('users').doc(providerId);

                const [providerSnap, userSnap] = await Promise.all([
                    providerRef.get(),
                    userRef.get()
                ]);

                if (!providerSnap.exists) {
                    return res.status(404).json({ error: `Service provider document '${providerId}' not found.` });
                }

                const batch = adminDb.batch();
                batch.update(providerRef, updateData);

                if (userSnap.exists) {
                    batch.update(userRef, {
                        providerStatus: status,
                        status,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                } else {
                    batch.set(userRef, {
                        uid: providerId,
                        providerStatus: status,
                        status,
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                // Commit batch atomically. Failure throws and aborts before audit log creation
                await batch.commit();

                // 2. Write immutable audit log only after successful atomic commit
                await adminDb.collection('adminAuditLogs').add({
                    adminUid: callerUid,
                    adminEmail: callerEmail,
                    action: `PROVIDER_${status.toUpperCase()}`,
                    targetType: 'provider',
                    targetId: providerId,
                    details: { status, userSynced: true, atomicBatch: true },
                    reason: reason.trim() || `Provider status set to ${status}`,
                    timestamp: FieldValue.serverTimestamp()
                });

                // 4. Dispatch system status notification to provider
                try {
                    let notifTitle = 'Account Status Update';
                    let notifMessage = `Your account status was updated to ${status}.`;
                    if (status === 'suspended') {
                        notifTitle = 'Account Suspended ⚠️';
                        notifMessage = `Your service provider account has been suspended. Reason: ${reason.trim() || 'Terms violation'}. Please contact support for assistance.`;
                    } else if (status === 'active') {
                        notifTitle = 'Account Reactivated! 🎉';
                        notifMessage = 'Your service partner account is now fully active. You can receive new customer bookings.';
                    } else if (status === 'deactivated') {
                        notifTitle = 'Account Deactivated ℹ️';
                        notifMessage = `Your account has been deactivated. Reason: ${reason.trim() || 'Administrative action'}.`;
                    }

                    await adminDb.collection('notifications').add({
                        recipientId: providerId,
                        type: 'account_status',
                        title: notifTitle,
                        message: notifMessage,
                        providerId,
                        read: false,
                        createdAt: FieldValue.serverTimestamp()
                    });
                } catch (notifErr) {
                    console.error('[Admin Endpoint] Notification creation error:', notifErr.message);
                }

                return res.status(200).json({
                    success: true,
                    action: 'set-provider-status',
                    providerId,
                    status,
                    updatedBy: callerUid,
                    timestamp: new Date().toISOString()
                });
            }

            case 'set-provider-verification': {
                const { providerId, verified, verificationStatus, rejectionReason = '' } = payload || {};
                if (!providerId) {
                    return res.status(400).json({ error: 'providerId is required.' });
                }
                const vStatus = verificationStatus || (verified ? 'verified' : 'rejected');
                if (vStatus === 'rejected' && !rejectionReason.trim()) {
                    return res.status(400).json({ error: 'A rejection reason is required to reject verification.' });
                }

                const providerRef = adminDb.collection('serviceProviders').doc(providerId);
                const providerSnap = await providerRef.get();
                if (!providerSnap.exists) {
                    return res.status(404).json({ error: `Service provider document '${providerId}' not found.` });
                }

                const isVerified = vStatus === 'verified';
                await providerRef.update({
                    verified: isVerified,
                    verificationStatus: vStatus,
                    rejectionReason: isVerified ? null : rejectionReason.trim(),
                    updatedAt: FieldValue.serverTimestamp()
                });

                await adminDb.collection('adminAuditLogs').add({
                    adminUid: callerUid,
                    adminEmail: callerEmail,
                    action: `PROVIDER_VERIFICATION_${vStatus.toUpperCase()}`,
                    targetType: 'provider',
                    targetId: providerId,
                    details: { verificationStatus: vStatus, verified: isVerified },
                    reason: rejectionReason.trim() || `Verification status updated to ${vStatus}`,
                    timestamp: FieldValue.serverTimestamp()
                });

                // Dispatch system verification notification
                try {
                    const notifTitle = isVerified ? 'Partner Verification Approved! 🏅' : 'Verification Requires Changes 📝';
                    const notifMessage = isVerified
                        ? 'Congratulations! Your profile has been verified by the ServiceHub administration. The verified badge is now visible to customers.'
                        : `Your verification request was rejected. Reason: ${rejectionReason.trim() || 'Requirements not met'}. Please update your profile with proper details and re-submit.`;

                    await adminDb.collection('notifications').add({
                        recipientId: providerId,
                        type: isVerified ? 'verification_approved' : 'verification_rejected',
                        title: notifTitle,
                        message: notifMessage,
                        providerId,
                        read: false,
                        createdAt: FieldValue.serverTimestamp()
                    });
                } catch (notifErr) {
                    console.error('[Admin Endpoint] Verification notification error:', notifErr.message);
                }

                return res.status(200).json({
                    success: true,
                    action: 'set-provider-verification',
                    providerId,
                    verified: isVerified,
                    verificationStatus: vStatus,
                    updatedBy: callerUid,
                    timestamp: new Date().toISOString()
                });
            }

            case 'restrict-customer': {
                const { customerId, status, reason = '' } = payload || {};
                if (!customerId || !status) {
                    return res.status(400).json({ error: 'customerId and status are required.' });
                }
                if (!['active', 'restricted'].includes(status)) {
                    return res.status(400).json({ error: `Invalid status: ${status}. Must be active or restricted.` });
                }

                const userRef = adminDb.collection('users').doc(customerId);
                const userSnap = await userRef.get();
                if (!userSnap.exists) {
                    return res.status(404).json({ error: `Customer document '${customerId}' not found.` });
                }

                await userRef.update({
                    status,
                    restrictionReason: status === 'restricted' ? reason.trim() : null,
                    updatedAt: FieldValue.serverTimestamp()
                });

                await adminDb.collection('adminAuditLogs').add({
                    adminUid: callerUid,
                    adminEmail: callerEmail,
                    action: `CUSTOMER_${status.toUpperCase()}`,
                    targetType: 'customer',
                    targetId: customerId,
                    details: { status },
                    reason: reason.trim() || `Customer status updated to ${status}`,
                    timestamp: FieldValue.serverTimestamp()
                });

                // Dispatch system notification to customer
                try {
                    const notifTitle = status === 'restricted' ? 'Account Restricted ⚠️' : 'Account Reactivated! 🎉';
                    const notifMessage = status === 'restricted'
                        ? `Your ServiceHub account has been restricted. Reason: ${reason.trim() || 'Terms violation'}. Please contact support for assistance.`
                        : 'Your ServiceHub account restriction has been lifted. You can now use all customer features.';

                    await adminDb.collection('notifications').add({
                        recipientId: customerId,
                        type: 'account_status',
                        title: notifTitle,
                        message: notifMessage,
                        customerId,
                        read: false,
                        createdAt: FieldValue.serverTimestamp()
                    });
                } catch (notifErr) {
                    console.error('[Admin Endpoint] Customer restriction notification error:', notifErr.message);
                }

                return res.status(200).json({
                    success: true,
                    action: 'restrict-customer',
                    customerId,
                    status,
                    updatedBy: callerUid,
                    timestamp: new Date().toISOString()
                });
            }

            default:
                return res.status(400).json({ error: `Unknown or unsupported administrative action: ${action}` });
        }
    } catch (err) {
        console.error('[Admin Endpoint Execution Error]:', err);
        return res.status(500).json({ error: err.message || 'Internal admin server error.' });
    }
}
