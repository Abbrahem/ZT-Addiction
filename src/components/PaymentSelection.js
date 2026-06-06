import React, { useState } from 'react';

const PaymentSelection = ({ onSubmit, loading }) => {
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleSubmitClick = () => {
    if (selectedMethod) {
      onSubmit(selectedMethod);
    }
  };

  return (
    <div>
      {/* Payment Options */}
      <div className="space-y-3 mb-6">
        {/* Online Payment Option */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'online'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Hidden native radio input */}
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={selectedMethod === 'online'}
              onChange={() => handleSelect('online')}
              disabled={loading}
              className="sr-only"
            />
            
            {/* Custom Radio Button */}
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'online' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'online' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">
                Pay via Credit Cards / Wallets
              </span>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>
          </label>

          {/* Dropdown info for online payment */}
          {selectedMethod === 'online' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                You'll be redirected to complete your purchase via Credit Cards or Wallets
              </p>
            </div>
          )}
        </div>

        {/* Cash on Delivery Option */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'cod'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Hidden native radio input */}
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={selectedMethod === 'cod'}
              onChange={() => handleSelect('cod')}
              disabled={loading}
              className="sr-only"
            />
            
            {/* Custom Radio Button */}
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'cod' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'cod' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">
                Cash on Delivery
              </span>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
          </label>

          {/* Dropdown info for COD */}
          {selectedMethod === 'cod' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                برجاء طلب الأوردر برقم عليه الواتساب علشان نقدر نتواصل معاك عشان نأكد الأوردر
              </p>
            </div>
          )}
        </div>

        {/* InstaPay Option */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'instapay'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Hidden native radio input */}
            <input
              type="radio"
              name="paymentMethod"
              value="instapay"
              checked={selectedMethod === 'instapay'}
              onChange={() => handleSelect('instapay')}
              disabled={loading}
              className="sr-only"
            />
            
            {/* Custom Radio Button */}
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'instapay' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'instapay' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">
                InstaPay
              </span>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
            </div>
          </label>

          {/* Dropdown info for InstaPay */}
          {selectedMethod === 'instapay' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                Transfer via InstaPay and upload payment screenshot
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {selectedMethod ? (
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-montserrat font-medium text-sm transition-all duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'
          } bg-black text-white`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span>
              {selectedMethod === 'online' ? 'Pay Now' : selectedMethod === 'instapay' ? 'Pay Now' : 'Complete Order'}
            </span>
          )}
        </button>
      ) : (
        <div className="text-center py-3 text-xs text-gray-400 font-montserrat">
          Please select a payment method above
        </div>
      )}
    </div>
  );
};

export default PaymentSelection;
