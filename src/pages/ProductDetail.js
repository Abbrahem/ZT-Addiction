import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [otherProducts, setOtherProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Bundle specific states
  const [selectedBundleSize1, setSelectedBundleSize1] = useState('');
  const [selectedBundleSize2, setSelectedBundleSize2] = useState('');
  const [selectedBundleSize3, setSelectedBundleSize3] = useState('');
  const [selectedBundleSize4, setSelectedBundleSize4] = useState('');
  const [activePerfume, setActivePerfume] = useState(1);

  // Helper functions for sold out handling
  const hasAvailableSizes = (perfume) => {
    if (!perfume?.sizesWithPrices || perfume.sizesWithPrices.length === 0) return false;
    return perfume.sizesWithPrices.some(s => !s.soldOut);
  };

  const getFirstAvailableSize = (perfume) => {
    if (!perfume?.sizesWithPrices) return null;
    return perfume.sizesWithPrices.find(s => !s.soldOut);
  };

  const isPerfumeFullySoldOut = (perfume) => {
    if (!perfume?.name || !perfume?.sizesWithPrices || perfume.sizesWithPrices.length === 0) return true;
    return perfume.sizesWithPrices.every(s => s.soldOut);
  };

  useEffect(() => {
    fetchProduct();
    fetchOtherProducts();
    loadRecentlyViewed();
    saveToRecentlyViewed();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const productData = Array.isArray(response.data) ? response.data[0] : response.data;
      setProduct(productData);
      
      // For bundles, set initial sizes and calculate price (skip sold out)
      if (productData.isBundle) {
        let totalPrice = 0;
        
        const availableSize1 = getFirstAvailableSize(productData.bundlePerfume1);
        if (availableSize1) { setSelectedBundleSize1(availableSize1.size); totalPrice += availableSize1.price; }
        else { setSelectedBundleSize1(''); }
        
        const availableSize2 = getFirstAvailableSize(productData.bundlePerfume2);
        if (availableSize2) { setSelectedBundleSize2(availableSize2.size); totalPrice += availableSize2.price; }
        else { setSelectedBundleSize2(''); }
        
        const availableSize3 = getFirstAvailableSize(productData.bundlePerfume3);
        if (availableSize3) { setSelectedBundleSize3(availableSize3.size); totalPrice += availableSize3.price; }
        else { setSelectedBundleSize3(''); }
        
        const availableSize4 = getFirstAvailableSize(productData.bundlePerfume4);
        if (availableSize4) { setSelectedBundleSize4(availableSize4.size); totalPrice += availableSize4.price; }
        else { setSelectedBundleSize4(''); }
        
        setCurrentPrice(totalPrice);
      } else {
        // Set initial size and price (skip sold out sizes)
        if (productData.sizesWithPrices?.length > 0) {
          const availableSize = productData.sizesWithPrices.find(s => !s.soldOut) || productData.sizesWithPrices[0];
          setSelectedSize(availableSize.size);
          setCurrentPrice(availableSize.price);
        } else if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0]);
          setCurrentPrice(productData.priceEGP || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      const mockProduct = mockProducts.find(p => p._id === id);
      if (mockProduct) {
        setProduct(mockProduct);
        if (mockProduct.sizesWithPrices?.length > 0) {
          const availableSize = mockProduct.sizesWithPrices.find(s => !s.soldOut) || mockProduct.sizesWithPrices[0];
          setSelectedSize(availableSize.size);
          setCurrentPrice(availableSize.price);
        } else if (mockProduct.sizes?.length > 0) {
          setSelectedSize(mockProduct.sizes[0]);
          setCurrentPrice(mockProduct.priceEGP || 0);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Product Not Found',
          text: 'The product you are looking for does not exist.'
        }).then(() => {
          navigate('/products');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherProducts = async () => {
    try {
      // Fetch related products from same category
      if (product?.collection) {
        const response = await axios.get(`/api/products?collection=${product.collection}&limit=4&exclude=${id}`);
        setOtherProducts(response.data);
      } else {
        const response = await axios.get(`/api/products?limit=4&random=true&exclude=${id}`);
        setOtherProducts(response.data);
      }
    } catch (error) {
      // Fallback to mock data with same category
      let filtered = [...mockProducts].filter(p => p._id !== id);
      if (product?.collection) {
        filtered = filtered.filter(p => p.collection === product.collection);
      }
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setOtherProducts(shuffled.slice(0, 4));
    }
  };

  const saveToRecentlyViewed = () => {
    if (!product) return;
    
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter(item => item.id !== id);
    const updated = [
      { id: product._id, name: product.name, image: product.images?.[0], price: product.sizesWithPrices?.[0]?.price || product.priceEGP, timestamp: Date.now() },
      ...filtered
    ].slice(0, 10); // Keep only last 10
    
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const loadRecentlyViewed = () => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    // Show last viewed products excluding current one
    const filtered = viewed.filter(item => item.id !== id);
    setRecentlyViewed(filtered.slice(0, 4));
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product._id)) {
      Swal.fire({
        icon: 'info',
        title: 'Already in Wishlist',
        text: 'This product is already in your wishlist',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addToWishlist(product);
      Swal.fire({
        icon: 'success',
        title: 'Added to Wishlist',
        text: `${product.name} has been added to your wishlist.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleAddToCart = () => {
    if (product.soldOut) {
      Swal.fire({ icon: 'error', title: 'Sold Out', text: 'This product is currently sold out.' });
      return;
    }

    if (product.isBundle) {
      const perfume1Available = hasAvailableSizes(product.bundlePerfume1);
      const perfume2Available = hasAvailableSizes(product.bundlePerfume2);
      const perfume3Exists = product.bundlePerfume3?.name;
      const perfume4Exists = product.bundlePerfume4?.name;
      const perfume3Available = perfume3Exists && hasAvailableSizes(product.bundlePerfume3);
      const perfume4Available = perfume4Exists && hasAvailableSizes(product.bundlePerfume4);
      
      if (perfume1Available && !selectedBundleSize1) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 1.' });
        return;
      }
      if (perfume2Available && !selectedBundleSize2) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 2.' });
        return;
      }
      if (perfume3Available && !selectedBundleSize3) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 3.' });
        return;
      }
      if (perfume4Available && !selectedBundleSize4) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 4.' });
        return;
      }
      
      let bundleSizeParts = [];
      if (selectedBundleSize1) bundleSizeParts.push(selectedBundleSize1);
      if (selectedBundleSize2) bundleSizeParts.push(selectedBundleSize2);
      if (selectedBundleSize3) bundleSizeParts.push(selectedBundleSize3);
      if (selectedBundleSize4) bundleSizeParts.push(selectedBundleSize4);
      const bundleSize = bundleSizeParts.join(' + ');
      
      const bundleDetails = {
        perfume1Name: selectedBundleSize1 ? product.bundlePerfume1.name : null,
        perfume2Name: selectedBundleSize2 ? product.bundlePerfume2.name : null,
        size1: selectedBundleSize1 || null,
        size2: selectedBundleSize2 || null,
        perfume3Name: selectedBundleSize3 ? product.bundlePerfume3?.name : null,
        size3: selectedBundleSize3 || null,
        perfume4Name: selectedBundleSize4 ? product.bundlePerfume4?.name : null,
        size4: selectedBundleSize4 || null
      };
      
      addToCart(product, bundleSize, 'Default', quantity, currentPrice, bundleDetails);
    } else {
      if (!selectedSize) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select a bottle size before adding to cart.' });
        return;
      }
      addToCart(product, selectedSize, 'Default', quantity, currentPrice);
    }

    Swal.fire({ icon: 'success', title: 'Added to Cart', text: `${product.name} has been added to your cart.`, timer: 1500, showConfirmButton: false });
  };

  const handleBuyNow = () => {
    if (product.soldOut) {
      Swal.fire({ icon: 'error', title: 'Sold Out', text: 'This product is currently sold out.' });
      return;
    }

    if (product.isBundle) {
      const perfume1Available = hasAvailableSizes(product.bundlePerfume1);
      const perfume2Available = hasAvailableSizes(product.bundlePerfume2);
      const perfume3Exists = product.bundlePerfume3?.name;
      const perfume4Exists = product.bundlePerfume4?.name;
      const perfume3Available = perfume3Exists && hasAvailableSizes(product.bundlePerfume3);
      const perfume4Available = perfume4Exists && hasAvailableSizes(product.bundlePerfume4);
      
      if (perfume1Available && !selectedBundleSize1) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 1.' });
        return;
      }
      if (perfume2Available && !selectedBundleSize2) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 2.' });
        return;
      }
      if (perfume3Available && !selectedBundleSize3) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 3.' });
        return;
      }
      if (perfume4Available && !selectedBundleSize4) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select size for Perfume 4.' });
        return;
      }
      
      let bundleSizeParts = [];
      if (selectedBundleSize1) bundleSizeParts.push(selectedBundleSize1);
      if (selectedBundleSize2) bundleSizeParts.push(selectedBundleSize2);
      if (selectedBundleSize3) bundleSizeParts.push(selectedBundleSize3);
      if (selectedBundleSize4) bundleSizeParts.push(selectedBundleSize4);
      const bundleSize = bundleSizeParts.join(' + ');
      
      const bundleDetails = {
        perfume1Name: selectedBundleSize1 ? product.bundlePerfume1.name : null,
        perfume2Name: selectedBundleSize2 ? product.bundlePerfume2.name : null,
        size1: selectedBundleSize1 || null,
        size2: selectedBundleSize2 || null,
        perfume3Name: selectedBundleSize3 ? product.bundlePerfume3?.name : null,
        size3: selectedBundleSize3 || null,
        perfume4Name: selectedBundleSize4 ? product.bundlePerfume4?.name : null,
        size4: selectedBundleSize4 || null
      };
      
      addToCart(product, bundleSize, 'Default', quantity, currentPrice, bundleDetails);
    } else {
      if (!selectedSize) {
        Swal.fire({ icon: 'warning', title: 'Missing Selection', text: 'Please select a bottle size before proceeding.' });
        return;
      }
      addToCart(product, selectedSize, 'Default', quantity, currentPrice);
    }

    navigate('/checkout');
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    
    // Update price based on selected size
    if (product.sizesWithPrices) {
      const sizeData = product.sizesWithPrices.find(item => item.size === size);
      if (sizeData) {
        setCurrentPrice(sizeData.price);
      }
    }
  };

  const updateQuantity = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-xl font-montserrat">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-xl font-montserrat">Product not found</div>
      </div>
    );
  }

  const ProductCard = ({ product }) => (
    <div className="group relative">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden mb-3" style={{ paddingBottom: '75%' }}>
          <img
            src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.soldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                SOLD OUT
              </span>
            </div>
          )}
        </div>
        <h3 className="font-montserrat text-sm md:text-base mb-1 text-black leading-tight">{product.name}</h3>
        <p className="font-montserrat text-sm md:text-base font-semibold text-black">
          {product.sizesWithPrices && product.sizesWithPrices.length > 0 
            ? `${product.sizesWithPrices[0].price} EGP` 
            : `${product.priceEGP} EGP`}
        </p>
      </Link>
      
      {/* Wishlist Heart Icon */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (isInWishlist(product._id)) {
            Swal.fire({
              icon: 'info',
              title: 'Already in Wishlist',
              timer: 1000,
              showConfirmButton: false
            });
          } else {
            addToWishlist(product);
            Swal.fire({
              icon: 'success',
              title: 'Added to Wishlist',
              timer: 1000,
              showConfirmButton: false
            });
          }
        }}
        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
      >
        <svg 
          className="w-5 h-5" 
          fill={isInWishlist(product._id) ? '#ef4444' : 'none'} 
          stroke={isInWishlist(product._id) ? '#ef4444' : 'currentColor'} 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-beige-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Image Carousel */}
        <div className="mb-8">
          <div className="relative overflow-x-auto scrollbar-hide" style={{ height: '60vh' }}>
            <div className="flex space-x-4 h-full">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div key={index} className="flex-shrink-0 h-full" style={{ width: '80vw', maxWidth: '600px' }}>
                    <img
                      src={`/api/images/${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 h-full bg-gray-200" style={{ width: '80vw', maxWidth: '600px' }}>
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-playfair text-black">{product.name}</h1>
          <p className="text-2xl font-montserrat font-semibold text-black">{currentPrice} EGP</p>

          <hr className="border-beige-300" />

          {/* Size Selector */}
          {product.isBundle ? (
            // Bundle Display - New Design with Circles (supports 2-4 perfumes)
            <div className="space-y-6">
              {/* Perfume Selection Circles */}
              <div className="flex justify-center gap-4 flex-wrap">
                {/* Perfume 1 Circle */}
                {(() => {
                  const isFullySoldOut = isPerfumeFullySoldOut(product.bundlePerfume1);
                  return (
                    <div 
                      onClick={() => !isFullySoldOut && setActivePerfume(1)}
                      className={`transition-all duration-300 ${isFullySoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activePerfume === 1 && !isFullySoldOut ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                        isFullySoldOut ? 'border-red-300 bg-red-100 text-red-400' :
                        activePerfume === 1 ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-black hover:border-gray-400'
                      }`}>
                        <span className={`text-xl sm:text-2xl font-bold ${isFullySoldOut ? 'line-through' : ''}`}>1</span>
                      </div>
                      <p className={`text-center mt-2 font-montserrat text-xs sm:text-sm max-w-20 sm:max-w-24 leading-tight ${isFullySoldOut ? 'line-through text-red-400' : activePerfume === 1 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                        {product.bundlePerfume1?.name}
                      </p>
                      {isFullySoldOut ? (
                        <p className="text-center text-xs text-red-500 mt-1">Sold Out</p>
                      ) : selectedBundleSize1 && (
                        <p className="text-center text-xs text-green-600 mt-1 font-medium">{selectedBundleSize1}</p>
                      )}
                    </div>
                  );
                })()}

                {/* Perfume 2 Circle */}
                {(() => {
                  const isFullySoldOut = isPerfumeFullySoldOut(product.bundlePerfume2);
                  return (
                    <div 
                      onClick={() => !isFullySoldOut && setActivePerfume(2)}
                      className={`transition-all duration-300 ${isFullySoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activePerfume === 2 && !isFullySoldOut ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                        isFullySoldOut ? 'border-red-300 bg-red-100 text-red-400' :
                        activePerfume === 2 ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-black hover:border-gray-400'
                      }`}>
                        <span className={`text-xl sm:text-2xl font-bold ${isFullySoldOut ? 'line-through' : ''}`}>2</span>
                      </div>
                      <p className={`text-center mt-2 font-montserrat text-xs sm:text-sm max-w-20 sm:max-w-24 leading-tight ${isFullySoldOut ? 'line-through text-red-400' : activePerfume === 2 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                        {product.bundlePerfume2?.name}
                      </p>
                      {isFullySoldOut ? (
                        <p className="text-center text-xs text-red-500 mt-1">Sold Out</p>
                      ) : selectedBundleSize2 && (
                        <p className="text-center text-xs text-green-600 mt-1 font-medium">{selectedBundleSize2}</p>
                      )}
                    </div>
                  );
                })()}

                {/* Perfume 3 Circle (Optional) */}
                {product.bundlePerfume3?.name && (() => {
                  const isFullySoldOut = isPerfumeFullySoldOut(product.bundlePerfume3);
                  return (
                    <div 
                      onClick={() => !isFullySoldOut && setActivePerfume(3)}
                      className={`transition-all duration-300 ${isFullySoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activePerfume === 3 && !isFullySoldOut ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                        isFullySoldOut ? 'border-red-300 bg-red-100 text-red-400' :
                        activePerfume === 3 ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-black hover:border-gray-400'
                      }`}>
                        <span className={`text-xl sm:text-2xl font-bold ${isFullySoldOut ? 'line-through' : ''}`}>3</span>
                      </div>
                      <p className={`text-center mt-2 font-montserrat text-xs sm:text-sm max-w-20 sm:max-w-24 leading-tight ${isFullySoldOut ? 'line-through text-red-400' : activePerfume === 3 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                        {product.bundlePerfume3?.name}
                      </p>
                      {isFullySoldOut ? (
                        <p className="text-center text-xs text-red-500 mt-1">Sold Out</p>
                      ) : selectedBundleSize3 && (
                        <p className="text-center text-xs text-green-600 mt-1 font-medium">{selectedBundleSize3}</p>
                      )}
                    </div>
                  );
                })()}

                {/* Perfume 4 Circle (Optional) */}
                {product.bundlePerfume4?.name && (() => {
                  const isFullySoldOut = isPerfumeFullySoldOut(product.bundlePerfume4);
                  return (
                    <div 
                      onClick={() => !isFullySoldOut && setActivePerfume(4)}
                      className={`transition-all duration-300 ${isFullySoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activePerfume === 4 && !isFullySoldOut ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                        isFullySoldOut ? 'border-red-300 bg-red-100 text-red-400' :
                        activePerfume === 4 ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-black hover:border-gray-400'
                      }`}>
                        <span className={`text-xl sm:text-2xl font-bold ${isFullySoldOut ? 'line-through' : ''}`}>4</span>
                      </div>
                      <p className={`text-center mt-2 font-montserrat text-xs sm:text-sm max-w-20 sm:max-w-24 leading-tight ${isFullySoldOut ? 'line-through text-red-400' : activePerfume === 4 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                        {product.bundlePerfume4?.name}
                      </p>
                      {isFullySoldOut ? (
                        <p className="text-center text-xs text-red-500 mt-1">Sold Out</p>
                      ) : selectedBundleSize4 && (
                        <p className="text-center text-xs text-green-600 mt-1 font-medium">{selectedBundleSize4}</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Size Selection for Active Perfume */}
              <div className="bg-gray-50 rounded-xl p-6 transition-all">
                <h4 className="font-montserrat font-semibold text-center mb-4 text-lg">
                  {activePerfume === 1 && product.bundlePerfume1?.name}
                  {activePerfume === 2 && product.bundlePerfume2?.name}
                  {activePerfume === 3 && product.bundlePerfume3?.name}
                  {activePerfume === 4 && product.bundlePerfume4?.name}
                </h4>
                <p className="text-center text-gray-500 text-sm mb-4">Select Size</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const perfumeData = activePerfume === 1 ? product.bundlePerfume1 
                      : activePerfume === 2 ? product.bundlePerfume2 
                      : activePerfume === 3 ? product.bundlePerfume3 
                      : product.bundlePerfume4;
                    
                    const selectedSize = activePerfume === 1 ? selectedBundleSize1 
                      : activePerfume === 2 ? selectedBundleSize2 
                      : activePerfume === 3 ? selectedBundleSize3 
                      : selectedBundleSize4;
                    
                    // Check if all sizes are sold out
                    const allSoldOut = perfumeData?.sizesWithPrices?.every(s => s.soldOut);
                    if (allSoldOut) {
                      return (
                        <div className="col-span-2 text-center py-4 text-red-500">
                          All sizes are sold out for this perfume
                        </div>
                      );
                    }
                    
                    return perfumeData?.sizesWithPrices?.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!item.soldOut) {
                            if (activePerfume === 1) setSelectedBundleSize1(item.size);
                            else if (activePerfume === 2) setSelectedBundleSize2(item.size);
                            else if (activePerfume === 3) setSelectedBundleSize3(item.size);
                            else setSelectedBundleSize4(item.size);
                            
                            const p1 = activePerfume === 1 ? item.price : (product.bundlePerfume1?.sizesWithPrices?.find(s => s.size === selectedBundleSize1)?.price || 0);
                            const p2 = activePerfume === 2 ? item.price : (product.bundlePerfume2?.sizesWithPrices?.find(s => s.size === selectedBundleSize2)?.price || 0);
                            const p3 = activePerfume === 3 ? item.price : (product.bundlePerfume3?.sizesWithPrices?.find(s => s.size === selectedBundleSize3)?.price || 0);
                            const p4 = activePerfume === 4 ? item.price : (product.bundlePerfume4?.sizesWithPrices?.find(s => s.size === selectedBundleSize4)?.price || 0);
                            setCurrentPrice(p1 + p2 + p3 + p4);
                          }
                        }}
                        disabled={item.soldOut}
                        className={`px-4 py-3 font-montserrat transition-all rounded-lg relative ${
                          item.soldOut
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : selectedSize === item.size
                              ? 'bg-black text-white shadow-md'
                              : 'bg-white text-black border border-gray-200 hover:border-black'
                        }`}
                      >
                        <div className={`font-medium ${item.soldOut ? 'line-through' : ''}`}>{item.size}</div>
                        <div className={`text-sm ${item.soldOut ? 'line-through' : ''}`}>{item.price} EGP</div>
                        {item.soldOut && (
                          <div className="text-xs mt-1" style={{ textDecoration: 'none' }}>Sold Out</div>
                        )}
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Selected Summary */}
              <div className="bg-beige-100 rounded-lg p-4">
                <div className="text-sm text-gray-600 font-montserrat space-y-1">
                  <p><span className="font-medium">{product.bundlePerfume1?.name}:</span> {isPerfumeFullySoldOut(product.bundlePerfume1) ? <span className="text-red-500">Sold Out</span> : (selectedBundleSize1 || 'Not selected')}</p>
                  <p><span className="font-medium">{product.bundlePerfume2?.name}:</span> {isPerfumeFullySoldOut(product.bundlePerfume2) ? <span className="text-red-500">Sold Out</span> : (selectedBundleSize2 || 'Not selected')}</p>
                  {product.bundlePerfume3?.name && (
                    <p><span className="font-medium">{product.bundlePerfume3?.name}:</span> {isPerfumeFullySoldOut(product.bundlePerfume3) ? <span className="text-red-500">Sold Out</span> : (selectedBundleSize3 || 'Not selected')}</p>
                  )}
                  {product.bundlePerfume4?.name && (
                    <p><span className="font-medium">{product.bundlePerfume4?.name}:</span> {isPerfumeFullySoldOut(product.bundlePerfume4) ? <span className="text-red-500">Sold Out</span> : (selectedBundleSize4 || 'Not selected')}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Regular Product Size Selector
            ((product.sizesWithPrices && product.sizesWithPrices.length > 0) || (product.sizes && product.sizes.length > 0)) && (
            <div>
              {/* Use sizesWithPrices if available, otherwise fallback to sizes */}
              {product.sizesWithPrices && product.sizesWithPrices.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {product.sizesWithPrices.map((sizeData) => (
                    <button
                      key={sizeData.size}
                      onClick={() => !sizeData.soldOut && handleSizeChange(sizeData.size)}
                      disabled={sizeData.soldOut}
                      className={`px-6 py-4 font-montserrat transition-all relative ${
                        sizeData.soldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                          : selectedSize === sizeData.size
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-beige-100'
                      }`}
                    >
                      <div className={sizeData.soldOut ? 'line-through' : ''}>{sizeData.size}</div>
                      <div className={`text-sm ${sizeData.soldOut ? 'line-through' : ''}`}>{sizeData.price} EGP</div>
                      {sizeData.soldOut && (
                        <div className="text-xs mt-1 no-underline" style={{ textDecoration: 'none' }}>Sold Out</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // Fallback for old products
                product.sizes.length === 1 ? (
                  <div className="w-full bg-black text-white px-6 py-4 text-center font-montserrat">
                    {product.sizes[0]}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-6 py-4 font-montserrat transition-all ${
                          selectedSize === size
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-beige-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
            )
          )}

          <hr className="border-beige-300" />

          {/* Size Guide Dropdown */}
          <div>
            <button
              onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
              className="w-full flex justify-between items-center py-4 font-montserrat text-black"
            >
              <span>Size Guide</span>
              <svg className={`w-5 h-5 transition-transform ${sizeGuideOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {sizeGuideOpen && (
              <div className="pb-4">
                <img src="/shart.jpg" alt="Size Guide" className="w-full max-w-md" />
              </div>
            )}
          </div>

          <hr className="border-beige-300" />

          {/* Add to Cart & Quantity */}
          {product.soldOut ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-6 py-4 font-montserrat cursor-not-allowed text-lg font-semibold"
            >
              SOLD OUT
            </button>
          ) : (
            <>
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={handleAddToCart}
                  style={{ width: '70%' }}
                  className="bg-black text-white px-4 sm:px-6 py-4 font-montserrat hover:bg-gray-800 transition-all text-sm sm:text-base"
                >
                  Add to Cart
                </button>
                <div className="flex items-center bg-white border border-gray-300" style={{ width: '30%' }}>
                  <button
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                    className="flex-1 py-4 hover:bg-beige-100 disabled:opacity-50 font-montserrat text-lg"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-montserrat">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(1)}
                    disabled={quantity >= 10}
                    className="flex-1 py-4 hover:bg-beige-100 disabled:opacity-50 font-montserrat text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-black text-white px-6 py-4 font-montserrat hover:bg-gray-800 transition-all"
              >
                Buy it now
              </button>
              
              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-montserrat transition-all border-2 ${
                  isInWishlist(product._id)
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'bg-white border-gray-300 text-black hover:border-black'
                }`}
              >
                <svg 
                  className="w-5 h-5" 
                  fill={isInWishlist(product._id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </>
          )}

          <hr className="border-beige-300" />

          {/* Description Dropdown */}
          <div>
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className="w-full flex justify-between items-center py-4 font-montserrat text-black"
            >
              <span>Description</span>
              <svg className={`w-5 h-5 transition-transform ${descriptionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {descriptionOpen && (
              <div className="pb-4 font-montserrat text-gray-700">
                {product.description || 'No description available.'}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-20">
          <h2 className="text-3xl font-playfair text-center mb-12 text-black">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {otherProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl font-playfair text-center mb-12 text-black">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {recentlyViewed.map((item) => (
                <div key={item.id} className="group relative">
                  <Link to={`/products/${item.id}`} className="block">
                    <div className="relative overflow-hidden mb-3" style={{ paddingBottom: '75%' }}>
                      <img
                        src={item.image ? `/api/images/${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-montserrat text-sm md:text-base mb-1 text-black leading-tight">{item.name}</h3>
                    <p className="font-montserrat text-sm md:text-base font-semibold text-black">{item.price} EGP</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

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

export default ProductDetail;
