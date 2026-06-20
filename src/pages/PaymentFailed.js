import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // تسجيل فشل الدفعة للمتابعة والتحليل
    const logFailedPayment = async () => {
      try {
        const orderId = searchParams.get('order');
        const transactionId = searchParams.get('id');
        const success = searchParams.get('success');
        const errorMessage = searchParams.get('error');

        console.log('❌ Payment failed:', {
          orderId,
          transactionId,
          success,
          errorMessage
        });

        // إرسال بيانات الفشل للخادم للمتابعة
        // await axios.post('/api/paymob/failed', {
        //   orderId,
        //   transactionId,
        //   errorMessage,
        //   timestamp: new Date().toISOString()
        // });
      } catch (error) {
        console.error('خطأ في تسجيل فشل الدفعة:', error);
      }
    };

    logFailedPayment();
  }, [searchParams]);

  const getFailureReason = () => {
    const success = searchParams.get('success');
    const errorMessage = searchParams.get('error');
    
    if (success === 'false') {
      return 'تم إلغاء عملية الدفع أو رفضها من البنك';
    }
    
    if (errorMessage) {
      return decodeURIComponent(errorMessage);
    }
    
    return 'حدث خطأ غير متوقع أثناء عملية الدفع';
  };

  const handleRetryPayment = () => {
    // العودة لصفحة الـ checkout لإعادة المحاولة
    navigate('/checkout');
  };

  const handleContactSupport = () => {
    // التوجه لصفحة التواصل أو فتح الواتساب
    window.open('https://wa.me/201234567890?text=أحتاج مساعدة في عملية الدفع', '_blank');
  };

  return (
    <div className="min-h-screen bg-red-50 py-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Failed Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          {/* Failed Message */}
          <h1 className="text-3xl font-playfair text-red-800 mb-4">
            ❌ فشل في عملية الدفع
          </h1>
          
          <p className="text-red-700 font-montserrat mb-6">
            عذراً، لم تتم عملية الدفع بنجاح. لا تقلق، لم يتم خصم أي مبلغ من حسابك.
          </p>

          {/* Failure Reason */}
          <div className="bg-red-50 rounded-xl p-6 mb-6">
            <h3 className="font-playfair text-lg text-red-800 mb-2">سبب الفشل</h3>
            <p className="text-red-700 font-montserrat text-sm">
              {getFailureReason()}
            </p>
          </div>

          {/* Solutions */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-playfair text-lg text-blue-800 mb-4">💡 الحلول المقترحة</h3>
            <ul className="space-y-2 font-montserrat text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>تأكد من صحة بيانات البطاقة (رقم البطاقة، تاريخ الانتهاء، CVV)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>تأكد من توفر رصيد كافي في البطاقة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>تأكد من تفعيل المشتريات الإلكترونية على البطاقة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>جرب استخدام بطاقة أخرى أو طريقة دفع مختلفة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>تواصل مع البنك الخاص بك للتأكد من عدم وجود قيود</span>
              </li>
            </ul>
          </div>

          {/* Alternative Payment Methods */}
          <div className="bg-green-50 rounded-xl p-6 mb-8">
            <h3 className="font-playfair text-lg text-green-800 mb-4">💳 طرق دفع بديلة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-montserrat">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-green-700 font-bold">💰 الدفع عند الاستلام</p>
                <p className="text-green-600 text-xs mt-1">ادفع عند وصول الطلب</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-green-700 font-bold">📱 InstaPay</p>
                <p className="text-green-600 text-xs mt-1">تحويل فوري آمن</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-green-700 font-bold">📲 فودافون كاش</p>
                <p className="text-green-600 text-xs mt-1">محفظة إلكترونية</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-green-700 font-bold">🍊 أورانج كاش</p>
                <p className="text-green-600 text-xs mt-1">محفظة إلكترونية</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 font-montserrat text-lg transition-colors"
            >
              🔄 إعادة المحاولة
            </button>
            
            <div className="flex gap-4">
              <button
                onClick={handleContactSupport}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-montserrat transition-colors"
              >
                💬 تواصل معنا
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 font-montserrat transition-colors"
              >
                🏠 العودة للرئيسية
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-playfair text-lg mb-3">🆘 تحتاج مساعدة؟</h4>
            <div className="space-y-2 text-sm font-montserrat text-gray-600">
              <p>📞 <strong>هاتف:</strong> 01234567890 (متاح 24/7)</p>
              <p>📧 <strong>إيميل:</strong> support@ztaddiction.com</p>
              <p>💬 <strong>واتساب:</strong> اضغط "تواصل معنا" للمساعدة الفورية</p>
              <p>⏰ <strong>وقت الرد:</strong> خلال 5 دقائق في أوقات العمل</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;