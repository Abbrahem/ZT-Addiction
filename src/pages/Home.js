import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PointsSection from '../components/PointsSection';
import Footer from '../components/Footer';

const Home = () => {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const heroImageRef = useRef(null);

  useEffect(() => {
    // Image display
    if (heroImageRef.current) {
      heroImageRef.current.style.opacity = '1';
    }
  }, []);

  useEffect(() => {
    // Three.js Parallax Effect
    const initThreeJS = async () => {
      // Dynamic import for Three.js
      const THREE = window.THREE;
      if (!THREE) {
        // Fallback if Three.js is not loaded
        console.log('Three.js not available, using CSS animation');
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight * 0.85);
      renderer.setClearColor(0x000000, 0);
      camera.position.z = 100;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xff69b4, 2);
      pointLight.position.set(50, 50, 50);
      scene.add(pointLight);

      const pointLight2 = new THREE.PointLight(0x00ffff, 1);
      pointLight2.position.set(-50, -50, 50);
      scene.add(pointLight2);

      // Create particles
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(100 * 3);

      for (let i = 0; i < 100 * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xff69b4,
        size: 2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      let targetScale = 1;
      let scrollVelocity = 0;

      const handleScroll = () => {
        const scrollY = window.scrollY;
        scrollVelocity = scrollY * 0.0001;
        targetScale += scrollVelocity * 0.05;
      };

      window.addEventListener('scroll', handleScroll);

      const animate = () => {
        requestAnimationFrame(animate);

        points.rotation.x += 0.0001;
        points.rotation.y += 0.0002;
        points.rotation.z += 0.00005;

        scrollVelocity *= 0.95;
        points.scale.set(targetScale, targetScale, targetScale);

        renderer.render(scene, camera);
      };

      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight * 0.85;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);
      animate();

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    };

    // Add Three.js script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initThreeJS;
    document.head.appendChild(script);

    return () => {
      if (script) document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Hero Section with 3D Parallax */}
      <section 
        ref={heroRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '85vh' }}
      >
        {/* Three.js Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Background Image with Parallax */}
        <div 
          ref={heroImageRef}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{ 
            backgroundImage: "url('/c1.jpg')",
            transform: `scale(${1 + window.scrollY * 0.0001})`,
            opacity: 1
          }}
        />

        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        {/* Content */}
        <div className="relative text-center text-white px-4 z-10 flex flex-col items-center justify-end h-full" style={{ paddingBottom: '80px' }}>
          <h1 className="text-3xl md:text-5xl font-playfair mb-8 animate-fadeInUp" style={{
            animation: 'fadeInUp 1s ease-out',
            textShadow: '0 0 30px rgba(255, 105, 180, 0.5)'
          }}>
            Luxury Perfumes & Fragrances
          </h1>
          <Link 
            to="/products" 
            className="inline-block text-white text-lg md:text-xl font-montserrat tracking-wider hover:opacity-80 transition-opacity"
            style={{
              animation: 'fadeInUp 1s ease-out 0.2s both',
              textShadow: '0 0 20px rgba(255, 105, 180, 0.3)'
            }}
          >
            Shop Now
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          style={{
            animation: 'bounce 2s infinite'
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" strokeWidth="2">
            <path d="M12 19V5M5 12l7 7 7-7"></path>
          </svg>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(15px);
            }
          }
        `}</style>
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