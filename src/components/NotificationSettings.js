import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, registerServiceWorker, saveNotificationSubscription, isNotificationSubscribed, getTrackedOrders } from '../utils/notifications';
import Swal from 'sweetalert2';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [trackedOrdersCount, setTrackedOrdersCount] = useState(0);

  useEffect(() => {
    // Check current status
    setIsSubscribed(isNotificationSubscribed());
    setPermission(Notification.permission);
    setTrackedOrdersCount(getTrackedOrders().length);
  }, []);

  const handleEnableNotifications = async () => {
    await registerServiceWorker();
    const granted = await requestNotificationPermission();
    
    if (granted) {
      saveNotificationSubscription(true);
      setIsSubscribed(true);
      setPermission('granted');
      
      Swal.fire({
        icon: 'success',
        title: 'تم التفعيل!',
        text: 'سنرسل لك إشعارات بكل جديد',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'لم يتم التفعيل',
        text: 'يرجى السماح بالإشعارات من إعدادات المتصفح',
        confirmButtonColor: '#000'
      });
    }
  };

  const handleDisableNotifications = () => {
    saveNotificationSubscription(false);
    setIsSubscribed(false);
    
    Swal.fire({
      icon: 'info',
      title: 'تم إيقاف الإشعارات',
      text: 'لن تصلك إشعارات بعد الآن',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🎉 اختبار الإشعارات', {
        body: 'الإشعارات تعمل بشكل صحيح!',
        icon: '/c1.jpg',
        badge: '/c1.jpg'
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'غير مفعل',
        text: 'يرجى تفعيل الإشعارات أولاً',
        confirmButtonColor: '#000'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-playfair mb-6 text-center">إعدادات الإشعارات</h2>
      
      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="font-montserrat text-gray-700">حالة الإشعارات:</span>
          <span className={`font-semibold ${permission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
            {permission === 'granted' ? '✅ مفعلة' : '❌ غير مفعلة'}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="font-montserrat text-gray-700">الاشتراك:</span>
          <span className={`font-semibold ${isSubscribed ? 'text-green-600' : 'text-gray-600'}`}>
            {isSubscribed ? '✅ مشترك' : '⭕ غير مشترك'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-montserrat text-gray-700">الطلبات المتتبعة:</span>
          <span className="font-semibold text-blue-600">
            {trackedOrdersCount} طلب
          </span>
        </div>
      </div>

      {/* What you'll receive */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-montserrat font-semibold mb-3 text-blue-900">ماذا ستستقبل؟</h3>
        <ul className="space-y-2 font-montserrat text-sm text-blue-800">
          <li>✨ إشعار عند نزول منتجات جديدة</li>
          <li>📦 تحديثات حالة طلباتك</li>
          <li>🎁 عروض وخصومات خاصة</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {permission !== 'granted' || !isSubscribed ? (
          <button
            onClick={handleEnableNotifications}
            className="w-full bg-black text-white py-3 rounded-lg font-montserrat hover:bg-gray-800 transition-colors"
          >
            🔔 تفعيل الإشعارات
          </button>
        ) : (
          <>
            <button
              onClick={handleTestNotification}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-montserrat hover:bg-blue-700 transition-colors"
            >
              🧪 اختبار الإشعارات
            </button>
            
            <button
              onClick={handleDisableNotifications}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-montserrat hover:bg-gray-400 transition-colors"
            >
              🔕 إيقاف الإشعارات
            </button>
          </>
        )}
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="font-montserrat text-sm text-yellow-800">
          💡 <strong>ملاحظة:</strong> الإشعارات تعمل فقط عندما يكون المتصفح مفتوحاً. 
          لإيقاف الإشعارات نهائياً، يمكنك تغيير الإعدادات من متصفحك.
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;
