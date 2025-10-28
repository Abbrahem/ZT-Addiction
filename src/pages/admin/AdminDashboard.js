import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add-product');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Promo code form state
  const [promoForm, setPromoForm] = useState({
    discount: '10',
    maxUses: '10',
    expiryDays: '1'
  });
  const [generatedCode, setGeneratedCode] = useState('');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    collection: '',
    images: [],
    sizesWithPrices: [] // Array of {size: '5ml', price: 450}
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);

  // Temporary state for adding size/price
  const [tempSize, setTempSize] = useState('');
  const [tempPrice, setTempPrice] = useState('');

  const collections = ['Summer Samples', 'Winter Samples', 'Bundles', 'Bottles'];
  const availableSizes = ['3ml', '5ml', '10ml', '30ml', '50ml', '70ml', '80ml', '100ml', '200ml'];

  useEffect(() => {
    checkAuth();
    if (activeTab === 'manage-products') {
      fetchProducts();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'promo-codes') {
      fetchPromoCodes();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!productForm.name || !productForm.collection) {
      Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Name and collection are required' });
      return;
    }

    if (!productForm.sizesWithPrices || productForm.sizesWithPrices.length === 0) {
      Swal.fire({ icon: 'error', title: 'Missing Sizes', text: 'Please add at least one size with price' });
      return;
    }

    setLoading(true);
    console.log('Submitting product:', productForm);

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productForm, { withCredentials: true });
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
        const response = await axios.post('/api/products', productForm, { withCredentials: true });
        const productId = response.data.productId;

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
        name: '', description: '', collection: '', images: [], sizesWithPrices: []
      });

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
      description: product.description,
      collection: product.collection,
      images: product.images,
      sizesWithPrices: product.sizesWithPrices || (product.size && product.priceEGP ? [{ size: product.size, price: product.priceEGP }] : [])
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

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', orderId, 'to:', newStatus);
      console.log('Sending request body:', { status: newStatus });

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
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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

      {/* Navigation Tabs */}
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

        {/* Tab Content */}
        <div className="mt-8">
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
                    onChange={(e) => setProductForm({ ...productForm, collection: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Collection</option>
                    {collections.map(collection => (
                      <option key={collection} value={collection}>{collection}</option>
                    ))}
                  </select>
                </div>

                {/* Sizes with Prices */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
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
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-1">{product.collection}</p>
                    <p className="text-gray-500 text-sm mb-2">{product.size}</p>
                    <p className="font-bold mb-4">{product.priceEGP} EGP</p>

                    <div className="flex gap-2">
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
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <img
                                src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Size: {item.size}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">{item.price} EGP</p>
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
                    setGeneratedCode(response.data.promoCode.code);
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
