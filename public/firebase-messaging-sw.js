// Firebase Cloud Messaging Service Worker
// ⚠️ هذا الملف يجب أن يكون في public/ folder

console.log('🔧 Service Worker: Loading...');

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

console.log('✅ Service Worker: Firebase scripts loaded');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD62na9JCu3-2Ml7X3uGzrRbbrAFY5nJWQ",
  authDomain: "zt-additction.firebaseapp.com",
  projectId: "zt-additction",
  storageBucket: "zt-additction.firebasestorage.app",
  messagingSenderId: "510114095648",
  appId: "1:510114095648:web:429cbb7ee940316eb99245"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log('✅ Service Worker: Firebase initialized');

// Get messaging instance
const messaging = firebase.messaging();
console.log('✅ Service Worker: Messaging instance created');

// Service Worker Install Event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  self.skipWaiting(); // Activate immediately
});

// Service Worker Activate Event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(self.clients.claim()); // Take control of all pages
});

// Service Worker Fetch Event (required for PWA)
self.addEventListener('fetch', (event) => {
  // Just pass through, don't cache anything
  event.respondWith(fetch(event.request));
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Background message received:', payload);
  console.log('📦 Payload notification:', payload.notification);
  console.log('📦 Payload data:', payload.data);
  
  // Get title and body from notification or data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'ZT ADDICTION';
  const notificationBody = payload.notification?.body || payload.data?.body || 'لديك إشعار جديد';
  
  // Build URL with orderId if present
  let clickUrl = payload.data?.url || '/';
  const orderId = payload.data?.orderId;
  
  if (orderId && clickUrl.includes('order-tracking')) {
    clickUrl = `/order-tracking?orderId=${orderId}`;
  }
  
  console.log('🔗 Will open URL on click:', clickUrl);
  console.log('📝 Title:', notificationTitle);
  console.log('📝 Body:', notificationBody);
  
  // Save notification to localStorage for notifications page
  try {
    const notification = {
      id: Date.now().toString(),
      title: notificationTitle,
      body: notificationBody,
      type: payload.data?.type || 'general',
      url: clickUrl,
      timestamp: Date.now(),
      read: false
    };
    
    // Get existing notifications
    const existingNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    existingNotifications.unshift(notification);
    
    // Keep only last 50 notifications
    const trimmed = existingNotifications.slice(0, 50);
    localStorage.setItem('userNotifications', JSON.stringify(trimmed));
    
    // Notify app about new notification
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NEW_NOTIFICATION',
          notification: notification
        });
      });
    });
  } catch (error) {
    console.error('Error saving notification:', error);
  }
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/c1.jpg',
    badge: '/c1.jpg',
    data: {
      ...payload.data,
      clickUrl: clickUrl
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'default',
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  console.log('📦 Notification data:', event.notification.data);
  console.log('🌐 Current clients:', self.clients);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  
  // Build the full URL
  let urlToOpen = notificationData.url || '/';
  const orderId = notificationData.orderId;
  
  if (orderId && urlToOpen.includes('order-tracking')) {
    urlToOpen = `/order-tracking?orderId=${orderId}`;
  }
  
  console.log('🔗 Opening URL:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        console.log('📱 Found clients:', clientList.length);
        // If there's an open window, focus it and navigate
        if (clientList.length > 0) {
          const client = clientList[0];
          console.log('📍 Focusing existing window and navigating to:', urlToOpen);
          client.focus();
          // Send message to the client to navigate
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen
          });
          return client;
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          console.log('🆕 Opening new window:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch(error => {
        console.error('❌ Error handling notification click:', error);
      })
  );
});
