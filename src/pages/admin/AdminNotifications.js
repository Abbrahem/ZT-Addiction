import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Listen for new notifications from service worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [event.data.notification, ...prev]);
      }
    });
  }, []);

  const loadNotifications = () => {
    try {
      // Load from localStorage
      const stored = localStorage.getItem('adminNotifications') || '[]';
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      
      // Mark all as read
      const updated = parsed.map(n => ({ ...n, read: true }));
      localStorage.setItem('adminNotifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    localStorage.setItem('adminNotifications', '[]');
    setNotifications([]);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_order': return '🛍️';
      case 'order_update': return '📦';
      case 'new_product': return '✨';
      case 'sold_out': return '❌';
      case 'back_in_stock': return '✅';
      default: return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {notification.body}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {formatTime(notification.timestamp)}
                    </span>
                    {notification.url && (
                      <a
                        href={notification.url}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
