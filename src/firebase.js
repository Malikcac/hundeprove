import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC8vhUQbPFiG-lpIhev3SwfnWQ_qKcrSag",
  authDomain: "hundeprove.firebaseapp.com",
  projectId: "hundeprove",
  storageBucket: "hundeprove.firebasestorage.app",
  messagingSenderId: "100207061925",
  appId: "1:100207061925:web:bc327f55d2c011cd6d564c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };