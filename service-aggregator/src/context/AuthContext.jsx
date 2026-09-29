import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'customer', 'provider', 'admin'
    const [loading, setLoading] = useState(true);

    // Signup function
    const signup = async (email, password, role, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            name: name,
            role: role, // 'customer' or 'provider'
            createdAt: serverTimestamp(),
            // Default fields
            isVerified: role === 'provider' ? false : true,
            ...(role === 'provider' && { skills: [], rating: 0, reviewsCount: 0 })
        });

        return user;
    };

    // Login function
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Logout function
    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                // Fetch user role from Firestore
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUser({ ...currentUser, ...docSnap.data() });
                    setUserRole(docSnap.data().role);
                } else {
                    // Fallback if no firestore doc (shouldn't happen in normal flow)
                    setUser(currentUser);
                    setUserRole('customer');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        userRole,
        loading,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
