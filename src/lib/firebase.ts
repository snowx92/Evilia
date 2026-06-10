'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { env, isFirebaseConfigured } from './env';

/**
 * Lazy-initialise Firebase exactly once on the browser. We avoid `getAuth()` on
 * the server because Firebase Auth touches `window` and we run the App Router.
 */
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* env vars in .env.local.',
    );
  }
  if (_app) return _app;
  _app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: env.firebase.apiKey,
        authDomain: env.firebase.authDomain,
        projectId: env.firebase.projectId,
        storageBucket: env.firebase.storageBucket,
        messagingSenderId: env.firebase.messagingSenderId,
        appId: env.firebase.appId,
        measurementId: env.firebase.measurementId || undefined,
      });
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('getFirebaseAuth() is browser-only.');
  }
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}
