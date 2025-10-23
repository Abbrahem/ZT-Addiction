import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quickAddPrice, setQuickAddPrice] = useState(0);
  const { addToCart } = useCart();

  const categoryTitles = {
    'winter-samples': 'Winter Samples',
    'summer-samples': 'Summer Samples',
    'bundles': 'Bundles'
  };

  useEffect(() => {
    fetchProducts();
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      // Filter by collection based on category
      const categoryCollection = categoryTitles[category];
      const filtered = response.data.filter(p => p.collection === categoryCollection);
      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (error) {
      console.log('Using mock data for development');
      const categoryCollection = categoryTitles[category];
      const filtered = mockProducts.filter(p => p.collection === categoryCollection);
      setProducts(filtered);
      setFilteredProducts(filtered);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.collection?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
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
    <div className="min-h-screen bg-beige-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-playfair text-center mb-12 text-black">
          {categoryTitles[category] || 'Products'}
        </h1>

        {/* Search Bar */}
        <div className="mb-12 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for perfumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white text-black border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none font-montserrat"
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 font-montserrat">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

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
      <footer className="py-12 text-center mt-20">
        <h2 className="text-2xl font-playfair mb-2 text-black">ZT ADDICTION</h2>
        <p className="text-sm font-montserrat text-black mb-1">© 2025</p>
        <p className="text-sm font-montserrat text-black">Privacy Policy & Terms</p>
      </footer>
    </div>
  );
};

export default Category;
