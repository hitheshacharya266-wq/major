/**
 * ServiceHub Admin Setup Script
 *
 * Uses Firebase Admin SDK to set the `admin: true` custom claim on a user account.
 * This assigns trusted server-level administrator claims to the target user's Firebase Auth token.
 *
 * Usage:
 *   node scripts/set-admin-claim.js <USER_UID_OR_EMAIL>
 *
 * Environment variables (optional):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   OR
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApp();
    }

    // Check for service account file in standard locations
    const serviceAccountPaths = [
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        path.resolve(process.cwd(), 'service-account.json'),
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(process.cwd(), 'firebase-service-account.json')
    ].filter(Boolean);

    for (const p of serviceAccountPaths) {
        if (fs.existsSync(p)) {
            try {
                const raw = fs.readFileSync(p, 'utf8');
                const creds = JSON.parse(raw);

                // Secure validation: verify required fields without printing credentials
                if (!creds.project_id || !creds.client_email || !creds.private_key) {
                    console.error(`[Admin Setup Error] Service account file at "${p}" is missing required fields (project_id, client_email, private_key).`);
                    process.exit(1);
                }

                console.log(`[Admin Setup] Initializing with service account file: ${p}`);
                return initializeApp({
                    credential: cert(creds)
                });
            } catch (err) {
                console.error(`[Admin Setup Error] Failed to read or parse service account file at "${p}":`, err.message);
                process.exit(1);
            }
        }
    }

    // Check individual environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log('[Admin Setup] Initializing with environment variables.');
        return initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    }

    console.error('[Admin Setup Error] Could not find valid Firebase Admin credentials.');
    console.error('Please ensure "service-account.json" is placed in the project root, or set GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_* environment variables.');
    process.exit(1);
}

async function setAdminClaim(identifier) {
    if (!identifier) {
        console.error('Error: Please provide a user UID or email address.');
        console.log('Example: node scripts/set-admin-claim.js admin@servicehub.in');
        process.exit(1);
    }

    const app = initFirebaseAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);

    let targetUid = identifier;
    let targetEmail = '';

    try {
        if (identifier.includes('@')) {
            const userRecord = await auth.getUserByEmail(identifier);
            targetUid = userRecord.uid;
            targetEmail = userRecord.email;
        } else {
            const userRecord = await auth.getUser(identifier);
            targetEmail = userRecord.email;
        }

        console.log(`Setting admin custom claim for UID: ${targetUid} (${targetEmail})...`);

        // 1. Set Firebase Auth custom claims: { admin: true }
        await auth.setCustomUserClaims(targetUid, { admin: true });

        // 2. Also ensure Firestore users/{uid} document has role: 'admin'
        await db.collection('users').doc(targetUid).set({
            role: 'admin',
            adminAssignedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(' Successfully granted Admin privileges!');
        console.log('Target account now has:');
        console.log('  - Firebase Auth Custom Claim: { admin: true }');
        console.log('  - Firestore Role: "admin"');
        console.log('Note: If the user is currently signed in, they must log out and sign back in for the new ID token claims to take effect.');
    } catch (err) {
        console.error(' Failed to set admin claim:', err.message);
        process.exit(1);
    }
}

const target = process.argv[2];
setAdminClaim(target);
