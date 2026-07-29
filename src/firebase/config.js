// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export default app;
