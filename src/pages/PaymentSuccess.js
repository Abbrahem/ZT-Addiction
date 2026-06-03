import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      // Get payment parameters from URL
      const success = searchParams.get('success');
      const orderId = searchParams.get('merchant_order_id');
      const transactionId = searchParams.get('id');
      const amount = searchParams.get('amount_cents');

      // Wait a bit for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessing(false);

      if (success === 'true') {
        // Payment successful
        Swal.fire({
          icon: 'success',
          title: '✅ تم الدفع بنجاح!',
          html: `
            <div class="text-right" dir="rtl">
              <p class="mb-3">تم استلام طلبك وتأكيد الدفع بنجاح</p>
              ${orderId ? `<p class="mb-2"><strong>رقم الطلب:</strong> ${orderId}</p>` : ''}
              ${transactionId ? `<p class="mb-2"><strong>رقم المعاملة:</strong> ${transactionId}</p>` : ''}
              ${amount ? `<p class="mb-2"><strong>المبلغ:</strong> ${(amount / 100).toFixed(2)} جنيه</p>` : ''}
              <hr class="my-4" />
              <p class="text-sm text-gray-600">
                <strong>معلومات التوصيل:</strong><br/>
                • القاهرة والجيزة: يومين<br/>
                • باقي المحافظات: 3-5 أيام<br/>
                • سياسة الاسترجاع: 3 أيام
              </p>
              <p class="text-sm text-gray-600 mt-3">
                سيتم إرسال تفاصيل الطلب على بريدك الإلكتروني
              </p>
            </div>
          `,
          confirmButtonText: 'العودة للرئيسية',
          confirmButtonColor: '#000'
        }).then(() => {
          navigate('/');
        });
      } else {
        // Payment failed
        const errorMessage = searchParams.get('error') || 'حدث خطأ في عملية الدفع';
        
        Swal.fire({
          icon: 'error',
          title: '❌ فشل الدفع',
          html: `
            <div class="text-right" dir="rtl">
              <p class="mb-3">${errorMessage}</p>
              <p class="text-sm text-gray-600">
                يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى
              </p>
            </div>
          `,
          showDenyButton: true,
          confirmButtonText: 'حاول مرة أخرى',
          denyButtonText: 'العودة للرئيسية',
          confirmButtonColor: '#000',
          denyButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/checkout');
          } else {
            navigate('/');
          }
        });
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-black mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-xl font-playfair text-black">جاري معالجة الدفع...</p>
          <p className="mt-2 text-sm font-montserrat text-gray-600">الرجاء الانتظار</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess;
