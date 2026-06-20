import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import InstaPayModal from '../components/InstaPayModal';
import WalletModal from '../components/WalletModal';
import PaymobModal from '../components/PaymobModal';
import PaymentSelection from '../components/PaymentSelection';
import Footer from '../components/Footer';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    government: '',
    phone1: '',
    phone2: ''
  });
  const [saveInfo, setSaveInfo] = useState(false);
  
  // Paymob Modal state
  const [showPaymobModal, setShowPaymobModal] = useState(false);
  const [paymobUrl, setPaymobUrl] = useState('');
  
  // InstaPay Modal state
  const [showInstaPayModal, setShowInstaPayModal] = useState(false);
  
  // Wallet Modal states
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState('');
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const shippingFee = 110;
  const subtotal = getCartTotal();
  const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.discount / 100)) : 0;
  const total = subtotal + (items.length > 0 ? shippingFee : 0) - discount;

  // Load saved info on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const savedInfo = localStorage.getItem('checkoutInfo');
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      setFormData(parsed);
      setSaveInfo(true);
    }

    // Request FCM token for customer notifications
    const setupCustomerNotifications = async () => {
      try {
        const { requestFCMToken } = await import('../firebase-config');
        const token = await requestFCMToken();
        
        if (token) {
          console.log('✅ Customer FCM token:', token.substring(0, 20) + '...');
          localStorage.setItem('fcmToken', token);
          
          await axios.post('/api/orders/save-fcm-token', {
            token,
            userType: 'customer'
          });
        }
      } catch (error) {
        console.error('❌ Error setting up customer notifications:', error);
      }
    };
    
    setupCustomerNotifications();
  }, []);

  // Handle Paymob Payment
  const handlePaymobPayment = async () => {
    if (!validateForm()) return;

    if (saveInfo) {
      localStorage.setItem('checkoutInfo', JSON.stringify(formData));
    } else {
      localStorage.removeItem('checkoutInfo');
    }

    setLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // أولاً: احفظ الأوردر في DB بحالة pending
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
          email: formData.email,
          address: formData.address,
          government: formData.government,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total,
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount,
        customerToken: localStorage.getItem('fcmToken') || null,
        paymentMethod: 'paymob',
        status: 'Pending Payment'
      };

      const orderResponse = await axios.post('/api/orders', orderData);
      const savedOrderId = orderResponse.data.orderId;

      // ثانياً: ابدأ عملية الدفع مع Paymob
      const paymentResponse = await axios.post('/api/paymob', {
        amount: total,
        orderId: savedOrderId,
        customerInfo: {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone1,
          city: formData.government || 'Cairo',
          governorate: formData.government || 'Cairo',
          street: formData.address,
          building: 'N/A',
          floor: 'N/A',
          apartment: 'N/A'
        }
      });

      if (paymentResponse.data.success) {
        // حفظ orderId محلياً للرجوع إليه
        localStorage.setItem('pendingPaymobOrderId', savedOrderId);
        setPaymobUrl(paymentResponse.data.paymentUrl);
        setShowPaymobModal(true);
      } else {
        throw new Error('فشل في إنشاء طلب الدفع');
      }
    } catch (error) {
      console.error('خطأ في الدفع:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ في الدفع',
        text: error.response?.data?.message || 'حدث خطأ في معالجة الدفع. حاول مرة أخرى.'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { fullName, email, address, government, phone1, phone2 } = formData;
    
    if (!fullName?.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your full name' });
      return false;
    }
    
    if (!email?.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your email' });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid email address' });
      return false;
    }
    
    if (!address?.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your address' });
      return false;
    }
    
    if (!government?.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please select your government' });
      return false;
    }
    
    if (!phone1?.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your first phone number' });
      return false;
    }
    
    if (!phone2?.trim()) {
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
    
    // ✅ التحقق: الخصم يشتغل بس على Samples فقط (Summer Samples و Winter Samples)
    const hasNonSamples = items.some(item => {
      const collection = item.collection?.toLowerCase() || '';
      // الخصم يشتغل فقط على Summer Samples و Winter Samples
      // أي حاجة تانية (Bottles, Bundles, Quantities With Bottle) مش مسموحة
      return collection !== 'summer samples' && collection !== 'winter samples';
    });
    
    if (hasNonSamples) {
      Swal.fire({
        icon: 'error',
        title: 'Samples Only',
        text: 'Promo codes only work on Samples (Summer/Winter). Please remove other items.',
        confirmButtonColor: '#000'
      });
      return;
    }
    
    setPromoLoading(true);
    try {
      const response = await axios.patch('/api/orders/promo', { code: promoCode.toUpperCase() });
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

  const handleSubmit = async (selectedPaymentMethod) => {
    if (items.length === 0) {
      Swal.fire({ icon: 'error', title: 'Empty Cart', text: 'Your cart is empty' });
      return;
    }
    
    if (!selectedPaymentMethod) {
      Swal.fire({ icon: 'error', title: 'Select Payment', text: 'Please select a payment method' });
      return;
    }
    
    if (!validateForm()) return;
    
    // لو اختار Paymob Payment - تفعيل الدفع الفعلي
    if (selectedPaymentMethod === 'paymob') {
      await handlePaymobPayment();
      return;
    }
    
    // لو اختار Online Payment
    if (selectedPaymentMethod === 'online') {
      await handlePaymobPayment();
      return;
    }
    
    // لو اختار InstaPay
    if (selectedPaymentMethod === 'instapay') {
      if (saveInfo) {
        localStorage.setItem('checkoutInfo', JSON.stringify(formData));
      } else {
        localStorage.removeItem('checkoutInfo');
      }
      setShowInstaPayModal(true);
      return;
    }
    
    // لو اختار Vodafone Cash, Orange Cash, أو Telda
    if (['vodafone', 'orange', 'telda'].includes(selectedPaymentMethod)) {
      if (saveInfo) {
        localStorage.setItem('checkoutInfo', JSON.stringify(formData));
      } else {
        localStorage.removeItem('checkoutInfo');
      }
      setSelectedWalletType(selectedPaymentMethod);
      setShowWalletModal(true);
      return;
    }
    
    // لو اختار Cash on Delivery
    if (saveInfo) {
      localStorage.setItem('checkoutInfo', JSON.stringify(formData));
    } else {
      localStorage.removeItem('checkoutInfo');
    }
    
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
          email: formData.email,
          address: formData.address,
          government: formData.government,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total,
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount,
        customerToken: localStorage.getItem('fcmToken') || null
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.orderId;
      
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        orderId,
        date: new Date().toISOString(),
        total,
        status: 'Processing',
        items: orderData.items,
        customerInfo: orderData.customer
      });
      localStorage.setItem('orders', JSON.stringify(orders));
      
      const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      if (!myOrders.includes(orderId)) {
        myOrders.push(orderId);
        localStorage.setItem('myOrders', JSON.stringify(myOrders));
      }
      
      window.dispatchEvent(new Event('newOrder'));
      
      clearCart();
      
      const firstProductId = items[0]?.id || items[0]?._id;
      
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
          <p style="color: #f59e0b; font-weight: bold;">⭐ نرجو تقييم منتجاتنا!</p>
        `,
        showDenyButton: true,
        confirmButtonText: 'تقييم المنتجات',
        denyButtonText: 'متابعة التسوق',
        confirmButtonColor: '#f59e0b',
        denyButtonColor: '#000'
      }).then((result) => {
        if (result.isConfirmed && firstProductId) {
          navigate(`/products/${firstProductId}?scrollToReviews=true`);
        } else {
          navigate('/');
        }
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

  const handleInstaPaySubmit = async (instaPayData) => {
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
          email: formData.email,
          address: formData.address,
          government: formData.government,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total,
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount,
        customerToken: localStorage.getItem('fcmToken') || null,
        paymentMethod: 'instapay',
        instapay: {
          senderPhone: instaPayData.senderPhone,
          amount: instaPayData.amount,
          screenshot: instaPayData.screenshot
        }
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.orderId;
      
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        orderId,
        date: new Date().toISOString(),
        total,
        status: 'Pending Payment',
        items: orderData.items,
        customerInfo: orderData.customer,
        paymentMethod: 'instapay'
      });
      localStorage.setItem('orders', JSON.stringify(orders));
      
      const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      if (!myOrders.includes(orderId)) {
        myOrders.push(orderId);
        localStorage.setItem('myOrders', JSON.stringify(myOrders));
      }
      
      window.dispatchEvent(new Event('newOrder'));
      
      clearCart();
      
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        html: `
          <p>Your order has been received!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <br>
          <p>We will review your payment and confirm your order soon.</p>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#000'
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

  // Handle Wallet Payment Submit
  const handleWalletSubmit = async (walletData) => {
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
          email: formData.email,
          address: formData.address,
          government: formData.government,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total,
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount,
        customerToken: localStorage.getItem('fcmToken') || null,
        paymentMethod: walletData.walletType,
        walletPayment: {
          type: walletData.walletType,
          senderPhone: walletData.senderPhone,
          amount: walletData.amount,
          screenshot: walletData.screenshot
        }
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.orderId;
      
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        orderId,
        date: new Date().toISOString(),
        total,
        status: 'Pending Payment',
        items: orderData.items,
        customerInfo: orderData.customer,
        paymentMethod: walletData.walletType
      });
      localStorage.setItem('orders', JSON.stringify(orders));
      
      const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      if (!myOrders.includes(orderId)) {
        myOrders.push(orderId);
        localStorage.setItem('myOrders', JSON.stringify(myOrders));
      }
      
      window.dispatchEvent(new Event('newOrder'));
      
      clearCart();
      
      // Get wallet name for success message
      const walletNames = {
        vodafone: 'Vodafone Cash',
        orange: 'Orange Cash',
        telda: 'Telda'
      };
      const walletName = walletNames[walletData.walletType] || walletData.walletType;
      
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        html: `
          <p>Your ${walletName} payment has been received!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <br>
          <p>We will review your payment and confirm your order soon.</p>
          <p>You will receive updates on your email.</p>
        `,
        confirmButtonText: 'Continue Shopping',
        confirmButtonColor: '#000'
      }).then(() => {
        navigate('/');
      });
      
    } catch (error) {
      console.error('Error placing wallet order:', error);
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
    <div className="min-h-screen py-16 md:py-24 bg-beige-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-2xl md:text-4xl font-playfair mb-8 md:mb-12 text-black text-center">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-white p-4 md:p-6 mb-6 md:mb-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-playfair mb-4 md:mb-6 text-black">Order Details</h2>
          
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-medium text-black text-sm md:text-base truncate">{item.name}</p>
                  <p className="text-xs md:text-sm font-montserrat text-gray-600">
                    Size: {item.size} | Qty: {item.quantity}
                  </p>
                  <p className="font-montserrat font-semibold text-black text-sm md:text-base">{(item.price * item.quantity).toLocaleString()} EGP</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-gray-200 mb-3 md:mb-4" />

          <div className="space-y-2 font-montserrat text-xs md:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-black font-medium">{subtotal.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery:</span>
              <span className="text-black font-medium">{shippingFee} EGP</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-green-600">
                <span>Promo ({appliedPromo.code}):</span>
                <span>-{discount.toLocaleString()} EGP ({appliedPromo.discount}%)</span>
              </div>
            )}
            <div className="flex justify-between text-base md:text-lg font-bold border-t pt-2 md:pt-3 mt-2">
              <span>Total:</span>
              <span>{total.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
            <h3 className="font-montserrat font-semibold mb-3 text-xs md:text-sm">Have a Promo Code?</h3>
            {!appliedPromo ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="input-field flex-1 font-montserrat text-xs md:text-sm"
                  maxLength="10"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading}
                  className={`bg-green-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-green-700 font-montserrat text-xs md:text-sm whitespace-nowrap ${promoLoading ? 'opacity-50' : ''}`}
                >
                  {promoLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-montserrat font-semibold text-green-700 text-xs md:text-sm">
                    {appliedPromo.code} Applied!
                  </p>
                  <p className="text-xs text-green-600">
                    You're saving {appliedPromo.discount}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-red-500 hover:text-red-700 font-montserrat text-xs md:text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information Form */}
        <div className="bg-white p-4 md:p-6 mb-6 md:mb-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-playfair mb-4 md:mb-6 text-black">Personal Information</h2>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input-field font-montserrat text-sm md:text-base"
                placeholder="Full Name"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field font-montserrat text-sm md:text-base"
                placeholder="Email Address"
                required
              />
              <p className="text-xs text-gray-500 mt-1 font-montserrat">
                سنرسل لك تحديثات الطلب على هذا الإيميل
              </p>
            </div>

            <div>
              <select
                name="government"
                value={formData.government}
                onChange={handleInputChange}
                className="input-field font-montserrat text-sm md:text-base bg-white text-black"
                required
              >
                <option value="">Select Government</option>
                <option value="Cairo">Cairo</option>
                <option value="Giza">Giza</option>
                <option value="Alexandria">Alexandria</option>
                <option value="Dakahlia">Dakahlia</option>
                <option value="Red Sea">Red Sea</option>
                <option value="Beheira">Beheira</option>
                <option value="Faiyum">Faiyum</option>
                <option value="Gharbia">Gharbia</option>
                <option value="Ismailia">Ismailia</option>
                <option value="Monufia">Monufia</option>
                <option value="Minya">Minya</option>
                <option value="Qalyubia">Qalyubia</option>
                <option value="New Valley">New Valley</option>
                <option value="Suez">Suez</option>
                <option value="Aswan">Aswan</option>
                <option value="Assiut">Assiut</option>
                <option value="Beni Suef">Beni Suef</option>
                <option value="Port Said">Port Said</option>
                <option value="Damietta">Damietta</option>
                <option value="Sharqia">Sharqia</option>
                <option value="South Sinai">South Sinai</option>
                <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                <option value="Matrouh">Matrouh</option>
                <option value="Luxor">Luxor</option>
                <option value="Qena">Qena</option>
                <option value="North Sinai">North Sinai</option>
                <option value="Sohag">Sohag</option>
              </select>
            </div>

            <div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field font-montserrat text-sm md:text-base"
                rows="3"
                placeholder="Complete Address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <input
                  type="tel"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleInputChange}
                  className="input-field font-montserrat text-sm md:text-base"
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
                  className="input-field font-montserrat text-sm md:text-base"
                  placeholder="Phone Number 2 (11 digits)"
                  maxLength="11"
                  required
                />
              </div>
            </div>

            {/* Save Info Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveInfo"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="saveInfo" className="font-montserrat text-xs md:text-sm cursor-pointer text-gray-700">
                Save this information for next time
              </label>
            </div>
          </div>

          {/* Payment Method Section - Inside Personal Info Card */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
            <h3 className="text-base md:text-lg font-playfair mb-3 md:mb-4 text-black">Payment Method</h3>
            
            <PaymentSelection 
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Paymob Payment Modal */}
      <PaymobModal 
        isOpen={showPaymobModal}
        onClose={() => setShowPaymobModal(false)}
        paymentUrl={paymobUrl}
      />

      {/* InstaPay Payment Modal */}
      <InstaPayModal
        isOpen={showInstaPayModal}
        onClose={() => setShowInstaPayModal(false)}
        onSubmit={handleInstaPaySubmit}
        total={total}
      />

      {/* Wallet Payment Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSubmit={handleWalletSubmit}
        total={total}
        walletType={selectedWalletType}
      />

      <Footer />
    </div>
  );
};

export default Checkout;
