import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
  child,
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyBoIxaoto4Gd48pPThk1KTERvoejI8HzNA",
  authDomain: "chat-881cc.firebaseapp.com",
  databaseURL: "https://chat-881cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chat-881cc",
  storageBucket: "chat-881cc.firebasestorage.app",
  messagingSenderId: "1095415944252",
  appId: "1:1095415944252:web:8458c81f41da642edcdf39",
  measurementId: "G-VS7VCXT090",
};

export const FIXED_ADMIN_EMAIL = "mail.sajjadahmed@gmail.com";
export const FIXED_ADMIN_UID = "nhLkfnaza9c3RgUkZeLZvEtT0D33";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Helper to determine if a user is the fixed admin
export const isAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  const emailMatch = user.email && user.email.toLowerCase().trim() === FIXED_ADMIN_EMAIL.toLowerCase();
  const uidMatch = user.uid === FIXED_ADMIN_UID;
  return Boolean(emailMatch || uidMatch);
};
