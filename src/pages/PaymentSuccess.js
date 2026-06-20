import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processSuccessfulPayment = async () => {
      try {
        // استخراج بيانات الدفع من URL (Paymob بيبعتهم كـ query params)
        const transactionId = searchParams.get('id');
        const success = searchParams.get('success');
        const hmac = searchParams.get('hmac');
        
        // جلب orderId المحفوظ قبل الدفع
        const orderId = searchParams.get('order') || localStorage.getItem('pendingPaymobOrderId');

        if (success !== 'true') {
          navigate('/payment-failed' + window.location.search);
          return;
        }

        if (!orderId || !transactionId) {
          console.error('Missing orderId or transactionId');
          navigate('/payment-failed');
          return;
        }

        // تأكيد الدفعة مع الخادم
        const response = await axios.post('/api/paymob/verify', {
          orderId,
          transactionId,
          hmac,
          success
        });

        if (response.data.success) {
          setOrderData(response.data.orderData);
          
          // مسح السلة والبيانات المؤقتة
          clearCart();
          localStorage.removeItem('pendingPaymobOrderId');
          
          // إضافة الطلب للطلبات المحلية
          const orders = JSON.parse(localStorage.getItem('orders') || '[]');
          const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
          
          const newOrder = {
            orderId: response.data.orderData.orderId,
            date: new Date().toISOString(),
            total: response.data.orderData.total,
            status: 'Paid',
            items: response.data.orderData.items,
            customerInfo: response.data.orderData.customer,
            paymentMethod: 'paymob',
            transactionId
          };
          
          orders.push(newOrder);
          localStorage.setItem('orders', JSON.stringify(orders));
          
          if (!myOrders.includes(response.data.orderData.orderId)) {
            myOrders.push(response.data.orderData.orderId);
            localStorage.setItem('myOrders', JSON.stringify(myOrders));
          }
          
          // إشعار بالطلب الجديد
          window.dispatchEvent(new Event('newOrder'));
        } else {
          navigate('/payment-failed');
        }
      } catch (error) {
        console.error('خطأ في معالجة الدفعة الناجحة:', error);
        navigate('/payment-failed');
      } finally {
        setLoading(false);
      }
    };

    processSuccessfulPayment();
  }, [searchParams, navigate, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-montserrat">جاري تأكيد عملية الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-playfair text-green-800 mb-4">
            🎉 تم الدفع بنجاح!
          </h1>
          
          <p className="text-green-700 font-montserrat mb-6">
            تم تأكيد طلبك ودفعتك بنجاح. ستصلك رسالة تأكيد على الإيميل قريباً.
          </p>

          {/* Order Details */}
          {orderData && (
            <div className="bg-green-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-playfair text-lg text-green-800 mb-4">تفاصيل الطلب</h3>
              
              <div className="space-y-2 font-montserrat text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الطلب:</span>
                  <span className="font-bold text-green-800">{orderData.orderId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي المبلغ:</span>
                  <span className="font-bold text-green-800">{orderData.total?.toLocaleString()} جنيه</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <span className="font-bold text-green-800">بطاقة ائتمان - Paymob</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">حالة الطلب:</span>
                  <span className="font-bold text-green-800">مؤكد ومدفوع</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-playfair text-lg text-blue-800 mb-4">معلومات التوصيل</h3>
            <div className="space-y-2 font-montserrat text-sm text-blue-700">
              <p>📦 <strong>القاهرة والجيزة:</strong> 1-2 يوم عمل</p>
              <p>🚚 <strong>باقي المحافظات:</strong> 3-5 أيام عمل</p>
              <p>🔄 <strong>سياسة الإرجاع:</strong> خلال 3 أيام من الاستلام</p>
              <p>📞 <strong>خدمة العملاء:</strong> متاحة 24/7 لأي استفسارات</p>
            </div>
          </div>

          {/* Rating Request */}
          <div className="bg-yellow-50 rounded-xl p-6 mb-8">
            <h3 className="font-playfair text-lg text-yellow-800 mb-2">⭐ ساعدنا بتقييمك</h3>
            <p className="text-yellow-700 font-montserrat text-sm mb-4">
              رأيك مهم لنا! قيم تجربتك ومنتجاتنا لمساعدة العملاء الآخرين.
            </p>
            <button
              onClick={() => navigate(`/products/${orderData?.items[0]?.productId}?scrollToReviews=true`)}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 font-montserrat text-sm transition-colors"
            >
              قيم المنتجات الآن
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/track-order')}
              className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 font-montserrat transition-colors"
            >
              تتبع الطلب
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-700 font-montserrat transition-colors"
            >
              متابعة التسوق
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 font-montserrat text-sm">
              لأي استفسارات، تواصل معنا على:
            </p>
            <p className="font-montserrat text-sm font-bold text-black mt-1">
              📱 01234567890 | 📧 info@ztaddiction.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;