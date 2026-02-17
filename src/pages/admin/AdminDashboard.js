import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { showLocalNotification } from '../../utils/notifications';
import AdminNotifications from './AdminNotifications';
import AdminProfile from './AdminProfile';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add-product');
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, notifications, profile
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalPromoCodes: 0
  });

  // Promo code form state
  const [promoForm, setPromoForm] = useState({
    discount: '10',
    maxUses: '10',
    expiryDays: '1'
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    collection: '',
    subcategory: '', // For Bottles: Niche, Designer, Arabic
    images: [],
    sizesWithPrices: [], // Array of {size: '5ml', price: 450}
    // Bundle specific fields - up to 4 perfumes (3 & 4 are optional)
    bundlePerfume1: { name: '', sizesWithPrices: [] },
    bundlePerfume2: { name: '', sizesWithPrices: [] },
    bundlePerfume3: { name: '', sizesWithPrices: [] }, // Optional
    bundlePerfume4: { name: '', sizesWithPrices: [] }  // Optional
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);

  // Temporary state for adding size/price
  const [tempSize, setTempSize] = useState('');
  const [tempPrice, setTempPrice] = useState('');

  // Bundle temporary states
  const [tempBundleSize1, setTempBundleSize1] = useState('');
  const [tempBundlePrice1, setTempBundlePrice1] = useState('');
  const [tempBundleSize2, setTempBundleSize2] = useState('');
  const [tempBundlePrice2, setTempBundlePrice2] = useState('');
  const [tempBundleSize3, setTempBundleSize3] = useState('');
  const [tempBundlePrice3, setTempBundlePrice3] = useState('');
  const [tempBundleSize4, setTempBundleSize4] = useState('');
  const [tempBundlePrice4, setTempBundlePrice4] = useState('');

  // Search and filter state for manage products
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollection, setFilterCollection] = useState('all');

  // Image modal state
  const [imageModal, setImageModal] = useState(null);

  const collections = ['Summer Samples', 'Winter Samples', 'Bundles', 'Bottles', 'Quantities With Bottle'];
  const bottleSubcategories = ['Niche', 'Designer', 'Arabic'];
  const availableSizes = ['3ml', '5ml', '10ml', '20ml', '25ml', '30ml', '35ml', '40ml', '45ml', '50ml', '60ml', '65ml', '70ml', '80ml', '100ml', '200ml'];

  useEffect(() => {
    checkAuth();
    
    // Load notifications count
    loadNotificationCount();
    
    // Listen for new notifications
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'NEW_NOTIFICATION') {
        loadNotificationCount();
      }
    });
    
    // Request notification permission for admin
    const setupAdminNotifications = async () => {
      try {
        // Import requestFCMToken
        const { requestFCMToken } = await import('../../firebase-config');
        
        // Get FCM token
        const token = await requestFCMToken();
        
        if (token) {
          console.log('✅ Admin FCM token:', token);
          
          // Save token to database
          await axios.post('/api/orders/save-fcm-token', {
            token,
            userType: 'admin'
          });
          
          console.log('✅ Admin token saved to database');
        } else {
          console.log('⚠️ No FCM token received - user may have denied permission');
        }
      } catch (error) {
        console.error('❌ Error setting up admin notifications:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data
        });
      }
    };
    setupAdminNotifications();
    
    if (activeTab === 'manage-products') {
      fetchProducts();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'promo-codes') {
      fetchPromoCodes();
    }
    
    // Poll for new orders every 30 seconds when on orders tab
    let orderInterval;
    if (activeTab === 'orders') {
      orderInterval = setInterval(() => {
        checkForNewOrders();
      }, 30000);
    }
    
    return () => {
      if (orderInterval) clearInterval(orderInterval);
    };
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadNotificationCount = () => {
    try {
      const stored = localStorage.getItem('adminNotifications') || '[]';
      const parsed = JSON.parse(stored);
      const unread = parsed.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const checkAuth = async () => {
    try {
      await axios.get('/api/auth', { withCredentials: true });
    } catch (error) {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.delete('/api/auth', { withCredentials: true });
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get('/api/promo', { withCredentials: true });
      setPromoCodes(response.data);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get('/api/orders', { withCredentials: true });
      console.log('Orders response:', response.data);
      console.log('Orders length:', response.data.length);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  // Check for new orders and notify admin
  const checkForNewOrders = async () => {
    try {
      const response = await axios.get('/api/orders', { withCredentials: true });
      const currentOrders = response.data || [];
      
      // Get last order count from localStorage
      const lastOrderCount = parseInt(localStorage.getItem('adminLastOrderCount') || '0');
      
      if (currentOrders.length > lastOrderCount) {
        // New order(s) detected
        const newOrdersCount = currentOrders.length - lastOrderCount;
        
        showLocalNotification('🎉 طلب جديد!', {
          body: `لديك ${newOrdersCount} طلب جديد`,
          data: { url: '/admin/dashboard' }
        });
        
        // Play notification sound (optional)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0vBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2Bhxqvu7mnlARDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBACRVetOnrqFUUCkaf4PK+bCEFK4HO8tmJNggYZLns6KFQEQtMpeHxuWUcBTaN1e/OfS8FKH7M8NqPOwsSXLHo7KtYFQhDnN3ywW4kBS6Ez/PbiTYGHGq+7uaeUBEMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAJFV606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBhkuezooVARC0yl4fG5ZRwFNo3V7859LwUofsz');
          audio.play().catch(() => {});
        } catch (e) {}
      }
      
      // Update last order count
      localStorage.setItem('adminLastOrderCount', currentOrders.length.toString());
      
      // Update orders state if on orders tab
      if (activeTab === 'orders') {
        setOrders(currentOrders);
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!productForm.name || !productForm.collection) {
      Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Name and collection are required' });
      return;
    }

    // Validate subcategory for Bottles
    if (productForm.collection === 'Bottles' && !productForm.subcategory) {
      Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Please select a bottle type (Niche, Designer, or Arabic)' });
      return;
    }

    // For Bundles, validate bundle data
    if (productForm.collection === 'Bundles') {
      if (!productForm.bundlePerfume1?.name || !productForm.bundlePerfume2?.name) {
        Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Please enter names for at least 2 perfumes in the bundle' });
        return;
      }
      if (!productForm.bundlePerfume1?.sizesWithPrices?.length || !productForm.bundlePerfume2?.sizesWithPrices?.length) {
        Swal.fire({ icon: 'error', title: 'Missing Sizes', text: 'Please add sizes with prices for at least 2 perfumes' });
        return;
      }
      // Validate perfume 3 if name is provided
      if (productForm.bundlePerfume3?.name && !productForm.bundlePerfume3?.sizesWithPrices?.length) {
        Swal.fire({ icon: 'error', title: 'Missing Sizes', text: 'Please add sizes with prices for Perfume 3' });
        return;
      }
      // Validate perfume 4 if name is provided
      if (productForm.bundlePerfume4?.name && !productForm.bundlePerfume4?.sizesWithPrices?.length) {
        Swal.fire({ icon: 'error', title: 'Missing Sizes', text: 'Please add sizes with prices for Perfume 4' });
        return;
      }
    } else {
      // For non-bundles, validate sizes
      if (!productForm.sizesWithPrices || productForm.sizesWithPrices.length === 0) {
        Swal.fire({ icon: 'error', title: 'Missing Sizes', text: 'Please add at least one size with price' });
        return;
      }
    }

    setLoading(true);
    
    // Prepare data for submission
    const submitData = { ...productForm };
    
    // For bundles, set a default price (will be calculated on frontend)
    if (productForm.collection === 'Bundles') {
      submitData.priceEGP = 0; // Will be calculated based on selected sizes
      submitData.bundlePerfume1 = productForm.bundlePerfume1;
      submitData.bundlePerfume2 = productForm.bundlePerfume2;
    }
    
    console.log('Submitting product:', submitData);
    console.log('Subcategory:', submitData.subcategory);

    try {
      if (editingProduct) {
        const response = await axios.put(
          `/api/products/${editingProduct._id}`, 
          submitData, 
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Update response:', response.data);
        
        // Refresh products list
        await fetchProducts();
        
        Swal.fire({
          icon: 'success',
          title: 'Product Updated Successfully!',
          text: 'The product has been updated.',
          showConfirmButton: true,
          confirmButtonText: 'View Product',
          showCancelButton: true,
          cancelButtonText: 'Continue Editing'
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(`/products/${editingProduct._id}`, '_blank');
          }
        });
        setEditingProduct(null);
      } else {
        const response = await axios.post('/api/products', submitData, { withCredentials: true });
        const productId = response.data.productId;

        // Notify all users about new product
        showLocalNotification('✨ منتج جديد!', {
          body: `تم إضافة ${productForm.name} - تصفح الآن`,
          data: { url: `/products/${productId}` }
        });

        Swal.fire({
          icon: 'success',
          title: 'Product Added Successfully!',
          html: `
            <p>Your product has been created with ID: <strong>${productId}</strong></p>
            <p>What would you like to do next?</p>
          `,
          showConfirmButton: true,
          confirmButtonText: 'View Product',
          showCancelButton: true,
          cancelButtonText: 'Add Another Product',
          showDenyButton: true,
          denyButtonText: 'Manage Products'
        }).then((result) => {
          if (result.isConfirmed) {
            // Open product in new tab
            window.open(`/products/${productId}`, '_blank');
          } else if (result.isDenied) {
            // Switch to manage products tab
            setActiveTab('manage-products');
          }
          // If cancelled, stay on add product form
        });
      }

      setProductForm({
        name: '', description: '', collection: '', subcategory: '', images: [], sizesWithPrices: [],
        bundlePerfume1: { name: '', sizesWithPrices: [] },
        bundlePerfume2: { name: '', sizesWithPrices: [] },
        bundlePerfume3: { name: '', sizesWithPrices: [] },
        bundlePerfume4: { name: '', sizesWithPrices: [] }
      });
      setTempPrice('');

      if (activeTab === 'manage-products') {
        fetchProducts();
      }
    } catch (error) {
      console.error('Product creation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save product',
        footer: error.response?.data?.error ? `Details: ${error.response.data.error}` : ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      console.log('Uploading images...', files.length);
      const uploadedIds = [];

      for (const file of files) {
        // Convert file to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
            resolve(base64String);
          };
          reader.readAsDataURL(file);
        });

        // Upload as JSON
        const response = await axios.post('/api/upload', {
          imageData: base64,
          filename: file.name,
          contentType: file.type
        }, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });

        console.log('Upload response:', response.data);

        if (response.data.imageId) {
          uploadedIds.push(response.data.imageId);
        }
      }

      if (uploadedIds.length > 0) {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedIds]
        }));

        Swal.fire({
          icon: 'success',
          title: 'Images Uploaded',
          text: `${uploadedIds.length} image(s) uploaded successfully`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to upload images'
      });
    }
  };

  const removeImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addSizeWithPrice = () => {
    if (!tempSize || !tempPrice) {
      Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please select size and enter price' });
      return;
    }

    // Check if size already exists
    if (productForm.sizesWithPrices.some(item => item.size === tempSize)) {
      Swal.fire({ icon: 'warning', title: 'Duplicate Size', text: 'This size already exists' });
      return;
    }

    setProductForm(prev => ({
      ...prev,
      sizesWithPrices: [...prev.sizesWithPrices, { size: tempSize, price: parseFloat(tempPrice) }]
    }));

    setTempSize('');
    setTempPrice('');
  };

  const removeSizeWithPrice = (index) => {
    setProductForm(prev => ({
      ...prev,
      sizesWithPrices: prev.sizesWithPrices.filter((_, i) => i !== index)
    }));
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      collection: product.collection,
      subcategory: product.subcategory || '',
      images: product.images || [],
      sizesWithPrices: product.sizesWithPrices || (product.size && product.priceEGP ? [{ size: product.size, price: product.priceEGP }] : []),
      bundlePerfume1: product.bundlePerfume1 || { name: '', sizesWithPrices: [] },
      bundlePerfume2: product.bundlePerfume2 || { name: '', sizesWithPrices: [] },
      bundlePerfume3: product.bundlePerfume3 || { name: '', sizesWithPrices: [] },
      bundlePerfume4: product.bundlePerfume4 || { name: '', sizesWithPrices: [] }
    });
    setEditingProduct(product);
    setActiveTab('add-product');
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products/${productId}`, { withCredentials: true });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
        fetchProducts();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete product' });
      }
    }
  };

  const handleSoldOutToggle = async (productId, currentStatus) => {
    try {
      console.log('Toggling soldOut for product:', productId, 'current status:', currentStatus);
      console.log('Sending request body:', { soldOut: !currentStatus });

      const response = await axios.patch(`/api/products/${productId}/soldout`, {
        soldOut: !currentStatus
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('SoldOut toggle response:', response.data);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error('SoldOut toggle error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update product status' });
    }
  };

  const handleBestSellerToggle = async (productId, currentStatus) => {
    try {
      const response = await axios.patch(`/api/products/${productId}/soldout?action=bestseller`, {
        isBestSeller: !currentStatus
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('BestSeller toggle response:', response.data);
      fetchProducts();
    } catch (error) {
      console.error('BestSeller toggle error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update best seller status';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleBestReviewToggle = async (productId, currentStatus) => {
    try {
      const response = await axios.patch(`/api/products/${productId}/soldout?action=bestreview`, {
        isBestReview: !currentStatus
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('BestReview toggle response:', response.data);
      fetchProducts();
    } catch (error) {
      console.error('BestReview toggle error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update best review status';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleSizeSoldOutToggle = async (productId, size, currentStatus) => {
    try {
      const response = await axios.patch(`/api/products/${productId}/soldout?action=sizeSoldout`, {
        size: size,
        isSoldOut: !currentStatus
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Size SoldOut toggle response:', response.data);
      fetchProducts();
    } catch (error) {
      console.error('Size SoldOut toggle error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update size status';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleBundleSizeSoldOutToggle = async (productId, perfumeNumber, size, currentStatus) => {
    try {
      console.log('Toggling bundle size soldOut:', { productId, perfumeNumber, size, currentStatus });
      
      const requestBody = {
        perfumeNumber: perfumeNumber,
        size: size,
        isSoldOut: !currentStatus
      };
      
      console.log('Request body:', requestBody);

      const response = await axios.patch(`/api/products/${productId}/soldout?action=bundleSizeSoldout`, requestBody, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Bundle Size SoldOut toggle response:', response.data);
      fetchProducts();
    } catch (error) {
      console.error('Bundle Size SoldOut toggle error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.message || 'Failed to update bundle size status';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will permanently delete the order. This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        console.log('Deleting order:', orderId);

        const response = await axios.delete('/api/orders', {
          data: { orderId: orderId },
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Order delete response:', response.data);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Order has been deleted successfully.',
          timer: 1500,
          showConfirmButton: false
        });

        fetchOrders(); // Refresh the orders list
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete order. Please try again.'
      });
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', orderId, 'to:', newStatus);
      
      // Update in database
      const response = await axios.patch('/api/orders',
        { orderId: orderId, status: newStatus },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order status update response:', response.data);

      // Update local state
      setOrders(orders.map(order => 
        order._id.toString() === orderId.toString() ? { ...order, status: newStatus } : order
      ));

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Order status changed to ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update order status. Please try again.'
      });
      // Refresh to get correct status
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Only show in dashboard view */}
      {activeView === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
              {[
                { id: 'add-product', label: 'Add New Product' },
                { id: 'manage-products', label: 'Manage Products' },
                { id: 'orders', label: 'Orders' },
                { id: 'promo-codes', label: 'Promo Codes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Content */}
        <div className="mt-8">
          {/* Show different views based on activeView */}
          {activeView === 'notifications' ? (
            <AdminNotifications />
          ) : activeView === 'profile' ? (
            <AdminProfile />
          ) : (
            <>
          {/* Add/Edit Product Tab */}
          {activeTab === 'add-product' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>



                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="input-field"
                    rows="4"
                  />
                </div>

                {/* Collection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Collection</label>
                  <select
                    value={productForm.collection}
                    onChange={(e) => setProductForm({ ...productForm, collection: e.target.value, subcategory: '' })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Collection</option>
                    {collections.map(collection => (
                      <option key={collection} value={collection}>{collection}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory - Only show when Bottles is selected */}
                {productForm.collection === 'Bottles' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Bottle Type</label>
                    <select
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select Type</option>
                      {bottleSubcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bundle Perfumes - Only show when Bundles is selected */}
                {productForm.collection === 'Bundles' && (
                  <div className="space-y-6 p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Bundle Perfumes</h3>
                    
                    {/* Perfume 1 */}
                    <div className="p-4 bg-white rounded-lg">
                      <label className="block text-sm font-medium mb-2">Perfume 1 Name</label>
                      <input
                        type="text"
                        value={productForm.bundlePerfume1.name}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          bundlePerfume1: { ...productForm.bundlePerfume1, name: e.target.value }
                        })}
                        className="input-field mb-3"
                        placeholder="e.g. Jean Paul Gaultier Le Male Elixir"
                      />
                      
                      <label className="block text-sm font-medium mb-2">Perfume 1 Sizes & Prices</label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={tempBundleSize1}
                          onChange={(e) => setTempBundleSize1(e.target.value)}
                          className="input-field flex-1"
                        >
                          <option value="">Select Size</option>
                          {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={tempBundlePrice1}
                          onChange={(e) => setTempBundlePrice1(e.target.value)}
                          placeholder="Price (EGP)"
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempBundleSize1 && tempBundlePrice1) {
                              setProductForm({
                                ...productForm,
                                bundlePerfume1: {
                                  ...productForm.bundlePerfume1,
                                  sizesWithPrices: [...productForm.bundlePerfume1.sizesWithPrices, { size: tempBundleSize1, price: parseFloat(tempBundlePrice1) }]
                                }
                              });
                              setTempBundleSize1('');
                              setTempBundlePrice1('');
                            }
                          }}
                          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        >
                          Add
                        </button>
                      </div>
                      
                      {productForm.bundlePerfume1?.sizesWithPrices?.length > 0 && (
                        <div className="space-y-2">
                          {productForm.bundlePerfume1.sizesWithPrices.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-purple-100 p-3 rounded">
                              <span className="font-medium text-purple-900">{item.size} - {item.price} EGP</span>
                              <button
                                type="button"
                                onClick={() => setProductForm({
                                  ...productForm,
                                  bundlePerfume1: {
                                    ...productForm.bundlePerfume1,
                                    sizesWithPrices: productForm.bundlePerfume1.sizesWithPrices.filter((_, i) => i !== idx)
                                  }
                                })}
                                className="text-purple-600 hover:text-purple-800"
                              >Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Perfume 2 */}
                    <div className="p-4 bg-white rounded-lg">
                      <label className="block text-sm font-medium mb-2">Perfume 2 Name</label>
                      <input
                        type="text"
                        value={productForm.bundlePerfume2.name}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          bundlePerfume2: { ...productForm.bundlePerfume2, name: e.target.value }
                        })}
                        className="input-field mb-3"
                        placeholder="e.g. Lattafa The Kingdom"
                      />
                      
                      <label className="block text-sm font-medium mb-2">Perfume 2 Sizes & Prices</label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={tempBundleSize2}
                          onChange={(e) => setTempBundleSize2(e.target.value)}
                          className="input-field flex-1"
                        >
                          <option value="">Select Size</option>
                          {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={tempBundlePrice2}
                          onChange={(e) => setTempBundlePrice2(e.target.value)}
                          placeholder="Price (EGP)"
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempBundleSize2 && tempBundlePrice2) {
                              setProductForm({
                                ...productForm,
                                bundlePerfume2: {
                                  ...productForm.bundlePerfume2,
                                  sizesWithPrices: [...productForm.bundlePerfume2.sizesWithPrices, { size: tempBundleSize2, price: parseFloat(tempBundlePrice2) }]
                                }
                              });
                              setTempBundleSize2('');
                              setTempBundlePrice2('');
                            }
                          }}
                          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        >
                          Add
                        </button>
                      </div>
                      
                      {productForm.bundlePerfume2?.sizesWithPrices?.length > 0 && (
                        <div className="space-y-2">
                          {productForm.bundlePerfume2.sizesWithPrices.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-purple-100 p-3 rounded">
                              <span className="font-medium text-purple-900">{item.size} - {item.price} EGP</span>
                              <button
                                type="button"
                                onClick={() => setProductForm({
                                  ...productForm,
                                  bundlePerfume2: {
                                    ...productForm.bundlePerfume2,
                                    sizesWithPrices: productForm.bundlePerfume2.sizesWithPrices.filter((_, i) => i !== idx)
                                  }
                                })}
                                className="text-purple-600 hover:text-purple-800"
                              >Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Perfume 3 - Optional */}
                    <div className="p-4 bg-white rounded-lg border-2 border-dashed border-green-300">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Optional</span>
                        <label className="block text-sm font-medium">Perfume 3 Name</label>
                      </div>
                      <input
                        type="text"
                        value={productForm.bundlePerfume3?.name || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          bundlePerfume3: { ...productForm.bundlePerfume3, name: e.target.value, sizesWithPrices: productForm.bundlePerfume3?.sizesWithPrices || [] }
                        })}
                        className="input-field mb-3"
                        placeholder="Leave empty if not needed"
                      />
                      
                      <label className="block text-sm font-medium mb-2">Perfume 3 Sizes & Prices</label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={tempBundleSize3}
                          onChange={(e) => setTempBundleSize3(e.target.value)}
                          className="input-field flex-1"
                        >
                          <option value="">Select Size</option>
                          {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={tempBundlePrice3}
                          onChange={(e) => setTempBundlePrice3(e.target.value)}
                          placeholder="Price (EGP)"
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempBundleSize3 && tempBundlePrice3) {
                              setProductForm({
                                ...productForm,
                                bundlePerfume3: {
                                  ...productForm.bundlePerfume3,
                                  sizesWithPrices: [...(productForm.bundlePerfume3?.sizesWithPrices || []), { size: tempBundleSize3, price: parseFloat(tempBundlePrice3) }]
                                }
                              });
                              setTempBundleSize3('');
                              setTempBundlePrice3('');
                            }
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Add
                        </button>
                      </div>
                      
                      {productForm.bundlePerfume3?.sizesWithPrices?.length > 0 && (
                        <div className="space-y-2">
                          {productForm.bundlePerfume3.sizesWithPrices.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-green-100 p-3 rounded">
                              <span className="font-medium text-green-900">{item.size} - {item.price} EGP</span>
                              <button
                                type="button"
                                onClick={() => setProductForm({
                                  ...productForm,
                                  bundlePerfume3: {
                                    ...productForm.bundlePerfume3,
                                    sizesWithPrices: productForm.bundlePerfume3.sizesWithPrices.filter((_, i) => i !== idx)
                                  }
                                })}
                                className="text-green-600 hover:text-green-800"
                              >Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Perfume 4 - Optional */}
                    <div className="p-4 bg-white rounded-lg border-2 border-dashed border-orange-300">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Optional</span>
                        <label className="block text-sm font-medium">Perfume 4 Name</label>
                      </div>
                      <input
                        type="text"
                        value={productForm.bundlePerfume4?.name || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          bundlePerfume4: { ...productForm.bundlePerfume4, name: e.target.value, sizesWithPrices: productForm.bundlePerfume4?.sizesWithPrices || [] }
                        })}
                        className="input-field mb-3"
                        placeholder="Leave empty if not needed"
                      />
                      
                      <label className="block text-sm font-medium mb-2">Perfume 4 Sizes & Prices</label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={tempBundleSize4}
                          onChange={(e) => setTempBundleSize4(e.target.value)}
                          className="input-field flex-1"
                        >
                          <option value="">Select Size</option>
                          {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={tempBundlePrice4}
                          onChange={(e) => setTempBundlePrice4(e.target.value)}
                          placeholder="Price (EGP)"
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempBundleSize4 && tempBundlePrice4) {
                              setProductForm({
                                ...productForm,
                                bundlePerfume4: {
                                  ...productForm.bundlePerfume4,
                                  sizesWithPrices: [...(productForm.bundlePerfume4?.sizesWithPrices || []), { size: tempBundleSize4, price: parseFloat(tempBundlePrice4) }]
                                }
                              });
                              setTempBundleSize4('');
                              setTempBundlePrice4('');
                            }
                          }}
                          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                        >
                          Add
                        </button>
                      </div>
                      
                      {productForm.bundlePerfume4?.sizesWithPrices?.length > 0 && (
                        <div className="space-y-2">
                          {productForm.bundlePerfume4.sizesWithPrices.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-orange-100 p-3 rounded">
                              <span className="font-medium text-orange-900">{item.size} - {item.price} EGP</span>
                              <button
                                type="button"
                                onClick={() => setProductForm({
                                  ...productForm,
                                  bundlePerfume4: {
                                    ...productForm.bundlePerfume4,
                                    sizesWithPrices: productForm.bundlePerfume4.sizesWithPrices.filter((_, i) => i !== idx)
                                  }
                                })}
                                className="text-orange-600 hover:text-orange-800"
                              >Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sizes with Prices - Only show when NOT Bundles */}
                {productForm.collection !== 'Bundles' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Sizes & Prices</label>

                  {/* Add Size/Price */}
                  <div className="flex gap-2 mb-4">
                    <select
                      value={tempSize}
                      onChange={(e) => setTempSize(e.target.value)}
                      className="input-field flex-1"
                    >
                      <option value="">Select Size</option>
                      {availableSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      placeholder="Price (EGP)"
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={addSizeWithPrice}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>

                  {/* Display Added Sizes */}
                  {productForm.sizesWithPrices.length > 0 && (
                    <div className="space-y-2">
                      {productForm.sizesWithPrices.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                          <span className="font-medium">{item.size} - {item.price} EGP</span>
                          <button
                            type="button"
                            onClick={() => removeSizeWithPrice(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                  />

                  {productForm.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Uploaded Images ({productForm.images.length}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {productForm.images.map((imageId, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`/api/images/${imageId}`}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                              onLoad={() => console.log('Image preview loaded:', imageId)}
                              onError={(e) => {
                                console.error('Image preview failed to load:', imageId);
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add New Product')}
                  </button>

                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '', priceEGP: '', description: '', collection: '', size: '', images: []
                        });
                      }}
                      className="btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
              
            </div>
          )}

          {/* Manage Products Tab */}
          {activeTab === 'manage-products' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Manage Products</h2>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 sm:w-[65%]">
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div className="sm:w-[35%]">
                  <select
                    value={filterCollection}
                    onChange={(e) => setFilterCollection(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All Collections</option>
                    {collections.map(collection => (
                      <option key={collection} value={collection}>{collection}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(product => {
                    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCollection = filterCollection === 'all' || product.collection === filterCollection;
                    return matchesSearch && matchesCollection;
                  })
                  .map((product) => (
                  <div key={product._id} className="card p-4">
                    <div className="relative h-48 mb-4">
                      <img
                        src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                        onLoad={() => console.log('Admin product image loaded:', product.images?.[0])}
                        onError={(e) => {
                          console.error('Admin product image failed:', product.images?.[0]);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {product.soldOut && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                          SOLD OUT
                        </div>
                      )}
                      {product.isBestSeller && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
                          BEST
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-1">{product.collection}</p>
                    <p className="font-bold mb-2">{product.priceEGP} EGP</p>

                    {/* Bundle Sizes with Sold Out Toggle */}
                    {product.isBundle && product.bundlePerfume1 && product.bundlePerfume2 && (
                      <div className="mb-4 space-y-3 bg-purple-50 p-3 rounded-lg">
                        {/* Perfume 1 Sizes */}
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm font-bold mb-2 text-purple-900">1️⃣ {product.bundlePerfume1.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {product.bundlePerfume1.sizesWithPrices?.map((sizeItem, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleBundleSizeSoldOutToggle(product._id, 1, sizeItem.size, sizeItem.soldOut)}
                                className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                  sizeItem.soldOut
                                    ? 'bg-red-100 text-red-700 line-through hover:bg-red-200'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                                title={sizeItem.soldOut ? 'Click to mark as available' : 'Click to mark as sold out'}
                              >
                                {sizeItem.size} - {sizeItem.price} EGP
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Perfume 2 Sizes */}
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm font-bold mb-2 text-indigo-900">2️⃣ {product.bundlePerfume2.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {product.bundlePerfume2.sizesWithPrices?.map((sizeItem, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleBundleSizeSoldOutToggle(product._id, 2, sizeItem.size, sizeItem.soldOut)}
                                className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                  sizeItem.soldOut
                                    ? 'bg-red-100 text-red-700 line-through hover:bg-red-200'
                                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}
                                title={sizeItem.soldOut ? 'Click to mark as available' : 'Click to mark as sold out'}
                              >
                                {sizeItem.size} - {sizeItem.price} EGP
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Perfume 3 Sizes - Optional */}
                        {product.bundlePerfume3?.name && product.bundlePerfume3?.sizesWithPrices?.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                            <p className="text-sm font-bold mb-2 text-green-900">3️⃣ {product.bundlePerfume3.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {product.bundlePerfume3.sizesWithPrices?.map((sizeItem, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleBundleSizeSoldOutToggle(product._id, 3, sizeItem.size, sizeItem.soldOut)}
                                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                    sizeItem.soldOut
                                      ? 'bg-red-100 text-red-700 line-through hover:bg-red-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                  title={sizeItem.soldOut ? 'Click to mark as available' : 'Click to mark as sold out'}
                                >
                                  {sizeItem.size} - {sizeItem.price} EGP
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Perfume 4 Sizes - Optional */}
                        {product.bundlePerfume4?.name && product.bundlePerfume4?.sizesWithPrices?.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border-2 border-orange-200">
                            <p className="text-sm font-bold mb-2 text-orange-900">4️⃣ {product.bundlePerfume4.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {product.bundlePerfume4.sizesWithPrices?.map((sizeItem, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleBundleSizeSoldOutToggle(product._id, 4, sizeItem.size, sizeItem.soldOut)}
                                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                    sizeItem.soldOut
                                      ? 'bg-red-100 text-red-700 line-through hover:bg-red-200'
                                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  }`}
                                  title={sizeItem.soldOut ? 'Click to mark as available' : 'Click to mark as sold out'}
                                >
                                  {sizeItem.size} - {sizeItem.price} EGP
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Sizes with Sold Out Toggle */}
                    {!product.isBundle && product.sizesWithPrices && product.sizesWithPrices.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Sizes:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizesWithPrices.map((sizeItem, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSizeSoldOutToggle(product._id, sizeItem.size, sizeItem.soldOut)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                sizeItem.soldOut
                                  ? 'bg-red-100 text-red-700 line-through'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {sizeItem.size} - {sizeItem.price} EGP
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSoldOutToggle(product._id, product.soldOut)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${product.soldOut
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                      >
                        {product.soldOut ? 'In Stock' : 'Sold Out'}
                      </button>
                      <button
                        onClick={() => handleBestSellerToggle(product._id, product.isBestSeller)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${product.isBestSeller
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }`}
                      >
                        BEST
                      </button>
                      <button
                        onClick={() => handleBestReviewToggle(product._id, product.isBestReview)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${product.isBestReview
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }`}
                      >
                        REVIEW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Manage Orders ({orders.length})</h2>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="card p-6">
                      {/* Order Date */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Order Date: {new Date(order.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>

                      {/* Products */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <h4 className="font-semibold mb-3">Products:</h4>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                <img
                                  src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className="font-semibold text-lg">{item.name}</p>
                                    <p className="font-bold text-lg">{item.price} EGP</p>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                              
                              {item.isBundle && item.bundleDetails ? (
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                  <div className="bg-purple-100 rounded-lg p-3">
                                    <p className="text-xs text-purple-600 font-medium mb-1">Perfume 1</p>
                                    <p className="font-semibold text-purple-900">{item.bundleDetails.perfume1Name}</p>
                                    <p className="text-sm text-purple-700 mt-1">Size: {item.bundleDetails.size1}</p>
                                  </div>
                                  <div className="bg-indigo-100 rounded-lg p-3">
                                    <p className="text-xs text-indigo-600 font-medium mb-1">Perfume 2</p>
                                    <p className="font-semibold text-indigo-900">{item.bundleDetails.perfume2Name}</p>
                                    <p className="text-sm text-indigo-700 mt-1">Size: {item.bundleDetails.size2}</p>
                                  </div>
                                  {item.bundleDetails.perfume3Name && (
                                    <div className="bg-green-100 rounded-lg p-3">
                                      <p className="text-xs text-green-600 font-medium mb-1">Perfume 3</p>
                                      <p className="font-semibold text-green-900">{item.bundleDetails.perfume3Name}</p>
                                      <p className="text-sm text-green-700 mt-1">Size: {item.bundleDetails.size3}</p>
                                    </div>
                                  )}
                                  {item.bundleDetails.perfume4Name && (
                                    <div className="bg-orange-100 rounded-lg p-3">
                                      <p className="text-xs text-orange-600 font-medium mb-1">Perfume 4</p>
                                      <p className="font-semibold text-orange-900">{item.bundleDetails.perfume4Name}</p>
                                      <p className="text-sm text-orange-700 mt-1">Size: {item.bundleDetails.size4}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    Size: {item.size}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <h4 className="font-semibold mb-3">Customer Information:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <p><strong>Name:</strong> {order.customer.name}</p>
                          <p><strong>Address:</strong> {order.customer.address}</p>
                          <p><strong>Phone 1:</strong> {order.customer.phone1}</p>
                          <p><strong>Phone 2:</strong> {order.customer.phone2}</p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <h4 className="font-semibold mb-3">Payment Information:</h4>
                        {order.payment ? (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                              <p><strong>Method:</strong> <span className="text-green-700">{order.payment.methodName}</span></p>
                              <p><strong>Amount:</strong> {order.payment.amount} EGP</p>
                              <p><strong>Sender Phone:</strong> {order.payment.senderPhone}</p>
                            </div>
                            {order.payment.screenshot && (
                              <div>
                                <p className="font-semibold mb-2">Screenshot:</p>
                                <img
                                  src={order.payment.screenshot}
                                  alt="Payment Screenshot"
                                  className="max-w-xs h-48 object-contain rounded border cursor-pointer hover:opacity-80"
                                  onClick={() => setImageModal(order.payment.screenshot)}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <p><strong>Method:</strong> <span className="text-yellow-700">Cash on Delivery</span></p>
                          </div>
                        )}
                      </div>

                      {/* Order Status */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <label className="block text-sm font-medium mb-2">Order Status:</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          className="input-field max-w-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Price Summary */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Subtotal:</span>
                          <span>{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} EGP</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Shipping:</span>
                          <span>{order.shippingFee || 0} EGP</span>
                        </div>
                        {order.promoCode && (
                          <div className="flex justify-between mb-2 text-green-600">
                            <span className="font-semibold">Promo ({order.promoCode}):</span>
                            <span>-{order.discount || 0}%</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>{order.total} EGP</span>
                        </div>
                      </div>

                      {/* Delete Order Button */}
                      <div className="mt-4">
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                        >
                          Delete Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Promo Codes Tab */}
          {activeTab === 'promo-codes' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Manage Promo Codes</h2>

              {/* Create Promo Code Form */}
              <div className="card p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Create New Promo Code</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await axios.post('/api/promo', promoForm, { withCredentials: true });
                    Swal.fire({
                      icon: 'success',
                      title: 'Promo Code Created!',
                      html: `
                        <p>Your promo code: <strong style="font-size: 24px; color: #059669;">${response.data.promoCode.code}</strong></p>
                        <p>Discount: ${response.data.promoCode.discount}%</p>
                        <p>Max Uses: ${response.data.promoCode.maxUses}</p>
                        <p>Expires: ${new Date(response.data.promoCode.expiryDate).toLocaleDateString()}</p>
                      `,
                      confirmButtonText: 'OK'
                    });
                    fetchPromoCodes();
                  } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create promo code' });
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={promoForm.discount}
                        onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                        className="input-field"
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Uses</label>
                      <input
                        type="number"
                        value={promoForm.maxUses}
                        onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })}
                        className="input-field"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry (Days)</label>
                      <input
                        type="number"
                        value={promoForm.expiryDays}
                        onChange={(e) => setPromoForm({ ...promoForm, expiryDays: e.target.value })}
                        className="input-field"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    Generate Promo Code
                  </button>
                </form>
              </div>

              {/* Promo Codes List */}
              <div className="space-y-4">
                {promoCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No promo codes found</p>
                  </div>
                ) : (
                  promoCodes.map((promo) => {
                    const isExpired = new Date() > new Date(promo.expiryDate);
                    const isMaxedOut = promo.currentUses >= promo.maxUses;

                    return (
                      <div key={promo._id} className="card p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <h3 className="text-xl sm:text-2xl font-bold text-green-600">{promo.code}</h3>
                              {!promo.active && (
                                <span className="bg-gray-500 text-white px-2 py-1 text-xs rounded">INACTIVE</span>
                              )}
                              {isExpired && (
                                <span className="bg-red-500 text-white px-2 py-1 text-xs rounded">EXPIRED</span>
                              )}
                              {isMaxedOut && (
                                <span className="bg-orange-500 text-white px-2 py-1 text-xs rounded">MAX USES</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 text-xs sm:text-sm">Discount</p>
                                <p className="font-semibold">{promo.discount}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs sm:text-sm">Uses</p>
                                <p className="font-semibold">{promo.currentUses} / {promo.maxUses}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs sm:text-sm">Expires</p>
                                <p className="font-semibold text-xs sm:text-sm">{new Date(promo.expiryDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs sm:text-sm">Created</p>
                                <p className="font-semibold text-xs sm:text-sm">{new Date(promo.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Delete Promo Code?',
                                text: `Are you sure you want to delete ${promo.code}?`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                confirmButtonText: 'Yes, delete it!'
                              });

                              if (result.isConfirmed) {
                                try {
                                  await axios.delete('/api/promo', {
                                    data: { code: promo.code },
                                    withCredentials: true
                                  });
                                  Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
                                  fetchPromoCodes();
                                } catch (error) {
                                  Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete promo code' });
                                }
                              }
                            }}
                            className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-600 text-sm whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-50"
            onClick={() => setImageModal(null)}
          />
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="relative max-w-4xl max-h-full">
              <button 
                onClick={() => setImageModal(null)}
                className="absolute -top-10 right-0 text-white hover:opacity-70 text-2xl"
              >
                ✕
              </button>
              <img
                src={imageModal}
                alt="Payment Screenshot"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-40">
        <div className="max-w-md mx-auto flex justify-around items-center py-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center px-6 py-2 rounded-lg transition-colors ${
              activeView === 'dashboard'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-xs font-semibold">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveView('notifications');
              loadNotificationCount();
            }}
            className={`flex flex-col items-center px-6 py-2 rounded-lg transition-colors relative ${
              activeView === 'notifications'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-2xl mb-1">🔔</span>
            <span className="text-xs font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('profile')}
            className={`flex flex-col items-center px-6 py-2 rounded-lg transition-colors ${
              activeView === 'profile'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </div>

      {/* Add padding at bottom to prevent content from being hidden by bottom nav */}
      <div className="h-20"></div>
    </div>
  );
};

export default AdminDashboard;
