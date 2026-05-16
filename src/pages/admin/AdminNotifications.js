import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // جلب الأوردرات من قاعدة البيانات
      const response = await axios.get('/api/orders', { withCredentials: true });
      const orders = response.data || [];
      
      console.log('📦 Loaded orders:', orders.length);
      
      // تحويل الأوردرات لإشعارات
      const orderNotifications = orders.map(order => ({
        id: order._id,
        type: 'new_order',
        title: '🛍️ طلب جديد',
        body: `طلب من ${order.customer?.name || 'عميل'} - ${order.total} جنيه`,
        timestamp: new Date(order.createdAt).getTime(),
        read: false,
        url: `/admin/dashboard`,
        orderId: order._id,
        status: order.status,
        customer: order.customer,
        total: order.total
      }));
      
      // جلب إشعارات المنتجات من localStorage
      const productNotifications = JSON.parse(localStorage.getItem('adminProductNotifications') || '[]');
      
      // دمج الإشعارات وترتيبها حسب الوقت
      const allNotifications = [...orderNotifications, ...productNotifications]
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(allNotifications);
      console.log('✅ Notifications loaded:', allNotifications.length);
      
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    // مسح إشعارات المنتجات من localStorage
    localStorage.setItem('adminProductNotifications', '[]');
    // إعادة تحميل الإشعارات (هيبقى فيه الأوردرات بس)
    loadNotifications();
  };

  const deleteNotification = (id) => {
    // لو إشعار منتج، امسحه من localStorage
    const productNotifications = JSON.parse(localStorage.getItem('adminProductNotifications') || '[]');
    const isProductNotification = productNotifications.some(n => n.id === id);
    
    if (isProductNotification) {
      const updated = productNotifications.filter(n => n.id !== id);
      localStorage.setItem('adminProductNotifications', JSON.stringify(updated));
    }
    
    // مسح من الـ state
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
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

  const getStatusBadge = (status) => {
    const badges = {
      processing: { text: 'قيد التجهيز', color: 'bg-blue-100 text-blue-800' },
      shipped: { text: 'تم الشحن', color: 'bg-purple-100 text-purple-800' },
      delivered: { text: 'تم التوصيل', color: 'bg-green-100 text-green-800' }
    };
    
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
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
          <p className="text-gray-500">لا توجد طلبات جديدة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {notification.status && getStatusBadge(notification.status)}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {notification.body}
                  </p>
                  
                  {/* تفاصيل المنتج */}
                  {notification.productName && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div>📦 {notification.productName}</div>
                      {notification.collection && (
                        <div>🏷️ {notification.collection}</div>
                      )}
                    </div>
                  )}
                  
                  {/* تفاصيل العميل */}
                  {notification.customer && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div>📱 {notification.customer.phone1}</div>
                      {notification.customer.phone2 && (
                        <div>📱 {notification.customer.phone2}</div>
                      )}
                      <div>📍 {notification.customer.address}</div>
                      {notification.customer.governorate && (
                        <div>🏙️ {notification.customer.governorate}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-400">
                      {formatTime(notification.timestamp)}
                    </span>
                    {notification.total && (
                      <span className="text-xs font-semibold text-green-600">
                        {notification.total} جنيه
                      </span>
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
