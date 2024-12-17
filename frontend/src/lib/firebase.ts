import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtMjwnPVwoksdkHg3AaNlt6osIud5JWXA",
    authDomain: "quicksell-ai-chatbot.firebaseapp.com",
    projectId: "quicksell-ai-chatbot",
    storageBucket: "quicksell-ai-chatbot.firebasestorage.app",
    messagingSenderId: "343037961268",
    appId: "1:343037961268:web:4f3e44f31b50e8b6665661",
    measurementId: "G-P9DNXCMLXT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
