// Notification utility functions

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Register service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Show local notification (fallback)
export const showLocalNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/c1.jpg',
      badge: '/c1.jpg',
      ...options
    });
  }
};

// Save notification subscription to localStorage
export const saveNotificationSubscription = (isSubscribed) => {
  localStorage.setItem('notificationSubscribed', isSubscribed ? 'true' : 'false');
};

// Check if user is subscribed to notifications
export const isNotificationSubscribed = () => {
  return localStorage.getItem('notificationSubscribed') === 'true';
};

// Save tracked order IDs to localStorage
export const saveTrackedOrder = (orderId) => {
  const tracked = getTrackedOrders();
  if (!tracked.includes(orderId)) {
    tracked.push(orderId);
    localStorage.setItem('trackedOrders', JSON.stringify(tracked));
  }
};

// Get all tracked order IDs
export const getTrackedOrders = () => {
  const tracked = localStorage.getItem('trackedOrders');
  return tracked ? JSON.parse(tracked) : [];
};

// Check order status and notify if changed
export const checkOrderStatusChange = async (orderId) => {
  try {
    const lastStatus = localStorage.getItem(`order_${orderId}_status`);
    
    const response = await fetch(`/api/orders?orderId=${orderId}`);
    const orders = await response.json();
    
    if (orders && orders.length > 0) {
      const order = orders[0];
      const currentStatus = order.status;
      
      if (lastStatus && lastStatus !== currentStatus) {
        // Status changed - show notification
        const statusMessages = {
          pending: 'طلبك قيد المراجعة',
          processing: 'جاري تجهيز طلبك',
          shipped: 'تم شحن طلبك',
          delivered: 'تم توصيل طلبك',
          cancelled: 'تم إلغاء طلبك'
        };
        
        showLocalNotification('تحديث حالة الطلب', {
          body: statusMessages[currentStatus] || 'تم تحديث حالة طلبك',
          data: { url: '/order-tracking' }
        });
      }
      
      // Save current status
      localStorage.setItem(`order_${orderId}_status`, currentStatus);
      
      return currentStatus;
    }
  } catch (error) {
    console.error('Error checking order status:', error);
  }
  return null;
};

// Start monitoring tracked orders
export const startOrderMonitoring = () => {
  const trackedOrders = getTrackedOrders();
  
  if (trackedOrders.length > 0 && isNotificationSubscribed()) {
    // Check every 5 minutes
    setInterval(() => {
      trackedOrders.forEach(orderId => {
        checkOrderStatusChange(orderId);
      });
    }, 5 * 60 * 1000);
  }
};
