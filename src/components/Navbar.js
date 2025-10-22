import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navbarClasses = isHomePage && !isScrolled
    ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
    : 'sticky top-0 z-50 bg-beige-50 shadow-md transition-all duration-300';

  const textColor = isHomePage && !isScrolled ? 'text-white' : 'text-black';
  const logoTextColor = isHomePage && !isScrolled ? 'text-white' : 'text-black';

  return (
    <>
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Left: Search */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`${textColor} hover:opacity-70 transition-opacity`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Center: Brand Name - Two Lines */}
            <Link to="/" className={`flex flex-col items-center ${logoTextColor} font-playfair`}>
              <span className="text-xl md:text-2xl font-bold tracking-widest leading-tight">ZT</span>
              <span className="text-xs md:text-sm font-medium tracking-widest -mt-1">ADDICTION</span>
            </Link>

            {/* Right: Cart & Menu */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className={`relative ${textColor} hover:opacity-70 transition-opacity`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-montserrat">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`${textColor} hover:opacity-70 transition-opacity`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="bg-beige-50 border-t border-beige-200 px-6 py-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for perfumes..."
                className="w-full px-6 py-3 bg-white text-black focus:ring-2 focus:ring-black focus:outline-none font-montserrat"
                autoFocus
              />
            </form>
          </div>
        )}
      </nav>

      {/* Sidebar Menu */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-80 max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300">
            <div className="p-6 sm:p-8">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-6 right-6 text-black hover:opacity-70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold mb-8 font-playfair text-black">Menu</h2>

              <nav className="space-y-5">
                <Link 
                  to="/" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black"
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black"
                >
                  Full Bottles
                </Link>
                <Link 
                  to="/category/winter-samples" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black"
                >
                  Winter Samples
                </Link>
                <Link 
                  to="/category/summer-samples" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black"
                >
                  Summer Samples
                </Link>
                <Link 
                  to="/category/bundles" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black"
                >
                  Bundles
                </Link>
                <Link 
                  to="/cart" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black"
                >
                  Cart
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
