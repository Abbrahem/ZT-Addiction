import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const BundleSubcategory = () => {
  const { subcategory } = useParams();
  const navigate = useNavigate();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sort and Filter states
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 25000]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 25000]);
  const [selectedGender, setSelectedGender] = useState('all'); // all, men, women, unisex

  useEffect(() => {
    fetchProducts();
  }, [subcategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products?bundleSubcategory=${subcategory}`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load products'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    filterProducts();
  }, [products, sortBy, showInStock, showOutOfStock, priceRange, selectedGender]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const filterProducts = () => {
    let filtered = products;
    
    // Filter by gender (support multiple genders in product)
    if (selectedGender !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.gender) return false;
        // Check if product gender contains the selected gender
        return product.gender.includes(selectedGender);
      });
    }
    
    // Filter by availability
    if (!showInStock || !showOutOfStock) {
      filtered = filtered.filter(product => {
        if (showInStock && !showOutOfStock) return !product.soldOut;
        if (!showInStock && showOutOfStock) return product.soldOut;
        return true;
      });
    }
    
    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.sizesWithPrices?.[0]?.price || product.priceEGP || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const priceA = a.sizesWithPrices?.[0]?.price || a.priceEGP || 0;
      const priceB = b.sizesWithPrices?.[0]?.price || b.priceEGP || 0;
      
      switch (sortBy) {
        case 'popularity':
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        default:
          return 0;
      }
    });
    
    setFilteredProducts(filtered);
  };
  
  const applyFilters = () => {
    setPriceRange(tempPriceRange);
    setShowFilters(false);
  };
  
  const getStockCounts = () => {
    const inStock = products.filter(p => !p.soldOut).length;
    const outOfStock = products.filter(p => p.soldOut).length;
    return { inStock, outOfStock };
  };

  const getTitle = () => {
    return subcategory === 'bottles' ? 'Full Bottles Bundles' : 'Samples Bundles';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center py-20">
        <div className="text-xl font-montserrat">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/category/bundles')}
          className="mb-6 flex items-center gap-2 text-black hover:opacity-70 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-montserrat">Back to Bundles</span>
        </button>

        <h1 className="text-4xl font-playfair text-center mb-12 text-black">
          {getTitle()}
        </h1>
        
        {/* Gender Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 px-2">
          <button
            onClick={() => setSelectedGender('all')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-montserrat text-xs sm:text-sm transition-all ${
              selectedGender === 'all' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-black hover:border-black'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedGender('men')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-montserrat text-xs sm:text-sm transition-all ${
              selectedGender === 'men' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-black hover:border-black'
            }`}
          >
            Men
          </button>
          <button
            onClick={() => setSelectedGender('women')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-montserrat text-xs sm:text-sm transition-all ${
              selectedGender === 'women' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-black hover:border-black'
            }`}
          >
            Women
          </button>
          <button
            onClick={() => setSelectedGender('unisex')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-montserrat text-xs sm:text-sm transition-all ${
              selectedGender === 'unisex' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-black hover:border-black'
            }`}
          >
            Unisex
          </button>
        </div>
        
        {/* Sort and Filter Controls */}
        <div className="flex items-center justify-between mb-6 gap-2 px-2">
          {/* Filters Button - Left */}
          <button
            onClick={() => setShowFilters(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-black text-white rounded-lg font-montserrat text-xs hover:bg-gray-800 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          {/* Sort By Dropdown - Right */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-montserrat text-xs focus:ring-2 focus:ring-black focus:outline-none appearance-none pr-7 sm:pr-8 cursor-pointer"
            >
              <option value="default">Sort By</option>
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low</option>
              <option value="price-desc">Price: High</option>
            </select>
            <svg className="w-3.5 h-3.5 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-montserrat text-gray-500">
              No products available in this category yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group relative">
                <Link to={`/products/${product._id}`} className="block">
                  <div className="relative overflow-hidden mb-3 rounded-lg" style={{ paddingBottom: '100%' }}>
                    <img
                      src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.soldOut && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-montserrat text-sm mb-1 text-black leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="font-montserrat text-base font-semibold text-black">
                    {product.sizesWithPrices?.[0]?.price || product.priceEGP} EGP
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
            ))}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-3/4 md:w-1/2 lg:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-playfair text-black">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-black hover:opacity-70">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-montserrat font-semibold mb-4 text-black">Availability</h3>
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" checked={showInStock} onChange={(e) => setShowInStock(e.target.checked)} className="sr-only peer" />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-black peer-checked:border-black transition-all flex items-center justify-center">
                      {showInStock && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="font-montserrat text-sm text-gray-700">In stock <span className="text-gray-500">({getStockCounts().inStock})</span></span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" checked={showOutOfStock} onChange={(e) => setShowOutOfStock(e.target.checked)} className="sr-only peer" />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-black peer-checked:border-black transition-all flex items-center justify-center">
                      {showOutOfStock && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="font-montserrat text-sm text-gray-700">Out of stock <span className="text-gray-500">({getStockCounts().outOfStock})</span></span>
                </label>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-montserrat font-semibold mb-4 text-black">Price</h3>
                <div className="mb-4">
                  <input type="range" min="0" max="25000" step="100" value={tempPriceRange[1]} onChange={(e) => setTempPriceRange([tempPriceRange[0], parseInt(e.target.value)])} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                </div>
                <p className="font-montserrat text-sm text-gray-700">Price: <span className="font-semibold text-black">LE {tempPriceRange[0]}.00 - LE {tempPriceRange[1]}.00</span></p>
              </div>
              
              <button onClick={applyFilters} className="w-full bg-black text-white px-6 py-3 rounded-lg font-montserrat hover:bg-gray-800 transition-colors">Apply Filters</button>
            </div>
          </div>
        </>
      )}

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

export default BundleSubcategory;
