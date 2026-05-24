import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    _app = getApps()[0] || initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const { getAuth } = require("firebase/auth");
    _auth = getAuth(getApp());
  }
  return _auth!;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    const { getStorage } = require("firebase/storage");
    _storage = getStorage(getApp());
  }
  return _storage!;
}

// Proxy exports for backward compat
export const auth = new Proxy({} as Auth, {
  get(_t, prop) { return (getFirebaseAuth() as unknown as Record<string | symbol, unknown>)[prop]; },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_t, prop) { return (getFirebaseStorage() as unknown as Record<string | symbol, unknown>)[prop]; },
});

export default new Proxy({} as FirebaseApp, {
  get(_t, prop) { return (getApp() as unknown as Record<string | symbol, unknown>)[prop]; },
});
