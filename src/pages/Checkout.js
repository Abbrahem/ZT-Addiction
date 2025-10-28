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
          image: item.image
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
    
    // For phone fields, only allow digits
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
        <div className="bg-white p-6">
          <h2 className="text-xl font-playfair mb-6 text-black">Personal Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Payment Instructions */}
            <div className="bg-amber-900 text-white p-4 rounded-lg mb-4">
              <p className="font-montserrat text-sm leading-relaxed text-center">
                للدفع إنستا باي أو فودافون كاش او تيلدا او اورنج كاش يرجى التواصل مع الرقم <strong className="text-amber-200">01272558833</strong> على الواتساب
              </p>
            </div>                                                                                                                                                               

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Buy It'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center mt-20">
        <h2 className="text-2xl font-playfair mb-2 text-black">ZT ADDICTION</h2>
        <p className="text-sm font-montserrat text-black mb-1">© 2025</p>
        <p className="text-sm font-montserrat text-black">Privacy Policy & Terms</p>
      </footer>
    </div>
  );
};

export default Checkout;
