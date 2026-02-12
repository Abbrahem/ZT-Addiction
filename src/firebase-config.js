// Firebase Configuration
// ⚠️ هتحتاج تضيف البيانات دي من Firebase Console

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase config - هتجيب دي من Firebase Console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// VAPID key - هتجيبه من Firebase Console → Cloud Messaging → Web Push certificates
const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// Initialize Firebase
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Request permission and get FCM token
export const requestFCMToken = async () => {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Wait for service worker to be ready
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready:', registration);
        
        // Get FCM token with service worker registration
        const token = await getToken(messaging, { 
          vapidKey,
          serviceWorkerRegistration: registration
        });
        console.log('✅ FCM Token:', token);
        
        // Save token to localStorage
        localStorage.setItem('fcmToken', token);
        
        return token;
      } else {
        console.error('❌ Service Worker not supported');
        return null;
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📩 Message received:', payload);
      resolve(payload);
    });
  });

// Get saved FCM token
export const getSavedFCMToken = () => {
  return localStorage.getItem('fcmToken');
};

export { messaging };
