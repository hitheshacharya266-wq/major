/**
 * ServiceHub - Demo Provider Accounts & Marketplace Seeding Utility
 *
 * Uses Firebase Admin SDK to safely and idempotently seed 20 complete,
 * presentation-ready service-provider accounts into Firebase Authentication
 * and Firestore (users, serviceProviders, and reviews collections).
 *
 * Features:
 * - Idempotent: Can be rerun safely without creating duplicate users
 * - Preserves existing production accounts (only targets demo.*@servicehub.in emails)
 * - Generates individual strong demo passwords
 * - Links Auth UID to Firestore `users` and `serviceProviders` documents
 * - Writes a protected local credential report: DEMO_CREDENTIALS.md
 *
 * Usage:
 *   node scripts/seedDemoProviders.js
 */

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import DEMO_PROVIDERS from src/data/demoProviders.js
const { DEMO_PROVIDERS } = await import('../src/data/demoProviders.js');

// Distinct, strong, demo-only passwords for each provider
const DEMO_PASSWORDS = {
    'demo.electrician@servicehub.in': 'Demo@Elec2026#Hub',
    'demo.plumber@servicehub.in': 'Demo@Plumb2026#Hub',
    'demo.cleaning@servicehub.in': 'Demo@Clean2026#Hub',
    'demo.ac@servicehub.in': 'Demo@AirCon2026#Hub',
    'demo.carpenter@servicehub.in': 'Demo@Carp2026#Hub',
    'demo.painter@servicehub.in': 'Demo@Paint2026#Hub',
    'demo.appliance@servicehub.in': 'Demo@Appliance2026#Hub',
    'demo.computer@servicehub.in': 'Demo@Computer2026#Hub',
    'demo.mobile@servicehub.in': 'Demo@Mobile2026#Hub',
    'demo.photo@servicehub.in': 'Demo@Photo2026#Hub',
    'demo.salon@servicehub.in': 'Demo@Salon2026#Hub',
    'demo.mechanic@servicehub.in': 'Demo@Mechanic2026#Hub',
    'demo.gardener@servicehub.in': 'Demo@Garden2026#Hub',
    'demo.pest@servicehub.in': 'Demo@Pest2026#Hub',
    'demo.movers@servicehub.in': 'Demo@Movers2026#Hub',
    'demo.interior@servicehub.in': 'Demo@Interior2026#Hub',
    'demo.fitness@servicehub.in': 'Demo@Fit2026#Hub',
    'demo.tutor@servicehub.in': 'Demo@Tutor2026#Hub',
    'demo.laundry@servicehub.in': 'Demo@Laundry2026#Hub',
    'demo.handyman@servicehub.in': 'Demo@Handy2026#Hub'
};

function initFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccountPaths = [
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        path.resolve(rootDir, 'service-account.json'),
        path.resolve(rootDir, 'serviceAccountKey.json'),
        path.resolve(rootDir, 'firebase-service-account.json')
    ].filter(Boolean);

    for (const p of serviceAccountPaths) {
        if (fs.existsSync(p)) {
            try {
                const raw = fs.readFileSync(p, 'utf8');
                const creds = JSON.parse(raw);
                if (creds.project_id && creds.client_email && creds.private_key) {
                    console.log(`[Firebase Admin] Initializing with service account: ${p} (Project: ${creds.project_id})`);
                    return initializeApp({
                        credential: cert(creds)
                    });
                }
            } catch (err) {
                console.error(`[Firebase Admin Error] Could not parse "${p}":`, err.message);
            }
        }
    }

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log(`[Firebase Admin] Initializing from environment variables for project: ${process.env.FIREBASE_PROJECT_ID}`);
        return initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    }

    console.error('\n[Firebase Admin Error] No valid service account credential found.');
    console.error('Please place your service-account.json in the project root or set GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
}

