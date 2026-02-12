import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import Swal from 'sweetalert2';

const Home = () => {
  const navigate = useNavigate();
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [bestReviewProducts, setBestReviewProducts] = useState([]);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quickAddPrice, setQuickAddPrice] = useState(0);
  const [selectedBundleSize1, setSelectedBundleSize1] = useState('');
  const [selectedBundleSize2, setSelectedBundleSize2] = useState('');
  const [selectedBundleSize3, setSelectedBundleSize3] = useState('');
  const [selectedBundleSize4, setSelectedBundleSize4] = useState('');
  const [activePerfume, setActivePerfume] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Helper function to check if a perfume has available sizes
  const hasAvailableSizes = (perfume) => {
    if (!perfume?.sizesWithPrices || perfume.sizesWithPrices.length === 0) return false;
    return perfume.sizesWithPrices.some(s => !s.soldOut);
  };

  // Helper function to get first available size
  const getFirstAvailableSize = (perfume) => {
    if (!perfume?.sizesWithPrices) return null;
    return perfume.sizesWithPrices.find(s => !s.soldOut);
  };

  // Helper function to check if perfume is completely sold out
  const isPerfumeFullySoldOut = (perfume) => {
    if (!perfume?.name || !perfume?.sizesWithPrices || perfume.sizesWithPrices.length === 0) return true;
    return perfume.sizesWithPrices.every(s => s.soldOut);
  };

  useEffect(() => {
    fetchBestSellerProducts();
    fetchBestReviewProducts();
    
    // Show quiz modal on every page load
    setTimeout(() => {
      showQuizModal();
    }, 2000); // Show after 2 seconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBestSellerProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const bestSellers = response.data.filter(p => p.isBestSeller === true);
      setBestSellerProducts(bestSellers.slice(0, 6));
    } catch (error) {
      console.log('Error fetching best sellers');
      setBestSellerProducts([]);
    }
  };

  const fetchBestReviewProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const bestReviews = response.data.filter(p => p.isBestReview === true);
      setBestReviewProducts(bestReviews.slice(0, 4));
    } catch (error) {
      console.log('Error fetching best reviews');
      setBestReviewProducts([]);
    }
  };

  const showQuizModal = () => {
    Swal.fire({
      title: '✨ اكتشف عطرك المثالي',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 60px; margin-bottom: 20px;">🌹</div>
          <p style="font-size: 18px; color: #666; margin-bottom: 20px; line-height: 1.6;">
            اختر عطرك على حسب ذوقك وشخصيتك<br/>
            أجب على بعض الأسئلة البسيطة وسنساعدك في اختيار العطر المناسب لك
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ ابدأ الآن',
      cancelButtonText: 'تخطي',
      confirmButtonColor: '#000',
      cancelButtonColor: '#999',
      customClass: {
        popup: 'quiz-modal',
        confirmButton: 'quiz-confirm-btn',
        cancelButton: 'quiz-cancel-btn'
      },
      backdrop: `
        rgba(0,0,0,0.7)
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/perfume-quiz');
      }
    });
  };

  const handleQuickAdd = (product) => {
    if (product.soldOut) {
      Swal.fire({
        icon: 'error',
        title: 'Sold Out',
        text: 'This product is currently sold out.'
      });
      return;
    }
    setQuickAddProduct(product);
    setActivePerfume(1);
    
    // For bundles, set initial sizes and calculate price (skip sold out)
    if (product.isBundle) {
      let totalPrice = 0;
      
      // Perfume 1
      const availableSize1 = getFirstAvailableSize(product.bundlePerfume1);
      if (availableSize1) {
        setSelectedBundleSize1(availableSize1.size);
        totalPrice += availableSize1.price;
      } else {
        setSelectedBundleSize1('');
      }
      
      // Perfume 2
      const availableSize2 = getFirstAvailableSize(product.bundlePerfume2);
      if (availableSize2) {
        setSelectedBundleSize2(availableSize2.size);
        totalPrice += availableSize2.price;
      } else {
        setSelectedBundleSize2('');
      }
      
      // Perfume 3
      const availableSize3 = getFirstAvailableSize(product.bundlePerfume3);
      if (availableSize3) {
        setSelectedBundleSize3(availableSize3.size);
        totalPrice += availableSize3.price;
      } else {
        setSelectedBundleSize3('');
      }
      
      // Perfume 4
      const availableSize4 = getFirstAvailableSize(product.bundlePerfume4);
      if (availableSize4) {
        setSelectedBundleSize4(availableSize4.size);
        totalPrice += availableSize4.price;
      } else {
        setSelectedBundleSize4('');
      }
      
      setQuickAddPrice(totalPrice);
    } else {
      // Set initial size and price (skip sold out)
      if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
        const availableSize = product.sizesWithPrices.find(s => !s.soldOut);
        if (availableSize) {
          setSelectedSize(availableSize.size);
          setQuickAddPrice(availableSize.price);
        }
      } else if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
        setQuickAddPrice(product.priceEGP || 0);
      }
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    
    // Update price based on selected size
    if (quickAddProduct.sizesWithPrices) {
      const sizeData = quickAddProduct.sizesWithPrices.find(item => item.size === size);
      if (sizeData) {
        setQuickAddPrice(sizeData.price);
      }
    }
  };

  const handleAddToCart = () => {
    if (quickAddProduct.isBundle) {
      // Check which perfumes have available sizes (not fully sold out)
      const perfume1Available = hasAvailableSizes(quickAddProduct.bundlePerfume1);
      const perfume2Available = hasAvailableSizes(quickAddProduct.bundlePerfume2);
      const perfume3Exists = quickAddProduct.bundlePerfume3?.name;
      const perfume4Exists = quickAddProduct.bundlePerfume4?.name;
      const perfume3Available = perfume3Exists && hasAvailableSizes(quickAddProduct.bundlePerfume3);
      const perfume4Available = perfume4Exists && hasAvailableSizes(quickAddProduct.bundlePerfume4);
      
      // Validate selections for available perfumes only
      if (perfume1Available && !selectedBundleSize1) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 1' });
        return;
      }
      if (perfume2Available && !selectedBundleSize2) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 2' });
        return;
      }
      if (perfume3Available && !selectedBundleSize3) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 3' });
        return;
      }
      if (perfume4Available && !selectedBundleSize4) {
        Swal.fire({ icon: 'warning', title: 'Select Size', text: 'Please select size for Perfume 4' });
        return;
      }
      
      // Build bundle size string (only include selected sizes)
      let bundleSizeParts = [];
      if (selectedBundleSize1) bundleSizeParts.push(selectedBundleSize1);
      if (selectedBundleSize2) bundleSizeParts.push(selectedBundleSize2);
      if (selectedBundleSize3) bundleSizeParts.push(selectedBundleSize3);
      if (selectedBundleSize4) bundleSizeParts.push(selectedBundleSize4);
      const bundleSize = bundleSizeParts.join(' + ');
      
      const bundleDetails = {
        perfume1Name: selectedBundleSize1 ? quickAddProduct.bundlePerfume1.name : null,
        perfume2Name: selectedBundleSize2 ? quickAddProduct.bundlePerfume2.name : null,
        size1: selectedBundleSize1 || null,
        size2: selectedBundleSize2 || null,
        perfume3Name: selectedBundleSize3 ? quickAddProduct.bundlePerfume3?.name : null,
        size3: selectedBundleSize3 || null,
        perfume4Name: selectedBundleSize4 ? quickAddProduct.bundlePerfume4?.name : null,
        size4: selectedBundleSize4 || null
      };
      
      addToCart(quickAddProduct, bundleSize, 'Default', 1, quickAddPrice, bundleDetails);
    } else {
      if (!selectedSize) {
        Swal.fire({
          icon: 'warning',
          title: 'Select Size',
          text: 'Please select a bottle size'
        });
        return;
      }
      
      addToCart(quickAddProduct, selectedSize, 'Default', 1, quickAddPrice);
    }

    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${quickAddProduct.name} has been added to your cart.`,
      timer: 1500,
      showConfirmButton: false
    });
    setQuickAddProduct(null);
    setSelectedSize('');
    setSelectedBundleSize1('');
    setSelectedBundleSize2('');
    setSelectedBundleSize3('');
    setSelectedBundleSize4('');
    setActivePerfume(1);
  };

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Hero Section */}
      <section 
        className="relative flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/c1.jpg')", height: '85vh' }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative text-center text-white px-4 z-10 flex flex-col items-center justify-end h-full" style={{ paddingBottom: '80px' }}>
          <h1 className="text-3xl md:text-5xl font-playfair mb-8">Luxury Perfumes & Fragrances</h1>
          <Link to="/products" className="inline-block text-white text-lg md:text-xl font-montserrat tracking-wider hover:opacity-80 transition-opacity">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Samples Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-playfair text-center mb-16 text-black">Samples</h2>
        
        {/* First Row: Winter & Summer - Larger */}
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:gap-16 mb-12">
          <Link to="/category/winter-samples" className="group block">
            <div className="relative overflow-hidden mb-6" style={{ paddingBottom: '120%' }}>
              <img
                src="/winter.jpg"
                alt="Winter Samples"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-center text-black">Winter Samples</h3>
          </Link>

          <Link to="/category/summer-samples" className="group block">
            <div className="relative overflow-hidden mb-6" style={{ paddingBottom: '120%' }}>
              <img
                src="/summer.jpg"
                alt="Summer Samples"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-center text-black">Summer Samples</h3>
          </Link>
        </div>

        {/* Second Row: Bundles (centered) */}
        <div className="flex justify-center">
          <Link to="/category/bundles" className="group block w-full sm:w-3/4 md:w-1/2">
            <div className="relative overflow-hidden mb-4" style={{ paddingBottom: '70%' }}>
              <img
                src="/Bundeles.jpg"
                alt="Bundles"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-playfair text-center text-black">Bundles</h3>
          </Link>
        </div>

        {/* Third Row: Quantities With Bottle (centered) */}
        <div className="flex justify-center mt-12">
          <Link to="/category/quantities-with-bottle" className="group block w-full sm:w-3/4 md:w-1/2">
            <div className="relative overflow-hidden mb-4" style={{ paddingBottom: '70%' }}>
              <img
                src="/Quantities.jpg"
                alt="Quantities With Bottle"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-playfair text-center text-black">Quantities With Bottle</h3>
          </Link>
        </div>
      </section>

      {/* Bottles Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-playfair text-center mb-16 text-black">Bottles</h2>
        
        <Link to="/category/bottles" className="group block max-w-2xl mx-auto">
          <div className="relative overflow-hidden mb-4" style={{ paddingBottom: '50%' }}>
            <img
              src="/Bottles.jpg"
              alt="Full Bottles"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h3 className="text-2xl font-playfair text-center text-black">Full Bottles</h3>
        </Link>
      </section>

      {/* Best Selling Horizontal Scroll Section */}
      {bestSellerProducts.length > 0 && (
        <section className="py-20 px-6">
          <h2 className="text-4xl font-playfair text-center mb-16 text-black">BEST SELLING</h2>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
              {bestSellerProducts.map((product) => (
                <div key={product._id} className="group relative flex-shrink-0" style={{ width: '280px' }}>
                  <Link to={`/products/${product._id}`} className="block">
                    <div className="relative overflow-hidden mb-4" style={{ paddingBottom: '120%' }}>
                      <img
                        src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.soldOut && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-montserrat text-base md:text-lg mb-2 text-black leading-tight">{product.name}</h3>
                    <p className="font-montserrat text-base md:text-lg font-semibold text-black">{product.priceEGP} EGP</p>
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {!product.soldOut && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(product);
                        }}
                        className="bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Wishlist Heart Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                      className="bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Reviews Section */}
      {bestReviewProducts.length > 0 && (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair text-center mb-16 text-black">BEST REVIEWS</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {bestReviewProducts.map((product) => (
              <ProductCard key={product._id} product={product} onQuickAdd={handleQuickAdd} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setQuickAddProduct(null);
              setSelectedBundleSize1('');
              setSelectedBundleSize2('');
              setSelectedBundleSize3('');
              setSelectedBundleSize4('');
              setActivePerfume(1);
            }}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 p-4 sm:p-6 md:p-8 transform transition-transform duration-300 max-w-2xl mx-auto rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => {
                setQuickAddProduct(null);
                setSelectedBundleSize1('');
                setSelectedBundleSize2('');
                setSelectedBundleSize3('');
                setSelectedBundleSize4('');
                setActivePerfume(1);
              }}
              className="absolute top-4 right-4 text-black hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-playfair text-lg sm:text-xl mb-2 pr-8">{quickAddProduct.name}</h3>
            <p className="font-montserrat text-base sm:text-lg font-semibold mb-4">{quickAddPrice} EGP</p>

            {quickAddProduct.isBundle ? (
              // Bundle Size Selectors with Circles
              <div className="space-y-4 mb-4">
                {/* Perfume Selection Circles */}
                <div className="flex justify-center gap-3 flex-wrap mb-4">
                  {[1, 2, 3, 4].map((num) => {
                    const perfume = num === 1 ? quickAddProduct.bundlePerfume1 
                      : num === 2 ? quickAddProduct.bundlePerfume2 
                      : num === 3 ? quickAddProduct.bundlePerfume3 
                      : quickAddProduct.bundlePerfume4;
                    const selectedSize = num === 1 ? selectedBundleSize1 
                      : num === 2 ? selectedBundleSize2 
                      : num === 3 ? selectedBundleSize3 
                      : selectedBundleSize4;
                    
                    if (!perfume?.name) return null;
                    
                    // Check if this perfume is fully sold out
                    const isFullySoldOut = isPerfumeFullySoldOut(perfume);
                    
                    return (
                      <div 
                        key={num}
                        onClick={() => !isFullySoldOut && setActivePerfume(num)}
                        className={`transition-all duration-300 ${isFullySoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activePerfume === num && !isFullySoldOut ? 'scale-105' : 'opacity-70'}`}
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all ${
                          isFullySoldOut
                            ? 'border-red-300 bg-red-100 text-red-400'
                            : activePerfume === num 
                              ? 'border-black bg-black text-white' 
                              : 'border-gray-300 bg-white text-black'
                        }`}>
                          <span className={`text-lg font-bold ${isFullySoldOut ? 'line-through' : ''}`}>{num}</span>
                        </div>
                        <p className={`text-center mt-1 text-xs max-w-14 leading-tight truncate ${isFullySoldOut ? 'line-through text-red-400' : ''}`}>{perfume?.name}</p>
                        {isFullySoldOut ? (
                          <p className="text-center text-xs text-red-500">Sold Out</p>
                        ) : selectedSize ? (
                          <p className="text-center text-xs text-green-600">{selectedSize}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Active Perfume Sizes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2 font-montserrat text-center">
                    {activePerfume === 1 && quickAddProduct.bundlePerfume1?.name}
                    {activePerfume === 2 && quickAddProduct.bundlePerfume2?.name}
                    {activePerfume === 3 && quickAddProduct.bundlePerfume3?.name}
                    {activePerfume === 4 && quickAddProduct.bundlePerfume4?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const perfume = activePerfume === 1 ? quickAddProduct.bundlePerfume1 
                        : activePerfume === 2 ? quickAddProduct.bundlePerfume2 
                        : activePerfume === 3 ? quickAddProduct.bundlePerfume3 
                        : quickAddProduct.bundlePerfume4;
                      const selectedSize = activePerfume === 1 ? selectedBundleSize1 
                        : activePerfume === 2 ? selectedBundleSize2 
                        : activePerfume === 3 ? selectedBundleSize3 
                        : selectedBundleSize4;
                      
                      // Check if all sizes are sold out
                      const allSoldOut = perfume?.sizesWithPrices?.every(s => s.soldOut);
                      if (allSoldOut) {
                        return (
                          <div className="col-span-2 text-center py-4 text-red-500">
                            All sizes are sold out for this perfume
                          </div>
                        );
                      }
                      
                      return perfume?.sizesWithPrices?.map((sizeData) => (
                        <button
                          key={sizeData.size}
                          onClick={() => {
                            if (!sizeData.soldOut) {
                              if (activePerfume === 1) setSelectedBundleSize1(sizeData.size);
                              else if (activePerfume === 2) setSelectedBundleSize2(sizeData.size);
                              else if (activePerfume === 3) setSelectedBundleSize3(sizeData.size);
                              else setSelectedBundleSize4(sizeData.size);
                              
                              // Recalculate price
                              const p1 = activePerfume === 1 ? sizeData.price : (quickAddProduct.bundlePerfume1?.sizesWithPrices?.find(s => s.size === selectedBundleSize1)?.price || 0);
                              const p2 = activePerfume === 2 ? sizeData.price : (quickAddProduct.bundlePerfume2?.sizesWithPrices?.find(s => s.size === selectedBundleSize2)?.price || 0);
                              const p3 = activePerfume === 3 ? sizeData.price : (quickAddProduct.bundlePerfume3?.sizesWithPrices?.find(s => s.size === selectedBundleSize3)?.price || 0);
                              const p4 = activePerfume === 4 ? sizeData.price : (quickAddProduct.bundlePerfume4?.sizesWithPrices?.find(s => s.size === selectedBundleSize4)?.price || 0);
                              setQuickAddPrice(p1 + p2 + p3 + p4);
                            }
                          }}
                          disabled={sizeData.soldOut}
                          className={`px-3 py-2 font-montserrat transition-all text-sm relative ${
                            sizeData.soldOut
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                              : selectedSize === sizeData.size
                                ? 'bg-black text-white'
                                : 'bg-white text-black border border-gray-300 hover:bg-beige-100'
                          }`}
                        >
                          <div className={sizeData.soldOut ? 'line-through' : ''}>{sizeData.size}</div>
                          <div className={`text-xs ${sizeData.soldOut ? 'line-through' : ''}`}>{sizeData.price} EGP</div>
                          {sizeData.soldOut && (
                            <div className="text-xs mt-0.5" style={{ textDecoration: 'none' }}>Sold Out</div>
                          )}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              // Regular Product Size Selector
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 font-montserrat">Select Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickAddProduct.sizesWithPrices ? 
                    quickAddProduct.sizesWithPrices.map((sizeData) => (
                      <button
                        key={sizeData.size}
                        onClick={() => {
                          if (!sizeData.soldOut) {
                            handleSizeChange(sizeData.size);
                          }
                        }}
                        disabled={sizeData.soldOut}
                        className={`px-3 py-2 font-montserrat transition-all text-sm relative ${
                          sizeData.soldOut
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : selectedSize === sizeData.size
                              ? 'bg-black text-white'
                              : 'bg-white text-black border border-gray-300 hover:bg-beige-100'
                        }`}
                      >
                        <div className={sizeData.soldOut ? 'line-through' : ''}>{sizeData.size}</div>
                        <div className={`text-xs ${sizeData.soldOut ? 'line-through' : ''}`}>{sizeData.price} EGP</div>
                        {sizeData.soldOut && (
                          <div className="text-xs mt-0.5" style={{ textDecoration: 'none' }}>Sold Out</div>
                        )}
                      </button>
                    )) :
                    quickAddProduct.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-3 py-2 font-montserrat transition-all text-sm ${
                          selectedSize === size
                            ? 'bg-black text-white'
                            : 'bg-white text-black border border-gray-300 hover:bg-beige-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleAddToCart}
                style={{ width: '70%' }}
                className="bg-black text-white px-4 sm:px-6 py-3 font-medium hover:bg-gray-800 transition-all font-montserrat text-sm sm:text-base"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  setQuickAddProduct(null);
                  setSelectedBundleSize1('');
                  setSelectedBundleSize2('');
                  setSelectedBundleSize3('');
                  setSelectedBundleSize4('');
                  setActivePerfume(1);
                }}
                style={{ width: '30%' }}
                className="bg-white text-black border border-black px-4 sm:px-6 py-3 font-medium hover:bg-beige-100 transition-all font-montserrat text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="py-12 text-center">
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

export default Home;
