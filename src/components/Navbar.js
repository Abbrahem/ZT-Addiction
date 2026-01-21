import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartItemsCount();
  const wishlistCount = getWishlistCount();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            {/* Left: Order Tracking */}
            <div className="flex items-center">
              <Link 
                to="/order-tracking"
                className={`${textColor} hover:opacity-70 transition-opacity`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Link>
            </div>

            {/* Center: Brand Name */}
            <Link to="/" className={`flex flex-col items-center ${logoTextColor} font-playfair`}>
              <span className="text-xl md:text-2xl font-bold tracking-widest leading-tight">ZT</span>
              <span className="text-xs md:text-sm font-medium tracking-widest -mt-1">ADDICTION</span>
            </Link>

            {/* Right: Wishlist, Cart & Menu */}
            <div className="flex items-center space-x-4">
              <Link to="/wishlist" className={`relative ${textColor} hover:opacity-70 transition-opacity`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-montserrat">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
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
                <Link to="/" onClick={() => setIsSidebarOpen(false)} className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  Home
                </Link>
                <Link to="/category/bottles" onClick={() => setIsSidebarOpen(false)} className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  Full Bottles
                </Link>
                <Link to="/category/winter-samples" onClick={() => setIsSidebarOpen(false)} className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  Winter Samples
                </Link>
                <Link to="/category/summer-samples" onClick={() => setIsSidebarOpen(false)} className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  Summer Samples
                </Link>
                <Link to="/category/bundles" onClick={() => setIsSidebarOpen(false)} className="block text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  Bundles
                </Link>
                
                <div className="border-t border-gray-200 pt-5 mt-5">
                  <Link to="/order-tracking" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Track Order</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-montserrat font-semibold ml-auto">
                      New
                    </span>
                  </Link>
                </div>
                
                <Link to="/wishlist" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                
                <Link to="/cart" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium hover:opacity-70 transition-opacity font-montserrat text-black">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Cart {cartCount > 0 && `(${cartCount})`}
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
