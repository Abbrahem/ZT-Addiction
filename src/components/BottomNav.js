import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    // Load notification count from localStorage
    const loadNotificationCount = () => {
      // 1. إشعارات المنتجات الجديدة
      const productNotifications = JSON.parse(localStorage.getItem('adminProductNotifications') || '[]')
        .filter(n => n.type === 'new_product');
      
      // 2. إشعارات الأوردرات الخاصة بالعميل
      const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      let orderNotificationsCount = 0;
      myOrders.forEach(orderId => {
        const orderNotifs = JSON.parse(localStorage.getItem(`order-${orderId}-notifications`) || '[]');
        orderNotificationsCount += orderNotifs.length;
      });
      
      // 3. إجمالي الإشعارات
      const totalCount = productNotifications.length + orderNotificationsCount;
      setNotificationCount(totalCount);
    };
    
    loadNotificationCount();

    // Load orders count
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrdersCount(orders.length);

    // Listen for new notifications
    const handleNewNotification = () => {
      loadNotificationCount();
    };

    // Listen for new orders
    const handleNewOrder = () => {
      const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrdersCount(updatedOrders.length);
    };

    window.addEventListener('newNotification', handleNewNotification);
    window.addEventListener('newOrder', handleNewOrder);
    
    // Refresh count every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000);
    
    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      window.removeEventListener('newOrder', handleNewOrder);
      clearInterval(interval);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        {/* Notifications */}
        <Link
          to="/notifications"
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            isActive('/notifications') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Notifications</span>
        </Link>

        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </Link>

        {/* Orders */}
        <Link
          to="/my-orders"
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            isActive('/my-orders') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {ordersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {ordersCount > 9 ? '9+' : ordersCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">My Orders</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
