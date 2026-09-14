import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PointsSection from '../components/PointsSection';
import Footer from '../components/Footer';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: '/HE1.png', link: '/best-sellers', text: 'BEST SELLERS' },
    { image: '/HE2.png', link: '/best-review', text: 'BEST REVIEW' },
    { image: '/HE3.png', link: '/category/bottles', text: 'NICHE BOTTLES' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Slider */}
      <section className="relative w-full">
        <div className="relative w-full" style={{ height: '65vh' }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 translate-y-[10px] z-10">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 text-white text-xs font-montserrat tracking-wider border border-white/50 px-3 py-1.5 hover:bg-white/10 hover:border-white transition-all whitespace-nowrap"
                  >
                    {slide.text}
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slide Indicators */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-0.5 transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-8'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Winter & Summer Samples */}
      <section className="py-8 px-4">
        <div className="grid grid-cols-2 gap-4">
          <Link to="/category/winter-samples" className="group relative block overflow-hidden rounded-lg">
            <div className="relative" style={{ paddingBottom: '95%' }}>
              <img
                src="/WINTER.jpeg"
                alt="Winter Samples"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-3 left-3">
                <button className="inline-flex items-center gap-2 text-white text-[10px] font-montserrat tracking-wider hover:gap-3 transition-all">
                  SHOP NOW
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>

          <Link to="/category/summer-samples" className="group relative block overflow-hidden rounded-lg">
            <div className="relative" style={{ paddingBottom: '95%' }}>
              <img
                src="/SUMMER.jpeg"
                alt="Summer Samples"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-3 left-3">
                <button className="inline-flex items-center gap-2 text-white text-[10px] font-montserrat tracking-wider hover:gap-3 transition-all">
                  SHOP NOW
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Bundles */}
      <section className="px-1 mb-8">
        <Link to="/category/bundles" className="group relative block overflow-hidden rounded-lg">
          <div className="relative" style={{ paddingBottom: '40%' }}>
            <img
              src="/BUNDELS.jpeg"
              alt="Bundles"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-2 left-4">
              <button className="inline-flex items-center gap-3 text-white text-[9px] font-montserrat tracking-wider border border-white/50 px-2 py-1 hover:bg-white/10 hover:border-white transition-all">
                SHOP BUNDLES
                <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </Link>
      </section>

      {/* Brand Divider */}
      <div className="flex items-center gap-4 px-4 my-8">
        <div className="flex-1 h-px bg-white/30"></div>
        <span className="text-white font-montserrat text-xs tracking-widest">ZT ADDICTION</span>
        <div className="flex-1 h-px bg-white/30"></div>
      </div>

      {/* Quantities With Bottle Section */}
      <section className="px-1 mb-8">
        <div className="text-center mb-4">
          <h2 className="text-white font-playfair text-2xl md:text-3xl mb-1">Quantities With Bottle</h2>
        </div>
        <Link to="/category/quantities" className="group relative block overflow-hidden rounded-lg">
          <div className="relative" style={{ paddingBottom: '40%' }}>
            <img
              src="/quantity.jpeg"
              alt="Quantities With Bottle"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-2 left-4">
              <button className="inline-flex items-center gap-3 text-white text-[9px] font-montserrat tracking-wider border border-white/50 px-2 py-1 hover:bg-white/10 hover:border-white transition-all">
                SHOP QUANTITIES
                <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </Link>
      </section>

      {/* Full Bottles Section */}
      <section className="px-1 mb-8">
        <div className="text-center mb-4">
          <h2 className="text-white font-playfair text-2xl md:text-3xl mb-1">Full Bottle</h2>
        </div>
        <Link to="/category/full-bottles" className="group relative block overflow-hidden rounded-lg">
          <div className="relative" style={{ paddingBottom: '40%' }}>
            <img
              src="/bootels.jpeg"
              alt="Full Bottles"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-2 left-4">
              <button className="inline-flex items-center gap-3 text-white text-[9px] font-montserrat tracking-wider border border-white/50 px-2 py-1 hover:bg-white/10 hover:border-white transition-all">
                SHOP BOTTLES
                <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </Link>
      </section>

      {/* Points Section - White Background */}
      <div className="bg-white">
        <PointsSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;