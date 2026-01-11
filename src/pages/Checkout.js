import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone1: '',
    phone2: ''
  });
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Payment method state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    senderPhone: '',
    screenshot: null
  });

  const paymentMethods = [
    { id: 'vodafone', name: 'Vodafone Cash', image: '/vodafone-cash.png', phone: '01003019300' },
    { id: 'instapay', name: 'InstaPay', image: '/instapay.png', phone: '01228982199' },
    { id: 'orange', name: 'Orange Cash', image: '/orange-cash.png', phone: '01228982199' },
    { id: 'telda', name: 'Telda', image: '/telda.png', phone: '01272558833' }
  ];

  const shippingFee = 100;
  const subtotal = getCartTotal();
  const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.discount / 100)) : 0;
  const total = subtotal + (items.length > 0 ? shippingFee : 0) - discount;

  const validateForm = () => {
    const { fullName, address, phone1, phone2 } = formData;
    
    if (!fullName.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your full name' });
      return false;
    }
    
    if (!address.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your address' });
      return false;
    }
    
    if (!phone1.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your first phone number' });
      return false;
    }
    
    if (!phone2.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your second phone number' });
      return false;
    }
    
    if (phone1.length !== 11) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Phone 1 must be exactly 11 digits' });
      return false;
    }
    
    if (phone2.length !== 11) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Phone 2 must be exactly 11 digits' });
      return false;
    }
    
    if (phone1 === phone2) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Phone numbers must be different' });
      return false;
    }
    
    return true;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Swal.fire({ icon: 'warning', title: 'Enter Code', text: 'Please enter a promo code' });
      return;
    }
    
    setPromoLoading(true);
    try {
      const response = await axios.patch('/api/promo', { code: promoCode.toUpperCase() });
      setAppliedPromo(response.data);
      Swal.fire({
        icon: 'success',
        title: 'Promo Applied!',
        text: `You saved ${response.data.discount}%`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: error.response?.data?.message || 'This promo code is not valid'
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const handlePaymentMethodClick = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
    setPaymentData({ amount: '', senderPhone: '', screenshot: null });
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentData(prev => ({ ...prev, screenshot: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Phone number copied to clipboard',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handlePaymentSubmit = async () => {
    if (!paymentData.amount || !paymentData.senderPhone || !paymentData.screenshot) {
      Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Please fill all fields and upload screenshot' });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          isBundle: item.isBundle || false,
          bundleDetails: item.bundleDetails || null
        })),
        customer: {
          name: formData.fullName,
          address: formData.address,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total,
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount,
        payment: {
          method: selectedPaymentMethod.id,
          methodName: selectedPaymentMethod.name,
          amount: paymentData.amount,
          senderPhone: paymentData.senderPhone,
          screenshot: paymentData.screenshot
        }
      };

      console.log('Sending order with payment:', orderData.payment);
      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.orderId;
      
      clearCart();
      setShowPaymentModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        html: `
          <p>Your order has been placed successfully!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <br>
          <p><strong>Payment Method:</strong> ${selectedPaymentMethod.name}</p>
          <br>
          <p><strong>Delivery Information:</strong></p>
          <p>• Cairo & Giza: 2 day</p>
          <p>• Other governorates: 3-5 days</p>
          <br>
          <p><strong>Return Policy:</strong> 3 days</p>
        `,
        confirmButtonText: 'Continue Shopping'
      }).then(() => {
        navigate('/');
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: 'There was an error placing your order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      Swal.fire({ icon: 'error', title: 'Empty Cart', text: 'Your cart is empty' });
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          isBundle: item.isBundle || false,
          bundleDetails: item.bundleDetails || null
        })),
        customer: {
          name: formData.fullName,
          address: formData.address,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total,
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.orderId;
      
      clearCart();
      
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        html: `
          <p>Your order has been placed successfully!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <br>
          <p><strong>Delivery Information:</strong></p>
          <p>• Cairo & Giza: 2 day</p>
          <p>• Other governorates: 3-5 days</p>
          <br>
          <p><strong>Return Policy:</strong> 3 days</p>
          <br>
          <p><em>Please save your Order ID for future reference</em></p>
        `,
        confirmButtonText: 'Continue Shopping'
      }).then(() => {
        navigate('/');
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: 'There was an error placing your order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone1' || name === 'phone2') {
      const digits = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digits }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-24 bg-beige-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-playfair mb-12 text-black">Checkout</h1>
          <div className="py-16">
            <p className="text-xl font-montserrat text-gray-600 mb-8">Your cart is empty</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-beige-50">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-playfair mb-12 text-black text-center">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-white p-6 mb-8">
          <h2 className="text-xl font-playfair mb-6 text-black">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-montserrat font-medium text-black">{item.name}</p>
                  <p className="text-sm font-montserrat text-gray-600">
                    Size: {item.size} | Qty: {item.quantity}
                  </p>
                  <p className="font-montserrat font-semibold text-black">{(item.price * item.quantity).toLocaleString()} EGP</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-beige-300 mb-4" />

          <div className="space-y-2 font-montserrat">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{subtotal.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{shippingFee} EGP</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-green-600">
                <span>Promo ({appliedPromo.code}):</span>
                <span>-{discount.toLocaleString()} EGP ({appliedPromo.discount}%)</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span>{total.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="mt-6 pt-6 border-t border-beige-300">
            <h3 className="font-montserrat font-semibold mb-3">Have a Promo Code?</h3>
            {!appliedPromo ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="input-field flex-1 font-montserrat"
                  maxLength="10"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading}
                  className={`bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-montserrat ${promoLoading ? 'opacity-50' : ''}`}
                >
                  {promoLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-montserrat font-semibold text-green-700">
                    {appliedPromo.code} Applied!
                  </p>
                  <p className="text-sm text-green-600">
                    You're saving {appliedPromo.discount}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-red-500 hover:text-red-700 font-montserrat text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information Form */}
        <div className="bg-white p-6 mb-8">
          <h2 className="text-xl font-playfair mb-6 text-black">Personal Information</h2>
          
          <div className="space-y-6">
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input-field font-montserrat"
                placeholder="Full Name"
                required
              />
            </div>

            <div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field font-montserrat"
                rows="3"
                placeholder="Complete Address"
                required
              />
            </div>

            <div>
              <input
                type="tel"
                name="phone1"
                value={formData.phone1}
                onChange={handleInputChange}
                className="input-field font-montserrat"
                placeholder="Phone Number 1 (11 digits)"
                maxLength="11"
                required
              />
            </div>

            <div>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleInputChange}
                className="input-field font-montserrat"
                placeholder="Phone Number 2 (11 digits)"
                maxLength="11"
                required
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Cash on Delivery'}
            </button>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white p-6">
          <h2 className="text-xl font-playfair mb-6 text-black text-center">Online Payment (Optional)</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodClick(method)}
                className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 transition-all flex flex-col items-center"
              >
                <div className="w-20 h-20 mb-2 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                  <img
                    src={method.image}
                    alt={method.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OWEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXltZW50PC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                <span className="font-montserrat text-sm font-medium text-black">{method.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPaymentMethod && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white z-50 p-6 rounded-2xl max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-black hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-playfair text-xl mb-6 text-center">{selectedPaymentMethod.name}</h3>

            {/* Transfer Number */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="font-montserrat text-sm text-gray-600 mb-2 text-center">يرجى التحويل على الرقم</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-montserrat text-xl font-bold">{selectedPaymentMethod.phone}</span>
                <button
                  onClick={() => copyToClipboard(selectedPaymentMethod.phone)}
                  className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2 font-montserrat">المبلغ المحول</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  className="input-field font-montserrat"
                  placeholder="Enter amount"
                />
              </div>

              {/* Sender Phone */}
              <div>
                <label className="block text-sm font-medium mb-2 font-montserrat">الرقم المحول منه</label>
                <input
                  type="tel"
                  value={paymentData.senderPhone}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, senderPhone: e.target.value.replace(/\D/g, '') }))}
                  className="input-field font-montserrat"
                  placeholder="Enter sender phone"
                  maxLength="11"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 font-montserrat">اسكرين شوت للتحويل</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="input-field font-montserrat"
                />
                {paymentData.screenshot && (
                  <div className="mt-2">
                    <img
                      src={paymentData.screenshot}
                      alt="Screenshot"
                      className="w-full h-32 object-contain rounded border"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={loading}
                className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="py-12 text-center mt-20">
        <h2 className="text-2xl font-playfair mb-2 text-black">ZT ADDICTION</h2>
        <p className="text-sm font-montserrat text-black mb-1">© 2025</p>
        <p className="text-sm font-montserrat text-black mb-6">Privacy Policy & Terms</p>
        
        <div className="flex justify-center gap-6">
          <a href="https://wa.me/201272558833" target="_blank" rel="noopener noreferrer" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.05.547 4.063 1.587 5.814L0 24l6.352-1.529C8.937 23.453 10.938 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.701 0-3.361-.423-4.858-1.223l-.348-.2-3.613.87.886-3.532-.23-.365C2.163 15.714 1.818 13.9 1.818 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.521-7.5c-.301-.15-1.784-.882-2.063-.982-.279-.1-.482-.15-.682.15-.2.3-.776.982-.951 1.182-.175.2-.351.225-.652.075-.3-.15-1.263-.466-2.406-1.485-.889-.794-1.488-1.775-1.663-2.075-.175-.3-.019-.461.131-.61.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.682-1.625-.935-2.225-.245-.585-.491-.506-.682-.515-.176-.008-.376-.01-.576-.01-.2 0-.525.075-.8.375-.275.3-1.051 1.025-1.051 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.113 3.231 5.125 4.531.716.306 1.275.489 1.71.625.72.23 1.375.198 1.892.12.577-.092 1.776-.726 2.026-1.427.25-.701.25-1.3.175-1.427-.075-.127-.276-.2-.576-.35z"/>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@zt.adicction?_r=1&_t=ZS-91QoCydFGgZ" target="_blank" rel="noopener noreferrer" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
