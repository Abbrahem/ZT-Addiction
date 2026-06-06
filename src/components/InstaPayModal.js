import React, { useState } from 'react';

const InstaPayModal = ({ isOpen, onClose, onSubmit, total }) => {
  const [senderPhone, setSenderPhone] = useState('');
  const [amount, setAmount] = useState(total);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!senderPhone || !screenshot) {
      alert('Please fill all fields and upload screenshot');
      return;
    }

    if (senderPhone.length !== 11) {
      alert('Phone number must be 11 digits');
      return;
    }

    setLoading(true);
    
    try {
      const base64Screenshot = await convertToBase64(screenshot);
      
      await onSubmit({
        senderPhone,
        amount,
        screenshot: base64Screenshot
      });
      
      // Reset form
      setSenderPhone('');
      setAmount(total);
      setScreenshot(null);
      setScreenshotPreview('');
      onClose();
    } catch (error) {
      console.error('Error submitting InstaPay:', error);
      alert('Error submitting payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-playfair text-black">InstaPay Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* InstaPay Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-montserrat font-semibold text-black mb-2">How to Pay:</h3>
            <ol className="text-sm font-montserrat text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open your InstaPay app</li>
              <li>Send <strong>{total} EGP</strong> to: <strong className="text-black">01272558833</strong></li>
              <li>Take a screenshot of the confirmation</li>
              <li>Upload it below and submit</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sender Phone */}
            <div>
              <label className="block text-sm font-montserrat font-medium text-black mb-2">
                Your Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="01XXXXXXXXX"
                maxLength="11"
                className="input-field font-montserrat text-sm"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 font-montserrat">
                The phone number you sent the payment from
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-montserrat font-medium text-black mb-2">
                Amount (EGP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                readOnly
                className="input-field font-montserrat text-sm bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-montserrat font-medium text-black mb-2">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
                required
                disabled={loading}
              />
              <label
                htmlFor="screenshot-upload"
                className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'
                } ${screenshotPreview ? 'border-green-500' : 'border-gray-300'}`}
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-montserrat text-gray-600">
                  {screenshot ? screenshot.name : 'Click to upload screenshot'}
                </span>
              </label>
            </div>

            {/* Screenshot Preview */}
            {screenshotPreview && (
              <div className="mt-4">
                <p className="text-sm font-montserrat font-medium text-black mb-2">Preview:</p>
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-64 object-contain border border-gray-200 rounded-lg"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !screenshot || !senderPhone}
              className={`w-full py-3.5 rounded-xl font-montserrat font-medium text-sm transition-all duration-200 ${
                loading || !screenshot || !senderPhone
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:shadow-md active:scale-[0.98]'
              }`}
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
                'Complete Order'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstaPayModal;
