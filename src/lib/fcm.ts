'use client';

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { env, isFcmConfigured } from './env';

let _messaging: Messaging | null = null;

export async function getMessagingInstance(): Promise<Messaging | null> {
  if (!isFcmConfigured) return null;
  if (typeof window === 'undefined') return null;
  if (!(await isSupported())) return null;
  if (_messaging) return _messaging;

  const app = getApps().length
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
  _messaging = getMessaging(app);
  return _messaging;
}

/**
 * Request notification permission and return the FCM token, or `null` if FCM is
 * unavailable (unsupported browser, missing VAPID key, permission denied, or
 * service worker registration failed). Never throws — this is fire-and-forget
 * post-login bootstrap.
 */
export async function requestFcmToken(): Promise<string | null> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    if (typeof Notification === 'undefined') return null;
    let permission: NotificationPermission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') return null;

    const swReg = await navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .catch(() => null);

    return await getToken(messaging, {
      vapidKey: env.firebase.vapidKey,
      ...(swReg ? { serviceWorkerRegistration: swReg } : {}),
    });
  } catch {
    return null;
  }
}

/**
 * Subscribe to foreground FCM messages (fires only while the app is open).
 * Returns an unsubscribe function, or a no-op if FCM isn't available.
 */
export async function onForegroundMessage(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}
