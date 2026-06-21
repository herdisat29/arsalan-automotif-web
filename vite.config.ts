import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  let firebaseEnv: Record<string, string> = {};

  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      firebaseEnv = {
        'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(config.apiKey || ''),
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(config.authDomain || ''),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(config.projectId || ''),
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(config.storageBucket || ''),
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(config.messagingSenderId || ''),
        'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(config.appId || ''),
        'import.meta.env.VITE_FIREBASE_DATABASE_ID': JSON.stringify(config.firestoreDatabaseId || ''),
      };
    }
  } catch (err) {
    console.warn('Gagal membaca firebase-applet-config.json:', err);
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: firebaseEnv,
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
