import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [otherProducts, setOtherProducts] = useState([]);
  
  // Bundle specific states
  const [selectedBundleSize1, setSelectedBundleSize1] = useState('');
  const [selectedBundleSize2, setSelectedBundleSize2] = useState('');
  const [activePerfume, setActivePerfume] = useState(1); // 1 or 2

  useEffect(() => {
    fetchProduct();
    fetchOtherProducts();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const productData = Array.isArray(response.data) ? response.data[0] : response.data;
      setProduct(productData);
      
      // For bundles, set initial sizes and calculate price
      if (productData.isBundle) {
        const size1 = productData.bundlePerfume1?.sizesWithPrices?.[0];
        const size2 = productData.bundlePerfume2?.sizesWithPrices?.[0];
        if (size1 && size2) {
          setSelectedBundleSize1(size1.size);
          setSelectedBundleSize2(size2.size);
          setCurrentPrice(size1.price + size2.price);
        }
      } else {
        // Set initial size and price (skip sold out sizes)
        if (productData.sizesWithPrices?.length > 0) {
          const availableSize = productData.sizesWithPrices.find(s => !s.soldOut) || productData.sizesWithPrices[0];
          setSelectedSize(availableSize.size);
          setCurrentPrice(availableSize.price);
        } else if (productData.sizes?.length > 0) {
          // Fallback for old products
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
      const response = await axios.get(`/api/products?limit=4&random=true&exclude=${id}`);
      setOtherProducts(response.data);
    } catch (error) {
      // Shuffle mock products randomly and exclude current product
      const shuffled = [...mockProducts]
        .filter(p => p._id !== id)
        .sort(() => Math.random() - 0.5);
      setOtherProducts(shuffled.slice(0, 4));
    }
  };

  const handleAddToCart = () => {
    if (product.soldOut) {
      Swal.fire({
        icon: 'error',
        title: 'Sold Out',
        text: 'This product is currently sold out.'
      });
      return;
    }

    if (product.isBundle) {
      if (!selectedBundleSize1 || !selectedBundleSize2) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Selection',
          text: 'Please select sizes for both perfumes.'
        });
        return;
      }
      
      const bundleSize = `${selectedBundleSize1} + ${selectedBundleSize2}`;
      const bundleDetails = {
        perfume1Name: product.bundlePerfume1.name,
        perfume2Name: product.bundlePerfume2.name,
        size1: selectedBundleSize1,
        size2: selectedBundleSize2
      };
      
      addToCart(product, bundleSize, 'Default', quantity, currentPrice, bundleDetails);
    } else {
      if (!selectedSize) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Selection',
          text: 'Please select a bottle size before adding to cart.'
        });
        return;
      }
      
      addToCart(product, selectedSize, 'Default', quantity, currentPrice);
    }

    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${product.name} has been added to your cart.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleBuyNow = () => {
    if (product.soldOut) {
      Swal.fire({
        icon: 'error',
        title: 'Sold Out',
        text: 'This product is currently sold out.'
      });
      return;
    }

    if (product.isBundle) {
      if (!selectedBundleSize1 || !selectedBundleSize2) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Selection',
          text: 'Please select sizes for both perfumes.'
        });
        return;
      }
      
      const bundleSize = `${selectedBundleSize1} + ${selectedBundleSize2}`;
      const bundleDetails = {
        perfume1Name: product.bundlePerfume1.name,
        perfume2Name: product.bundlePerfume2.name,
        size1: selectedBundleSize1,
        size2: selectedBundleSize2
      };
      
      addToCart(product, bundleSize, 'Default', quantity, currentPrice, bundleDetails);
    } else {
      if (!selectedSize) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Selection',
          text: 'Please select a bottle size before proceeding.'
        });
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
            // Bundle Display - New Design with Circles
            <div className="space-y-6">
              {/* Perfume Selection Circles */}
              <div className="flex justify-center gap-8">
                {/* Perfume 1 Circle */}
                <div 
                  onClick={() => setActivePerfume(1)}
                  className={`cursor-pointer transition-all duration-300 ${activePerfume === 1 ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                    activePerfume === 1 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}>
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <p className={`text-center mt-3 font-montserrat text-sm max-w-24 leading-tight ${
                    activePerfume === 1 ? 'font-semibold text-black' : 'text-gray-600'
                  }`}>
                    {product.bundlePerfume1?.name}
                  </p>
                  {selectedBundleSize1 && (
                    <p className="text-center text-xs text-gray-500 mt-1">{selectedBundleSize1}</p>
                  )}
                </div>

                {/* Perfume 2 Circle */}
                <div 
                  onClick={() => setActivePerfume(2)}
                  className={`cursor-pointer transition-all duration-300 ${activePerfume === 2 ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                    activePerfume === 2 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}>
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <p className={`text-center mt-3 font-montserrat text-sm max-w-24 leading-tight ${
                    activePerfume === 2 ? 'font-semibold text-black' : 'text-gray-600'
                  }`}>
                    {product.bundlePerfume2?.name}
                  </p>
                  {selectedBundleSize2 && (
                    <p className="text-center text-xs text-gray-500 mt-1">{selectedBundleSize2}</p>
                  )}
                </div>
              </div>

              {/* Size Selection for Active Perfume */}
              <div className="bg-gray-50 rounded-xl p-6 transition-all">
                <h4 className="font-montserrat font-semibold text-center mb-4 text-lg">
                  {activePerfume === 1 ? product.bundlePerfume1?.name : product.bundlePerfume2?.name}
                </h4>
                <p className="text-center text-gray-500 text-sm mb-4">Select Size</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {(activePerfume === 1 ? product.bundlePerfume1?.sizesWithPrices : product.bundlePerfume2?.sizesWithPrices)?.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!item.soldOut) {
                          if (activePerfume === 1) {
                            setSelectedBundleSize1(item.size);
                            const price2 = product.bundlePerfume2?.sizesWithPrices?.find(s => s.size === selectedBundleSize2)?.price || 0;
                            setCurrentPrice(item.price + price2);
                          } else {
                            setSelectedBundleSize2(item.size);
                            const price1 = product.bundlePerfume1?.sizesWithPrices?.find(s => s.size === selectedBundleSize1)?.price || 0;
                            setCurrentPrice(price1 + item.price);
                          }
                        }
                      }}
                      disabled={item.soldOut}
                      className={`px-4 py-3 font-montserrat transition-all rounded-lg relative ${
                        item.soldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                          : (activePerfume === 1 ? selectedBundleSize1 : selectedBundleSize2) === item.size
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
                  ))}
                </div>
              </div>

              {/* Selected Summary */}
              <div className="bg-beige-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-montserrat">
                  <span className="font-medium">{product.bundlePerfume1?.name}:</span> {selectedBundleSize1 || 'Not selected'}
                  <span className="mx-2">•</span>
                  <span className="font-medium">{product.bundlePerfume2?.name}:</span> {selectedBundleSize2 || 'Not selected'}
                </p>
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

        {/* Other Products */}
        <section className="mt-20">
          <h2 className="text-3xl font-playfair text-center mb-12 text-black">Others Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {otherProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
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
