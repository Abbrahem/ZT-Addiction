import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const Home = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quickAddPrice, setQuickAddPrice] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchBestSellingProducts();
  }, []);

  const fetchBestSellingProducts = async () => {
    try {
      const response = await axios.get('/api/products?limit=10&random=true');
      setBestSellingProducts(response.data);
    } catch (error) {
      console.log('Using mock data for development');
      // Shuffle mock products randomly
      const shuffled = [...mockProducts].sort(() => Math.random() - 0.5);
      setBestSellingProducts(shuffled.slice(0, 10));
    }
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
    
    // Set initial size and price
    if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
      setSelectedSize(product.sizesWithPrices[0].size);
      setQuickAddPrice(product.sizesWithPrices[0].price);
    } else if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
      setQuickAddPrice(product.priceEGP || 0);
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
    if (!selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Size',
        text: 'Please select a bottle size'
      });
      return;
    }

    addToCart(quickAddProduct, selectedSize, 'Default', 1, quickAddPrice);
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${quickAddProduct.name} has been added to your cart.`,
      timer: 1500,
      showConfirmButton: false
    });
    setQuickAddProduct(null);
    setSelectedSize('');
  };

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
        <p className="font-montserrat text-sm md:text-base font-semibold text-black">{product.priceEGP} EGP</p>
      </Link>
      
      {!product.soldOut && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(product);
          }}
          className="absolute top-2 right-2 bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      )}
    </div>
  );

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

      {/* Best Selling Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-playfair text-center mb-16 text-black">Best Selling</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {bestSellingProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setQuickAddProduct(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 p-4 sm:p-6 md:p-8 transform transition-transform duration-300 max-w-2xl mx-auto rounded-t-2xl">
            <button 
              onClick={() => setQuickAddProduct(null)}
              className="absolute top-4 right-4 text-black hover:opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-playfair text-lg sm:text-xl mb-2 pr-8">{quickAddProduct.name}</h3>
            <p className="font-montserrat text-base sm:text-lg font-semibold mb-4">{quickAddPrice} EGP</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 font-montserrat">Select Size</label>
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none font-montserrat text-left"
                style={{ direction: 'ltr' }}
              >
                {quickAddProduct.sizesWithPrices ? 
                  quickAddProduct.sizesWithPrices.map((sizeData) => (
                    <option key={sizeData.size} value={sizeData.size}>
                      {sizeData.size} - {sizeData.price} EGP
                    </option>
                  )) :
                  quickAddProduct.sizes?.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))
                }
              </select>
            </div>

            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleAddToCart}
                style={{ width: '70%' }}
                className="bg-black text-white px-4 sm:px-6 py-3 font-medium hover:bg-gray-800 transition-all font-montserrat text-sm sm:text-base"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setQuickAddProduct(null)}
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
        <p className="text-sm font-montserrat text-black">Privacy Policy & Terms</p>
      </footer>
    </div>
  );
};

export default Home;
