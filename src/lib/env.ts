function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required env var: ${name}`);
    }
    return '';
  }
  return value;
}

export const env = {
  apiBaseUrl: required('NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL).replace(
    /\/+$/,
    '',
  ),
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'ar') as 'ar' | 'en',
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '',
  },
} as const;

export const isFirebaseConfigured = (() => {
  const f = env.firebase;
  return Boolean(f.apiKey && f.projectId && f.appId && f.messagingSenderId);
})();

export const isFcmConfigured = (() => {
  return isFirebaseConfigured && Boolean(env.firebase.vapidKey);
})();
