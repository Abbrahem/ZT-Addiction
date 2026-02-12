import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { saveTrackedOrder } from '../utils/notifications';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Check if orderId is in URL (from notification click)
  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      // Auto-search
      searchOrder(orderIdFromUrl);
    }
  }, [searchParams]);

  // Status messages in Arabic
  const getStatusMessage = (status) => {
    const messages = {
      'pending': 'سيتم التوصيل خلال 2-5 أيام',
      'processing': 'جاري التجهيز - 1-3 أيام',
      'shipped': 'في الطريق - 1-2 يوم',
      'delivered': 'تم التوصيل',
      'cancelled': 'تم الإلغاء'
    };
    return messages[status] || 'جاري المعالجة';
  };

  const searchOrder = async (id) => {
    // Try to get order from database
    try {
      const response = await axios.get(`/api/orders?orderId=${id.trim()}`);
      if (response.data && response.data.length > 0) {
        const order = response.data[0];
        setOrderData({
          orderId: order._id.toString(),
          date: order.createdAt,
          status: order.status || 'pending',
          total: order.total,
          customerInfo: order.customer,
          items: order.items
        });
        setNotFound(false);
        
        // Save order to tracked orders for notifications
        saveTrackedOrder(order._id.toString());
        
        // Save initial status
        localStorage.setItem(`order_${order._id.toString()}_status`, order.status || 'pending');
        
        return;
      }
    } catch (error) {
      console.log('Error fetching order:', error);
    }
    
    // Order not found
    setOrderData(null);
    setNotFound(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchOrder(orderId);
  };

  return (
    <div className="min-h-screen bg-beige-50 py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-playfair text-center mb-8 text-black">Order Tracking</h1>
        <p className="text-center text-gray-600 mb-12 font-montserrat">
          Enter your order ID to track your order status
        </p>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g., ORD-123456)"
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 focus:outline-none focus:border-black font-montserrat text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-montserrat hover:bg-gray-800 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Track Order
            </button>
          </div>
        </form>

        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-montserrat">
              Order not found. Please check your order ID and try again.
            </p>
          </div>
        )}

        {orderData && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <div className="border-b pb-4 sm:pb-6 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-playfair mb-4">Order Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 font-montserrat text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-semibold break-all">{orderData.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(orderData.date).toLocaleDateString()}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-600 mb-1">Status</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-semibold capitalize text-blue-900 mb-1">{orderData.status || 'pending'}</p>
                    <p className="text-blue-700 text-xs">{getStatusMessage(orderData.status || 'pending')}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold">{orderData.total} EGP</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 sm:pb-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-playfair mb-4">Customer Information</h3>
              <div className="font-montserrat text-sm space-y-2">
                <p><span className="text-gray-600">Name:</span> {orderData.customerInfo?.name}</p>
                <p><span className="text-gray-600">Phone 1:</span> {orderData.customerInfo?.phone1}</p>
                {orderData.customerInfo?.phone2 && (
                  <p><span className="text-gray-600">Phone 2:</span> {orderData.customerInfo?.phone2}</p>
                )}
                <p className="break-words"><span className="text-gray-600">Address:</span> {orderData.customerInfo?.address}</p>
                {orderData.customerInfo?.city && (
                  <p><span className="text-gray-600">City:</span> {orderData.customerInfo.city}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-playfair mb-4">Order Items</h3>
              <div className="space-y-4">
                {orderData.items?.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 border-b pb-4">
                    <div className="flex-1 font-montserrat text-sm">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600">Size: {item.size}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="font-montserrat font-semibold text-right sm:text-left">
                      {item.price} EGP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