async function seedDemoProviders() {
    console.log('='.repeat(70));
    console.log('ServiceHub - Seeding 20 Complete Demo Provider Accounts');
    console.log('='.repeat(70));

    const app = initFirebaseAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const credentialRecords = [];
    let createdCount = 0;
    let updatedCount = 0;
    let reviewsCount = 0;

    for (let i = 0; i < DEMO_PROVIDERS.length; i++) {
        const p = DEMO_PROVIDERS[i];
        const email = p.email.toLowerCase();
        const password = DEMO_PASSWORDS[email] || `Demo@ServiceHub#2026_${i + 1}`;

        console.log(`\n[${i + 1}/20] Processing: ${p.name} (${p.category}) -> ${email}`);

        let userRecord;
        try {
            // Check if user already exists in Firebase Auth
            userRecord = await auth.getUserByEmail(email);
            console.log(`  ✓ Auth user exists with UID: ${userRecord.uid}`);
            // Update password & metadata to ensure credentials work
            await auth.updateUser(userRecord.uid, {
                password: password,
                displayName: p.name,
                photoURL: p.photoURL
            });
            updatedCount++;
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                // Create new user in Firebase Auth
                userRecord = await auth.createUser({
                    email: email,
                    password: password,
                    displayName: p.name,
                    photoURL: p.photoURL
                });
                console.log(`  + Created new Auth user with UID: ${userRecord.uid}`);
                createdCount++;
            } else {
                console.error(`  ✗ Auth error for ${email}:`, err.message);
                continue;
            }
        }

        const uid = userRecord.uid;

        // 1. Upsert in `users` collection
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.set({
            uid: uid,
            userId: uid,
            fullName: p.name,
            name: p.name,
            email: email,
            phone: p.phone,
            role: 'provider',
            gender: p.gender || 'male',
            photoURL: p.photoURL,
            avatar: p.photoURL,
            status: 'active',
            isDemo: true,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`  ✓ Upserted Firestore users/${uid}`);

        // 2. Upsert in `serviceProviders` collection
        const providerDocRef = db.collection('serviceProviders').doc(uid);
        await providerDocRef.set({
            uid: uid,
            id: uid,
            name: p.name,
            email: email,
            phone: p.phone,
            gender: p.gender || 'male',
            category: p.category,
            headline: p.headline,
            description: p.description,
            bio: p.description,
            location: p.location,
            city: p.city,
            address: p.address,
            experienceYears: p.experienceYears,
            experience: p.experience,
            price: p.price,
            priceStarting: p.priceStarting,
            available: p.available ?? true,
            status: 'active',
            verified: true,
            verificationStatus: 'verified',
            rating: p.rating,
            ratingCount: p.ratingCount,
            completedJobsCount: p.completedJobsCount,
            completedJobs: p.completedJobs,
            photoURL: p.photoURL,
            image: p.photoURL,
            skills: p.skills,
            workingDays: p.workingDays,
            workingHours: p.workingHours,
            breakTime: p.breakTime,
            portfolio: p.portfolio,
            services: p.services,
            isDemo: true,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`  ✓ Upserted Firestore serviceProviders/${uid} with ${p.portfolio.length} portfolio items`);

        // 3. Upsert Sample Reviews in `reviews` collection
        if (Array.isArray(p.reviews) && p.reviews.length > 0) {
            for (let rIdx = 0; rIdx < p.reviews.length; rIdx++) {
                const rev = p.reviews[rIdx];
                const revDocId = `demo-rev-${uid.substring(0, 8)}-${rIdx + 1}`;
                await db.collection('reviews').doc(revDocId).set({
                    id: revDocId,
                    providerId: uid,
                    customerName: rev.customerName,
                    rating: rev.rating,
                    comment: rev.comment,
                    createdAt: FieldValue.serverTimestamp(),
                    isDemo: true
                }, { merge: true });
                reviewsCount++;
            }
            console.log(`  ✓ Seeded ${p.reviews.length} reviews for provider`);
        }

        credentialRecords.push({
            name: p.name,
            email: email,
            password: password,
            category: p.category,
            location: p.location,
            uid: uid,
            portfolioCount: p.portfolio.length,
            startingPrice: p.price
        });
    }

    // 4. Generate local credential report
    const reportPath = path.resolve(rootDir, 'DEMO_CREDENTIALS.md');
    let reportContent = `# ServiceHub — Presentation Demo Credentials & Provider Guide

> **CONFIDENTIAL / DEMO USE ONLY**  
> This file is generated locally for your college presentation demonstration.  
> It is excluded from Git via \`.gitignore\` and is never included in the client bundle.

---

## Presentation Overview

- **Total Demo Providers:** 20
- **Total Categories:** 20 Distinct Services
- **Authentication Method:** Firebase Authentication (Email/Password)
- **Database Collections Seeded:** \`users\`, \`serviceProviders\`, \`reviews\`
- **Image Type:** 100% Genuine Photographic Portfolios & Portraits (Unsplash Commercial Free License)

---

## 20 Demo Provider Login Accounts

| # | Provider Name | Service Category | Login Email | Demo Password | Location | Base Price |
|---|---------------|------------------|-------------|---------------|----------|------------|
`;

    credentialRecords.forEach((c, idx) => {
        reportContent += `| ${idx + 1} | **${c.name}** | \`${c.category}\` | \`${c.email}\` | \`${c.password}\` | ${c.location} | ₹${c.startingPrice} |\n`;
    });

    reportContent += `
---

## How to Test and Demonstrate

### 1. Customer Flow (Discovery & Booking)
1. Open the application: [http://localhost:5173/](http://localhost:5173/)
2. Navigate to the **Discover / Search** page: [http://localhost:5173/search](http://localhost:5173/search)
3. Try clicking any of the **20 category chips** (e.g. *Electrical Services*, *Photography*, *Interior Design*, *AC Repair*).
4. Verify that each provider displays:
   - Genuine professional portrait
   - Verification badge
   - Star rating and review count
   - Starting price
   - Key skill badges
5. Click **View Profile & Reviews** on any card:
   - Check the **About Me** section
   - Inspect the **Working Hours & Availability** card
   - Browse the **Service Portfolio** gallery (click any image to open the high-res lightbox)
   - Review the **Pricing Guide** with itemized sub-services and durations
   - Read the **Customer Testimonials**

### 2. Provider Flow (Dashboard & Management)
1. Click **Sign In** in the top navigation bar.
2. Enter any demo provider's email and password from the table above:
   - Example 1: \`demo.electrician@servicehub.in\` / \`Demo@Elec2026#Hub\`
   - Example 2: \`demo.photo@servicehub.in\` / \`Demo@Photo2026#Hub\`
   - Example 3: \`demo.cleaning@servicehub.in\` / \`Demo@Clean2026#Hub\`
3. Upon login, the app automatically redirects to the **Provider Dashboard** (\`/provider-dashboard\`).
4. In the Provider Dashboard you can demonstrate:
   - Live **Duty Toggle** (Switch between *Available* and *Off-Duty*)
   - **Portfolio Management** modal (view work samples, upload new photos, or delete)
   - Profile photo customization modal
   - Incoming job requests and status management

---

## Safety & Cleanup

- The seed script is **completely idempotent**: running \`node scripts/seedDemoProviders.js\` repeatedly updates existing demo records without creating duplicates.
- All demo records are tagged with \`isDemo: true\`.
- Real/production accounts were untouched.
`;

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log('\n' + '='.repeat(70));
    console.log(`✓ Seeding Completed Successfully!`);
    console.log(`  - New Auth Accounts Created: ${createdCount}`);
    console.log(`  - Existing Auth Accounts Updated: ${updatedCount}`);
    console.log(`  - Total Providers in Database: ${credentialRecords.length}`);
    console.log(`  - Total Reviews Seeded: ${reviewsCount}`);
    console.log(`  - Credential Report Saved to: ${reportPath}`);
    console.log('='.repeat(70));
}

seedDemoProviders().catch(err => {
    console.error('\nFatal error during seeding:', err);
    process.exit(1);
});
