import React, { useEffect } from 'react';

const PaymobModal = ({ isOpen, onClose, paymentUrl }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg"
        aria-label="إغلاق"
      >
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Modal - Smaller size */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl h-[85vh] sm:h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        <iframe
          src={paymentUrl}
          className="w-full h-full"
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title="Paymob Payment"
          allow="payment"
        />
      </div>
    </div>
  );
};

export default PaymobModal;
