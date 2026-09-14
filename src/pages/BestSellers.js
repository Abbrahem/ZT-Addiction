import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import Swal from 'sweetalert2';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const handleQuickAdd = (product) => {
    if (product.soldOut) {
      Swal.fire({ icon: 'error', title: 'Sold Out', text: 'This product is currently sold out.' });
      return;
    }
    if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
      const availableSize = product.sizesWithPrices.find(s => !s.soldOut);
      if (availableSize) {
        addToCart(product, availableSize.size, 'Default', 1, availableSize.price);
        Swal.fire({ icon: 'success', title: 'Added to Cart', text: `${product.name} has been added to your cart.`, timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Sold Out', text: 'All sizes are sold out.' });
      }
    } else {
      addToCart(product, 'Default', 'Default', 1, product.priceEGP || 0);
      Swal.fire({ icon: 'success', title: 'Added to Cart', text: `${product.name} has been added to your cart.`, timer: 1500, showConfirmButton: false });
    }
  };

  useEffect(() => {
    fetchBestSellers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchBestSellers = async () => {
    try {
      const response = await axios.get('/api/products');
      const bestSellers = response.data.filter(p => p.isBestSeller);
      setProducts(bestSellers);
      setFilteredProducts(bestSellers);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load best sellers'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-xl font-montserrat">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-playfair text-center mb-8 text-black">Best Sellers</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <p className="text-xl">No best sellers yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onQuickAdd={handleQuickAdd} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellers;
