/**
 * Firebase Authentication Service
 *
 * Handles user registration, login, and logout.
 * On registration, creates the user profile in Firestore.
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Register a new user with email, password, and role.
 * Creates Firebase Auth account + Firestore profile document.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {string} role - "user" | "provider"
 * @param {object} providerData - optional provider-specific fields
 */
export const registerUser = async (email, password, fullName, role, providerData = {}) => {
    // Create the Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the display name in Auth
    await updateProfile(user, { displayName: fullName });

    if (role === 'provider') {
        // Create a service provider document (for provider-specific queries)
        await setDoc(doc(db, 'serviceProviders', user.uid), {
            uid: user.uid,
            name: fullName,
            email,
            category: providerData.category || 'general',
            description: providerData.description || '',
            rating: 0,
            ratingCount: 0,
            available: true,
            createdAt: serverTimestamp()
        });
    }

    // Always create a user profile document (stores role + identity info)
    const userDoc = {
        uid: user.uid,
        fullName,
        email,
        role,
        createdAt: serverTimestamp()
    };

    // Also store provider-specific fields in the user doc for easy access
    if (role === 'provider') {
        userDoc.category = providerData.category || 'general';
        userDoc.description = providerData.description || '';
    }

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return user;
};

/**
 * Login an existing user with email and password.
 */
export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

/**
 * Logout the current user.
 */
export const logoutUser = async () => {
    await signOut(auth);
};
