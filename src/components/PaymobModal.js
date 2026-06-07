import React from 'react';

const PaymobModal = ({ isOpen, onClose, paymentUrl }) => {
  if (!isOpen) return null;

  const handleComingSoon = () => {
    alert('ستتوفر قريباً! نعمل على تفعيل هذه الخدمة');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
        <div className="text-center">
          <h3 className="text-xl font-playfair mb-4 text-black">
            دفع أونلاين - Paymob
          </h3>
          
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-montserrat text-sm">
                ⚠️ هذه الخدمة ستتوفر قريباً
              </p>
            </div>
            
            <p className="text-gray-600 font-montserrat text-sm mb-4">
              نعمل حالياً على تفعيل الدفع الإلكتروني عبر بطاقات الائتمان والمحافظ الإلكترونية.
            </p>
            
            <p className="text-gray-800 font-montserrat text-sm">
              يرجى استخدام طرق الدفع الأخرى المتاحة في الوقت الحالي.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleComingSoon}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-montserrat hover:bg-gray-700"
            >
              حسناً
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-montserrat hover:bg-gray-800"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymobModal;