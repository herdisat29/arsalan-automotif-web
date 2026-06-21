import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read from Vite environment variables (either injected from local config or defined on cloud env)
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: metaEnv.VITE_FIREBASE_APP_ID || ""
};

const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || "(default)";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID
export const db = getFirestore(app, databaseId);

// Initialize Auth
export const auth = getAuth(app);
