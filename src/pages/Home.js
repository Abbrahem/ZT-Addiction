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

      {/* Samples Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-playfair text-center mb-12 md:mb-16 text-black">Samples</h2>
        
        {/* First Row: Winter & Summer - Larger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          <Link to="/category/winter-samples" className="group block">
            <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '75%' }}>
              <img 
                src="/winter-samples.jpg" 
                alt="Winter Samples"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gray-200');
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <h3 className="text-2xl md:text-3xl font-playfair text-white">Winter Samples</h3>
              </div>
            </div>
          </Link>
          
          <Link to="/category/summer-samples" className="group block">
            <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '75%' }}>
              <img 
                src="/summer-samples.jpg" 
                alt="Summer Samples"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gray-200');
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <h3 className="text-2xl md:text-3xl font-playfair text-white">Summer Samples</h3>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Second Row: Bundles & Quantities - Smaller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Link to="/category/bundles" className="group block">
            <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '60%' }}>
              <img 
                src="/bundles.jpg" 
                alt="Bundles"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gray-200');
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <h3 className="text-xl md:text-2xl font-playfair text-white">Bundles</h3>
              </div>
            </div>
          </Link>
          
          <Link to="/category/quantities-with-bottle" className="group block">
            <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '60%' }}>
              <img 
                src="/quantities.jpg" 
                alt="Quantities With Bottle"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gray-200');
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <h3 className="text-xl md:text-2xl font-playfair text-white">Quantities With Bottle</h3>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Bottles Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-playfair text-center mb-12 md:mb-16 text-black">Bottles</h2>
        
        <Link to="/category/bottles" className="group block max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-xl" style={{ paddingBottom: '50%' }}>
            <img 
              src="/bottles.jpg" 
              alt="Full Bottles"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('bg-gray-200');
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <h3 className="text-xl md:text-2xl font-playfair text-center text-white">Full Bottles</h3>
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