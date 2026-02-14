import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    // Sort by date, newest first
    const sorted = stored.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setNotifications(sorted);
    
    // Mark all as read
    const updated = sorted.map(n => ({ ...n, read: true }));
    localStorage.setItem('userNotifications', JSON.stringify(updated));
    
    // Trigger event to update badge
    window.dispatchEvent(new Event('newNotification'));
  };

  const clearAll = () => {
    localStorage.setItem('userNotifications', JSON.stringify([]));
    setNotifications([]);
    window.dispatchEvent(new Event('newNotification'));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('userNotifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('newNotification'));
  };

  const handleNotificationClick = (notification) => {
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return (
          <div className="bg-blue-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case 'new_product':
        return (
          <div className="bg-green-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'special_offer':
        return (
          <div className="bg-amber-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">الإشعارات</h1>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-500">سنرسل لك إشعاراً عند وجود تحديثات جديدة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg p-4 shadow-sm border ${
                  notification.url ? 'cursor-pointer hover:shadow-md' : ''
                } transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-500' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{notification.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDate(notification.timestamp)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
