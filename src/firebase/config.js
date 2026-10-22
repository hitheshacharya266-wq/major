// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAsaczLagf47xBvrOzOjpLAfCSKoFWTBS0",
    authDomain: "service-aggregator-b2530.firebaseapp.com",
    projectId: "service-aggregator-b2530",
    storageBucket: "service-aggregator-b2530.firebasestorage.app",
    messagingSenderId: "806709977045",
    appId: "1:806709977045:web:382ac26f07a5892110675c",
    measurementId: "G-5YLHV08DNP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Avoid indefinite 10-minute retry hangs when Storage bucket is not yet created in Firebase Console
try {
    storage.maxUploadRetryTime = 10000;
    storage.maxOperationRetryTime = 10000;
} catch {
    // Ignore in unsupported environments
}

export default app;

