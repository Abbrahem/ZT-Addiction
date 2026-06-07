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
        {/* Paymob Payment Option - Coming Soon */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'paymob'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Hidden native radio input */}
            <input
              type="radio"
              name="paymentMethod"
              value="paymob"
              checked={selectedMethod === 'paymob'}
              onChange={() => handleSelect('paymob')}
              disabled={loading}
              className="sr-only"
            />
            
            {/* Custom Radio Button */}
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'paymob' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'paymob' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">
                Pay via Credit Cards / Wallets
              </span>
            </div>
          </label>

          {/* Dropdown info for paymob payment */}
          {selectedMethod === 'paymob' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                انتظر قريباً سوف تتوفر وسيلة الدفع هذه
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
            <input
              type="radio"
              name="paymentMethod"
              value="instapay"
              checked={selectedMethod === 'instapay'}
              onChange={() => handleSelect('instapay')}
              disabled={loading}
              className="sr-only"
            />
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
              <span className="font-montserrat text-sm font-medium text-black">InstaPay</span>
            </div>
          </label>
          {selectedMethod === 'instapay' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                Transfer via InstaPay and upload payment screenshot
              </p>
            </div>
          )}
        </div>

        {/* Vodafone Cash Option */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'vodafone'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="vodafone"
              checked={selectedMethod === 'vodafone'}
              onChange={() => handleSelect('vodafone')}
              disabled={loading}
              className="sr-only"
            />
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'vodafone' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'vodafone' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">Vodafone Cash</span>
            </div>
          </label>
          {selectedMethod === 'vodafone' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                Transfer via Vodafone Cash and upload payment screenshot
              </p>
            </div>
          )}
        </div>

        {/* Orange Cash Option */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'orange'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="orange"
              checked={selectedMethod === 'orange'}
              onChange={() => handleSelect('orange')}
              disabled={loading}
              className="sr-only"
            />
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'orange' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'orange' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">Orange Cash</span>
            </div>
          </label>
          {selectedMethod === 'orange' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                Transfer via Orange Cash and upload payment screenshot
              </p>
            </div>
          )}
        </div>

        {/* Telda Option */}
        <div className="w-full">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === 'telda'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="telda"
              checked={selectedMethod === 'telda'}
              onChange={() => handleSelect('telda')}
              disabled={loading}
              className="sr-only"
            />
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selectedMethod === 'telda' 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-white'
            }`}>
              {selectedMethod === 'telda' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="font-montserrat text-sm font-medium text-black">Telda</span>
            </div>
          </label>
          {selectedMethod === 'telda' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2 animate-fadeIn">
              <p className="text-xs font-montserrat text-gray-700 leading-relaxed">
                Transfer via Telda and upload payment screenshot
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
              {selectedMethod === 'paymob' ? 'Pay Now' : 
               selectedMethod === 'instapay' ? 'Pay Now' :
               selectedMethod === 'vodafone' ? 'Pay Now' :
               selectedMethod === 'orange' ? 'Pay Now' :
               selectedMethod === 'telda' ? 'Pay Now' : 'Complete Order'}
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
