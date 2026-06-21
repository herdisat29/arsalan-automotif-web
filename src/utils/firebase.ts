/// <reference types="vite/client" />

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Gunakan literal lengkap 'import.meta.env.VITE_...' agar Vite dapat mengenalinya saat build time di Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";

// Log diagnosa (aman tanpa membocorkan seluruh API Key)
console.log("=== DIAGNOSIS FIREBASE ===");
console.log("API Key terdeteksi:", firebaseConfig.apiKey ? `Ya (Panjang: ${firebaseConfig.apiKey.length} Karakter)` : "KOSOONG / TIDAK ADA");
console.log("Project ID:", firebaseConfig.projectId || "KOSOONG");
console.log("Auth Domain:", firebaseConfig.authDomain || "KOSOONG");
console.log("Database ID:", databaseId);
console.log("==========================");

if (!firebaseConfig.apiKey) {
  console.error(
    "⚠️ PERINGATAN: API Key Firebase tidak ditemukan!\n" +
    "Jika Anda meng-deploy ke Vercel:\n" +
    "1. Pastikan Anda sudah menambahkan 'VITE_FIREBASE_API_KEY' di dashboard Environment Variables Vercel.\n" +
    "2. PENTING: Anda HARUS melakukan REDEPLOY (memicu build baru) agar perubahan Env Variables dimasukkan ke file JavaScript client-side."
  );
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID
export const db = getFirestore(app, databaseId);

// Initialize Auth
export const auth = getAuth(app);
