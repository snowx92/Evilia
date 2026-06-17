// Firebase Cloud Messaging service worker. Required by FCM for browser push.
// This file MUST be served from /firebase-messaging-sw.js at the site root.
//
// Config is intentionally hard-coded — service workers can't read .env vars and
// these values are public (apiKey is not a secret in Firebase Web).
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB8WWHnzu1qCdFWkIWdGzpdMzscdOz-fVs',
  authDomain: 'evilla-17582.firebaseapp.com',
  projectId: 'evilla-17582',
  storageBucket: 'evilla-17582.firebasestorage.app',
  messagingSenderId: '663028194022',
  appId: '1:663028194022:web:76f48b5bab12e1f835f927',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Evilla';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'auto',
    data: payload.data,
  });
});
