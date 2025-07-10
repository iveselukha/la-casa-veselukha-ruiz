import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBUh1o6czq-Y1dw7j-ZyAVNTA3s3E7xYxk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "la-casa-brixton.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "la-casa-brixton",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "la-casa-brixton.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "68978596474",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:68978596474:web:f42c757b6e3f720102f9c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app; 