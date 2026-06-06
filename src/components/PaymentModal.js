import React, { useState } from 'react';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, orderData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // إرسال طلب الدفع للسيرفر
      const response = await axios.post('/api/payment', {
        amount: orderData.totalAmount,
        orderId: orderData.orderId,
        customerInfo: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone,
          city: orderData.city,
          governorate: orderData.governorate,
          street: orderData.address,
          building: orderData.building || 'N/A',
          floor: orderData.floor || 'N/A',
          apartment: orderData.apartment || 'N/A'
        }
      });

      if (response.data.success) {
        // فتح صفحة الدفع في نافذة جديدة أو iframe
        window.location.href = response.data.paymentUrl;
      } else {
        setError('فشل في إنشاء طلب الدفع');
      }
    } catch (err) {
      console.error('خطأ في الدفع:', err);
      setError('حدث خطأ في معالجة الدفع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-right">إتمام الدفع</h2>
        
        <div className="mb-6 text-right">
          <p className="text-gray-600 mb-2">المبلغ الإجمالي:</p>
          <p className="text-3xl font-bold text-green-600">
            {orderData.totalAmount} جنيه
          </p>
        </div>

        <div className="mb-6 text-right">
          <p className="text-sm text-gray-600 mb-3">طرق الدفع المتاحة:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm">بطاقات الائتمان</span>
              <span>💳</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm">المحافظ الإلكترونية</span>
              <span>📱</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm">Fawry</span>
              <span>🏪</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-right">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'الدفع الآن'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 الدفع آمن ومشفر بواسطة Paymob
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
