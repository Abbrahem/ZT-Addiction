import React from 'react';
import NotificationSettings from '../components/NotificationSettings';
import Swal from 'sweetalert2';
import { requestFCMToken } from '../firebase-config';

const Settings = () => {
  const handleResetNotifications = async () => {
    const result = await Swal.fire({
      title: '🔄 إعادة تفعيل الإشعارات',
      html: `
        <p>سيتم إعادة طلب إذن الإشعارات</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">
          إذا رفضت الإشعارات سابقاً، قد تحتاج لتفعيلها من إعدادات المتصفح
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'إعادة التفعيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#000'
    });

    if (result.isConfirmed) {
      try {
        // Clear the flag
        localStorage.removeItem('notificationAsked');
        localStorage.removeItem('notificationSubscribed');
        
        // Request permission again
        const token = await requestFCMToken();
        
        if (token) {
          Swal.fire({
            icon: 'success',
            title: 'تم التفعيل!',
            text: 'تم تفعيل الإشعارات بنجاح',
            confirmButtonColor: '#000'
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'تنبيه',
            html: `
              <p>لم يتم تفعيل الإشعارات</p>
              <p style="color: #666; font-size: 14px; margin-top: 10px;">
                قد تحتاج لتفعيلها من إعدادات المتصفح:<br>
                الإعدادات → الخصوصية → أذونات الموقع → الإشعارات
              </p>
            `,
            confirmButtonColor: '#000'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء تفعيل الإشعارات',
          confirmButtonColor: '#000'
        });
      }
    }
  };

  const handleClearData = () => {
    Swal.fire({
      title: '⚠️ مسح البيانات',
      text: 'هل تريد مسح جميع البيانات المحفوظة؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'مسح',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          icon: 'success',
          title: 'تم المسح',
          text: 'تم مسح جميع البيانات بنجاح',
          confirmButtonColor: '#000'
        }).then(() => {
          window.location.reload();
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-beige-50 py-24 px-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-playfair text-center mb-12 text-black">الإعدادات</h1>
        
        <NotificationSettings />
        
        {/* Additional Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">إعدادات الإشعارات</h2>
          
          <button
            onClick={handleResetNotifications}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium mb-3"
          >
            🔔 إعادة تفعيل الإشعارات
          </button>
          
          <p className="text-sm text-gray-600 mb-6">
            إذا رفضت الإشعارات بالخطأ، استخدم هذا الزر لإعادة طلب الإذن
          </p>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">منطقة الخطر</h2>
          
          <button
            onClick={handleClearData}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🗑️ مسح جميع البيانات
          </button>
          
          <p className="text-sm text-gray-600 mt-3">
            سيتم مسح جميع الطلبات والإشعارات والبيانات المحفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
