import React from 'react';
import { Link } from 'react-router-dom';
import PointsSection from '../components/PointsSection';
import Footer from '../components/Footer';

const Home = () => {
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

      {/* Categories Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-playfair text-center mb-12 md:mb-16 text-black">Our Categories</h2>
        
        {/* First Row: Winter & Summer - Bigger and Side by Side */}
        <div className="grid grid-cols-2 gap-6 md:gap-12 lg:gap-20 mb-16 md:mb-20 max-w-6xl mx-auto">
          <Link to="/category/winter-samples" className="group block">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative overflow-hidden" style={{ paddingBottom: '100%' }}>
                <img 
                  src="/winter.jpg" 
                  alt="Winter Samples"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gray-200');
                  }}
                />
              </div>
              <div className="p-4 md:p-6 text-center">
                <h3 className="text-lg md:text-xl lg:text-2xl font-playfair text-gray-800">Winter Samples</h3>
              </div>
            </div>
          </Link>
          
          <Link to="/category/summer-samples" className="group block">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative overflow-hidden" style={{ paddingBottom: '100%' }}>
                <img 
                  src="/summer.jpg" 
                  alt="Summer Samples"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gray-200');
                  }}
                />
              </div>
              <div className="p-4 md:p-6 text-center">
                <h3 className="text-lg md:text-xl lg:text-2xl font-playfair text-gray-800">Summer Samples</h3>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Bundles Section */}
        <div className="mb-12 md:mb-16 max-w-2xl mx-auto">
          <Link to="/category/bundles" className="group block">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative overflow-hidden" style={{ paddingBottom: '60%' }}>
                <img 
                  src="/Bundeles.jpg" 
                  alt="Bundles"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gray-200');
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl md:text-2xl font-playfair text-gray-800">Bundles</h3>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Quantities Section */}
        <div className="max-w-2xl mx-auto">
          <Link to="/category/quantities-with-bottle" className="group block">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative overflow-hidden" style={{ paddingBottom: '60%' }}>
                <img 
                  src="/Quantities.jpg" 
                  alt="Quantities With Bottle"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gray-200');
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl md:text-2xl font-playfair text-gray-800">Quantities With Bottle</h3>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Bottles Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-playfair text-center mb-12 md:mb-16 text-black">Bottles</h2>
        
        <Link to="/category/bottles" className="group block max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative overflow-hidden" style={{ paddingBottom: '50%' }}>
              <img 
                src="/Bottles.jpg" 
                alt="Full Bottles"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gray-200');
                }}
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl md:text-2xl font-playfair text-gray-800">Full Bottles</h3>
            </div>
          </div>
        </Link>
      </section>

      {/* Points Section */}
      <PointsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;