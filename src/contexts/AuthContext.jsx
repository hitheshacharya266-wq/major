/**
 * Auth Context
 *
 * Wraps onAuthStateChanged and provides currentUser, userProfile,
 * and loading state throughout the app.
 * Handles Firestore fetch errors gracefully.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile } from '../firebase/firestoreService';

const AuthContext = createContext();

/** Custom hook to access auth context */
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true); // Explicitly set loading when state changes
            setCurrentUser(user);
            if (user) {
                try {
                    // Fetch the extended profile from Firestore
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                } catch (err) {
                    console.error('Failed to fetch user profile:', err);
                    // Even if Firestore fetch fails, set a minimal profile
                    // so the app can still function with basic auth info
                    setUserProfile({
                        uid: user.uid,
                        fullName: user.displayName || '',
                        email: user.email || '',
                        role: 'user', // default role fallback
                    });
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = { currentUser, userProfile, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
