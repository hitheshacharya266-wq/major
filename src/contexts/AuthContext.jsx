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
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminClaim, setAdminClaim] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setCurrentUser(user);
            if (user) {
                try {
                    // 1. Check Firebase Auth custom claims on the ID token
                    const tokenResult = await user.getIdTokenResult();
                    const hasAdminClaim = !!tokenResult.claims?.admin;
                    setAdminClaim(hasAdminClaim);

                    // 2. Fetch the extended profile from Firestore
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);

                    const roleAdmin = profile?.role === 'admin';
                    setIsAdmin(hasAdminClaim || roleAdmin);
                } catch (err) {
                    console.error('Failed to fetch user profile or token claims:', err);
                    setUserProfile({
                        uid: user.uid,
                        fullName: user.displayName || '',
                        email: user.email || '',
                        role: 'user',
                    });
                    setIsAdmin(false);
                    setAdminClaim(false);
                }
            } else {
                setUserProfile(null);
                setIsAdmin(false);
                setAdminClaim(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const refreshUserProfile = async (forceTokenRefresh = false) => {
        if (auth.currentUser) {
            try {
                if (forceTokenRefresh) {
                    const tokenResult = await auth.currentUser.getIdTokenResult(true);
                    setAdminClaim(!!tokenResult.claims?.admin);
                }
                const profile = await getUserProfile(auth.currentUser.uid);
                setUserProfile(profile);
                setCurrentUser({ ...auth.currentUser });
                const tokenResult = await auth.currentUser.getIdTokenResult();
                const hasClaim = !!tokenResult.claims?.admin;
                setAdminClaim(hasClaim);
                setIsAdmin(hasClaim || profile?.role === 'admin');
            } catch (err) {
                console.error('Failed to refresh user profile:', err);
            }
        }
    };

    const getIdToken = async (forceRefresh = false) => {
        if (!auth.currentUser) return null;
        return await auth.currentUser.getIdToken(forceRefresh);
    };

    const value = {
        currentUser,
        userProfile,
        isAdmin,
        adminClaim,
        loading,
        refreshUserProfile,
        getIdToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
