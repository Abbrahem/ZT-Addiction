import React, { useEffect, useRef } from 'react';

const PaymobModal = ({ isOpen, onClose, paymentUrl }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !paymentUrl) return;

    const handleMessage = (event) => {
      // Paymob بيبعت postMessage بعد الدفع
      const data = event.data;
      if (!data) return;

      console.log('📨 Paymob message:', data);

      // Paymob بيبعت object بعد إتمام الدفع
      if (typeof data === 'object') {
        if (data.type === 'paymob' || data.success !== undefined) {
          if (data.success === true || data.success === 'true') {
            const params = new URLSearchParams({
              success: 'true',
              id: data.id || data.txn_response_code || '',
              order: data.order?.merchant_order_id || ''
            });
            window.location.href = `/payment-success?${params.toString()}`;
          } else {
            window.location.href = '/payment-failed?success=false';
          }
        }
      }

      // بعض إصدارات Paymob بتبعت string
      if (typeof data === 'string') {
        if (data.includes('success')) {
          window.location.href = '/payment-success';
        } else if (data.includes('fail') || data.includes('error')) {
          window.location.href = '/payment-failed?success=false';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, paymentUrl]);

  if (!isOpen) return null;

  const handleManualClose = () => {
    const confirmClose = window.confirm('هل أنت متأكد من إغلاق نافذة الدفع؟');
    if (confirmClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full md:w-11/12 md:h-5/6 md:max-w-4xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-playfair font-bold text-black">💳 الدفع الآمن - Paymob</h3>
              <p className="text-xs text-gray-600 font-montserrat">🔒 اتصال آمن ومشفر</p>
            </div>
          </div>
          <button
            onClick={handleManualClose}
            className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Info Bar */}
        <div className="bg-blue-50 px-4 py-2 mx-4 mt-2 rounded-lg">
          <p className="text-blue-800 text-xs font-montserrat">
            💡 أدخل بيانات البطاقة في النموذج أدناه لإتمام الدفع
          </p>
        </div>

        {/* Iframe */}
        <div className="flex-1 p-4">
          {paymentUrl ? (
            <iframe
              ref={iframeRef}
              src={paymentUrl}
              className="w-full h-full border border-gray-200 rounded-lg"
              title="Paymob Payment"
              allow="payment"
              onLoad={() => console.log('✅ Paymob iframe loaded')}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-montserrat">جاري تحضير نموذج الدفع...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center text-xs text-gray-500 font-montserrat">
            <div className="flex items-center gap-3">
              <span>🔒 SSL مشفر</span>
              <span>🏦 معتمد CBE</span>
              <span>💳 Visa / MasterCard / Meeza</span>
            </div>
            <span className="text-blue-500">Powered by Paymob</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymobModal;